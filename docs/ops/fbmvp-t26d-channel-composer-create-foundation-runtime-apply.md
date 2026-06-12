# FBMVP-T26D Channel Composer / Create Post Runtime Apply

Date: 2026-06-12

## Purpose

This record closes the targeted runtime migration apply for `FBMVP-T26D`.

The apply targeted Supabase project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Target migration:

- `supabase/migrations/20260612044500_create_hub_channel_post_create_rpc.sql`

## Runtime Apply Summary

The targeted runtime apply completed successfully.

Applied only:

- `supabase/migrations/20260612044500_create_hub_channel_post_create_rpc.sql`
- one migration ledger row:
  - version: `20260612044500`
  - name: `create_hub_channel_post_create_rpc`

Apply method:

- targeted SQL transaction only
- no broad `supabase db push`
- no migration repair
- no `apply_migration`
- no deploy tooling
- no Vercel changes
- no file edits during runtime apply
- no staging
- no commit

## Pre-Apply State

Pre-apply checks confirmed:

- repo was clean
- `HEAD = origin/main = 65b335d`
- prior channel ledger rows existed:
  - `20260611183000 create_hub_channel_board_type_dfw_seeds`
  - `20260611203000 create_hub_channel_list_read_rpc`
  - `20260611214500 create_hub_channel_post_list_rpc`
  - `20260612024544 create_hub_channel_post_detail_rpc`
- T26D ledger row did not exist
- `public.create_open_hub_channel_post(...)` did not exist before apply

## Post-Apply Verification

Post-apply checks confirmed:

- runtime now has:
  - `public.create_open_hub_channel_post(p_base_code text, p_channel_slug text, p_title text, p_body text, p_content_type text, p_category text)`
- ledger row exists:
  - `20260612044500 create_hub_channel_post_create_rpc`
- no standalone channel tables were created:
  - `channels`
  - `hub_channels`
  - `board_channels`

Function definition safety scan verified:

- `auth.uid()` authentication check
- `public.current_user_can_create_open_board_post()` contribution eligibility
  check
- active base resolution
- active parent `base_board` resolution
- active `hub_channel` child-board resolution
- `visibility = 'open_verified'`
- `posting_mode = 'members_can_post'`
- `discoverability = 'visible'`
- insert into `public.board_posts`
- `board_posts.board_id` set from the resolved child channel board
- board ID is not accepted as a client parameter
- `board_posts.category` is not used as channel membership
- title/body are parameterized
- safe return columns only
- comments and reports are not created or returned

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
T26D added no broad direct table policies and no direct user
insert/update/delete policies.

The standalone channel table check returned zero rows for:

- `channels`
- `hub_channels`
- `board_channels`

## Authenticated RPC Call Boundary

An authenticated functional RPC call was not run. The available tooling did not
provide a safe real authenticated user context, so no authenticated RPC result is
claimed here.

Authenticated browser/create smoke is recorded in
`docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`. It failed/partially
passed: one safe post was created and listed, but the UI reported failure
instead of redirecting to detail. T26C happy-path post-detail smoke also failed
for the created post because the detail route rendered a safe unavailable state.

## Explicitly Still Not Implemented

T26D still does not add:

- comments
- replies
- reports
- moderation review changes
- `Request a Channel` workflow
- DFW Today MVP baseline
- Base MVP baseline
- Layover MVP baseline
- search
- saves
- reactions
- media uploads
- notifications
- AI behavior
- live weather or traffic integrations
- broad UI/UX redesign

## Next Step

Investigate the T26D create/action return handling and T26C detail-read mismatch
before creating additional smoke posts. After a fix, re-run authenticated
browser/create smoke and confirm detail rendering using the existing safe
child-channel post if possible.

Runtime apply docs are satisfied by this record. Browser smoke docs remain
satisfied by
`docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md` for the failed/partial
smoke. Follow-up smoke remains needed after the defect is fixed.

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26d-channel-composer-create-foundation-runtime-apply.md`
- `docs/BUILD_TICKETS.md`
- `docs/DATA_MODEL.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/hub-pivot-plan.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26d-channel-composer-create-foundation.md`

Docs not updated / why:

- App, migration, and test files were not updated because this task only records
  the already-completed targeted runtime apply.
- Browser smoke docs are now recorded separately because authenticated
  browser/create smoke happened after this runtime-apply record.

Scope impact:

- Runtime-apply documentation only.
- No app behavior, local migration files, tests, routes, helpers, or runtime
  settings changed in this docs task.

Runtime apply docs needed?

- Satisfied by this record.

Browser smoke docs needed?

- Satisfied for the failed/partial smoke by
  `docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`.
- Follow-up browser smoke remains needed after the create/detail defect is
  fixed.
