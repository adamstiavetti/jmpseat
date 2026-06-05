# E05-T05: Verification Audit Inspection

Brand note: jmpseat is the canonical product and app name. This implementation
note does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Scope

This ticket implements operator-controlled verification audit inspection for
existing verification operations.

Delivered in this slice:

- operator-only `/app/admin/audit`
- metadata-only verification request, evidence, claim, and review-action
  inspection
- metadata-only security-event inspection
- split read scopes for verification records and security events
- server-only audit-inspection action layer
- audit-inspection navigation activation for authorized operators
- audit-on-audit events for view and denied attempts

Not delivered in this slice:

- no raw proof viewing
- no proof signed URL generation
- no proof cleanup monitoring UI
- no verification claim issuance rule changes
- no community, rooms, posts, or moderation work

## 2. Migration

Migration created:

- `supabase/migrations/20260605223000_add_operator_verification_audit_inspection.sql`

This migration adds:

- `sanitize_operator_audit_metadata(...)`
- `list_verification_requests_for_operator(...)`
- `get_verification_request_audit_detail(...)`
- `list_security_events_for_operator(...)`
- `operator_audit.viewed`
- `operator_audit.unauthorized_attempt`

`sanitize_operator_audit_metadata(...)` recursively sanitizes JSON objects and
arrays before RPC responses are returned, so direct authenticated RPC callers
receive sanitized metadata even when nested objects or arrays contain sensitive
keys. The database-side sanitizer explicitly redacts proof-content metadata
keys such as extracted text, proof text/content/body/data, and raw proof values
at every nesting level. The page-side TypeScript sanitizer remains
defense-in-depth, not the only privacy boundary.

The migration does not redefine `can_review_verification_request(...)`, does
not update verification requests, and does not insert verification claims.
Existing reviewer queue behavior and claim issuance rules remain unchanged.

The migration is intentionally not applied in this task. Runtime validation is
required after review, merge, and migration apply.

## 3. Operator Authorization

Required scopes:

- `operator.read_verification_requests` for verification request, evidence
  metadata, claim, and review-action inspection
- `operator.read_audit` for security-event inspection

Authorization behavior:

- no operator grant means no access
- reviewer scope alone does not imply audit-inspection access
- beta access, verification claims, work email, login email, and profile text
  do not imply audit-inspection access
- missing or failing operator-scope readiness RPCs are treated as tool
  setup/not-ready, not unauthorized access
- the private-app gate runs before the audit-inspection config fallback is
  rendered
- users with only one read scope see only that authorized section
- true missing-scope users are redirected to `/app/access-restricted`
- the operator RPCs also enforce the matching read scope
- malformed `request_id` query values are rejected before calling the
  UUID-typed detail RPC, so an invalid detail selection does not make the whole
  audit surface look not-ready or hide already-loaded lists

## 4. Data Exposure Boundaries

Verification request list responses include bounded metadata:

- request id
- user id
- status
- method
- requested claim types
- submitted/reviewed/expires/created/updated timestamps
- reviewer id where already present as verification metadata
- evidence, claim, and review-action counts

Verification request detail responses include bounded metadata:

- evidence id, type, status, uploaded/delete/deleted timestamps
- redaction acknowledgement
- proof-present boolean
- recursively sanitized evidence metadata
- claim status/type/value metadata
- review action id, reviewer id, action, timestamp, claim id, and notes-present
  boolean

Security-event responses include:

- event id
- event type
- user id
- route
- result
- recursively sanitized metadata
- created timestamp

The audit surface excludes:

- raw proof files
- signed URLs
- public URLs
- proof-view links
- proof storage paths
- raw filenames
- proof contents
- OCR text
- employee IDs
- badge numbers
- barcode or QR data
- secrets, tokens, magic links, sessions, and env values

## 5. Audit-On-Audit Decision

This slice records audit-inspection view and denied-attempt events because the
event taxonomy extension is small and keeps privileged reads observable.

Events added:

- `operator_audit.viewed`
- `operator_audit.unauthorized_attempt`

The recorded metadata is intentionally summary-only. It can include which
surface was viewed and whether filters were present, but it does not include
raw proof data, signed URLs, storage paths, secrets, or privileged operator
identifiers in docs.

## 6. Admin Route

Route added:

- `/app/admin/audit`

Navigation behavior now becomes:

- Audit Inspection: linkable for operators with `operator.read_audit` or
  `operator.read_verification_requests`
- Reviewer Scopes: still linkable only for operators with
  `operator.manage_reviewer_scopes`
- Approved Domains: still linkable only for operators with
  `operator.manage_approved_domains`
- Verification Review: still reviewer-scope based
- Proof Cleanup: still disabled until a later Epoch 05 ticket implements that
  tool

## 7. What Remains For E05-T06

The next operator/admin tooling ticket is E05-T06 Proof Cleanup Monitoring.

That slice still needs:

- cleanup-run/status inspection
- failed cleanup visibility without storage-path exposure
- cleanup monitoring runtime proof

Manual cleanup controls remain a later ticket and are not implemented here.

## 8. Runtime Follow-Up

Runtime validation is still required after this branch is reviewed, merged, and
the migration is applied to the linked Supabase project.

Runtime proof should verify:

- migration applies cleanly
- users without audit-inspection scopes cannot access `/app/admin/audit`
- reviewer scope alone does not activate audit inspection
- `operator.read_verification_requests` can inspect verification request
  metadata without security-event list access
- `operator.read_audit` can inspect security events without verification
  request detail access
- operators with both scopes can see both sections
- no raw proof files, signed URLs, public URLs, proof paths, raw filenames, or
  proof contents are exposed
- audit-on-audit events persist
- existing reviewer queue behavior remains reviewer-scope based

## 9. Source-Of-Truth Status

This document records the E05-T05 implementation outcome before runtime
validation.

No Supabase `db push`, production commands, deployments, or secrets are part
of this ticket.
