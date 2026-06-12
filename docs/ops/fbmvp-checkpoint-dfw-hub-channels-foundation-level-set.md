# FBMVP Checkpoint: DFW Hub + Channels Foundation Level-Set

Date: 2026-06-11

## Purpose

This docs-only checkpoint preserves the current DFW Hub + Channels foundation
state before any `FBMVP-T26B` feature work starts.

This record does not edit app code, edit migrations, edit tests, mutate runtime
data, apply migrations, run broad Supabase database push, deploy, stage files,
or commit.

## Current Repo Checkpoint

- Expected checkpoint commit: `0249e0d docs: record dfw channels runtime apply`
- Repo/worktree: `/Users/ClawdBot/jmpseat-public-scroll`
- Branch: `main`
- Checkpoint position: after `FBMVP-T26A` runtime apply docs.
- Operating instruction: feature work should pause here before `T26B`.

## Current Development Position

- Active lane: `05B / First-Base MVP`.
- Current product surface: DFW Hub + Channels foundation.
- Current model: Hub → Channels → future Threads.
- Channels are backed by child `public.boards` rows of type `hub_channel`.
- No standalone `channels` table exists.

## Completed Foundations

Completed foundations at this checkpoint:

- private app access gates.
- public-domain private-app blocking.
- admin shell authorization.
- verification/proof foundations historically implemented and runtime-proven,
  with proof uploads deprecated and out of the current 05B path.
- T12-T20 Baseboard safety loop:
  - posts
  - create
  - reads
  - reports
  - moderation
  - comments
  - comment reports
- T21 DFW surface reframed as DFW Hub.
- T22 Channels model locked to child `public.boards`.
- T24A Home + DFW Hub visual refresh implemented and beta-smoked with
  non-blocking polish.
- T25B `hub_channel` board type plus six DFW child channel boards implemented
  and runtime-applied.
- T26A `public.list_open_hub_channels(p_base_code text)`, helper, and
  `/app/hubs/dfw/channels` route implemented and runtime-applied.

## Runtime-Applied Channel State

Runtime-applied migrations:

- `20260611183000 create_hub_channel_board_type_dfw_seeds`
- `20260611203000 create_hub_channel_list_read_rpc`

Runtime channel rows:

- DFW Q&A
- Commuting & Parking
- Terminal & Ground Logistics
- Food, Coffee & Breaks
- New to DFW
- DFW Layover & Local

Runtime function:

- `public.list_open_hub_channels(p_base_code text)`

Code route:

- `app/app/hubs/dfw/channels/page.tsx`

Route access pattern:

- the route uses `requireDfwHubRouteAccess()` before calling the metadata
  helper.

## Not Complete / Not Live

Explicitly not complete or not live at this checkpoint:

- authenticated browser smoke for `/app/hubs/dfw/channels` remains pending.
- channel thread list is not implemented.
- channel post detail is not implemented.
- channel post create/composer is not implemented.
- channel comments are not implemented for channel-specific routes.
- channel reports/moderation integration is not implemented.
- `Request a Channel` workflow is static and non-functional.
- search is not implemented.
- saves are not implemented.
- reactions/helpful marks are not implemented.
- media/photo uploads are not implemented.
- live weather/traffic/ops integrations are not implemented.
- multi-airport expansion is not implemented.
- mobile app / Expo readiness is not complete.
- app-store readiness is not complete.

## Browser Smoke Boundary

The browser/runtime boundary at this checkpoint is:

- Public apex private route exposure check passed:
  - public apex did not expose the private app route.
- Anonymous beta request redirected to login.
- Authenticated browser route smoke was not completed because no real eligible
  private-beta browser session/tooling was available.
- Therefore, do not claim the six channels rendered in an authenticated browser
  yet.
- Authenticated `/app/hubs/dfw/channels` smoke remains pending.

## Documentation Consistency

Recent controlling docs are aligned:

- `docs/BUILD_TICKETS.md`
- `docs/DATA_MODEL.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/hub-pivot-plan.md`
- focused T21-T26A ops docs.

Older docs still contain broad or historical terms such as:

- Crew Rooms
- Base Boards
- Layover Boards
- Verified Rooms
- Jumpseat Brief
- saves/search/deals/AI

These references are mostly broader V1/full-beta or historical context and
should not override newer 05B/Hub docs.

No current docs inspected overclaim that channel posting, comments, or
moderation are live. T26A docs correctly record authenticated browser/route
smoke as pending.

## Known Stale Tests

Known stale expectation failures:

- `test/community/hubChannelSeeds.test.mts`
  - stale because it expects docs to contain no runtime apply, while T25B
    runtime apply is now documented.
- `test/community/boardPostActions.test.mts`
  - stale T15 expectation still expects runtime-pending wording, while T15 is
    runtime-applied.
- `test/community/boardPostDetail.test.mts`
  - stale T17 expectation still expects old `Back to DFW Baseboard` copy after
    the Hub pivot changed user-facing language.

These are test expectation drift, not evidence of new T26A behavior breaking.

## Security / Privacy Boundaries

Current architecture still preserves:

- verified privately, anonymous publicly, accountable internally.
- private app gates are server-side.
- public apex/www are blocked from private app paths.
- DFW Channels route uses the private route gate before RPC read.
- `list_open_hub_channels` returns only:
  - `slug`
  - `name`
  - `short_name`
  - `description`
  - `sort_order`
- no board IDs, base IDs, parent IDs, user IDs, author IDs, reporter identity,
  verification fields, storage paths, signed URLs, posts, comments, or reports
  are returned by T26A.
- T26A adds no direct RLS policies and no direct user table writes.
- no AI final verification/moderation.
- no schedule scraping.
- no airline portal login.
- no public crew tracking.
- no exact public crew hotel exposure.
- no passenger private information.
- no airport/security-sensitive procedures.
- no company-confidential content introduced.

## Architecture / Data Model Assessment

Reusing `public.boards` for `hub_channel` remains correct for this stage. It
preserves existing post/comment/report/moderation primitives and avoids a
premature standalone `channels` table.

Known future risk:

- `boards.slug` is globally unique.
- The DFW-only seed is acceptable for now.
- Multi-airport expansion may need airport-prefixed slugs or scoped uniqueness.
- Once meaningful user content exists, slugs should be stable unless redirects
  or aliases are planned.

Next channel-post modeling guidance:

- T26B channel posts should use `board_posts.board_id` pointing to the resolved
  `hub_channel` board.
- Do not use `board_posts.category` as channel membership.

## Recommended Next Sequence

Recommended order after this checkpoint:

1. Authenticated browser smoke for `/app/hubs/dfw/channels` with a real
   eligible beta/private-app account.
2. Stale test cleanup:
   - T25B seed docs runtime-apply expectation.
   - T15 runtime-pending expectation.
   - T17 `Back to DFW Baseboard` expectation.
3. Then `T26B` channel thread-list read foundation:
   - likely `list_open_hub_channel_posts(p_base_code, p_channel_slug, p_limit)`.
   - protected channel detail/thread-list route.
   - no composer yet.
4. Defer `T26C` channel composer until thread-list reads are stable and smoked.

## Do Not Start Yet

Do not start yet:

- channel composer.
- channel comments.
- channel reports/moderation integration.
- `Request a Channel` workflow.
- search/saves/reactions/media.
- multi-airport expansion.
- mobile/Expo work.
- app-store work.
