# Epoch 02: Private App Foundation Ticket Pack

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Executive Summary

Epoch 02 is the **Private App Foundation** epoch.

Its purpose is to create the locked private app shell behind the existing public splash/waitlist page and define the future private route structure without turning on real product functionality yet.

Epoch 02 is a containment and foundation epoch, not a feature epoch. It creates the structural boundary between:

- the completed public waitlist/marketing surface
- the future private MVP application

Epoch 02 is complete only when:

- the private app shell exists
- the private route structure is defined
- unauthorized/private access is blocked or clearly locked at the placeholder-shell level
- no real community functionality exists yet

## 2. Relationship To First-Release MVP

The validated first release is a private, invite-only, verified airline-worker beta centered on one base across multiple roles. It is intended to validate Base Board utility, Layover Board utility, gated discussion, searchable reusable knowledge, trust, and moderation feasibility.

Epoch 02 does **not** build that MVP yet.

Epoch 02 prepares for the MVP by:

- defining the private application boundary
- creating the shell that future auth, verification, profile, board, room, moderation, and admin features will plug into
- ensuring the app has honest locked states instead of pretending product access already exists

Epoch 02 must preserve the validated MVP direction while avoiding premature implementation of MVP features.

## 3. Source Documents Used

Primary source documents reviewed for this ticket pack:

- `docs/EPOCH_ROADMAP.md`
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `docs/MILESTONE_EXECUTION_PLAN.md`
- `docs/TECHNICAL_ARCHITECTURE.md`

Supporting documents reviewed:

- `docs/APP_FOUNDATION_NOTES.md`
- `docs/FIRST_RELEASE_MVP.md`
- `docs/PRODUCT_DELIVERY_OPERATING_MODEL.md`
- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/TRUST_AND_SAFETY.md`

Supporting documents requested but not present in this worktree at authoring time:

- `docs/research/interviews/flight-attendant-interview-001.md`
- `docs/research/interviews/flight-attendant-interview-002.md`

This ticket pack proceeds using the available planning and architecture documents.

## 4. In Scope

Epoch 02 is in scope for:

- private app route map definition
- private shell layout planning
- locked private placeholder landing state
- unauthorized / not-yet-available route behavior
- placeholder route surfaces for future MVP areas
- private navigation skeleton
- preservation of the public waitlist/private app boundary
- accessibility baseline for the shell and navigation
- enforcement guardrails to prevent accidental feature activation
- validation and exit-check documentation for Epoch 02

## 5. Out Of Scope

Epoch 02 must not implement:

- real auth
- user accounts
- profile creation
- aviation-worker verification flows
- real beta access logic
- real posting
- Base Board functionality
- Layover Board functionality
- verified rooms functionality
- moderation tooling
- admin workflows beyond placeholder route planning
- AI
- payments
- deals marketplace
- waitlist capture
- schedule integrations
- portal login
- nearby crew tracking
- non-rev tools
- native mobile
- actual database schema implementation

Placeholder routes and locked placeholder screens are allowed only if they remain clearly non-functional.

## 6. Dependencies And Preconditions

- Explicit approval to begin Epoch 02 app-structure work.
- The completed public splash/waitlist surface remains unchanged.
- Epoch 02 must preserve the repo's current product constraints and safety boundaries.
- The shell should be designed to support later epochs for auth, verification, community, moderation, and private beta without implementing them yet.
- No database dependency should be introduced as part of this epoch.

## 7. Exit Criteria

Epoch 02 is complete when:

- private app shell exists
- route structure is defined
- unauthorized/private access is blocked or clearly locked at the placeholder-shell level
- the public waitlist/private app boundary is preserved
- future MVP surfaces are represented only as non-functional placeholders
- no real community functionality exists yet

## 8. Ordered Ticket List

1. `E02-T01` - Define Private/Public Route Map
2. `E02-T02` - Create Private App Shell Layout Contract
3. `E02-T03` - Build Locked Private Shell Landing State
4. `E02-T04` - Define Unauthorized And Not-Yet-Available Route Behavior
5. `E02-T05` - Add Future MVP Placeholder Route Surfaces
6. `E02-T06` - Define Private Navigation Skeleton
7. `E02-T07` - Preserve Public Waitlist / Private App Boundary
8. `E02-T08` - Establish Accessibility Baseline For Private Shell
9. `E02-T09` - Enforce No-Real-Functionality Guardrails
10. `E02-T10` - Run Epoch 02 Validation And Exit Review

## 9. Detailed Tickets

### E02-T01

**Title**  
Define Private/Public Route Map

**Goal**  
Create an explicit route map for the private app shell and clarify the boundary between public marketing routes and private product routes.

**Scope**

- Define which top-level routes remain public.
- Define which top-level routes are private-shell routes.
- Define which future MVP surfaces will exist as placeholders only.
- Define which routes must show locked or unavailable states.

**Detailed Tasks**

- Document the route map for the private app shell.
- Identify the canonical private entry route.
- Identify placeholder routes for future MVP areas.
- Define the relationship between `/` and `/app` or equivalent public/private surfaces.
- State that route planning does not imply real access control implementation yet.

**Acceptance Criteria**

- The private/public route map is documented.
- A canonical private shell entry route is chosen.
- Future MVP routes are named consistently with current planning docs.
- Public and private route boundaries are explicit.
- The route map does not imply functional auth, profile, or board behavior.

**Dependencies**

- `docs/EPOCH_ROADMAP.md`
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `docs/NAMING_AND_INFORMATION_ARCHITECTURE.md`

**Explicit Out-Of-Scope Notes**

- No auth logic.
- No real route protection backed by sessions.
- No real board, room, or profile data.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`
- `docs/epochs/epoch-02-route-map.md`
- future implementation planning docs or route maps

