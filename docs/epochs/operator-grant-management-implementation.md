# Operator Grant Management Implementation

## Summary

This change adds a controlled post-bootstrap operator-grant management path for jmpseat.

The goal is to let an already-authorized operator grant the minimal internal
private-app access to another existing account after the one-time
`/api/ops/operator-bootstrap` path is closed.

This implementation does not create public self-service operator requests, does
not widen normal user access, and does not rely on `jmpseat.com` as fake
airline eligibility.

## Why Bootstrap Is Not Enough

The existing bootstrap route is intentionally first-operator-only.

Once any active operator grant exists in the runtime:

- `/api/ops/operator-bootstrap` must return closed
- later operator grants must come from an authenticated operator path
- founder/admin/internal access needs a normal operator-managed grant flow

Without a post-bootstrap management path, the runtime can end up with a valid
operator foundation but no safe way to align a founder/admin account after the
initial bootstrap window has passed.

## Access Model

This implementation reuses the existing `public.operator_grants` model and the
existing authenticated `grant_operator_access(...)` RPC.

It adds one new minimal scope:

- `operator.internal_private_app_access`

That scope exists only to mark an account as explicitly internal for the
private-app gate. It does not, by itself, unlock approved-domain management,
reviewer-scope management, audit inspection, proof cleanup tooling, or beta
invite tooling.

## Management Path

The management path is:

- existing operator only
- server-side only
- authenticated through the normal Supabase session
- authorized by `operator.manage_operator_access`
- audited through the existing `grant_operator_access(...)` RPC and bounded
  route-level security events

The UI lives under the existing admin/operator shell:

- `/app/admin/operator-access`

The form accepts:

- target login email
- optional operator reason

The email is resolved to a user id server-side through the storage-admin client.
If the runtime wrapper does not support a direct filtered email lookup, the
lookup pages through Supabase Auth users until exhaustion rather than stopping
at an arbitrary fixed cap. The app does not expose auth user UUID entry in the
operator UI.

## Scope Granted

This path grants only:

- `operator.internal_private_app_access`

That keeps founder/admin internal app access separate from broader operator-tool
authorization.

## Security And Audit Boundaries

This implementation:

- requires an already-active operator with `operator.manage_operator_access`
- does not allow non-operators to grant access
- does not create a public route or public self-service flow
- records bounded route-level unauthorized attempts
- relies on the existing audited `grant_operator_access(...)` RPC for the
  actual grant record
- resolves target accounts without a fixed 2,000-user lookup ceiling
- does not log or redirect with full private emails
- does not expose privileged operator UUIDs or private auth identifiers in UI
  copy, redirects, or route-level audit metadata

The private-app gate and route audit metadata remain separate and continue to
mark internal entry with:

- `access_source: operator_internal`
- `operator_private_app_access: true`

## What This Does Not Do

This path does **not**:

- grant beta access
- mark the account as `airline_email_verified`
- create airline-worker eligibility
- issue role claims
- issue base claims
- issue restricted-board claims
- implement work-email code fallback
- implement baseboards, community features, or public operator requests
- reintroduce proof upload, badge upload, document upload, or proof review

## Migration

This implementation adds one migration:

- `20260606203000_add_operator_internal_private_app_access_scope.sql`

It extends the allowed operator scope list with:

- `operator.internal_private_app_access`

No applied migration was edited.

## Runtime Follow-Up

Runtime validation is still pending after review/merge.

The runtime proof was later blocked during preflight because the original
operator grant/revoke audit metadata included raw target user identifiers in
general security-event metadata. The narrow redaction follow-up is documented in:

- `docs/ops/operator-grant-audit-metadata-redaction.md`

Apply that redaction migration before rerunning the runtime proof.

That runtime pass should confirm:

- an existing operator can grant the new internal scope through
  `/app/admin/operator-access`
- the founder/admin target account can enter `/app` through
  `operator_internal`
- the target account still has no beta grant
- the target account is still not `airline_email_verified`
- no role/base/restricted-board claims are issued
- the temporary `jmpseat.com` approved-domain workaround can be cleaned up
  after this path is proven in runtime
