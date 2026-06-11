# 05B First-Base MVP Planning

Date: 2026-06-08

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This is the controlling planning note for the current `05B / First-Base MVP`
implementation lane.

Use this doc when deciding what the first code tickets should build right now.
Do not treat older broad V1 or full-beta docs as the immediate implementation
lane unless this doc or a newer controlling roadmap doc explicitly says so.

## 2. Current 05B Interpretation

`05B / First-Base MVP` is the first launch package for the personalized
aviation-worker utility/community network. It is not broad V1, and DFW is not
the whole product concept.

Current DFW framing:

- first launch base: DFW
- first available community/data primitive: DFW Base Board / Baseboard
- DFW is the only live base in the initial rollout
- the data model should support many bases and boards from the start
- post-T20 product framing should pivot toward `DFW Hub` as a curated,
  read-heavy utility surface with scoped community participation underneath

The current MVP direction includes:

- airport/base Hubs
- `[AIRPORT] Today`
- Base
- Layover
- Channels
- Recent Useful Threads
- Verified Lounges / role-based spaces under or associated with bases
- user profiles
- following users
- following boards
- posting
- commenting/replies
- sharing
- saving posts
- liking/upvoting/useful-marking posts, with final brand terminology still
  undecided
- useful/trending posts inside base boards
- search across posts, comments, boards, base intel, and admin/AI-maintained
  information

The first implementation steps should build toward that model without trying to
ship every surface in the first code ticket.

Use `docs/strategy/base-board-product-definition.md` as the canonical product
definition for what a Base Board is. In short, a Base Board is the main
verified hub/container for an aviation base. It combines structured base intel,
searchable community posts, useful/trending knowledge, related Layover Boards,
and restricted Verified Lounges; it is not one thread, not a generic social
feed, and not only a static wiki.

Use `docs/strategy/home-base-board-follow-decision.md` as the canonical
decision note for Home Base and Board Follow behavior before implementing
`FBMVP-T06`.

Use `docs/strategy/home-dashboard-product-definition.md` as the canonical
product definition for the first private-app Home Dashboard before
implementing `FBMVP-T07` or `FBMVP-T08`.

Use `docs/strategy/verified-lounge-access-model.md` as the canonical product
definition for Verified Lounge access, request lifecycle, and Crew Lead scope
before implementing `FBMVP-T07`.

Use `docs/ops/hub-pivot-plan.md` as the current controlling post-T20 product
direction for Hub naming and IA. The approved direction pivots away from raw
mixed Baseboards toward airport/base Hubs with `[AIRPORT] Today`, Base,
Layover, Channels, an in-section Request a Channel action, and Recent Useful
Threads.

Use `docs/ops/fbmvp-t21-dfw-hub-product-framing-runtime-smoke.md` and
`docs/ops/fbmvp-t22-hub-channels-ia-data-model-lock.md` as the current
controlling post-T21 docs for Hub implementation planning. T21 records the
manual beta UI smoke and expected UX debt. T22 locks the Channels IA/data-model
decision: reuse/extend `public.boards` as child channel boards rather than
creating a standalone `channels` table yet.

Wireframe agents should use the current product language `[AIRPORT] Hub`,
`[AIRPORT] Today`, Base, Layover, Channels, Recent Useful Threads, and Request
a Channel inside Channels. DFW default Channels are DFW Questions, Commuting &
Parking, Food & Coffee, New to DFW, Base Life, Crew Tips, and App Feedback.
Do not design around real UGC yet; none exists in production.

Use `docs/strategy/hub-board-taxonomy.md` as historical/canonical background for
the first Hub shell and existing T08-T11 route taxonomy, but do not treat
Baseboard as the main public-facing product concept for the next implementation
ticket.

Use `docs/strategy/seeded-layovers-editorial-model.md` as the canonical
editorial/product definition for Seeded Layovers before creating seeded layover
content, content schema, or destination utility surfaces beyond placeholder
routes.

## 3. Personalized App Experience

The MVP user experience is personalized:

- users may set a Home Base for personalization, but Home Base is not required
  app access state and not authorization truth
