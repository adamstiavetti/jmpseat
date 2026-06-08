# Founder Waitlist Dashboard Access Runtime Pass

Date: 2026-06-07

Stable beta target: `https://beta.jmpseat.com`

## Summary

This runtime pass aligned the founder/admin operator grant with the waitlist
metrics dashboard requirement. The founder/admin account already had explicit
operator access for internal private-app entry and operator grant management,
but it did not yet have `operator.read_audit`, which is the existing scope used
by `/app/admin/waitlist`.

The alignment granted only `operator.read_audit` through the existing
`public.operator_grants` source of truth. No private email, auth user UUID,
operator UUID, secret, token, invite code, or survey token value is included in
this note.

## Scope Check

Safe boolean checks before alignment confirmed:

- founder/admin account exists in Supabase Auth
- active operator grant exists
- `operator.internal_private_app_access` was active
- `operator.manage_operator_access` was active
- `operator.read_audit` was missing

## Scope Alignment

Runtime action:

- added only `operator.read_audit` to the existing active founder/admin
  operator grant
- preserved the existing grant row and audit/history rows
- recorded a bounded `operator_access.granted` security event for the waitlist
  dashboard access alignment
- audit metadata used safe summary fields and did not include raw private
  identifiers

Post-alignment safe checks confirmed:

- active operator grant still exists
- `operator.internal_private_app_access` remains active
- `operator.manage_operator_access` remains active
- `operator.read_audit` is now active
- `/app/admin/waitlist` should pass for the founder/admin account

## Runtime Verification

Stable beta checks confirmed:

- unauthenticated `/app/admin/waitlist` requests still redirect to login
- the founder/admin browser session now renders `/app/admin/waitlist`
- the dashboard path did not redirect to `/app/access-restricted`
- the dashboard path did not redirect to `/app/access-hold`
- dashboard summary cards render
- waitlist survey metrics render
- recent submissions render
- email-like dashboard values are masked
- no UUID-like values were rendered in the dashboard text scan
- no explicit token values were rendered in the dashboard text scan

The dashboard safety copy can mention survey tokens as a category that is not
rendered; no survey token value was exposed.

## Boundaries Preserved

This runtime pass did not:

- grant beta access
- mark the account as `airline_email_verified`
- issue role claims
- issue base claims
- issue restricted-board claims
- change work-email verification behavior
- change beta invite behavior
- change private beta app gates
- reintroduce proof upload, badge upload, document upload, or proof review
- implement baseboards or community features

Founder/admin internal access remains explicit operator access and remains
separate from airline employee email eligibility.

## Follow-Up

The `/app/access-restricted` page copy is stale for non-reviewer admin surfaces:
it still references the older Epoch 04 reviewer framing even though newer admin
surfaces now include operator grant management, audit inspection, proof cleanup,
and waitlist metrics. Fix this in a separate UI polish task so restricted admin
denials use neutral operator/admin copy instead of verification-reviewer-only
language.

## Validation

Passed:

- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/waitlistMetrics.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `git diff --check`
