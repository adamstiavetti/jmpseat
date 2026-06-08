# Security Events Trust Boundary Fix

Date: 2026-06-08

## Summary

This patch hardens the `security_events` audit boundary so normal authenticated
clients can no longer write directly to the trusted audit table or forge
privileged-looking operator/admin/security events.

The prior table policy allowed authenticated users to insert rows when
`user_id` was null or matched `auth.uid()`. After later migrations expanded the
event taxonomy, that policy meant a normal signed-in client could create rows
that looked like operator grants, reviewer-scope changes, verification review
decisions, proof-view events, proof-cleanup events, or audit-inspection events.

Those forged rows did not grant privileges, but they could pollute the trusted
operator/admin audit trail.

## Fix

The new migration removes direct authenticated inserts from
`public.security_events`:

- drops the broad authenticated insert policy
- revokes direct `insert` from `authenticated`
- revokes direct `insert` from `anon`
- leaves trusted server/service-role and security-definer database writers as
  the intended write path

The migration also adds an `event_producer` trust marker:

- existing rows at migration time are marked `legacy_unverified`
- future rows default to `trusted_server`
- trusted operator/admin audit views filter to `trusted_server` rows

This means a normal authenticated client cannot forge privileged audit rows by
choosing arbitrary `event_type`, `route`, `result`, or `metadata`.

## Trusted Audit Views

The migration updates operator-facing security/proof-cleanup audit readers so
they do not include `legacy_unverified` rows:

- `list_security_events_for_operator(...)`
- `get_proof_cleanup_monitoring_summary()`
- `list_proof_cleanup_failures_for_operator(...)`
- `list_proof_cleanup_events_for_operator(...)`

No client-safe telemetry table or RPC was added in this patch. The current app
does not have a public client-side `security_events` writer; app logging goes
through server-only code or security-definer database functions.

## App Server Logging

The server-side event recorder now writes through the service-role admin client
when configured. It still uses the existing sanitizer and fail-soft recording
helper, but it no longer depends on user-scoped direct inserts into
`security_events`.

Security-definer operator/admin RPCs continue to insert their audit rows inside
the database and receive the `trusted_server` default.

## Boundaries Preserved

This patch does not change:

- operator grants
- beta grants
- role claims
- base claims
- restricted-board claims
- waitlist database behavior
- public waitlist behavior
- private-app gate behavior
- proof upload or verification proof flows
- private beta auth settings

No runtime user records were changed.

## Validation Status

Regression coverage now proves:

- the trust-boundary migration removes direct authenticated inserts
- normal authenticated clients cannot keep using the previous broad insert
  policy
- trusted operator/admin audit views filter to `trusted_server`
- legacy unverified rows are excluded from trusted operator audit output
- server-side app logging uses trusted service-role insertion when configured
- existing security-event taxonomy, sanitization, audit inspection, proof
  cleanup monitoring, and manual cleanup tests still pass

## Runtime Pass

Runtime validation completed on 2026-06-08.

Security fix commit:

- `ba74e02 fix: harden security event trust boundary`

Migration apply:

- Applied only
  `supabase/migrations/20260608201541_harden_security_events_trust_boundary.sql`
  through the established single-migration SQL apply path.
- Marked only migration version `20260608201541` applied.
- Did not run broad Supabase `db push`.
- Existing remote migration-history drift remains acknowledged and was not
  widened by this pass.

Runtime database checks confirmed:

- `anon` cannot insert into trusted `security_events`.
- `authenticated` cannot insert into trusted `security_events`.
- `service_role` can insert trusted `security_events`.
- the table has no direct insert policy.
- `event_producer` defaults to `trusted_server` and is not nullable.
- existing rows are present as `legacy_unverified`.
- no rows use an unexpected producer marker.
- operator-facing audit/proof-cleanup readers filter on
  `event_producer = 'trusted_server'`.

Forgery checks confirmed normal authenticated clients cannot insert
privileged-looking rows for:

- `operator_access.granted`
- `operator_access.revoked`
- verification review/admin-looking events
- proof-view/proof-cleanup-looking events

The deployed server recorder path was verified with a benign malformed auth
callback on `https://beta.jmpseat.com/auth/callback`. The request redirected to
login as expected and created one trusted `auth.callback_resolved` audit row via
the server-side recorder path. No beta grants, operator grants, role claims,
base claims, restricted-board claims, or runtime user records were changed.

Deployment:

- Public production deployment:
  `jmpseat-enz7f7qv3-adam-stiavetti-s-projects.vercel.app`
- Public aliases explicitly assigned:
  `https://jmpseat.com`, `https://www.jmpseat.com`
- Beta preview deployment:
  `jmpseat-bufolvzub-adam-stiavetti-s-projects.vercel.app`
- Beta alias explicitly assigned:
  `https://beta.jmpseat.com`

Vercel deploys used deployment-scoped environment injection from the ignored
local env file without printing values. No DNS changes, Vercel project setting
changes, Supabase setting changes, or Supabase Auth setting changes were made.

Beta preservation checks confirmed:

- `https://beta.jmpseat.com/login` renders.
- signed-out `/app` redirects to login.
- signed-out `/app/admin/waitlist` redirects to login.
- `beta.jmpseat.com` remains the private beta/auth/admin surface.

Public preservation checks confirmed:

- `https://jmpseat.com` and `https://www.jmpseat.com` load over HTTPS.
- `/` and `/#top` load at `scrollY: 0` on both apex and `www`.
- public waitlist forms still render.
- Privacy and Terms pages return 200.
- no Beta Access entry is present.
- no `/login?next=/app` CTA is present.
- no proof/badge/document/manual-review upload copy is present.
- no raw email or token appears in the checked public URLs.

This finding is part of the Epoch 5 security/access-control closeout.

Status: closed.
