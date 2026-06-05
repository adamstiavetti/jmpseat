# E05-T07: Protected Manual Proof Cleanup Controls

Brand note: jmpseat is the canonical product and app name. This implementation
note does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Scope

This ticket adds operator-controlled manual proof cleanup execution to the
existing proof cleanup admin surface.

Delivered in this slice:

- manual cleanup controls on `/app/admin/proof-cleanup`
- explicit `operator.run_proof_cleanup` authorization for cleanup execution
- typed confirmation before cleanup runs
- bounded manual batch limits
- summary-only post-run results
- audit events for requested, completed, denied, and failed manual runs
- continued monitoring support for `operator.monitor_proof_cleanup`

Not delivered in this slice:

- no arbitrary object deletion
- no per-object delete controls
- no bucket, path, file, filename, storage key, or evidence-id delete inputs
- no proof viewing
- no raw proof files or proof contents
- no proof retention/deletion semantic changes
- no verification claim issuance rule changes
- no community, rooms, posts, or moderation work

## 2. Migration

Migration created:

- `supabase/migrations/20260605234500_add_operator_manual_proof_cleanup_controls.sql`

The migration extends the `security_events` event-type constraint with:

- `proof_cleanup.manual_requested`
- `proof_cleanup.manual_completed`
- `proof_cleanup.manual_denied`
- `proof_cleanup.manual_failed`

The migration does not create broad delete RPCs, does not grant normal users
cleanup permissions, does not update `verification_evidence`, and does not
interact with Storage objects.

The migration was applied to the linked Supabase runtime during the E05-T07
runtime pass. See
`docs/ops/protected-manual-proof-cleanup-controls-runtime-pass.md`.

## 3. Authorization

Manual cleanup execution requires:

- `operator.run_proof_cleanup`

Monitoring still requires:

- `operator.monitor_proof_cleanup`

Authorization behavior:

- monitor-only operators can view cleanup health but cannot run cleanup
- run-only operators can open the proof cleanup route and run bounded cleanup,
  but do not receive monitoring data unless separately granted monitoring scope
- reviewer scope, beta access, verification claims, work email, login email, and
  profile text do not imply cleanup execution access
- missing operator setup is treated as setup/not-ready
- true missing-scope access is denied

## 4. Execution Boundary

Manual cleanup runs through the existing reviewed cleanup helper:

- `cleanupExpiredVerificationProofsForOps`

The admin action accepts only:

- typed confirmation
- bounded batch limit

The admin action does not accept:

- bucket names
- object paths
- Storage keys
- filenames
- evidence IDs
- request IDs
- arbitrary delete targets

Existing deletion semantics are preserved:

- only eligible expired proof evidence is selected by the helper
- `deleted_at` is set only after successful deletion or confirmed missing object
- failed deletion leaves `deleted_at` null
- deleted proof remains non-viewable
- cleanup helper audit events still persist

## 5. Audit Behavior

Manual cleanup controls record summary-only events:

- `proof_cleanup.manual_requested`
- `proof_cleanup.manual_completed`
- `proof_cleanup.manual_denied`
- `proof_cleanup.manual_failed`

The pre-action `proof_cleanup.manual_requested` event is a hard execution
precondition. If that audit event cannot be recorded, manual cleanup fails
closed, the existing cleanup helper is not called, and no destructive proof
cleanup runs without the required pre-action audit trail.

Outcome audit is also required for clean reporting. After the cleanup helper
runs, `proof_cleanup.manual_completed` or `proof_cleanup.manual_failed` must be
recorded before the action reports a normal completed/failed result. If cleanup
may have run but the outcome event cannot be recorded, the action returns an
outcome-audit failure state with summary-only counts when available so operators
do not mistake the run for a fully audited success.

The E05-T07 migration also updates proof cleanup monitoring so
`operator.monitor_proof_cleanup` can see manual cleanup audit events in the
bounded cleanup event list.

Manual cleanup audit metadata includes bounded counts and reason codes only. It
does not include raw proof data, proof URLs, object-location details, filenames,
secrets, or privileged identifiers in committed docs.

## 6. Admin Route

Route updated:

- `/app/admin/proof-cleanup`

Route behavior:

- operators with `operator.monitor_proof_cleanup` see monitoring sections
- operators with `operator.run_proof_cleanup` see manual cleanup controls
- operators with both scopes see both surfaces
- operators with neither scope are denied
- the page uses the shared AdminShell

The action label and confirmation copy describe cleanup of eligible expired
proof files only.

## 7. Validation Status

Runtime validation is complete for the linked Supabase runtime.
Runtime validation was pending until the E05-T07 migration was reviewed,
merged, applied, and validated in the linked runtime pass.

The runtime proof verified:

- migration applied cleanly
- `operator.run_proof_cleanup` is required for manual cleanup controls
- `operator.monitor_proof_cleanup` alone does not grant cleanup execution
- typed confirmation and bounded limits are enforced
- `proof_cleanup.manual_requested` is a hard execution precondition
- a live zero-eligible cleanup run returns safe summary-only counts
- manual cleanup outcome events are visible through proof cleanup monitoring
- outcome-audit-failure branches return an explicit audit-integrity failure
  state instead of falsely reporting clean success/failure
- no bucket/path/object/evidence-id delete controls exist
- no raw proof files, proof contents, signed URLs, public URLs, storage paths,
  filenames, tokens, sessions, secrets, or service-role behavior are exposed

Important precision:

- the linked runtime had zero eligible expired proof rows, so this pass did not
  force a live destructive delete
- the normal live audit-success path was validated directly
- outcome-audit-failure handling was validated through safe injected recorder
  failure rather than intentionally breaking remote audit plumbing

## 8. Source-Of-Truth Status

This document records the E05-T07 implementation scope and linked-runtime
validation outcome.

No production commands, deployments, secrets, arbitrary deletion controls, raw
proof access, or community tools are part of this ticket.
