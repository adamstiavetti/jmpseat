# E05-T04: Reviewer Scope Management Runtime Pass

Brand note: jmpseat is the canonical product and app name. This runtime proof
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Summary

Date: 2026-06-05

Commit validated:

- `add5d99 feat: add reviewer scope management`

Migration applied:

- `20260605213000_add_operator_managed_reviewer_scopes.sql`

The linked Supabase migration history is clean and the E05-T04 reviewer-scope
management migration is applied remotely.

The initial operator identity was validated for this runtime pass, but the
privileged operator UUID and email are intentionally redacted from committed
docs and handoff output.

## 2. Preflight

Preflight checks confirmed:

- local branch was clean on `main` before runtime validation docs were written
- the E05-T04 migration file existed locally
- the only pending local migration before apply was
  `20260605213000_add_operator_managed_reviewer_scopes.sql`
- required Supabase env names were present without printing values
- an active operator grant exists
- the active operator has `operator.manage_reviewer_scopes`

## 3. Route And RPC Authorization

Runtime checks confirmed:

- anonymous reviewer-scope list RPC access is safely denied
- in this linked runtime, the anonymous RPC call returned a structured
  `ok=false` authorization response instead of exposing reviewer-scope data
- a non-operator active-beta user cannot list reviewer-scope data
- the operator scope RPC reports `operator.manage_reviewer_scopes` for the
  validated operator
- `is_operator_with_scope('operator.manage_reviewer_scopes')` returns true for
  the validated operator
- an ungranted operator scope returns false
- no privileged operator identifiers were printed or committed

## 4. Historical Duplicate Safety

Runtime checks confirmed:

- the migration applied without failing on existing reviewer-scope data
- no duplicate active reviewer-scope groups remain under the unique key:
  `reviewer_id`, `scope_type`, and normalized `scope_value`
- the migration includes a one-time hygiene path that soft-revokes historical
  duplicate active rows before the unique partial index is created
- no destructive delete was needed for reviewer-scope history

## 5. Operator List And Search

Runtime checks confirmed:

- an authorized operator can list reviewer scopes
- an authorized operator can search/list the runtime-created reviewer scope
- revoked runtime reviewer-scope rows are visible through the operator path
- non-operators cannot list active or revoked reviewer-scope data through the
  operator RPC
- responses did not expose secrets or privileged internals

## 6. Grant And Revoke Flow

Runtime checks used safe existing dev-runtime users and did not print
privileged operator identifiers.

Runtime checks confirmed:

- granting reviewer scope succeeds for a non-self target user
- scope values are normalized and stored safely
- a duplicate active reviewer-scope grant returns a structured duplicate
  response
- self-grant is blocked
- revoking an active reviewer scope succeeds as a soft revoke
- the revoked reviewer scope no longer authorizes reviewer queue routing
- reviewer scope does not imply operator access
- operator scope does not imply reviewer queue access
- the existing reviewer queue remains reviewer-scope based

Self-revoke was not force-triggered by creating a temporary privileged-operator
reviewer scope, because doing so would briefly broaden reviewer access for the
privileged operator. Runtime validation confirmed there was no active self
reviewer-scope context to revoke, self-grant was blocked, and the automated
source tests cover the self-revoke denial branch.

## 7. Audit Behavior

Runtime checks confirmed persisted audit events for:

- `reviewer_scope.granted`
- `reviewer_scope.revoked`
- `reviewer_scope.unauthorized_attempt`

This task did not implement audit-inspection tooling.

## 8. Admin Shell And Navigation

Automated validation confirmed:

- `/app/admin` exposes Reviewer Scopes navigation only for operators with
  `operator.manage_reviewer_scopes`
- `/app/admin/reviewer-scopes` uses the admin shell pattern
- future operator sections remain disabled until their routes/tools are
  implemented
- `/app/admin/verification` remains reviewer-scope based and is not unlocked by
  operator scope alone

## 9. Tests And Validation

Validation run:

- `npx supabase db push --yes`
- `npx supabase migration list --linked`
- `node --test test/admin/reviewerScopes.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/admin/approvedDomains.test.mts`
- `node --test test/verification/review.test.mts test/verification/claimsAuth.test.mts`
- `node --test test/security-events/securityEvents.test.mts test/security-events/verificationSecurityEvents.test.mts`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `git diff --check`

All automated validations passed. `npm run lint` completed with existing
unrelated warnings in the known lab/scroll files; those warnings were not
changed or fixed in this task.

## 10. Caveats

- Production deployment/runtime validation is separate if this was local/dev
  runtime only.
- No audit-inspection, cleanup-monitoring, or community tools were implemented.
- Self-revoke was validated through static/source tests and the no-active-self
  runtime context described above, rather than by temporarily granting reviewer
  access to the privileged operator.

