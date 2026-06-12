# Hub Pivot Plan

Date: 2026-06-11

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

## Purpose

This note locks the current working product direction after the First Base /
DFW Baseboard safety loop. It is a planning and naming record only. It does
not implement app code, change database tables, apply migrations, deploy, or
change runtime settings.

The approved direction is to pivot away from treating Baseboards as open mixed
discussion boards. The product should move toward airport/base Hubs: curated,
read-heavy utility pages with scoped community participation underneath.

This is the current planning model. It can change later, but implementation
should use this language and structure until a newer controlling decision
replaces it.

## Current Controlling Docs For Hub Work

Use this source pack for Hub implementation, product planning, and wireframes:

- `docs/ops/hub-pivot-plan.md` - approved Hub product model and naming.
- `docs/ops/fbmvp-t21-dfw-hub-product-framing-runtime-smoke.md` - manual beta
  UI smoke for the T21 DFW Hub shell and expected UX debt.
- `docs/ops/fbmvp-t22-hub-channels-ia-data-model-lock.md` - current
  Channels IA/data-model decision.
- `docs/ops/fbmvp-t23a-full-mobile-hub-wireframes.md` - mobile-first
  wireframe packet for the post-pivot private-beta Hub experience, including
  approved visual mockup direction and required prototype cleanup.
- `docs/ops/fbmvp-t23b-static-wireframe-prototype-manual-review.md` - manual
  beta visual review result for the protected static Hub prototype route.
- `docs/ops/fbmvp-checkpoint-dfw-hub-channels-foundation-level-set.md` -
  current checkpoint after T26A runtime apply docs; read before starting T26B
  channel thread-list work.
- `docs/ops/fbmvp-remaining-functional-backlog.md` - current docs-only backlog
  from checkpoint `c2bbd73` to narrow private-beta MVP; it keeps DFW Today,
  Base, Layover, and Channels together as the four DFW Hub utility pillars.

Wireframe source pack:

- Product language: `[AIRPORT] Hub`, `[AIRPORT] Today`, Base, Layover,
  Channels, Recent Useful Threads, and Request a Channel inside Channels.
- DFW private-beta channel seed defaults after T25B: DFW Q&A, Commuting &
  Parking, Terminal & Ground Logistics, Food, Coffee & Breaks, New to DFW, and
  DFW Layover & Local.
- Known UX debt: placeholder-heavy shell, card stacking needs polish, Channels
  needs thread creation/reading/reply hierarchy, and Request a Channel should
  become a secondary action.
- Do not design around real UGC yet. None exists in production.

## Proven Baseline

The current First Base / DFW Baseboard safety loop is complete through T20:

- T12 added the shared `board_posts` foundation.
- T13 added server-controlled post creation through `public.create_board_post`.
- T14 added safe DFW Baseboard post reads.
- T15 added the minimal DFW Baseboard title/body composer.
- T16 added post reporting plus operator hide/remove RPC safety.
- T17 added read-only DFW Baseboard post detail.
- T18 added DFW Baseboard report review for `operator.community_moderation`.
- T19 added top-level DFW Baseboard comments plus operator hide/remove comment
  safety.
- T20 added comment reporting and comment report review integration.

All T12 through T20 runtime-pass docs are committed. Known Supabase migration
history drift remains preserved, so broad `supabase db push` remains unsafe.
Future runtime changes should continue to use targeted preflight/apply.

Pre-closeout access fixes are also part of the baseline:

- `bad2110 fix: gate private app on public domain` keeps `jmpseat.com` and
  `www.jmpseat.com` marketing/waitlist-only and keeps private app entry on
  `beta.jmpseat.com`.
- `5e65f7b fix: require admin authorization for admin shell` requires reviewer
  authorization or an active operator grant before rendering `/app/admin`.

## Why Pivot

Raw Baseboards create a mixed-pot risk. If the top-level base surface becomes a
chronological discussion board, practical airport utility, temporary layover
needs, localized questions, social chatter, app feedback, and moderation
signals can collapse into one noisy feed.

That shape weakens the core jmpseat principle:

- utility first
- community second
- social feed last
- verified privately, anonymous publicly, accountable internally

The Hub model keeps the first screen useful by default. Community participation
still exists, but it lives inside scoped sections and channels with clear
governance.

## Approved Hub Model

Each airport/base has a Hub. The Hub is curated and useful by default. The
top-level Hub should not be a raw chronological feed.

The working structure is:

- `[AIRPORT] Hub`
- `[AIRPORT] Today`
- `Base`
- `Layover`
- `Channels`
- `Recent Useful Threads`

Example:

