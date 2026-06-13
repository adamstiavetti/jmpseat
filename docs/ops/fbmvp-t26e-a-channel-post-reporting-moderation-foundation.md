# FBMVP-T26E-A: Channel Post Reporting + Moderation Review Foundation

Date: 2026-06-13

Repo checkpoint before implementation: `4a43dbe docs: record dfw hub baseline checkpoint`

## Purpose

T26E-A adds the first safety layer for DFW Channels now that selected-channel
post creation is live. It covers post reporting and operator review for existing
DFW Channel posts only.

This is not the comments milestone. Comments are not implemented by this ticket.

## Existing Schema / Pattern Findings

The existing T16/T18 community safety foundation already provides:

- `public.board_post_reports`
- `public.report_open_baseboard_post(...)`
- `public.list_open_baseboard_post_reports(...)`
- `public.moderate_open_baseboard_post(...)`
- `/app/admin/community-moderation`
- `operator.community_moderation`

T26E-A reuses `public.board_post_reports` instead of adding a parallel report
table. The new SQL is channel-specific RPC surface over the existing report
table and existing `board_posts` lifecycle fields.

Existing report reason values are preserved:

- `spam`
- `harassment`
- `unsafe_info`
- `privacy`
- `off_topic`
- `other`

Existing report status values are preserved:

- `open`
- `reviewing`
- `resolved`
- `dismissed`

The ticket language around `resolved_no_action` / `resolved_action_taken` maps
to the existing table vocabulary rather than changing the deployed report table
constraint in this implementation.

## Runtime / Migration Summary

Created migration:

- `supabase/migrations/20260613091500_create_hub_channel_post_reporting_rpc.sql`

It adds:

- `public.report_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid, p_reason text, p_details text default null)`
- `public.list_open_hub_channel_post_reports(p_base_code text, p_limit integer default 50)`
- `public.moderate_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid, p_action text, p_reason text)`

The migration does not create a new table, expose direct client table writes, or
add broad table grants. Runtime apply is required before beta smoke.

## Reporting Flow

The selected-channel post detail route now accepts reports for published,
board-visible posts inside active, visible DFW Hub Channel boards.

User-facing behavior:

- report affordance appears on `/app/hubs/dfw/channels/[channelSlug]/[postId]`
- report submission is server-action/RPC backed
- reasons are allowlisted
- details are optional and length-limited to 1,000 characters
- duplicate open/reviewing reports return a safe duplicate state
- public response does not expose reporter identity, author user IDs, report
  counts, database errors, schema details, or moderation internals

Safe messages:

- `Thanks — this report was sent for review.`
- `You already reported this post.`
- `Choose a report reason before submitting.`
- `jmpseat could not submit that report right now. Try again in a moment.`

## Moderation Review Summary

The existing `/app/admin/community-moderation` surface now includes open DFW
Channel post reports alongside existing Baseboard post/comment reports.

The channel report review list shows safe review context only:

- channel slug/name
- post title/body preview
- content type/category
- safe author label
- reason/details
- report status
- reported date

It does not show reporter user IDs, author user IDs, emails, verification data,
proof-upload data, storage paths, signed URLs, or public report counts.

Operator actions remain narrow:

- `hide`
- `remove`

Both require `operator.community_moderation`, update existing `board_posts`
lifecycle fields, and resolve open/reviewing reports for the moderated post.
No account bans, AI final moderation decisions, appeals workflow, or public
moderation feed are added.

## Access / Authorization

Reporting requires:

- authenticated user
- existing private-app / DFW Hub access gate
- DB-level open-board read eligibility
- active base
- active parent base board
- active visible `hub_channel`
- published board-visible post in that channel by `board_posts.board_id`

Operator review/actions require:

- authenticated operator
- existing admin/private-app gate
- `operator.community_moderation`
- server-side RPC checks

No mutation path uses direct client table writes.

## Privacy / Safety

T26E-A preserves:

- no public reporter identity
- no public report counts
- no public author user IDs
- no proof/verification data
- no storage paths or signed URLs
- no live operations data
- no exact crew hotel exposure
- no passenger private information
- no company-confidential content
- no AI final moderation decisions
- no account bans

## Out Of Scope

Not implemented:

- comments/replies
- AI moderation decisions
- AI final moderation decisions are not implemented.
- final account bans
- account bans are not implemented.
- user-to-user DMs
- public moderation drama/feed
- Request a Channel workflow
- NonRev Deals
- payments/marketplace behavior
- broad UI redesign

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/DATA_MODEL.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/hub-pivot-plan.md`
- this implementation note

Docs Not Updated / Why:

- Runtime-apply docs were not created in this implementation task because the
  migration was not applied.
- Browser-smoke docs were not created because deployment/runtime readiness has
  not been verified yet.
- Broad roadmap docs outside the current 05B / First-Base MVP lane were not
  rewritten.

Scope Impact:

- DFW Channel post reporting and operator moderation review foundation only.
- Reuses existing board post report table and operator moderation pattern.
- Adds no comments, public report counts, AI decisions, account bans, Request a
  Channel workflow, live integrations, payments, or marketplace behavior.

Runtime Apply Docs Needed?

- Yes. A targeted runtime apply is required for
  `20260613091500_create_hub_channel_post_reporting_rpc.sql`.
- Runtime apply is pending.

Browser Smoke Docs Needed?

- Yes. After runtime apply and deployment, authenticated browser smoke should
  verify report submission, duplicate-safe behavior, operator review visibility,
  no-cookie/public-domain boundaries, and privacy/safety boundaries.
- Browser smoke pending.

## Status

Local implementation pending review, runtime apply, deployment, and browser
smoke.
