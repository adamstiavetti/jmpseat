# Home Base And Board Follow Decision

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Home Base is required for the current MVP onboarding/profile-completion path.
It is a personalization preference, not authorization truth.

Setting Home Base should automatically follow that base's main Base Board.
Users may follow many boards over time, including Base Boards, Layover Boards,
and Verified Lounges when access or membership permits.

Following a board does not grant restricted access. Restricted Verified Lounges
require separate board membership or access approval.

## 2. Home Base Meaning

Home Base answers: "Which base should jmpseat use as this user's primary
starting point?"

Home Base can help shape:

- the default app home experience
- the first Base Board shown after onboarding
- base-specific prompts, search defaults, and useful/trending content
- later onboarding completion checks

Home Base does not verify:

- employment
- airline affiliation
- role
- base assignment
- restricted-board eligibility
- Verified Lounge membership

Self-declared profile fields such as `claimed_base`, `claimed_airline`, and
`claimed_role` must not become authorization truth. They may support user
experience, routing, and later community access review context, but they do not
grant protected access by themselves.

## 3. Required But Not Authoritative

For the current MVP path, Home Base should be treated as required profile or
onboarding state because the product needs a useful default base context.

That requirement must remain separate from app and board authorization:

- App entry still depends on the active launch-mode gates, airline-email
  eligibility, beta requirements where applicable, account state, and profile
  completion.
- General Base Board visibility still depends on the applicable app/base launch
  gates.
- Restricted Verified Lounge access still depends on board membership or access
  approval.
- Operator, admin, and community-admin permissions remain separate grants.

Home Base is not proof that the user works at that base or should be allowed
into any restricted board under that base.

## 4. Board Follow Meaning

A board follow is a personalization signal. It means the user wants a board to
influence their app home, discovery, notifications if later approved, search
ranking, saved context, or other personalized surfaces.

Users may follow:

- Base Boards
- Layover Boards
- Verified Lounges, only when the user has the required access or membership

Following a board must not bypass visibility, posting, membership, moderation,
or launch gates.

## 5. Home Base Auto-Follow Behavior

When a user sets Home Base, jmpseat should automatically ensure that the home
base's main Base Board is followed.

When a user changes Home Base:

- update the Home Base preference
- ensure the new Home Base's main Base Board is followed
- keep the old Home Base board follow by default

The old follow should remain unless the user manually unfollows it. This keeps
the behavior predictable for commuters, transfers, multi-base workers, frequent
layover users, and users who still care about a previous base.

## 6. Restricted Board Boundary

Verified Lounges are restricted board-like spaces under or associated with a
base. They are not opened by Home Base alone and they are not opened by a board
follow alone.

Restricted lounge access requires a separate access model, such as approved
board membership or community-admin approval. That model belongs to a later
ticket and must stay separate from Home Base and follows.

## 7. Personalized Home Direction

The home dashboard should eventually use:

- Home Base
- followed boards
- saved/useful content
- followed users
- Verified Lounge memberships
- access-aware search and results

These signals should shape what the user sees first without exposing restricted
content the user is not allowed to access.

## 8. Reaction Terminology Boundary

User-facing reaction, upvote, like, and useful-mark language is undecided.

Future schema and implementation should avoid locking product language too
early. Prefer neutral internal naming such as:

- `reaction`
- `reaction_type`
- `score`
- `useful_count`

Final user-facing copy can choose jmpseat terminology later.

## 9. T06 Implementation Implication

`FBMVP-T06` should likely introduce:

- a Home Base preference model
- a board-follow model
- auto-follow behavior when Home Base is set
- tests proving Home Base and follows are not authorization grants
- conservative handling for restricted boards

T06 should not implement posts, comments, lounge access requests, memberships,
community-admin tools, saves, reactions, search, reports, moderation, or broad
member-generated content exposure unless a newer controlling ticket explicitly
changes scope.

This document does not prescribe the exact SQL shape. The implementation should
inspect the current T05 schema and choose the smallest model that preserves the
decisions above.

## 10. Product Boundaries

This decision does not introduce:

- proof uploads
- role/base/employer verification through profile fields
- airline portal login
- schedule scraping
- public live crew tracking
- exact public crew hotel exposure
- passenger private information
- airport security procedures
- live operations-sensitive information
- AI final verification, moderation, access, or ban decisions
- broad real UGC exposure before moderation/reporting/admin controls
