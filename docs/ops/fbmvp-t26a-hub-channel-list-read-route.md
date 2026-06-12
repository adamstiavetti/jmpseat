# FBMVP-T26A Hub Channel List Read + DFW Channels Overview

Date: 2026-06-11

## Purpose

`FBMVP-T26A` adds the first real DB/RPC-backed Channels read slice.

It adds:

- one local migration for `public.list_open_hub_channels(p_base_code text)`
- a safe server helper for DFW channel metadata reads
- a protected DFW Channels overview route at `/app/hubs/dfw/channels`

Runtime apply is recorded separately in
`docs/ops/fbmvp-t26a-hub-channel-list-read-route-runtime-apply.md`.

## RPC Scope

The migration adds:

- `supabase/migrations/20260611203000_create_hub_channel_list_read_rpc.sql`

`public.list_open_hub_channels(p_base_code text)`:

- requires `auth.uid()`
- reuses `public.current_user_can_read_open_board_posts()` for the existing
  open-board read eligibility boundary
- resolves an active base by normalized base code
- resolves the active parent `base_board` with slug matching the lower-case base
  code, e.g. `DFW` -> `dfw`
- reads active child boards with board type `hub_channel`
- filters to `visibility = 'open_verified'`
- filters to `discoverability = 'visible'`
- filters to `status = 'active'`
- orders by `sort_order`, then `name`

The RPC returns safe channel metadata only:

- `slug`
- `name`
- `short_name`
- `description`
- `sort_order`

It does not return board IDs, base IDs, parent board IDs, author IDs, user IDs,
reporter identity, internal moderation fields, verification fields, storage
paths, signed URLs, posts, comments, reports, or channel write behavior.

## Route Scope

The new route is:

- `/app/hubs/dfw/channels`

The route:

- uses the existing DFW Hub private child route gate
- reads via `listDfwHubChannels()`
- renders `DfwChannelsOverviewShell`
- shows active channel rows from runtime metadata after the migration is applied
- shows a safe empty/unavailable state if the RPC is unavailable or returns no
  rows

Home and DFW Hub overview links for `Browse Channels` / `Channels` now point to
`/app/hubs/dfw/channels`.

## UI Scope

The DFW Channels overview includes:

- `DFW Channels`
- focused spaces for verified aviation workers
- compact channel rows
- channel name
- channel description
- safe short-name/status affordance
- secondary static `Request a Channel` footer action

The request footer copy is:

`Need a focused place for another aviation-worker topic? Request a Channel.`

The request workflow is not implemented.

## Explicitly Not Implemented

T26A does not add:

- channel post list/read/create RPCs
- channel post detail routes
- composer behavior
- comments
- reports
- moderation review changes
- request/create channel workflow
- search
- saves
- reactions
- media
- live weather or traffic
- standalone `channels` table
- parent-board post migration
- broad `supabase db push`
- deploy

DB/RPC-backed Channels remain incomplete until later tickets add channel post
list/detail/create behavior and any related comment/report/moderation
integration.

## Safety

T26A preserves the existing server/RPC-controlled contribution model. It does
not add direct table read/write policies or direct user write policies, and it
does not weaken private-app, public-domain, admin, verification, proof-upload,
reporting, moderation, RLS, or operator-scope behavior.

The implementation does not expose author IDs, reporter identity, verification
evidence, proof-upload data, private storage paths, signed URLs, passenger
private information, exact crew hotel exposure, security-sensitive procedures,
company-confidential content, or live crew movement/location.

## Runtime Apply

T26A is runtime-applied as
`20260611203000 create_hub_channel_list_read_rpc`. The apply used targeted SQL
execution only, inserted the exact ledger row, and did not use broad
`supabase db push`, migration repair, `apply_migration`, deploy, app code
changes, staging, or commit.

The runtime function now exists, but authenticated browser/route smoke is still
recorded separately in
`docs/ops/fbmvp-t26a-dfw-channels-authenticated-browser-smoke.md` as a
functional pass with UI/UX polish deferred. Channel post list/read/create
behavior, composer behavior, comments, reports, moderation review changes, and
request/create channel workflow remain future scoped work.

## Validation

Planned local validation:

```bash
git diff --check
node --test test/community/hubChannelReads.test.mts
node --test test/private-app/homeHubShell.test.mts test/private-app/domainGate.test.mts test/private-app/access.test.mts
npm run typecheck
npm run lint
npm run build
```
