# Waitlist Metrics Dashboard Runtime Pass

Date: 2026-06-07

Baseline commit: `b9bd7e6 feat: add waitlist metrics dashboard`

Stable beta target: `https://beta.jmpseat.com`

## Summary

The waitlist metrics dashboard lane was checked against stable beta after
`main` merged the `/app/admin/waitlist` implementation. Stable beta was first
found to be serving an older preview that did not include the dashboard route, so
a fresh stable-beta preview deployment was created from current `main` and
aliased to `beta.jmpseat.com` only.

This runtime pass applies to the earlier aggregate-first dashboard shape. The
later founder-intelligence revision should keep `operator.read_audit` for
aggregate metrics and add a narrower `operator.view_waitlist_contacts` scope
before showing raw contact emails or richer per-submission invite workflow
detail. That richer dashboard will need its own runtime validation after
review, merge, and deploy.

Root `jmpseat.com` was not deployed, aliased, cut over, or changed.

## Stable Beta Check

Confirmed after the stable-beta refresh:

- stable beta serves a build that includes `/app/admin/waitlist`
- unauthenticated `/app/admin/waitlist` requests redirect to login with the
  admin waitlist route preserved as the intended next path
- `/app` remains protected for unauthenticated visitors
- `/login` renders normally
- the public waitlist page loads
- `Beta Access` remains absent from the public waitlist page

No DNS change, Vercel project setting change, Supabase setting change, root
domain alias, production deployment, or root public cutover happened in this
task.

## Dashboard Access Runtime Result

The deployed route and unauthenticated protection were runtime-checked on stable
beta. The available authenticated browser session did not render the dashboard
and was redirected to the access-hold surface by the app gate. Explicit
non-operator admin denial remains covered by automated tests and still needs a
dedicated browser-level runtime check if we want that proof.

The operator-rendered dashboard UI still needs one founder/operator browser
session check after a safe operator session is available. No credentials,
private emails, identifiers, or tokens are recorded in this note.

## Metrics Runtime Result

A safe service-role runtime read was performed against the linked waitlist
tables without printing row values, emails, row IDs, survey tokens, or free-text
answers.

Confirmed by safe aggregate booleans:

- runtime waitlist signup data exists
- time-window counts are internally consistent
- survey completion rate is bounded
- survey response data exists
- recent submissions are bounded to the dashboard display limit
- recent submission email display can remain masked

This validates the runtime data source used by the dashboard metrics path. The
visual operator dashboard render remains pending until a safe operator browser
session is available.

## Privacy And Access Controls

Runtime and local validation confirmed:

- public waitlist page remains Beta Access-free
- `/app/admin/waitlist` is not public
- unauthenticated access redirects to login
- the available authenticated browser session did not render the dashboard and
  was redirected by the app gate
- explicit non-operator admin denial remains covered by automated tests
- the baseline runtime pass used masked recent submission display only
- raw emails, row IDs, survey tokens, user IDs, private links, and private
  identifiers were not printed during validation
- proof upload, badge upload, document upload, schedule, portal, passenger, and
  exact hotel fields were not introduced
- no beta grant, role claim, base claim, or restricted-board claim was created

UTM/source labels with underscores remain covered by automated tests. No
dedicated runtime fixture for underscore-separated UTM attribution was created
in this task.

## Validation

Passed:

- `node --test test/admin/waitlistMetrics.test.mts`
- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts`
- `node --test test/auth/authPages.test.mts test/auth/authRoutes.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

Notes:

- direct Node tests emitted the existing `MODULE_TYPELESS_PACKAGE_JSON` warning
- `npm run lint` passed with known unrelated warnings in:
  - `app/lab/live-globe-proof/page.tsx`
  - `src/lib/scroll/heroFlightControl.ts`

## Remaining Follow-Up

Recommended next ticket:

- complete one authenticated founder/operator browser check of
  `/app/admin/waitlist`, confirming the admin shell render, summary cards,
  aggregate lists, and no raw email/ID/token display in the live dashboard UI

After that check, the next launch lane can move to public root cutover readiness.
