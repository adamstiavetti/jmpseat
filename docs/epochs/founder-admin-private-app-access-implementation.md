# Founder/Admin Private-App Access Implementation

## Summary

This change adds a proper internal private-app access path for explicitly authorized founder/admin/operator accounts during `private_testing` and `internal_test`.

The goal is to let internal operators enter the locked private app shell for founder/admin testing without pretending they are airline-worker eligible and without relying on `jmpseat.com` as a fake approved airline domain.

No migration was needed. The implementation reuses the existing explicit operator-grant foundation as the source of truth.

## Why This Exists

`jmpseat.com` is currently active as a temporary test-only approved work-email domain so founder testing could move forward while the stable beta/auth path was being validated.

That is not the correct long-term founder/admin access model because:

- founder/admin/operator access is operational access, not airline-worker eligibility
- approved airline employee email remains the normal user eligibility credential
- internal access should be explicit, auditable, and revocable through existing operator-grant controls

## Access Model

The source of truth remains the existing `public.operator_grants` foundation and the `current_user_operator_scopes()` RPC.

The app now derives `operatorPrivateAppAccess` from an active explicit operator grant:

- any active operator grant counts as explicit internal/operator authorization
- reviewer scopes alone do not count
- beta access records do not count
- airline-email verification state does not count
- profile text or claims do not count

This keeps the allowance explicit and auditable without introducing a new founder-only backdoor, hard-coded email list, or public self-request flow.

Private-app access events now carry safe metadata that distinguishes:

- `access_source: normal_gate`
- `access_source: operator_internal`

This keeps internal/operator entry reconstructable from audit logs without exposing privileged operator identifiers, raw scope lists, or private emails.

## Gate Behavior

Normal users keep the current gate rules exactly:

- `private_testing` and `internal_test` still require auth, completed profile, airline-email eligibility, and beta access
- `first_base_launch` and `broader_launch` still require auth, completed profile, and airline-email eligibility while beta is bypassed

Internal/operator users now get one narrow exception:

- if the account has explicit operator access, private-app entry is allowed during `private_testing` and `internal_test`
- this bypass is limited to app entry and placeholder-shell access
- it does not broaden access for normal users
- it does not change `first_base_launch` or `broader_launch`

## Airline-Email Separation

This path does **not**:

- mark the account as `airline_email_verified`
- create airline-worker eligibility
- grant beta access globally
- issue role claims
- issue base claims
- issue restricted-board access

`getCurrentAirlineEmailAccessState()` remains unchanged. Internal/operator access is separate metadata carried into the private-app gate, not a mutation of the airline-email state.

## Access-Hold And Placeholder Behavior

The access-hold page remains honest:

- operator/internal users are redirected away from access-hold back to `/app`
- the beta invite redemption form is not shown for operator/internal access
- invite codes still remain for verified airline-eligible users only

The root private-app placeholder now shows a distinct internal-access message for operator accounts so the UI does not imply airline-worker verification or general beta approval.

## Audit Metadata

Private-app access events now preserve the access source in metadata:

- normal eligibility success records `access_source: normal_gate`
- operator internal success records `access_source: operator_internal`
- operator internal success may also record the boolean marker `operator_private_app_access: true`

No operator UUID, email, or raw scope details are exposed in this metadata.

## What Stayed Out Of Scope

This implementation does not:

- disable `jmpseat.com` yet
- implement work-email code fallback
- grant founder/admin bypass through a public UI
- create board, baseboard, membership, posting, or restricted-board access
- reintroduce badge upload, proof upload, document upload, or proof review

## Runtime Follow-Up

Runtime validation is still pending after review/merge.

That runtime pass should confirm:

- an explicitly granted operator account can enter `/app` in `private_testing`
- the account is still not treated as airline-email verified
- normal users remain bound to the existing beta and airline-email gates
- `jmpseat.com` can later be removed as a temporary founder test domain without breaking founder/admin internal access
