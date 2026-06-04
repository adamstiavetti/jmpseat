# Epoch 03: Auth, Profiles, and Beta Access Ticket Pack

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Executive Summary

Epoch 03 is the **Auth, Profiles, and Beta Access** epoch.

Its purpose is to turn the private `/app` shell from a client-visible placeholder into a real access-controlled application boundary with account identity, beta-access gating, and foundational authorization patterns.

Epoch 03 is the first epoch that should implement real private-app entry control. It remains narrower than community features and must not drift into verification workflows, posting, boards, rooms, moderation operations, AI, or payments.

Epoch 03 is complete only when:

- auth is implemented
- core account state exists
- beta access state exists
- invited users can enter the private app through real auth/access gates
- non-invited users are blocked from private beta access
- auth remains separate from aviation-worker verification

## 2. Relationship To Epoch 02

Epoch 02 created:

- the public `/` waitlist baseline
- the private `/app` shell
- placeholder private child routes
- public/private boundary guardrails
- accessibility baseline
- no-real-functionality guardrails

Epoch 03 builds on that foundation by replacing client-only placeholder gating with real identity and access behavior.

Epoch 03 must preserve all Epoch 02 guardrails unless a later approved task explicitly changes them.

## 3. Relationship To First-Release MVP

The first-release MVP is a private, invite-only, verified airline-worker beta focused on one base across multiple roles.

Epoch 03 does not implement the core community utility yet.

Epoch 03 prepares the MVP by:

- establishing login and account identity
- separating account auth from aviation-worker verification
- introducing invite-only beta access state
- creating real private-app access gates
- preparing the profile and authorization foundation that later verification and community work require

Epoch 03 must not use auth/account work as cover to start Base Boards, Layover Boards, verified rooms, posts/comments, moderation, or AI.

## 4. Source Documents Used

Primary source documents reviewed for this ticket pack:

- `docs/EPOCH_ROADMAP.md`
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `docs/MILESTONE_EXECUTION_PLAN.md`
- `docs/TECHNICAL_ARCHITECTURE.md`

Supporting documents reviewed:

- `docs/FIRST_RELEASE_MVP.md`
- `docs/PRODUCT_DELIVERY_OPERATING_MODEL.md`
- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/TRUST_AND_SAFETY.md`
- `docs/DATA_MODEL.md`
- `docs/epochs/epoch-02-exit-review.md`
- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

## 5. What Epoch 03 Is

Epoch 03 is in scope for:

- auth-provider decision and architecture confirmation
- auth route planning and state planning
- real signup/login/logout/session behavior
- account-state model
- basic profile/account identity foundation
- beta-access state model and invite-only access behavior
- authorization baseline and centralized access-helper planning
- real private-route gating that replaces Epoch 02 placeholder-only access messaging where appropriate
- validation and handoff documentation for the verification epoch

## 6. What Epoch 03 Is Not

Epoch 03 must not implement:

- aviation-worker verification workflow
- manual verification review flows
- upload-based verification
- Base Boards functionality
- Layover Boards functionality
- verified rooms functionality
- posts, comments, saves, or search
- moderation workflows
- admin workflows beyond invite/access planning and auth-related controls
- AI
- payments
- deals marketplace
- roster, schedule, or non-rev tools
- nearby crew tracking
- public launch behavior

Profile work in Epoch 03 should stay limited to identity/access foundation fields needed for private-beta entry and later verification/community routing.

## 7. Dependencies And Preconditions

- Epoch 02 exit review is complete and recorded.
- The `/app` shell and route structure from Epoch 02 remain the private-app foundation.
- Explicit approval exists to begin real auth/access work.
- An auth/backend ADR or equivalent implementation decision is approved before code implementation starts.
- Public waitlist capture remains external unless separately approved.
- Verification state and workflows remain deferred to Epoch 04.

## 8. Exit Criteria

Epoch 03 is complete when:

- auth implementation approach is explicitly confirmed
- users can sign up, verify email, log in, and log out
- account states are represented and enforced
- invited users can complete the approved account-entry path
- non-invited users are blocked from private beta entry
- basic profile/account identity fields required by the MVP are captured
- server-side authorization baseline is defined and tested for account/access state
- auth remains separate from aviation-worker verification state
- later community features are still blocked

## 9. Ordered Ticket List

1. `E03-T01` - Confirm Auth And Access Architecture Decision
2. `E03-T02` - Define Auth Route And Account-State Map
3. `E03-T03` - Implement Auth Foundation
4. `E03-T04` - Implement Account And Profile Foundation
5. `E03-T05` - Implement Invite And Beta Access Model
6. `E03-T06` - Implement Private-App Access Gates
7. `E03-T07` - Establish Authorization Baseline And Security Events
8. `E03-T08` - Run Epoch 03 Validation And Handoff Review

## 10. Detailed Tickets

### E03-T01

**Title**  
Confirm Auth And Access Architecture Decision

**Status**  
Complete for planning. See [Epoch 03 Auth Access Architecture Decision](epoch-03-auth-access-architecture-decision.md).

**Goal**  
Lock the real auth/backend approach for Epoch 03 before implementation starts.

**Scope**

- Auth-provider decision.
- Access-control architecture decision.
- Session/security approach confirmation.
- Decision record for invite/beta-access model assumptions.

**Detailed Tasks**

- Confirm the chosen auth provider, expected session model, and environment assumptions.
- Confirm whether the MVP will use Supabase Auth or an approved equivalent.
- Confirm the boundary between auth, beta access, and aviation verification.
- Record whether any stack deviations from the planning docs are approved.
- Document the implementation choice as the controlling Epoch 03 auth/access decision.

**Acceptance Criteria**

- Auth implementation choice is explicit.
- Session model is explicit.
- Auth remains separate from verification.
- The decision is specific enough to unblock implementation tickets.

**Dependencies**

- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/EPOCH_ROADMAP.md`

