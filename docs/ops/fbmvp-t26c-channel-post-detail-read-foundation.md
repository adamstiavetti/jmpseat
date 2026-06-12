# FBMVP-T26C Channel Post Detail Read Foundation

Date: 2026-06-11

## Purpose

`FBMVP-T26C` adds the selected-channel post detail read slice for DFW Hub
Channels.

It adds:

- one local migration for
  `public.get_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid)`
- a safe server helper for one selected DFW Channel post detail read
- a protected selected-channel post detail route at
  `/app/hubs/dfw/channels/[channelSlug]/[postId]`
- links from selected-channel thread-list rows into the post detail route

Runtime apply is recorded in
`docs/ops/fbmvp-t26c-channel-post-detail-read-foundation-runtime-apply.md`.
Browser smoke is pending until beta deployment verification and a safe
child-channel post detail can be verified.

## RPC Scope

The migration adds:

- `supabase/migrations/20260612024544_create_hub_channel_post_detail_rpc.sql`

`public.get_open_hub_channel_post(...)`:

- requires `auth.uid()`
- reuses `public.current_user_can_read_open_board_posts()` for the existing
  open-board read eligibility boundary
- resolves an active base by normalized base code
- resolves the active parent `base_board` with slug matching the lower-case base
  code, e.g. `DFW` -> `dfw`
- resolves an active child `hub_channel` board by `p_channel_slug`
- filters the channel to `visibility = 'open_verified'`
- filters the channel to `discoverability = 'visible'`
- filters the channel to `status = 'active'`
- reads the post through `board_posts.board_id = resolved hub_channel board id`
- does not use `board_posts.category` for channel membership
- filters the post to `status = 'published'`
- filters the post to `visibility = 'board'`
- returns at most one row

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

The post `id` remains included because T26B already exposes post UUIDs for
private app selected-channel navigation.

The RPC does not return board IDs, base IDs, parent board IDs, author user IDs,
user IDs, emails, reporter identity, moderation internals, verification fields,
proof data, storage paths, signed URLs, comments, reports, or write behavior.

## Route Scope

The new route is:

- `/app/hubs/dfw/channels/[channelSlug]/[postId]`

The route:

- uses the existing DFW Hub private child route gate
- reads channel metadata through `listDfwHubChannels()`
- reads the selected post through `getDfwHubChannelPost(channelSlug, postId)`
- renders selected channel/thread breadcrumb context
- renders the post title, body, safe metadata, author label, and timestamps
- shows safe unavailable states if metadata or post reads fail
- links back to `/app/hubs/dfw/channels/[channelSlug]`

Selected-channel thread-list rows now link to the detail route for each safe
post UUID returned by the T26B list RPC.

## Explicitly Not Implemented

T26C does not add:

- channel composer
- channel post creation
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
- media
- live weather or traffic
- standalone `channels` table
- parent/baseboard post migration
- broad `supabase db push`
- deploy

## Safety

T26C preserves the existing server/RPC-controlled contribution model. It does
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
`docs/ops/fbmvp-t26c-channel-post-detail-read-foundation-runtime-apply.md`.

The apply used the established targeted SQL pattern only:

- applied only
  `supabase/migrations/20260612024544_create_hub_channel_post_detail_rpc.sql`
- inserted one matching migration ledger row:
  - `20260612024544 create_hub_channel_post_detail_rpc`
- did not run broad `supabase db push`
- did not run migration repair
- did not use `apply_migration`
- did not deploy
- did not change app code during runtime apply

## Browser Smoke

Partial browser smoke is recorded in
`docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`.

That initial smoke verified the selected-channel post detail route shell,
unavailable-state behavior, authenticated beta access, no-cookie beta redirect,
public-domain non-exposure, and product/security boundaries using a synthetic
post UUID under `dfw-q-and-a`.

A later T26D composer smoke created one safe published child-channel post and
attempted happy-path detail rendering. That happy path failed because the
created post detail route rendered a safe unavailable state. Follow-up
investigation should focus on the T26D create/action return handling and T26C
detail-read mismatch.

Happy-path browser smoke remains pending until the mismatch is fixed and the
created safe child-channel post, or another explicitly approved safe post, can
be verified.

Future smoke should verify an authenticated eligible beta/private-app user can
open a selected-channel post detail route when a channel post exists. If no
runtime channel posts exist yet, browser smoke may need to wait until T26D or a
separately approved safe test-content path exists.

## Validation

Planned local validation:

```bash
git diff --check
node --test test/community/hubChannelPostDetail.test.mts
node --test test/community/hubChannelPostReads.test.mts
node --test test/community/hubChannelReads.test.mts
node --test test/community/hubChannelSeeds.test.mts
node --test test/community/boardPostActions.test.mts
node --test test/community/boardPostDetail.test.mts
node --test test/private-app/homeHubShell.test.mts test/private-app/domainGate.test.mts test/private-app/access.test.mts
npm run typecheck
npm run lint
npm run build
```
