# FBMVP-T16 Board Post Safety Foundation

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T16` adds the first narrow safety path for live DFW Baseboard posts.

T16 is intentionally limited to:

- minimal DFW Baseboard reporting
- an operator-scoped hide/remove RPC for unsafe published Baseboard posts
- server actions/RPCs only for user-facing mutations

T16 is runtime-applied as `20260610191809 create_board_post_safety_foundation`.
The runtime pass is recorded in
`docs/ops/fbmvp-t16-board-post-safety-runtime-pass.md`.

## What T16 Adds

New local migration:

- `supabase/migrations/20260610191809_create_board_post_safety_foundation.sql`

New report table:

- `public.board_post_reports`

New RPCs:

- `public.report_open_baseboard_post(p_base_code text, p_post_id uuid, p_reason text, p_details text default null)`
- `public.moderate_open_baseboard_post(p_base_code text, p_post_id uuid, p_action text, p_reason text)`

New server action files:

- `src/lib/community/boardPostSafetyActions.ts`
- `src/lib/community/boardPostSafetyActionState.ts`

Updated route/UI:

- `/app/hubs/dfw/baseboard` remains behind `requireDfwHubRouteAccess(...)`.
- The route still fetches posts only after the private route gate succeeds.
- The route passes the report action to the Baseboard shell after the gate.
- DFW Baseboard post cards render a compact native report form.

## Report Table Scope

`public.board_post_reports` stores:

- report id
- post id
- reporter user id
- reason
- optional bounded details
- review status
- optional review metadata
- timestamps

Report reasons are constrained to:

- `spam`
- `harassment`
- `unsafe_info`
- `privacy`
- `off_topic`
- `other`

Report statuses are constrained to:

- `open`
- `reviewing`
- `resolved`
- `dismissed`

The table has RLS enabled. T16 does not add anon/public report read policies and
does not expose report details publicly. Reporter identity is forced by the RPC
from `auth.uid()` and is not broadly exposed.

## Report RPC Scope

`public.report_open_baseboard_post(...)`:

- is `SECURITY DEFINER`
- uses `set search_path = public, pg_temp`
- requires `auth.uid()`
- requires DB-level open board read eligibility through
  `public.current_user_can_read_open_board_posts()`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` `base_board`
- allows reports only for posts on that active open Baseboard
- allows reports only for `status = 'published'` and `visibility = 'board'`
- validates the reason allowlist
- trims and bounds optional details
- forces `reporter_user_id = auth.uid()`
- returns only the report UUID
- revokes execute from `public` and `anon`
- grants execute only to `authenticated` and `service_role`

The RPC does not expose reporter identity, author IDs, emails, claimed profile
fields, verification status, verification evidence, proof/storage data, signed
URLs, private paths, or internal eligibility reasons.

## Moderation RPC Scope

`public.moderate_open_baseboard_post(...)`:

- is `SECURITY DEFINER`
- uses `set search_path = public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` `base_board`
- only targets posts on that active open Baseboard
- supports only `hide` and `remove`
- sets `board_posts.status = 'hidden'` for hide
- sets `board_posts.status = 'removed'` for remove
- sets `removed_at = now()`
- sets `removed_by = auth.uid()`
- sets bounded `removal_reason`
- returns only the post UUID

The migration adds the explicit `operator.community_moderation` scope value so
future operator grants can assign this authority through the existing operator
grant model.

T16 does not add direct `board_posts` write policies and does not weaken RLS.
Plain-language guardrail: T16 preserves zero direct board_posts write policies.
The current read surfaces exclude hidden/removed posts because T14 reads only
`status = 'published'` and `visibility = 'board'`.

## UI Scope

The DFW Baseboard post cards now include:

- a report reason select
- optional bounded report details
- a submit button
- safe report status messages

Safe status copy:

- success: `Thanks — the post was reported for review.`
- invalid: `Choose a report reason before submitting.`
- failed: `jmpseat could not submit that report right now. Try again in a moment.`

No reporter identity is shown. No moderation queue UI is added.

## Runtime Boundary

T16 is runtime-applied on the intended `jmpseat` Supabase project
(`qcdfjrcnwuioqprmqqzx`).

Known Supabase migration-history drift remains, so broad Supabase db push
remains unsafe. Plain-language guardrail: broad Supabase db push remains unsafe.

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

The runtime pass verified the exact ledger row
`20260610191809 create_board_post_safety_foundation`, RLS/report-table posture,
T16 RPC grants, zero direct `board_posts` write policies, and T14 read filtering
for `status = 'published'` and `visibility = 'board'`.

Runtime verification used catalog, permission, schema, policy, and count checks
only. T16 did not create posts, reports, or moderation records during
migration/apply. `public.board_post_reports` count was `0` immediately after
apply verification. `public.board_posts` count after apply was `1`; that post is
user-created test content separate from the T16 migration/apply, not a migration
side effect.

## What T16 Does Not Add

T16 does not add:

- post detail
- comments or replies
- saves
- reactions
- search backend
- moderation queue UI
- AI moderation
- bans
- account sanctions
- lounge or restricted-board posting
- Layovers seeded content
- Crew Picks ranking
- public sharing
- media uploads
- proof-upload scope
- direct `board_posts` write policies
- RLS weakening
- deploy or runtime settings changes
