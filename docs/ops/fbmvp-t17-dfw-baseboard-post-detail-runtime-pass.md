# FBMVP-T17 DFW Baseboard Post Detail Runtime Pass

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Runtime Result

`FBMVP-T17` was successfully runtime-applied to the intended Supabase project.

Target project:

- name: `jmpseat`
- ref/id: `qcdfjrcnwuioqprmqqzx`

Applied migration:

- version: `20260610203000`
- name: `create_open_baseboard_post_detail_rpc`
- file:
  `supabase/migrations/20260610203000_create_open_baseboard_post_detail_rpc.sql`

## Verified Runtime State

The runtime apply created:

- `public.get_open_baseboard_post(p_base_code text, p_post_id uuid)`

The function returns safe columns only:

- `id`
- `title`
- `body`
- `content_type`
- `category`
- `is_pinned`
- `created_at`
- `updated_at`
- `author_label`

Runtime verification confirmed the function:

- is `SECURITY DEFINER`
- is `STABLE`
- uses locked `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_read_open_board_posts()`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- filters to `status = 'published'`
- filters to `visibility = 'board'`
- uses `profiles.handle` with `jmpseat member` fallback
- does not return unsafe fields:
  - `author_user_id`
  - email
  - claimed fields
  - verification status/evidence
  - reporter identity
  - proof/storage data
  - signed URLs
  - private paths

Function execute posture:

- `anon`: false
- `public`: false
- `authenticated`: true
- `service_role`: true

Additional verification:

- `public.board_posts` write policy count remains `0`
- `public.board_posts` SELECT policy count remains `2`
- T14 functions remain present
- T16 functions remain present

## Runtime Smoke Boundary

Runtime verification used only catalog/count checks.

No post content was read or printed during runtime verification.

Count-only checks:

- `public.board_posts` count was `1`
- `public.board_post_reports` count was `0`

T17 migration/apply did not create:

- posts
- reports
- moderation records
- comments
- replies
- saves
- reactions
- search indexes
- user/community content

No broad Supabase `db push` or migration repair was used.

## Drift State

Known Supabase migration-history drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Plain-language guardrail: broad Supabase `db push` remains unsafe.

## Product Scope Confirmed

T17 adds private-gated read-only DFW Baseboard post detail through a safe DB
read RPC by post id. The detail surface includes the existing report affordance.

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

Next recommended implementation milestone: `FBMVP-T18`, only after this T17
runtime-pass documentation is reviewed and committed.
