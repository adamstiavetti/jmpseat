# FBMVP-T05 Base Board Runtime Pass

Date: 2026-06-09

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This note records the targeted Supabase runtime apply pass for
`FBMVP-T05: Base, Board, And Board-Type Data Model Design`.

T05 was already merged in app/repo history. This pass applies only the
database/model foundation migration to the intended `jmpseat` Supabase project
and verifies the seeded metadata state.

## 2. Runtime Apply Summary

Applied migration:

- `20260609020355 create_base_board_model`

Target Supabase project:

- `jmpseat`

Apply path used:

- authenticated Supabase connector

Why the connector path was used:

- the local CLI link path in this worktree lacked Supabase CLI auth
- the runtime pass stayed within the same intended project after explicit
  project confirmation

Broad `supabase db push` was not used.

Only `20260609020355` was recorded in remote migration history during this
pass.

## 3. Existing Drift Still Present

This pass did not resolve prior remote migration-history drift.

The existing documented drift remains:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`

That drift is why this pass remained targeted and did not use broad migration
push behavior.

## 4. Verification Results

Verified successfully:

- `public.bases` exists
- `public.board_types` exists
- `public.boards` exists
- row level security is enabled on all three tables
- `DFW` exists in `public.bases` with active status
- `base_board`, `layover_board`, and `verified_lounge` exist in
  `public.board_types`
- `DFW Base Board` exists in `public.boards`
- `DFW Base Board` uses slug `dfw`
- `DFW Base Board` has visibility `open_verified`
- `DFW Base Board` has posting mode `members_can_post`
- `DFW Base Board` has status `active`
- no unrelated migration versions were newly marked applied

## 5. Boundaries Preserved

This runtime pass did not:

- run broad `supabase db push`
- deploy app code
- change Vercel, DNS, SMTP, auth, storage, or runtime settings
- create posts, comments, memberships, follows, access requests, saves,
  reactions, search, reports, or moderation state
- touch proof-upload code, proof storage, proof cleanup, or proof review
  surfaces

The only runtime mutation in this pass was the intended T05 schema creation and
seeded metadata for:

- DFW as the first launch base
- the three controlled board types
- the first DFW Base Board row

## 6. Next Lane

The next implementation lane after the T05 runtime pass is:

- `FBMVP-T06: Home Base Preference + Board Follow Foundation`

Current T06 note:

- T06 is implemented and merged in
  `docs/ops/fbmvp-t06-home-base-board-follows.md`.
- The intended Supabase runtime already has the base T06 schema/functions
  recorded as remote migration
  `20260609194858 create_home_base_board_follows`; the local repo file remains
  `20260609130534_create_home_base_board_follows.sql` and must not be
  re-applied or retroactively marked applied.
- Follow-up RPC execute-grant hardening should be applied through the targeted
  `20260609200310_harden_home_base_rpc_execute_grants.sql` migration.
- The T06 foundation keeps Home Base and board follows as personalization
  state only and does not grant restricted access.
- No Home Base is a valid initial DFW-only rollout state. Skipping the
  DFW-start choice creates no Home Base preference, requires no automatic board
  follow, and must not block app access.

Use these controlling docs when reviewing T06 or extending the board/home-base
foundation:

- `docs/strategy/home-base-board-follow-decision.md`
- `docs/strategy/base-board-product-definition.md`
- `docs/ops/05b-first-base-mvp-planning.md`

Initial rollout note:

- T06 should start with optional DFW-only Home Base onboarding behavior
- the user chooses Start with DFW or Skip for now after work-email verification
- if the user starts with DFW, Home Base is set to DFW
- if the user starts with DFW, the system auto-follows the DFW Base Board
- if the user skips, no Home Base preference is created and no automatic board
  follow is required
- future multi-base Home Base selection and switching remains part of the same
  T06 lane without making Home Base an authorization grant
