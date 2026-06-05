# E05 Operator Grants Foundation

Brand note: jmpseat is the canonical product and app name. This implementation note does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Scope

This ticket implements the minimum operator authorization substrate required before E05-T03 Approved Email Domain Management.

Delivered in this slice:

- `operator_grants` database foundation.
- Bounded operator scope list and database constraints.
- `current_user_operator_scopes()` and `is_operator_with_scope(...)` helper functions.
- Narrow grant/revoke RPC foundation for explicit operator access.
- Atomic, service-role-only bootstrap RPC plus one-time protected operator
  bootstrap endpoint for the zero-grant state.
- Admin-shell integration that reads operator scopes but keeps unimplemented
  operator-only sections disabled until their routes/tools are built.

Not delivered in this slice:

- No approved-domain management UI or data-management surface.
- No reviewer-scope management UI.
- No audit inspection UI.
- No proof cleanup monitoring UI.
- No operator self-service management UI.

## 2. Migration

Migration created:

- `supabase/migrations/20260605113000_create_operator_grants_foundation.sql`

This migration adds:

- `public.operator_grants`
- operator-scope helper functions
- grant/revoke RPCs
- operator security-event taxonomy extension

The migration does not seed or hard-code any operator user. The first operator
grant is created through the protected bootstrap endpoint below, then normal
grant/revoke operations require `operator.manage_operator_access`.

Grant/revoke RPCs return structured JSON for expected outcomes:

- `ok`
- `code`
- `operator_grant_id`
- `message`

Expected denials insert `operator_access.unauthorized_attempt` and return
`ok=false` with a stable `code`. They do not insert an audit row and then
`raise exception`, because PostgreSQL would roll back the audit insert with the
rest of the function transaction. Unexpected database or integrity failures may
still raise, but expected authorization and state denials are return values so
their audit rows can persist.

## 3. Operator Access Rules

Operator access is:

- explicit
- database-backed
- scope-based
- revocable
- separate from reviewer scope
- separate from beta access
- separate from profile text
- separate from verification claims
- checked server-side

Active operator access depends on:

- an active `operator_grants` row
- a valid scope in `scopes`
- no revoked state for the active row

## 4. Scope List

The minimum scope set implemented here is:

- `operator.read_audit`
- `operator.manage_approved_domains`
- `operator.manage_reviewer_scopes`
- `operator.read_verification_requests`
- `operator.monitor_proof_cleanup`
- `operator.run_proof_cleanup`
- `operator.manage_operator_access`

## 5. Self-Escalation Boundaries

This slice blocks:

- self-grant
- self-revoke
- invalid requested scopes
- operator grant inference from reviewer scope
- operator grant inference from verification claims
- operator grant inference from beta access
- operator grant inference from profile text or work email

## 6. Initial Operator Bootstrap

Route added:

- `POST /api/ops/operator-bootstrap`

The route is intentionally separate from the normal grant RPC so the runtime
grant/revoke path can continue blocking self-grants while still avoiding a
zero-grant bootstrap deadlock.

Bootstrap rules:

- requires server-only `OPERATOR_BOOTSTRAP_SECRET`
- requires the `x-jmpseat-operator-bootstrap-secret` request header
- does not accept secrets from query strings
- requires a valid `target_user_id`
- uses the existing service-role Supabase client only on the server
- calls `bootstrap_operator_access(...)`, which locks `operator_grants` before
  checking for existing active grants to avoid first-bootstrap races
- creates a grant only when zero active operator grants exist
- grants the full initial bootstrap scope set so the trusted operator can later
  move access into narrower grants
- records `operator_access.granted` metadata when audit infrastructure is
  available
- returns a safe summary only and does not expose privileged records
- closes permanently once any active operator grant exists

After bootstrap succeeds, remove or rotate the bootstrap secret. Later operator
changes should use `grant_operator_access(...)` and `revoke_operator_access(...)`
with `operator.manage_operator_access`.

## 7. Admin Shell Integration

The admin shell now treats operator-only sections as:

- unavailable by default when no explicit matching operator scope exists
- authorized-but-unimplemented when the current user has the required explicit
  operator scope but the route/tool has not been built yet
- linkable only when the route/tool itself exists

Reviewer behavior remains unchanged:

- `/app/admin/verification` still uses reviewer authorization
- reviewer scope does not imply operator/admin access
- `/app/admin/verification` now passes explicit operator scopes into the shared
  admin navigation after reviewer authorization succeeds, so navigation state is
  consistent with `/app/admin` without broadening queue access.

Operator scope authorization is deliberately separate from tool implementation.
For this foundation slice, Approved Domains, Reviewer Scopes, Audit Inspection,
and Proof Cleanup remain disabled even when the current user has matching
operator scopes. Their navigation state may explain that the operator is
authorized, but the shell must not link to missing `/app/admin/...` pages until
the relevant later Epoch 05 ticket implements that route/tool.

## 8. What Remains For E05-T03

E05-T03 Approved Email Domain Management still needs:

- bounded approved-domain list/read surface
- create/update/disable actions
- operator-route protection using `operator.manage_approved_domains`
- runtime validation docs for the approved-domain workflow

E05-T03 should start only after this foundation is reviewed/merged and the
migration/runtime bootstrap handling is completed for the target Supabase
environment.

## 9. Source-Of-Truth Status

This document records the operator grants foundation implementation outcome.

No Supabase `db push`, production commands, or secrets are part of this ticket.
