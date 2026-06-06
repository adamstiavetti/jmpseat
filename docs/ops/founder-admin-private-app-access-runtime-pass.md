# Founder/Admin Private-App Access Runtime Pass

Date: 2026-06-06

## Summary

This runtime pass verified the founder/admin internal private-app access path
after `ad9b7e4 feat: add operator grant management`.

The pass applied the merged operator-scope migration and aligned the intended
founder/admin account with explicit operator access. No target email, auth user
identifier, secret value, or other private identifier is included in this note.

## Migration

Applied remotely:

- `20260606203000_add_operator_internal_private_app_access_scope.sql`

Confirmed runtime state:

- migration is recorded in the linked Supabase migration history
- `operator.internal_private_app_access` is available through
  `public.operator_scope_values()`

## Grant Alignment

The intended founder/admin account was found in Supabase Auth and aligned with
an active explicit operator grant.

Granted scopes:

- `operator.internal_private_app_access`
- `operator.manage_operator_access`

The grant alignment used a controlled service-role/admin runtime alignment
because no live existing-operator browser session was available in this thread.
The resulting state is still represented through the existing
`public.operator_grants` source of truth.

## Verification

Safe boolean checks confirmed:

- founder/admin account exists in Supabase Auth
- active operator grant exists
- `operator.internal_private_app_access` is active
- `operator.manage_operator_access` is active
- profile is complete
- private-app gate should resolve as `operator_internal` for an authenticated
  founder/admin session on `beta.jmpseat.com`
- route-level operator grant audit event was recorded
- `beta.jmpseat.com/app/admin/operator-access` exists and protects
  unauthenticated access through the login flow

## Boundaries Preserved

This runtime pass did not:

- grant beta access
- mark the account as `airline_email_verified`
- issue role claims
- issue base claims
- issue restricted-board claims
- change work-email confirmation behavior
- implement work-email code fallback
- reintroduce proof upload, badge upload, document upload, or proof review
- disable the temporary `jmpseat.com` approved-domain test state

## Remaining Manual Step

Founder manual browser login at the stable beta domain remains the next step.
The founder should use the `Beta Access` entry and proceed to `/app` after
login.

Expected result after login:

- the account can enter `/app` through the `operator_internal` source
- normal beta, airline-email, launch-mode, and community gate behavior remains
  unchanged for non-operator users