- the initial rollout should not show a fake one-option Home Base picker
- after work-email verification in the DFW-only rollout, users should choose
  Start with DFW or Skip for now
- Start with DFW should set Home Base to DFW and automatically follow the DFW
  Base Board
- Skip for now should create no Home Base preference, require no automatic
  board follow, and still allow app entry when the real gates pass
- users without Home Base should later see an exploratory/default experience
- users can follow other base boards
- users can follow layover boards
- users can follow Verified Lounges only when access/membership permits
- the app home should eventually reflect followed boards, home base,
  saved/useful content, followed users, Verified Lounge memberships, and
  relevant updates
- the Home Dashboard should be a utility dashboard, not a generic social feed
- the canonical Home Dashboard hierarchy is search, Home Base / Hub, Crew
  Picks, Following, Your Lounges, and Saved
- search is a persistent/global affordance near the top, not a normal content
  section
- Crew Picks are saved-driven/admin-curated useful posts, guides, answers, or
  updates rather than generic trending posts

Following a board does not grant restricted access. Self-declared profile
fields such as `claimed_base`, `claimed_airline`, and `claimed_role` must not
become authorization truth.

Canonical onboarding order for the initial DFW-only rollout:

1. Create account
2. Confirm account
3. Complete basic profile
4. Verify work email
5. Choose Start with DFW or Skip for now
6. If starting with DFW, set Home Base to DFW and auto-follow DFW Base Board
7. If skipping, keep no Home Base preference and no required auto-follow
8. Enter the jmpseat Home dashboard or exploratory/default app experience

Canonical onboarding order for a future multi-base rollout:

1. Create account
2. Confirm account
3. Complete basic profile
4. Verify work email
5. Select Home Base from active bases, or skip if Home Base remains optional
6. Enter the jmpseat Home dashboard or exploratory/default app experience

## 4. Utility Layer / Board Intel

Base boards should support structured base intel/wiki sections.

Board intel/wiki is structured content attached to a board. It is not a board
type.

Examples:

- basic airport/base information
- commuting
- parking
- reserve life
- food
- transit
- safety/weather/service alerts where appropriate

This content may be maintained by founders/admins and assisted by AI later.
AI-assisted updates must be server-side/admin-controlled and should not
auto-publish sensitive or operationally risky content without review.

## 5. Verified Lounges

Each base may have role-based or restricted lounges, such as Flight Attendants,
Pilots, New Hire Survival, Commuters, or similar spaces.

Verified Lounges are not generic global chat rooms. They are base-associated,
role-based, or otherwise restricted spaces with scoped access rules.

Board/community admins can be appointed to approve or deny access to these
spaces. Community-admin powers are scoped and separate from operator/platform
admin powers.

The product-facing name for lounge/community admins is `Crew Lead`. Crew Leads
are scoped to specific lounges or boards and must not receive platform
operator/admin powers, proof-system access, waitlist metrics access, or
unrelated moderation authority.

Any verified jmpseat user may request access to a visible/requestable lounge,
but requesting access does not mean the user qualifies. Lounge access requires
approved membership. Home Base, board follows, and self-declared
`claimed_airline`, `claimed_role`, or `claimed_base` must not grant lounge
access.

Use request threads or request comments for limited access-review messages.
Do not model lounge requests as a general direct-message system.

## 6. Posting, Engagement, And Search

Text-first posting and commenting are part of the MVP.

Engagement should be modeled generically until the product chooses canonical
jmpseat terminology for reactions, likes, upvotes, or "useful" marks.

TODO: define canonical jmpseat reaction terminology before final user-facing
copy and analytics naming are locked.

Search is part of the MVP vision. It should cover useful content across the app,
including posts/comments, boards, base info/wiki, and layover intel. Search
should support quick information retrieval by base/board and must respect
access controls and restricted-board visibility.

For dashboard ordering and destinations, use
`docs/strategy/home-dashboard-product-definition.md`.

## 7. Current First Slice

The first slice is a launchable path toward the fuller MVP:

