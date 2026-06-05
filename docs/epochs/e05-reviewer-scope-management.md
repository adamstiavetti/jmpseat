# E05-T04: Reviewer Scope Management

Brand note: jmpseat is the canonical product and app name. This implementation
note does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Scope

This ticket implements operator-controlled reviewer-scope management for the
existing verification review queue.

Delivered in this slice:

- operator-only `/app/admin/reviewer-scopes`
- audited operator RPCs for reviewer-scope list/grant/revoke
- server-only reviewer-scope action layer
- reviewer-scopes navigation activation for authorized operators
- self-grant and self-revoke protections
- preservation of the existing reviewer queue authorization model

Not delivered in this slice:

- no audit inspection UI
- no cleanup monitoring UI
- no reviewer policy expansion beyond the existing scope model
- no verification claim issuance rule changes
- no community, rooms, posts, or moderation work

## 2. Migration

Migration created:

- `supabase/migrations/20260605213000_add_operator_managed_reviewer_scopes.sql`

This migration adds:

- soft-revoke tracking columns on `verification_reviewer_scopes`
- one-time migration hygiene that resolves pre-existing duplicate active
  reviewer scopes before adding the unique active-scope guard
- a partial unique active-scope index for duplicate active reviewer-scope
  prevention
- reviewer-scope input normalization helpers
- `list_verification_reviewer_scopes_for_operator()`
- `grant_verification_reviewer_scope(...)`
- `revoke_verification_reviewer_scope(...)`
- reviewer-scope security-event taxonomy extension

The migration does not redefine `can_review_verification_request(...)` and does
not broaden the reviewer queue read/update policies. Existing reviewer
authorization continues to depend on active reviewer scopes only.

If historical data contains duplicate active rows for the same reviewer,
scope type, and normalized scope value, the migration keeps the earliest
created row active and soft-revokes the remaining duplicates before creating
the unique partial index. The cleanup preserves rows instead of deleting them,
sets `revoked_at`, leaves `revoked_by` empty because there is no safe operator
actor for migration hygiene, and does not create audit events for historical
cleanup.

## 3. Operator Authorization

Required scope:

- `operator.manage_reviewer_scopes`

Authorization behavior:

- no operator grant means no access
- reviewer scope alone does not imply operator access
- beta access, verification claims, work email, login email, and profile text
  do not imply reviewer-scope management access
- operator access alone does not imply verification reviewer queue access
- missing or failing operator-scope readiness RPCs are treated as tool
  setup/not-ready, not unauthorized access
- the private-app gate runs before the reviewer-scope config fallback is
  rendered
- the page redirects true missing-scope users to `/app/access-restricted`
- the operator RPCs also enforce `operator.manage_reviewer_scopes`

## 4. Reviewer-Scope Behavior

The operator tool supports:

- listing reviewer scopes with bounded metadata
- simple server-side search by reviewer id, scope type/value, or status
- granting reviewer scope
- revoking reviewer scope through soft status change

The existing scope model is preserved:

- `global`
- `airline`
- `role`
- `base`

Safety rules:

- target auth user UUID is required for grants
- scope type is constrained to the existing model
- non-global scopes require a normalized lowercase scope value
- global scopes store no scope value
- duplicate active reviewer scopes are blocked
- self-grant is blocked
- self-revoke is blocked in this slice
- revoke requires an active scope
- revoke updates status to `revoked`; it does not delete rows
- historical verification requests, evidence, claims, and review actions are
  untouched

## 5. Audit Events

This slice adds:

- `reviewer_scope.granted`
- `reviewer_scope.revoked`
- `reviewer_scope.unauthorized_attempt`

Successful grant/revoke operations are audited by the RPC layer. True
unauthorized/missing-operator-scope attempts are audited before returning
structured denial responses or redirecting from the route.

Expected validation failures such as malformed target ids, invalid scope input,
duplicate active scope, and inactive revoke targets return safe structured
responses and are not mislabeled as operator authorization failures.

## 6. Admin Route

Route added:

- `/app/admin/reviewer-scopes`

Navigation behavior now becomes:

- Reviewer Scopes: linkable only for operators with
  `operator.manage_reviewer_scopes`
- Approved Domains: still linkable only for operators with
  `operator.manage_approved_domains`
- Verification Review: still reviewer-scope based
- Audit Inspection and Proof Cleanup: still disabled until later Epoch 05
  tickets implement those tools

## 7. What Remains For E05-T05

The next operator/admin tooling ticket is E05-T05 Verification Audit Inspection.

That slice still needs:

- metadata-only audit/security-event inspection tooling
- bounded operator route authorization for audit reads
- audit-inspection runtime proof

Cleanup monitoring remains a later Epoch 05 task and is not implemented here.

## 8. Runtime Follow-Up

Runtime validation is complete and recorded in:

- `docs/ops/reviewer-scope-management-runtime-pass.md`

The linked Supabase migration history is clean and
`20260605213000_add_operator_managed_reviewer_scopes.sql` is applied remotely.

Runtime proof verified:

- migration applies cleanly
- authorized operators can list/grant/revoke reviewer scopes
- self-grant denial was exercised safely at runtime
- duplicate active reviewer scopes are denied safely
- revoked scopes no longer authorize reviewer queue access
- reviewer-scope audit events persist
- reviewer scope does not imply operator access
- operator scope does not imply reviewer queue access

Implementation and automated tests also confirm self-grant/self-revoke
protections exist in this slice.

Runtime validation did not force a live self-revoke, because doing so would
have required temporarily granting reviewer access to the privileged operator.
The runtime pass confirmed there was no active self reviewer-scope context, and
the source/automated tests cover the self-revoke denial branch.

## 9. Source-Of-Truth Status

This document records the E05-T04 implementation and runtime-validation
outcome.

No production commands, deployments, or secrets are part of this ticket.
