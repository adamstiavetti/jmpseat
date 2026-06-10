# FBMVP-T15 Minimal Post Composer Runtime Pass

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

This document records the targeted runtime application of
`FBMVP-T15: Minimal Post Composer`.

T15 enables the minimal DFW Baseboard composer through the server action plus
`public.create_open_baseboard_post(...)` wrapper RPC path. T13
`public.create_board_post(...)` remains the final DB-level contribution
authority.

T15 does not add comments, saves, reactions, search, moderation queue,
lounge/restricted posting, Layovers seeded content, Crew Picks ranking,
proof-upload scope, deploy, or runtime setting changes.

## Target Runtime

Target Supabase project:

- project name: `jmpseat`
- project ref/id: `qcdfjrcnwuioqprmqqzx`

Applied migration:

- file: `supabase/migrations/20260610182000_create_open_baseboard_post.sql`
- ledger version: `20260610182000`
- ledger name: `create_open_baseboard_post`

Apply method:

- targeted SQL execution only
- migration SQL and exact ledger row were applied in one explicit transaction
- no broad `supabase db push`
- no migration repair
- no deploy

## Verified Runtime Object

The runtime pass verified this function exists:

- `public.create_open_baseboard_post(p_base_code text, p_title text, p_body text, p_content_type text, p_category text)`

The function:

- returns `uuid`
- is `SECURITY DEFINER`
- is locked to `search_path=public, pg_temp`
- requires `auth.uid()`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` `base_board`
- delegates to `public.create_board_post(...)`
- does not directly insert into `public.board_posts`
- does not duplicate or weaken T13 contribution eligibility
- does not authorize from `claimed_airline`
- does not authorize from `claimed_role`
- does not authorize from `claimed_base`

## Grant And Policy Verification

Function execute posture:

- unavailable to `anon`
- unavailable to `public`
- granted to `authenticated`
- granted to `service_role`

`public.board_posts` verification:

- RLS remains enabled
- policies remain `SELECT` only
- write policy count remains `0`

## Runtime Smoke Verification

The runtime pass used catalog, permission, schema, policy, and count checks only.

- no post/content creation smoke test was run
- the create RPC was not called with real data
- no posts were inserted
- no user/community content was created
- `public.board_posts` count remained `0`

One transient MCP read query failed during verification, then succeeded on
retry. No apply error occurred.

## Drift Boundary

Known migration drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Broad `supabase db push` remains unsafe. Future runtime schema work should use
targeted preflight/apply flows that preserve the known drift and exact intended
ledger versions.

## Result

T15 is runtime-applied and verified on the intended `jmpseat` Supabase project.

The next implementation milestone should be selected as T16 only after this
runtime-pass documentation is reviewed and committed.
