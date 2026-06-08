# Beta Vercel Env Scoping

Date: 2026-06-08

## Purpose

Record the persistent Vercel environment-variable strategy for the
`beta.jmpseat.com` private beta/auth/admin surface.

This runbook exists because multiple beta preview deployments previously needed
deployment-scoped Supabase env injection. When those preview deployments were
created without the required Supabase names, protected private-app routes could
return configuration failures instead of normal signed-out redirects.

## Root Cause

The linked Vercel project is CLI/manual-deploy driven, not Git-connected.

Before this pass:

- Public apex and `www` used the Vercel Production environment.
- `beta.jmpseat.com` was aliased to a Vercel Preview deployment.
- The required Supabase browser/server env names existed for Production.
- The required Supabase browser/server env names did not exist for Preview.
- Prior beta deploys worked only when the deploy command injected the Supabase
  values directly for that deployment.

That meant a normal Preview deployment could build and receive the beta alias
without the env names that `/login`, `/app`, and admin/auth surfaces require.

## Required Names

The persistent Preview environment now includes these required names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Values are intentionally not recorded in this repo, terminal summaries, or ops
handoffs.

## Persistent Fix

The three required Supabase names were added to the Vercel Preview environment
as encrypted project env vars.

The Vercel CLI currently asks for a Preview Git branch even though the project
is not Git-connected. Branch-scoped Preview env creation therefore fails for
this project. The persistent fix was applied through Vercel's project env API
with `target: ["preview"]`, using values from the ignored local env source and
printing only env names/status.

No DNS, Supabase settings, database state, beta grants, role/base claims, or
private beta auth settings were changed.

## Safe Beta Deploy Process

Use this flow for future beta deploys from reviewed `main`:

1. Confirm the Preview env names are present in Vercel by name only.
2. Create a normal Preview deployment without deployment-scoped Supabase env
   injection.
3. Explicitly alias only `beta.jmpseat.com` to the reviewed Preview deployment.
4. Inspect aliases after the move:
   - `jmpseat.com` remains on the public Production deployment.
   - `www.jmpseat.com` remains on the public Production deployment.
   - `beta.jmpseat.com` points to the intended Preview deployment.
5. Smoke-test beta without mutating runtime data:
   - `/login` returns `200`.
   - signed-out `/app` redirects to `/login?next=%2Fapp`.
   - signed-out `/app/admin/waitlist` redirects to
     `/login?next=%2Fapp%2Fadmin%2Fwaitlist`.

Do not use deployment-scoped Supabase env injection for the three required
names unless the persistent Preview envs are later removed or broken.

## Runtime Verification

After adding the persistent Preview envs, a normal Preview deploy was created
without manual Supabase env injection and only `beta.jmpseat.com` was aliased to
it.

Verification passed:

- `https://beta.jmpseat.com/login` returned `200`.
- signed-out `/app` redirected to beta login.
- signed-out `/app/admin/waitlist` redirected to beta login.
- No missing-Supabase-env `503` was observed.
- `jmpseat.com` and `www.jmpseat.com` remained on the public Production
  deployment.
- Public apex and `www` returned `200`.
- Public launch constraints remained intact: no Beta Access entry, no
  `/login?next=/app` public CTA, no proof/badge/document/manual-review upload
  copy, and the waitlist form still rendered.

No waitlist rows were submitted, no proof files were uploaded, and no runtime
data was intentionally mutated.

## Remaining Caveats

The current fix covers the required Supabase env names that caused beta preview
deployments to lose Supabase runtime configuration.

Other beta runtime settings, such as app URL or launch-mode names, remain
separate deployment/configuration concerns and should be checked by name when a
task specifically depends on those flows.

Future ops maturity should decide whether to keep the current CLI/manual-deploy
model, connect the project to Git for clearer branch/environment semantics, or
split public and beta into separate Vercel projects. A separate beta/staging
project could become cleaner if beta needs materially different release
controls, env ownership, or automated promotion semantics. No Git connection or
separate project was created in this pass.
