# Product Pivot: Airline Email Verification And Community-Managed Boards

Brand note: jmpseat is the canonical product and app name. This decision note
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

jmpseat is pivoting away from proof-upload verification as the forward product
direction.

Forward app-level access should be based on confirmed control of an approved
airline employee email address. A user signs up with an airline employee email,
confirms that email, creates normal login/password credentials, and can then
access the general app experience.

Restricted role/base boards should be controlled by community-admin approval,
not by jmpseat proof review. jmpseat should provide the platform mechanics,
access-control tooling, logging, moderation boundaries, and safety policy. It
should not present restricted board access as employer-backed identity
verification.

## 2. Product Model

Airline-email verified user:

- A user who has confirmed control of an approved airline employee email
  address.
- This status grants broad eligibility for the app and general baseboards.
- It does not prove role, base, seniority, current employment status beyond
  email control, or employer endorsement.

General baseboard:

- A broadly accessible base or airport board, such as a DFW baseboard.
- Available to airline-email verified users.
- Intended for base info, questions, answers, general discussion, and
  non-sensitive base-level content.
- Not a role-verified or employer-verified space.

Restricted/verified board:

- A board with additional access requirements, such as DFW FA, DFW Pilot, DFW
  Ramp, or DFW Mechanics.
- Membership is requested by users and approved, denied, revoked, or allowed to
  expire by community admins according to future policy.
- Access means the user was approved into that board by the relevant
  community-admin process, not that jmpseat globally verified the user's role
  or base.

Community admin:

- A user granted board/community management authority for a specific board or
  community.
- Community admins are not sponsored by jmpseat.
- Community admins are not airline, airport, union, or employer
  representatives by virtue of this role.
- Their approval decisions are community access decisions, not official
  employment or role verification.

jmpseat operator:

- A platform operator who manages platform-level tools, safety controls,
  approved email-domain configuration, and operational health.
- Operators are separate from community admins unless explicitly granted both
  responsibilities through a reviewed model.

Board membership:

- A board-scoped authorization record that allows a user to access a specific
  board.
- It should not imply a global identity claim unless a later explicit design
  says so.

Board access request:

- A user request to join a restricted board.
- Possible statuses should include `requested`, `approved`, `denied`,
  `revoked`, and `expired` if later needed.

## 3. New Authentication And Access Model

The forward access model:

- User signs up with an approved airline employee email.
- User confirms the airline employee email.
- User creates normal login/password credentials.
- Access then follows the current rollout mode:
  - during private user testing, airline email confirmation coexists with the
    temporary beta-access gate
  - during first-base launch, confirmed approved airline employee email should
    become the general app and general baseboard access gate for the launched
    population
- Airline email verification proves broad eligibility only.
- App-level access should not depend on badge upload or document upload.

The airline employee email does not prove:

- role
- base
- seniority
- current employment status beyond control of the email address
- employer sponsorship
- airline endorsement
- union endorsement

Login email and airline employee email may be the same, but the model should
support them being distinct. Login email is the stable account credential, and
airline employee email is the eligibility credential. If the airline employee
email changes, the new address should be reverified. See
`strategy/airline-email-access-gate-decision.md` for the source-of-truth access
gate decision.

### Private Testing Versus First-Base Launch Access

During private user testing, beta access remains a temporary rollout-control
gate and may coexist with confirmed approved airline employee email. This is not
the long-term product trust model.

During private user testing, access may require:

- authenticated login
- completed required profile or private-app prerequisites if still applicable
- active beta access
- confirmed approved airline employee email

For first-base launch, the launched population should not require manual beta
grants one by one. Confirmed approved airline employee email should become the
general app and general baseboard access gate for that launched population.

During first-base launch, access for the launched population should require:

- authenticated login
- confirmed approved airline employee email

Any removal, bypass, or segment-specific replacement of the beta gate must be
handled by a later explicit launch-readiness implementation task. This pivot
decision does not itself remove the current beta gate from the private-testing
environment.

## 4. General Baseboard Access

General baseboards, such as DFW, should be available to airline-email verified
users in the applicable rollout mode.

General board content can include:

- base information
- questions and answers
- general discussion
- commuting and parking guidance
- base culture and non-sensitive operational life
- broad airport/base-level tips

General baseboards are not role-verified spaces. A user's ability to post in a
general DFW board should mean they passed the airline-email access gate, not
that jmpseat verified they are a DFW-based flight attendant, pilot, ramp worker,
mechanic, gate agent, or any other role.

## 5. Restricted Board Access

Restricted boards can include:

- DFW FA
- DFW Pilot
- DFW Ramp
- DFW Mechanics
- other future role, base, airline, station, or community-specific boards

Access model:

- Users request access to the restricted board.
- Community admins approve or deny the request.
- Community admins can revoke access according to future policy.
- jmpseat provides the access-control mechanics, logs, and moderation
  boundaries.
- jmpseat does not claim these community-admin approvals are official employer
  verification.

