# Airline Email Access Gate Decision

Brand note: jmpseat is the canonical product and app name. This decision note
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Confirmed approved airline employee email is the forward app-level trust gate
for jmpseat.

Private beta access is temporary rollout control, not the long-term trust gate.
It may remain in front of the private app while the product is being tested, but
it should not be treated as proof of airline-worker eligibility.

First-base launch should not require manual one-by-one beta grants for the
launched population. For that launch mode, confirmed approved airline employee
email should become the general app and general baseboard access gate.

Restricted role/base boards remain separate. They require community-admin
approval and board-level membership, not jmpseat proof upload, jmpseat role/base
proof review, or automatic access from airline email alone.

## 2. Definitions

Login account:

- The jmpseat account used to authenticate a user and maintain app sessions.

Login email:

- The email address used for account credentials, password reset, and normal
  login communication.
- It may be the same as the airline employee email, but the access model should
  support it being distinct.

Airline employee email:

- The work email address a user controls at an approved airline employee domain.
- It is the eligibility credential for general app and general baseboard access.

Approved airline email domain:

- A domain reviewed and configured by jmpseat operators as eligible for airline
  employee email verification.
- Approved-domain metadata may safely identify an airline when the mapping is
  reviewed and active.

Airline-email verified user:

- A user who has confirmed control of an approved airline employee email.
- This status is broad eligibility only.
- It does not prove role, base, seniority, endorsement, or current employment
  beyond email control at verification time.

Beta access:

- A temporary private-testing rollout gate.
- It controls who can enter unfinished private app surfaces during testing.
- It is not proof of airline-worker eligibility and is not the long-term
  product trust model.

Private user testing:

- The pre-launch testing mode where app access may still require active beta
  access in addition to login, profile/onboarding prerequisites, and confirmed
  approved airline employee email.

First-base launch:

- The first public or semi-public launch of a selected base population.
- The launched population should be able to join through confirmed approved
  airline employee email without manual one-by-one beta grants.

General baseboard:

- A general base or airport board, such as DFW, available to airline-email
  verified users in the applicable rollout mode.

Restricted board:

- A role/base/community board that requires board-level membership, such as DFW
  FA, DFW Pilot, DFW Ramp, or DFW Mechanics.

Community-admin approval:

- A board-level approval decision made by community admins for a restricted
  board.
- It is not official employer verification and does not create a global
  jmpseat role/base claim.

## 3. Private User Testing Mode

During private user testing, app access may require:

- authenticated login
- completed profile or private-app prerequisites if still applicable
- active beta access
- confirmed approved airline employee email

Beta access exists only to control test rollout while the app is incomplete.
It should not be described as proof of airline-worker eligibility, airline
employment, role, base, or trustworthiness.

Beta access should not be treated as the long-term product gate. It is a
temporary rollout-control state that can coexist with airline-email verification
until launch readiness explicitly changes the app gate.

## 4. First-Base Launch Mode

At first-base launch, beta access should no longer block the launched base
population.

Users in the launched population should be able to join by confirming an
approved airline employee email. Manual one-by-one beta grants should not be
required for normal first-base launch users.

Removing, bypassing, or segmenting the beta gate must happen through an explicit
launch-readiness implementation task. This decision doc does not itself remove
the beta gate in code.

The implementation must make the rollout mode explicit so unrelated tasks do
not accidentally preserve private-beta gating forever or remove it too early.

## 5. Long-Term Access Model

Long-term general app access requires:

- authenticated login
- confirmed approved airline employee email
- required onboarding/profile fields if still applicable

Long-term general app access should not require:

- beta access
- badge upload
- proof upload
- jmpseat role/base proof review

General baseboards are available to airline-email verified users in the
applicable launch mode.

## 6. Login Email Versus Airline Employee Email

Decision:

- The login email and airline employee email may be the same.
- The model should support them being distinct.
- Login credentials should be stable account credentials.
- Airline employee email is the eligibility credential.
- If the airline employee email changes, the new address should be reverified.
- A personal login email does not prove eligibility.
- An airline employee email should not have to remain the login email forever.

Rationale:

- Users may prefer a stable personal login email for account recovery.
- Airline employee emails may change through airline, merger, role, contractor,
  base, or employment transitions.
- Eligibility should be explicit and refreshable rather than hidden inside auth
  provider account identity.

