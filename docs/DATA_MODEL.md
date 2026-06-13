# Data Model

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

This is a first-pass implementation-ready model. It is intentionally moderate in complexity and should be refined during technical design.

## Scale-Readiness Requirement

Future schema work must follow `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`.

That means future tables and schema revisions should account for:

- indexing on high-growth tables
- pagination on user/community/admin-facing lists
- ownership and access-control fields
- moderation/report/review state where relevant
- soft-delete or status-based removal where audit history matters
- separation between auth identity, profile data, beta access, verification state, and admin/moderation state

## User

Auth-level account.

Important fields:

- id
- email
- email_verified_at
- auth_provider_id
- account_status
- is_admin
- created_at
- updated_at
- last_login_at
- deleted_at

Relationships:

- Has one Profile.
- Has many Verifications.
- Has many Posts, Comments, SavedItems, Reports, ModerationActions, and AIBriefs.
- Has one current TrustLevel.

Home Dashboard note:

- `strategy/home-dashboard-product-definition.md` defines the first
  private-app Home Dashboard as a utility dashboard, not a generic social feed.
- The dashboard should eventually use Home Base, followed boards, Crew Picks,
  lounges, saved items, and access-aware search without making any
  personalization signal authorization truth.
- `ops/fbmvp-t08-home-hub-shell.md` records the first read-only `/app` and
  `/app/hubs/dfw` shell. It reads optional Home Base state but does not add
  schema, mutations, posts/comments, saves, search backend, lounge
  request/review flows, seed content, or proof-upload scope.
- `ops/fbmvp-t09-start-with-dfw.md` records the first Home Base mutation from
  the shell. It uses the existing T06 RPC/helper to set DFW and auto-follow the
  DFW Baseboard for app-eligible users who choose Start with DFW. It does not
  add schema or make Home Base an authorization signal.
- `ops/fbmvp-t10-dfw-hub-section-shells.md` records the read-only child routes
  for DFW Baseboard, Layovers, Lounges, and Crew Picks. It does not add schema,
  posting/comments, search backend, saves/reactions, lounge requests, Crew Lead
  tooling, AI, seed content, or proof-upload scope.
- `strategy/seeded-layovers-editorial-model.md` is the controlling product and
  editorial definition for Seeded Layovers before schema or content work. It
  keeps Layovers utility-first and documents future content-type/category
  direction without creating schema in the current lane.
- `ops/fbmvp-t12-shared-post-thread-foundation.md` is the next narrow schema
  lane for shared board post/thread storage. It adds posts only, with no
  comments, saves, reactions, search backend, moderation, or seeded layover
  runtime content in the same migration.
- `ops/fbmvp-t12-board-posts-runtime-pass.md` records the targeted runtime
  application of `20260610010000 create_board_posts_foundation`. Known
  Supabase migration-history drift remains, so broad `supabase db push` remains
  unsafe.
- `ops/fbmvp-t13-create-post-foundation.md` adds the first local
  server-controlled create-post RPC for active open verified Baseboards. It is
  runtime-applied as `20260610143547 create_board_post_rpc`.
- `ops/fbmvp-t13-create-post-runtime-pass.md` records the targeted runtime
  apply for T13, including function grant verification, DB-level contribution
  eligibility, `board_posts` read/write posture, and confirmation that no
  user/community content was created.
- `ops/fbmvp-t14-board-post-read-foundation.md` adds the first read-only DFW
  Baseboard post surface through a narrow read RPC and server helper.
- `ops/fbmvp-t14-board-post-read-runtime-pass.md` records the targeted runtime
  application of `20260610162000 create_board_post_read_rpc`, including function
  grant verification, DB-level read eligibility, safe return fields,
  `board_posts` RLS/policy posture, and confirmation that no user/community
  content was created.

## Profile

Aviation identity and public display settings.

Current 05B note:

- `claimed_airline`, `claimed_role`, and `claimed_base` remain self-declared
  onboarding/profile fields only.
- Future Home Base state should be treated as optional personalization
  preference in the initial DFW-only rollout, not authorization truth.
- Home Base should not verify employment, airline, role, base assignment, or
  restricted-board eligibility.
- Self-declared airline text may be editable in profile, but future
  airline-specific boards or lounges must rely on verified airline or
  approved-domain logic rather than self-declared airline text.

Important fields:

- id
- user_id
- public_handle
- display_name
- anonymous_handle_seed
- airline_id
- role_id
- base_id
- employment_status
- bio
- is_profile_public
- created_at
- updated_at

Relationships:

- Belongs to User, Airline, Role, and Base.
- Later may have a Home Base preference and board follows used for
  personalization, not authorization.

## Verification

Aviation affiliation review.

Important fields:

- id
- user_id
- tier_requested
- tier_granted
- status
- method
- work_email_domain
- submitted_evidence_path
- evidence_redaction_confirmed
- evidence_expires_at
- reviewer_user_id
- reviewed_at
- rejection_reason
- created_at
- updated_at
- deleted_at

Relationships:

- Belongs to User.
- Reviewed by admin User.
- May create ModerationAction or audit entries.

## Airline

Airline or aviation employer.

Important fields:

- id
- name
- code
- country
- work_email_domains
- is_active
- created_at
- updated_at

Relationships:

- Has many Profiles and Bases.
- Can have CrewRooms.

## Role

Worker role.

Important fields:

- id
- name
- slug
- category
- is_active
- created_at
- updated_at

Examples:

- Flight attendant
- Pilot
- Gate agent
- Ramp agent
- Dispatcher
- Crew scheduler
- Airport operations
- Regional worker
- New hire
- Commuter

## Base

Current T05 implementation note:

- `bases` is implemented as the First-Base MVP base/airport community anchor
  table.
- The T05 runtime apply pass is recorded in
  `docs/ops/fbmvp-t05-base-board-runtime-pass.md`.
- DFW is seeded as the first launch and only live base in the initial rollout,
  but the table is designed for many bases from the start.
- Self-declared profile base text remains separate and must not become
  authorization truth.

Airline base or domicile.

Important fields:

- id
- code
- name
- airport_name
- city
- state
- country
- timezone
- status
- launch_priority
- created_at
- updated_at

Relationships:

- Can anchor many Boards.
- Can be referenced later by profile preferences or follow/home-base state.
- Does not prove a user's role, airline, or restricted-board membership.

## BoardType

Current T05 implementation note:

