# FBMVP-T05 Base Board Model

Date: 2026-06-09

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This note records the local implementation scope for `FBMVP-T05: Base, Board,
And Board-Type Data Model Design`.

T05 creates the database/model foundation for the First-Base MVP. It does not
build the app UI or later community interaction features.

Runtime apply status:

- T05 is merged on `main`.
- The T05 Supabase runtime apply pass is recorded in
  `docs/ops/fbmvp-t05-base-board-runtime-pass.md`.

Use `docs/strategy/base-board-product-definition.md` for the canonical product
definition of a Base Board. T05 supports that definition by modeling bases,
boards, and board types, but it does not implement the Base Board UI,
posts/comments, follows, search, Verified Lounge access flows, or board
intel/wiki content.

Use `docs/strategy/home-base-board-follow-decision.md` for the follow-on T06
product decision: Home Base is required personalization state, setting it should
auto-follow the base's main Base Board, and neither Home Base nor board follows
grant restricted access.

The initial T06 rollout should use a DFW-start confirmation step after
work-email verification rather than a fake one-option Home Base picker. Future
multi-base selection and switching can follow once more active bases exist.

## 2. Implemented Scope

T05 adds:

- `bases`
- `board_types`
- `boards`
- DFW as the first launch base
- DFW Base Board as the first available board
- board types for `base_board`, `layover_board`, and `verified_lounge`
- RLS enabled on all new tables
- indexes for expected base/board listing and lookup patterns

DFW is the first MVP launch base and first available base board. It is not the
whole product concept, and the schema supports many bases and boards from the
start.

Runtime-proven metadata state:

- `public.bases`, `public.board_types`, and `public.boards` exist in the
  intended `jmpseat` Supabase project
- RLS is enabled on all three tables
- DFW is seeded as the first active base
- `base_board`, `layover_board`, and `verified_lounge` are seeded
- `DFW Base Board` is seeded with slug `dfw`

## 3. Deferred Scope

The following remain later tickets:

- board follows
- home-base preferences
- verified lounge memberships
- board access requests
- community-admin grants
- posts
- comments/replies
- sharing
- saves
- reactions/useful marks
- search
- reports
- moderation/admin queues
- board intel/wiki structured content

Board wiki/intel is intentionally not a board type in T05. It should be modeled
as structured content attached to boards in a later ticket.

## 4. Authorization Notes

RLS is enabled on the new tables.

T05 keeps direct client policies conservative. The broad private-app eligibility
boundary remains enforced by existing server-side private app gates until later
community read helpers or route surfaces are implemented.

Self-declared `claimed_airline`, `claimed_role`, and `claimed_base` profile
fields must not become authorization truth. Airline-email verification grants
broad app eligibility only, not restricted-board membership.
Self-declared airline text may help profile or request context later, but it
must not grant airline-specific board or lounge access without separate
verified-airline or approved-domain logic.

## 5. Safety Notes

Proof uploads remain deprecated/out of current scope.

T05 does not touch proof upload code, proof storage, proof cleanup, or proof
review surfaces.

T05 does not create posts/comments, media uploads, user-generated content,
search, reports, or moderation workflows. Reporting/moderation/admin controls
remain required before broad real member-generated content exposure.
