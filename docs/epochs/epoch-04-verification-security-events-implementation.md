# Epoch 04 Verification Security Events Implementation

## Purpose

`E04-T08` extends the existing `security_events` baseline to cover the bounded worker-verification lifecycle already implemented in `E04-T05` through `E04-T07`.

This ticket adds verification-specific event taxonomy, metadata sanitization coverage, and fail-soft event recording in the existing work-email request and review flows.

It does not add new verification product capabilities.

## Event Types Added

Added bounded verification event types:

- `verification_request.submitted`
- `verification_request.unsupported_domain`
- `verification_request.invalid_work_email`
- `verification_request.duplicate_active`
- `verification_evidence.created`
- `verification_review.approved`
- `verification_review.rejected`
- `verification_review.needs_resubmission`
- `verification_review.unauthorized_attempt`
- `verification_review.self_review_blocked`
- `verification_claim.issued`

Intentionally not added in this slice:

- upload-specific event names that would imply proof-upload implementation
- `verification_claim.revoked`
- `verification_evidence.deleted`

Those remain later work.

## Where Events Are Recorded

### Work-email request flow

The `work_email` submission path now records bounded events for:

- invalid work email input
- unsupported approved-domain lookup result
- duplicate active request
- successful verification request creation
- successful work-email evidence metadata creation

### Review flow

The human-review action path now records bounded events for:

- unauthorized review attempt
- self-review blocked
- approve
- reject
- request resubmission
- claim issuance after successful approval

Event logging is fail-soft and does not control authorization.

## Metadata Safety Rules

Verification security-event metadata stays minimal and conservative.

Allowed safe metadata examples include:

- `route`
- `result`
- `verification_request_id`
- `verification_claim_id`
- `claim_type`
- `claim_value` only when non-sensitive
- `evidence_type`
- `email_domain`
- `review_action`
- `support_result`
- `status`
- `verification_method`

## What Is Intentionally Not Logged

This slice strips or avoids logging:

- raw work email
- email local-part
- employee IDs
- badge IDs
- badge numbers
- barcode content
- QR code content
- OCR text
- raw proof text
- storage paths
- passenger/customer data
- trip or schedule data
- crew hotel information
- proof file contents
- passwords
- secret keys
- access tokens
- refresh tokens
- API keys

No employer-system lookup data is logged because no employer-system lookup is implemented or permitted.

## Migration Created

Added:

- `supabase/migrations/20260604173625_extend_security_events_for_verification.sql`

This migration extends the `security_events_event_type_check` constraint to allow the new bounded verification event types.

## Remote Migration Handling

No remote `db push` was run in this ticket.

The migration is reviewed and committed locally only in this slice.

## Remaining Hardening Items

`E04-T07` left a known review-write hardening gap:

- review writes are still sequential rather than transactional

This ticket does not rewrite review operations into a transactional RPC.

Current audit expectation:

- event-log failures must fail soft
- authorization must not depend on event recording
- partial review writes remain a future hardening item for a later narrower consistency pass

## Scope Confirmation

This ticket adds no:

- proof upload
- Storage bucket creation
- file upload UI
- AI pre-check
- full admin dashboard
- community feature work
- room or board access
- mobile scaffold
- custom SMTP or auth-email branding work