- `board_types` is implemented as controlled board taxonomy.
- The T05 runtime apply pass records seeded runtime board types for
  `base_board`, `layover_board`, and `verified_lounge`.
- Seeded types are `base_board`, `layover_board`, and `verified_lounge`.
- Verified Lounges are modeled as a board type.
- Board wiki/intel is not a board type; it should be structured content
  attached to boards in a later ticket.

Important fields:

- id
- key
- label
- description
- default_visibility
- default_posting_mode
- display_order
- is_active
- created_at
- updated_at

Relationships:

- Has many Boards.

## Board

Current T05 implementation note:

- `boards` is implemented as the user-facing board-space table.
- DFW Base Board is seeded as the first available board.
- The T05 runtime apply pass confirms the seeded `DFW Base Board` row exists as
  active metadata in the intended Supabase runtime.
- The table is designed for many base boards, layover boards, and restricted
  lounge boards over time.
- The canonical Base Board product definition is in
  `strategy/base-board-product-definition.md`: a Base Board is a hub/container
  for structured base intel, posts, useful/trending knowledge, related Layover
  Boards, and restricted Verified Lounges.
- The canonical Verified Lounge access model is in
  `strategy/verified-lounge-access-model.md`: a Verified Lounge is a
  restricted board associated with a base, role, airline, or other approved
  aviation-worker criteria, with approved membership required before content
  access.
- Posting, comments, follows, memberships, access requests, saves, reactions,
  search, reports, and moderation remain later tickets.
- `FBMVP-T12` is the first narrow post/thread foundation lane and should add a
  shared `board_posts` table without pulling comments, saves, reactions,
  search, or moderation into the same migration.
- `strategy/home-base-board-follow-decision.md` defines the T06 product
  boundary: setting Home Base should auto-follow the corresponding main Base
  Board, users may follow many boards, and follows must not grant restricted
  access.

Important fields:

- id
- board_type_id
- base_id
- parent_board_id
- slug
- name
- short_name
- description
- visibility
- posting_mode
- discoverability
- status
- sort_order
- created_at
- updated_at

Relationships:

- Belongs to BoardType.
- May belong to Base.
- May have a parent Board.
- Later has follows, memberships, posts, comments, saves, reactions, reports,
  moderation actions, and search indexing.
- Later has board intel/wiki structured content attached to the board. Board
  intel/wiki is not a board type.

## HubBoardTaxonomy

Product definition:

- `ops/hub-pivot-plan.md` is the current controlling post-T20 product direction
  for Hub naming and IA.
- `ops/fbmvp-t21-dfw-hub-product-framing-runtime-smoke.md` records the manual
  beta UI smoke for the first DFW Hub shell and expected UX debt.
- `ops/fbmvp-t22-hub-channels-ia-data-model-lock.md` is the current
  controlling IA/data-model decision for real Hub Channels.
- `strategy/hub-board-taxonomy.md` is historical/canonical background for the
  first Hub shell, but the approved working product language now pivots away
  from Baseboard as the main public-facing concept.
- A Hub is the product-facing top-level airport/location container.
- A Hub is not itself a discussion board.
- The working Hub sections are `[AIRPORT] Today`, Base, Layover, Channels, and
  Recent Useful Threads.
- Channels contain focused scoped discussion. `Request a Channel` is an action
  inside Channels, not a top-level Hub section, and admin/founder approval is
  required before channels are created.
- Layover content lives inside the airport Hub as the Layover section; do not
  model `Layover Guide` as a separate primary product right now.
- Boards should not recursively contain other boards by default.

Current data model implication:

- `bases` are the closest current data-model anchor for Hub-like airport/base
  containers.
- `boards` remain the existing internal content/community primitive for
  posts/comments/reporting/moderation. Do not rename database tables as part of
  the Hub product-framing pivot unless a later internal refactor separately
  plans it.
- `board_types` classify `base_board`, `layover_board`, and
  `verified_lounge`.
- Product-facing Hub navigation can be introduced before a dedicated `hubs`
  table exists.
- A future migration may add explicit Hub records if jmpseat needs location
  containers broader than aviation bases.
- T12 shared posts should attach to `boards`, allowing Baseboard, Layovers, and
  later access-aware lounge content to reuse one post/thread primitive while
  keeping product UX utility-first.
- T22 locks the recommended Channels model as reuse/extension of
  `public.boards`, not a standalone `channels` table. Hub maps to `bases` plus
  the current parent/base board container; Channel maps to child `boards` rows;
  Thread maps to `board_posts`; Comments map to `board_post_comments`; and
  reports/moderation keep using existing post/comment primitives.
- `board_posts.category` alone is too weak for real Channels because it does
  not provide channel names, slugs, descriptions, status, ordering, request
  lifecycle, or future channel-level routing/follow/access behavior.
- `FBMVP-T25B` adds a controlled `hub_channel` board type and six DFW child
  channel board seed rows under the existing DFW parent `base_board`.
  These are private-beta seed defaults, not final public-release taxonomy, and
  may change before release and before meaningful production UGC exists.
- T25B is runtime-applied as
  `20260611183000 create_hub_channel_board_type_dfw_seeds`. The runtime apply
  used targeted SQL execution only and recorded exactly that ledger row. It did
  not use broad database push, migration repair, deploy, or app code changes.
- T25B does not add channel-aware RPCs, UI routes, post reads, composer,
  comments, reports, or moderation review changes.
- `FBMVP-T26A` locally adds the first channel-aware read RPC,
  `public.list_open_hub_channels(p_base_code text)`, plus the protected
  `/app/hubs/dfw/channels` overview route. It reads active visible
  `hub_channel` child board metadata only and returns no board IDs, base IDs,
  parent board IDs, user IDs, author IDs, reporter identity, moderation fields,
  verification fields, storage paths, signed URLs, posts, comments, or reports.
- T26A does not add channel post list/read/create/detail behavior, composer,
  comments, reports, moderation review changes, request/create channel workflow,
  broad database push, or deploy.
- T26A is runtime-applied as
  `20260611203000 create_hub_channel_list_read_rpc`. The runtime apply used
  targeted SQL execution only and recorded exactly that ledger row. It did not
  use broad database push, migration repair, `apply_migration`, deploy, app code
  changes, staging, or commit. Authenticated browser/route smoke passed later
  as functional route smoke with UI/UX polish deferred.
- `FBMVP-T26B` locally adds the first selected-channel post-list read RPC,
  `public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer default 20)`,
  plus a protected `/app/hubs/dfw/channels/[channelSlug]` route.