**Validation Steps**

- Review route names against current planning vocabulary.
- Confirm no route implies a live feature.
- Confirm public waitlist route remains the public entry point.

**Risk Notes**

- Risk: route naming drifts from later information architecture.  
  Mitigation: align naming to existing architecture docs and mark placeholders clearly.

### E02-T02

**Title**  
Create Private App Shell Layout Contract

**Goal**  
Define the structural layout contract for the private app shell so later epochs can plug into a stable frame.

**Scope**

- Shell-level layout regions only.
- Top-level frame structure.
- Future placeholder container strategy.
- Honest locked-state framing.

**Detailed Tasks**

- Define shell sections such as header, nav, content region, utility/status area, and footer if needed.
- Define what shell elements are always present versus future-only.
- Define how locked/private messaging appears at the shell level.
- Define how future MVP areas fit into the layout.

**Acceptance Criteria**

- A shell contract exists independent of real feature implementation.
- Layout regions are documented clearly enough for implementation.
- The shell is future-compatible with auth/profile/boards/admin features.
- The shell avoids marketing-page patterns that conflict with private utility use.

**Dependencies**

- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/FIRST_RELEASE_MVP.md`

**Explicit Out-Of-Scope Notes**

- No actual feature implementation inside the shell.
- No final visual polish for later feature screens.
- No marketing redesign.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`
- `docs/epochs/epoch-02-private-shell-layout-contract.md`

**Validation Steps**

- Check shell structure against future MVP surfaces.
- Confirm shell can support locked, pre-auth, and later authenticated states.

**Risk Notes**

- Risk: shell becomes overdesigned before utility features exist.  
  Mitigation: keep the shell structural, minimal, and utility-oriented.

### E02-T03

**Title**  
Build Locked Private Shell Landing State

**Goal**  
Define the default private app landing experience as an honest locked placeholder, not a fake live product.

**Scope**

- Locked private shell landing copy and state design.
- Message hierarchy for unavailable/private-beta-only product access.
- Placeholder-only presentation of future product intent.

**Detailed Tasks**

- Define the default private landing state.
- Write honest copy that explains the app is private and not yet open.
- Clarify that real access will come later through invite-only/private-beta paths.
- Make sure the shell does not imply a working internal product.

**Acceptance Criteria**

- Private shell landing state is explicitly locked.
- Language does not imply real beta access already exists.
- State reinforces trust, privacy, and phased rollout.
- State is consistent with first-release MVP positioning.

**Dependencies**

- `docs/FIRST_RELEASE_MVP.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`

**Explicit Out-Of-Scope Notes**

