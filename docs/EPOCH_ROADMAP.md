# Epoch Roadmap

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.
Rename note: Deadhead Club is retired and should not be used in current docs, UI, code, or planning. Older Git history may still contain legacy references.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Purpose

This roadmap organizes the existing jmpseat planning library into execution epochs. It is the sequencing spine for future founder, product, engineering, design, policy, and Codex work.

Detailed docs remain the source of truth for their domains. This roadmap summarizes controlling decisions, exit criteria, blockers, and next actions without duplicating every detail.

Future Codex tasks must declare which epoch they belong to. Work that does not map to an epoch should be treated as a scope question before implementation begins.

## 2. Current Project State

- Live production site exists: https://jmpseat.vercel.app.
- Tally waitlist exists: https://tally.so/r/jav6aa.
- Public splash page exists at `/`.
- `/app` private beta shell exists behind auth/profile/beta gates.
- `/app/admin` safe shell exists, reads explicit operator grants as authorization metadata, and keeps unimplemented operator-only sections disabled until their tooling pages exist.
- Operator grants foundation exists, the first operator bootstrap runtime pass is complete, and approved-domain management can move from disabled shell state into the next real operator tool slice.
- Waitlist CTA is wired through `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- Supabase-backed auth, profiles, beta access, verification, claims, reviewer queue, proof storage, proof viewing, and proof cleanup foundations exist.
- No community functionality, AI product feature, payments, analytics SDK, or internal waitlist capture exists.
- Discovery is desk-researched, not fully user-validated.
- FA expert interview remains pending.
- First trusted aviation contact outreach remains pending.
- Current production deployment is recorded in `DEPLOYMENT_RECORD_001.md`.
- Future private-app implementation should continue following `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md` so auth, data, moderation, storage, and search decisions remain scale-ready without overbuilding.
- Future private-app implementation should continue following `MOBILE_APP_STRATEGY.md` so the web MVP does not create backend, auth, verification, or authorization decisions that block a later native mobile client.

## 3. Epoch Status Legend

- Complete: planned scope is delivered and recorded.
- Active: currently being validated, operated, or refined.
- Pending: not started and waiting for prior gates or explicit approval.
- Blocked: cannot proceed until named blockers are resolved.
- Deferred: intentionally later, not part of immediate MVP sequence.
- Future: planned beyond the current MVP/private-beta execution horizon.
- Superseded: replaced by a newer doc, decision, or execution path.

## 4. Epoch Overview

| Epoch ID | Name | Status | Goal | Primary docs | Exit criteria | Current blockers / open items | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 00 | Discovery & Problem/Solution Validation | Active / partially complete | Validate problem, audience, wedge, trust concerns, and first beta community. | `DISCOVERY_RESEARCH_PLAN.md`, `DISCOVERY_RESEARCH_REPORT_001.md`, `PROBLEM_SOLUTION_VALIDATION_MATRIX.md`, `M0_VALIDATION_OPERATING_PACKET.md`, `PRODUCT_DELIVERY_OPERATING_MODEL.md` | FA expert interview completed, 3-5 trusted aviation contacts review live site, feedback captured, matrix updated, no major safety contradiction found. | FA expert interview, user feedback, trusted contact outreach, and first-community evidence are pending. | Start trusted-contact outreach and record feedback. |
| 01 | Public Splash + Waitlist | Complete / live | Make concept publicly viewable and capture waitlist interest. | `APP_FOUNDATION_NOTES.md`, `LANDING_PAGE_WAITLIST_PLAN.md`, `DEPLOYMENT_AND_WAITLIST_READINESS.md`, `DEPLOYMENT_RECORD_001.md` | Production loads, CTA opens Tally, fallback removed, Tally test response submitted, mobile page reviewed. | Test response and mobile UX review are not yet recorded. | Submit/verify a Tally test response and review mobile. |
| 02 | Private App Foundation | Pending | Create locked private app shell behind splash page. | `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`, `NAMING_AND_INFORMATION_ARCHITECTURE.md`, `MILESTONE_EXECUTION_PLAN.md`, `TECHNICAL_ARCHITECTURE.md` | Private shell exists, route structure defined, no unauthorized access, no real community functionality. | Explicit approval required; M0 validation signal preferred first. | Decide after Epoch 00 feedback whether M1B is justified. |
| 03 | Auth, Profiles, and Beta Access | Complete | Establish login, profile, invite-only beta access, and access gates. | `epochs/epoch-03-auth-account-beta-access-tickets.md`, `epochs/epoch-03-validation-and-handoff-review.md`, `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`, `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`, `MOBILE_APP_STRATEGY.md` | Auth implemented, beta access state exists, invited users can enter, non-invited users are blocked, auth remains separate from aviation verification. | Supabase operator setup and private-beta operations remain ongoing, but the approved implementation scope is complete. | Use the merged Epoch 03 handoff and runtime setup docs as the operator baseline. |
| 04 | Worker Verification Foundation | Complete | Implement worker-verification foundation, claims, evidence handling rules, and human review baseline. | `VERIFICATION_METHOD_DECISION.md`, `epochs/epoch-04-worker-verification-foundation-tickets.md`, `epochs/epoch-04-exit-report.md`, `TRUST_AND_SAFETY.md`, `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`, `MOBILE_APP_STRATEGY.md` | Verification claim model exists, work-email and redacted-proof verification foundations are implemented, proof handling is private and retention-bounded, human review exists, controlled proof viewing exists, cleanup routes exist, claims-based authorization direction is explicit, and no employer-system lookup or AI final approval exists. | Production env/cron monitoring, final privacy/legal copy, custom SMTP/auth email branding, approved-domain tooling, reviewer-scope tooling, and cleanup monitoring remain follow-ups. | Move to Epoch 05 Operator/Admin Tooling Foundation unless a verification bug appears. |
| 05 | Operator/Admin Tooling Foundation | Active | Make verification operations manageable without manual SQL before community rollout. | `epochs/epoch-05-operator-admin-tooling-tickets.md`, `epochs/e05-operator-access-model-decision.md`, `epochs/e05-admin-shell-navigation-foundation.md`, `epochs/e05-operator-grants-foundation.md`, `ops/operator-grants-bootstrap-runtime-pass.md`, `epochs/epoch-04-exit-report.md`, `ops/proof-retention-cleanup-operator-runbook.md`, `ops/proof-retention-cleanup-scheduler-compatibility.md`, `BUILD_TICKETS.md`, `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`, `MOBILE_APP_STRATEGY.md` | Approved-domain management, reviewer-scope management, cleanup monitoring, and audit inspection have bounded operator paths with safe authorization and logging. | Verification works, but approved domains, reviewer scopes, and cleanup monitoring are still operator/manual-SQL concerns. | Implement E05-T03 approved email domain management using the operator grants foundation. |
| 05B | Community Structure | Pending | Implement Base Boards, Layover Boards, and verified/role rooms structurally after operator controls are acceptable. | `MVP_SCOPE.md`, `BUILD_TICKETS.md`, `FEATURE_ROADMAP.md`, `DISCOVERY_RESEARCH_REPORT_001.md`, `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`, `MOBILE_APP_STRATEGY.md` | Board/room structures exist, content can be seeded/read-only first, no real anonymous posting until moderation/admin gates are complete. | Requires acceptable operator tooling, trust/legal posture, and moderation plan before real member access. | Wait until Epoch 05 operator/admin tooling or production trust basics are acceptable. |
| 06 | Moderation, Reporting, and Admin | Pending | Implement safety foundation before real anonymous posting. | `TRUST_AND_SAFETY.md`, `LEGAL_POLICY_REQUIREMENTS.md`, `BETA_READINESS_CHECKLIST.md`, `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`, `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`, `MOBILE_APP_STRATEGY.md` | Report flow, moderation queue, admin actions, emergency escalation, and audit/security events exist. | Must precede real anonymous posting and beta UGC. | Design admin/moderation slice before enabling posting. |
| 11 | Native Mobile Client | Future | Add a native phone app after the core web loop, access model, and moderation foundations are validated. | `MOBILE_APP_STRATEGY.md`, `TECHNICAL_ARCHITECTURE.md`, `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md` | Mobile implementation begins only after core backend, auth, authorization, verification, and community rules are stable enough to reuse. | Web MVP and private-beta product loop are not validated yet. | Keep current implementation web-first while avoiding web-only architecture lock-in. |
| 07 | Limited Private Beta | Pending | Invite controlled users and validate product behavior. | `PRIVATE_BETA_OPERATING_PLAN.md`, `BETA_READINESS_CHECKLIST.md`, `M0_VALIDATION_OPERATING_PACKET.md` | First beta community selected, first users invited, ambassadors identified, moderation coverage exists, activation/retention/contribution measured. | First community, first 50, policy minimums, verification, moderation, and admin controls not ready. | Continue Epoch 00 validation and policy readiness. |
| 08 | Jumpseat Brief / AI Utility | Deferred | Introduce AI-assisted layover planning after safety and community context are ready. | `TECHNICAL_ARCHITECTURE.md`, `TRUST_AND_SAFETY.md`, `LEGAL_POLICY_REQUIREMENTS.md`, `DISCOVERY_RESEARCH_REPORT_001.md` | Server-side AI only, structured outputs where practical, no sensitive aviation/security output, no AI final moderation or verification decisions, user feedback supports usefulness. | AI is not core wedge and needs safety gates plus user evidence. | Defer until core utility and safety foundation exist. |
| 09 | Monetization / Deals Layer | Deferred | Add crew-friendly deals and monetization only after user value is proven. | `MONETIZATION.md`, `LEGAL_POLICY_REQUIREMENTS.md`, `FEATURE_ROADMAP.md` | Sponsored/affiliate disclosure path exists, admin vendor review exists, no full marketplace payments unless approved, user demand supports deals. | User value and trust not proven yet. | Defer monetization beyond validation/core MVP. |
| 10 | Public Launch Readiness | Future | Prepare for broader public launch. | `BETA_READINESS_CHECKLIST.md`, `LEGAL_POLICY_REQUIREMENTS.md`, `TRUST_AND_SAFETY.md`, `DEPLOYMENT_RECORD_001.md` | Legal/name decision made, terms/privacy/community guidelines ready, security/accessibility review complete, beta evidence supports launch, no unresolved P0/P1 risks. | Private beta has not started; legal/name decision and policy set are incomplete. | Revisit after successful private beta evidence. |

## 5. Required Epochs

### Epoch 00 - Discovery & Problem/Solution Validation

Status: active / partially complete.

Purpose:

- Validate the problem.
- Validate target audience.
- Validate product wedge.
- Validate trust and safety concerns.
- Validate first beta community.

Primary docs:

- `DISCOVERY_RESEARCH_PLAN.md`
- `DISCOVERY_RESEARCH_REPORT_001.md`
- `PROBLEM_SOLUTION_VALIDATION_MATRIX.md`
- `M0_VALIDATION_OPERATING_PACKET.md`
- `PRODUCT_DELIVERY_OPERATING_MODEL.md`

Current truth:

- Desk research supports continuing.
- Strongest wedge is Base Boards + Layover Boards + verified anonymous rooms.
- FA expert interview is pending.
- Real user interviews are pending.
- Trusted aviation contact feedback is pending.

Exit criteria:

- FA expert interview completed and recorded.
- At least 3-5 trusted aviation contacts review the live site.
- Initial feedback captured.
- Validation matrix updated.
- No major trust/safety contradiction discovered.

### Epoch 01 - Public Splash + Waitlist

Status: complete / live.

Purpose:

- Make the concept publicly viewable.
- Capture waitlist interest.
- Support validation and outreach.

Primary docs:

- `APP_FOUNDATION_NOTES.md`
- `LANDING_PAGE_WAITLIST_PLAN.md`
- `DEPLOYMENT_AND_WAITLIST_READINESS.md`
- `DEPLOYMENT_RECORD_001.md`

Current truth:

- Live production URL: https://jmpseat.vercel.app.
- Tally URL: https://tally.so/r/jav6aa.
- CTA is wired through `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- `/app` remains placeholder only.
- The near-term product remains web-first; native mobile is a later client, not a current implementation target.