- `MIA Hub`
  - `MIA Today`
  - `Base`
  - `Layover`
  - `Channels`
  - `Recent Useful Threads`

A DFW-based user can discover `MIA Layover` through search, recommendations, or
popular layovers, but the canonical home is `MIA Hub > Layover`, not
`DFW Hub > MIA Layover`.

## Locked Working Naming

Use these as the current product-facing labels:

- Top-level airport/base surface: `[AIRPORT] Hub`, for example `DFW Hub`.
- Current curated module: `[AIRPORT] Today`, for example `DFW Today`.
- Based-worker utility section: `Base`.
- Layover utility/UGC section: `Layover`.
- Focused discussion spaces: `Channels`.
- Channel request action: `Request a Channel`.
- High-signal community surface: `Recent Useful Threads`.

Do not use these as primary product-facing labels:

- `Baseboard` as the main public-facing concept.
- `Intel`.
- `Brief`.
- `Subboards`.
- `Routes`.
- `Groups`.
- `Communities`.
- `Layover Guide` as the primary layover product name.

Internal database/table names do not need to be renamed as part of the pivot.
Any internal schema rename should be planned separately as a later refactor.

## DFW Private Beta Structure

The DFW private beta should default to:

- `DFW Hub`
  - `DFW Today`
  - `Base`
  - `Layover`
  - `Channels`
    - includes an in-section `Request a Channel` action/button
  - `Recent Useful Threads`

Current DFW private-beta channel seed defaults:

- `DFW Q&A`
- `Commuting & Parking`
- `Terminal & Ground Logistics`
- `Food, Coffee & Breaks`
- `New to DFW`
- `DFW Layover & Local`

The original seven-channel seed list is superseded for T25B. `Base Life`,
`Crew Tips`, and `App Feedback` are not seeded as DFW child channels in this
ticket.

## Section Model

### DFW Today

`DFW Today` contains admin/founder/approved curated current items such as:

- weather
- traffic
- public airport advisories
- app notes
- recently updated sections

AI may assist drafting or summarizing updates, but AI should not be the final
publisher for operationally sensitive, verification-sensitive, or
safety-sensitive information.

### Base

`Base` contains evergreen and semi-evergreen information for people based at or
working from that airport.

Examples include commuting, parking, food, reserve-life patterns, airport
basics, and other airport/base utility content that should not be buried in a
raw feed.

### Layover

`Layover` contains practical layover information, recommendations, questions,
and crew-sourced updates for people temporarily there.

Do not model layovers as a totally separate `Layover Guide` product right now.
Layover content lives inside the airport Hub as a `Layover` section.

Layover section content can include:

- `Essentials`
- `Recommendations`
- `Questions`
- `Crew Tips`
- `Getting Around`
- `Food & Coffee`
- `Things To Do`
- `Short Layover`
- `Long Layover`

### Channels

`Channels` contain focused scoped discussion. Users may request a Channel from
inside the Channels section, but should not freely create channels in V1.
Admin/founder review is required before new channels are created.

Important UX clarification: `Request a Channel` is not a full top-level Hub
section. It is an action/button inside the `Channels` section.

### Recent Useful Threads

`Recent Useful Threads` is the high-signal community surface. It should surface
useful, current, or recently active conversations from scoped community areas
without turning the top-level Hub into a raw chronological feed.

## Channel Request Governance

A channel request should require:

- requester is verified/private-beta eligible
- topic is aviation-worker utility related
- no duplicate existing channel
- no live ops-sensitive topic
- no passenger private information
- no airport/security-sensitive procedures
- no exact public crew hotel exposure
- no dating/social clique behavior
- clear name, purpose, and rules
- admin approval

Channel requests should be reviewed before any channel is created. Do not add
free user-created channels in V1.

## Layover UGC And Curation Boundary

User-generated layover recommendations can exist, but admins/founders decide
what becomes curated or promoted content.

Users may:

- add recommendations
- ask questions
- comment
- save
- mark helpful
- suggest updates
- report content

Users should not directly edit curated/admin content.

Future photos may be allowed only with strict safety moderation.

Layover safety boundaries:

- no exact crew hotel exposure
- no live crew movement/location
- no passenger private information
- no airport/security-sensitive procedures
- no company-confidential documents or policies
- no dating/social meetup behavior

## AI And Admin Curation Boundary

AI can assist with drafting, summarizing, clustering, or suggesting updates.
AI should not be the final publisher for:

- operationally sensitive information
- verification-sensitive information
- safety-sensitive information
- moderation decisions
- eligibility decisions
- channel approval decisions

Admins/founders remain accountable for curated/promoted content and channel
creation decisions.

## Out Of Scope