- T26B resolves an active `hub_channel` child board under the active DFW parent
  `base_board` and lists published `board_posts` by
  `board_posts.board_id = resolved channel board id`. It intentionally does not
  use `board_posts.category` as channel membership.
- T26B returns safe thread-list fields only: `id`, `title`, `body`,
  `content_type`, `category`, `is_pinned`, `created_at`, `updated_at`, and
  `author_label`. It returns no board IDs, base IDs, parent board IDs, author
  user IDs, user IDs, emails, reporter identity, moderation internals,
  verification fields, storage paths, signed URLs, comments, or reports.
- T26B does not add channel post creation, channel post detail, composer,
  comments, reports, moderation review changes, Request a Channel workflow,
  broad database push, or deploy.
- T26B is runtime-applied as
  `20260611214500 create_hub_channel_post_list_rpc`. The runtime apply used
  targeted SQL execution in one explicit transaction, added only the matching
  ledger row, and did not use broad database push, migration repair,
  `apply_migration`, deploy, app code changes, staging, or commit. Authenticated
  browser/route smoke passed later as functional smoke with safe empty states
  where no channel posts exist.
- `FBMVP-T26C` locally adds the selected-channel post detail read RPC,
  `public.get_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid)`,
  plus a protected `/app/hubs/dfw/channels/[channelSlug]/[postId]` route.
- T26C resolves an active `hub_channel` child board under the active DFW parent
  `base_board` and reads one published `board_posts` row by
  `board_posts.board_id = resolved channel board id`. It intentionally does not
  use `board_posts.category` as channel membership.
- T26C returns safe detail fields only: `id`, `title`, `body`,
  `content_type`, `category`, `is_pinned`, `created_at`, `updated_at`,
  `author_label`, `channel_slug`, and `channel_name`. It returns no board IDs,
  base IDs, parent board IDs, author user IDs, user IDs, emails, reporter
  identity, moderation internals, verification fields, storage paths, signed
  URLs, comments, or reports.
- T26C does not add channel post creation, composer, comments, reports,
  moderation review changes, Request a Channel workflow, broad database push,
  browser smoke, or deploy.
- T26C is runtime-applied as
  `20260612024544 create_hub_channel_post_detail_rpc`. The runtime apply used
  a targeted SQL transaction, added only the matching ledger row, and did not
  use broad database push, migration repair, `apply_migration`, deploy, app
  code changes, staging, or commit. Authenticated browser/route smoke remains
  pending and may require a safe post existing on a child `hub_channel` board.
- `FBMVP-T26D` locally adds the selected-channel post create RPC,
  `public.create_open_hub_channel_post(p_base_code text, p_channel_slug text, p_title text, p_body text, p_content_type text default null, p_category text default null)`,
  plus a server action and selected-channel title/body composer on
  `/app/hubs/dfw/channels/[channelSlug]`.
- T26D resolves an active member-postable `hub_channel` child board under the
  active DFW parent `base_board` and inserts the new post with
  `board_posts.board_id = resolved channel board id`. It intentionally does not
  use `board_posts.category` as channel membership.
- T26D returns safe create-result fields only: `id`, `title`, `body`,
  `content_type`, `category`, `is_pinned`, `created_at`, `updated_at`,
  `author_label`, `channel_slug`, and `channel_name`. It returns no board IDs,
  base IDs, parent board IDs, author user IDs, user IDs, emails, reporter
  identity, moderation internals, verification fields, storage paths, signed
  URLs, comments, or reports.
- T26D does not add comments, reports, moderation review changes, Request a
  Channel workflow, DFW Today/Base/Layover baseline work, broad database push,
  browser smoke, or deploy.
- T26D is runtime-applied as
  `20260612044500 create_hub_channel_post_create_rpc`. The runtime apply used a
  targeted SQL transaction, added only the matching ledger row, and did not use
  broad database push, migration repair, `apply_migration`, deploy, app code
  changes, staging, or commit. Authenticated browser/create smoke remains
  pending.
- `FBMVP-T26E-A` locally adds the selected-channel post reporting and moderation
  review foundation by reusing `public.board_post_reports`. It does not create a
  new report table.
- T26E-A adds `public.report_open_hub_channel_post(...)`,
  `public.list_open_hub_channel_post_reports(...)`, and
  `public.moderate_open_hub_channel_post(...)`. The report RPC requires
  authenticated open-board read eligibility and verifies the target post is a
  published board-visible post inside the resolved active visible `hub_channel`
  board by `board_posts.board_id`.
- T26E-A preserves the existing report reason constraint:
  `spam`, `harassment`, `unsafe_info`, `privacy`, `off_topic`, and `other`.
  It preserves the existing report status vocabulary:
  `open`, `reviewing`, `resolved`, and `dismissed`.
- T26E-A returns only safe report status data to the reporting user and safe
  channel/post review fields to operators. It does not expose reporter user IDs,
  author user IDs, emails, verification data, proof-upload data, storage paths,
  signed URLs, public report counts, comments, AI moderation decisions, account
  bans, or public moderation feeds.
- T26E-A requires targeted runtime apply for
  `20260613091500 create_hub_channel_post_reporting_rpc`. Browser smoke remains
  pending after runtime/deployment readiness.
- Future multi-airport channel expansion may need airport-prefixed slugs or a
  scoped uniqueness model because `boards.slug` is currently globally unique.
  Once meaningful user content exists in channel boards, slugs should be
  treated as stable unless redirects or aliases are explicitly planned.
- No real production UGC exists yet, so UGC data-loss is not a blocker for the
  choice of model. Table/RPC/database renames remain out of scope unless a
  separate refactor plans them.

DFW launch model:

- DFW Hub
- DFW Today
- Base
- Layover
- Channels
- Recent Useful Threads

Current T25B DFW private-beta channel seed defaults:

- DFW Q&A
- Commuting & Parking
- Terminal & Ground Logistics
- Food, Coffee & Breaks
- New to DFW
- DFW Layover & Local

The earlier seven-channel seed list is superseded for T25B. `Base Life`, `Crew
Tips`, and `App Feedback` are not seeded as DFW child channels in this
metadata-only ticket.