- DFW as the first launch base
- DFW Base Board as the first available base board
- data model support for many bases and boards
- airline-email gated app eligibility
- board follows/home-base preference foundation
- restricted lounge memberships and access requests
- board-scoped community-admin approval
- text-first posts/comments later in the sequence
- saves/reactions/useful/trending later in the sequence
- access-aware search later in the sequence
- reporting/moderation before real member-generated content exposure

This lane does not start with a generic social feed, broad room expansion, or
marketplace surface.

## 8. First Code Ticket

The first implemented code ticket in this lane is:

- `FBMVP-T05: Base, Board, And Board-Type Data Model Design`

Current implementation note:

- T05 creates the initial database/model foundation only.
- T05 is merged in repo history and the targeted Supabase runtime apply pass is
  recorded in `docs/ops/fbmvp-t05-base-board-runtime-pass.md`.
- T05 seeds DFW as the first launch base and DFW Base Board as the first
  available board.
- T05 seeds the controlled board types `base_board`, `layover_board`, and
  `verified_lounge`.
- T05 does not add board follows, home-base preferences, lounge memberships,
  access requests, posts, comments, saves, reactions, search, reports, or
  moderation.
- T06 should follow the Home Base / Board Follow decision note, including the
  rule that Home Base auto-follows the matching Base Board while neither Home
  Base nor board follows grant restricted access.
- T06 should support the optional initial DFW-start behavior first and leave
  real multi-base selection/switching support ready for later active-base
  rollout.
- T07/T08 should use the Home Dashboard product definition so restricted
  lounges and the read-only DFW Base Board shell fit into the same utility
  hierarchy.

Current T06 implementation note:

- T06 is implemented and merged as the Home Base preference and board follow
  data foundation.
- The intended Supabase runtime already has the base T06 schema/functions
  recorded as remote migration
  `20260609194858 create_home_base_board_follows`.
- The local repo file remains
  `20260609130534_create_home_base_board_follows.sql`; do not re-apply it and
  do not mark `20260609130534` applied retroactively.
- Follow-up migration
  `20260609200310_harden_home_base_rpc_execute_grants.sql` removes explicit
  `anon` EXECUTE from the three T06 RPCs while preserving authenticated and
  service-role execution. That hardening is runtime-applied and recorded in
  `docs/ops/fbmvp-t06-home-base-board-follows-runtime-pass.md`.
- It adds optional Home Base preference state, board follows, an authenticated
  `set_user_home_base(p_base_code text)` RPC, and server-only helpers.
- The RPC sets the authenticated user's active Home Base and auto-follows the
  matching active Base Board.
- If the user skips the initial DFW-start choice, no Home Base preference or
  automatic board follow is required.
- Missing Home Base must not block app access after work-email and other real
  app-entry gates pass.
- It keeps old board follows when Home Base changes.
- It does not implement onboarding UI, dashboard UI, manual follow/unfollow UI,
  restricted lounge membership/access approval, posts, comments, saves,
  reactions, search, reports, or moderation.
- Future runtime schema changes must still use targeted apply because known
  Supabase migration-history drift remains.

Current T07 implementation note:

- T07 is implemented and runtime-applied as the Verified Lounge
  membership/access request data foundation.
- The runtime pass is recorded in
  `fbmvp-t07-lounge-access-runtime-pass.md`.
- Runtime migration history includes
  `20260609220055 create_lounge_access_foundation`.
- It adds `lounge_memberships`, `lounge_access_requests`,
  `lounge_request_comments`, and `lounge_admin_grants`.
- `lounge_memberships` is the future restricted lounge access truth.
- `lounge_access_requests` records request state, but requesting access does
  not grant access.
- `lounge_request_comments` is a request-scoped thread model, not full direct
  messaging.
- `lounge_admin_grants` is the neutral internal table for board-scoped Crew
  Lead grants.
- The migration enables RLS and adds conservative authenticated read policies
  for users and active Crew Leads.
- Direct write policies are intentionally deferred; request creation, review,
  approval, denial, revocation, and comments should use later server-side or
  RPC-controlled paths with audit events.
