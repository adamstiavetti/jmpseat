# FBMVP-T22 Hub Channels IA / Data Model Lock

Date: 2026-06-11

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

## Purpose

This is a docs-only decision record for the post-T21 Hub Channels data model
and information architecture lane. It locks the safest internal model before
real DFW Hub Channels implementation work starts.

This record does not implement app code, edit migrations, mutate runtime data,
apply migrations, deploy, rename database tables, or change runtime settings.

## Current Controlling Docs For Hub Work

Future Codex, product, and wireframe agents should start from these docs:

- `docs/ops/hub-pivot-plan.md` - approved Hub product model and naming.
- `docs/ops/fbmvp-t21-dfw-hub-product-framing-runtime-smoke.md` - manual beta
  UI smoke for the T21 DFW Hub shell and known UX debt.
- `docs/ops/fbmvp-t22-hub-channels-ia-data-model-lock.md` - current Hub
  Channels internal model and IA decision.

Older Baseboard strategy docs remain useful background, but they should not
override these post-T21 Hub docs for current implementation planning.

## Proven Baseline

T12 through T20 are the proven First Base / DFW Baseboard safety primitives:

- `public.board_posts` stores threads/posts.
- `public.board_post_comments` stores top-level comments.
- Post and comment reporting tables store private report state.
- Narrow SECURITY DEFINER RPCs control create, read, report, and moderation
  paths.
- Operator review uses `operator.community_moderation`.
- Direct `board_posts` write policies remain closed.
- Known Supabase migration-history drift remains preserved; broad
  `supabase db push` remains unsafe.

T21 reframed the user-facing DFW surface as:

- DFW Hub
- DFW Today
- Base
- Layover
- Channels
- Recent Useful Threads
- Request a Channel inside Channels

T21 did not add migrations, runtime data, free user-created channels, live
weather/traffic integrations, photo uploads, or database table renames.

## No-UGC / Data-Loss Note

There is no real production UGC in the DFW Hub yet. Existing test/seed content
is not a blocker for choosing the channel model.

That does not make table or RPC renames appropriate in this lane. Internal
Baseboard/board names can remain while product-facing language moves to Hubs
and Channels. Any internal rename should be planned as a separate refactor with
runtime safety and rollback criteria.

## Decision

Use existing board primitives for real Hub Channels.

The recommended internal model is:

- Hub maps to `public.bases` plus the current parent/base board container.
- Channel maps to child `public.boards` rows under the DFW base board.
- Thread maps to `public.board_posts`.
- Comments map to `public.board_post_comments`.
- Reports and moderation continue to use the existing post/comment report and
  moderation primitives.

Do not create a standalone `channels` table yet.

## Why Not `board_posts.category` Alone

`board_posts.category` can help label content, but it is too weak to model real
Channels.

It does not provide:

- channel names and slugs
- channel descriptions, purpose, or rules
- channel ordering
- channel status
- duplicate prevention
- request/review lifecycle
- future channel-level routing
- future channel-level follows or access rules

Using categories alone would also force awkward mappings for `App Feedback`,
`New to DFW`, `Base Life`, and other product-facing channel names that are not
cleanly represented by the current category allowlist.

## Recommended Minimal Future Model

When the implementation lane starts, prefer a minimal migration that reuses
`public.boards`:

- Add a controlled `hub_channel` board type.
- Seed DFW child channel boards under the current DFW base board.
- Keep posts attached to `public.board_posts` through `board_id`.
- Keep comments attached to `public.board_post_comments`.
- Keep report and moderation storage/RPCs aligned with existing post/comment
  primitives.

Default DFW child channel board slugs:

- `dfw-questions`
- `commuting-parking`
- `food-coffee`
- `new-to-dfw`
- `base-life`
- `crew-tips`
- `app-feedback`

Default DFW product-facing channel names:

- DFW Questions
- Commuting & Parking
- Food & Coffee
- New to DFW
- Base Life
- Crew Tips
- App Feedback

