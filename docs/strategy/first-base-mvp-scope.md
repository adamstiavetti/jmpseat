# First-Base MVP Scope

Brand note: jmpseat is the canonical product and app name. This decision note
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

The First-Base MVP is the first complete launch package for one selected base.
It is not only a baseboard feature.

Baseboards are a core feature area, but the MVP also includes airline-email
access, one general baseboard, a small number of restricted boards, board access
requests, community-admin approval, basic posting and Q&A, baseline
moderation/reporting expectations, trust/disclaimer copy, and launch-readiness
boundaries.

The MVP should launch around one selected base first so jmpseat can validate the
access model, board structure, community-admin workflow, posting behavior, and
safety posture before expanding to many bases or broader social features.

Proof upload is not part of the First-Base MVP. Existing proof systems remain
historical/runtime-applied infrastructure until separately deprecated or
removed through reviewed plans.

## 2. Definitions

First-Base MVP:

- The smallest complete launch package for one selected base, including access,
  boards, content primitives, community-admin approval, moderation expectations,
  and launch-readiness copy.

Base:

- A selected airport, station, or operating location used as the organizing
  unit for board discovery and local crew information.

Launched base:

- The base included in the first public or semi-public launch segment after the
  launch gate transition is explicitly implemented.

General baseboard:

- A broad base or airport board available to airline-email verified users in the
  launched population.

Restricted board:

- A board that requires board-level membership and community-admin approval
  before content is visible.

Board category:

- A lightweight grouping or label inside a board, such as questions, logistics,
  commuting, food, parking, or resources.

Post/thread:

- The first item in a discussion or Q&A flow.

Reply/comment:

- A response to a post or thread.

Resource/info item:

- A durable information item, pinned post, or simple resource entry that helps
  users find recurring base information.

Board membership:

- A board-scoped authorization record that gives a user access to one board.

Board access request:

- A user request to join a restricted board.

Community admin:

- A user explicitly granted board/community management authority for a specific
  board or community.

Board moderator:

- A future board-scoped moderation role. This role may overlap with community
  admin only if a later policy explicitly combines them.

Board member:

- A user with approved membership for a specific restricted board.

jmpseat operator:

- A platform operator who manages platform-level settings, safety controls,
  approved domains, operator grants, and operational health.

Airline-email verified user:

- A user who has confirmed control of an approved airline employee email. This
  proves broad eligibility only, not role, base, seniority, current employment
  beyond email control at verification time, or employer endorsement.

## 3. First-Base Launch Recommendation

Launch with one base first, not every base.

DFW is the selected first live base for the current rollout and planning lane.
That does not make DFW the whole jmpseat product concept; it is the first live
base used to validate the model before broader multi-base expansion.

The first-base launch should validate:

- airline-email access gate behavior
- private-beta-to-launch gate transition
- general baseboard participation
- restricted-board request flow
- community-admin approval
- posting and Q&A usefulness
- basic moderation and reporting readiness
- trust and disclaimer language

## 4. MVP Pillars

The First-Base MVP has these pillars:

- Airline-email access gate.
- General baseboard.
- Restricted boards.
- Board access requests.
- Community-admin approval tools.
- Posting and Q&A.
- Basic moderation and reporting.
- Trust and disclaimer copy.
- Launch-readiness gate transition.

These pillars should be implemented as a minimal coherent product loop. A
general baseboard alone is not sufficient if access, safety, or board membership
boundaries are unclear.

## 5. MVP Board Structure

Recommended launch structure:

- One general baseboard: DFW General in the initial rollout.
- A limited set of restricted boards, such as DFW FA and DFW Pilot.
- Optionally one more operational group only if product validation shows a
  clear need and moderation/admin capacity exists.

The general baseboard should be open to airline-email verified users in the
launched population. It should support general base information, questions,
tips, and discussion.

Restricted boards should be board-membership gated. Airline email alone should
not grant restricted-board access.

Do not launch too many restricted boards at once. Too many empty boards create
moderation overhead, weak community energy, and unclear community-admin
responsibility.

## 6. General Baseboard Scope

Included:

- base overview and general information
- question posts
- answer/reply threads
- base logistics tips
- commuting, hotel, parking, food, and resources discussion
- pinned resources if simple
- basic reporting and moderation expectations

Excluded:

- role-verified claims
- official airline, airport, union, or employer content unless explicitly
  obtained and documented
- payroll, HR, legal, or policy advice presented as official guidance
- private restricted-role discussion
- proof upload
- sensitive personal data collection

General baseboard access means the user passed the airline-email access gate
for the applicable launch mode. It does not mean jmpseat verified the user's
base, role, or employer relationship beyond email control.

## 7. Restricted Board Scope

Included:

- board access request
- community-admin approval or denial
- member-only posts/threads
- member-only replies
- board-level moderation expectations
- member-list visibility only if explicitly designed later

Excluded:

- automatic access from airline email alone
- jmpseat global role/base verification
- proof upload or badge upload
- community-admin access to proof files
- official airline endorsement
- automatic cross-board access

Restricted board membership means community-admin approved membership in that
board. It should not be described as official employment, role, base, airline,
airport, union, or employer verification.

## 8. Content Model MVP

Smallest useful content primitives:

- board
- thread/post
- reply/comment
- author display identity
- timestamps
- optional pinned flag
- optional locked flag
- optional report flag
- deleted/hidden state if moderation requires it

