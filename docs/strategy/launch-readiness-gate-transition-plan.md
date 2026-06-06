# Launch-Readiness Gate Transition Plan

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## 1. Decision Summary

jmpseat currently uses private-testing and beta-access gating for the private app. That gate remains a temporary rollout control while the product is unfinished and the first launch population is not yet formally enabled.

First-base launch must transition away from one-by-one beta grants for the launched population. A normal first-base user should not need a manual beta grant if they otherwise satisfy the launch gate.

For the launched population, confirmed control of an approved airline employee email is the required app-level eligibility gate. The launch transition must not bypass airline-email verification, unsupported-domain checks, or any future expiry/revocation policy.

This plan does not remove beta in code. It defines the later launch-readiness implementation scope and the safety boundaries for changing the app gate.

## 2. Definitions

- Private user testing mode: The current controlled testing state where private app access remains limited to authenticated users who satisfy profile/private-app prerequisites and active beta access.
- Beta access: A temporary rollout-control state used to admit selected testers while the product is unfinished. It is not the long-term worker-eligibility credential.
- First-base launch mode: The first launched base/community mode where the selected base population can enter without one-by-one beta grants after meeting the launch eligibility gate.
- Launched base population: The users included in a formally selected first-base launch segment, such as an airport-wide or airline-specific population.
- Airline-email verified user: A user with a confirmed, current, approved airline employee email verification state.
- Approved airline employee email: An airline employee email address at a configured approved domain that the user has confirmed control of.
- Login account: The stable authentication account and credentials. The login email may be the same as the airline employee email, but the model must support them being distinct.
- Profile/private-app prerequisites: Required onboarding and account-state requirements before private app entry, such as profile completion, account not suspended, and accepted terms.
- General app access: Access to the main private app experience for eligible users, excluding restricted boards or operator/admin sections.
- General baseboard access: Access to the non-restricted baseboard for the launched base population after the app-level eligibility gate passes.
- Restricted board access: Access to board-specific role/base/restricted content that requires board membership or community-admin approval beyond general app eligibility.
- Launch-readiness switch: An explicit, observable implementation mechanism that selects the current access mode, such as `private_testing`, `first_base_launch`, or `broader_launch`.

## 3. Current Gate Model

The current private-app gate is a legacy/private-testing gate from the auth, profile, beta-access, and verification foundation work. As documented in the existing Epoch 03 and Epoch 04 materials, the current model includes:

- authenticated login
- profile/private-app prerequisites where applicable
- active beta access
- account restriction checks
- verification and access checks from the previous architecture

Some current copy and docs still use proof-era worker-verification language because proof-upload verification was implemented and runtime-proven before the pivot. That language is historical unless a later reviewed plan explicitly reuses it.

Any launch-readiness implementation must inspect the actual current gate code before changing behavior. This document is not a substitute for code-level review of auth callback routing, `/app` gate resolution, `/app/access-hold`, `/app/access-restricted`, profile completion, beta access, verification state, admin/operator routes, and tests.

## 4. Forward Gate Model

Private user testing should require:

- authenticated login
- required profile/onboarding fields
- active beta access
- confirmed approved airline employee email

First-base launch should require:

- authenticated login
- required profile/onboarding fields
- confirmed approved airline employee email
- no one-by-one manual beta grants for the launched population

Long-term broader launch should require:

- authenticated login
- required profile/onboarding fields
- confirmed approved airline employee email
- beta removed from the general app gate except for internal test flags or unreleased features

The forward gate grants only general app and general baseboard access. It must not grant restricted board membership, operator access, reviewer access, or community-admin authority.

## 5. First-Base Launch Transition

The beta-to-launch change should happen through an explicit launch-readiness implementation task. Beta checks should not be removed casually, opportunistically, or as part of unrelated board, profile, verification, or cleanup work.

The implementation should support a controlled transition from beta-required mode to launched-base mode. Recommended launch mode names are:

- `private_testing`
- `first_base_launch`
- `broader_launch`

The launch mode should be explicit, observable, and documented. Operators and future maintainers should be able to tell which mode is active without inferring behavior from scattered conditionals.

If the first base is DFW, DFW users in the launched population should not need manual beta grants one by one. The launch gate must still require confirmed approved airline employee email and must still reject unsupported, unconfirmed, expired, or revoked airline-email eligibility.

## 6. Scope Of Launched Population

The first-base launch population must be explicit before implementation.

Open choices:

- First-base launch may be airport-wide.
- First-base launch may be airline-specific.
- If airport-wide, any approved airline employee email user included by the base rules may access the general DFW baseboard.
- If airline-specific, only selected airline-domain users may access the launched base population.

Do not hard-code DFW or any airline unless the launch base and launch airline scope are formally selected. A launch-readiness switch should encode the selected launch population intentionally, not as hidden domain or route assumptions.

## 7. Airline-Email Verification Dependency

The launch gate depends on a reliable airline-email verification state. Approved email domain management remains useful because launch eligibility depends on whether a confirmed email belongs to an approved airline employee domain.

The app gate should check the eligibility credential, not merely the login email. Login email and airline employee email may be the same, but the system must support them being distinct. Personal login email alone does not prove eligibility.