## Future Channel-Aware RPCs

Current DFW RPCs still target the single active DFW `base_board`. Real channel
routing/posting will need channel-aware wrappers or replacements.

Future safe RPCs should include:

- `list_open_hub_channels(p_base_code)`
- `list_open_hub_channel_posts(p_base_code, p_channel_slug, p_limit)`
- `create_open_hub_channel_post(p_base_code, p_channel_slug, ...)`
- `get_open_hub_channel_post(p_base_code, p_channel_slug, p_post_id)`

The RPCs must preserve the existing rules:

- resolve active base by `p_base_code`
- resolve active open verified boards server-side
- require `auth.uid()`
- require DB-level private-app/open-board eligibility
- expose safe fields only
- keep reporter identity, author IDs, emails, claimed fields, verification
  data, proof/storage data, signed URLs, and private paths hidden
- add no direct post/comment write policies
- keep hidden/removed content out of normal reads

## Request A Channel Future Model

`Request a Channel` remains an in-section action inside Channels. It is not a
top-level Hub section and is not free channel creation.

Future implementation should use a reviewed workflow, likely backed by a table
such as `public.hub_channel_requests` or
`public.board_channel_requests`.

The request path should:

- force requester identity from `auth.uid()`
- require verified/private-beta eligibility
- require clear name, purpose, and rules
- reject duplicate existing channels
- reject unsafe topics
- reject live ops-sensitive topics
- reject passenger private information
- reject airport/security-sensitive procedures
- reject exact public crew hotel exposure
- reject dating/social clique behavior
- keep request details private to the requester and reviewers
- require admin/operator approval before creating a child board row

Consider a future scope such as `operator.manage_hub_channels` instead of
overloading `operator.community_moderation` forever.

## Layover Future Model

Keep Layover inside the airport Hub for now. The canonical home is
`MIA Hub > Layover`, not a separate top-level `Layover Guide` product and not
`DFW Hub > MIA Layover`.

Layover UGC should wait until Channels are stable.

Later, layover recommendations may need a richer structured model because
place recommendations, suggested updates, saves, helpful marks, and curated
highlights are more specific than normal discussion threads.

Layover safety boundaries remain:

- no exact crew hotels
- no live crew movement/location
- no passenger private information
- no airport/security-sensitive procedures
- no company-confidential content
- no dating/social meetups
- no photo uploads unless separately scoped with strict moderation/storage

## Wireframe Source Pack

Use this compact source pack for wireframes and design exploration.

Product language:

- `[AIRPORT] Hub`
- `[AIRPORT] Today`
- Base
- Layover
- Channels
- Recent Useful Threads
- Request a Channel inside Channels

DFW default Channels:

- DFW Questions
- Commuting & Parking
- Food & Coffee
- New to DFW
- Base Life
- Crew Tips
- App Feedback

Known UX debt from T21:

- shell is placeholder-heavy
- card stacking needs polish
- Channels needs thread creation, reading, reply hierarchy, and eventual signal
  patterns
- Request a Channel should be a secondary action inside Channels

Wireframes should not design around real UGC. None exists yet.

## Recommended Next Ticket

Recommended next step:

`FBMVP-T23A: DFW Hub Channels UX Wireframe`

Reason:

- The user will not have localhost access during the day.
- Wireframes are being generated externally.
- The IA now needs product layout clarity before DB/RPC-backed child channel
  boards are implemented.

Alternative next implementation ticket:

`FBMVP-T23: DFW Hub Channels Foundation`

Use this if implementation should proceed directly. Scope it to the
`hub_channel` board type, seeded DFW child boards, and safe channel-aware RPCs.

## Out Of Scope

This decision record does not add:

- app code
- migrations
- runtime data changes
- deployments
- table/RPC/database renames
- free user-created channels
- reactions, saves, search, or media uploads
- live weather/traffic integrations
- layover recommendation schema
- public sharing
- access, moderation, RLS, admin, or reporting weakening
