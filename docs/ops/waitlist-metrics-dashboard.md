# Waitlist Metrics Dashboard

Date: 2026-06-07

Baseline branch: `w03-waitlist-metrics-dashboard`

## Summary

This note records the W03/W04 implementation for an operator/admin-only
first-party waitlist dashboard at `/app/admin/waitlist`. The dashboard uses the
existing first-party waitlist signup and optional survey response tables to show
both aggregate demand signals and actionable per-submission founder/admin
detail. A follow-up scope allowlist migration was added so raw contact detail
can move behind a narrower operator scope. No analytics SDK, third-party
analytics path, root public cutover, deployment, runtime mutation, or Supabase
migration apply happened in this task.

Runtime validation is still pending after the branch is reviewed, merged, and
the linked runtime is confirmed to be serving the new route.

## Implemented Scope

- Added `/app/admin/waitlist` behind the private-app gate and explicit operator
  authorization.
- Added a Waitlist item to the shared admin shell navigation.
- Kept `operator.read_audit` as the route-level scope for aggregate waitlist
  inspection.
- Added a narrower `operator.view_waitlist_contacts` scope for raw waitlist
  contact emails and full per-submission founder/admin invite workflow detail.
- Fresh first-operator bootstrap now includes `operator.view_waitlist_contacts`
  so a new environment does not strand the initial founder/admin operator
  without the waitlist contact workflow.
- Post-bootstrap operator grant management can now grant
  `operator.view_waitlist_contacts` through the existing controlled operator
  grant surface.
- Added server-side waitlist metrics loading through the existing service-role
  server path.
- Added pure metrics helpers for testable aggregation, bounded sanitization, and
  authorized per-submission detail.
- Added summary cards for total signups, signups today, signups over 7 days,
  signups over 30 days, survey completion rate, recent submissions shown,
  email-only demand, top acquisition source, and top desired feature.
- Added aggregate lists for aviation connection, desired features, safe
  base/airport/community text, discovery source, referral/UTM source, private
  beta willingness, verification comfort, current tools, and repeated
  privacy/trust concerns.
- Preserved common safe UTM/source labels, including underscore-separated
  campaign labels, in referral/source aggregates.
- Added recent submission cards that always show useful demand context, with
  masked summaries for `operator.read_audit` users and full contact/detail view
  only for `operator.view_waitlist_contacts`.
- Kept headline aggregate metrics separate from the recent-submissions display
  cap so totals, time-window counts, survey completion rate, and top survey
  insights are not computed from a truncated recent sample.
- Preserved empty and partial states so email-only signups still remain useful
  even when the optional survey was skipped.

## Metrics Source

The existing waitlist schema already supports the initial dashboard:

- `waitlist_signups` provides email capture date, source/referrer/UTM fields,
  duplicate-safe signup rows, and survey completion state.
- `waitlist_survey_responses` provides bounded optional answers through the
  existing allowlisted survey response path.

No new `waitlist_events` table was created in this pass. Dedicated event capture
for page views, CTA clicks, and failed submissions remains optional future work
if the founder needs funnel metrics beyond signup and survey-response state.

Aggregate metrics are loaded through a paginated server-side query path and are
not computed from the bounded recent-submissions list. Recent submissions remain
intentionally display-limited. `operator.read_audit` can inspect aggregate
metrics and masked recent summaries only, and the server does not load raw
contact email or richer per-person invite-workflow detail in that mode. Audit
mode receives a database-projected masked contact label only. The database may
read email internally to derive the mask, but the app data result receives only
the masked label. `operator.view_waitlist_contacts` is required before the raw
contact/detail query path runs.

## Privacy And Access Controls

- The dashboard is not public.
- Non-operators cannot access `/app/admin/waitlist`.
- Access requires an explicit active operator grant containing
  `operator.read_audit`.
- Raw waitlist contact email and full per-person invite workflow detail require
  the narrower `operator.view_waitlist_contacts` scope.
- `operator.manage_operator_access` can grant
  `operator.view_waitlist_contacts` through the controlled post-bootstrap grant
  path.
- Shared `/app/access-restricted` copy should stay neutral because the same
  denial surface is used for reviewer, admin, and operator restrictions.
- Waitlist contact emails may be rendered inside `/app/admin/waitlist` only
  when `operator.view_waitlist_contacts` is present. `operator.read_audit`
  alone receives masked recent-submission summaries with no raw email or
  normalized email in the app result.
- Public waitlist pages never expose waitlist emails or survey answers.
- Row IDs, survey tokens, cookies, user IDs, and internal identifiers are not
  rendered.
- Aggregate display uses bounded checkbox/select answers plus sanitized short
  free-text base/community and privacy/trust values.
- Per-person detail stays limited to useful survey fields such as aviation
  connection, base priority, desired features, current tools, private beta
  willingness, biggest problem, and privacy/trust concern.
- Sensitive text such as employee IDs, badge/proof/document references, portal
  credentials, passenger information, exact hotel details, schedules, tokens, or
  email-like values is excluded from free-text aggregate display. Internal IDs,
  UUIDs, cookies, auth/session data, and service-role secrets are not shown in
  the UI.
- UTM/source labels may include normal campaign characters such as letters,
  numbers, spaces, periods, hyphens, and underscores, but unsafe/private
  attribution strings are still excluded.
- The dashboard does not grant beta access, mutate airline-email verification,
  issue role/base/restricted-board claims, or expose proof-upload data.

## Runtime Status

Implementation status: complete on branch.

Runtime status: pending.

Required runtime follow-up after merge/deploy:

- Confirm `/app/admin/waitlist` is available on stable beta only to an authorized
  operator/admin.
- Confirm a non-operator is redirected or blocked.
- Confirm summary cards render from real waitlist data.
- Confirm total, time-window, survey completion, and top-list aggregate metrics
  are not truncated by the recent-submissions display limit.
- Confirm `operator.read_audit` alone shows aggregate metrics plus masked recent
  summaries only.
- Confirm `operator.view_waitlist_contacts` unlocks full contact emails and
  bounded per-submission survey detail, while row IDs, survey tokens, auth
  identifiers, and private infrastructure values remain hidden.
- Confirm public `/` still has no Beta Access entry.
- Confirm no root `jmpseat.com` cutover happened unless a separate launch ticket
  explicitly performs it.

## Not Included

- No root public-domain cutover.
- No deployment.
- No Supabase db push or migration apply.
- No migration apply.
- No third-party analytics SDK.
- No Vercel settings changes.
- No DNS changes.
- No beta grant or private beta auth changes.
- No proof upload, badge upload, document upload, proof review, or community
  feature work.