Complete:

- M1A public splash/waitlist app foundation.
- Production deployment record.
- External waitlist CTA configuration.

Pending:

- Submit and verify a non-sensitive Tally test response.
- Review mobile UX.
- Record first trusted-contact feedback.

Tracked visual backlog:

- **Replace prior cinematic/globe public waitlist direction with simpler premium static `jmpseat.` waitlist**
  - Status: approved replacement direction.
  - Reason: the older cinematic/globe/terrain public waitlist concept is canceled. The public route should now prioritize a simpler premium static waitlist page with clearer conversion and less implementation risk.
  - Target: the production public `/` route.
  - Requirements:
    - Mobile-first static page.
    - Dark premium aviation styling.
    - External waitlist handoff remains intact.
    - No 3D, globe, WebGL, cinematic scroll sequence, or transformation choreography.
    - Must preserve accessibility, privacy-safe waitlist copy, and the public/private route boundary.
    - Must not add auth, database, API persistence, verification, community features, AI, payments, or other product features as part of the redesign.
  - Operating rule: this public redesign remains separate from Epoch 03/auth and from the private `/app` shell.

Exit criteria:

- Production loads.
- CTA opens Tally.
- Fallback removed.
- Tally test response submitted and verified.
- Mobile page reviewed.

### Epoch 02 - Private App Foundation