Runtime note: the six T25B child channel board rows now exist in the intended
`jmpseat` Supabase runtime. T26A adds the real Channels overview metadata route,
and T26B adds the selected-channel post-list RPC and route. T26B runtime apply
is recorded in
`ops/fbmvp-t26b-channel-thread-list-read-foundation-runtime-apply.md`; selected
channel browser smoke passed and is recorded in
`ops/fbmvp-t26b-selected-channel-authenticated-browser-smoke.md`. T26C local
implementation adds the selected-channel post detail route/RPC, and T26C
runtime apply is recorded in
`ops/fbmvp-t26c-channel-post-detail-read-foundation-runtime-apply.md`; browser
smoke remains pending.

T26A local implementation and targeted runtime apply start surfacing channel
metadata through the real DFW Channels overview route. T26B starts the selected
Channel thread-list route, and T26C starts the selected Channel post detail
route. Composer, comments, reports, and moderation integration remain
incomplete until later scoped tickets.

Layover section strategy:

- Each airport/base has a Hub.
- Layover content is canonical under that airport Hub's Layover section.
- A DFW-based user may discover MIA Layover through search, recommendations, or
  popular layovers, but the canonical home is MIA Hub > Layover rather than DFW
  Hub > MIA Layover.
- User-generated layover recommendations may exist, but admins/founders decide
  what becomes curated or promoted content.
- Users should not directly edit curated/admin content.

Layovers safety boundaries:

- no exact crew hotel locations
- no live crew location tracking
- no passenger/private information
- no private company information
- no airport security procedures
- no operationally sensitive information
- no exact current meetup/location tied to crew identity
- no dating/social meetup behavior

## VerifiedLoungeAccess

Product definition:

- `strategy/verified-lounge-access-model.md` is the canonical product decision
  for Verified Lounge access before implementing the next restricted-access
  ticket.
- `FBMVP-T07` implements the schema foundation in
  `20260609220055_create_lounge_access_foundation.sql`.
- The intended Supabase runtime has applied and verified
  `20260609220055 create_lounge_access_foundation`; see
  `ops/fbmvp-t07-lounge-access-runtime-pass.md`.
- A Verified Lounge is modeled as a restricted board associated with a base,
  role, airline, or other approved aviation-worker criteria.
- It is not a public feed, not a direct-message system, and not proof that the
  user works for a specific airline, role, or base.
- Lounge access requires approved membership.
- Home Base, board follows, and self-declared `claimed_airline`,
  `claimed_role`, or `claimed_base` must not grant lounge access.
- Product-facing lounge/community admins are `Crew Leads`. Internally, future
  schema may use neutral names such as `community_admin`, `board_admin`, or
  `board_moderator`.

Implemented T07 model concepts:

- `lounge_memberships`
- `lounge_access_requests`
- `lounge_request_comments`
- `lounge_admin_grants`

## BoardPost

Current T12 implementation direction:

- `FBMVP-T12` is the first shared post/thread foundation lane.
- It adds `board_posts` only and is runtime-applied in the intended Supabase
  project.
- The runtime pass is recorded in
  `docs/ops/fbmvp-t12-board-posts-runtime-pass.md`.
- The post table should support Baseboard, Layovers, future Crew Picks
  sourcing, and later restricted lounge content reads without making Home Base,
  board follows, or self-declared profile fields authorization truth.
- Open verified board reads may be available to authenticated users for
  published board-level posts.
- Restricted lounge post reads must remain membership-based through
  `lounge_memberships`.
- `operator_only` visibility should remain withheld from normal authenticated
  readers.
- T12 should keep writes closed unless a later narrow server mutation lane
  proves safe.

Current T13 implementation direction:

- `FBMVP-T13` adds `public.create_board_post(...)` as the first narrow
  server-controlled mutation path for `board_posts`.
- T13 is runtime-applied as `20260610143547 create_board_post_rpc` in the
  intended `jmpseat` Supabase project.
- The RPC is intended first for DFW Baseboard and active open verified
  Baseboards.
- It uses `auth.uid()` for `author_user_id`.
- Auth alone is not enough: the RPC now requires DB-level contribution
  eligibility before insert.
- Current contribution eligibility requires completed profile plus either
  operator internal private-app access or active beta access with verified
  work-email / aviation-worker status.
- It forces `status = 'published'`, `visibility = 'board'`,
  `is_admin_seeded = false`, and `is_pinned = false`.
- It does not authorize from self-declared `claimed_airline`, `claimed_role`,
  or `claimed_base`.
- It does not add direct insert policies, lounge/restricted posting, comments,
  edits/deletes, saves, reactions, search backend, AI moderation, seed content,
  or full posting UI.
- Runtime smoke verification did not create posts; `public.board_posts` remained
  empty at verification.

Current T14 implementation direction:

- `FBMVP-T14` adds `public.list_open_baseboard_posts(...)` as the first narrow
  read RPC for published open Baseboard posts.
- T14 is runtime-applied as `20260610162000 create_board_post_read_rpc` in the
  intended `jmpseat` Supabase project.
- The runtime pass is recorded in
  `docs/ops/fbmvp-t14-board-post-read-runtime-pass.md`.
- The DFW Baseboard route reads posts server-side only after the private app
  route gate succeeds.
- The RPC accepts a base code and is first called with `DFW`; it resolves the
  active base by code and the active `open_verified` `base_board`.
- Auth alone is not enough. The read RPC requires DB-level read eligibility:
  completed profile plus either operator internal private-app access or active
  beta access with verified work-email / aviation-worker status.
- It does not authorize from self-declared `claimed_airline`, `claimed_role`,
  or `claimed_base`.
- It returns only published posts with `visibility = 'board'`, ordered by
  pinned state then creation time.
- The safe UI read model exposes `id`, `title`, `body`, `content_type`,
  `category`, `is_pinned`, `created_at`, `updated_at`, and `author_label`.
- Author display uses `profiles.handle` only, with `jmpseat member` fallback.
- It does not expose author user IDs, email addresses, claimed fields,
  verification status, verification evidence, proof/storage data, private
  storage paths, or signed URLs.
- It does not add composer/post creation UI, comments, saves, reactions, search,
  Crew Picks ranking, lounge/restricted content, seeded layover implementation,
  proof-upload scope, user/community content creation, deploy, or runtime
  setting changes.
- Runtime smoke verification did not create posts; `public.board_posts` remained
  empty at verification.
- Known Supabase migration-history drift remains, so broad `supabase db push`
  remains unsafe.

Current T15 implementation direction:

- `FBMVP-T15` adds `public.create_open_baseboard_post(...)` as a narrow
  base-code wrapper for the minimal DFW Baseboard composer.
- T15 is runtime-applied as `20260610182000 create_open_baseboard_post` in the
  intended `jmpseat` Supabase project.