- T07 does not implement dashboard UI, request UI, Crew Lead panel UI,
  restricted lounge content gates, posts, comments, saves, reactions, search,
  reports, moderation, AI, marketplace/deals, or proof-upload scope.
- The runtime pass used targeted apply only; known Supabase migration-history
  drift remains and still blocks broad `supabase db push`.

Current T08 implementation note:

- T08 adds the first read-only Home Dashboard shell at `/app` after the
  existing private app gates pass.
- T08 adds a read-only DFW Hub destination shell at `/app/hubs/dfw`.
- It uses the T06 Home Base helper only to read optional Home Base state.
- Users with DFW Home Base see the DFW Hub / Home Base card.
- Users with no Home Base see a skip-for-now/default state with no fake DFW
  assignment and no app-entry block.
- Product-facing labels follow the Hub taxonomy: Hub, Baseboard, Layovers,
  Lounges, and Crew Picks.
- The DFW Hub card opens the read-only DFW Hub shell.
- T10 links DFW Hub section cards to read-only child routes for Baseboard,
  Layovers, Lounges, and Crew Picks.
- T08 does not add migrations, dashboard mutations, board discovery,
  follow/unfollow UI, posts/comments, saves,
  reactions, search backend, lounge request/review flows, Crew Lead panel UI,
  AI, seed content, or proof-upload scope.
- T09 adds the narrow Start with DFW mutation path through the existing T06
  Home Base RPC/helper without adding schema or restricted-access behavior.
- T10 does not add posting, comments, search backend, saves/reactions, Crew
  Picks ranking, lounge request/review flows, Crew Lead panel UI, AI, seed
  layover content, migrations, or proof-upload scope.

Rationale:

- no current board/community schema exists
- no current community routes or UI exist
- the repo already has auth, profile, beta-access, airline-email eligibility,
  and operator/admin foundations to build on
- the data model must support bases, boards, board types, follows,
  subscriptions, memberships, access requests, community-admin grants, and
  future posts/comments/saves/reactions/search without creating a dead-end
  schema
- T05 does not implement every MVP feature; it makes the foundation model-aware

Product-facing navigation should treat DFW as the first Hub:

- DFW Hub
- DFW Today
- Base
- Layover
- Channels
- Recent Useful Threads

For MVP, DFW Hub is the first launch surface, but the approved post-T20 model is
not DFW-only. Each airport/base should have a Hub. Layover content is canonical
inside the airport Hub as the Layover section. A DFW-based user can discover MIA
Layover through search, recommendations, or popular layovers, but the canonical
home is MIA Hub > Layover, not DFW Hub > MIA Layover.

Channels contain focused scoped discussion. `Request a Channel` is an action
inside the Channels section, not a top-level Hub section. Users should not
freely create channels in V1; admin/founder approval is required.

## 9. Ordered Ticket Sequence

The current implementation sequence is:

1. `FBMVP-T05` base, board, and board-type data model, merged and runtime-applied
2. `FBMVP-T06` Home Base preference and board-follow foundation, merged and runtime-hardened
3. `FBMVP-T07` restricted lounge membership/access request/Crew Lead foundation, merged and runtime-applied
4. Hub / Board taxonomy, governing board discovery and dashboard destinations
5. `FBMVP-T08` Home Dashboard and DFW Hub read-only shell
6. `FBMVP-T09` Start with DFW Home Base action
7. `FBMVP-T10` DFW Hub section read-only route shells
8. `FBMVP-T11` Seeded Layovers strategy and editorial model
9. `FBMVP-T12` shared posts/threads foundation, merged and runtime-applied
10. `FBMVP-T13` server-controlled create-post foundation, merged and runtime-applied
11. `FBMVP-T14` board post read foundation, merged and runtime-applied
12. `FBMVP-T15` minimal DFW Baseboard post composer, merged and runtime-applied
13. `FBMVP-T16` board post safety foundation, merged and runtime-applied
14. `FBMVP-T17` DFW Baseboard post detail, merged and runtime-applied
15. `FBMVP-T18` DFW Baseboard moderation review, merged and runtime-applied
16. `FBMVP-T19` DFW Baseboard comments foundation, merged and runtime-applied
17. `FBMVP-T20` DFW Baseboard comment reporting/moderation review integration, merged and runtime-applied
18. `FBMVP-T21` DFW Hub product framing, implemented locally with no migration
19. `FBMVP-T22` Hub Channels IA/data-model lock, docs-only

