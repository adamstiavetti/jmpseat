# FBMVP-T20 DFW Baseboard Comment Reporting + Moderation Review

Status: runtime-applied.

`FBMVP-T20` adds the missing safety intake and operator review loop for
top-level DFW Baseboard comments. It keeps comment reporting server/RPC
controlled and extends the existing Community Moderation route instead of adding
a separate comment moderation queue.

## Scope

T20 adds:

- `public.board_post_comment_reports`
- `public.report_open_baseboard_post_comment(p_base_code text, p_comment_id uuid, p_reason text, p_details text default null)`
- `public.list_open_baseboard_post_comment_reports(p_base_code text, p_limit integer default 50)`
- a server-side `reportDfwBaseboardPostCommentAction(...)`
- compact comment report affordances on DFW Baseboard post detail comments
- a separate comment reports section in `/app/admin/community-moderation`

Operators continue to use the existing T19
`moderateDfwBaseboardPostCommentAction(...)` /
`public.moderate_open_baseboard_post_comment(...)` hide/remove path for comment
moderation decisions.

## Migration

Local migration:

- `supabase/migrations/20260611014500_create_board_post_comment_reports.sql`

Targeted runtime ledger row:

- version: `20260611014500`
- name: `create_board_post_comment_reports`

Known Supabase migration-history drift remains preserved. Broad Supabase
`db push` remains unsafe. The targeted runtime pass is recorded in
`docs/ops/fbmvp-t20-dfw-baseboard-comment-reporting-review-runtime-pass.md`.

## Comment Report Storage

`public.board_post_comment_reports` stores private report rows for top-level
comments. It includes:

- `comment_id`
- `reporter_user_id`
- `reason`
- `details`
- `status`
- review metadata fields
- created/updated timestamps

The report table enables RLS, has no direct anon/public/authenticated table
access, and reserves table access for service-role runtime paths. Reporter
identity is forced by RPC with `auth.uid()` and is not exposed by the operator
review RPC.

Reason values mirror post reports:

- `spam`
- `harassment`
- `unsafe_info`
- `privacy`
- `off_topic`
- `other`

Status values mirror post reports:

- `open`
- `reviewing`
- `resolved`
- `dismissed`

Optional details and resolution notes are bounded to `1000` characters. A
partial unique index prevents repeated open/reviewing reports for the same
reporter/comment pair.

## RPCs

`public.report_open_baseboard_post_comment(...)`:

- is `SECURITY DEFINER`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_read_open_board_posts()`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- reports only published top-level comments attached to published
  `visibility = 'board'` posts on that Baseboard
- forces `reporter_user_id = auth.uid()`
- validates reason and bounded details
- returns only a report UUID

`public.list_open_baseboard_post_comment_reports(...)`:

- is `SECURITY DEFINER`
- is `STABLE`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- returns only open/reviewing comment reports for published top-level comments
  on published board-visible DFW Baseboard posts
- clamps `p_limit` to a max of `100`
- returns safe operator-review fields only

Safe operator-review fields are:

- `report_id`
- `comment_id`
- `post_id`
- `comment_body_preview`
- `comment_author_label`
- `post_title_preview`
- `reason`
- `details`
- `report_status`
- `reported_at`

The review RPC uses `profiles.handle` for comment author labels with
`jmpseat member` fallback. It does not return reporter identity,
`reporter_user_id`, `author_user_id`, emails, claimed fields,
verification/proof data, signed URLs, private paths, or storage paths.

Both T20 RPCs revoke execute from `public` and `anon`, and grant execute only to
`authenticated` and `service_role`.

## App Integration

The DFW Baseboard post detail route remains private-gated before post/comment
reads. It now passes a server-side comment report action to comment cards and
reads only safe comment report redirect statuses.

The comment report action:

- validates post UUID, comment UUID, report reason, and bounded details
- records a security event without post/comment content
- calls `public.report_open_baseboard_post_comment(...)`
- always uses `p_base_code = "DFW"`
- revalidates only the relevant DFW Baseboard post detail route
- redirects with safe success/invalid/failure statuses
- does not call moderation RPCs or use client-side Supabase writes

The Community Moderation route now has separate sections for post reports and
comment reports. It keeps the existing `operator.community_moderation` app gate,
loads comment reports only after the operator gate succeeds, and uses the
existing comment hide/remove moderation action for decisions.

## Explicit Non-Goals

T20 does not add:

- nested replies
- saves
- reactions
- search
- Crew Picks ranking
- Layovers content
- public sharing
- lounge/restricted posting
- media uploads
- AI moderation
- bans
- appeals
- proof-upload scope
- a separate comment moderation route

T20 preserves zero direct `board_posts` write policies and adds no direct
`board_post_comments` write policies for anon/authenticated users.

No posts, reports, moderation records, comments, replies, saves, reactions,
search indexes, or user/community content were created during local validation.

## Runtime Verification

T20 was successfully runtime-applied to the Supabase `jmpseat` project
(`qcdfjrcnwuioqprmqqzx`) as
`20260611014500 create_board_post_comment_reports`.

Runtime verification confirmed:

- `public.board_post_comment_reports` exists with RLS enabled
- no direct table access exists for `anon`, `public`, or `authenticated`
- service_role has expected `select`, `insert`, and `update`
- report reason/status allowlists, details/resolution-note bounds, the
  repeated open/reviewing report unique index, and the updated-at trigger exist
- both T20 RPCs exist with locked `search_path=public, pg_temp`
- `public.report_open_baseboard_post_comment(...)` requires `auth.uid()` and
  `public.current_user_can_read_open_board_posts()`, reports only published
  top-level comments on published board-visible posts, forces reporter identity
  from `auth.uid()`, and returns only a report UUID
- `public.list_open_baseboard_post_comment_reports(...)` is `STABLE`, requires
  `public.is_operator_with_scope('operator.community_moderation')`, returns only
  open/reviewing comment reports for published top-level comments on published
  board-visible posts, clamps limit to max `100`, and returns safe bounded
  operator-review columns only
- function execute is revoked from `public` and `anon`, and granted only to
  `authenticated` and `service_role`
- `public.board_posts` write policy count remains `0`
- `public.board_post_comments` write policy count remains `0`
- `public.board_post_comment_reports` policy count is `0`

Runtime smoke verification used count-only checks. No comment report/review RPCs
were called for live row output, and no post/comment/report content, author
label, reporter information, user IDs, or runtime content was printed.

Counts at verification:

- `public.board_posts`: `1`
- `public.board_post_reports`: `0`
- `public.board_post_comments`: `0`
- `public.board_post_comment_reports`: `0`

No posts, reports, moderation records, comments, replies, saves, reactions,
search indexes, or user/community content were created by the T20 migration/apply.

## Next Step

This closes the First Base / DFW Baseboard safety loop pending runtime-pass docs
review and commit. The next step after that commit should be an epoch
closeout/readiness audit, not a new feature by default.
