# FBMVP Remaining Functional Backlog

Date: 2026-06-11

## Purpose

This docs-only backlog captures what remains from the current DFW Hub +
Channels foundation checkpoint to a narrow private-beta MVP.

This record does not edit app code, edit migrations, edit tests, mutate runtime
data, apply migrations, run broad Supabase database push, deploy, stage files,
or commit.

## Current Checkpoint

- Repo checkpoint: `c2bbd73 docs: record dfw hub channels checkpoint`
- Active lane: `05B / First-Base MVP`
- Current surface: `DFW Hub`
- Current functional foundation: Channels metadata route plus runtime RPC
- Current route foundation: `/app/hubs/dfw/channels`
- Current DFW Today baseline: local protected read-only route
  `/app/hubs/dfw/today`
- Current DFW Base baseline: local protected read-only route
  `/app/hubs/dfw/base`
- Current runtime functions:
  - `public.list_open_hub_channels(p_base_code text)`
  - `public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer)`
  - `public.get_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid)`
- Current channel data model: `hub_channel` child rows in `public.boards`
- Authenticated browser smoke for `/app/hubs/dfw/channels` passed as functional
  route smoke in
  `docs/ops/fbmvp-t26a-dfw-channels-authenticated-browser-smoke.md`, with
  significant UI/UX polish deferred.
- T26B adds selected-channel thread-list reads and
  `/app/hubs/dfw/channels/[channelSlug]`; the T26B RPC is runtime-applied and
  authenticated browser smoke passed as functional route smoke with safe empty
  states where no channel posts exist.
- T26C adds the selected-channel post detail read foundation through
  `/app/hubs/dfw/channels/[channelSlug]/[postId]` and
  `public.get_open_hub_channel_post(...)`; runtime apply is complete and
  partial unavailable-state/access browser smoke passed. Post-fix browser smoke
  after `dfbdc79` reused the existing safe `dfw-q-and-a` post and confirmed
  happy-path detail rendering now passes.
- T26D adds the selected-channel composer/create-post foundation locally through
  `public.create_open_hub_channel_post(...)`, a server action, and the
  protected title/body composer on `/app/hubs/dfw/channels/[channelSlug]`.
  Runtime apply is complete and documented. Browser smoke failed/partially
  passed: exactly one safe post was created in `dfw-q-and-a` and appeared in the
  selected-channel thread list, but the create flow reported failure instead of
  redirecting to detail, and direct detail navigation rendered the safe
  unavailable state. The local UUID validation fix is implemented and post-fix
  browser smoke confirms T26B list plus T26C detail now pass using the existing
  safe post. Final authorized create-browser smoke created one additional safe
  post and confirmed list/detail reads, but T26D remains partial/fail because
  the browser stayed on the selected-channel page instead of redirecting to the
  new detail route. The local redirect/navigation fix is implemented, uses a
  safe created detail `href` plus client-side success navigation, and needs no
  runtime migration. Final deployed browser create-redirect smoke after
  `82f4399` passed with one additional authorized safe post; the browser landed
  on the new detail route, the selected-channel list showed the post exactly
  once, and T26B/T26C regressions passed.

T25B, T26A, T26B, T26C, and T26D are implemented, committed, runtime-applied, and
documented through runtime apply. The current gap is not whether Channels
metadata/read foundations exist; the gap is completing the DFW Hub utility loop
across the four MVP pillars below.

T27A is locally implemented as the first DFW Today lightweight baseline. It adds
the protected read-only `/app/hubs/dfw/today` route with static/config-backed
quick checks, utility cards, safety boundary copy, and links into existing DFW
Channels. It adds no migration, runtime apply, live operations data, external
integration, AI, posting, comments, reports, moderation controls, or Request a
Channel workflow. Authenticated browser smoke passed after deployment and is
recorded in `docs/ops/fbmvp-t27a-dfw-today-browser-smoke.md`.

T27B is locally implemented as the first DFW Base lightweight baseline. It adds
the protected read-only `/app/hubs/dfw/base` route with static/config-backed
base orientation content, base essentials, useful next links, safety boundary
copy, and links into existing DFW Channels and DFW Today. It adds no migration,
runtime apply, live operations data, external integration, AI, posting,
comments, reports, moderation controls, or Request a Channel workflow.
Authenticated browser smoke passed after deployment and is recorded in
`docs/ops/fbmvp-t27b-dfw-base-browser-smoke.md`.

T27C is locally implemented as the first DFW Layover lightweight baseline. It
adds the protected read-only `/app/hubs/dfw/layover` route with
static/config-backed layover planning reminders, layover essentials, useful
next links, safety boundary copy, and links into existing DFW Channels, DFW
Today, and DFW Base. It adds no migration, runtime apply, exact crew hotel
exposure, live crew location, live operations data, external integration, AI,
posting, comments, reports, moderation controls, or Request a Channel workflow.
Authenticated browser smoke is pending after deployment.

## Narrow DFW MVP Pillars

Channels are not the entire MVP. The narrow DFW Hub MVP should include four
utility pillars:

1. DFW Today
2. Base
3. Layover
4. Channels

Each pillar should start with a lightweight functional baseline. DFW
Today/Base/Layover should not require live integrations, scraping, or large new
systems for MVP.

## DFW Today

Purpose:

- current curated DFW utility snapshot
- not live operational data
- not scraped airport or airline data

MVP baseline:

- protected read-only route at `/app/hubs/dfw/today`
- static/config-backed quick checks
- curated utility cards
- safe links into existing DFW Channels
- safety copy that avoids live operations and security-sensitive details
- clear private-beta/static framing instead of fake freshness claims