T20 runtime-pass docs are committed. The First Base / DFW Baseboard safety loop
is complete. The approved pivot is recorded in `ops/hub-pivot-plan.md`.
Baseboards should no longer be treated as open mixed discussion boards. The next
implementation ticket should convert DFW Baseboard product framing to the DFW
Hub shell, introduce DFW Today / Base / Layover / Channels / Recent Useful
Threads, place Request a Channel inside Channels, preserve existing
posts/comments/reporting/moderation primitives, avoid free user-created
channels, and avoid database table renames unless separately planned.

T21 implements that product-framing step locally with no migration. Existing
internal Baseboard route, RPC, helper, and table names remain in place while the
user-facing DFW Hub shell presents DFW Today, Base, Layover, Channels, Request a
Channel inside Channels, and Recent Useful Threads.

T21 post-deploy manual beta UI smoke passed for commit
`8abf799 feat: reframe dfw surface as hub`: DFW Hub, DFW Today, Base, Layover,
Channels, Request a Channel inside Channels, and Recent Useful Threads rendered.
This is a shell/framing pass with expected UX debt, not final Hub UX completion.
Request a Channel should become a lower-priority secondary action inside
Channels. Existing test/seed post content is not production community UGC and is
not a data-migration blocker.

T22 locks the real Channels model before implementation. Existing
`public.boards` can partially model Channels and should be reused/extended:
Hub maps to `public.bases` plus the current parent/base board container,
Channel maps to child `public.boards` rows under the DFW base board, Thread
maps to `public.board_posts`, Comments map to `public.board_post_comments`, and
reports/moderation continue to use the existing post/comment primitives.
`board_posts.category` alone is too weak for real Channels. Future DB/RPC work
should add a `hub_channel` board type, seed DFW child channel boards, and add
channel-aware safe RPCs rather than creating a standalone `channels` table now.
The recommended next ticket is `FBMVP-T23A: DFW Hub Channels UX Wireframe`
before DB implementation unless there is a strong reason to proceed directly to
`FBMVP-T23: DFW Hub Channels Foundation`.

Recommended direction:

- T12 should establish the shared Baseboard/Layovers post/thread data
  foundation first, because Layovers can reuse the same content types and
  categories instead of introducing a separate layover-specific primitive.
- T12 is runtime-applied as `20260610010000 create_board_posts_foundation`. The
  runtime pass is recorded in
  `docs/ops/fbmvp-t12-board-posts-runtime-pass.md`.
- T12 still does not implement posting UI, comments, saves, reactions, search
  backend, AI, seeded layover runtime content, or Crew Picks ranking.
- Known Supabase migration-history drift remains and still blocks broad
  `supabase db push`.
- T13 adds `public.create_board_post(...)` as a server-controlled foundation for
  active open verified Baseboards, with DFW Baseboard as the first intended
  consumer.
- T13 is runtime-applied as `20260610143547 create_board_post_rpc`. The runtime
  pass is recorded in
  `docs/ops/fbmvp-t13-create-post-runtime-pass.md`.
- T13 now requires DB-level contribution eligibility before insert; auth alone
  is not enough. The current eligibility rule requires completed profile plus
  operator internal private-app access or active beta access with verified
  work-email / aviation-worker status.
- Self-declared profile fields do not grant posting rights.
- T13 does not enable lounge/restricted posting, comments, edits/deletes,
  saves/reactions, search backend, AI moderation, seed content, Crew Picks
  ranking, or full posting UI.
- T14 is runtime-applied as `20260610162000 create_board_post_read_rpc`. The
  runtime pass is recorded in
  `docs/ops/fbmvp-t14-board-post-read-runtime-pass.md`.
