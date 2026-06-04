# Epoch 04 Human Review Queue Foundation Implementation

## Purpose

`E04-T07` adds the first bounded reviewer foundation for worker-verification review.

This ticket introduces:

- reviewer authorization scopes
- reviewer-only queue reads
- bounded review actions
- self-review prevention
- review-action audit rows
- a minimal reviewer-only queue surface

It does not implement proof upload, Storage buckets, a full admin dashboard, moderation tooling, or employer-system lookup.

## Migration Added

Added:

- `supabase/migrations/20260604165541_create_verification_reviewer_scopes.sql`

This migration was created locally only in this ticket. No remote `db push` was run.

## Reviewer Authorization Model Added

The new `verification_reviewer_scopes` table provides the reviewer authorization foundation.

It stores:

- `reviewer_id`
- `scope_type`
- `scope_value`
- `status`
- `granted_by`
- `reason`
- `created_at`
- `updated_at`

Supported `scope_type` values:

- `global`
- `airline`
- `role`
- `base`

Supported `status` values:

- `active`
- `paused`
- `revoked`

There is no self-serve reviewer enrollment path.

## RLS And Reviewer Access Posture

The migration adds:

- reviewer-scope RLS
- reviewer read access to verification requests
- reviewer read access to verification evidence metadata
- reviewer read access to verification claims
- reviewer read access to verification review actions
- reviewer update access to verification requests for bounded review decisions
- reviewer insert access to approved verification claims
- reviewer insert access to verification review actions

Important limitation:

- the database policies currently allow any authenticated user with an active reviewer scope to read verification review rows broadly
- finer reviewer scope filtering is enforced in server-side helpers for this slice

That limitation is intentional and documented. It keeps the RLS posture bounded without pretending per-airline/per-role/per-base queue slicing is fully enforced at the database layer yet.

## What Review Actions Are Supported

This ticket supports:

- `approve`
- `reject`
- `request_resubmission`

The review helper blocks:

- unauthorized review attempts
- self-review
- approvals for unsupported evidence
- reviews for requests outside the currently reviewable request statuses

## Claim Issuance

Claim issuance is implemented in a bounded way for approved `work_email` requests.

Supported approval behavior:

- issue `airline_worker` when:
  - the request asked for `airline_worker`
  - the work-email evidence metadata shows `support_result = supported_domain`
- issue `airline` when:
  - the request asked for `airline`
  - the work-email evidence metadata includes a non-sensitive `airline` value

Not supported:

- no `role` claim issuance from work email alone
- no `base` claim issuance from work email alone
- no claim issuance from self-declared profile fields alone

Issued claims include:

- `approved_by`
- `approved_at`
- `verification_method`
- `expires_at`

Initial expiration behavior in this slice:

- `airline_worker`: 12 months
- `airline`: 180 days

## How Self-Review Is Prevented

Self-review is blocked in two layers:

- pure review helper logic
- migration policies that require reviewer actions to target requests owned by another user

The reviewer route also never exposes a self-serve path to grant reviewer status.

## Reviewer Queue And Surface

This ticket adds a narrow reviewer route:

- `/app/admin/verification`

The route:

- remains behind the existing private-app gate
- additionally requires active reviewer scope
- redirects non-reviewers to `/app/access-restricted`
- shows safe verification request metadata only
- shows no proof files
- shows no Storage controls
- exposes only:
  - approve
  - reject
  - request resubmission

This is not a full admin dashboard.

## What Metadata Reviewers Can See

Current reviewer queue exposure is limited to safe verification request and evidence metadata such as:

- request method
- request status
- requested claim types
- submitted timestamp
- evidence type
- `email_domain`
- `airline`
- `support_result`

## What Metadata Reviewers Cannot See

This ticket does not expose:

- raw work email
- email local-part
- badge/proof files
- employee IDs
- badge numbers
- barcode or QR contents
- raw proof text
- Storage paths or bucket access

## Employer-System Lookup

No employer-system lookup was added.

The reviewer route and implementation continue to preserve the rule that reviewers must not use:

- employer systems
- internal directories
- company portals
- employee databases
- confidential employer resources

## Security Events

This ticket does not add new `security_events` taxonomy or constraint changes.

Review auditability in this slice is handled through:

- `verification_review_actions`
- request status updates
- bounded claim issuance rows

Verification-specific security-event expansion remains later work.

## What Remains Later

### E04-T08

- verification-specific security-event lifecycle expansion
- reviewer-action security event taxonomy if still needed

### E04-T09

- claims-based authorization preparation for future protected areas

### E04-T10

- validation, handoff, and final Epoch 04 review

## Scope Confirmation

This ticket adds no:

- proof upload
- Storage bucket creation
- file upload UI
- AI pre-check
- full admin dashboard
- moderation dashboard
- community feature work
- room or board access
- mobile scaffold
- custom SMTP or auth-email branding work
