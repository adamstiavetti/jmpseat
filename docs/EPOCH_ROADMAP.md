# Epoch Roadmap

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This roadmap does not claim legal or trademark clearance.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

Deadhead Club is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Purpose

This roadmap organizes the existing Deadhead Club planning library into execution epochs. It is the sequencing spine for future founder, product, engineering, design, policy, and Codex work.

Detailed docs remain the source of truth for their domains. This roadmap summarizes controlling decisions, exit criteria, blockers, and next actions without duplicating every detail.

Future Codex tasks must declare which epoch they belong to. Work that does not map to an epoch should be treated as a scope question before implementation begins.

## 2. Current Project State

- Live production site exists: https://deadheadclub.vercel.app.
- Tally waitlist exists: https://tally.so/r/jav6aa.
- Public splash page exists at `/`.
- `/app` private beta placeholder exists.
- Waitlist CTA is wired through `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- No auth, database, Supabase, API persistence, community functionality, AI, payments, analytics SDK, or internal waitlist capture exists.
- Discovery is desk-researched, not fully user-validated.
- FA expert interview remains pending.
- First trusted aviation contact outreach remains pending.
- Current production deployment is recorded in `DEPLOYMENT_RECORD_001.md`.

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
| 03 | Auth, Profiles, and Beta Access | Pending | Establish login, profile, invite-only beta access, and access gates. | `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`, `DATA_MODEL.md`, `TECHNICAL_ARCHITECTURE.md`, `BETA_READINESS_CHECKLIST.md` | Auth implemented, beta access state exists, invited users can enter, non-invited users are blocked, auth remains separate from aviation verification. | Backend/Auth ADR and explicit implementation approval required. | Prepare Supabase/Auth ADR only if Epoch 02 is approved. |
| 04 | Verification System | Pending | Implement aviation verification state and review workflow. | `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`, `LEGAL_POLICY_REQUIREMENTS.md`, `TRUST_AND_SAFETY.md`, `DATA_MODEL.md` | Verification state machine exists, non-upload manual review supported first, upload flow blocked until controls exist, AI cannot approve verification. | Verification consent, artifact retention, and upload acceptability decisions remain open. | Resolve non-upload manual verification flow before upload design. |
| 05 | Community Structure | Pending | Implement Base Boards, Layover Boards, and verified/role rooms structurally. | `MVP_SCOPE.md`, `BUILD_TICKETS.md`, `FEATURE_ROADMAP.md`, `DISCOVERY_RESEARCH_REPORT_001.md` | Board/room structures exist, content can be seeded/read-only first, no real anonymous posting until moderation/admin gates are complete. | Requires auth/access and verification state before real member access. | Wait until Epochs 03-04 are underway. |
| 06 | Moderation, Reporting, and Admin | Pending | Implement safety foundation before real anonymous posting. | `TRUST_AND_SAFETY.md`, `LEGAL_POLICY_REQUIREMENTS.md`, `BETA_READINESS_CHECKLIST.md`, `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md` | Report flow, moderation queue, admin actions, emergency escalation, and audit/security events exist. | Must precede real anonymous posting and beta UGC. | Design admin/moderation slice before enabling posting. |
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

- Live production URL: https://deadheadclub.vercel.app.
- Tally URL: https://tally.so/r/jav6aa.
- CTA is wired through `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- `/app` remains placeholder only.

Complete:

- M1A public splash/waitlist app foundation.
- Production deployment record.
- External waitlist CTA configuration.

Pending:

- Submit and verify a non-sensitive Tally test response.
- Review mobile UX.
- Record first trusted-contact feedback.

Tracked visual backlog:

