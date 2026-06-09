# 05B First-Base MVP Planning

Date: 2026-06-08

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This is the controlling planning note for the current `05B / First-Base MVP`
implementation lane.

Use this doc when deciding what the first code tickets should build right now.
Do not treat older broad V1 or full-beta docs as the immediate implementation
lane unless this doc or a newer controlling roadmap doc explicitly says so.

## 2. Current 05B Interpretation

`05B / First-Base MVP` is the first launch package for the personalized
aviation-worker utility/community network. It is not broad V1, and DFW is not
the whole product concept.

Current DFW framing:

- first launch base: DFW
- first available base board: DFW Base Board
- the data model should support many bases and boards from the start

The current MVP direction includes:

- Base Boards
- Layover Boards
- Verified Lounges / role-based spaces under or associated with bases
- user profiles
- following users
- following boards
- posting
- commenting/replies
- sharing
- saving posts
- liking/upvoting/useful-marking posts, with final brand terminology still
  undecided
- useful/trending posts inside base boards
- search across posts, comments, boards, base intel, and admin/AI-maintained
  information

The first implementation steps should build toward that model without trying to
ship every surface in the first code ticket.

## 3. Personalized App Experience

The MVP user experience is personalized:

- users can set a home base or follow boards
- users can follow other base boards
- users can follow layover boards
- the app home should eventually reflect followed boards, home base,
  saved/useful content, and relevant updates

## 4. Utility Layer / Board Intel

Base boards should support structured base intel/wiki sections.

Examples:

- basic airport/base information
- commuting
- parking
- reserve life
- food
- transit
- safety/weather/service alerts where appropriate

This content may be maintained by founders/admins and assisted by AI later.
AI-assisted updates must be server-side/admin-controlled and should not
auto-publish sensitive or operationally risky content without review.

## 5. Verified Lounges

Each base may have role-based or restricted lounges, such as Flight Attendants,
Pilots, New Hire Survival, Commuters, or similar spaces.

Verified Lounges are not generic global chat rooms. They are base-associated,
role-based, or otherwise restricted spaces with scoped access rules.

Board/community admins can be appointed to approve or deny access to these
spaces. Community-admin powers are scoped and separate from operator/platform
admin powers.

## 6. Posting, Engagement, And Search

Text-first posting and commenting are part of the MVP.

Engagement should be modeled generically until the product chooses canonical
jmpseat terminology for reactions, likes, upvotes, or "useful" marks.

TODO: define canonical jmpseat reaction terminology before final user-facing
copy and analytics naming are locked.

Search is part of the MVP vision. It should cover useful content across the app,
including posts/comments, boards, base info/wiki, and layover intel. Search
should support quick information retrieval by base/board and must respect
access controls and restricted-board visibility.

## 7. Current First Slice

The first slice is a launchable path toward the fuller MVP:

- DFW as the first launch base
- DFW Base Board as the first available base board
- data model support for many bases and boards
- airline-email gated app eligibility
- board follows/home-base preference foundation
- restricted lounge memberships and access requests
- board-scoped community-admin approval
- text-first posts/comments later in the sequence
- saves/reactions/useful/trending later in the sequence
- access-aware search later in the sequence
- reporting/moderation before real member-generated content exposure

This lane does not start with a generic social feed, broad room expansion, or
marketplace surface.

## 8. First Code Ticket

The first code ticket after this docs pass is:

- `FBMVP-T05: Base, Board, And Board-Type Data Model Design`

Rationale:

- no current board/community schema exists
- no current community routes or UI exist
- the repo already has auth, profile, beta-access, airline-email eligibility,
  and operator/admin foundations to build on
- the data model must support bases, boards, board types, follows,
  subscriptions, memberships, access requests, community-admin grants, and
  future posts/comments/saves/reactions/search without creating a dead-end
  schema
- T05 does not implement every MVP feature; it makes the foundation model-aware

## 9. Ordered Ticket Sequence

The current implementation sequence is:

1. `FBMVP-T05` base, board, and board-type data model
2. `FBMVP-T06` board follow/home-base preference foundation
3. `FBMVP-T07` restricted lounge membership/access request/community-admin model
4. `FBMVP-T08` DFW Base Board read-only dashboard shell
5. `FBMVP-T09` board/layover discovery and follow UI shell
6. `FBMVP-T10` text posts/comments foundation
7. `FBMVP-T11` saves/reactions/useful/trending foundation
8. `FBMVP-T12` search foundation with access-aware boundaries
9. `FBMVP-T13` reporting/moderation/admin controls
10. `FBMVP-T14` seeded DFW content, safety copy, and launch validation

## 10. Authorization Rules To Preserve

- Self-declared profile fields must not become authorization truth.
- Airline-email verification grants broad app eligibility only.
- Airline-email verification does not grant restricted-board membership.
- Restricted-board access must come from board membership plus
  community-admin approval.
- Community-admin grants must remain separate from operator grants.
- Moderation/reporting/admin controls are required before exposing real
  member-generated content.

## 11. Safety And Moderation Boundaries

Reporting/moderation/admin controls are required before broad real UGC exposure.
Aviation safety and privacy boundaries still apply:

- no exact public crew hotel exposure
- no passenger private information
- no airport security procedures
- no live operations-sensitive information
- no airline portal login or scraping

## 12. Explicitly Out Of Scope For The First Slice

- proof uploads
- manual proof/document uploads
- generic social feed
- generic global Crew Rooms expansion
- media/upload posting unless explicitly approved
- anonymous posting unless separately approved
- AI auto-publishing or AI final verification/moderation decisions
- deals/perks marketplace
- full mobile implementation
- schedule scraping
- airline portal login
- public live crew tracking
- exact public crew hotel exposure

Proof-upload hardening remains historically documented, but it is not active
current scope for this lane.

## 13. How To Read Older Docs

Read the following as broader/full-beta or later-lane references unless they
are explicitly narrowed by this doc or a newer controlling roadmap note:

- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/MVP_SCOPE.md`
- `docs/FIRST_RELEASE_MVP.md`

Those docs remain useful for later scope, policy gates, and broader product
direction. They should not pull the first 05B implementation slice wider than
the sequence above.
