# Operator Grants Bootstrap Runtime Pass

## Purpose

This artifact records that the Epoch 05 operator grants foundation was applied
to the linked Supabase runtime and that the protected first-operator bootstrap
route completed successfully.

This pass confirms:

- the operator grants migration is applied remotely
- `/api/ops/operator-bootstrap` rejects unsafe or unauthorized requests
- the explicitly selected first operator received one active bootstrap grant
- the second bootstrap request is denied after the first active grant exists
- future operator admin sections remain disabled until their tools are built

## Runtime Environment

- date: 2026-06-05
- repo path: `/Users/ClawdBot/jmpseat`
- commit present:
  - `bec65cd feat: add operator grants foundation`
- migration applied:
  - `20260605113000_create_operator_grants_foundation.sql`
- selected target user:
  - explicitly selected initial operator account; exact auth UUID redacted from committed docs
- target selection:
  - explicitly selected by the user after candidate discovery
- `.env.local` was ignored
- no environment values or secrets are included in this artifact
- no Supabase `db push` was run during this bootstrap proof task
- no production deployment was run

## Migration State

`npx supabase migration list --linked` showed matching local and remote history
through:

- `20260605113000`

Before bootstrap, the linked database had:

- active operator grants: `0`
- selected target existed: `yes`
- selected target active operator grant: `no`

## Negative Route Checks

Route tested:

- `/api/ops/operator-bootstrap`

Denied checks:

- `GET /api/ops/operator-bootstrap` returned `405`
- `POST /api/ops/operator-bootstrap` without `x-jmpseat-operator-bootstrap-secret` returned `401`
- `POST /api/ops/operator-bootstrap` with a wrong secret header returned `401`
- `POST /api/ops/operator-bootstrap?secret=wrong-secret` returned `401`
- `POST /api/ops/operator-bootstrap` with a valid header and invalid target body returned `400`

Denied responses were small summary responses and did not include:

- secrets
- session data
- service-role keys
- stack traces
- privileged database rows

The query-string check used a non-secret placeholder value. The route did not
accept query-string authorization.

## Positive Bootstrap Result

Authorized route call:

- `POST /api/ops/operator-bootstrap`
- header:
  - `x-jmpseat-operator-bootstrap-secret`
- body:
  - `target_user_id = [redacted-initial-operator-user-id]`

Response:

- status: `200`
- body shape:
  - `ok = true`
  - `status = active`
  - `grantedScopeCount = 7`

The response was summary-only and did not expose secrets or privileged internals.

## Created Operator Grant

After bootstrap, the linked database had:

- active operator grants: `1`
- selected target active operator grant: `yes`
- selected target scope count: `7`
- selected target scopes matched expected bootstrap set: `yes`

Expected bootstrap scopes confirmed:

- `operator.manage_operator_access`
- `operator.read_audit`
- `operator.manage_approved_domains`
- `operator.manage_reviewer_scopes`
- `operator.read_verification_requests`
- `operator.monitor_proof_cleanup`
- `operator.run_proof_cleanup`

The selected target did not receive reviewer scope as part of operator
bootstrap.

## Second Bootstrap Denial

A second authorized bootstrap request was sent after the first active operator
grant existed.

Response:

- status: `409`
- body shape:
  - `ok = false`
  - `error = Operator bootstrap is closed.`

Post-check:

- active operator grants remained `1`
- no second active grant was created
- response did not expose secrets or privileged internals

The current implementation returns a safe closed response for second bootstrap
attempts. It does not add a separate closed-bootstrap audit event.

## Operator Scope Behavior

Runtime database checks confirmed:

- selected target has an active operator grant
- selected target has `operator.manage_operator_access`
- selected target does not have a made-up ungranted scope
- reviewer account active operator grant count is `0`
- reviewer account active reviewer scope count is `1`
- selected target reviewer scope count is `0`

This confirms:

- operator access does not imply verification reviewer queue access
- reviewer scope does not imply operator access

RPC structured-denial check:

- `grant_operator_access(...)` returned structured `ok=false` for a safe no-session denial path
- `revoke_operator_access(...)` returned structured `ok=false` for a safe no-session denial path

The full authenticated non-operator denial paths are covered by migration and
unit tests. This runtime pass did not mint a non-operator user session for
additional denial attempts.

## Audit Behavior

The bootstrap grant audit event persisted:

- event type: `operator_access.granted`
- route: `/api/ops/operator-bootstrap`
- result: `granted`
- target user metadata matched the explicitly selected initial operator account

No secrets, URLs, storage paths, sessions, or service-role values were recorded
in this runtime proof.

## Admin Shell And Navigation Behavior

Local runtime without a signed-in session confirmed protected route behavior:

- `/app/admin` redirected to login
- `/app/admin/verification` redirected to login

Shared admin navigation logic confirmed:

- future operator sections remain disabled even when matching operator scopes exist
- `/app/admin/verification` remains reviewer-scope based
- verification nav state is consistent between admin shell contexts

The pass did not use a browser-authenticated session for visual inspection of
the signed-in admin shell.

## Validation Commands

Runtime route checks were followed by:

- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/verification/review.test.mts test/verification/claimsAuth.test.mts`
- `node --test test/security-events/securityEvents.test.mts test/security-events/verificationSecurityEvents.test.mts`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `git diff --check`
- `git status --short --branch`

Known lint warnings remained unrelated:

- `app/lab/live-globe-proof/page.tsx`
- `src/lib/scroll/heroFlightControl.ts`

## Caveats

- `OPERATOR_BOOTSTRAP_SECRET` should be removed or rotated after first bootstrap.
- Production deployment/runtime validation is separate from this local dev route
  pass against the linked Supabase runtime.
- No approved-domain management was implemented.
- No reviewer-scope management was implemented.
- No audit inspection was implemented.
- No cleanup monitoring was implemented.
- E05-T03 remains the next implementation slice for approved email domain
  management.