Recommended MVP boundaries:

- Start with text-only posts and replies.
- Do not support images or files at MVP.
- Do not support direct messages at MVP.
- Do not support rich media at MVP.
- Do not make an anonymous posting decision until a separate anonymity policy is
  approved.
- Do not add AI content tools at MVP.

The content model should serve practical Q&A and resource discovery before it
serves broad social-feed mechanics.

## 9. Access And Visibility

General baseboard:

- Visible to airline-email verified users for the launched population.

Restricted boards:

- Discoverable/requestable to eligible users if the product chooses that
  visibility model.
- Content remains hidden until membership is approved.
- Unauthorized users see request-access state, not content.
- Denied or revoked users do not see content.

Community admins:

- Can see access requests for boards they manage.
- Should see only minimum necessary user/request information unless a later
  privacy decision expands visibility.

jmpseat operators:

- Can see platform-level safety and audit data according to explicit operator
  permissions.
- Are not automatically community admins.

Beta access:

- Applies only as temporary private-testing rollout control.
- Is not the long-term launch gate.
- Must be removed, bypassed, or segmented for the launched population only
  through an explicit launch-readiness implementation task.

## 10. Community Admin Requirements For MVP

At least one community admin should exist before a restricted board opens.

The first community admin should be explicitly appointed by a jmpseat operator.
Appointment should be logged and revocable.

Community admins need basic tools:

- view access requests
- approve requests
- deny requests
- revoke access
- optionally moderate posts if moderation policy and tooling include that scope

Community-admin actions should be audited.

Community admins should not be able to manage platform approved domains,
operator grants, proof cleanup, platform audit inspection, or other
operator-only systems.

## 11. Moderation And Safety MVP

Minimum moderation and safety needs before real launch:

- report post/comment
- hide or remove post/comment if community-admin or moderator tooling includes
  moderation authority
- operator escalation path
- basic abuse reporting
- audit trail for admin/moderator actions
- terms and disclaimer copy

If moderation tooling is too much for the first content MVP, launch must remain
limited until moderation exists. Real member-generated content should not be
opened broadly without reporting, escalation, and accountable moderation paths.

## 12. Identity And Profile Surface

Users should have a display name or handle.

Airline-email verification should not expose a full email address by default.
Board posts should not expose airline employee email.

Base and role can be self-declared for general context, but should not be
displayed as verified unless board membership or a future reviewed policy
supports that label.

Restricted board membership should not be phrased as official role
verification. It should be presented as community-managed board access.

## 13. Data Model Implications

Likely future entities:

- bases
- boards
- board_memberships
- board_access_requests
- board_admins or board_roles
- posts/threads
- replies/comments
- moderation_reports
- moderation_actions
- pinned_resources, optional
- board_audit_events or reuse `security_events`, decision later

This task does not create migrations. Each future implementation ticket should
define schema, RLS, server-side authorization, audit behavior, pagination, and
privacy boundaries explicitly.

## 14. Route Implications

Likely future routes:

- `/app/base` or `/app/base/[baseCode]`
- `/app/base/[baseCode]/boards/[boardSlug]`
- `/app/base/[baseCode]/boards/[boardSlug]/request-access`
- `/app/admin/community` or another future admin route for community-admin
  tooling if separated from platform admin

Current placeholder route expectations should be preserved until implementation
is explicitly planned. This document does not add routes or app code.

## 15. Launch Readiness Criteria

Before first-base launch:

- airline-email access gate is implemented
- beta gate transition/bypass plan is implemented for the launched base
  population
- at least one general baseboard exists
- restricted board request flow exists if restricted boards are launched
- community admin appointment flow exists
- community admin disclaimer/policy exists
- basic moderation/reporting exists
- proof upload user flows are hidden or frozen
- privacy/trust copy is reviewed
- no official airline sponsorship implication appears in UI or docs

First-base launch should be treated as a launch-readiness milestone, not a
single board page.

## 16. Non-Goals

This task does not include:

- code changes
- database migrations
- full forum implementation
- direct messages
- images or file uploads
- proof upload
- badge upload
- employer-system lookup
- AI/OCR approval
- official airline verification
- global role/base claim issuance
- monetization or payment implementation
- mobile app implementation

## 17. Open Questions

- Which base launches first?
- Is DFW formally selected or only the planning example?
- Are general baseboards airport-wide, airline-specific, or both?
- Which restricted boards are MVP?
- Are users allowed to participate in multiple baseboards?
- Can users self-select base?
- Do general boards require base selection, or can any airline-email verified
  user view all bases?
- How visible are restricted boards before approval?
- Should restricted board requests include a note/message?
- How anonymous or pseudonymous are users?
- What moderation tools are required before launch?
- Who appoints first community admins?
- What is the appeals path for denied/revoked board access?
- What disclaimers are needed on every restricted board?

## 18. Source-Of-Truth Statement

This document defines the First-Base MVP scope.

It builds on the product pivot, airline-email access gate, board/community
access model, and proof-system freeze plan:

- `strategy/product-pivot-email-verification-community-boards.md`
- `strategy/airline-email-access-gate-decision.md`
- `strategy/board-community-access-model-decision.md`
- `strategy/proof-system-freeze-deprecation-plan.md`

Future implementation should not build beyond this MVP without an explicit
scope update.

Future implementation must not reintroduce proof upload as a baseboard or
restricted-board access mechanism.
