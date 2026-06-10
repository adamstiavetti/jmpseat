# FBMVP-T13 Create Post Runtime Pass

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Target

The `FBMVP-T13` server-controlled create-post foundation was runtime-applied to
the intended Supabase project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Applied migration:

- version: `20260610143547`
- name: `create_board_post_rpc`
- file: `supabase/migrations/20260610143547_create_board_post_rpc.sql`

## Repo State At Apply

Runtime apply was performed from `main` after the reviewed eligibility
hardening commit:

- `8d8db0d fix: harden create post eligibility`

The local worktree was clean before apply.

## Apply Method

T13 was applied through an exact-version-preserving targeted authenticated SQL
transaction.

The transaction:

- rechecked that migration version `20260610143547` was absent before apply
- rechecked that `public.create_board_post(...)` was absent before apply
- rechecked that `public.current_user_can_create_open_board_post()` was absent
  before apply
- rechecked required dependency tables and `public.is_operator_with_scope(...)`
- executed only `supabase/migrations/20260610143547_create_board_post_rpc.sql`
- inserted exactly one migration ledger row:
  - `20260610143547 create_board_post_rpc`

No broad `supabase db push` was used.
No `migration repair` command was used.

## Known Drift Preserved

Known Supabase migration-history drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Broad `supabase db push` remains unsafe while this drift exists.

## Ledger Verification

Post-apply migration ledger includes:

- `20260610143547 create_board_post_rpc`

Prior runtime dependencies remained present:

- `20260609020355 create_base_board_model`
- `20260609194858 create_home_base_board_follows`
- `20260609200310 harden_home_base_rpc_execute_grants`
- `20260609220055 create_lounge_access_foundation`
- `20260610010000 create_board_posts_foundation`

No unrelated migration versions were intentionally marked applied during this
runtime pass.

## Function Verification

Post-apply runtime verification confirmed:

- `public.current_user_can_create_open_board_post()` exists
- `public.create_board_post(...)` exists
- both functions are `SECURITY DEFINER`
- both functions use locked `search_path=public, pg_temp`
- `public.current_user_can_create_open_board_post()` returns `boolean`
- `public.create_board_post(...)` returns `uuid`

Normal-user contribution eligibility requires:

- `auth.uid()`
- completed profile through `public.profiles.profile_completed_at`
- active beta access
- verified work-email / aviation-worker state

Operator bypass is limited to:

- `public.is_operator_with_scope('operator.internal_private_app_access')`

The approved-claim fallback requires linked work-email request/evidence/domain
provenance. It does not trust an approved claim by itself.

The functions do not authorize from:

- `claimed_airline`
- `claimed_role`
- `claimed_base`

## Posting Boundary Verification

Post creation is constrained to active open verified Baseboards:

- target board must be active
- target board must have `visibility = 'open_verified'`
- target board type must be active `base_board`
- restricted/lounge boards are rejected by the RPC path

The RPC forces safe post fields:

- `author_user_id = auth.uid()`
- `status = 'published'`
- `visibility = 'board'`
- `is_admin_seeded = false`
- `is_pinned = false`

The RPC returns only the created post id.

## Grant And Policy Verification

Function execute posture:

- `anon` cannot execute the T13 functions
- `public` has no explicit execute privilege on the T13 functions
- `authenticated` can execute the T13 functions
- `service_role` can execute the T13 functions

`public.board_posts` table posture:

- authenticated table grant remains `SELECT` only
- no anon table grants were found
- no direct `INSERT`, `UPDATE`, or `DELETE` grants/policies were added for
  `public.board_posts`
- existing read policies remain intact:
  - authenticated users can read published `board` posts on active
    `open_verified` boards
  - active lounge members can read published `members_only` posts on active
    restricted boards through active `lounge_memberships`

## Runtime Smoke Verification

Smoke verification used catalog, grant, policy, and count checks only.

No post creation smoke test was run.
No user/community content was created.

Runtime verification confirmed:

- `public.board_posts` count remained `0`
- recently created post count remained `0`

## Confirmations

This runtime pass did not:

- run broad `supabase db push`
- run migration repair
- deploy
- change Supabase, Vercel, DNS, SMTP, auth, storage, or runtime settings
- touch proof-upload storage/artifact code
- create user/community content
- add comments, saves/reactions, search backend, AI, seeded content, lounge
  posting, Crew Picks ranking, or full posting UI

## Next Lane

The next recommended implementation milestone is:

- `FBMVP-T14: Board Post Read Foundation`

T14 should stay narrow: read/query surfacing for existing `board_posts` without
adding comments, reactions, saves, search backend, AI, seed content, lounge
posting, or broad composer UI unless separately approved.