This pivot direction does not add:

- app code
- database migrations
- runtime changes
- deployment changes
- free user-created channels
- comments/replies expansion
- saves/reactions/search implementation
- public sharing
- generic social media
- schedule scraping
- public nearby crew tracking
- AI final moderation or verification decisions
- lounge/restricted posting expansion
- proof-upload scope
- direct edits to curated/admin content by users
- internal database table renames

Protected surfaces must remain server-gated and must not rely on client-side
hiding alone. Existing access, moderation, RLS, admin, and reporting controls
must not be weakened.

## T22 Channels IA / Data Model Decision

`FBMVP-T22` locks the recommended Channels internal model before implementation:

- Existing `public.boards` can partially model Channels.
- Recommended internal model: reuse/extend `public.boards`, not a new
  standalone `channels` table yet.
- Hub maps to `public.bases` plus the current parent/base board container.
- Channel maps to child `public.boards` rows under the DFW base board.
- Thread maps to `public.board_posts`.
- Comments map to `public.board_post_comments`.
- Reports/moderation use existing post/comment report and moderation
  primitives.
- Current DFW RPCs still target the single active DFW `base_board`; real
  channel routing/posting will need channel-aware wrappers/RPCs later.
- `board_posts.category` alone is too weak for real Channels.

T25B local schema/seed foundation:

- Add a `hub_channel` board type.
- Seed six DFW private-beta child channel boards:
  - `dfw-q-and-a`
  - `commuting-parking`
  - `terminal-ground-logistics`
  - `food-coffee-breaks`
  - `new-to-dfw`
  - `dfw-layover-local`

These channels are private-beta seed defaults, not final public-release
taxonomy. Names, descriptions, slugs, sort order, active/hidden status, and the
number of channels may change before release and before meaningful production
UGC exists. Once meaningful user content exists in channel boards, slugs should
be treated as stable unless redirects or aliases are explicitly planned.

Later implementation should:

- Add safe channel-aware RPCs later:
  - `list_open_hub_channel_posts(p_base_code, p_channel_slug, p_limit)`
  - `create_open_hub_channel_post(p_base_code, p_channel_slug, ...)`
  - `get_open_hub_channel_post(p_base_code, p_channel_slug, p_post_id)`

No real production UGC exists yet, so UGC data-loss is not a blocker for this
model choice. Database table/RPC renames remain out of scope unless a separate
refactor plans them.

## Recommended Next Implementation Ticket

Current design packet:

`FBMVP-T23A: DFW Hub Channels UX Wireframe`

Status: documented in `docs/ops/fbmvp-t23a-full-mobile-hub-wireframes.md`.
Visual mockup direction is approved with required revisions before static
prototype implementation.

Scope:

- mobile Home/dashboard
- DFW Hub overview
- DFW Today
- Base
- Layover
- Channels overview
- Channel detail/thread list
- Thread detail
- Start a Thread composer
- reply/comment flow
- report flow
- saved/empty states
- bottom navigation

Reason for this packet: the Channels model is locked, localhost inspection is
not available during the workday, and wireframes are being generated
externally. A focused wireframe pass should clarify Channels layout, thread
hierarchy, and Request a Channel placement before DB/RPC-backed child channel
boards are implemented.

Required prototype revisions:

- use compact rows/lists for repeated Channels, threads, comments, search
  results, and saved items
- reserve cards for major destinations, empty states, safety reminders, and
  detail containers
- remove fake scale claims and use beta-safe placeholders
- do not show mutually exclusive states together
- keep Home/Hubs/Search/Saved/Me bottom navigation consistent, with Hubs active
  for DFW Hub and nested Hub flows
- keep report affordances accessible but visually quiet
- keep Request a Channel secondary and Start a Thread inside selected Channel
  detail

Next likely implementation ticket:

`FBMVP-T23B: Protected Static Hub Wireframe Prototype Route`

Likely route: `/app/admin/design/dfw-hub-wireframes`.

T23B must use fake/mock/static data only. It must not call Supabase content
RPCs, query or display real `board_posts`, comments, reports, author IDs,
reporter identity, or runtime UGC, mutate runtime data, apply migrations, or
start DB/RPC-backed Channels. It also should not start free channel creation,
media uploads, live integrations, saves, reactions, or search.

Status: locally implemented as `/app/admin/design/dfw-hub-wireframes`.
The route uses the existing admin-shell authorization boundary and isolated
static prototype UI with local fake data only. It is not linked from normal user
navigation, does not import community content fetchers, does not call Supabase
content RPCs, and does not implement real Channels.

