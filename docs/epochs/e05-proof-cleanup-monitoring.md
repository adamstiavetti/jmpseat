# E05-T06: Proof Cleanup Monitoring

Brand note: jmpseat is the canonical product and app name. This implementation
note does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Scope

This ticket implements operator-controlled proof cleanup monitoring for the
existing proof-retention cleanup foundation.

Delivered in this slice:

- operator-only `/app/admin/proof-cleanup`
- read-only proof cleanup health summary
- due, overdue, deleted, scheduled, and failed cleanup counts
- bounded recent failed-cleanup references using safe evidence/request IDs
- bounded recent cleanup audit events
- audit-on-monitoring events for allowed and denied monitoring access
- monitoring navigation activation for `operator.monitor_proof_cleanup`

Not delivered in this slice:

- no manual cleanup trigger
- no arbitrary object deletion
- no proof viewing
- no raw proof files or proof contents
- no cleanup retry controls
- no proof retention/deletion semantic changes
- no verification claim issuance rule changes
- no community, rooms, posts, or moderation work

## 2. Migration

Migration created:

- `supabase/migrations/20260605233000_add_operator_proof_cleanup_monitoring.sql`

This migration adds:

- `get_proof_cleanup_monitoring_summary()`
- `list_proof_cleanup_failures_for_operator(...)`
- `list_proof_cleanup_events_for_operator(...)`
- `proof_cleanup.monitor_viewed`
- `proof_cleanup.monitor_unauthorized_attempt`

The RPCs are bounded `SECURITY DEFINER` reads that enforce
`operator.monitor_proof_cleanup` inside the database. They are granted only to
authenticated users and fail closed when `auth.uid()` is absent or the required
operator scope is missing.

The migration does not update or delete `verification_evidence` rows, does not
interact with Storage objects, does not generate signed URLs, and does not call
the existing cleanup trigger.

The migration was applied to the linked Supabase runtime during the E05-T06
runtime pass. See
`docs/ops/proof-cleanup-monitoring-runtime-pass.md`.

## 3. Operator Authorization

Required scope:

- `operator.monitor_proof_cleanup`

Authorization behavior:

- no operator grant means no access
- reviewer scope alone does not imply cleanup monitoring access
- beta access, verification claims, work email, login email, and profile text
  do not imply cleanup monitoring access
- `operator.run_proof_cleanup` alone does not activate the read-only monitoring
  route
- missing or failing operator-scope readiness RPCs are treated as tool
  setup/not-ready, not unauthorized access
- true missing-scope users are redirected to `/app/access-restricted`
- the operator RPCs also enforce `operator.monitor_proof_cleanup`

## 4. Data Exposure Boundaries

The cleanup monitoring surface can include:

- aggregate cleanup counts
- safe verification evidence IDs
- safe verification request IDs
- evidence status
- `delete_after`
- `deleted_at`
- cleanup event IDs
- cleanup event type, route, result, and timestamp
- recursively sanitized cleanup event metadata keys

The cleanup monitoring surface excludes:

- raw proof files
- raw proof contents
- signed URLs
- public proof URLs
- proof viewing links
- broad object-location details
- proof filenames
- tokens, magic links, sessions, secrets, and service-role values
- arbitrary delete controls

The database RPCs reuse the E05-T05 recursive metadata sanitizer for cleanup
event metadata. The page-side sanitizer is defense-in-depth, not the only
privacy boundary for direct authenticated RPC callers.

## 5. Audit-On-Monitoring Decision

This slice records proof-cleanup monitoring reads and denied attempts because
the event taxonomy extension is small and keeps privileged operational reads
observable.

Events added:

- `proof_cleanup.monitor_viewed`
- `proof_cleanup.monitor_unauthorized_attempt`

The recorded metadata is intentionally summary-only. It does not include raw
proof data, proof URLs, object-location details, filenames, secrets, or
privileged identifiers in committed docs.

## 6. Admin Route

Route added:

- `/app/admin/proof-cleanup`

Navigation behavior now becomes:

- Proof Cleanup: linkable for operators with `operator.monitor_proof_cleanup`
- Audit Inspection: still linkable only for operators with
  `operator.read_audit` or `operator.read_verification_requests`
- Reviewer Scopes: still linkable only for operators with
  `operator.manage_reviewer_scopes`
- Approved Domains: still linkable only for operators with
  `operator.manage_approved_domains`
- Verification Review: still reviewer-scope based

The E05-T06 monitoring slice was read-only. E05-T07 later adds protected manual
cleanup controls on the same route with a separate `operator.run_proof_cleanup`
scope.

## 7. E05-T07 Follow-On

The follow-on protected cleanup ticket is E05-T07 Protected Manual Cleanup
Controls.

That later slice covers:

- bounded manual cleanup trigger controls
- explicit operator authorization for running cleanup
- small reviewed batch limits
- audit events for requested, denied, completed, and failed manual cleanup
- runtime proof that the existing cleanup helper remains the only deletion path

E05-T06 itself did not implement those controls. E05-T07 implementation is
tracked separately in
`docs/epochs/e05-protected-manual-proof-cleanup-controls.md`.

The E05-T07 migration updates the cleanup event monitoring RPC so the bounded
event list also includes `proof_cleanup.manual_requested`,
`proof_cleanup.manual_completed`, `proof_cleanup.manual_denied`, and
`proof_cleanup.manual_failed` after the manual controls migration is applied.

That behavior is now runtime-validated as part of the E05-T07 linked-runtime
pass recorded in
`docs/ops/protected-manual-proof-cleanup-controls-runtime-pass.md`.

## 8. Validation Status

Runtime validation is complete for the linked Supabase runtime.
Runtime validation was pending until this linked-runtime pass completed after
review, merge, and migration apply.

The runtime proof verified:

- migration applied cleanly
- anonymous, non-operator, and reviewer-only monitoring RPC access is denied
  safely
- the authorized operator can load cleanup summary, failure list, and event list
- summary counts are non-negative
- cleanup responses do not expose raw proof files, proof contents, signed URLs,
  public URLs, storage paths, filenames, tokens, sessions, secrets, or
  service-role behavior
- `proof_cleanup.monitor_viewed` persists for authorized monitoring reads
- `/app/admin/proof-cleanup` remains read-only
- existing cleanup trigger, proof viewing, and proof deletion semantics remain
  unchanged

No separate run-only operator grant existed in the linked runtime, so
`operator.run_proof_cleanup`-alone denial remains covered by automated source
tests.

## 9. Source-Of-Truth Status

This document records the E05-T06 implementation and linked-runtime validation
outcome.

No production commands, deployments, secrets, or manual cleanup controls are
part of this ticket.