- The runtime pass is recorded in
  `docs/ops/fbmvp-t15-minimal-post-composer-runtime-pass.md`.
- The wrapper accepts a base code, title, body, default content type `note`, and
  default category `general`.
- It resolves the active base by code and the active `open_verified`
  `base_board`, then delegates to T13 `public.create_board_post(...)`.
- T13 remains the final DB-level contribution authority. Auth alone is not
  enough, and contribution eligibility still requires completed profile plus
  operator internal private-app access or active beta access with verified
  work-email / aviation-worker status.
- The DFW Baseboard UI adds only a server-action title/body composer and safe
  status messages.
- The server action does not hardcode a board UUID, does not use service-role
  app code for the user posting path, and does not expose SQL/auth/eligibility
  details to users.
- T15 does not add comments, saves, reactions, search backend, moderation
  queue, lounge/restricted posting, Layovers seeded content, Crew Picks ranking,
  proof-upload scope, direct `board_posts` write policies, table changes, RLS
  weakening, deploy, or runtime settings changes.
- No post/content smoke test was run during local validation or runtime
  verification, and no user/community content was created.
- Known Supabase migration-history drift remains, so broad `supabase db push`
  remains unsafe.

Current T16 runtime state:

- `FBMVP-T16` is runtime-applied as
  `20260610191809 create_board_post_safety_foundation`. The runtime pass is
  recorded in `docs/ops/fbmvp-t16-board-post-safety-runtime-pass.md`.
- It adds `public.board_post_reports` for minimal DFW Baseboard post reports.
- It adds `public.report_open_baseboard_post(...)`, which requires DB-level
  open board read eligibility, resolves DFW by base code to the active
  `open_verified` `base_board`, reports only `published` / `visibility =
  'board'` posts, forces `reporter_user_id = auth.uid()`, and returns only a
  report UUID.
- It adds `public.moderate_open_baseboard_post(...)`, which requires
  `operator.community_moderation`, resolves the active open verified Baseboard
  by base code, and supports only `hide` and `remove` actions.
- The moderation RPC updates the existing `board_posts` lifecycle fields:
  `status`, `removed_at`, `removed_by`, and `removal_reason`.
- T16 preserves zero direct board_posts write policies and does not weaken
  RLS.
- Hidden/removed posts are excluded from current read surfaces because T14 reads
  only `status = 'published'` and `visibility = 'board'`.
- T16 does not expose reporter identity broadly.
- T16 relies on server actions/RPCs only.
- T16 does not add post detail, comments, saves, reactions, search backend,
  moderation queue UI, AI moderation, bans, lounge/restricted posting, Layovers
  seeded content, Crew Picks ranking, public sharing, media, proof-upload scope,
  deploy, runtime settings changes, or T16-created posts/reports/moderation
  records during migration/apply.
- Runtime verification found `public.board_post_reports` count `0` immediately
  after apply verification and `public.board_posts` count `1`. The existing post
  is user-created test content separate from the T16 migration/apply, not a
  migration side effect.
- Known Supabase migration-history drift remains, so broad `supabase db push`
  remains unsafe.

Current T17 runtime state:

- `FBMVP-T17` is runtime-applied as
  `20260610203000 create_open_baseboard_post_detail_rpc`. The runtime pass is
  recorded in
  `docs/ops/fbmvp-t17-dfw-baseboard-post-detail-runtime-pass.md`.
- It adds `public.get_open_baseboard_post(p_base_code text, p_post_id uuid)` as
  the safe DFW Baseboard post detail read RPC.
- The RPC requires `auth.uid()` and DB-level open board read eligibility through
  `public.current_user_can_read_open_board_posts()`.
- The RPC resolves the active base by `p_base_code`, resolves the active
  `open_verified` `base_board`, and returns only one requested post when it is
  `status = 'published'` and `visibility = 'board'`.
- Safe fields only are returned: `id`, `title`, `body`, `content_type`,
  `category`, `is_pinned`, `created_at`, `updated_at`, and `author_label`.
- Author labels use `profiles.handle` with `jmpseat member` fallback.
- The route `/app/hubs/dfw/baseboard/[postId]` remains private-gated with
  `requireDfwHubRouteAccess(...)`, uses the server-only read helper, and keeps
  the existing report affordance.
- Hidden/removed posts are excluded because the detail RPC filters to published
  board-visible posts.
- T17 does not expose author user IDs, emails, claimed fields, verification
  status/evidence, reporter identity, proof/storage data, signed URLs, or
  private paths.
- T17 does not add comments, replies, saves, reactions, search backend,
  moderation queue UI, public sharing, lounge/restricted posting, Layovers
  content, Crew Picks ranking, media, AI moderation, bans, proof-upload scope,
  direct `board_posts` write policies, RLS weakening, deploy, runtime settings
  changes, or content creation during validation/runtime verification.
- Runtime verification used catalog/count checks only. No post content was read
  or printed. `public.board_posts` count was `1`, and
  `public.board_post_reports` count was `0`.
- No posts, reports, moderation records, comments, replies, saves, reactions,
  search indexes, or user/community content were created by the T17
  migration/apply.
- Known Supabase migration-history drift remains, so broad `supabase db push`
  remains unsafe.

Current T18 runtime state:

- `FBMVP-T18` is runtime-applied as
  `20260610235111 create_board_post_report_review_rpc`.
- The runtime pass is recorded in
  `docs/ops/fbmvp-t18-dfw-baseboard-moderation-review-runtime-pass.md`.
- It adds `public.list_open_baseboard_post_reports(p_base_code text, p_limit
  integer default 50)` for operator-scoped DFW Baseboard report review.
- The RPC requires `auth.uid()` and
  `public.is_operator_with_scope('operator.community_moderation')`.
- The RPC resolves the active base by `p_base_code`, resolves the active
  `open_verified` Baseboard, and returns only open/reviewing reports for posts
  on that Baseboard.
- Returned report-review fields are limited to report ID, post ID, bounded post
  preview fields, safe author label, reason, details, report status, and
  reported timestamp.
- T18 adds `/app/admin/community-moderation` and a server action that calls
  existing T16 `public.moderate_open_baseboard_post(...)` for hide/remove
  actions only.
- T18 preserves zero direct `board_posts` write policies and does not expose
  reporter identity, author IDs, emails, claimed fields, verification
  status/evidence, proof/storage data, signed URLs, private paths, or sensitive
  evidence.
