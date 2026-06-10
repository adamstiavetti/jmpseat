# FBMVP-T13 Server-Controlled Create Post Foundation

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T13` adds the first server-controlled create-post path on top of the
runtime-applied T12 `public.board_posts` table.

This is a foundation lane only. It creates a database RPC for controlled post
creation, but it does not build a full posting UI or expose broad community
posting.

## What T13 Adds

New local migration:

- `supabase/migrations/20260610143547_create_board_post_rpc.sql`

New RPC:

- `public.create_board_post(p_board_id uuid, p_title text, p_body text, p_content_type text, p_category text)`

The RPC:

- uses `auth.uid()` as the only author source
- validates that the caller is authenticated
- requires DB-level contribution eligibility before insert
- rejects auth-only callers who have not passed the contribution gate
- validates that the target board is active
- validates that the target board has `visibility = 'open_verified'`
- limits this lane to active Baseboards by requiring board type `base_board`
- trims and bounds title/body text
- allows only T12 content types and categories
- forces `status = 'published'`
- forces `visibility = 'board'`
- forces `is_admin_seeded = false`
- forces `is_pinned = false`
- returns only the created post id

## First Intended Consumer

DFW Baseboard is the first intended consumer for this RPC.

T13 does not hardcode DFW into the function. The function is intentionally
board-driven so future active open verified Baseboards can use the same server
path when product and moderation readiness allow.

## Access And Authorization Boundaries

T13 does not add direct insert policies on `public.board_posts`.

Auth alone is not enough to create an open Baseboard post. The RPC calls a
boolean DB-side eligibility helper before inserting.

For the current private-beta posture, open Baseboard contribution eligibility
requires:

- authenticated caller
- completed profile via `public.profiles.profile_completed_at`
- either operator internal private-app access or both:
  - active beta access in `public.beta_access`
  - verified work-email / aviation-worker status from existing verification
    request/evidence/domain or approved work-email claim state

The helper returns only a boolean and does not expose verification evidence
details.

Function execution is limited to:

- `authenticated`
- `service_role`

Function execution is revoked from:

- `anon`
- `public`

T13 does not grant access from:

- Home Base
- board follows
- self-declared `claimed_airline`
- self-declared `claimed_role`
- self-declared `claimed_base`

Home Base, follows, and self-declared profile fields remain personalization or
profile state only. They do not grant restricted posting access.

Self-declared profile fields also do not grant open Baseboard posting rights.
The RPC does not authorize from self-declared `claimed_airline`, `claimed_role`,
or `claimed_base`.

## Restricted Posting

T13 does not enable lounge or restricted-board posting.

The RPC only targets active open verified Baseboards. Restricted lounge posting
should wait for a later lane that combines membership checks, moderation
readiness, Crew Lead expectations, and request/access boundaries.

## Moderation And Safety

T13 does not implement content moderation, reports, rate limits, or safety
filters. Moderation and reporting are required before broad beta posting
expansion.

The RPC also does not attempt AI moderation. AI must not become the source of
truth for publish decisions.

Product safety boundaries still apply for later posting surfaces:

- no exact crew hotel locations
- no live crew tracking
- no passenger/private information
- no airport security procedures
- no operationally sensitive information
- no confidential company documents

## What T13 Does Not Add

T13 does not add:

- full posting UI or composer
- comments or replies
- edit/delete post actions
- direct table insert/update/delete policies
- reactions, likes, or upvotes
- saves
- search backend
- Crew Picks ranking
- lounge request/review flows
- Crew Lead panel functionality
- lounge or restricted-board posting
- seeded layover runtime content
- image/file uploads
- rich text
- AI moderation or publishing
- proof-upload scope

## Runtime Status

T13 is runtime-applied in the intended Supabase project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`
- migration ledger row: `20260610143547 create_board_post_rpc`
- runtime pass record: `docs/ops/fbmvp-t13-create-post-runtime-pass.md`

The runtime pass verified that both T13 functions exist, execute is unavailable
to `anon`/`public`, execute is granted to `authenticated` and `service_role`,
`public.board_posts` keeps authenticated `SELECT` only, no direct write policies
were added, and no user/community content was created.

Do not run broad `supabase db push`. Known migration-history drift remains, so
future runtime work should continue using targeted apply paths that preserve
exact migration versions.

## Validation

Static/source validation for T13 should confirm:

- the create-post RPC exists
- the RPC uses `auth.uid()`
- the RPC requires DB-level contribution eligibility
- auth alone is not enough
- the eligibility check requires completed profile plus operator internal
  private-app access or active beta access with verified work-email status
- the RPC validates active open verified Baseboards
- the RPC rejects restricted/lounge boards
- the RPC does not authorize from self-declared profile fields
- user-controlled author/status/visibility/admin/pinned fields are not exposed
- direct insert policies are not added
- execute is revoked from `anon` and `public`
- execute is granted only to `authenticated` and `service_role`
- no comments, saves, reactions, search, lounge posting, AI, seed content, or
  proof-upload scope is introduced
