# Protected Manual Proof Cleanup Controls Runtime Pass

Date: 2026-06-05

Commit validated:

- `a1a5bb1` (`feat: add protected manual proof cleanup controls`)

Migration applied:

- `20260605234500_add_operator_manual_proof_cleanup_controls.sql`

Operator identity:

- Validated against the linked Supabase runtime.
- Privileged operator UUID and email are intentionally redacted.

## Scope

This runtime pass validates the E05-T07 protected manual cleanup slice on the
linked Supabase runtime after migration apply.

Validated scope:

- bounded manual cleanup access via `operator.run_proof_cleanup`
- continued read-only monitoring separation via `operator.monitor_proof_cleanup`
- typed confirmation and bounded limit handling
- pre-action audit gate for `proof_cleanup.manual_requested`
- outcome-audit integrity for `proof_cleanup.manual_completed` and
  `proof_cleanup.manual_failed`
- proof cleanup monitoring visibility for manual cleanup audit events
- preservation of the existing reviewed cleanup helper as the only deletion path

Not added or exposed:

- arbitrary deletion controls
- bucket/path/object/evidence-id delete inputs
- raw proof files or proof contents
- signed URLs or public URLs
- storage paths or filenames
- tokens, sessions, secrets, or service-role details

## Migration Apply

Preflight confirmed the linked Supabase project was configured correctly and the
only pending local migration was
`20260605234500_add_operator_manual_proof_cleanup_controls.sql`.

`npx supabase db push` then applied the migration successfully. A follow-up
linked migration list confirmed the local and remote histories matched with
`20260605234500_add_operator_manual_proof_cleanup_controls.sql` present on both
sides.

## Env And Operator Preflight

Confirmed without printing values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Confirmed against linked runtime without printing privileged identifiers:

- an active operator grant exists
- the validated operator has `operator.run_proof_cleanup`
- a combined operator context with `operator.monitor_proof_cleanup` was also
  available for route and monitoring checks
- non-operator beta-user and reviewer-only contexts were available for negative
  authorization checks

## Runtime Validation

### 1. Route And Action Authorization

Validated:

- unauthenticated cleanup-monitoring/manual-control RPC access is denied safely
- active beta users without operator scope cannot run manual cleanup
- reviewer scope alone does not grant manual cleanup
- `operator.monitor_proof_cleanup` alone cannot run manual cleanup
- `operator.run_proof_cleanup` grants cleanup-control access
- `operator.run_proof_cleanup` does not automatically grant monitoring data
- operator scope RPCs report `operator.run_proof_cleanup` correctly
- `is_operator_with_scope('operator.run_proof_cleanup')` returns true for the
  validated operator
- wrong or ungranted scope checks return false

### 2. UI And Control Behavior

Validated:

- `/app/admin/proof-cleanup` continues to use the shared AdminShell model
- manual cleanup controls are scoped to `operator.run_proof_cleanup`
- monitor-only contexts cannot use run controls
- run-only contexts do not receive monitoring data unless also granted monitor
  scope
- typed confirmation is required
- large requested batch limits normalize down to the bounded maximum
- the action accepts no bucket/path/object/evidence-id deletion parameters
- no proof-view links or storage identifiers are introduced by this slice

### 3. Audit-Before-Cleanup Gate

Validated:

- `proof_cleanup.manual_requested` is treated as a hard precondition before the
  cleanup helper runs
- when pre-action audit recording is forced to return `recorded: false`, cleanup
  does not run
- no destructive cleanup occurs without the required pre-action audit trail
- returned failure state remains summary-only and does not leak internals

### 4. Cleanup Execution Behavior

The linked runtime had zero currently eligible expired proof rows at validation
time, so the live cleanup execution path was validated against the safest
zero-eligible state first.

Validated:

- manual cleanup still routes only through the existing reviewed cleanup helper
- no arbitrary object deletion path exists
- the live zero-eligible run completed successfully with safe zero-count summary
- returned summary remained bounded to safe counts only
- no storage paths, filenames, signed URLs, proof content, secrets, or
  service-role details appeared

Because the runtime had zero eligible proof rows, this pass did not force a
live destructive delete during validation. Existing Epoch 04/E05 source tests
and prior cleanup-runtime foundations remain the coverage source for the helper
semantics around successful deletion, confirmed-missing handling, `deleted_at`,
and non-viewability after deletion.

### 5. Outcome Audit Integrity

Validated:

- when cleanup completes normally and outcome audit records successfully, the
  action reports normal success
- when the helper failure path is exercised with successful
  `proof_cleanup.manual_failed` recording, the action reports safe failure
- when outcome audit is forced to return `recorded: false` after cleanup, the
  action reports outcome-audit failure instead of clean success/failure

Important precision:

- the linked runtime pass exercised the normal live audit-success path
- the outcome-audit-failure branches were validated through safe injected
  recorder behavior rather than by intentionally breaking remote audit plumbing

### 6. Monitoring Visibility For Manual Events

Validated:

- proof cleanup monitoring accepts filters for:
  - `proof_cleanup.manual_requested`
  - `proof_cleanup.manual_completed`
  - `proof_cleanup.manual_failed`
  - `proof_cleanup.manual_denied`
- those manual event types are visible through the bounded proof cleanup event
  list
- monitoring responses remained sanitized and did not expose unsafe metadata

### 7. Existing Cleanup Route And Proof Boundaries

Validated:

- existing protected cleanup routes remain protected
- existing proof cleanup monitoring remains read-only
- this slice does not add proof viewing links
- this slice does not change proof retention/deletion semantics

## Tests And Validation Run

Passed:

- `node --test test/admin/proofCleanupControls.test.mts`
- `node --test test/admin/proofCleanupMonitoring.test.mts`
- `node --test test/ops/proofRetentionCleanupRoute.test.mts`
- `node --test test/verification/proofRetention.test.mts test/verification/proofAccess.test.mts test/verification/proofUpload.test.mts`
- `node --test test/security-events/securityEvents.test.mts test/security-events/verificationSecurityEvents.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/admin/approvedDomains.test.mts test/admin/reviewerScopes.test.mts test/admin/verificationAudit.test.mts`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `git diff --check`

Lint note:

- `npm run lint` passed with only the known pre-existing warnings in
  `app/lab/live-globe-proof/page.tsx` and
  `src/lib/scroll/heroFlightControl.ts`

## Caveats

- production deployment/runtime validation is separate if this pass was
  performed only against linked local/dev runtime infrastructure
- no arbitrary deletion/community tools were implemented
- the live runtime had zero eligible expired proof rows, so the destructive
  delete path was intentionally not forced during this pass
- outcome-audit-failure branches were validated through safe simulated recorder
  failure rather than intentional remote audit breakage