- T18 does not add comments, replies, saves, reactions, search backend, Crew
  Picks, Layovers, public sharing, appeal workflow, bans, AI moderation,
  proof-upload scope, or comment moderation.
- Runtime verification used catalog/permission/count checks only. The review
  RPC was not called for content smoke. No report details, post title, post
  body, author labels, reporter information, or runtime content was read or
  printed. `public.board_posts` count was `1`, and
  `public.board_post_reports` count was `0`.
- No posts, reports, moderation records, comments, replies, saves, reactions,
  search indexes, or user/community content were created by T18 migration/apply.
- Known Supabase migration-history drift remains, so broad `supabase db push`
  remains unsafe.
- The next comments/replies milestone should wait until T18 runtime-pass
  documentation is reviewed and committed.

Current T19 runtime state:

- `FBMVP-T19` is runtime-applied as
  `20260611001000 create_board_post_comments_foundation`.
- It adds `public.board_post_comments` for top-level DFW Baseboard post detail
  comments.
- It adds safe read/create RPCs:
  `public.list_open_baseboard_post_comments(...)` and
  `public.create_open_baseboard_post_comment(...)`.
- It adds `public.moderate_open_baseboard_post_comment(...)` for
  operator-scoped hide/remove comment safety through
  `operator.community_moderation`.
- It adds a server-side operator-scoped comment moderation action that wraps
  `public.moderate_open_baseboard_post_comment(...)`, uses `p_base_code = "DFW"`,
  validates comment UUID plus `hide`/`remove` and bounded reason, records a
  security event without exposing post/comment content, and revalidates only safe
  relevant routes.
- T19 comment creation uses T13-equivalent contribution eligibility, not auth
  alone and not read access alone.
- T19 preserves zero direct `board_posts` write policies and avoids direct
  anon/authenticated comment table writes.
- T19 comment reads expose only safe comment fields and safe author labels. They
  do not expose author IDs, emails, claimed fields, verification/proof data,
  reporter identity, signed URLs, private paths, removal fields, or moderation
  metadata.
- T19 does not add nested replies, comment reporting, comment moderation review
  UI, a comment moderation queue, saves, reactions, search backend, Crew Picks,
  Layovers, public sharing, lounge/restricted posting, media, AI moderation,
  bans, appeals, or proof-upload scope.
- T19 runtime verification used catalog/permission/schema/count checks only.
  Comment create/read/moderation RPCs were not called for live row output, and
  no comment/post/report content was read or printed. `public.board_posts` count
  was `1`, `public.board_post_reports` count was `0`, and
  `public.board_post_comments` count was `0`.
- No posts, reports, moderation records, comments, replies, saves, reactions,
  search indexes, or user/community content were created by T19 migration/apply.
- Known Supabase migration-history drift remains, so broad `supabase db push`
  remains unsafe.
Current T20 runtime state:

- `FBMVP-T20` is runtime-applied as
  `20260611014500 create_board_post_comment_reports`. The runtime pass is
  recorded in
  `docs/ops/fbmvp-t20-dfw-baseboard-comment-reporting-review-runtime-pass.md`.
- It adds `public.board_post_comment_reports` for private top-level comment
  report storage.
- It adds `public.report_open_baseboard_post_comment(...)` for user reporting of
  published top-level comments on published board-visible DFW Baseboard posts.
- It adds `public.list_open_baseboard_post_comment_reports(...)` for
  operator-scoped review through `operator.community_moderation`.
- It extends `/app/admin/community-moderation` with a separate comment reports
  section and uses the existing comment hide/remove moderation action/RPC for
  decisions.
- T20 hides reporter identity by default, avoids direct anon/authenticated
  comment report table access, preserves zero direct `board_posts` write
  policies, and adds no direct anon/authenticated `board_post_comments` write
  policies.
- T20 does not add nested replies, saves, reactions, search backend, Crew Picks,
  Layovers, public sharing, lounge/restricted posting, media, AI moderation,
  bans, appeals, or proof-upload scope.
- No posts, reports, moderation records, comments, replies, saves, reactions,
  search indexes, or user/community content were created during local
  validation or runtime apply.
- Runtime verification confirmed RLS on `public.board_post_comment_reports`, no
  direct anon/public/authenticated report-table access, service-role table
  access only, expected reason/status allowlists, bounded details/resolution
  notes, repeated open/reviewing report prevention, and updated-at trigger
  support.
- Runtime verification confirmed both T20 RPCs use locked
  `search_path=public, pg_temp`; the report RPC requires `auth.uid()` and
  `public.current_user_can_read_open_board_posts()` and returns only a UUID; the
  operator review RPC is `STABLE`, requires
  `public.is_operator_with_scope('operator.community_moderation')`, clamps
  limit to `100`, and returns safe bounded operator-review columns only.
- T20 runtime verification used catalog/permission/schema/count checks only. No
  comment report/review RPCs were called for live row output, and no
  post/comment/report content, author labels, reporter information, user IDs, or
  runtime content was read or printed. `public.board_posts` count was `1`,
  `public.board_post_reports` count was `0`, `public.board_post_comments` count
  was `0`, and `public.board_post_comment_reports` count was `0`.
- Known migration drift remains preserved and broad Supabase `db push` remains
  unsafe.
- T20 runtime-pass docs are committed. The First Base / DFW Baseboard safety
  loop is complete. The next default step is an epoch closeout/readiness record
  and Baseboards pivot workshop, not another feature by default.
- Pre-closeout app-boundary fixes are now part of the baseline: `bad2110`
  blocks public `jmpseat.com` / `www.jmpseat.com` private-app/auth entry paths
  server-side, and `5e65f7b` requires reviewer authorization or an active
  operator grant before rendering `/app/admin`. A logged-in non-admin
  admin-shell browser check remains a pre-beta-launch verification item once a
  non-admin beta test user exists; it is not a data-model blocker for closing
  the First Base / DFW Baseboard epoch.

Important fields:

- id
- board_id
- author_user_id
- title
- body
- content_type
- category
- status
- visibility
- is_admin_seeded
- is_pinned
- edited_at
- removed_at
- removed_by
- removal_reason
- created_at
- updated_at

Relationships:

- Belongs to Board.
- Belongs to author User.
- Later may have Comments, saves, reactions, reports, moderation actions, and
  search indexing.
- Later can supply Crew Picks and Seeded Layovers utility surfaces without
  requiring a separate layover-only content primitive first.