- No invite acceptance flow.
- No login flow.
- No real user-specific state.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`
- future locked-state copy specs

**Validation Steps**

- Review placeholder language for honesty and clarity.
- Check that the shell reads as private-beta preparation, not broken product.

**Risk Notes**

- Risk: locked state feels like a dead end.  
  Mitigation: explain the product direction and future access path without pretending access exists.

### E02-T04

**Title**  
Define Unauthorized And Not-Yet-Available Route Behavior

**Goal**  
Specify what happens when users reach private or future routes before auth and beta access exist.

**Scope**

- Unauthorized route behavior.
- Not-yet-available route behavior.
- Locked placeholder behavior.
- Honest limitation copy.

**Detailed Tasks**

- Distinguish between public, private-shell, and future placeholder states.
- Define the behavior for direct navigation to private routes.
- Define whether users see a lock screen, redirect, or unavailable state.
- Make it explicit that this is placeholder-level gating, not final security enforcement.

**Acceptance Criteria**

- Unauthorized and unavailable states are documented.
- Behavior is consistent across private shell routes.
- Copy does not imply real auth exists.
- Future auth and beta-access work remains clearly delegated to Epoch 03.

**Dependencies**

- `docs/EPOCH_ROADMAP.md`
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`

**Explicit Out-Of-Scope Notes**

- No production-grade auth enforcement.
- No session-based access logic.
- No invite token implementation.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

**Validation Steps**

- Confirm all documented route behaviors are explicit.
- Confirm no client-only route handling is described as real security.

**Risk Notes**

- Risk: later teams mistake placeholder gating for security.  
  Mitigation: use repeated explicit warnings in acceptance criteria and guardrails.

### E02-T05

**Title**  
Add Future MVP Placeholder Route Surfaces

**Goal**  
Define the set of future MVP route surfaces that may exist as placeholders only during Epoch 02.

**Scope**

- Placeholder route names.
- Placeholder state purpose.
- Non-functional future surface list.

**Detailed Tasks**

- Define placeholder routes for future MVP areas such as:
  - Home Base
  - Base Boards
  - Layover Boards
  - Verified Rooms
  - Profile
  - Verification
  - Admin
- Mark each as non-functional placeholder-only.
- Define the minimal descriptive purpose of each route.

**Acceptance Criteria**

- Placeholder route list exists.
- Naming aligns with planning docs where possible.
- Each placeholder is clearly marked non-functional.
- Placeholder routes do not expose data, interactions, or fake state.

**Dependencies**

- `docs/FIRST_RELEASE_MVP.md`
- `docs/NAMING_AND_INFORMATION_ARCHITECTURE.md`

**Explicit Out-Of-Scope Notes**

- No working Base Boards.
- No working Layover Boards.
- No working Verified Rooms.
- No working admin tools.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

**Validation Steps**

- Cross-check placeholder labels with MVP planning docs.
- Confirm placeholders stay descriptive rather than functional.

**Status Note**

- Satisfied by the merged `E02-T04` locked private route behavior work, which implemented the placeholder surfaces for `/app/home`, `/app/base`, `/app/layovers`, `/app/rooms`, `/app/profile`, `/app/verification`, and `/app/admin` without turning on feature behavior.

**Risk Notes**

- Risk: placeholder routes overpromise future scope.  
  Mitigation: keep copy narrow and grounded in validated MVP direction.

### E02-T06

**Title**  
Define Private Navigation Skeleton

**Goal**  
Create a navigation skeleton that previews the private app information architecture without activating features.

**Scope**

- Top-level navigation items.
- Locked/placeholder navigation labels.
- Utility-first order of future surfaces.

**Detailed Tasks**

- Define top-level nav items for the private shell.
- Order them according to the validated MVP wedge.
- Mark unavailable items clearly.
- Ensure navigation reinforces Base Boards, Layover Boards, and gated discussion as the future center of gravity.

**Acceptance Criteria**

- Navigation skeleton exists.
- Navigation order reflects utility-first priorities.
- Labels are consistent with planning docs.
- Locked items are clearly not interactive product features yet.

**Dependencies**

- `docs/FIRST_RELEASE_MVP.md`
- `docs/NAMING_AND_INFORMATION_ARCHITECTURE.md`

**Explicit Out-Of-Scope Notes**

- No working nav-backed feature pages.
- No role-based nav logic yet.
- No user-state-based nav logic yet.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

**Validation Steps**

- Review nav order against first-release MVP priorities.
- Confirm no nav label implies excluded features.

**Status Note**

- Satisfied by the merged `E02-T03` and `E02-T04` private shell work, which implemented a shared disabled navigation skeleton for `/app` and the placeholder child routes with planning-aligned labels, utility-first ordering, and explicit non-functional/current-placeholder states.

**Risk Notes**

- Risk: navigation exposes too much future scope too early.  
  Mitigation: keep skeleton narrow and tied to validated MVP surfaces only.

### E02-T07

**Title**  
Preserve Public Waitlist / Private App Boundary

