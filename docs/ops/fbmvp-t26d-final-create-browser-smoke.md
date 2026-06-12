# FBMVP-T26D Final Create Browser Smoke

Date: 2026-06-12

This record captures the final authenticated beta browser smoke attempt for the
`FBMVP-T26D` selected-channel create flow after the UUID validation fix.

This smoke is a partial/fail result, not a pass.

## Repo State During Smoke

- repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- branch: `main`
- worktree: clean
- HEAD/origin: `bce510e`
- no files changed, staged, or committed during smoke

## Deployment Tested

Host reviewed:

- `https://beta.jmpseat.com`

Deployment readiness was confirmed before creating a post. The existing detail
route for `7f93f9a9-3dd1-4718-979a-2acc8194a999` rendered the prior safe smoke
post, proving the UUID validation fix from `dfbdc79` or newer was present.

## Smoke Post Created

Exactly one additional safe smoke post was created through the authenticated
browser UI.

Title:

- `DFW Q&A smoke test thread after UUID fix`

Body:

- `Post-fix smoke test for the DFW Channels composer. No operational, security-sensitive, passenger, hotel, or company-confidential information.`

Created post UUID:

- `8df32cc8-9254-4b43-8a37-102dc77739bd`

No additional post was created.

## Create Redirect Result

Failed / not passed.

Observed:

- the post was created
- after submit, the browser remained on
  `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a`
- the browser did not redirect directly to
  `/app/hubs/dfw/channels/dfw-q-and-a/8df32cc8-9254-4b43-8a37-102dc77739bd`
- no raw error leaked
- no `dfw_channel_post_failed` query parameter appeared

## Post Detail Result

Passed.

Direct detail route rendered the newly created post:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a/8df32cc8-9254-4b43-8a37-102dc77739bd`

Verified:

- title rendered
- body rendered
- channel breadcrumb/name rendered
- safe author label rendered
- safe metadata rendered
- unavailable state did not render
- no visible UUID/internal IDs in page text

## Thread List Result

Passed.

Selected-channel route:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a`

Verified:

- new post appeared in thread list exactly once
- previous smoke post still appeared
- new row linked to
  `/app/hubs/dfw/channels/dfw-q-and-a/8df32cc8-9254-4b43-8a37-102dc77739bd`
- clicking the new row ultimately rendered the new detail route
- no duplicate post was created from the single submit

## No-Cookie / Public-Domain Boundaries

Passed.

No-cookie beta:

- selected-channel route returned `307` to login with `next`
- new detail route returned `307` to login with `next`

Public-domain checks:

- public `jmpseat.com` canonicalized to `www.jmpseat.com`
- public selected-channel route redirected to `/`
- public detail route redirected to `/`
- private app routes were not exposed on public domain

## Product Boundary Checks

The T26D composer was present on the selected-channel page, as expected.

No functional surfaces appeared for:

- comments/replies UI
- report controls
- moderation controls
- Request a Channel workflow
- fake activity counts
- fake thread counts
- DFW Today/Base/Layover functionality
- private-app user-facing `Baseboard` label

Explanatory copy that comments/reports are later scoped tickets is acceptable
because no functional comments/reports surface was present.

## Security / Privacy Checks

No visible exposure of:

- board IDs
- base IDs
- parent board IDs
- author user IDs
- reporter identity
- verification/proof data
- storage paths
- signed URLs
- runtime comments/reports
- passenger private information
- exact crew hotel exposure
- airport/security-sensitive procedures
- company-confidential content
- live crew movement/location

## Optional Runtime Verification

Read-only SQL found one matching published/board-visible post for the new smoke
title:

- channel slug: `dfw-q-and-a`
- channel name: `DFW Q&A`
- post UUID: `8df32cc8-9254-4b43-8a37-102dc77739bd`
- title: `DFW Q&A smoke test thread after UUID fix`
- status/visibility: `published` / `board`

No runtime data was mutated beyond the one authorized UI-created smoke post.
Internal board/base/author IDs are not included in this record.

## Ticket Status

T26D browser create status:

- partial / failed on redirect
- create mutation and post insertion succeeded
- downstream list/detail reads work
- browser create flow still did not redirect to created post detail after submit

T26B regression:

- passed because the thread list shows the new child-channel post

T26C regression:

- passed because the detail route renders the new valid UUID post

## Unexpected Findings

- UUID validation fix resolved detail rendering for valid child-channel post
  UUIDs.
- UUID validation fix did not fully resolve T26D create redirect behavior.
- Likely follow-up area: post-submit navigation/redirect handling in create
  action/client form handling.

No more smoke posts should be created until this redirect behavior is
investigated.

## Follow-Up Fix

The local app-side redirect/navigation fix is recorded in
`docs/ops/fbmvp-t26d-channel-composer-redirect-fix.md`.

It keeps runtime SQL unchanged, returns a narrow safe created detail `href` from
the server action, and uses client-side success navigation from the
selected-channel composer.

This smoke record remains a partial/fail historical result. Browser
create-redirect re-smoke remains pending after deployment and should create
exactly one additional safe post only if explicitly authorized.

## Remaining Work

The follow-up deployed browser re-smoke is recorded in
`docs/ops/fbmvp-t26d-final-create-redirect-browser-smoke-pass.md`. After
`82f4399`, create redirect passed with exactly one additional safe
`dfw-q-and-a` post, direct navigation to the new detail route, passing T26B list
regression, and passing T26C detail regression.

No new runtime migration is needed based on this smoke result unless later
investigation proves otherwise.

UI/UX polish remains deferred.

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26d-final-create-browser-smoke.md`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26d-channel-composer-create-foundation.md`
- `docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`
- `docs/ops/fbmvp-t26d-channel-composer-uuid-validation-fix.md`
- `docs/ops/fbmvp-t26d-t26c-post-fix-browser-smoke.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`

Docs not updated / why:

- Broad roadmap docs were not updated because this is a focused browser-smoke
  status record, not a roadmap or MVP-boundary change.
- Runtime-apply docs were not updated because no runtime migration or SQL apply
  was needed.
- App, migration, and test files were not updated because this task only records
  browser-smoke results.

Scope impact:

- Browser-smoke documentation only.
- No app behavior, migrations, tests, runtime data beyond the already-authorized
  smoke post, deployment settings, or Supabase schema changed in this docs task.

Runtime apply docs needed?

- No.

Browser smoke docs needed?

- Satisfied by this record for the final T26D create-browser redirect attempt.
- This record remains a historical partial/fail. The later pass record in
  `docs/ops/fbmvp-t26d-final-create-redirect-browser-smoke-pass.md` satisfies
  the final create-redirect browser smoke after the navigation fix.
