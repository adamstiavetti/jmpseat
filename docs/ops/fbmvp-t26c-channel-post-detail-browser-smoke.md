# FBMVP-T26C Channel Post Detail Browser Smoke

Date: 2026-06-12

## Purpose

This record captures authenticated browser/runtime smoke for the
`FBMVP-T26C` selected-channel post detail route.

This began as a partial unavailable-state/access-boundary smoke only. A later
T26D browser smoke created one safe published child-channel post and attempted
happy-path detail rendering. That happy path failed: the created post detail
route rendered a safe unavailable state instead of the post.

Target host:

- `https://beta.jmpseat.com`

Target route pattern:

- `/app/hubs/dfw/channels/[channelSlug]/[postId]`

## Repo And Deployment Context

Repo state during smoke:

- repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- branch: `main`
- worktree: clean
- `HEAD = origin/main = 368ebf2`
- no files changed, staged, committed, or deployed during smoke

Deployment tested:

- `https://beta.jmpseat.com`
- T26C route code appears deployed because an authenticated Chrome/private-beta
  session reached the selected-channel post detail route and rendered the T26C
  route shell/unavailable state instead of login or a generic 404.

Synthetic route tested:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a/00000000-0000-4000-8000-000000000000`

## Candidate Post Discovery

Read-only SQL found zero published `visibility = 'board'` posts on active DFW
child `hub_channel` boards.

No runtime data was created or modified.

Because no safe child-channel post exists:

- happy-path post-detail smoke was not run
- no real post title/body rendering was verified
- no selected-channel thread-list row navigation into a real detail route was
  verified
- happy-path selected-channel post detail smoke remains deferred until a safe
  published post exists on a child `hub_channel` board

## Smoke Result

Smoke type:

- partial/unavailable-state smoke only

Authenticated access:

- a real authenticated Chrome/private-beta session accessed the synthetic
  selected-channel detail route
- no login redirect occurred
- no access-restricted redirect occurred
- the route rendered the selected-channel post-detail shell with a safe
  unavailable state

Selected channel and post tested:

- channel: `dfw-q-and-a`
- synthetic post UUID: `00000000-0000-4000-8000-000000000000`
- no real runtime post was tested because candidate discovery returned zero rows

Rendered unavailable-state details:

- `DFW Hub Channel thread`
- breadcrumb: `DFW Hub / Channels / Q&A / Thread`
- `Back to Channel Threads`
- `That DFW Channel thread is unavailable.`

## Thread-List Navigation Boundary

The selected-channel thread-list route was visited:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a`

It rendered:

- `DFW Q&A`
- safe `No threads in this Channel yet` state

No post-detail row/card link was available because no channel posts exist, so
row-click navigation into a real selected-channel post detail route could not be
tested.

## Access Boundary Checks

No-cookie beta detail request redirected to:

- `/login?next=%2Fapp%2Fhubs%2Fdfw%2Fchannels%2Fdfw-q-and-a%2F00000000-0000-4000-8000-000000000000`

Public apex behavior:

- public apex redirected through `www.jmpseat.com`
- the route then resolved to `/`
- public marketing/waitlist content rendered
- public apex did not expose the private app route

## Product Boundary Checks

The selected-channel post detail unavailable-state route did not render:

- composer
- `Start a Thread`
- reply box
- comments
- report controls
- moderation controls
- `Request a Channel` workflow
- fake activity counts
- fake thread counts
- DFW Today/Base/Layover functionality
- `Baseboard` as a private-app user-facing product label

## Security And Privacy Checks

No visible exposure was observed for:

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

## Optional Direct RPC Call

An authenticated direct RPC call was not run. No safe real authenticated SQL/RPC
context was available, so no authenticated direct RPC result is claimed.

Read-only runtime checks confirmed ledger rows for T25B/T26A/T26B/T26C and
confirmed the three channel read RPCs exist, including:

- `get_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid)`

## Unexpected Findings

None.

The later T26D smoke removed the original "no child-channel post exists"
blocker, but exposed a real happy-path detail failure for the created safe post.

## Remaining Work

Happy-path selected-channel post detail smoke failed for the safe child-channel
post created during T26D smoke:

- post UUID: `7f93f9a9-3dd1-4718-979a-2acc8194a999`
- channel: `dfw-q-and-a`
- title: `DFW Q&A smoke test thread`

The next implementation task should investigate the T26D create/action return
handling and T26C detail-read mismatch before additional smoke posts are
created. Follow-up diagnosis found malformed app-side UUID validation as the
local root cause, and the fix is recorded in
`docs/ops/fbmvp-t26d-channel-composer-uuid-validation-fix.md`.

UI/UX polish remains deferred.

T26C still does not add:

- composer
- channel post creation
- comments
- reports
- moderation review changes
- `Request a Channel` workflow
- DFW Today MVP baseline
- Base MVP baseline
- Layover MVP baseline

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`
- `docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-read-foundation.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-read-foundation-runtime-apply.md`

Docs not updated / why:

- App, migration, and test files were not updated because this task only records
  browser-smoke results.
- Broad roadmap docs were not updated because the focused T26C and active 05B
  backlog docs are sufficient for this status change.

Scope impact:

- Browser-smoke documentation only.
- No app behavior, migrations, tests, runtime data, deployment settings, or
  Supabase schema changed in this docs task.

Runtime apply docs needed?

- Already satisfied by
  `docs/ops/fbmvp-t26c-channel-post-detail-read-foundation-runtime-apply.md`.

Browser smoke docs needed?

- Partially satisfied by this record for route/access/unavailable-state
  behavior.
- Happy-path browser smoke was later attempted during T26D smoke and failed for
  the created safe child-channel post. Follow-up smoke remains needed after the
  local UUID validation fix is deployed.