Out of scope:

- live airport operations
- security-sensitive procedures
- airline portal scraping
- schedule scraping
- operational claims that require live verification

## Base

Purpose:

- DFW-based worker utility guide

MVP baseline:

- protected read-only route at `/app/hubs/dfw/base`
- static/config-backed base orientation
- commuting/parking high-level information
- terminal/ground logistics basics
- safe links into relevant Channels
- safe link back to DFW Today
- safety copy that avoids live operations and security-sensitive details

Out of scope:

- confidential company policies
- restricted procedures
- exact sensitive access details
- employer-private documents

## Layover

Purpose:

- useful local guidance for aviation workers laying over around DFW

MVP baseline:

- food/coffee
- transport basics
- gym/walkable options
- safe local recommendations
- crew-friendly notes

Out of scope:

- exact crew hotel exposure
- live crew location
- hotel-specific operational patterns
- unsafe meetups or dating-style behavior

## Channels

Purpose:

- verified-worker discussion around focused topics

MVP baseline:

- channel overview
- channel thread list
- channel post detail
- channel composer inside selected channel
- comments
- reporting
- moderation review integration

Out of scope:

- generic social feed
- reactions/saves/search/media until later
- `Request a Channel` workflow until later

## Recommended Sequencing From Here

Recommended order:

1. Review and commit the T27C DFW Layover implementation.
2. Authenticated browser smoke for `/app/hubs/dfw/layover`.
3. `T26E` channel comments/reporting/moderation integration, only if Channels
   remains the active lane.
4. Private-beta policy/ops readiness.
5. Route-by-route UI/UX polish.

Completed prerequisites:

- Authenticated browser smoke for `/app/hubs/dfw/channels`.
- T26C targeted runtime apply.
- T26C partial unavailable-state/access browser smoke.
- T26D targeted runtime apply.
- T26D failed/partial authenticated browser smoke with one safe child-channel
  smoke post created.
- T26D local UUID validation fix.
- Post-fix authenticated browser smoke confirming T26B thread-list and T26C
  detail happy paths using the existing safe child-channel smoke post.
- Final authorized T26D create-browser smoke with one additional safe post;
  create inserted the post and list/detail reads passed, but redirect still
  failed.
- Local T26D redirect/navigation fix; runtime SQL is unchanged and browser
  create-redirect re-smoke passed after deployment at `82f4399`.
- Final T26D create-redirect browser smoke pass with one additional safe post:
  create redirected to detail, T26B list regression passed, and T26C detail
  regression passed.
- T27A local DFW Today lightweight baseline: protected read-only route,
  static/config-backed quick checks and utility cards, safety boundary copy,
  and safe links into existing DFW Channels; no migration or runtime apply.
- T27A authenticated browser smoke: `/app/hubs/dfw/today` rendered on beta,
  DFW Hub navigation and channel cross-links were verified, no-cookie/public
  domain boundaries held, and product/security boundaries passed.
- T27B local DFW Base lightweight baseline: protected read-only route,
  static/config-backed base orientation content, base essentials, useful next
  links, safety boundary copy, and safe links into existing DFW Channels and
  DFW Today; no migration or runtime apply.
- T27B authenticated browser smoke: `/app/hubs/dfw/base` rendered on beta, DFW
  Hub navigation and channel/utility cross-links were verified,
  no-cookie/public-domain boundaries held, and product/security boundaries
  passed.
- T27C local DFW Layover lightweight baseline: protected read-only route,
  static/config-backed layover planning reminders, layover essentials, useful
  next links, safety boundary copy, and safe links into existing DFW Channels,
  DFW Today, and DFW Base; no migration or runtime apply.
- Stale test cleanup:
  - `test/community/hubChannelSeeds.test.mts`
  - `test/community/boardPostActions.test.mts`
  - `test/community/boardPostDetail.test.mts`

Layover has a local lightweight functional baseline and should not require live
integrations or scraping for MVP. DFW Today and DFW Base both have local
baselines plus authenticated beta browser smoke; DFW Layover now needs
authenticated beta browser smoke after deployment.

## UI/UX Rule

Do not broadly redesign routes before they are functional.

A route is ready for UI/UX polish when:

- the route exists
- data/source behavior is real or intentionally static
- access control is correct
- the route has been browser-smoked or explicitly deferred
- route status is documented

## Deferred Work

Deferred until after the narrow DFW Hub MVP loop is functional unless
explicitly rescoped:

- search
- saves
- reactions/helpful marks
- `Request a Channel` workflow
- NonRev Deals
- AI/Jumpseat utility
- media/photo uploads
- live weather/traffic/ops integrations
- multi-airport expansion
- native mobile/Expo
- app-store work
- full marketplace/payments

## Safety Boundaries

The remaining MVP work must preserve these boundaries:

- no airline portal login
- no schedule scraping
- no roster/calendar integrations
- no public crew tracking
- no dating/swiping behavior
- no exact public crew hotel exposure
- no passenger private information
- no airport/security-sensitive procedures
- no company-confidential content
- no AI final verification
- no AI final moderation/bans
- no public proof exposure

## Acceptance Criteria For This Backlog State

- DFW Hub MVP is understood as four utility pillars, not Channels alone.
- Channels completion remains sequenced before composer-heavy work.
- DFW Today/Base/Layover remain lightweight MVP baselines, not live-data
  integrations.
- UI/UX polish follows route functionality and smoke status.
- Deferred V1 features remain out of the narrow private-beta MVP path.
