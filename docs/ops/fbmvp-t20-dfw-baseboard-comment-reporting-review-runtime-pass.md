# FBMVP-T20 DFW Baseboard Comment Reporting + Moderation Review Runtime Pass

Status: runtime-applied.

`FBMVP-T20` was successfully runtime-applied to the Supabase `jmpseat`
project.

## Target Project

- name: `jmpseat`
- ref/id: `qcdfjrcnwuioqprmqqzx`

## Applied Migration

- version: `20260611014500`
- name: `create_board_post_comment_reports`
- file: `supabase/migrations/20260611014500_create_board_post_comment_reports.sql`

## Comment Report Table Verification

Runtime verification confirmed:

- `public.board_post_comment_reports` exists
- RLS is enabled
- no direct table access exists for `anon`, `public`, or `authenticated`
- service_role has expected `select`, `insert`, and `update` access
- reason allowlist exists:
  - `spam`
  - `harassment`
  - `unsafe_info`
  - `privacy`
  - `off_topic`
  - `other`
- status allowlist exists:
  - `open`
  - `reviewing`
  - `resolved`
  - `dismissed`
- details and resolution note are bounded to `1000` characters
- partial unique index prevents repeated open/reviewing reports by the same
  reporter/comment pair
- updated-at trigger exists

## Comment Report RPC Verification

`public.report_open_baseboard_post_comment(...)` exists and was verified as:

- returns `uuid`
- `SECURITY DEFINER`
- locked `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_read_open_board_posts()`
- resolves active base/open verified Baseboard
- only reports published top-level comments on published board-visible posts
- forces reporter identity from `auth.uid()`
- validates reason and bounds details
- returns only a report UUID
- grants execute only to `authenticated` and `service_role`
- execute revoked from `public` and `anon`

## Operator Review RPC Verification

`public.list_open_baseboard_post_comment_reports(...)` exists and was verified
as:

- `SECURITY DEFINER`
- `STABLE`
- locked `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- resolves active base/open verified Baseboard
- returns only open/reviewing comment reports for published top-level comments
  on published board-visible posts
- clamps limit to max `100`
- returns safe bounded operator-review columns only
- uses `profiles.handle` with `jmpseat member` fallback
- execute revoked from `public` and `anon`
- execute granted only to `authenticated` and `service_role`

## Grant And Policy Verification

Runtime verification confirmed:

- `public.board_posts` write policy count remains `0`
- `public.board_post_comments` write policy count remains `0`
- `public.board_post_comment_reports` policy count is `0`
- `public.board_posts`, `public.board_post_comments`, and
  `public.board_post_comment_reports` all have RLS enabled

## Runtime Smoke Verification

Only catalog, permission, schema, and count checks were run.

- no comment report/review RPCs were called for live row output
- no post/comment body, title, author label, reporter information, user IDs, or
  runtime content was printed
- `public.board_posts` count was `1`
- `public.board_post_reports` count was `0`
- `public.board_post_comments` count was `0`
- `public.board_post_comment_reports` count was `0`

No posts, reports, moderation records, comments, replies, saves, reactions,
search indexes, or user/community content were created by the T20 migration/apply.

## Drift And Safety Notes

Known Supabase migration-history drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Broad Supabase `db push` remains unsafe. T20 used targeted runtime apply only;
no broad db push or migration repair was used.

## Scope Confirmed

T20 adds DFW Baseboard comment reporting and moderation review integration. It
uses private comment report storage, safe report/review RPCs, compact comment
report affordances, and the existing Community Moderation route.

T20 uses `operator.community_moderation` for comment report review and the
existing T19 comment hide/remove moderation action/RPC for decisions. Reporter
identity is hidden by default.

T20 does not add nested replies, saves, reactions, search, Crew Picks, Layovers,
public sharing, lounge/restricted posting, media, AI moderation, bans, appeals,
or proof-upload scope.

## Next Step

This closes the First Base / DFW Baseboard safety loop pending runtime-pass docs
review and commit. The next step after that commit should be an epoch
closeout/readiness audit, not a new feature by default.
