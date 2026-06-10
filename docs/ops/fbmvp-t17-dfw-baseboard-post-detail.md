# FBMVP-T17 DFW Baseboard Post Detail

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T17` adds the first private, read-only detail route for a single DFW
Baseboard post.

T17 is intentionally limited to:

- DFW Baseboard post detail only
- safe server-side reads through a narrow DB RPC
- private route-gated rendering
- existing report affordance support

T17 is runtime-applied as
`20260610203000 create_open_baseboard_post_detail_rpc`. The runtime pass is
recorded in
`docs/ops/fbmvp-t17-dfw-baseboard-post-detail-runtime-pass.md`.

## What T17 Adds

New local migration:

- `supabase/migrations/20260610203000_create_open_baseboard_post_detail_rpc.sql`

New RPC:

- `public.get_open_baseboard_post(p_base_code text, p_post_id uuid)`

Updated server helper:

- `src/lib/community/boardPostReads.ts`

New route:

- `/app/hubs/dfw/baseboard/[postId]`

Updated UI:

- DFW Baseboard list cards link to the private detail route.
- The detail route renders a single safe post card.
- The detail route includes the existing DFW Baseboard report affordance and
  safe report status messages.

## Detail RPC Scope

`public.get_open_baseboard_post(...)`:

- is `SECURITY DEFINER`
- uses `set search_path = public, pg_temp`
- requires `auth.uid()`
- requires DB-level open board read eligibility through
  `public.current_user_can_read_open_board_posts()`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` `base_board`
- returns only the requested post on that active open Baseboard
- returns only `status = 'published'` and `visibility = 'board'` posts
- returns one row or no rows
- revokes execute from `public` and `anon`
- grants execute only to `authenticated` and `service_role`

Safe return fields only:

- `id`
- `title`
- `body`
- `content_type`
- `category`
- `is_pinned`
- `created_at`
- `updated_at`
- `author_label`

The author label uses `profiles.handle` with `jmpseat member` fallback.

The RPC does not expose author user IDs, emails, claimed airline/role/base,
verification status, verification evidence, reporter identity, proof/storage
data, signed URLs, private paths, comments, saves, reactions, search data,
public sharing state, lounge data, Layovers content, Crew Picks ranking, or
proof-upload scope.

## Route And UI Scope

The detail route:

- preserves `export const dynamic = "force-dynamic"`
- calls `requireDfwHubRouteAccess(...)` before reading the post
- reads the post only through the server-only helper
- uses `p_base_code = "DFW"` and does not hardcode a board UUID
- renders a safe unavailable state when no safe row exists
- does not expose whether a post is missing, hidden, removed, or unavailable
  for another reason
- does not call create/report/moderation RPCs during render
- does not create content during render

The list view now links each post title to the private detail route:

- `/app/hubs/dfw/baseboard/[postId]`

No public sharing or external post URL is added.

The detail UI is read-only except reporting. It shows safe title/body/metadata,
safe author label, pinned state, created/updated dates, a back link to DFW
Baseboard, and the existing report form/status copy.

## Runtime Boundary

T17 is runtime-applied on the intended `jmpseat` Supabase project
(`qcdfjrcnwuioqprmqqzx`).

Known Supabase migration-history drift remains, so broad Supabase db push
remains unsafe. Plain-language guardrail: broad Supabase db push remains unsafe.

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

The runtime pass verified the exact ledger row:

- version: `20260610203000`
- name: `create_open_baseboard_post_detail_rpc`
- file:
  `supabase/migrations/20260610203000_create_open_baseboard_post_detail_rpc.sql`

Runtime verification confirmed the detail RPC exists, returns safe columns
only, uses the expected function security/search-path posture, requires
`auth.uid()` and `public.current_user_can_read_open_board_posts()`, filters to
published board-visible posts, uses `profiles.handle` with `jmpseat member`
fallback, and preserves function grants, `board_posts` policy posture, and
T14/T16 function availability.

Runtime verification used catalog/count checks only. No post content was read or
printed. `public.board_posts` count was `1`, and
`public.board_post_reports` count was `0`. T17 did not create posts, reports,
moderation records, comments, replies, saves, reactions, search indexes, or
user/community content during migration/apply.

## What T17 Does Not Add

T17 does not add:

- comments or replies
- saves
- reactions
- search backend
- moderation queue UI
- public sharing
- lounge or restricted-board posting
- Layovers content
- Crew Picks ranking
- media uploads
- AI moderation
- bans
- account sanctions
- proof-upload scope
- direct `board_posts` write policies
- RLS weakening
- deploy or runtime settings changes
- posts, reports, moderation records, or other user/community content during
  validation
