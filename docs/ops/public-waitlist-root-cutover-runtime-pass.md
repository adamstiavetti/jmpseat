# Public Waitlist Root Cutover Runtime Pass

Date: 2026-06-08

Cutover time: 2026-06-08 12:18:31 CDT

Commit deployed: `2cc1cc6 docs: record beta waitlist capture runtime pass`

Root target: `https://jmpseat.com`

Stable beta target preserved: `https://beta.jmpseat.com`

## Summary

The public waitlist root cutover is complete. The apex domain `jmpseat.com`
now serves the current public waitlist/marketing page from current `main`, and
`beta.jmpseat.com` remains the private beta/auth/admin surface.

Root waitlist email capture and optional survey persistence were runtime-tested
with a clearly marked founder-controlled test address, redacted from this note.
The test row and related survey row were cleaned up after verification.

After cutover, the founder initially saw a Safari `can't be found` style
browser error on `https://jmpseat.com`. Clearing the local Safari cache
resolved the issue, and the apex root then loaded normally. This indicates the
observed founder issue was local browser/cache state rather than a failed apex
cutover or broken root deployment.

Follow-up note: `www.jmpseat.com` was intentionally excluded during the apex
cutover because DNS was not ready at that time. It has since been configured and
smoke-tested in `public-waitlist-www-runtime-pass.md`.

## DNS And Vercel Readiness

Preflight confirmed:

- `jmpseat.com` public DNS resolves to Vercel at `76.76.21.21`
- Vercel no longer reports the apex root domain as misconfigured
- `www.jmpseat.com` did not resolve at apex cutover time and was not included in
  this cutover
- root production env names are present in Vercel, names only:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

No env values are recorded in this note.

## Deployment And Alias

Created production-target Vercel deployment:

- `https://jmpseat-6vu7ctlz6-adam-stiavetti-s-projects.vercel.app`

Aliased only:

- `https://jmpseat.com`

Preserved:

- `https://beta.jmpseat.com` remains aliased to the stable beta deployment
  `https://jmpseat-agm8yl7ta-adam-stiavetti-s-projects.vercel.app`

No alias was created for `https://www.jmpseat.com` during the apex cutover. The
`www` alias was added later after DNS readiness was confirmed.

## Root Smoke Test

Confirmed on `https://jmpseat.com`:

- page loads over HTTPS
- latest public waitlist copy appears
- `Beta Access` is absent
- no `/login?next=/app` CTA appears on the public page
- email-first waitlist form appears
- independence framing appears
- Privacy page loads
- Terms page loads
- Privacy and Terms show concrete effective dates
- social metadata points to `/jmpseat/social-preview.png`
- social preview asset is reachable and `1200 x 630`
- proof upload, badge upload, document upload, and manual-review copy are absent
- private beta auth/admin entry points and admin/operator language are absent
  from the public root page

The public page intentionally retains `private beta waitlist` wording as
waitlist positioning. It does not expose Beta Access or private-app entry from
the root page.

## Root Waitlist Capture

Using a clearly marked founder-controlled root launch test address, redacted
from this note:

- email capture succeeded
- visible success state appeared
- raw email was not placed in the URL
- no survey token appeared in the URL
- database verification confirmed exactly one normalized signup row for the test
  email
- duplicate submit was safe and idempotent at the database layer

## Optional Survey

Confirmed on root:

- optional survey appears only after email capture
- safe optional survey answers submitted successfully
- stored values matched the submitted safe answers
- no prohibited or sensitive fields were stored by the survey path
- post-submit URL did not include raw email or survey token values

## Beta Preservation

Confirmed after root cutover:

- `https://beta.jmpseat.com` still loads
- `/login` renders on beta
- signed-out `/app` redirects to `/login?next=/app`
- signed-out `/app/admin/waitlist` redirects to
  `/login?next=/app/admin/waitlist`
- beta remains on the private beta/auth/admin deployment alias

Root waitlist testing did not create beta grants, airline-email verification
mutations, role/base claims, restricted-board claims, or private beta auth
changes.

## Test Data Cleanup

Only clearly marked founder-controlled root launch test rows were cleaned up.

Cleanup summary:

- root launch waitlist test row matched by the dedicated root-launch runtime
  prefix was deleted after verification
- the related optional survey response row was removed through the existing
  signup-to-survey cascade

No normal waitlist rows were targeted or removed.

## Rollback Plan

Previous root alias/deployment target:

- no previous `jmpseat.com` alias was present in the Vercel alias list before
  cutover

Current root alias/deployment target:

- `jmpseat.com` -> `jmpseat-6vu7ctlz6-adam-stiavetti-s-projects.vercel.app`

Rollback steps if root needs to be removed from this deployment:

1. Keep `beta.jmpseat.com` untouched.
2. Re-alias `jmpseat.com` to a selected prior known-good deployment if one is
   chosen, or remove the `jmpseat.com` alias to return root to the pre-cutover
   unserved state.
3. Re-test `beta.jmpseat.com`, `/login`, `/app`, and `/app/admin/waitlist`.
4. Re-test root once the rollback target is confirmed.

## Validation

Passed before cutover:

- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `node --test test/admin/waitlistMetrics.test.mts`
- `node --test test/auth/authPages.test.mts test/auth/authRoutes.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

`npm run lint` passed with only the known unrelated warnings in the lab/scroll
files.
