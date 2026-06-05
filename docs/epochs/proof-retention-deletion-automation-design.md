# Proof Retention Deletion Automation Design

## 1. Purpose

This design defines how jmpseat should remove raw uploaded proof files after they are no longer needed for review.

The goals are:

- reduce privacy risk from long-lived badge or proof storage
- keep raw proof only while useful for review, resubmission, or a short post-review window
- preserve safe audit metadata without preserving raw proof indefinitely
- make deletion auditable and operationally visible

This is a design-only artifact. It does not implement cleanup automation, scheduled jobs, Edge Functions, migrations, app code, or Storage policy changes.

## 2. Current State

Runtime-proven proof state:

- redacted proof upload works
- proof files are stored in the private Supabase Storage bucket `verification-proofs`
- uploads are limited to JPEG/PNG under 5 MB
- storage paths use UUID-only path segments
- evidence rows include `delete_after`
- evidence rows also include `deleted_at`, `storage_bucket`, `storage_path`, `uploaded_at`, and `redaction_acknowledged`
- proof viewing is controlled through server-authorized short-lived signed URLs
- proof-view access is audited through bounded verification events

Current gap:

- no deletion automation exists yet
- no retention worker exists yet
- no scheduled cleanup job exists yet
- no operator cleanup procedure is implemented yet

## 3. Retention Principles

Retention should follow these principles:

- collect the minimum proof needed for review
- retain raw proof only while it is useful for review or resubmission handling
- delete raw proof promptly after the review window closes
- keep safe metadata for audit without keeping proof contents
- never keep raw badge or proof files forever by default
- make deletion auditable
- make deletion failure visible to operators
- avoid storing replacement proof content in metadata, logs, or events

The privacy posture should be simple: raw proof is temporary; safe metadata can remain for audit.

## 4. Proposed Retention Windows

These are initial MVP policy choices and should be refined before production legal review.

Pending or submitted proof:

- retain until reviewed or until `delete_after`, whichever policy selects as the governing deadline
- current upload foundation sets `delete_after` to roughly 30 days after submission

Approved request:

- delete raw proof within 7-30 days after approval
- keep claim and review metadata separately

Rejected request:

- delete raw proof within 7-30 days after rejection
- keep safe rejection/review metadata for audit

Needs resubmission because proof is unsafe or unredacted:

- delete promptly
- preferred window: 24-72 hours
- reviewers should not rely on unsafe proof staying retrievable

Cancelled request:

- delete within 7 days

Expired request:

- delete within 7 days

Revoked claim:

- do not restore old proof
- rely on safe metadata and review history
- require fresh verification if proof is needed again

## 5. Evidence Row After Deletion

After raw proof deletion:

- keep the `verification_evidence` row
- set `deleted_at`
- keep `delete_after`
- keep safe metadata only
- raw proof should no longer be viewable
- proof-viewing should fail closed when `deleted_at` is set

Storage reference fields:

- `storage_bucket` and `storage_path` may remain if needed for audit, idempotency, and deletion reference
- `storage_path` is sensitive operational metadata
- `storage_path` must never be shown in UI
- `storage_path` must never be included in security event metadata

Deletion state representation:

- if the existing evidence status model supports a `deleted` status later, it may be used
- the MVP can represent deletion through `deleted_at` alone
- deletion should not erase the request, evidence, or review-action history

## 6. Deletion Trigger Model

### A. Scheduled Cleanup Job

How it works:

- runs periodically
- finds evidence rows where `delete_after <= now()` and `deleted_at is null`
- deletes the Storage object
- sets `deleted_at`
- records deletion audit events

Strengths:

- simple operational model
- catches missed cleanup across all request states
- supports retry and batching
- keeps deletion policy centralized

Weaknesses:

- deletion may not happen immediately after review
- requires scheduler and privileged server runtime

### B. Manual Operator Cleanup

How it works:

- operator runs an explicit cleanup path for selected evidence or stale rows
- useful for emergency removal or migration cleanup

Strengths:

- good backup path
- useful for urgent unsafe proof removal

Weaknesses:

- not sufficient forever
- can drift without routine automation
- requires careful operator tooling to avoid exposing paths or secrets