Manual beta visual review is recorded in
`docs/ops/fbmvp-t23b-static-wireframe-prototype-manual-review.md` for commit
`07ebf7b fix: polish hub wireframe prototype`. Decision: approved with future
UI polish. No functionality blocker remains, and the prototype route should not
receive more polish before implementation planning.

T24A local implementation is recorded in
`docs/ops/fbmvp-t24a-real-home-dfw-hub-visual-refresh.md`. It refreshes the
real private-app Home/dashboard and real DFW Hub overview while preserving
existing access gates and safe data paths. Do not start DB/RPC-backed Channels
until explicitly scoped.

T24A deployed beta/manual browser smoke is recorded in
`docs/ops/fbmvp-t24a-real-home-dfw-hub-runtime-smoke.md` for commit
`12df45b feat: refresh home and dfw hub surfaces`. Decision: runtime smoke
passed with non-blocking visual polish. No functionality blocker was observed,
and no further T24A implementation patch is required before moving forward.

T25B local schema/seed foundation is recorded in
`docs/ops/fbmvp-t25b-hub-channel-board-type-dfw-seeds.md`. It adds only the
`hub_channel` board type and six DFW child board seed rows under the existing
DFW parent `base_board`. It does not add UI routes, post reads, composer
behavior, comments, reports, moderation review changes, channel RPCs, broad
database push, or deploy. DB/RPC-backed Channels remain incomplete until later
channel-aware RPC and UI tickets.

T25B targeted runtime apply is recorded in
`docs/ops/fbmvp-t25b-hub-channel-board-type-dfw-seeds-runtime-apply.md`.
The intended `jmpseat` Supabase runtime now has the `hub_channel` board type and
six DFW child channel boards. The runtime apply used targeted SQL execution
only, recorded exactly `20260611183000 create_hub_channel_board_type_dfw_seeds`,
and did not use broad database push, deploy, or app code changes. The child
channel boards now have a real Channels overview metadata route from T26A, but
channel-aware post RPCs remain future work.

T26A local implementation is recorded in
`docs/ops/fbmvp-t26a-hub-channel-list-read-route.md`. It adds a safe
`public.list_open_hub_channels(p_base_code text)` metadata RPC, a server helper,
and the protected `/app/hubs/dfw/channels` overview route. It does not add
channel post list/read/create/detail behavior, composer behavior, comments,
reports, moderation review changes, request/create channel workflow, broad
database push, or deploy.

T26A targeted runtime apply is recorded in
`docs/ops/fbmvp-t26a-hub-channel-list-read-route-runtime-apply.md`. Runtime now
has `public.list_open_hub_channels(p_base_code text)`. The apply used targeted
SQL execution only, inserted the exact ledger row
`20260611203000 create_hub_channel_list_read_rpc`, and made no app code
changes, no broad `supabase db push`, no migration repair, no `apply_migration`,
and no deploy. Authenticated browser smoke for `/app/hubs/dfw/channels` later
passed as functional route smoke with UI/UX polish deferred.

T26B local implementation is recorded in
`docs/ops/fbmvp-t26b-channel-thread-list-read-foundation.md`. It adds
`public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer default 20)`,
a server helper, a protected selected-channel route at
`/app/hubs/dfw/channels/[channelSlug]`, and links from channel overview rows
into selected-channel routes. It reads published posts by
`board_posts.board_id` on the resolved `hub_channel` board and does not use
`board_posts.category` as channel membership.

T26B targeted runtime apply is recorded in
`docs/ops/fbmvp-t26b-channel-thread-list-read-foundation-runtime-apply.md`.
Runtime now has
`public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer)`.
The apply used targeted SQL execution in one explicit transaction, added only
ledger row `20260611214500 create_hub_channel_post_list_rpc`, and did not use
broad database push, migration repair, `apply_migration`, deploy, app code
changes, staging, or commit. Selected-channel browser smoke later passed as
functional route smoke with safe empty states where no channel posts exist.

T26C local implementation is recorded in
`docs/ops/fbmvp-t26c-channel-post-detail-read-foundation.md`. It adds
`public.get_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid)`,
a server helper, a protected selected-channel post detail route at
`/app/hubs/dfw/channels/[channelSlug]/[postId]`, and links from selected-channel
thread-list rows into detail routes. It reads one published post by
`board_posts.board_id` on the resolved `hub_channel` board and does not use
`board_posts.category` as channel membership. T26C targeted runtime apply is
recorded in
`docs/ops/fbmvp-t26c-channel-post-detail-read-foundation-runtime-apply.md`;
runtime now has
`public.get_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid)`.
Browser smoke remains pending; composer, comments, reports, moderation review
changes, Request a Channel workflow, DFW Today/Base/Layover baselines, broad
database push, and deploy remain out of scope.