- T14 adds read-only DFW Baseboard post rendering with safe handle-only author
  labels and `jmpseat member` fallback, plus an empty state when no published
  posts exist.
- T14 does not add a composer, post creation UI, comments, saves, reactions,
  search, lounge/restricted content, seeded layover implementation,
  proof-upload scope, user/community content creation, deploy, or runtime
  setting changes.
- T15 is runtime-applied as `20260610182000 create_open_baseboard_post`. The
  runtime pass is recorded in
  `docs/ops/fbmvp-t15-minimal-post-composer-runtime-pass.md`. It adds a minimal
  DFW Baseboard title/body composer through a server action only. The wrapper
  RPC resolves DFW by base code to the active `open_verified` `base_board`, then
  delegates to T13 `public.create_board_post(...)`, so T13 DB-level contribution
  eligibility remains final authority.
- T15 does not add comments, saves/reactions, search backend, moderation queue,
  lounge/restricted posting, Layovers seeded content, Crew Picks ranking,
  proof-upload scope, direct `board_posts` write policies, deploy, runtime
  settings changes, or content creation during validation/runtime verification.
- T16 is runtime-applied as
  `20260610191809 create_board_post_safety_foundation`. The runtime pass is
  recorded in `docs/ops/fbmvp-t16-board-post-safety-runtime-pass.md`. It adds
  minimal DFW Baseboard reporting, a private
  `board_post_reports` table, `public.report_open_baseboard_post(...)`, and
  operator-scoped `public.moderate_open_baseboard_post(...)` for hide/remove
  actions using `operator.community_moderation`.
- T16 preserves zero direct board_posts write policies. Hidden/removed posts
  are excluded from current read surfaces because T14 reads only published
  board-visible posts.
- T16 does not add post detail, comments, saves/reactions, search backend,
  moderation queue UI, AI moderation, bans, lounge/restricted posting, Layovers
  seeded content, Crew Picks ranking, public sharing, media, proof-upload scope,
  deploy, runtime settings changes, or T16-created posts/reports/moderation
  records during migration/apply. Runtime verification found
  `public.board_post_reports` count `0` and `public.board_posts` count `1`; the
  existing post is user-created test content separate from the T16
  migration/apply.
- T17 is runtime-applied as
  `20260610203000 create_open_baseboard_post_detail_rpc`. It adds a read-only
  DFW Baseboard post detail route at `/app/hubs/dfw/baseboard/[postId]`, using
  the private route gate and a safe DB read RPC by post id. The runtime pass is
  recorded in `docs/ops/fbmvp-t17-dfw-baseboard-post-detail-runtime-pass.md`.
- T17 returns safe fields only, uses `profiles.handle` with `jmpseat member`
  fallback for author labels, includes the existing report affordance, and
  keeps hidden/removed posts excluded because reads filter to published /
  board-visible posts.
- T17 does not add comments/replies, saves/reactions, search backend,
  moderation queue UI, public sharing, lounge/restricted posting, Layovers
  content, Crew Picks ranking, media, AI moderation, bans, proof-upload scope,
  direct `board_posts` write policies, deploy, runtime settings changes, or
  content/report/moderation record creation during validation/runtime
  verification.
- T17 runtime verification used catalog/count checks only. No post content was
  read or printed. `public.board_posts` count was `1`, and
  `public.board_post_reports` count was `0`. No posts, reports, moderation
  records, comments, replies, saves, reactions, search indexes, or
  user/community content were created by T17 migration/apply.
- T18 is runtime-applied as
  `20260610235111 create_board_post_report_review_rpc`. The runtime pass is
  recorded in
  `docs/ops/fbmvp-t18-dfw-baseboard-moderation-review-runtime-pass.md`. It adds an
  operator-scoped DFW Baseboard moderation review route at
  `/app/admin/community-moderation`, app-side `operator.community_moderation`
  support, a safe report review RPC, and a server action that calls existing T16
  `public.moderate_open_baseboard_post(...)` for hide/remove only.
- T18 uses the existing T16 report/moderation foundation, preserves zero direct
  `board_posts` write policies, and does not expose reporter identity or
  sensitive verification/proof data.
