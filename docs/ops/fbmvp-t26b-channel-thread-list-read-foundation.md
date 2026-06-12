# FBMVP-T26B Channel Thread-List Read Foundation

Date: 2026-06-11

## Purpose

`FBMVP-T26B` adds the first selected-channel thread-list read slice for DFW
Hub Channels.

It adds:

- one local migration for
  `public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer default 20)`
- a safe server helper for selected DFW Channel post-list reads
- a protected selected-channel route at
  `/app/hubs/dfw/channels/[channelSlug]`
- links from DFW Channels overview rows into selected-channel routes

Runtime apply is pending until separately reviewed and applied with the
targeted migration pattern. Browser smoke is pending until runtime apply,
deployment, and authenticated route verification.

## RPC Scope

The migration adds:

- `supabase/migrations/20260611214500_create_hub_channel_post_list_rpc.sql`

`public.list_open_hub_channel_posts(...)`:

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
- reads posts through `board_posts.board_id = resolved hub_channel board id`
- does not use `board_posts.category` for channel membership
- filters posts to `status = 'published'`
- filters posts to `visibility = 'board'`
- orders pinned posts first, then newest posts
- clamps `p_limit` to `1..50`

The RPC returns safe post-list fields only:

- `id`
- `title`
- `body`
- `content_type`
- `category`
- `is_pinned`
- `created_at`
- `updated_at`
- `author_label`

The post `id` remains included because existing safe post-list/detail navigation
already exposes post UUIDs for private app post detail routes.

The RPC does not return board IDs, base IDs, parent board IDs, author user IDs,
user IDs, emails, reporter identity, moderation internals, verification fields,
proof data, storage paths, signed URLs, comments, reports, or write behavior.

## Route Scope

The new route is:

- `/app/hubs/dfw/channels/[channelSlug]`

The route:

- uses the existing DFW Hub private child route gate
- reads channel metadata through `listDfwHubChannels()`
- reads selected-channel posts through `listDfwHubChannelPosts(channelSlug)`
- renders selected channel name and description
- renders a read-only thread list for that selected channel
- shows a safe empty state when there are no posts
- shows safe unavailable states if metadata or post reads fail
- links back to `/app/hubs/dfw/channels`

DFW Channels overview rows now link to the selected-channel route for each
channel slug.

## Explicitly Not Implemented

T26B does not add:

- channel composer
- channel post creation
- channel post detail route
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
- live weather or traffic
- standalone `channels` table
- parent/baseboard post migration
- broad `supabase db push`
- deploy

## Safety

T26B preserves the existing server/RPC-controlled contribution model. It does
not add direct table read/write policies or direct user write policies, and it
does not weaken private-app, public-domain, admin, verification, proof-upload,
reporting, moderation, RLS, or operator-scope behavior.

The implementation does not expose author IDs, reporter identity, verification
evidence, proof-upload data, private storage paths, signed URLs, passenger
private information, exact crew hotel exposure, security-sensitive procedures,
company-confidential content, or live crew movement/location.

## Runtime Apply

Runtime apply is recorded in
`docs/ops/fbmvp-t26b-channel-thread-list-read-foundation-runtime-apply.md`.

The targeted runtime apply added:

- `public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer)`
- one migration ledger row:
  - `20260611214500 create_hub_channel_post_list_rpc`

The apply used targeted SQL execution in one explicit transaction. It did not
use broad `supabase db push`, migration repair, `apply_migration`, deploy, app
code changes, staging, or commit.

## Browser Smoke

Browser smoke is pending until:

- the app deployment contains the T26B route/helper code
- an authenticated eligible beta/private-app session can verify
  `/app/hubs/dfw/channels/[channelSlug]`

Smoke should verify functional route behavior only unless a separate polish
ticket explicitly scopes UI/UX review.

## Validation

Planned local validation:

```bash
git diff --check
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