**Explicit Out-Of-Scope Notes**

- No verification workflow design.
- No community feature implementation.
- No public waitlist redesign.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-03-auth-account-beta-access-tickets.md`
- `docs/epochs/epoch-03-auth-access-architecture-decision.md`

**Validation Steps**

- Verify the chosen auth approach aligns with route model, access gates, and MVP constraints.
- Confirm no auth decision reopens excluded V1 features.

**Risk Notes**

- Risk: implementation starts on a half-decided auth stack.  
  Mitigation: require an explicit auth/access architecture decision first.

**Documentation Impact**

- Record the auth/access decision in repo docs before implementation.

### E03-T02

**Title**  
Define Auth Route And Account-State Map

**Status**  
Complete for planning. See [Epoch 03 Auth Route Account State Map](epoch-03-auth-route-account-state-map.md).

**Goal**  
Define the real route and state transitions needed for auth, onboarding, and blocked/invited access handling.

**Scope**

- Auth route planning.
- Pre-auth, invited, registered, blocked, and hold-state planning.
- Profile-started/profile-complete state transitions.
- Private-app entry and fallback states.

**Detailed Tasks**

- Define login, signup, logout, email-verification, and onboarding route intent.
- Define how `/app` behaves for anonymous, invited, authenticated, and blocked users.
- Define the required account-state transitions from waitlist to invited to registered to access-granted.
- Clarify the difference between email verification, beta access, and aviation verification.
- Define the controlled hold state for logged-in but non-invited users.

**Acceptance Criteria**

- Auth routes and access states are documented.
- Private-entry behavior is explicit for non-invited users.
- Account-state model is aligned with existing architecture docs.
- Route behavior does not imply aviation verification is complete.

**Dependencies**

- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `docs/EPOCH_ROADMAP.md`
- `docs/BETA_READINESS_CHECKLIST.md`

**Explicit Out-Of-Scope Notes**

- No working community routes.
- No verification approval states beyond routing/holding assumptions.
- No moderation workflow states.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-03-auth-account-beta-access-tickets.md`
- `docs/epochs/epoch-03-auth-route-account-state-map.md`

**Validation Steps**

- Review state names against architecture and MVP docs.
- Confirm non-invited flow does not expose private app content.

**Risk Notes**

- Risk: auth state and verification state get conflated.  
  Mitigation: keep auth, beta access, and aviation verification explicitly separate.

**Documentation Impact**

- Document account-state and route-state decisions before coding auth flows.

### E03-T03

**Title**  
Implement Auth Foundation

**Status**  
Implemented for the bounded auth foundation slice. See [Epoch 03 Auth Foundation Implementation](epoch-03-auth-foundation-implementation.md).