Unsupported domains should not grant launch access. If the airline employee email changes, the new address must be reverified. Expired or revoked airline-email verification should block general app and baseboard access according to the future expiry/revocation policy.

## 8. Profile/Onboarding Dependency

Required onboarding and profile fields may remain part of access, but launch requirements should stay minimal. The launch gate should not require proof upload, badge upload, role proof, base proof, or proof-review approval.

Possible launch-required fields:

- display name or handle
- selected base, if self-declared base is needed before general baseboard access
- airline employee email verification status
- acceptance of community and disclaimer terms

Any additional required field should have a clear launch-safety reason. Profile completion should not become a hidden substitute for proof verification or manual approval.

## 9. Restricted Board Gate Remains Separate

The launch gate grants only general app and general baseboard access. Restricted boards remain separate and require board membership approval.

Airline-email verification alone must not grant DFW FA, DFW Pilot, or other restricted board content access. Community-admin approval remains board-specific.

Restricted board access should survive, expire, or be revoked according to board policy and airline-email status policy. That lifecycle should be designed in a future board/community access implementation task.

## 10. Proof-System Freeze Interaction

Launch-readiness must hide or freeze proof-upload UX. Launch access must not require proof upload.

Existing proof infrastructure remains historical/runtime-applied infrastructure until a reviewed deprecation or removal plan exists. The launch-gate transition task should not delete proof systems, alter proof retention semantics, or expose proof systems to community admins.

The proof system may remain available to operators for historical audit, retention, and cleanup obligations until deprecation is formally implemented.

## 11. Rollout Modes

Recommended rollout modes:

- `private_testing`: beta required, airline-email verified required, limited users.
- `first_base_launch`: beta not required for the launched population, airline-email verified required, first base/base population enabled, restricted boards still membership-gated.
- `broader_launch`: beta removed broadly, airline-email verified required, multiple bases possible.
- `internal_test`: optional mode for unreleased features, separate from the app-level launch gate.

The implementation should avoid mixing internal feature previews with the main app launch gate. A user may be eligible for the launched app without being eligible for every unreleased feature.

## 12. Safety Checks Before Transition

Before moving to `first_base_launch`, require:

- airline-email access state implemented and runtime-proven
- approved email domain list ready for the launch population
- email templates, custom SMTP, and branding decision completed if needed
- First-Base MVP scope confirmed
- general baseboard exists
- restricted boards and access-request flow ready if restricted boards launch
- community-admin policy and disclaimers ready
- basic moderation and reporting ready
- proof-upload UI hidden or frozen
- privacy and trust copy reviewed
- no official airline sponsorship implication
- rollback plan exists

These checks are release gates. They should be verified before disabling beta as a general-access blocker for the launched population.

## 13. Rollback Plan

The launch-readiness implementation should support returning to `private_testing` mode if needed.

Existing verified airline-email users should not lose account records during rollback, but app access may be temporarily restricted if safety requires it. A rollback should not delete user data, reset verification state unnecessarily, or restore proof-upload requirements.

If gate-transition audit events are implemented later, mode changes and rollbacks should be logged. Rollback criteria should be documented before launch, including abuse, moderation load, verification defects, privacy issues, or unsupported-domain leakage.

## 14. Implementation Implications

Future implementation tasks should include:

- inspect current private app gate code
- define launch mode config or feature flag
- define airline-email verified access state
- update signup/onboarding to collect and verify airline employee email
- update private app gate to support `private_testing` versus `first_base_launch`
- update `/app/access-hold` and `/app/access-restricted` pages
- update `/app/verification` copy or route behavior
- add launch-mode tests
- add runtime validation plan
- update docs and ops runbook
- ensure E05 proof systems remain frozen

The implementation ticket pack should include web behavior, shared-core access rules for a future mobile client, database/RLS implications, audit requirements, and operator/admin visibility if launch mode can be changed operationally.

## 15. Non-Goals

This task does not include:

- code changes
- migrations
- beta gate removal
- launch-mode implementation
- board implementation
- proof-system deletion
- production deployment

Future implementation must be separately scoped, reviewed, tested, and runtime-proven.

## 16. Open Questions

- Is first-base launch airport-wide or airline-specific?
- Which base launches first?
- Is DFW formally selected?
- Which airline domains are included for first launch?
- What exact profile fields are required?
- Should base selection be required before app access?
- Is airline-email verification long-lived or expiring at launch?
- What happens when airline email verification is revoked?
- What user-facing copy appears when beta gate is still active?
- What user-facing copy appears when airline email is unsupported?
- What operator/admin switch controls launch mode?
- Who approves launch-readiness?
- What rollback criteria trigger returning to `private_testing`?

## 17. Source-Of-Truth Statement

This document defines the transition from private-testing beta gate to first-base launch gate. It builds on:

- `strategy/product-pivot-email-verification-community-boards.md`
- `strategy/airline-email-access-gate-decision.md`
- `strategy/board-community-access-model-decision.md`
- `strategy/proof-system-freeze-deprecation-plan.md`
- `strategy/first-base-mvp-scope.md`
- `strategy/community-admin-responsibilities-disclaimer-policy.md`

Future implementation must not remove beta gating except through an explicit launch-readiness task. Future implementation must not keep beta as a permanent general-access requirement after launch. Future implementation must not reintroduce proof upload as a launch gate.