T26D local implementation is recorded in
`docs/ops/fbmvp-t26d-channel-composer-create-foundation.md`. It adds
`public.create_open_hub_channel_post(p_base_code text, p_channel_slug text, p_title text, p_body text, p_content_type text default null, p_category text default null)`,
a server action, and the selected-channel title/body composer on
`/app/hubs/dfw/channels/[channelSlug]`. It resolves the selected active
member-postable `hub_channel` board server-side and inserts posts with
`board_posts.board_id`, not `board_posts.category`. T26D targeted runtime apply
is recorded in
`docs/ops/fbmvp-t26d-channel-composer-create-foundation-runtime-apply.md`;
runtime now has
`public.create_open_hub_channel_post(p_base_code text, p_channel_slug text, p_title text, p_body text, p_content_type text, p_category text)`.
Browser smoke remains pending; comments, reports, moderation review changes, Request a
Channel workflow, DFW Today/Base/Layover baselines, broad database push, and
deploy remain out of scope.

The current DFW Hub + Channels foundation checkpoint is recorded in
`docs/ops/fbmvp-checkpoint-dfw-hub-channels-foundation-level-set.md` at
`0249e0d`. It records that T25B/T26A are implemented, runtime-applied, and
documented. Later docs record that authenticated browser smoke for
`/app/hubs/dfw/channels` passed and stale tests were cleaned. T26B starts with
channel thread-list reads, not composer or comment/report expansion.

Alternative implementation ticket:

`FBMVP-T23: DFW Hub Channels Foundation`

Use this if implementation proceeds directly. Scope it to the `hub_channel`
board type, seeded DFW child channel boards, and safe channel-aware RPCs.

Prior ticket:

`FBMVP-T21: DFW Hub Product Framing` is implemented locally in the product
shell. This ticket is UI/product framing only and does not require a runtime
migration.

Runtime smoke: manual beta UI smoke passed for commit
`8abf799 feat: reframe dfw surface as hub`. The smoke confirmed DFW Hub, DFW
Today, Base, Layover, Channels, Request a Channel inside Channels, and Recent
Useful Threads render. The surface still has expected UX debt and should not be
treated as final Hub UX completion.

Scope:

- Convert DFW Baseboard product framing to the DFW Hub shell.
- Introduce `DFW Today`, `Base`, `Layover`, `Channels`, and
  `Recent Useful Threads` sections.
- Place `Request a Channel` as an in-section action inside `Channels`.
- Preserve existing posts, comments, reporting, and moderation primitives.
- Do not remove existing safety controls.
- Do not introduce free user-created channels yet.
- Do not rename database tables unless separately planned as a later internal
  refactor.

Acceptance boundaries:

- docs and UI copy may shift from Baseboard-first to Hub-first language.
- existing runtime primitives remain available behind their current safe
  gates.
- no runtime migration is required unless implementation discovers a narrow,
  repo-backed need.
- no new public sharing, schedule scraping, crew tracking, proof-upload,
  unrestricted channel creation, or generic social-feed behavior is introduced.

Implementation note:

- Existing internal route, helper, RPC, and table names may still use
  Baseboard/board terminology. T21 intentionally changes product framing first
  and leaves internal naming alone to avoid churn and preserve runtime safety.
- The existing `/app/hubs/dfw/baseboard` route now represents `DFW Channels`
  and `Recent Useful Threads` product framing while continuing to use the
  proven post/comment/report/moderation primitives.
- The real `/app/hubs/dfw/channels` route now represents DFW Channels metadata;
  selected-channel thread lists are implemented through
  `/app/hubs/dfw/channels/[channelSlug]`; selected-channel post detail is
  implemented at `/app/hubs/dfw/channels/[channelSlug]/[postId]` with runtime
  apply complete and browser smoke still pending.
- The existing `/app/hubs/dfw/layovers` route is framed as `DFW Layover`.
- The existing `/app/hubs/dfw/crew-picks` route is framed as
  `Recent Useful Threads`.
- The existing `/app/hubs/dfw/lounges` route remains preserved as a restricted
  membership-gated route, but it is not part of the open Hub section model.

Runtime-smoke follow-up:

- `Request a Channel` is currently too visually prominent and should become a
  lower-priority secondary action inside Channels.
- The shell remains placeholder-heavy and card stacking needs polish.
- Channels should later be restructured around common thread creation, reading,
  replies, and eventual reaction/signal patterns.
- Existing test/seed post content is not real production UGC and is not a
  data-migration blocker.
- Do not start free channel creation, media/photo uploads, or live
  weather/traffic integrations without separate scope.