`lounge_memberships` stores approved/revoked membership for restricted lounge
boards. Active membership is the T07 access truth for future restricted lounge
content. Approved membership does not publicly verify airline, role, or base.

`lounge_access_requests` tracks a user's request to join a restricted lounge.
Requesting access does not grant access. T07 prevents multiple active pending
requests for the same board/user while preserving prior request history.

`lounge_request_comments` stores limited request-thread comments attached to a
specific lounge access request. It is not a full direct-message or chat system.

`lounge_admin_grants` stores board-scoped Crew Lead authority using a neutral
internal table name. Crew Leads remain separate from platform operators/admins.

Future server-side mutation paths should add audit events for request
creation, approval, denial, revocation, and request messages.

Privacy boundaries:

- Crew Leads should see only the minimum data needed to review a request,
  including public handle, display name if used, email domain or verified
  work-email status if available, clearly labeled self-declared profile fields,
  request message, and request history for that lounge.
- Crew Leads should not see proof uploads, private verification artifacts,
  unrelated account security data, unrelated lounge memberships, platform admin
  notes, sensitive internal audit details, exact live location/schedule data,
  or passenger/private company information by default.

Current scope:

- T07 is a merged, runtime-applied migration and source-test foundation.
- The T07 runtime pass verified the four lounge access tables, RLS on all four,
  no anon policies, no permissive `using (true)` / `with check (true)`
  policies, own-row membership/request reads, board-scoped Crew Lead reads
  through `lounge_admin_grants`, and no participant/Crew Lead exposure for
  `operator_review` comments.
- No request UI or Crew Lead panel exists yet.
- No full direct-message system exists or is implied.
- No direct client write policies are added; request/review/comment mutations
  should use later server-side/RPC-controlled paths with audit events.
- No proof-upload scope is reintroduced.

## HomeBasePreference

Current T06 implementation note:

`user_home_base_preferences` is added by the T06 migration. The intended
Supabase runtime already has the T06 schema/functions, recorded remotely as
`20260609194858 create_home_base_board_follows`, while the local repo file
remains `20260609130534_create_home_base_board_follows.sql`. Do not re-apply
or retroactively mark the local T06 file; use targeted follow-up migrations for
runtime hardening. The first follow-up is
`20260609200310_harden_home_base_rpc_execute_grants.sql`, which removes `anon`
EXECUTE from the T06 RPCs while preserving authenticated/service-role
execution. The targeted runtime pass is recorded in
`docs/ops/fbmvp-t06-home-base-board-follows-runtime-pass.md`.

Home Base is the user's primary base preference for personalization when the
user chooses one. It is optional in the initial DFW-only rollout and is not
proof of employment, airline, role, base assignment, or restricted-board
eligibility.

Important fields:

- user_id
- base_id
- selected_at
- updated_at

Relationships:

- Belongs to User.
- Belongs to Base.
- The row is set through `set_user_home_base(p_base_code text)`, which requires
  an authenticated user and active base.
- The Home Dashboard uses this preference to decide whether to show the Home
  Base card or the skip-for-now exploratory/default state.

Expected behavior:

- A user may have one current Home Base preference.
- In the initial DFW-only rollout, onboarding should use a DFW-start choice
  rather than a fake one-option Home Base picker.
- In that first rollout, confirming or starting with DFW should set Home Base
  to DFW and ensure the DFW Base Board is followed.
- If the user skips the DFW-start step, no Home Base preference is created and
  no automatic board follow is required.
- No Home Base is a valid initial DFW-only rollout state and must not block app
  access.
- Users without Home Base should later receive an exploratory/default
  experience until they set Home Base or follow boards.
- Setting Home Base should ensure the base's main Base Board is followed.
- Future multi-base rollout should allow selection from active bases and later
  Home Base switching.
- Changing Home Base should keep the old board follow by default unless the
  user manually unfollows it.
- Home Base must not grant Verified Lounge or restricted-board access.

## BoardFollow

Current T06 implementation note:

`board_follows` is added by the T06 migration already present in the intended
Supabase runtime under the remote migration ledger version
`20260609194858 create_home_base_board_follows`. The local repo file remains
`20260609130534_create_home_base_board_follows.sql` and should not be
re-applied or retroactively marked applied. The targeted runtime pass for the
follow-up RPC execute-grant hardening is recorded in
`docs/ops/fbmvp-t06-home-base-board-follows-runtime-pass.md`.

A board follow is a personalization signal, not an access grant.

Users may follow Base Boards, Layover Boards, and Verified Lounges where access
or membership permits. Following a restricted board must not bypass membership,
visibility, posting, moderation, or launch gates.

Important fields:

- id
- user_id
- board_id
- source
- notification_level
- is_favorite
- followed_at
- updated_at

Relationships:

- Belongs to User.
- Belongs to Board.
- Unique per `(user_id, board_id)`.

T06 constrains `source` to `manual`, `home_base`, `onboarding`, or `system`.
It constrains `notification_level` to `default`, `muted`, or `important`.

The T06 Home Base RPC auto-follows the active Base Board for the selected
active base and preserves older follows. Manual follow/unfollow behavior,
favorite editing, restricted lounge follows, notification behavior, and
membership/access approval remain later tickets.

Home Dashboard note:

- `board_follows` initially supports the Following section as followed boards.
- It does not currently represent followed users.
- It does not grant restricted-board access.
- The T08 read-only shell may display a followed-board placeholder for a user
  who has explicitly started with DFW, but the shell does not implement manual
  follow/unfollow behavior.
- The T10 read-only DFW Hub section routes are destinations only. They do not
  add manual follow/unfollow behavior or make follows an access grant.

## Airport

Airport record.

Important fields:

- id
- iata_code
- icao_code
- name
- city
- state_region
- country
- timezone
- latitude
- longitude
- created_at
- updated_at

Relationships:

- Has many Bases and LayoverBoards.

## CrewRoom

Legacy / broader V1 note:

- The current 05B direction models Base Boards, Layover Boards, and Verified
  Lounges through `boards` plus `board_types`.
- Generic global Crew Rooms remain broader/later-lane planning, not the T05
  schema foundation.

Airline/base/role/topic community.

Important fields:

- id
- name
- slug
- room_type
- airline_id
- role_id
- base_id
- airport_id
- description
- visibility
- posting_permission
- anonymous_posting_allowed
- rules
- safety_level
- created_by_user_id
- created_at
- updated_at

Relationships:

- Can belong to Airline, Role, Base, or Airport.
- Has many Posts.
- Created by User.