Status: pending.

Purpose:

- Create private app shell behind the splash page.
- Keep private app inaccessible until beta gates are ready.

Primary docs:

- `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `NAMING_AND_INFORMATION_ARCHITECTURE.md`
- `MILESTONE_EXECUTION_PLAN.md`
- `TECHNICAL_ARCHITECTURE.md`

Exit criteria:

- Private app shell exists.
- Route structure defined.
- No unauthorized access.
- No real community functionality yet.

Blockers:

- Explicit approval required.
- M0 validation signal preferred first.

### Epoch 03 - Auth, Profiles, and Beta Access

Status: complete.

Purpose:

- Establish login, profile, invite-only beta access, and access gates.

Primary docs:

- `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `DATA_MODEL.md`
- `TECHNICAL_ARCHITECTURE.md`
- `BETA_READINESS_CHECKLIST.md`
- `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`
- `MOBILE_APP_STRATEGY.md`

Exit criteria:

- Auth implemented.
- Beta access state exists.
- Invited users can enter.
- Non-invited users are blocked.
- Auth remains separate from aviation verification.
- Auth, profile, beta-access, authorization, pagination, indexing, and private-data handling choices remain scale-ready for tens of thousands of registered users without unnecessary overengineering.
- Auth, account-state, authorization, and data-access choices avoid web-only assumptions that would block a future native mobile client.

