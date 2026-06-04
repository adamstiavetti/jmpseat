# Redacted Proof Upload Runtime Pass

## Purpose

This artifact records that the redacted-proof upload/storage foundation now works end-to-end against the linked Supabase runtime.

It also records that reviewer routing now works for airline-scoped reviewers through bounded `requested_airline` routing context.

## Runtime Environment

- repo path: `/Users/ClawdBot/jmpseat`
- linked Supabase migration history was aligned through:
  - `20260604113000`
  - `20260604124500`
  - `20260604143000`
  - `20260604154521`
  - `20260604165541`
  - `20260604173625`
  - `20260604191118`
  - `20260604195441`
  - `20260604210259`
  - `20260604220401`
  - `20260604223611`
- no secrets or environment values are included in this artifact

## Test Accounts And Roles

- applicant app-login account:
  - `adamstiavetti@gmail.com`
- reviewer app-login account:
  - `jmpseatapp@gmail.com`
- reviewer scope:
  - `scope_type = airline`
  - `scope_value = American Airlines`
  - `status = active`
- no global reviewer scope was used

## Test File

- dummy non-sensitive PNG only
- no real badge
- no employee ID
- no badge number
- no barcode or QR code
- no security markings
- no personal document

## Positive Upload Result

The upload flow succeeded against the linked runtime:

- upload succeeded
- verification request row created
- verification evidence row created
- private storage object created

Proof request result:

- `method = redacted_badge_or_proof`
- `status = submitted`
- `requested_claim_types = ['airline_worker']`

Proof evidence result:

- `redaction_acknowledged = true`
- `uploaded_at` set
- `delete_after` set to the bounded 30-day retention target
- `storage_bucket = verification-proofs`
- `storage_path` used UUID-only path segments

## Routing Context Result

The proof evidence metadata persisted:

- `requested_airline = American Airlines`
- `routing_context_source = self_declared`

This requested airline value remains routing context only.

It is explicitly not:

- proof by itself
- a verified claim
- authorization for protected or claim-gated access

## Reviewer Routing Result

After the reviewer-routing RLS fix was applied remotely:

- the airline-scoped reviewer saw the proof request
- no global reviewer scope was required
- reviewer-session reads now recognize `requested_airline` in the bounded reviewer-read helper

The reviewer queue remained metadata-only.

## Metadata And Event Safety

Allowed proof evidence metadata fields observed at runtime:

- `requested_airline`
- `routing_context_source`
- `file_size_bytes`
- `mime_type`
- `original_extension`
- `upload_client`
- `redaction_acknowledged`
- `evidence_method`

Verification security events recorded:

- `verification_request.submitted`
- `verification_evidence.created`
- `verification_evidence.uploaded`

Sensitive fields were not stored in evidence metadata or verification-event metadata:

- no raw filename
- no storage path in metadata or events
- no proof content
- no employee IDs
- no badge numbers
- no barcode or QR data
- no OCR text

## Reviewer Queue Metadata-Only Result

The reviewer queue showed safe metadata only:

- evidence status
- redaction acknowledged
- uploaded-at timing
- delete-after timing
- requested airline
- routing context source
- mime type
- file size

The reviewer queue did not show:

- storage path
- storage bucket
- signed URL
- public URL
- preview
- download button
- proof file viewing

## Claims And Approval Boundary

This runtime pass confirmed:

- no claim was issued from upload alone
- no automatic approval occurred
- reviewer proof viewing remains deferred

Real proof review cannot be considered complete until a controlled proof-viewing or retrieval path exists.

## Runtime Bugs Fixed

### RPC Persistence Bug

Observed bug:

- the upload form collected routing context
- app draft metadata included:
  - `requested_airline`
  - `routing_context_source`
- but the RPC dropped both fields before persistence

Fix:

- `20260604220401_persist_proof_routing_context_metadata.sql`

### Reviewer RLS Routing Bug

Observed bug:

- reviewer routing worked in app-side filtering logic
- but reviewer-session reads still returned zero reviewable proof requests

Root cause:

- `public.can_review_verification_request(...)` matched reviewer airline scope against:
  - `metadata ->> 'airline'`
- but not against:
  - `metadata ->> 'requested_airline'`

Fix:

- `20260604223611_include_requested_airline_in_reviewer_routing.sql`

## Remaining Limitations

- no reviewer proof viewing yet
- no signed proof retrieval yet
- no proof retention automation yet
- no AI
- no automatic approval
- no final airline-domain policy
- no finalized production legal/privacy copy
- no custom Supabase auth email branding or custom SMTP yet
- no community claim-gated areas yet

## Recommended Next Work

1. Controlled reviewer proof viewing or retrieval path.
2. Retention and deletion automation.
3. Operator tooling for approved domains and reviewer scopes.
4. Custom Supabase auth templates and custom SMTP before any real public work-email delivery rollout.
