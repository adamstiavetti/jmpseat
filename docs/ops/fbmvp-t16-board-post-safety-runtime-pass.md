# FBMVP-T16 Board Post Safety Runtime Pass

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

This document records the targeted runtime application of
`FBMVP-T16: Board Post Safety Foundation`.

T16 adds the minimal DFW Baseboard user-reporting path and an operator-scoped
hide/remove RPC foundation. It does not add moderation queue UI, post detail,
comments, saves, reactions, search, lounge/restricted posting, Layovers seeded
content, Crew Picks ranking, proof-upload scope, deploy, or runtime setting
changes.

## Target Runtime

Target Supabase project:

- project name: `jmpseat`
- project ref/id: `qcdfjrcnwuioqprmqqzx`

Applied migration:

- file: `supabase/migrations/20260610191809_create_board_post_safety_foundation.sql`
- ledger version: `20260610191809`
- ledger name: `create_board_post_safety_foundation`

Apply method:

- targeted SQL execution only
- migration SQL and exact ledger row were applied in one explicit transaction
- no broad `supabase db push`
- no migration repair
- no deploy

## Report Table Verification

Runtime verification confirmed `public.board_post_reports` exists.

The table posture is:

- RLS is enabled
- no report policies exist
- `anon` select: `false`
- `public` select: `false`
- `authenticated` select/insert/update: `false`
- `service_role` select/insert/update: `true`

Runtime verification confirmed:

- report reason and status constraints exist
- details and resolution-note bounds exist
- a partial unique index exists for one open/reviewing report per reporter/post
- the updated-at trigger and function exist
- reporter identity is stored privately and is not broadly exposed

## Report RPC Verification

The runtime pass verified this function exists:

- `public.report_open_baseboard_post(p_base_code text, p_post_id uuid, p_reason text, p_details text)`

The function:

- returns `uuid`
- is `SECURITY DEFINER`
- is locked to `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_read_open_board_posts()`
- resolves the active base/open verified Baseboard
- reports only `status = 'published'` and `visibility = 'board'` posts
- forces `reporter_user_id = auth.uid()`
- returns only the report UUID

## Moderation RPC Verification

The runtime pass verified this function exists:

- `public.moderate_open_baseboard_post(p_base_code text, p_post_id uuid, p_action text, p_reason text)`

The function:

- returns `uuid`
- is `SECURITY DEFINER`
- is locked to `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- supports only `hide` and `remove`
- updates `board_posts.status`, `removed_at`, `removed_by`, and
  `removal_reason`
- returns only the post UUID

Expected related object update:

- `public.operator_scope_values()` now includes
  `operator.community_moderation`

## Grant And Policy Verification

Function execute posture for the T16 RPCs:

- `public`: `false`
- `anon`: `false`
- `authenticated`: `true`
- `service_role`: `true`

`public.board_posts` verification:

- write policy count remains `0`
- existing `SELECT` policy count remains `2`
- the existing T14 read RPC still filters `status = 'published'` and
  `visibility = 'board'`

## Runtime Smoke Verification

The runtime pass used catalog, permission, schema, policy, and count checks only.

- no posts were inserted by the T16 migration/apply
- no reports were submitted by the T16 migration/apply
- no moderation RPC was called by the T16 migration/apply
- no report/moderation records were created by the T16 migration/apply
- `public.board_post_reports` count was `0` immediately after apply verification
- `public.board_posts` count after apply was `1`

The existing `public.board_posts` row is user-created test content separate from
the T16 migration/apply. It is not a migration side effect. This runtime pass
does not claim `public.board_posts` is empty and does not claim no
user/community content exists globally.

## Drift Boundary

Known migration drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Broad `supabase db push` remains unsafe. Future runtime schema work should use
targeted preflight/apply flows that preserve the known drift and exact intended
ledger versions.

## Result

T16 is runtime-applied and verified on the intended `jmpseat` Supabase project.

The next implementation milestone should be selected as T17 only after this
runtime-pass documentation is reviewed and committed.
