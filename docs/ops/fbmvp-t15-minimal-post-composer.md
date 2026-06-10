# FBMVP-T15 Minimal Post Composer

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T15` adds the first minimal, server-controlled post composer for the DFW
Baseboard route at `/app/hubs/dfw/baseboard`.

The composer is intentionally narrow:

- DFW Baseboard only
- title and body fields only
- default `content_type = 'note'`
- default `category = 'general'`
- server action only
- no client-side Supabase writes

## What T15 Adds

New local migration:

- `supabase/migrations/20260610182000_create_open_baseboard_post.sql`

New wrapper RPC:

- `public.create_open_baseboard_post(p_base_code text, p_title text, p_body text, p_content_type text default 'note', p_category text default 'general')`

New server action files:

- `src/lib/community/boardPostActions.ts`
- `src/lib/community/boardPostActionState.ts`

Updated route/UI:

- `/app/hubs/dfw/baseboard` remains behind `requireDfwHubRouteAccess(...)`.
- The route reads post status from a safe query status.
- The route fetches posts only after the private route gate succeeds.
- The route passes `createDfwBaseboardPostAction` to the Baseboard shell after
  the gate succeeds.
- The shell renders a native title/body composer only for the DFW Baseboard
  section.

## Wrapper RPC Scope

`public.create_open_baseboard_post(...)`:

- is `SECURITY DEFINER`
- uses `set search_path = public, pg_temp`
- requires `auth.uid()`
- resolves the active base by `p_base_code`
- finds the active `open_verified` `base_board`
- delegates to `public.create_board_post(v_board_id, p_title, p_body, p_content_type, p_category)`
- returns only the created post UUID
- grants execute only to `authenticated` and `service_role`
- revokes execute from `anon` and `public`

The wrapper does not duplicate the full T13 contribution eligibility logic.
`public.create_board_post(...)` remains the final DB-level contribution
authority, including completed profile, private-beta/work-email eligibility, and
operator internal private-app access boundaries.

The wrapper does not expose board UUIDs, author IDs, email addresses, claimed
profile fields, verification status, verification evidence, proof/storage data,
signed URLs, or private paths.

## Server Action Scope

`createDfwBaseboardPostAction(formData)`:

- uses `"use server"`
- evaluates the private-child gate for `/app/hubs/dfw/baseboard`
- records a security event with `action: "create_dfw_baseboard_post"`
- redirects on gate failure using the existing private app pattern
- trims and validates title/body before the RPC
- enforces title required, title max 120, body required, body max 4000
- calls `create_open_baseboard_post` with `p_base_code = 'DFW'`
- passes `p_content_type = 'note'` and `p_category = 'general'`
- revalidates `/app/hubs/dfw/baseboard` on success
- redirects with safe user-facing status query values

The action does not hardcode a board UUID, does not use service-role app code
for the user posting path, and does not expose SQL/auth/eligibility details to
users.

## UI Scope

The DFW Baseboard route now supports:

- a title input
- a body textarea
- a submit button
- safe success, invalid-input, and failed-submit status messages
- the existing T14 post list and empty state

Safe status copy:

- success: `Your DFW Baseboard post is live.`
- invalid: `Add a title and body before posting. Titles can be up to 120 characters and posts up to 4,000 characters.`
- failed: `jmpseat could not publish that post right now. Try again in a moment.`

The UI does not add category or content-type selectors yet.

## Runtime Boundary

T15 is runtime-applied to the intended `jmpseat` Supabase project. The targeted
runtime pass is recorded in
`docs/ops/fbmvp-t15-minimal-post-composer-runtime-pass.md`.

Applied migration:

- project ref/id: `qcdfjrcnwuioqprmqqzx`
- ledger version: `20260610182000`
- ledger name: `create_open_baseboard_post`
- migration file:
  `supabase/migrations/20260610182000_create_open_baseboard_post.sql`

Known Supabase migration-history drift remains, so broad Supabase db push
remains unsafe. Plain-language guardrail: broad Supabase db push remains unsafe.

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

The runtime pass used targeted SQL execution only, applied the migration SQL and
exact ledger row in one explicit transaction, and verified the wrapper RPC,
function grants, unchanged `board_posts` write-policy posture, unchanged
`board_posts` count, and no content creation.

No post/content smoke test was run during runtime verification, and no
user/community content was created.

## What T15 Does Not Add

T15 does not add:

- comments or replies
- saves
- reactions
- search backend
- moderation queue
- lounge or restricted-board posting
- Layovers seeded content
- Crew Picks ranking
- proof-upload scope
- direct `board_posts` write policies
- table changes
- RLS weakening
- deploy or runtime settings changes