### C. On-State-Transition Cleanup

How it works:

- delete proof when a request moves to `approved`, `rejected`, `needs_resubmission`, `cancelled`, or `expired`

Strengths:

- faster after review
- especially useful for unsafe or unredacted proof

Weaknesses:

- can complicate review flows
- state transitions and Storage deletion are not one database transaction
- failure handling must avoid marking proof deleted too early

Recommended MVP:

- use a scheduled cleanup job as the primary retention mechanism
- add manual admin/operator cleanup as a backup path
- later add immediate cleanup for unsafe `needs_resubmission` cases if product/legal policy confirms that behavior

## 7. Implementation Architecture Options

### Supabase Edge Function Scheduled Job

How it works:

- scheduled Supabase function runs with a server-side privileged credential
- queries eligible evidence rows
- deletes Storage objects
- updates `deleted_at`
- records security events

Strengths:

- close to Supabase Storage and database
- good fit for database/storage cleanup
- fewer moving pieces if the rest of the workflow already depends on Supabase

Weaknesses:

- requires Edge Function deployment and secret management
- local/runtime validation needs a clear operator workflow

### Next.js Or Vercel Cron Route

How it works:

- scheduled cron hits a protected server route
- route uses server-only service-role access
- route runs the cleanup batch

Strengths:

- fits the existing Next.js server-side codebase
- easy to share existing security-event helpers
- straightforward to test with local server/runtime scripts

Weaknesses:

- public route surface must be strongly protected
- route must not expose cleanup capability to browser users
- deployment provider behavior becomes part of retention reliability

### Database Function Plus External Scheduler

How it works:

- Postgres function performs metadata updates
- external scheduler invokes cleanup process
- Storage deletion still needs a privileged Storage client outside normal SQL

Strengths:

- strong database-side consistency for row updates
- clear SQL audit trail

Weaknesses:

- Storage object deletion is still outside the database transaction
- more components to coordinate

### Manual SQL Or Operator Script Only

How it works:

- operator runs a local or admin script manually

Strengths:

- fastest emergency fallback
- useful before cron infrastructure is ready

Weaknesses:

- not reliable enough as the long-term default
- too easy to miss stale proof

Recommended practical options:

- Supabase Edge Function scheduled job is the preferred MVP if the team wants cleanup close to Supabase Storage.
- Vercel Cron route is also acceptable if deployment operations are already centered on the Next.js app.

Required properties either way:

- server-only privileged credential
- idempotent cleanup
- safe batching
- bounded runtime
- retryable failure behavior
- no secret printing
- no public unprotected cleanup route
- no storage path leakage in UI or events

## 8. Required Deletion Authorization

Deletion worker authorization:

- use privileged server-side credential only
- never run deletion from browser or client-side code
- never use a publishable key for Storage deletion
- never print service-role credentials

User deletion boundary:

- users cannot self-delete submitted proof once it is linked to live evidence
- the current rollback-only delete policy remains correct for failed uploads before live evidence exists
- a later self-service withdrawal flow would need separate design and audit

Reviewer deletion boundary:

- reviewers cannot delete proof through the reviewer queue in the MVP
- viewing proof does not grant deletion authority

Founder/admin deletion:

- founder or admin deletion should be explicit and audited if added later
- no hard-coded founder/admin deletion bypass
- no self-review bypass

## 9. Deletion Event Taxonomy

Recommended event types:

- `verification_evidence.deletion_scheduled`
- `verification_evidence.deleted`
- `verification_evidence.deletion_failed`

Optional later event types:

- `verification_evidence.manual_delete_requested`
- `verification_evidence.manual_deleted`

Event metadata must not include:

- storage path
- signed URL
- public URL
- raw filename
- proof contents
- OCR text
- employee IDs
- badge numbers
- barcode or QR data
- secrets, tokens, or passwords

Allowed metadata:

- evidence id
- request id
- result
- reason code
- evidence type
- status
- `delete_after`
- `deleted_at`

Recommended reason codes:

- `retention_expired`
- `request_approved`
- `request_rejected`
- `unsafe_needs_resubmission`
- `request_cancelled`
- `request_expired`
- `object_already_missing`
- `storage_delete_failed`
- `metadata_update_failed`