## 7. Claims And Access State

Recommended forward access state:

- `airline_email_verified`
- `airline_email_domain`
- `airline`, if safely derived from an active approved-domain mapping
- verification timestamp
- verification expiry or refresh timestamp, if planned

Recommended status values:

- `pending`
- `verified`
- `expired`
- `revoked`
- `unsupported_domain`

This access state replaces proof-upload based app-level verification as the
forward direction.

It does not prove:

- role
- base
- seniority
- current employment beyond email control at verification time
- airline, employer, airport, or union endorsement

It also does not grant restricted role/base board access by itself.

## 8. Refresh And Expiry Policy

For MVP and first launch, airline-email verification may be long-lived, but the
model should support future expiry and refresh.

Recommended initial posture:

- store verification timestamp
- leave room for expiry/refresh timestamp
- plan for a refresh interval, likely 6 to 12 months
- do not implement expiry automation in this docs task

Loss of airline email access should eventually revoke or expire
`airline_email_verified` status. The exact detection, user grace period,
notification, and expiry automation should be handled in later implementation
tickets.

## 9. First-Base Launch Gate Transition

Stage 1: private user testing

- beta gate remains active
- airline-email gate is required for broad eligibility
- profile/private-app prerequisites may still apply

Stage 2: first-base launch

- beta gate is removed or bypassed for the launched base population
- airline-email gate is required
- normal launched-population users do not need manual beta grants

Stage 3: broader launch

- airline-email gate is required broadly
- beta gate is removed except perhaps for internal test flags, preview cohorts,
  or unreleased experiments

This transition needs a launch-readiness implementation ticket. The change must
be explicit and reviewed. Future Codex tasks must not silently remove beta
checks in unrelated work.

## 10. Restricted Board Access Remains Separate

Airline-email verified users can access general baseboards in the applicable
rollout mode.

Restricted boards require board-level membership. Community admins approve or
deny restricted board access according to future policy.

DFW FA access means "approved into the DFW FA board by community admins," not
"jmpseat globally verified this person is currently a DFW flight attendant."

jmpseat operator/admin access is separate from community admin access. A
platform operator is not automatically a community admin, and a community admin
is not automatically a platform operator.

## 11. Security And Privacy Boundaries

This model includes:

- no badge upload
- no proof upload
- no proof viewing
- no employer-system lookup
- no AI/OCR approval
- no official airline sponsorship or endorsement claim
- no role/base global claim issuance
- no automatic access to restricted role boards from airline email alone

The model should continue to avoid collecting unnecessary sensitive employment
documents, storage paths, proof contents, employee IDs, badge numbers, tokens,
sessions, or secrets.

## 12. Implementation Implications

Future implementation tasks likely need to:

- add or refactor airline-email verification as app-level access state
- update signup/onboarding around airline employee email
- decide whether login email and airline email are separate fields in the data
  model
- update the private-app gate to support private-testing mode versus launch
  mode
- add first-base launch gate configuration
- hide or freeze proof-upload UI
- refactor `/app/verification` copy
- add general baseboard access gates
- add board membership and community-admin approval models later

These tasks should be explicit and reviewed. This decision does not authorize
silent beta-gate removal, proof-system deletion, or board implementation.

## 13. Non-Goals

This task does not include:

- code changes
- beta gate removal
- board implementation
- proof-system deletion
- database migrations
- proof upload
- proof cleanup expansion
- production deployment

## 14. Open Questions

- Should first-base launch be airport-wide or airline-specific?
- Does one airline domain unlock every general baseboard or only relevant
  airline/base contexts?
- What if a worker is based at DFW but has an airline email from another
  station or system?
- Should users choose their base during onboarding?
- Should base choice be self-declared for general boards?
- Should airline email verification expire?
- How should lost email access be handled?
- Should community admins see airline domain, full email, or only eligibility
  status?
- How are first community admins selected?
- Can community admins request off-app proof?
- What appeals process exists for restricted board denial?
- What moderation tools are required before first-base launch?

## 15. Source-Of-Truth Statement

This decision defines the forward app-level access model.

It supersedes proof-upload verification as the forward app-level access model.

Existing proof-upload and proof-cleanup systems remain historical/runtime-applied
infrastructure until explicitly deprecated or removed.

Future implementation must preserve private beta until a launch-readiness task
explicitly changes it.