**Status Note**

- Satisfied by the merged private shell work plus the E02-T07 public root-route restoration and boundary verification pass, which restores `/`, keeps `/app` isolated, and preserves the no-new-features rule for Epoch 02.

**Goal**  
Ensure Epoch 02 respects the separation between the existing public waitlist surface and the future private product shell.

**Scope**

- Public/private route boundary preservation.
- No waitlist-page modifications.
- No cinematic/canvas/globe work.
- No waitlist data-flow changes.

**Detailed Tasks**

- Document the public/private boundary as a guardrail for implementation.
- Specify that the public waitlist route remains the public entry experience.
- Specify that Epoch 02 must not alter waitlist copy, cinematic work, or external waitlist handling.
- Ensure shell work does not leak marketing concerns into private utility planning.

**Acceptance Criteria**

- Public waitlist remains unchanged.
- Private shell work does not alter the public page.
- No cinematic/globe/Three.js work is included in Epoch 02 scope.
- No waitlist capture or waitlist persistence work is introduced.

**Dependencies**

- `docs/APP_FOUNDATION_NOTES.md`
- `docs/DEPLOYMENT_AND_WAITLIST_READINESS.md`

**Explicit Out-Of-Scope Notes**

- No public landing redesign.
- No waitlist form changes.
- No cinematic asset changes.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

**Validation Steps**

- Confirm no public-route modifications are part of Epoch 02 tickets.
- Confirm no waitlist data changes are implied.

**Risk Notes**

- Risk: private app work accidentally turns into another landing-page redesign.  
  Mitigation: state the public/private boundary explicitly in scope and validation sections.

### E02-T08

**Title**  
Establish Accessibility Baseline For Private Shell

**Status Note**

- Satisfied by the merged private shell implementation and the documented shell-level accessibility audit in `docs/epochs/epoch-02-accessibility-baseline.md`.

**Goal**  
Define the minimum accessibility expectations for the private shell and navigation before real features are added.

**Scope**

- Keyboard-accessible shell structure.
- Focus order expectations.
- heading/landmark expectations.
- locked-state message accessibility.

**Detailed Tasks**

- Define navigation, main content, and landmark expectations.
- Define focus visibility and keyboard traversal expectations.
- Define how locked-state and unavailable-state messaging should be exposed accessibly.
- Specify that later auth/forms/content surfaces inherit this baseline.

**Acceptance Criteria**

- Accessibility expectations are documented for shell-level implementation.
- Locked-state copy can be consumed accessibly.
- Landmark and focus expectations are clear.
- The shell baseline is compatible with WCAG 2.2 AA direction.

**Dependencies**

- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/MILESTONE_EXECUTION_PLAN.md`

**Explicit Out-Of-Scope Notes**

- No full accessibility certification work.
- No feature-specific form accessibility for later epochs.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

**Validation Steps**

- Verify shell guidance aligns with existing repo accessibility targets.
- Confirm accessibility work remains shell-level only.

**Risk Notes**

- Risk: accessibility is deferred until complex features arrive.  
  Mitigation: define shell-level standards now so later work inherits them.

### E02-T09

**Title**  
Enforce No-Real-Functionality Guardrails

**Status Note**

- Satisfied by the merged private shell implementation, the focused private-shell guardrail assertions, and the documented audit in `docs/epochs/epoch-02-no-real-functionality-guardrails.md`.

**Goal**  
Prevent accidental scope drift from shell planning into real MVP feature implementation.

**Scope**

- Guardrails.
- explicit anti-scope-drift rules.
- future-epoch handoff boundaries.

**Detailed Tasks**

- Document the prohibited implementations during Epoch 02.
- Clarify that placeholder routes must remain non-functional.
- Clarify that any auth, verification, posting, admin, or AI work belongs to later epochs.
- State that client-only locked states must not be mistaken for true security enforcement.

**Acceptance Criteria**

- A clear guardrail section exists.
- Epoch boundaries are restated at the ticket level.
- Placeholder-only rules are unambiguous.
- Future implementation teams can tell where Epoch 02 ends and Epoch 03 begins.

**Dependencies**

- `docs/PRODUCT_DELIVERY_OPERATING_MODEL.md`
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`

**Explicit Out-Of-Scope Notes**

- No hidden feature prep that effectively implements later epochs.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

**Validation Steps**

- Review each ticket against the prohibited feature list.
- Confirm no acceptance criteria require live product behavior.

**Risk Notes**