Restricted board membership is a board-level access decision. DFW FA access
means "approved into the DFW FA board by that board/community admin," not
"jmpseat verified this person is currently a DFW flight attendant."

## 6. Claims And Access Model Shift

The old platform-verification model centered on:

- `airline_worker`
- airline claims
- role claims
- base claims
- proof evidence
- reviewer approval

The forward model should center on:

- `airline_email_verified` for general app access
- `board_membership` for board-specific access
- `community_admin` for specific board/community management

Recommended membership/request statuses:

- `requested`
- `approved`
- `denied`
- `revoked`
- `expired`, if later needed

Role/base identity should not be globally asserted by jmpseat unless a later
explicit design reintroduces it. Board access should be interpreted narrowly as
community-managed membership in that board.

## 7. Existing Work That Remains Useful

The completed foundation still provides useful platform infrastructure:

- auth/profile/private app shell
- approved email-domain management
- work-email verification and domain logic
- operator grants
- admin shell
- approved-domain management
- audit inspection
- security event infrastructure
- route gating patterns
- RLS/RPC migration discipline
- runtime proof discipline

Reviewer-scope management may be repurposed into community-admin management or
deprecated after a reviewed access-model decision. It should not be expanded for
proof-upload review while this pivot is being planned.

## 8. Work To Freeze Or Deprecate

Freeze further expansion of:

- redacted proof upload
- private proof storage bucket usage for verification
- controlled proof viewing
- proof retention/deletion expansion
- proof cleanup monitoring expansion
- manual proof cleanup controls expansion
- human review of uploaded proof
- role/base platform claim issuance from proof
- user-facing badge/document upload paths

Do not delete existing proof systems yet. Treat them as legacy/dormant until a
reviewed removal, archival, or migration strategy exists.

Existing runtime-applied migrations remain part of the database history and
cannot simply be removed. Historical proof-related runtime docs should remain in
the repository as records of what was built and validated.

## 9. Immediate Engineering Implications

Likely future changes:

- signup/onboarding should center on airline employee email
- app gate should check confirmed approved airline email, not proof review
- `/app/verification` likely needs to be reframed or replaced
- proof upload UI should be hidden, disabled, or removed from user flows only
  after a reviewed plan
- claim naming may need to shift from `airline_worker` to
  `airline_email_verified`
- a baseboard data model is needed
- a board membership/access request data model is needed
- a community admin role model is needed
- board-level moderation and audit are needed
- operator/admin docs should distinguish platform operators from community
  admins

Current implementation work should pause before E05-T08 handoff. The handoff
should not proceed until this pivot is translated into a reviewed architecture
plan for airline-email access, board membership, and proof-system freeze or
deprecation.

## 10. Legal And Trust Language

Required language for future product/docs/UI work:

- jmpseat is not sponsored by airlines, airports, unions, or employers unless
  explicitly obtained and documented.
- Community admins are not sponsored by jmpseat.
- Community admins are not airline, airport, union, or employer
  representatives by virtue of board-admin status.
- Restricted board access is community-managed.
- Airline email confirmation is not employer endorsement.
- Board membership is not official employment verification.
- jmpseat should avoid implying official role/base verification unless a later
  explicit design reintroduces it.

## 11. Recommended Next Epoch Or Phase

Recommended next phase:

- Pivot Epoch: Community Access Architecture

Alternative naming:

- Epoch 06: Community Board Access Foundation

Do not implement this phase yet. The next work should be docs-only pivot
planning that resolves the access model before app, database, or migration
changes.

Recommended next docs:

- board/community access model decision
- airline-email verification access-gate decision
- proof-system freeze/deprecation plan
- baseboard MVP scope
- community-admin responsibilities and disclaimer policy

## 12. Non-Goals

This pivot decision does not include:

- badge upload
- proof upload
- employer-system lookup
- AI/OCR approval
- official airline sponsorship claims
- role/base global claim issuance
- deleting existing proof tables, storage, migrations, or runtime docs
- new community board implementation
- new migrations
- app-code changes

## 13. Open Questions

- Should users be allowed to later change their airline email?
- How often should airline email verification expire or refresh?
- What happens if airline email access is lost?
- Who appoints the first community admin for a restricted board?
- Can community admins see applicant email/domain?
- What evidence, if any, can community admins request outside the app?
- How do appeals work?
- How do we prevent community-admin abuse?
- What boards exist at MVP: base-wide only, role-specific, airline-specific, or
  all?
- Should DFW general board be per-airline or airport-wide?
- How much anonymity or pseudonymity is allowed inside boards?

## 14. Recommended Source-Of-Truth Statement

This decision supersedes proof-upload verification as the forward product
direction.

Existing proof features remain historical/runtime-applied infrastructure until
they are explicitly deprecated, hidden, removed, or migrated through reviewed
plans.

Future Codex tasks must not expand proof-upload verification unless explicitly
instructed.
