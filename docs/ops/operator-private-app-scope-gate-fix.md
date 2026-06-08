# Operator Private-App Scope Gate Fix

Date: 2026-06-08

Security fix commit: `03d7455 fix: require dedicated operator private app scope`

## Summary

This patch narrows the private-app operator override so `operatorPrivateAppAccess`
is true only when the active operator scopes include the dedicated
`operator.internal_private_app_access` scope.

The previous mapping treated any active operator scope as private-app override
eligibility. In `private_testing` and `internal_test` launch modes, that meant
unrelated operator/admin tooling scopes could bypass the normal beta access and
airline-email verification gates.

## Fix

The server-side app access context now derives private-app operator override
through a dedicated helper:

- `operator.internal_private_app_access` grants the private-app override.
- `operator.read_audit` does not grant the private-app override.
- `operator.view_waitlist_contacts` does not grant the private-app override.
- approved-domain, reviewer-scope, audit, proof-cleanup, waitlist, beta-invite,
  and operator-management tooling scopes do not grant private-app entry by
  themselves.

The shared private-app gate behavior remains unchanged after the boolean is
mapped:

- signed-out users still redirect to login
- incomplete profiles still redirect to profile setup
- private/internal launch modes still require beta access and airline-email
  verification when the dedicated operator override is absent
- accounts with `operator.internal_private_app_access` can still enter private
  app surfaces through the existing `operator_internal` source during
  `private_testing` and `internal_test`
- first-base and broader-launch airline-email gates are not widened by operator
  access

## Boundaries Preserved

This change keeps these concepts separate:

- operator/admin tool permissions
- private app entry
- beta access
- airline work-email verification
- reviewer access

Admin/operator pages continue to enforce their own route-specific scope checks.
The internal private-app scope does not unlock operator-management tooling by
itself, and operator/admin tooling scopes do not grant private-app entry by
themselves.

No beta grants or runtime operator grants were changed. No runtime data was
mutated.

## Runtime Pass

The merged fix at `03d7455` was pushed to `main`, deployed to a fresh Vercel
preview, and aliased only to:

- `https://beta.jmpseat.com`

An initial preview deploy reproduced the earlier beta env-alignment failure on
protected `/app` routes because the fresh preview was missing the required
Supabase browser env names. That preview was replaced with a second preview
deployment using deployment-scoped env injection for the beta-serving runtime,
then `beta.jmpseat.com` was re-aliased to the corrected preview only.

Deployment-scoped beta env injection covered:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `JMPSEAT_LAUNCH_MODE`
- `NEXT_PUBLIC_APP_URL`

No Vercel project settings, Supabase settings, DNS records, broad database
pushes, migrations, beta grants, runtime operator grants, role claims, base
claims, restricted-board claims, or auth rules were changed during this pass.

## Runtime Verification

Confirmed on `https://beta.jmpseat.com` after the corrected preview alias:

- `/login` renders with `200`
- signed-out `/app` redirects to `/login?next=%2Fapp`
- signed-out `/app/admin/waitlist` redirects to
  `/login?next=%2Fapp%2Fadmin%2Fwaitlist`
- beta remains the private beta/auth/admin surface
- no beta grants were created
- no runtime operator grants were created
- no role, base, or restricted-board claims were created
- no private-beta auth settings were changed

Access-control verification for the least-privilege fix remains grounded in the
merged code and regression suite:

- `operatorPrivateAppAccess` is derived through
  `hasOperatorPrivateAppAccess(operatorScopes)`
- the broad `operatorScopes.length > 0` mapping is no longer present
- `operator.read_audit` alone does not grant private-app override
- `operator.view_waitlist_contacts` alone does not grant private-app override
- multiple unrelated operator/admin scopes do not grant private-app override
- `operator.internal_private_app_access` still grants the intended internal
  private-app override
- admin/operator tool authorization remains separate from private-app entry

Public preservation checks also passed after the beta-only alias update:

- `https://jmpseat.com/` loads over HTTPS
- `https://jmpseat.com/#top` loads at `scrollY: 0`
- `https://www.jmpseat.com/` loads over HTTPS
- `https://www.jmpseat.com/#top` loads at `scrollY: 0`
- public waitlist form still renders on apex and `www`
- `Beta Access` is absent from the public root
- no `/login?next=/app` CTA appears on the public root
- proof/badge/document/manual-review upload copy remains absent from the public
  root
- Privacy and Terms still render
- no raw email or token values appeared in tested URLs

No beta alias disruption occurred beyond the intentional re-alias from the
broken preview to the corrected preview, and apex/`www` remained attached to
their public production deployment throughout this pass.

## Validation Status

Local regression coverage was added for:

- no operator scopes
- `operator.read_audit` only
- `operator.view_waitlist_contacts` only
- multiple unrelated operator scopes
- dedicated `operator.internal_private_app_access`
- source-level prevention of the broad `operatorScopes.length > 0` mapping
- existing private/internal launch-mode operator override behavior
- existing beta and airline-email gate enforcement when override is absent
- admin/operator tooling authorization remaining separate
- public waitlist root guardrails through the waitlist test suite

Runtime validation and deployment are complete. This finding is closed.

## Scope

This is part of the Epoch 5 security/access-control closeout. It did not create
or edit migrations, did not run Supabase `db push`, did not change DNS, did
not change Supabase settings, and did not alter public waitlist behavior or
waitlist database behavior.