- T18 does not add comments/replies, saves/reactions, search backend, Crew
  Picks, Layovers, public sharing, appeal workflow, bans, AI moderation,
  proof-upload scope, comment moderation, deploy, runtime settings changes, or
  content/report/moderation record creation during local validation or runtime
  apply.
- T18 runtime verification used catalog/permission/count checks only. The review
  RPC was not called for content smoke, and no report details, post title, post
  body, author labels, reporter information, or runtime content was read or
  printed. `public.board_posts` count was `1`, and
  `public.board_post_reports` count was `0`. No posts, reports, moderation
  records, comments, replies, saves, reactions, search indexes, or
  user/community content were created by T18 migration/apply.
- Known Supabase migration-history drift remains and broad `supabase db push`
  remains unsafe.
- Moderation/reporting remains required before broad beta posting expansion.
- T19 is runtime-applied as
  `20260611001000 create_board_post_comments_foundation`. It adds top-level DFW
  Baseboard comments on post detail through safe read/create RPCs and an
  operator-scoped comment hide/remove RPC for comment safety.
- T19 includes a server-side operator-scoped comment moderation action that wraps
  `public.moderate_open_baseboard_post_comment(...)`, uses `p_base_code = "DFW"`,
  requires `operator.community_moderation`, validates comment UUID plus
  `hide`/`remove` and bounded reason, records a security event without exposing
  post/comment content, and revalidates only safe relevant routes.
- T19 preserves the private DFW route gate, requires T13-equivalent contribution
  eligibility for comment creation, preserves zero direct `board_posts` write
  policies, and avoids direct anon/authenticated comment table writes.
- T19 does not expose author IDs, emails, claimed fields, verification/proof
  data, reporter identity, signed URLs, private paths, removal fields, or
  moderation metadata through comment reads.
- T19 does not add nested replies, comment reporting, comment moderation review
  UI, a comment moderation queue, saves/reactions, search backend, Crew Picks,
  Layovers, public sharing, lounge/restricted posting, media, AI moderation,
  bans, appeals, proof-upload scope, deploy, runtime settings changes, or
  content/comment/moderation record creation during local validation or runtime
  apply.
- T19 runtime verification used catalog/permission/schema/count checks only.
  Comment create/read/moderation RPCs were not called for live row output, and
  no comment/post/report content was read or printed. `public.board_posts` count
  was `1`, `public.board_post_reports` count was `0`, and
  `public.board_post_comments` count was `0`.
- Broad Supabase `db push` remains unsafe due known migration drift.
- T20 is runtime-applied as
  `20260611014500 create_board_post_comment_reports`. The runtime pass is
  recorded in
  `docs/ops/fbmvp-t20-dfw-baseboard-comment-reporting-review-runtime-pass.md`.
  It adds private comment report storage, safe comment report/review RPCs,
  compact comment report UI on top-level comments, and a separate comment
  reports section in `/app/admin/community-moderation`.
- T20 uses `operator.community_moderation` and the existing T19 comment
  hide/remove moderation action/RPC for decisions.
- T20 hides reporter identity by default, preserves zero direct `board_posts`
  write policies, and avoids direct anon/authenticated comment report table
  access.
- T20 does not add nested replies, saves/reactions, search backend, Crew Picks,
  Layovers, public sharing, lounge/restricted posting, media, AI moderation,
  bans, appeals, proof-upload scope, deploy, runtime settings changes, or
  content/report/comment/moderation record creation during local validation or
  runtime apply.
- T20 runtime verification confirmed RLS on the comment report table, no direct
  anon/public/authenticated table access, service-role table access only,
  expected report constraints/indexes/triggers, and safe report/review RPC
  grants.
- T20 runtime verification used catalog/permission/schema/count checks only. No
  comment report/review RPCs were called for live row output, and no
  post/comment/report content, author labels, reporter information, user IDs, or
  runtime content was read or printed. `public.board_posts` count was `1`,
  `public.board_post_reports` count was `0`, `public.board_post_comments` count
  was `0`, and `public.board_post_comment_reports` count was `0`.