## Post

Room or board content.

Important fields:

- id
- crew_room_id
- author_user_id
- title
- body
- post_type
- tags
- is_anonymous
- status
- risk_flags
- search_vector
- created_at
- updated_at
- deleted_at

Relationships:

- Belongs to CrewRoom and author User.
- Has many Comments, SavedItems, Reports, and ModerationActions.

## Comment

Reply on a post.

Important fields:

- id
- post_id
- author_user_id
- parent_comment_id
- body
- is_anonymous
- status
- risk_flags
- created_at
- updated_at
- deleted_at

Relationships:

- Belongs to Post and author User.
- Can belong to parent Comment.
- Has many Reports and ModerationActions.

## SavedItem

User-saved content.

Important fields:

- id
- user_id
- item_type
- item_id
- note
- created_at

Relationships:

- Belongs to User.
- References Post, Comment, Deal, LayoverBoard, or AIBrief by item_type and item_id.

## LayoverBoard

City or airport crew intel.

Important fields:

- id
- airport_id
- city
- state_region
- country
- slug
- description
- safety_notes
- visibility
- hotel_detail_policy
- created_at
- updated_at

Relationships:

- Belongs to Airport.
- Can have associated CrewRoom or Posts.
- Has many AIBriefs.

## Deal

Crew-friendly perk or discount.

Important fields:

- id
- vendor_id
- title
- description
- category
- terms
- location_city
- airport_id
- discount_type
- discount_value
- verification_status
- sponsored
- affiliate
- starts_at
- ends_at
- created_at
- updated_at

Relationships:

- Belongs to Vendor.
- Can belong to Airport.
- Has many SavedItems and Reports.

## Vendor

Business or partner.

Important fields:

- id
- name
- category
- website_url
- contact_email
- phone
- verification_status
- sponsorship_status
- notes
- created_at
- updated_at

Relationships:

- Has many Deals.

## Report

User safety or quality report.

Important fields:

- id
- reporter_user_id
- target_type
- target_id
- category
- severity
- description
- status
- emergency_escalation
- assigned_admin_user_id
- resolved_at
- created_at
- updated_at

Relationships:

- Belongs to reporter User.
- Assigned to admin User.
- Can result in ModerationAction.

## ModerationAction

Admin enforcement action.

Important fields:

- id
- admin_user_id
- target_user_id
- target_type
- target_id
- report_id
- action_type
- strike_count_delta
- reason
- internal_notes
- appeal_status
- created_at

Relationships:

- Belongs to admin User.
- May target User, Post, Comment, Deal, or Report.

## AIBrief

Generated Jumpseat Brief or future AI output.

Important fields:

- id
- user_id
- brief_type
- layover_board_id
- airport_id
- prompt
- structured_output
- source_scope
- safety_flags
- model_name
- created_at
- deleted_at

Relationships:

- Belongs to User.
- Belongs to LayoverBoard or Airport.
- Can be saved through SavedItem.

## TrustLevel

Current trust/access state.

Important fields:

- id
- user_id
- level
- verification_tier
- strike_count
- reason
- assigned_by_user_id
- assigned_at
- expires_at
- created_at

Relationships:

- Belongs to User.
- Assigned by admin User where applicable.

## SecurityEvent

Security-relevant audit event. This should be append-only for sensitive workflows.

Important fields:

- id
- actor_user_id
- target_user_id
- event_type
- severity
- request_id
- ip_hash
- user_agent_hash
- metadata
- created_at

Examples:

- login_failed
- authorization_denied
- verification_artifact_accessed
- verification_decision_changed
- moderation_action_created
- report_emergency_escalated
- upload_rejected
- ai_safety_refusal

Relationships:

- Can belong to actor User.
- Can target User.

## UploadArtifact

Private uploaded artifact metadata for verification evidence and future controlled uploads.

Important fields:

- id
- owner_user_id
- artifact_type
- storage_path
- original_filename_hash
- content_type
- size_bytes
- validation_status
- malware_scan_status
- retention_expires_at
- deleted_at
- created_at

Relationships:

- Belongs to User.
- May be referenced by Verification.

## Subscription

Deferred paid-account or premium-access entity.

V1 status:

- Do not model Subscription in V1 unless payments or premium features are explicitly approved.
- Do not add payment, billing, Stripe customer, or subscription lifecycle fields until Stripe/payments enter scope.
- If premium subscriptions are approved later, model Subscription separately from core verification, trust, and posting access so paid status cannot override safety or verification rules.

## AuditLog

Product/audit abstraction rather than a required standalone V1 table.

V1 strategy:

- Audit requirements should be backed by SecurityEvent, ModerationAction, verification decision history, admin action history, and relevant timestamp/reviewer fields.
- Do not duplicate sensitive logs into a separate AuditLog table unless there is a clear query, retention, compliance, or operational purpose.
- If a distinct AuditLog is added later, it must align with SecurityEvent and ModerationAction semantics and avoid copying raw verification artifacts, private notes, or sensitive content unnecessarily.

## Relationship Summary

- User owns Profile, Verification records, content, saved items, reports, moderation actions, AI briefs, and trust level.
- Profile connects User to Airline, Role, and Base.
- Base connects Airline and Airport.
- CrewRoom can represent airline, role, base, airport, or topic communities.
- Posts belong to CrewRooms; Comments belong to Posts.
- LayoverBoard belongs to Airport and powers layover-specific content and AI briefs.
- Deals belong to Vendors and may be airport-specific.
- Reports and ModerationActions enforce accountability across content and accounts.
- SecurityEvent records sensitive audit trails.
- UploadArtifact separates private file metadata from public profile and content records.
- Subscription is deferred until payments or premium features are explicitly in scope.
- AuditLog is covered by SecurityEvent, ModerationAction, verification decision history, and admin action history unless a later design needs a distinct table.

## Model Boundaries for V1

Do not model airline portal credentials, scraped schedules, live crew locations, flight-load request infrastructure, payments, subscriptions, native mobile device records, or roster/calendar integrations in V1.

## Data Modeling Best Practices

- Prefer explicit enums or constrained values for account_status, verification status, room type, visibility, moderation action type, and report category.
- Use database constraints for critical invariants.
- Keep public profile data separate from private verification data.
- Store only metadata needed for uploaded artifacts; do not store original filenames in clear text if they may contain personal information.
- Make sensitive audit logs append-only in application behavior.
- Design retention fields before launch rather than adding deletion as an afterthought.
