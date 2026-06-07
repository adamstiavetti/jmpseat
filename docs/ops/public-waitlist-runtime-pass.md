# Public Waitlist Runtime Pass

Date: 2026-06-07

Baseline commit: `4e68569 feat: add first party waitlist capture`

Stable beta target: `https://beta.jmpseat.com`

## Summary

The first-party public waitlist capture path was runtime-validated on the stable
beta target. The merged waitlist migration was applied to the linked Supabase
runtime, stable beta was updated to serve current `main`, and the public page
was tested for email-first capture, duplicate behavior, optional survey submit,
optional survey skip, and private-beta route preservation.

Root `jmpseat.com` was not cut over. No DNS change, root deployment, Supabase
Auth setting change, or production app launch was performed.

## Migration

Applied migration:

- `20260607193519_create_public_waitlist_capture.sql`

Runtime state confirmed:

- `public.waitlist_signups` exists.
- `public.waitlist_survey_responses` exists.
- RLS is enabled on both waitlist tables.
- Public table read/write privileges are not exposed.
- Public email signup RPC remains executable for bounded, idempotent email
  capture.
- Optional survey persistence is not public-direct-write.

During runtime verification, the linked runtime showed explicit `anon` and
`authenticated` execute privileges on the optional survey RPC after migration
apply. A narrow privilege-only correction was applied to the waitlist survey
functions so direct public survey RPC execution is denied and the server-owned
survey path remains available through the trusted server action.

## Stable Beta Deployment

`beta.jmpseat.com` was initially serving an older landing deployment with the
previous public Beta Access/Tally surface. A new Vercel preview deployment from
current `main` was created with deployment-scoped environment injection from
local ignored `.env.local`, then the stable beta alias was pointed to that
deployment.

No root-domain deploy or root-domain alias/cutover was performed.

## Public Page Runtime Checks

Confirmed on stable beta:

- Public waitlist page loads.
- Public Beta Access entry is absent.
- Public auth CTA to the private app is absent.
- Email field appears above the `join waitlist` CTA.
- Independence disclaimer appears.
- Proof upload, badge upload, document upload, and upload/review copy are absent.
- Tally is not exposed on the public page.

## Email Capture Runtime Checks

Using founder-controlled test addresses, with emails redacted from this note:

- Email capture succeeded.
- Success state appeared with `You're on the waitlist.`
- Duplicate email submission remained safe, friendly, and idempotent.
- Raw email was not placed in URLs.
- Database row existed with normalized email and bounded attribution fields.
- No email values or row identifiers were printed.

## Optional Survey Runtime Checks

Confirmed on stable beta:

- Optional survey appeared after email success.
- Research-derived survey questions rendered.
- Safe optional answers submitted successfully.
- Stored survey values were bounded and non-sensitive.
- Optional survey skip path succeeded in a separate test path.
- Sensitive-content rejection returned the safe rejection code through the
  trusted runtime path.
- Direct public survey RPC execution was denied.
- Survey token values were not printed.

## Private Beta Unaffected

Confirmed:

- `/login` still renders.
- `/app` still protects signed-out users by redirecting to login.
- Private beta auth routes remain present.
- Waitlist submission created no beta access rows.
- Waitlist submission created no verification claim rows.
- Waitlist submission created no profile rows.
- No beta grant, role claim, base claim, restricted-board claim, or private-beta
  auth behavior change was introduced.

## Validation

Passed:

- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `node --test test/auth/authPages.test.mts test/auth/authRoutes.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

Known unrelated lint warnings remain in:

- `app/lab/live-globe-proof/page.tsx`
- `src/lib/scroll/heroFlightControl.ts`

Direct Node tests emitted existing `MODULE_TYPELESS_PACKAGE_JSON` warnings.

## Next

W03 metrics/admin dashboard remains the next public waitlist follow-up after
this runtime pass. The metrics/admin dashboard was not implemented in this task.

