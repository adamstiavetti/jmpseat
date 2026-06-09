# Home Base And Board Follow Decision

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Home Base is optional personalization state during the initial DFW-only
rollout. It is not required app access state and it is not authorization truth.

The initial rollout is DFW-only.

Setting Home Base should automatically follow that base's main Base Board.
Users may follow many boards over time, including Base Boards, Layover Boards,
and Verified Lounges when access or membership permits.

Following a board does not grant restricted access. Restricted Verified Lounges
require separate board membership or access approval.

Because DFW is the only live base at first, onboarding should not present a
fake one-option "choose your Home Base" selector. The initial rollout should
use a DFW-start choice instead: start with DFW or skip for now.

## 2. Home Base Meaning

Home Base answers: "Which base should jmpseat use as this user's primary
starting point?"

Home Base can help shape:

- the default app home experience
- the first Base Board shown after onboarding
- base-specific prompts, search defaults, and useful/trending content
- later onboarding or personalization completion prompts

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

Airline may be selected or edited in profile, but self-declared airline text
must not grant restricted access. Future airline-specific boards or lounges
should rely on verified airline or approved-domain logic, not self-declared
airline text.

## 3. Optional And Not Authoritative

For the initial DFW-only rollout, Home Base is optional personalization state.
The app should allow a valid "no Home Base yet" state because forcing non-DFW
users to choose DFW could imply false base assignment.

The optional preference must remain separate from app and board authorization:

- App entry still depends on the active launch-mode gates, airline-email
  eligibility, beta requirements where applicable, account state, and profile
  completion.
- General Base Board visibility still depends on the applicable app/base launch
  gates.
- Restricted Verified Lounge access still depends on board membership or access
  approval.
- Operator, admin, and community-admin permissions remain separate grants.
- Work-email verification remains the aviation-worker eligibility gate.

Home Base is not proof that the user works at that base or should be allowed
into any restricted board under that base.

Missing Home Base must not block app access after the user satisfies the
actual app-entry gates.

## 4. Initial DFW-Only Rollout

DFW is the first live Base Board in the rollout.

That means:

- DFW is the first active Home Base destination
- DFW is not proof that the user works at DFW
- the app should not pretend multi-base choice exists before it actually does

After work-email verification in the initial DFW-only rollout, the user should
see a DFW-start step that clearly says jmpseat is opening with DFW first.

That step should:

- let the user start with DFW
- let the user skip for now
- if the user starts with DFW, set Home Base to DFW
- if the user starts with DFW, auto-follow the DFW Base Board
- if the user skips, create no Home Base preference
- if the user skips, require no automatic board follow
- route the user into the app either way

When the user skips, the dashboard should later show an exploratory/default
experience until the user sets a Home Base or follows boards.

Canonical onboarding order for the initial DFW-only rollout:

1. Create account
2. Confirm account
3. Complete basic profile
4. Verify work email
5. Choose Start with DFW or Skip for now
6. If starting with DFW, set Home Base to DFW and auto-follow DFW Base Board
7. If skipping, keep no Home Base preference and no required auto-follow
8. Enter the jmpseat Home dashboard or exploratory/default app experience

## 5. Future Multi-Base Rollout

Once multiple active bases exist, users should be able to select or switch Home
Base from active bases.

Future multi-base behavior should be:

- users can select Home Base from active bases during onboarding or skip if the
  product intentionally keeps Home Base optional
- users can switch Home Base later
- switching Home Base updates personalization
- switching Home Base auto-follows the new base's main Base Board
- the previous base-board follow is kept unless the user manually unfollows it

Canonical onboarding order for a future multi-base rollout:

1. Create account
2. Confirm account
3. Complete basic profile
4. Verify work email
5. Select Home Base from active bases, or skip if Home Base remains optional
6. Enter the jmpseat Home dashboard or exploratory/default app experience

## 6. Board Follow Meaning

A board follow is a personalization signal. It means the user wants a board to
influence their app home, discovery, notifications if later approved, search
ranking, saved context, or other personalized surfaces.

Users may follow:

- Base Boards
- Layover Boards
- Verified Lounges, only when the user has the required access or membership

Following a board must not bypass visibility, posting, membership, moderation,
or launch gates.

## 7. Home Base Auto-Follow Behavior

When a user sets Home Base, jmpseat should automatically ensure that the home
base's main Base Board is followed.

When a user changes Home Base:

- update the Home Base preference
- ensure the new Home Base's main Base Board is followed
- keep the old Home Base board follow by default

The old follow should remain unless the user manually unfollows it. This keeps
the behavior predictable for commuters, transfers, multi-base workers, frequent
layover users, and users who still care about a previous base.

## 8. Restricted Board Boundary

Verified Lounges are restricted board-like spaces under or associated with a
base. They are not opened by Home Base alone and they are not opened by a board
follow alone.

Restricted lounge access requires a separate access model, such as approved
board membership or community-admin approval. That model belongs to a later
ticket and must stay separate from Home Base and follows.

## 9. Personalized Home Direction

The home dashboard should eventually use:

- Home Base
- followed boards
- saved/useful content
- followed users
- Verified Lounge memberships
- access-aware search and results

These signals should shape what the user sees first without exposing restricted
content the user is not allowed to access. If the user has no Home Base yet,
the dashboard should use an exploratory/default experience rather than blocking
app access.

## 10. Reaction Terminology Boundary

User-facing reaction, upvote, like, and useful-mark language is undecided.

Future schema and implementation should avoid locking product language too
early. Prefer neutral internal naming such as:

- `reaction`
- `reaction_type`
- `score`
- `useful_count`

Final user-facing copy can choose jmpseat terminology later.

## 11. T06 Implementation Implication

`FBMVP-T06` introduces the data foundation for:

- a Home Base preference model
- a board-follow model
- optional initial DFW-start behavior for the single-base rollout
- future switchable Home Base support across active bases
- auto-follow behavior when Home Base is set
- tests proving Home Base and follows are not authorization grants
- conservative handling for restricted boards

Implementation notes:

- `user_home_base_preferences` stores one current Home Base per user.
- `board_follows` stores followed boards as personalization/subscription state.
- `set_user_home_base(p_base_code text)` sets the authenticated user's Home
  Base and auto-follows the matching active Base Board.
- no Home Base preference is created when the user skips the initial DFW-start
  choice.
- no Home Base is a valid initial DFW-only rollout state and must not block app
  access.
- changing Home Base keeps old follows unless the user manually unfollows them
  in a later UI/helper.
- direct client writes are conservative; manual follow/unfollow and restricted
  lounge follow behavior remain later work.

T06 does not implement posts, comments, lounge access requests, memberships,
community-admin tools, saves, reactions, search, reports, moderation, dashboard
UI, onboarding UI, or broad member-generated content exposure.

Runtime note: the intended Supabase runtime already has the base T06
schema/functions recorded as remote migration
`20260609194858 create_home_base_board_follows`, while the local repo file
remains `20260609130534_create_home_base_board_follows.sql`. Do not re-apply
or retroactively mark the local T06 migration. Follow-up runtime hardening
should use targeted migrations, including the RPC execute-grant hardening that
removes explicit `anon` EXECUTE from the T06 functions.

The current T06 migration is the first SQL shape for these decisions. Later
tickets should extend it narrowly rather than treating follows, Home Base, or
self-declared profile fields as authorization grants.

## 12. Product Boundaries

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