- Risk: implementation starts sneaking in auth/profile/community logic.  
  Mitigation: make scope guardrails explicit in every ticket.

### E02-T10

**Title**  
Run Epoch 02 Validation And Exit Review

**Status Note**

- Satisfied by the completed Epoch 02 validation pass, route proof, and exit review documented in `docs/epochs/epoch-02-exit-review.md`.

**Goal**  
Create the final validation checklist and handoff review required to close Epoch 02 cleanly.

**Scope**

- Epoch 02 completion checklist.
- exit review.
- handoff notes to Epoch 03.

**Detailed Tasks**

- Define the checklist used to verify Epoch 02 completion.
- Confirm the shell exists and route structure is documented.
- Confirm locked states are honest and consistent.
- Confirm no real functionality was turned on.
- Record the handoff requirements for the auth/profile epoch.

**Acceptance Criteria**

- A clear validation checklist exists.
- Epoch 02 exit criteria map directly to review steps.
- Handoff notes identify what Epoch 03 should implement next.
- The review explicitly confirms no waitlist/cinematic/app-feature scope drift occurred.

**Dependencies**

- completion of `E02-T01` through `E02-T09`

**Explicit Out-Of-Scope Notes**

- No implementation of Epoch 03 work.

**Likely Files Or Areas Affected**

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

**Validation Steps**

- Review all ticket acceptance criteria against the official epoch exit criteria.
- Confirm no later-epoch features are required for closeout.

**Risk Notes**

- Risk: Epoch 02 is declared complete without a clear handoff.  
  Mitigation: require a closeout checklist and explicit Epoch 03 starter notes.

## 10. Implementation Guardrails

- Do not modify the public waitlist page.
- Do not modify cinematic, globe, or Three.js work.
- Do not imply that placeholder locking is real security.
- Do not create fake authenticated state or fake beta-member state.
- Do not introduce database dependencies.
- Do not introduce verification, moderation, community, or AI behavior.
- Keep the private shell honest, minimal, and utility-oriented.
- Preserve future compatibility with auth, verification, community, moderation, and admin work.
- Treat accessibility as a shell-level requirement now, not a later cleanup.

## 11. Risks And Mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Scope drift into auth or community features | Collapses epoch boundaries and increases implementation risk | Make out-of-scope rules explicit in every ticket |
| Placeholder states mistaken for real security | Could produce false confidence and weak future access design | Use explicit "locked placeholder only" language |
| Private shell inherits marketing-page behavior | Private utility app and cinematic waitlist have different jobs | Preserve strict public/private boundary |
| Route naming drift from future architecture | Could create rework in later epochs | Align labels with current architecture docs and MVP docs |
| Overpromising future surfaces | Creates product expectations before validation | Keep placeholder copy narrow and honest |
| Accessibility deferred until later | Increases rework when auth and product complexity arrive | Set shell-level accessibility baseline now |

## 12. Validation Checklist

- [ ] Private app shell is documented as a distinct private surface.
- [ ] Route structure is documented.
- [ ] Public and private route boundaries are explicit.
- [ ] Locked placeholder state is defined.
- [ ] Unauthorized / unavailable route behavior is defined.
- [ ] Placeholder MVP routes are defined and clearly non-functional.
- [ ] Navigation skeleton is defined.
- [ ] Accessibility baseline for shell/navigation is defined.
- [ ] No app-feature implementation is implied.
- [ ] No auth, verification, community, moderation, AI, payment, or data-layer work is included.
- [ ] No waitlist, cinematic, globe, or Three.js work is included.
- [ ] Epoch 03 handoff notes are documented.

## 13. Handoff Notes For Epoch 03

Epoch 03 should begin only after Epoch 02 is complete and approved.

Epoch 03 should build:

- auth foundation
- profile and public-handle model
- account states
- invite-only beta access model
- centralized authorization helpers

Epoch 03 should use the private shell, route map, and placeholder route structure created by Epoch 02 as the foundation for real access-controlled behavior.

Epoch 03 should not redesign or replace the shell unless Epoch 02 proves structurally insufficient.

## 14. Chosen Convention

This repo did not contain an existing `docs/epochs/` directory at authoring time. The preferred output path from the task prompt was used and the directory was created:

- `docs/epochs/epoch-02-private-app-foundation-tickets.md`

`docs/BUILD_TICKETS.md` remains the canonical broad ticket index. It should only be updated minimally to link this dedicated epoch-specific ticket pack.