- **Redesign public waitlist page into premium 3JS Airside Access journey**
  - Status: deferred / tracked / not blocking validation.
  - Reason: the current live waitlist page is acceptable for validation and outreach, but it is not the final visual experience. Prior Three.js/WebGL attempts were useful technical and creative spikes, but did not meet the top-tier visual bar for a future public-facing brand experience.
  - Target: future Epoch 01 continuation or a dedicated visual redesign epoch before broader public launch.
  - Requirements:
    - Mobile-first vertical scroll journey.
    - Three.js/WebGL-led experience.
    - Inspired by high-end immersive sites such as Lando Norris and igloo-style brand experiences.
    - Strong airport, airline, and airside visual identity without implying official affiliation.
    - Boarding pass / access card as the iconic hero object.
    - Story path: scattered intel -> system online -> verified access -> privacy boundary -> private beta boarding.
    - Must not look like primitive boxes, subtle background animation, generic SaaS, or low-quality demo geometry.
    - Must preserve waitlist CTA, Tally link, disclaimers, accessibility, and reduced-motion fallback.
    - Must not add auth, database, API persistence, verification, community features, AI, payments, or other product features as part of the visual redesign.
  - Operating rule: this redesign must not block trusted-contact feedback, FA interviews, or waitlist validation. Future implementation requires explicit approval, a dedicated branch, acceptance criteria, checks, screenshots, and preview proof.

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

Status: pending.

Purpose:

- Establish login, profile, invite-only beta access, and access gates.

Primary docs:

- `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `DATA_MODEL.md`
- `TECHNICAL_ARCHITECTURE.md`
- `BETA_READINESS_CHECKLIST.md`

Exit criteria:

- Auth implemented.
- Beta access state exists.
- Invited users can enter.
- Non-invited users are blocked.
- Auth remains separate from aviation verification.

### Epoch 04 - Verification System

Status: pending.

Purpose:

- Implement aviation verification state and review workflow.

Primary docs:

- `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `LEGAL_POLICY_REQUIREMENTS.md`
- `TRUST_AND_SAFETY.md`
- `DATA_MODEL.md`

Exit criteria:

- Verification state machine exists.
- Non-upload manual review supported first.
- Upload flow remains blocked until controls exist.
- AI cannot approve verification.

### Epoch 05 - Community Structure

Status: pending.

Purpose:

- Implement Base Boards, Layover Boards, and verified/role rooms structurally.

Primary docs:

- `MVP_SCOPE.md`
- `BUILD_TICKETS.md`
- `FEATURE_ROADMAP.md`
- `DISCOVERY_RESEARCH_REPORT_001.md`

Exit criteria:

- Board/room structures exist.
- Content may be seeded/read-only first.
- No real anonymous posting until moderation/admin gates are complete.

### Epoch 06 - Moderation, Reporting, and Admin

Status: pending.

Purpose:

- Implement safety foundation before real anonymous posting.

Primary docs:

- `TRUST_AND_SAFETY.md`
- `LEGAL_POLICY_REQUIREMENTS.md`
- `BETA_READINESS_CHECKLIST.md`
- `PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`

Exit criteria:

- Report flow exists.
- Moderation queue exists.
- Admin actions exist.
- Emergency escalation path exists.
- Audit/security events exist.

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
- Epoch 06 must precede real anonymous posting.
- Epoch 07 must not start until beta gates are met.
- Epoch 08 and Epoch 09 are deferred until core value is proven.

## 7. Current Recommended Next Actions

- Submit and verify a Tally test response if not already recorded.
- Review the live site on mobile.
- Send the live site to 3-5 trusted aviation contacts.
- Conduct the FA expert interview when available.
- Capture feedback and update `PROBLEM_SOLUTION_VALIDATION_MATRIX.md`.
- Only then decide whether to proceed to Epoch 02 / M1B private app shell.

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

- Auth.
- Database.
- Supabase.
- Internal waitlist capture.
- Verification uploads.
- Real anonymous posting.
- Crew Rooms functionality.
- Base Boards functionality.
- Layover Boards functionality.
- AI.
- Payments.
- Marketplace.
- Nearby crew tracking.
- Schedule import.
- Airline portal login.
- Non-rev load requests.
- Dating/swiping.

## 10. Roadmap Maintenance Rules

- Update this roadmap when an epoch starts, completes, or changes status.
- Do not let older "Recommended Next Task" sections override this roadmap.
- Detailed docs remain source-of-truth for their domain.
- This roadmap controls sequencing.
- If roadmap and older docs conflict, pause and update the roadmap or the stale source doc before implementation.

## 11. Recommended Next Codex Task

Recommended next task: `docs: record initial trusted-contact feedback after outreach`.

Use Plan/Goals: yes.

If the FA expert interview happens first, use: `docs: update validation matrix after FA expert interview`.

Do not start app feature work as the immediate next task unless explicitly approved.