## 10. Failure Handling

Failure rules:

- if Storage object deletion fails, keep `deleted_at` null
- record `verification_evidence.deletion_failed`
- retry later
- avoid marking evidence deleted unless object deletion succeeded or the object is confirmed missing
- if object is already missing, mark deleted with reason `object_already_missing`
- do not leak object path in logs, UI, or events
- operators need a safe way to inspect failures by evidence id and request id

Idempotency rules:

- cleanup can be rerun safely
- rows with `deleted_at is not null` should be skipped
- missing objects should not cause permanent worker failure
- batch progress should survive partial failure

## 11. Reviewer Behavior After Deletion

After raw object deletion:

- reviewer may still see safe metadata if request history is visible
- reviewer cannot view the raw proof
- proof-view action should fail closed when `deleted_at` is set
- no signed URL should be generated
- UI should show proof unavailable or deleted
- deletion does not erase review-action history

Reviewer queue behavior should remain metadata-first.

## 12. User-Facing Behavior

User-facing policy should make these boundaries clear:

- raw proof is retained temporarily
- uploads are not guaranteed to be retrievable later
- unsafe or unredacted proof may be deleted quickly
- after deletion, the user may need to resubmit if further review is needed
- approval or rejection can outlive the raw proof through safe metadata and review history
- privacy policy and terms should disclose proof collection, viewing, retention, and deletion before public launch

## 13. Founder And Global Reviewer Note

Founder or global reviewer access does not override retention by default.

Expected behavior:

- founder/global reviewers can review during the retention window
- founder/global reviewers should not be able to retrieve deleted raw proof
- founder/admin override for deletion should be explicit, audited, and not hard-coded
- no self-review still applies

## 14. Privacy And Legal Notes

Privacy/legal boundaries:

- jmpseat is independent unless formal partnerships exist
- do not claim any airline endorses jmpseat unless a formal partnership exists
- avoid perfect-verification claims
- do not encourage or rely on employer-system lookup
- do not ask reviewers to use employer systems
- privacy policy must disclose proof collection, reviewer viewing, retention, and deletion
- legal/privacy review should happen before production launch with real user uploads

## 15. Implementation Gates

Before implementation:

- decide scheduler mechanism
- add security-event taxonomy migration if needed
- add deletion worker/function
- confirm service-role server-only posture
- add tests for idempotency
- add tests for object-missing behavior
- add tests for no event metadata leakage
- add tests that proof viewing is denied after `deleted_at`
- add runtime validation plan
- update privacy/legal docs

## 16. Runtime Validation Plan

Future validation should use dummy proof only.

Validation steps:

1. upload dummy redacted proof
2. verify evidence row exists
3. verify Storage object exists
4. set `delete_after` to the past in a test fixture
5. run cleanup
6. confirm Storage object deleted
7. confirm `deleted_at` set
8. confirm deletion event recorded
9. confirm proof viewing is denied after deletion
10. confirm event metadata is sanitized
11. confirm missing-object case marks deleted with `object_already_missing`
12. confirm failed deletion leaves `deleted_at` null and is retryable

Validation must confirm no event metadata includes:

- storage path
- signed URL
- public URL
- raw filename
- proof contents
- OCR text
- employee IDs
- badge numbers
- barcode or QR data
- secrets, tokens, or passwords

## 17. Out Of Scope

Out of scope for this design artifact:

- actual deletion worker implementation
- scheduled job implementation
- cron route implementation
- Edge Function implementation
- SQL function implementation
- proof upload changes
- proof viewing changes
- Storage policy changes
- AI or OCR
- automatic approval
- employer-system lookup
- community features
- mobile scaffold
- custom SMTP or auth email branding

## 18. Recommended Next Implementation Slice

Recommended next slice:

- implement proof retention/deletion cleanup foundation
- include one scheduled or manual trigger path
- add deletion event taxonomy if needed
- keep worker server-only and audited
- keep cleanup idempotent and batch-limited
- add no UI delete controls unless explicitly scoped

The first implementation should prove the lifecycle on dummy proof:

- eligible evidence found
- object deleted
- `deleted_at` set
- event recorded
- deleted proof can no longer be viewed
