# E05-T06: Proof Cleanup Monitoring Runtime Pass

Brand note: jmpseat is the canonical product and app name. This runtime proof
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Summary

Date: 2026-06-05

Commit validated:

- `106c6c0 feat: add proof cleanup monitoring`

Migration applied:

- `20260605233000_add_operator_proof_cleanup_monitoring.sql`

The linked Supabase migration history is clean and the E05-T06 proof cleanup
monitoring migration is applied remotely.

The initial operator identity was validated for this runtime pass, but the
privileged operator UUID and email are intentionally redacted from committed
docs and handoff output.

## 2. Preflight

Preflight checks confirmed:

- local branch was clean on `main` before runtime validation docs were written
- the E05-T06 migration file existed locally
- the only pending local migration before apply was
  `20260605233000_add_operator_proof_cleanup_monitoring.sql`
- required Supabase env names were present without printing values
- an active operator grant exists
- the active operator has `operator.monitor_proof_cleanup`
- `operator.run_proof_cleanup` is not required for read-only monitoring

The migration was applied with `npx supabase db push --yes`. No deployment was
run.

## 3. Migration State

Before apply, linked migration history matched local history through:

- `20260605223000_add_operator_verification_audit_inspection.sql`

After apply, `npx supabase migration list --linked` showed matching local and
remote history through:

- `20260605233000_add_operator_proof_cleanup_monitoring.sql`

## 4. Route And RPC Authorization

Runtime checks confirmed:

- anonymous proof-cleanup monitoring RPC calls are denied safely with
  `authenticated_operator_required`
- a non-operator active-beta user cannot load proof-cleanup monitoring data
- a reviewer-only user cannot load proof-cleanup monitoring data
- the operator-scope RPC reports `operator.monitor_proof_cleanup` for the
  validated operator
- `is_operator_with_scope('operator.monitor_proof_cleanup')` returns true for
  the validated operator
- an ungranted operator scope returns false
- no privileged operator UUID or email was printed or committed

No separate run-only operator grant was present in this linked runtime, so the
`operator.run_proof_cleanup`-alone denial path remains covered by source tests.

## 5. Monitoring Summary

Runtime checks confirmed authorized operators can load the cleanup monitoring
summary.

Observed summary counts were non-negative:

- scheduled: `0`
- due: `0`
- overdue: `0`
- deleted: `4`
- failed events: `0`
- recent failures: `0`

The summary response did not expose raw proof files, proof contents, signed
URLs, public URLs, storage paths, filenames, tokens, secrets, sessions, or
service-role behavior.

## 6. Failure And Event Lists

Runtime checks confirmed:

- authorized operators can load the recent failed-cleanup list
- authorized operators can load the recent cleanup event list
- failure and event responses are bounded by the requested limit
- failure references use safe evidence/request IDs only when present
- cleanup event metadata is recursively sanitized by the database-side audit
  sanitizer before being returned to direct RPC callers
- event rows are limited to the allowed cleanup-monitoring event set
- `proof_cleanup.monitor_viewed` persists for authorized monitoring reads

The linked runtime had no current failed cleanup rows, so no failure detail rows
needed investigation during this pass.

## 7. Read-Only Monitoring Guarantee

Automated and source-shape validation confirmed:

- `/app/admin/proof-cleanup` contains no cleanup execution button or control
- proof-cleanup monitoring RPCs do not trigger cleanup
- existing protected cleanup trigger routes remain unchanged
- no arbitrary deletion controls exist
- no proof viewing links are introduced

E05-T07 Protected Manual Cleanup Controls remains unstarted.

## 8. Existing Cleanup And Proof Behavior

Automated validation confirmed existing behavior remains unchanged:

- protected manual cleanup route remains protected
- cron-compatible cleanup route remains protected
- proof viewing behavior remains unchanged
- deletion semantics remain unchanged:
  - `deleted_at` is set only after successful deletion or confirmed missing
  - failed deletion leaves `deleted_at` null
  - deleted proof cannot be viewed

No proof cleanup execution was run during this monitoring-only validation pass.

## 9. Admin Shell And Navigation

Automated validation and build output confirmed:

- `/app/admin/proof-cleanup` is present as an implemented route
- Proof Cleanup becomes available for operators with
  `operator.monitor_proof_cleanup`
- `operator.run_proof_cleanup` alone does not activate the read-only monitoring
  page
- `/app/admin/proof-cleanup` uses the shared AdminShell pattern
- Approved Domains, Reviewer Scopes, Audit Inspection, and Verification Review
  remain scoped to their existing authorization paths

This runtime pass did not use a browser-authenticated visual session for the
signed-in admin shell.

## 10. Tests And Validation

Validation run:

- `npx supabase db push --yes`
- `npx supabase migration list --linked`
- `node --test test/admin/proofCleanupMonitoring.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/admin/approvedDomains.test.mts test/admin/reviewerScopes.test.mts test/admin/verificationAudit.test.mts`
- `node --test test/ops/proofRetentionCleanupRoute.test.mts`
- `node --test test/verification/proofRetention.test.mts test/verification/proofAccess.test.mts test/verification/proofUpload.test.mts`
- `node --test test/security-events/securityEvents.test.mts test/security-events/verificationSecurityEvents.test.mts`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `git diff --check`

All automated validations passed after the migration apply. `npm run lint`
completed with existing unrelated warnings in the known lab/scroll files; those
warnings were not changed or fixed in this task.

## 11. Caveats

- Production deployment/runtime validation is separate if this was local/dev
  runtime only.
- No separate run-only operator grant existed in this linked runtime, so the
  `operator.run_proof_cleanup`-alone denial check remains source/test-covered.
- No manual cleanup controls were implemented.
- No community tools were implemented.
- No proof cleanup execution was run.
