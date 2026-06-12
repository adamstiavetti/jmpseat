# FBMVP-T26D Channel Composer / Create Post Foundation

Date: 2026-06-12

## Purpose

`FBMVP-T26D` adds the selected-channel create-post foundation for DFW Hub
Channels.

It adds:

- one local migration for
  `public.create_open_hub_channel_post(p_base_code text, p_channel_slug text, p_title text, p_body text, p_content_type text default null, p_category text default null)`
- a server action for creating a post in the selected DFW `hub_channel`
- a title/body composer on `/app/hubs/dfw/channels/[channelSlug]`
- safe validation/error redirects
- success redirect to `/app/hubs/dfw/channels/[channelSlug]/[postId]`

Runtime apply is recorded in
`docs/ops/fbmvp-t26d-channel-composer-create-foundation-runtime-apply.md`.
Browser smoke is recorded in
`docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`. It failed/partially
passed: one safe post was created and listed, but the UI reported failure
instead of redirecting to detail, and the detail route could not render the
created post.

## RPC Scope

The migration adds:

- `supabase/migrations/20260612044500_create_hub_channel_post_create_rpc.sql`

`public.create_open_hub_channel_post(...)`:

- requires `auth.uid()`
- reuses `public.current_user_can_create_open_board_post()` for existing
  open-board contribution eligibility
- resolves an active base by normalized base code
- resolves the active parent `base_board` with slug matching the lower-case base
  code, e.g. `DFW` -> `dfw`
- resolves an active child `hub_channel` board by `p_channel_slug`
- requires the child channel to be `visibility = 'open_verified'`
- requires the child channel to be `posting_mode = 'members_can_post'`
- requires the child channel to be `discoverability = 'visible'`
- requires the child channel to be `status = 'active'`
- inserts the post with `board_posts.board_id = resolved hub_channel board id`
- does not use `board_posts.category` for channel membership
- writes `status = 'published'`
- writes `visibility = 'board'`
- writes `is_admin_seeded = false`
- writes `is_pinned = false`

The RPC validates bounded post fields:

- title is required and limited to 120 characters
- body is required and limited to 4,000 characters
- content type is constrained to existing `board_posts.content_type` values
- category is constrained to existing `board_posts.category` values

The RPC returns safe fields only:

- `id`
- `title`
- `body`
- `content_type`
- `category`
- `is_pinned`
- `created_at`
- `updated_at`
- `author_label`
- `channel_slug`
- `channel_name`

The post `id` is returned because T26B/T26C already use post UUIDs for private
app selected-channel routing.

The RPC does not accept or return board IDs, base IDs, parent board IDs, author
user IDs, user IDs, emails, reporter identity, moderation internals,
verification fields, proof data, storage paths, signed URLs, comments, reports,
or write behavior outside the selected post insert.

## Route / UI Scope

The updated route is:

- `/app/hubs/dfw/channels/[channelSlug]`

The route:

- uses the existing DFW Hub private child route gate
- reads channel metadata through `listDfwHubChannels()`
- reads selected-channel posts through `listDfwHubChannelPosts(channelSlug)`
- binds the create action to the resolved selected channel slug
- renders a title/body composer only when the selected channel exists
- keeps selected-channel thread rows linked to post detail routes
- keeps safe empty/unavailable states
- redirects successful posts to the selected-channel post detail route
- uses query-status feedback for invalid/failed submissions

The composer is a functional baseline only. UI/UX polish remains deferred until
the route is runtime-applied, browser-smoked, and the remaining MVP surfaces
have functional baselines.

## Explicitly Not Implemented

T26D does not add:

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
- live weather or traffic
- standalone `channels` table
- parent/baseboard post migration
- broad `supabase db push`
- deploy

## Safety

T26D preserves the existing server/RPC-controlled contribution model. It does
not add direct table read/write policies or direct user write policies, and it
does not weaken private-app, public-domain, admin, verification, proof-upload,
reporting, moderation, RLS, or operator-scope behavior.

The implementation does not expose board IDs, base IDs, parent board IDs,
author IDs, reporter identity, verification evidence, proof-upload data,
private storage paths, signed URLs, passenger private information, exact crew
hotel exposure, security-sensitive procedures, company-confidential content, or
live crew movement/location.

## Runtime Apply

Runtime apply is complete and recorded in
`docs/ops/fbmvp-t26d-channel-composer-create-foundation-runtime-apply.md`.

The targeted apply used:

- `supabase/migrations/20260612044500_create_hub_channel_post_create_rpc.sql`
- one migration ledger row:
  - `20260612044500 create_hub_channel_post_create_rpc`

It used targeted SQL execution only. It did not use broad Supabase migration
sync, `supabase db push`, migration repair, `apply_migration`, deploy tooling,
or Vercel changes.

## Browser Smoke

Browser smoke is recorded in
`docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`.

Smoke result:

- failed/partial
- exactly one safe post was created in `dfw-q-and-a`
- the selected-channel thread list rendered the created post
- expected success redirect to detail did not happen
- the UI returned to `?post=dfw_channel_post_failed`
- direct navigation to the created post detail rendered a safe unavailable state
- no raw error leaked
- no comments, reports, moderation controls, fake counts, IDs, proof/storage
  fields, or sensitive content were exposed

Do not create additional smoke posts until the create/action return handling and
T26C detail-read mismatch are investigated.

## Validation

Local validation should include:

- `git diff --check`
- `node --test test/community/hubChannelPostCreate.test.mts`
- `node --test test/community/hubChannelPostDetail.test.mts`
- `node --test test/community/hubChannelPostReads.test.mts`
- `node --test test/community/hubChannelReads.test.mts`
- `node --test test/community/hubChannelSeeds.test.mts`
- `node --test test/community/boardPostActions.test.mts`
- `node --test test/community/boardPostDetail.test.mts`
- `node --test test/private-app/homeHubShell.test.mts test/private-app/domainGate.test.mts test/private-app/access.test.mts`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