**Goal**  
Implement real account creation, login, logout, and session handling for the private app.

**Scope**

- Signup.
- Login.
- Logout.
- Email verification.
- Session handling.
- Generic auth errors.
- Rate-limit-aware auth behavior.

**Detailed Tasks**

- Implement the approved auth provider setup.
- Implement signup and login flows.
- Implement logout behavior.
- Implement email-verification requirements.
- Implement account-state-aware post-auth routing.
- Implement generic error handling that avoids leaking account existence unnecessarily.

**Acceptance Criteria**

- User can sign up, verify email, log in, and log out.
- Session handling works for the private app.
- Anonymous access cannot enter invited-only private surfaces.
- Auth behavior aligns with accessibility and security requirements.

**Dependencies**

- `E03-T01`
- `E03-T02`

**Explicit Out-Of-Scope Notes**

- No aviation verification workflow.
- No community features.
- No admin dashboards.

**Likely Files Or Areas Affected**

- app auth routes and layouts
- auth/session utilities
- environment/config docs
- test coverage for auth flow
- `docs/epochs/epoch-03-auth-foundation-implementation.md`

**Validation Steps**

- Verify signup, login, logout, and email-verification flows.
- Verify anonymous users cannot access private beta routes.
- Verify auth errors do not leak account existence unnecessarily.

**Risk Notes**

- Risk: broken auth or insecure route access becomes the first real private-app vulnerability.  
  Mitigation: require auth-flow tests and server-side access checks before beta use.

**Documentation Impact**

- Update implementation docs to record actual auth flow and any approved route changes.

### E03-T04

**Title**  
Implement Account And Profile Foundation

**Status**  
Implemented for the bounded account/profile foundation slice. See [Epoch 03 Account Profile Foundation Implementation](epoch-03-account-profile-foundation-implementation.md).

**Goal**  
Create the minimum account/profile model needed for private-beta identity and later verification/community routing.

**Scope**

- User/account record.
- Profile record.
- Public handle.
- Airline/role/base identity fields as approved.
- Profile-started/profile-complete state handling.

**Detailed Tasks**

- Implement the core user/account model.
- Implement the profile model and required fields.
- Separate private identity from public handle.
- Implement unique-handle rules.
- Capture the minimum airline/role/base fields needed by the MVP direction and later verification/community routing.

**Acceptance Criteria**

- Authenticated user can create and update the approved profile foundation fields.
- Public handle is unique and distinct from private account identity.
- Profile state can be used by later access and verification logic.
- Profile foundation does not drift into community or moderation features.

**Dependencies**

- `E03-T03`
- `docs/DATA_MODEL.md`

**Explicit Out-Of-Scope Notes**

- No public profile browsing.
- No rich profile social features.
- No verification artifact handling.

**Likely Files Or Areas Affected**

- account/profile data model
- onboarding/profile routes
- validation and uniqueness rules
- tests for handle/account separation

**Validation Steps**

- Verify handle uniqueness.
- Verify required profile fields can be saved.
- Verify private identity remains separate from public handle.

**Risk Notes**

- Risk: profile grows into a social feature set too early.  
  Mitigation: keep profile limited to identity/access foundation fields.

**Documentation Impact**

- Record the approved profile foundation fields and any state transitions added.

### E03-T05

**Title**  
Implement Invite And Beta Access Model

**Status**  
Implemented for the bounded beta-access slice. See [Epoch 03 Beta Access Model Implementation](epoch-03-beta-access-model-implementation.md).

**Goal**  
Implement the invite-only beta-access state that sits between auth and aviation verification.

**Scope**

- Beta access status model.
- Invite record model.
- Invited-versus-non-invited entry logic.
- Access-hold state for authenticated but non-invited users.

**Detailed Tasks**

- Implement the `BetaAccess` and `Invite` foundation required by the approved data model.
- Represent invite-only beta access separately from authentication and aviation verification.
- Implement invited/active/paused/revoked state handling.
- Implement the safe hold state for authenticated but not-yet-approved users.
- Define or implement the invite acceptance path as approved for the MVP.

**Acceptance Criteria**

- Beta access status exists and is enforceable.
- Invited users can proceed through the private-entry path.
- Non-invited authenticated users are blocked from private beta entry.
- Beta access does not imply aviation-worker verification is complete.

