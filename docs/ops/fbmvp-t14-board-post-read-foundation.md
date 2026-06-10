# FBMVP-T14 Board Post Read Foundation

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T14` adds the first read-only board post surface for the DFW Baseboard.

This lane renders published DFW Baseboard posts on
`/app/hubs/dfw/baseboard` when they exist and shows a safe empty state when
there are no posts.

Runtime status: implemented locally only. The local migration is runtime-pending
and must not be treated as applied until a separate targeted runtime preflight
and exact-version apply pass is approved and documented.

## What T14 Adds

New local migration:

- `supabase/migrations/20260610162000_create_board_post_read_rpc.sql`

New RPC/helper functions:

- `public.current_user_can_read_open_board_posts()`
- `public.list_open_baseboard_posts(p_base_code text, p_limit integer default 20)`

New server helper:

- `src/lib/community/boardPostReads.ts`

Updated route/UI:

- `/app/hubs/dfw/baseboard` remains behind the existing private app route gate.
- The route fetches posts only after `requireDfwHubRouteAccess(...)` succeeds.
- The DFW Baseboard shell renders a read-only post list or empty state.

## Read RPC Scope

`public.list_open_baseboard_posts(...)`:

- is `SECURITY DEFINER`
- uses `set search_path = public, pg_temp`
- requires `auth.uid()`
- accepts a base code and is called with `DFW` by the app helper
- looks up the active base by code
- finds the active `open_verified` `base_board`
- returns only `published` posts with `visibility = 'board'`
- orders by `is_pinned desc, created_at desc`
- clamps `p_limit` to at least 1 and at most 50, defaulting to 20

Returned fields are intentionally narrow:

- `id`
- `title`
- `body`
- `content_type`
- `category`
- `is_pinned`
- `created_at`
- `updated_at`
- `author_label`

Author display uses `profiles.handle` only. If no safe handle exists, the
fallback label is `jmpseat member`.

The RPC does not expose author IDs, email addresses, claimed airline, claimed
role, claimed base, verification status, verification evidence, proof/storage
data, signed URLs, or private operational details.

## Read Eligibility

The read RPC is not auth-only.

`public.current_user_can_read_open_board_posts()` requires:

- authenticated caller
- completed profile
- either operator internal private-app access through
  `operator.internal_private_app_access`, or both:
  - active beta access
  - verified work-email / aviation-worker state from existing approved
    work-email verification records

This intentionally mirrors the current private-testing private app posture for
normal users instead of making the RPC a broad authenticated data bypass.

The helper does not authorize from self-declared `claimed_airline`,
`claimed_role`, or `claimed_base`.

## UI Scope

The DFW Baseboard route now renders:

- published read-only post cards when rows exist
- empty state text when no rows exist:
  - `No DFW Baseboard posts yet.`
  - `Published DFW Baseboard posts will appear here when they exist. Posting, replies, saves, reactions, and search are not live in this read-only foundation.`
- a safe unavailable message if the RPC is not available or denied

The UI does not render a composer, create action, comments, replies, saves,
reactions, search backend, Crew Picks ranking, lounge posting, or seeded
layover content.

## Runtime Boundary

This implementation adds a migration file but does not runtime-apply it.

Known Supabase migration-history drift remains, so broad `supabase db push`
remains unsafe.

Plain-language guardrail: broad Supabase db push remains unsafe due known
migration drift.

Before declaring a runtime pass, use a targeted runtime preflight/apply flow
that:

- confirms the intended `jmpseat` project
- confirms migration `20260610162000` is absent
- confirms dependencies from T05, T12, and T13 exist
- applies only the T14 migration SQL
- inserts only the matching migration ledger row
- verifies function grants, return fields, eligibility behavior, and no
  `board_posts` write-policy changes

## What T14 Does Not Add

T14 does not add:

- composer or post creation UI
- calls to `public.create_board_post(...)`
- comments or replies
- saves
- reactions
- search backend
- Crew Picks ranking
- lounge or restricted-board posting
- seeded layover implementation
- moderation/reporting workflows
- AI behavior
- proof-upload scope
- runtime data mutation
- deploy or runtime setting changes
