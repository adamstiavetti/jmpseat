# FBMVP-T26B Channel Thread-List Read Runtime Apply

Date: 2026-06-11

## Purpose

This record closes the targeted runtime migration apply for `FBMVP-T26B`.

The apply targeted Supabase project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Target migration:

- `supabase/migrations/20260611214500_create_hub_channel_post_list_rpc.sql`

## Runtime Apply Summary

The targeted runtime apply completed successfully.

Applied only:

- `supabase/migrations/20260611214500_create_hub_channel_post_list_rpc.sql`
- one migration ledger row:
  - version: `20260611214500`
  - name: `create_hub_channel_post_list_rpc`

Apply method:

- targeted SQL execution in one explicit transaction
- no broad `supabase db push`
- no migration repair
- no `apply_migration`
- no deploy
- no Vercel changes
- no file edits during runtime apply
- no staging
- no commit

## Pre-Apply State

Pre-apply checks confirmed:

- repo was clean
- `HEAD = origin/main = 0339071`
- prior channel ledger rows existed:
  - `20260611183000 create_hub_channel_board_type_dfw_seeds`
  - `20260611203000 create_hub_channel_list_read_rpc`
- T26B ledger row did not exist
- T25B/T26A runtime foundation existed
- `public.list_open_hub_channel_posts(...)` did not exist before apply

## Post-Apply Verification

Post-apply checks confirmed:

- runtime now has:
  - `public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer)`
- ledger row exists:
  - `20260611214500 create_hub_channel_post_list_rpc`
- no standalone channel tables were created:
  - `channels`
  - `hub_channels`
  - `board_channels`

Function definition safety scan verified:

- `auth.uid()` authentication check
- `public.current_user_can_read_open_board_posts()` eligibility check
- active base resolution
- active parent `base_board` resolution
- active visible `hub_channel` resolution
- `board_posts.board_id = v_channel_board_id` membership
- `board_posts.category` is not used as channel membership
- `board_posts.status = 'published'`
- `board_posts.visibility = 'board'`
- limit clamp `1..50`
- safe return fields only:
  - `id`
  - `title`
  - `body`
  - `content_type`
  - `category`
  - `is_pinned`
  - `created_at`
  - `updated_at`
  - `author_label`

Safety confirmation:

- no board IDs returned
- no base IDs returned
- no parent board IDs returned
- no author user IDs returned
- no reporter identity returned
- no moderation internals returned
- no verification fields returned
- no storage paths returned
- no signed URLs returned
- no emails returned
- no proof data returned
- no comments or reports returned

## Policy And Table Review

Runtime policy review returned only existing `board_posts` `SELECT` policies.
T26B added no broad direct table policies and no direct user
insert/update/delete policies.

The standalone channel table check returned zero rows for:

- `channels`
- `hub_channels`
- `board_channels`

## Authenticated RPC Call Boundary

An authenticated functional RPC call was not run. The available tooling did not
provide a safe real authenticated user context, so no authenticated RPC result is
claimed here.

Authenticated browser/route smoke for
`/app/hubs/dfw/channels/[channelSlug]` remains pending until the app deployment
contains the T26B route/helper code and a real eligible beta/private-app session
can verify it.

## Explicitly Still Not Implemented

T26B still does not add:

- composer
- channel post creation
- channel post detail
- comments
- reports
- moderation review changes
- `Request a Channel` workflow
- DFW Today MVP baseline
- Base MVP baseline
- Layover MVP baseline
- search
- saves
- reactions
- media
- live weather or traffic integrations

## Next Step

Deploy the committed app code through the normal deployment path, then run
authenticated browser smoke for `/app/hubs/dfw/channels/[channelSlug]`.

Runtime apply docs are satisfied by this record. Browser smoke docs are still
needed after deployment/browser verification.