**Dependencies**

- `E03-T03`
- `E03-T04`
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`

**Explicit Out-Of-Scope Notes**

- No verification workflow.
- No moderation or admin operations beyond invite/access planning.
- No community feature release.

**Likely Files Or Areas Affected**

- beta access and invite data model
- access-gate logic
- invite acceptance or hold-state routes
- tests for invite state transitions

**Validation Steps**

- Verify invited users can pass the intended gate.
- Verify non-invited users are blocked.
- Verify revoked or paused users lose entry appropriately.

**Risk Notes**

- Risk: auth succeeds but beta access is too permissive.  
  Mitigation: make beta access a distinct enforceable state, not an implied side effect of signup.

**Documentation Impact**

- Document the final beta-access and invite-state behavior used for the MVP.

### E03-T06

**Title**  
Implement Private-App Access Gates

**Goal**  
Replace Epoch 02 placeholder-only private entry behavior with real access-gated route behavior while preserving honest blocked states.

**Scope**

- Real private-route gating.
- Anonymous-to-auth redirects or holds.
- Authenticated-but-not-authorized hold states.
- Continued separation between public `/` and private `/app`.

**Detailed Tasks**

- Apply real gate behavior to `/app` and approved child routes.
- Implement route behavior for anonymous, authenticated, invited, and blocked states.
- Preserve honest blocked-state copy for users who do not yet have beta access.
- Ensure private routes do not rely on client-only checks as the true security boundary.

**Acceptance Criteria**

- Anonymous users cannot enter invited-only private routes.
- Authenticated non-invited users are held outside the real private beta surfaces.
- Invited users can enter the intended private route path.
- Public waitlist and private-app boundary remain intact.

**Dependencies**

- `E03-T03`
- `E03-T05`
- `docs/TECHNICAL_ARCHITECTURE.md`

**Explicit Out-Of-Scope Notes**

- No community content exposure beyond access-gate validation.
- No verification-required community participation yet.
- No moderation or admin feature release.

**Likely Files Or Areas Affected**

- `/app` route handling
- auth/access middleware or server-side guards
- blocked/hold-state UI
- route tests

**Validation Steps**

- Verify route access for anonymous users.
- Verify route access for authenticated non-invited users.
- Verify route access for invited users.
- Verify no private content is exposed through client-only checks.

**Risk Notes**

- Risk: client-only gating from Epoch 02 survives into real access control.  
  Mitigation: require server-side access enforcement for private entry.

**Documentation Impact**

- Update route/access docs to reflect the real gated behavior replacing placeholder-only entry.

### E03-T07

**Title**  
Establish Authorization Baseline And Security Events

**Goal**  
Create the initial authorization model and security-event logging baseline needed before verification and community features expand the risk surface.

**Scope**

- Centralized authorization helpers.
- RLS/server-side authorization baseline.
- Account-state authorization matrix.
- Security-event logging plan for auth and access failures.

**Detailed Tasks**

- Define or implement centralized authorization helpers for account and beta-access state.
- Define the RLS and server-side authorization test matrix.
- Ensure unauthorized reads/mutations are blocked at the correct layer.
- Define or implement `SecurityEvent` coverage for auth failures, authorization denials, and sensitive access control decisions relevant to this epoch.

**Acceptance Criteria**

- Authorization baseline is explicit and testable.
- Broken access control is treated as the highest-risk class for this epoch.
- Auth/access failures can be logged appropriately.
- Epoch 04 can build on this baseline without redefining the access model.

**Dependencies**

- `E03-T03`
- `E03-T05`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`

**Explicit Out-Of-Scope Notes**

- No moderation-event system.
- No verification-review event system beyond access-model preparation.
- No AI safety event flows.

**Likely Files Or Areas Affected**

- authorization helpers
- data-access policy docs or config
- security-event model/docs
- access-control test matrix

**Validation Steps**

- Verify authorization helpers cover account status and beta access.
- Verify unauthorized users cannot read or mutate private beta data.
- Verify security-event capture plan exists for auth/access failures.

**Risk Notes**

- Risk: auth exists without a durable authorization baseline.  
  Mitigation: require centralized authorization helpers and a tested access matrix before Epoch 03 closeout.

**Documentation Impact**

- Record the authorization baseline and security-event expectations in repo docs.

### E03-T08