### Epoch 04 - Worker Verification Foundation

Status: complete.

Purpose:

- implement worker-verification foundation and review workflow
- support initial approved methods: airline work-email verification where available and redacted badge/proof upload with human review
- produce approved worker claims that later room and private-area authorization can use
- preserve privacy, auditability, and retention/deletion controls while avoiding legally risky verification behavior

Primary docs:

- `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `LEGAL_POLICY_REQUIREMENTS.md`
- `TRUST_AND_SAFETY.md`
- `DATA_MODEL.md`
- `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`
- `VERIFICATION_METHOD_DECISION.md`
- `epochs/epoch-04-worker-verification-foundation-tickets.md`
- `epochs/epoch-04-exit-report.md`

Exit criteria:

- Verification state machine exists.
- Work-email verification request flow exists.
- Approved-domain review path exists.
- Redacted proof upload/storage exists with private bucket controls.
- Controlled reviewer proof viewing exists.
- Proof retention/deletion cleanup helper and protected cleanup routes exist.
- AI cannot approve verification.
- Approved email-domain verification, redacted badge/proof review, claim issuance, and raw-proof retention/deletion rules are defined and implemented for the chosen verification slice.

Delivered workflow slice:

- email-domain verification for approved airline/employer domains
- redacted badge/proof upload
- private storage and controlled reviewer access
- human review
- approved claims for airline-worker and airline where supported by the current bounded paths
- retention and deletion controls for raw proof

Explicit prohibitions:

- no employer-system lookup unless explicit written authorization exists
- no AI final approval
- no scraping private airline systems or private groups
- no employee database lookup

Important follow-up preserved for later ops/brand work:

- customize Supabase auth email templates for jmpseat branding
- configure custom SMTP/domain sender so confirmation and reset emails do not look third-party
- add approved-domain operator tooling
- add reviewer-scope operator tooling
- add cleanup monitoring and alerting
- finalize production privacy/legal copy

### Epoch 05 - Operator/Admin Tooling Foundation

Status: active.

Purpose:

- Make verification operations manageable without manual SQL before community rollout.
- Reduce operational risk around approved domains, reviewer scopes, cleanup monitoring, and audit inspection.

Primary docs:

- `epochs/epoch-05-operator-admin-tooling-tickets.md`
- `epochs/e05-operator-access-model-decision.md`
- `epochs/e05-admin-shell-navigation-foundation.md`
- `epochs/e05-operator-grants-foundation.md`
- `ops/operator-grants-bootstrap-runtime-pass.md`
- `epochs/epoch-04-exit-report.md`
- `ops/proof-retention-cleanup-operator-runbook.md`
- `ops/proof-retention-cleanup-scheduler-compatibility.md`
- `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`
- `MOBILE_APP_STRATEGY.md`

Exit criteria:

- Approved-domain management has a bounded operator path.
- Reviewer-scope management has a bounded operator path.
- Cleanup monitoring and failure inspection exist.
- Audit/security-event inspection exists for verification operations.
- Operator actions remain authorized, logged, and separate from user-facing community features.

### Epoch 05B - Community Structure

Status: pending.

Purpose:

- Implement Base Boards, Layover Boards, and verified/role rooms structurally.

Primary docs:

- `MVP_SCOPE.md`
- `BUILD_TICKETS.md`
- `FEATURE_ROADMAP.md`
- `DISCOVERY_RESEARCH_REPORT_001.md`
- `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`

Exit criteria:

- Board/room structures exist.
- Content may be seeded/read-only first.
- No real anonymous posting until moderation/admin gates are complete.
- Pagination, indexing, filtering, and access-control plans exist before boards/rooms become real user-facing data surfaces.

Blockers:

- Operator/admin tooling or production trust basics should be acceptable before real member access.
- Moderation/admin readiness still gates real anonymous posting.

### Epoch 06 - Moderation, Reporting, and Admin

Status: pending.

Purpose:

- Implement safety foundation before real anonymous posting.

Primary docs:

- `TRUST_AND_SAFETY.md`
- `LEGAL_POLICY_REQUIREMENTS.md`
- `BETA_READINESS_CHECKLIST.md`
- `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`

Exit criteria:

- Report flow exists.
- Moderation queue exists.
- Admin actions exist.
- Emergency escalation path exists.
- Audit/security events exist.
- Moderation/admin data structures are auditable and designed for queue growth rather than single-admin manual state only.

### Epoch 07 - Limited Private Beta

Status: pending.

Purpose:

- Invite controlled users and validate product behavior.

Primary docs:

- `PRIVATE_BETA_OPERATING_PLAN.md`
- `BETA_READINESS_CHECKLIST.md`
- `M0_VALIDATION_OPERATING_PACKET.md`

Exit criteria:

- First beta community selected.
- First users invited.
- Ambassadors identified.
- Moderation coverage exists.
- Activation, retention, and contribution measured.

### Epoch 08 - Jumpseat Brief / AI Utility

Status: deferred.

Purpose:

- Introduce AI-assisted layover planning only after safety and community context are ready.

Primary docs:

- `TECHNICAL_ARCHITECTURE.md`
- `TRUST_AND_SAFETY.md`
- `LEGAL_POLICY_REQUIREMENTS.md`
- `DISCOVERY_RESEARCH_REPORT_001.md`

Exit criteria:

- Server-side AI only.
- Structured outputs where practical.
- No sensitive aviation/security output.
- No AI final moderation or verification decisions.
- User feedback supports usefulness.

### Epoch 09 - Monetization / Deals Layer

Status: deferred.

Purpose:

- Add crew-friendly deals and monetization only after user value is proven.

Primary docs:

- `MONETIZATION.md`
- `LEGAL_POLICY_REQUIREMENTS.md`
- `FEATURE_ROADMAP.md`

Exit criteria:

- Sponsored/affiliate disclosure path exists.
- Admin vendor review exists.
- No full marketplace payments unless explicitly approved.
- User demand supports deals.

### Epoch 10 - Public Launch Readiness

Status: future.

Purpose:

- Prepare for broader public launch.

Primary docs:

- `BETA_READINESS_CHECKLIST.md`
- `LEGAL_POLICY_REQUIREMENTS.md`
- `TRUST_AND_SAFETY.md`
- `DEPLOYMENT_RECORD_001.md`

Exit criteria:

- Legal/name decision made.
- Terms, privacy policy, and community guidelines ready.
- Security/accessibility review complete.
- Beta evidence supports launch.
- No unresolved P0/P1 risks.

## 6. Dependency Map

- Epoch 00 informs all later epochs.
- Epoch 01 supports Epoch 00 validation.
- Epoch 02 may start only with explicit approval.
- Epoch 03 must precede verification and community access.
- Epoch 04 must precede verified-only experiences.
- Epoch 05 operator/admin tooling is recommended before claim-gated community surfaces.
- Epoch 06 must precede real anonymous posting.
- Epoch 07 must not start until beta gates are met.
- Epoch 08 and Epoch 09 are deferred until core value is proven.

## 7. Current Recommended Next Actions

- Use `epochs/epoch-05-operator-admin-tooling-tickets.md` as the Epoch 05 source of truth.
- Use `epochs/e05-operator-access-model-decision.md` as the operator authorization source of truth before implementation.
- Define approved-domain operator management.
- Define reviewer-scope operator management.
- Define cleanup monitoring, failure inspection, and alerting.
- Continue product validation outreach in parallel:
  - submit and verify a Tally test response if not already recorded
  - review the live site on mobile
  - send the live site to 3-5 trusted aviation contacts
  - conduct the FA expert interview when available
  - capture feedback and update `PROBLEM_SOLUTION_VALIDATION_MATRIX.md`

## 8. Codex Workflow Rules by Epoch

- Every task must declare its epoch.
- Use one branch per bounded slice.
- Plan/Goals are required for multi-step tasks.
- No app feature work without explicit approval.
- No app feature work without scoped branch, acceptance criteria, and proof.
- Final reports must include branch, commit, files changed, checks run, and scope confirmation.
- No merge to `main` without review.
- V1 scope exclusions remain in force unless a later reviewed epoch explicitly reopens them.

## 9. What Must Not Be Built Yet

- Real anonymous posting.
- Crew Rooms functionality beyond explicitly scoped claim-gated structure.
- Base Boards functionality beyond explicitly scoped claim-gated structure.
- Layover Boards functionality beyond explicitly scoped claim-gated structure.
- AI product features or AI verification approval.
- Payments.
- Marketplace.
- Nearby crew tracking.
- Schedule import.
- Airline portal login.
- Employer-system lookup.
- Non-rev load requests.
- Dating/swiping.

## 10. Roadmap Maintenance Rules

- Update this roadmap when an epoch starts, completes, or changes status.
- Do not let older "Recommended Next Task" sections override this roadmap.
- Detailed docs remain source-of-truth for their domain.
- This roadmap controls sequencing.
- If roadmap and older docs conflict, pause and update the roadmap or the stale source doc before implementation.

## 11. Recommended Next Codex Task

Recommended next task: `feat: implement E05-T02 admin shell and navigation foundation`.

Use Plan/Goals: yes.

If production readiness is prioritized first, use: `docs: define production trust legal ops plan`.

Do not start claim-gated community work as the immediate next task unless explicitly approved.