- Known migration drift remains preserved and broad Supabase `db push` remains
  unsafe.
- T20 runtime-pass docs are committed. The First Base / DFW Baseboard safety
  loop is complete. The approved Hub pivot direction is recorded in
  `ops/hub-pivot-plan.md`. The next implementation ticket should be DFW Hub
  product framing, not another raw Baseboard feature: introduce DFW Today,
  Base, Layover, Channels, and Recent Useful Threads, with Request a Channel as
  an in-section Channels action and no free user-created channels.
- T21 implements that product framing locally without migrations, runtime
  mutation, database table renames, free user-created channels, live
  weather/traffic integrations, image uploads, or safety-control weakening.
  Existing posts, comments, reporting, and moderation primitives remain the
  internal foundation for Channels and Recent Useful Threads.
- T21 runtime smoke is documented in
  `ops/fbmvp-t21-dfw-hub-product-framing-runtime-smoke.md`. The next narrow
  implementation lane should follow
  `ops/fbmvp-t22-hub-channels-ia-data-model-lock.md`: prefer
  `FBMVP-T23A: DFW Hub Channels UX Wireframe` before DB implementation while
  localhost inspection is unavailable and wireframes are being generated
  externally. If implementation proceeds directly, use `FBMVP-T23: DFW Hub
  Channels Foundation` with child `boards` rows and channel-aware RPCs. Do not
  start free channel creation, media/photo uploads, or live weather/traffic
  integrations without separate scope.

Pre-closeout access baseline: public `jmpseat.com` and `www.jmpseat.com` are
marketing/waitlist-only through `bad2110 fix: gate private app on public
domain`. Public-domain `/app` and private-beta auth entry paths redirect
server-side to `/` and must not expose sign-in or private-app entry surfaces.
Private app entry belongs on `beta.jmpseat.com`, and protected beta surfaces
remain server-gated by auth, beta access, profile completion, verification
state, and route-specific authorization. `/app/admin` is also fixed by
`5e65f7b fix: require admin authorization for admin shell`: after the private
app gate, it requires reviewer authorization or an active operator grant.
Signed-out admin access redirects to login. A logged-in non-admin admin-shell
browser check remains a pre-beta-launch verification item once a non-admin beta
test user exists; it is not a reason to keep the First Base / DFW Baseboard
epoch open. Longer term, prefer separate Vercel projects/deployments, or at
least separately configured deployments, for public marketing and private beta
app surfaces.

## 10. Authorization Rules To Preserve

- Self-declared profile fields must not become authorization truth.
- Airline-email verification grants broad app eligibility only.
- Airline-email verification does not grant restricted-board membership.
- Restricted-board access must come from board membership plus
  community-admin approval.
- Community-admin grants must remain separate from operator grants.
- Moderation/reporting/admin controls are required before exposing real
  member-generated content.

## 11. Safety And Moderation Boundaries

Reporting/moderation/admin controls are required before broad real UGC exposure.
Aviation safety and privacy boundaries still apply:

- no exact public crew hotel exposure
- no passenger private information
- no airport security procedures
- no live operations-sensitive information
- no airline portal login or scraping

## 12. Explicitly Out Of Scope For The First Slice

- proof uploads
- manual proof/document uploads
- generic social feed
- generic global Crew Rooms expansion
- media/upload posting unless explicitly approved
- anonymous posting unless separately approved
- AI auto-publishing or AI final verification/moderation decisions
- deals/perks marketplace
- full mobile implementation
- schedule scraping
- airline portal login
- public live crew tracking
- exact public crew hotel exposure

Proof-upload hardening remains historically documented, but it is not active
current scope for this lane.

## 13. How To Read Older Docs

Read the following as broader/full-beta or later-lane references unless they
are explicitly narrowed by this doc or a newer controlling roadmap note:

- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/MVP_SCOPE.md`
- `docs/FIRST_RELEASE_MVP.md`

Those docs remain useful for later scope, policy gates, and broader product
direction. They should not pull the first 05B implementation slice wider than
the sequence above.