**Title**  
Run Epoch 03 Validation And Handoff Review

**Goal**  
Close Epoch 03 with validation evidence and a clean handoff to the verification epoch.

**Scope**

- Epoch 03 completion checklist.
- validation review.
- handoff notes for Epoch 04.

**Detailed Tasks**

- Review each Epoch 03 ticket against the official epoch exit criteria.
- Confirm auth, account state, beta access, and access gates are implemented.
- Confirm auth remains separate from aviation verification.
- Confirm community features remain blocked.
- Record the handoff requirements for the verification epoch.

**Acceptance Criteria**

- A clear validation checklist exists.
- Epoch 03 exit criteria map directly to review steps.
- Handoff notes identify what Epoch 04 should implement next.
- The review explicitly confirms no community, moderation, AI, or payments scope drift occurred.

**Dependencies**

- completion of `E03-T01` through `E03-T07`

**Explicit Out-Of-Scope Notes**

- No implementation of Epoch 04 work.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-03-auth-account-beta-access-tickets.md`
- `docs/epochs/epoch-03-exit-review.md`

**Validation Steps**

- Review all ticket acceptance criteria against the official epoch exit criteria.
- Confirm non-invited access is blocked and invited access works.
- Confirm verification and community functionality remain deferred.

**Risk Notes**

- Risk: Epoch 03 is declared complete while auth and beta access remain conceptually present but operationally weak.  
  Mitigation: require exit review evidence tied to real auth and access checks.

**Documentation Impact**

- Add a formal Epoch 03 exit review before starting verification work.

## 11. Implementation Guardrails

- Do not collapse auth and aviation verification into one system.
- Do not expose community features during auth/access implementation.
- Do not re-open public waitlist redesign work.
- Do not rely on client-only checks as the real private-app security boundary.
- Do not introduce airline portal login, schedule scraping, nearby crew tracking, dating/swiping, full marketplace payments, or roster/calendar integrations.
- Keep admin work limited to invite/access planning and auth-related controls unless later epoch scope explicitly approves more.
- Preserve Epoch 02 accessibility and no-real-functionality guardrails where still applicable.

## 12. Risks And Mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Broken access control | This is the highest-risk class for a private verified community | Require server-side authorization and access-control tests |
| Auth and verification conflated | Users may appear "trusted" before aviation verification is complete | Keep auth, beta access, and aviation verification explicitly separate |
| Signup without beta gating | Private beta loses invite-only control and density strategy | Make beta access a distinct enforceable state |
| Profile scope creep | Identity foundation turns into a social feature project | Limit profile to MVP identity/access fields |
| Community features start early | Later-epoch work leaks into auth milestone | Keep boards/rooms/posts explicitly out of scope |
| Auth UX without accessibility | Account entry becomes a blocker for real users | Carry WCAG 2.2 AA auth expectations into implementation and validation |

## 13. Validation Checklist

- [ ] Auth approach is explicitly confirmed.
- [ ] Auth routes and account-state map are documented.
- [ ] Users can sign up, verify email, log in, and log out.
- [x] Account/profile foundation is implemented.
- [ ] Public handle is distinct from private identity.
- [ ] Invite and beta-access state exist.
- [ ] Invited users can enter the private app.
- [x] Non-invited users are blocked.
- [ ] Auth remains separate from aviation verification.
- [ ] Authorization helpers and access-control tests exist.
- [ ] Community features remain blocked.
- [ ] Documentation impact is recorded for implementation work.

## 14. Handoff Notes For The Next Epoch

Epoch 04 should begin only after Epoch 03 is complete and approved.

Epoch 04 should build:

- aviation verification state machine
- work-email and manual-review verification paths
- verification retention/deletion controls
- verification review workflow

Epoch 04 should inherit the real auth, account, and beta-access foundation from Epoch 03 rather than recreating identity logic inside verification work.

## 15. Scope Tensions To Preserve

The repo contains one important scope tension:

- `docs/EPOCH_ROADMAP.md` places beta access in Epoch 03.
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md` discusses M2 auth/profile foundation and M3 verification state plus beta access model in a finer-grained implementation sequence.

This ticket pack resolves that tension by treating Epoch 03 as responsible for the real invite-only auth/access foundation needed to enter the private app, while keeping aviation verification state and workflows in Epoch 04.
