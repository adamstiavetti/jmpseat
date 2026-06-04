# Milestone Execution Plan

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This is a documentation-only execution plan. It does not scaffold app code, create framework files, create package files, or expand V1 scope.

## 1. Purpose

This document converts the existing planning artifacts into a practical execution sequence for jmpseat's MVP and private beta.

The plan connects product tickets, beta readiness gates, and private beta operating decisions into milestones that a founder, engineer, designer, and future Codex session can use to move from planning to implementation.

Estimates are planning estimates, not commitments. They assume one small team working in bounded branches with review between milestones.

## 2. Source Documents

This plan is based on:

- [README.md](../README.md)
- [BUILD_TICKETS.md](BUILD_TICKETS.md)
- [BETA_READINESS_CHECKLIST.md](BETA_READINESS_CHECKLIST.md)
- [PRIVATE_BETA_OPERATING_PLAN.md](PRIVATE_BETA_OPERATING_PLAN.md)
- [MVP_SCOPE.md](MVP_SCOPE.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [TRUST_AND_SAFETY.md](TRUST_AND_SAFETY.md)
- [DATA_MODEL.md](DATA_MODEL.md)
- [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md)
- [LEGAL_POLICY_REQUIREMENTS.md](LEGAL_POLICY_REQUIREMENTS.md)

Primary inputs:

- `BUILD_TICKETS.md` defines the ticket inventory and implementation slices.
- `BETA_READINESS_CHECKLIST.md` defines launch gates and blockers.
- `PRIVATE_BETA_OPERATING_PLAN.md` defines how the first controlled beta should be seeded and operated.
- `LEGAL_POLICY_REQUIREMENTS.md` defines minimum private-beta and public-launch policy gates, legal/trademark questions, verification consent, AI notice, vendor disclosure, and incident response requirements.

## 3. Execution Principles

- Use small branches.
- Work one milestone at a time.
- Commit each bounded slice.
- Do not start app-code work without explicit approval.
- Security, privacy, moderation, authorization, and accessibility are not afterthoughts.
- No merge to `main` without explicit review.
- Do not build V1-excluded features.
- Keep verification private, public identity flexible, and internal accountability enforceable.
- Build utility surfaces before social-feed mechanics.
- Treat aviation-sensitive safety rules as product requirements, not policy copy.

V1 exclusions remain:

- No airline portal login.
- No schedule scraping.
- No public nearby crew tracking.
- No dating/swiping.
- No exact public crew hotel exposure.
- No flight-load request infrastructure.
- No native mobile in V1.
- No full marketplace payments in V1.
- No advanced employment/payroll verification API dependency in V1.
- No roster/calendar integrations in V1.

## 4. Milestone Overview

| Milestone ID | Name | Goal | Ticket IDs Covered | Estimate | Risk | Exit Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| M0 | Product Validation and Legal/Policy Prep | Resolve beta operating and policy decisions before implementation | DHC-001 to DHC-006, DHC-030 to DHC-031 | 3-5 days | High | First beta community, first 50 plan, minimum private-beta policy set, policy owners, and legal/trademark path documented |
| M1 | App Foundation | Create the approved app foundation only after explicit approval | DHC-007, DHC-006, DHC-032, DHC-033 | 3-5 days | Medium | App runs locally with TypeScript strict, linting, CI/security baseline, and accessibility baseline |
| M2 | Auth, Profiles, and Authorization | Establish identity, profile, and access-control foundation | DHC-008 to DHC-011 | 4-7 days | High | Auth, profile model, central authorization helpers, and RLS/server-side authorization plan are tested |
| M3 | Verification System | Build private verification and admin review | DHC-010, DHC-012 to DHC-014, DHC-029 | 5-8 days | High | Work email/manual verification, artifact handling, retention/deletion, and admin review work without AI approval |
| M4 | Community Core | Build the utility community surfaces | DHC-015 to DHC-020 | 7-12 days | Medium | Crew Rooms, Base Boards, Layover Boards, posts, comments, saves, and search are usable with permissions |
| M5 | Moderation and Safety | Make anonymous participation governable | DHC-003, DHC-021 to DHC-024 | 5-8 days | High | Reporting, moderation queue, risk flags, takedown, appeal, emergency escalation, and safety restrictions work |
| M6 | Jumpseat Brief MVP | Add constrained AI layover planning | DHC-005, DHC-025 to DHC-026 | 4-7 days | High | Server-side AI, structured output, safety filters, logs, and limited/demo beta mode are ready |
| M7 | Deals Directory MVP | Add controlled crew-friendly deals | DHC-027 to DHC-028 | 3-5 days | Medium | Basic deals directory works with admin review and no marketplace payments |
| M8 | Admin Console | Consolidate admin operations | DHC-014, DHC-023, DHC-029, DHC-031 | 5-8 days | High | Admin can review verification, moderation, trust states, audit/security events, and beta operations |
| M9 | Private Beta Readiness | Prove beta can launch safely | DHC-030, DHC-032, DHC-033 plus beta checklist and legal/policy gates | 3-6 days | High | Beta checklist, minimum private-beta policy set, seed content, first 50 users, moderation coverage, reviews, and rollback plan are complete |

## 5. Required Milestones

### M0 - Product Validation and Legal/Policy Prep

Goal: resolve the non-code decisions that block private beta.

Scope:

- Landing page/waitlist planning.
- First beta community decision.
- First 50 user plan.
- Ambassador plan.
- Trademark/legal path.
- Minimum private-beta policy set from `LEGAL_POLICY_REQUIREMENTS.md`: beta participation terms, privacy notice, community rules, verification consent language, AI use notice if AI is enabled, no-official-affiliation disclaimer, emergency/safety escalation process, and working-name status note.
- Public-launch policy owner path for full terms, full privacy policy, community guidelines, moderation rules, appeal process, vendor/sponsored-content rules, deletion/export process, incident response, and trademark/name clearance decision.

Ticket coverage:

- DHC-001: Research Review and PRD Lock.
- DHC-002: Verification Policy.
- DHC-003: Content and Safety Policy.
- DHC-004: Room and Board Taxonomy.
- DHC-005: AI Safety Requirements.
- DHC-006: Engineering Standards and Release Gates.
- DHC-030: Beta QA Checklist.
- DHC-031: Founder/Admin Operating Guide.

Exit criteria:

- Target first base/community is selected.
- First 50 beta user profile is finalized.
- Ambassador roster target is documented.
- Legal/trademark clearance path is assigned.
- Minimum private-beta policy set owner and reviewer are assigned.
- Terms/privacy/community guideline, verification consent, AI notice, incident response, vendor disclosure, and trademark/name-clearance owners are assigned.
- Verification retention decision is drafted for legal/privacy review.
- Landing page/waitlist plan is written if beta recruitment needs it.

### M1 - App Foundation

Goal: create the technical foundation only after explicit approval to begin app-code work.

Scope:

- App scaffold.
- TypeScript strict mode.
- Linting/formatting.
- Environment config pattern.
- CI/security baseline.
- Accessibility baseline.

Ticket coverage:

- DHC-007: App Scaffold.
- DHC-006: Engineering Standards and Release Gates.
- DHC-032: Accessibility Review.
- DHC-033: Security Review.

Exit criteria:

- App runs locally.
- TypeScript strict mode is enabled.
- Lint/format commands exist.
- Environment config pattern is documented.
- CI checks are planned or active.
- No product features bypass the architecture docs.

### M2 - Auth, Profiles, and Authorization

Goal: establish the identity and access-control foundation before any community features.

Scope:

- Auth foundation.
- User/profile model.
- Role/base/airline profile.
- Centralized authorization helpers.
- RLS/server-side authorization plan.

Ticket coverage:

- DHC-008: Auth Foundation.
- DHC-009: User/Profile Model.
- DHC-011: Authorization Baseline.

Exit criteria:

- Users can sign up, verify email, log in, and log out.
- Profiles separate private identity from public handle.
- Airline, role, and base profile data is captured.
- Account states are enforced.
- RLS and server-side authorization test matrix is defined.
- Authorization helpers exist for account status, room access, admin actions, and anonymous posting eligibility.

### M3 - Verification System

Goal: allow private aviation-worker verification before real anonymous participation.

Scope:

- Verification model.
- Admin review queue.
- Manual verification workflow.
- Verification artifact handling.
- Retention/deletion controls.
- No AI verification approval.

Ticket coverage:

- DHC-010: Verification Model.
- DHC-012: Verification Submission.
- DHC-013: Private Verification Storage.
- DHC-014: Admin Verification Dashboard.
- DHC-029: Privacy and Retention Controls.

Exit criteria:

- Tier model is represented.
- Work email and manual review paths are supported.
- Admin can approve, reject, or request more information.
- Raw artifacts are private and accessed only through short-lived admin links.
- Retention/deletion policy is operational or manually enforceable for private beta.
- AI has no role in approval.

### M4 - Community Core

Goal: create the core utility community surfaces.

Scope:

- Crew Rooms.
- Base Boards.
- Layover Boards.
- Posts.
- Comments.
- Saves.
- Search.

Ticket coverage:

- DHC-015: Crew Rooms.
- DHC-016: Base Boards.
- DHC-017: Layover Boards.
- DHC-018: Posts and Comments.
- DHC-019: Saves.
- DHC-020: Search.

Exit criteria:

- Verified users can access allowed rooms and boards.
- Anonymous posting is available only where allowed.
- Base and layover intel can be posted and found.
- Search excludes unauthorized, deleted, or removed content.
- Exact public crew hotel exposure is blocked by policy and interface copy.

### M5 - Moderation and Safety

Goal: make anonymous participation governable before broader beta use.

Scope:

- Reports.
- Moderation queue.
- Automated risk flags.
- Takedown/appeal workflow.
- Emergency escalation.
- Aviation-sensitive content restrictions.

Ticket coverage:

- DHC-003: Content and Safety Policy.
- DHC-021: Reporting.
- DHC-022: Automated Risk Flags.
- DHC-023: Moderation Queue.
- DHC-024: Strike and Appeal Workflow.

Exit criteria:

- Users can report posts, comments, users/profiles, and deals/vendors where relevant.
- Admins can remove, warn, restrict, suspend, dismiss, or escalate.
- Automated risk flags do not make final bans.
- Emergency escalation category exists.
- Passenger private information, airport security procedures, live operations-sensitive information, confidential documents, doxxing, harassment, threats, impersonation, exact hotel exposure, and vendor spam are covered.

### M6 - Jumpseat Brief MVP

Goal: add constrained AI layover planning without making AI the brand gimmick or safety authority.

Scope:

- Server-side AI only.
- Structured output.
- Safety filters.
- No sensitive aviation/security output.
- Limited beta mode or demo mode.

Ticket coverage:

- DHC-005: AI Safety Requirements.
- DHC-025: Jumpseat Brief MVP.
- DHC-026: AI Brief Save and Audit.

Exit criteria:

- API keys are server-side only.
- Retrieved community content is treated as untrusted.
- Structured outputs are used where practical.
- Deterministic banned-category checks exist outside the model.
- AI cannot auto-post, verify users, ban users, or expose sensitive/private data.
- Private beta mode is either live-limited or demo-only, based on safety readiness.

### M7 - Deals Directory MVP

Goal: add useful perks and discounts without creating an unmoderated marketplace.

Scope:

- Basic crew-friendly deals directory.
- Vendor listing review.
- No full marketplace payments.
- No unmoderated vendor spam.

Ticket coverage:

- DHC-027: NonRev Deals Directory.
- DHC-028: Vendor Review Workflow.

Exit criteria:

- Deals are admin-created or admin-reviewed.
- Sponsored and affiliate status is clear.
- Vendors cannot publish without review.
- No payments, booking, or marketplace workflow exists in V1.

### M8 - Admin Console

Goal: give admins one reliable operating surface for verification, moderation, and trust.

Scope:

- Admin verification dashboard.
- Moderation dashboard.
- User trust state controls.
- Audit/security event review.

Ticket coverage:

- DHC-014: Admin Verification Dashboard.
- DHC-023: Moderation Queue.
- DHC-029: Privacy and Retention Controls.
- DHC-031: Founder/Admin Operating Guide.

Exit criteria:

- Admin can review verification submissions.
- Admin can review reports and risk flags.
- Admin can view relevant trust state.
- Admin actions are logged.
- Verification artifact access is logged.
- Founder/admin operating guide is usable during private beta.

### M9 - Private Beta Readiness

Goal: prove the private beta can launch safely and usefully.

Scope:

- Beta checklist.
- Minimum private-beta policy set from `LEGAL_POLICY_REQUIREMENTS.md`.
- Seed content.
- First 50 users.
- Moderation coverage.
- Security/privacy/accessibility review.
- Rollback plan.

Ticket coverage:

- DHC-030: Beta QA Checklist.
- DHC-032: Accessibility Review.
- DHC-033: Security Review.
- Private beta operating plan.
- Beta readiness checklist.

Exit criteria:

- First beta community is selected.
- First 50 list is approved.
- Ambassador targets are confirmed.
- Beta participation terms, privacy notice, community rules, verification consent language, AI use notice if AI is live, no-affiliation disclaimer, emergency/safety escalation process, and working-name status note are ready for beta use.
- Seed content exists for Crew Rooms, Base Boards, Layover Boards, safety pins, onboarding, and Jumpseat Brief examples.
- Moderation coverage and emergency owner are assigned.
- Security, privacy, accessibility, RLS/access-control, and AI safety reviews are complete.
- Rollback plan is documented.
- Do-not-launch blockers are cleared or explicitly accepted by owner.

## 6. Dependency Map

Strict dependency order:

1. M0 Product Validation and Legal/Policy Prep.
2. M1 App Foundation.
3. M2 Auth, Profiles, and Authorization.
4. M3 Verification System.
5. M5 Moderation and Safety.
6. M4 Community Core.
7. M6 Jumpseat Brief MVP.
8. M7 Deals Directory MVP.
9. M8 Admin Console.
10. M9 Private Beta Readiness.

Dependency rules:

- M1 cannot begin without explicit approval to create app code.
- M2 must come before M3, M4, M5, M6, M7, and M8 because identity and authorization are the security boundary.
- M3 verification must exist before real users can participate as verified members.
- M5 moderation must exist before real anonymous posting is enabled.
- M4 community features must not launch to real users until M2, M3, and M5 are functional.
- M6 AI must not launch live until M2 authorization, M4 content boundaries, and M5 safety rules are in place.
- M7 deals can be built after authorization and moderation, but it must not introduce payments or self-serve vendor publishing.
- M8 admin console can be developed incrementally, but beta cannot launch without admin verification and moderation surfaces.
- M9 beta readiness is a launch gate, not a feature milestone.

## 7. Risk Register

| Risk | Severity | Why It Matters | Mitigation |
| --- | --- | --- | --- |
| Weak user validation | High | Building before real aviation-worker pull is proven wastes time | Complete M0, pick one base, recruit first 50 manually |
| Empty community | High | Utility requires enough seeded and member-generated knowledge | Seed content before Wave 1 and use ambassadors |
| Verification friction | High | Users may abandon if verification feels risky or unclear | Offer work email and manual alternatives; disclose caveats |
| Anonymous discussion toxicity | High | Anonymity can create harassment, doxxing, or low-quality behavior | Require internal accountability, reports, strikes, and admin review |
| Aviation-sensitive content exposure | High | Passenger data, hotels, security, or live ops can create serious harm | Banned categories, risk flags, emergency escalation, takedowns |
| Broken access control | Critical | Private identity, verification, admin, and anonymous posting depend on authorization | RLS plus server-side checks and access-control tests |
| Verification document mishandling | Critical | Uploads may contain sensitive personal or employment information | Private storage, validation, short-lived links, logging, deletion |
| AI unsafe output | High | AI could reveal sensitive info or overstate authority | Server-side only, structured outputs, deterministic checks, human review |
| Scope creep into schedule/non-rev/location features | High | Pulls product into risky competitor territory and expands privacy risk | Enforce V1 exclusions at every milestone |
| Legal/trademark uncertainty | Medium | Name and policy gaps can block broader launch | Keep working-name caveat; assign legal/trademark path in M0 |

## 8. Beta Acceptance Dependencies

Private beta blockers:

- Product Scope Gate: M0, M1 through M9.
- Legal/Policy Gate: M0, M9.
- Verification Gate: M2, M3, M8.
- Privacy Gate: M2, M3, M8, M9.
- Aviation Safety Gate: M0, M5, M9.
- Moderation Gate: M5, M8, M9.
- AI Safety Gate: M6, M9 if Jumpseat Brief is live.
- Security Gate: M1, M2, M3, M8, M9.
- Upload Security Gate: M3, M9 if manual uploads are enabled.
- Accessibility Gate: M1, M9.
- Data Model Gate: M2, M3, M4, M5, M6, M7, M8.
- Monetization Gate: M7, M9 if deals are included.
- Beta Launch Gate: M9.

Public launch blockers:

- Terms of service finalized.
- Privacy policy finalized.
- Community guidelines finalized.
- Moderation rules and appeal process operational.
- Vendor/sponsored content rules finalized if monetization is active.
- Data deletion/export process operational.
- Incident response process finalized.
- Trademark/name clearance decision documented before public launch under the working name.
- Legal/trademark path advanced without claiming clearance unless confirmed.
- Security review complete with no unaccepted high/critical findings.
- Accessibility review complete with known issues triaged.
- Retention/deletion and export support paths tested.
- Sponsored deal/vendor removal policy finalized if monetization is active.

## 9. Recommended Build Order

Strict recommended order:

1. Complete M0 Product Validation and Legal/Policy Prep.
2. Start M1 App Foundation only after explicit approval to create app code.
3. Complete M2 Auth, Profiles, and Authorization.
4. Complete M3 Verification System.
5. Complete M5 Moderation and Safety.
6. Complete M4 Community Core.
7. Complete M6 Jumpseat Brief MVP in limited or demo beta mode.
8. Complete M7 Deals Directory MVP.
9. Complete M8 Admin Console.
10. Complete M9 Private Beta Readiness.

Rationale:

- The first app-code milestone must be M1 - App Foundation.
- Community features must not be built before auth and authorization foundations.
- Real anonymous posting must not launch before verification, authorization, and moderation exist.
- AI must not launch live before community source boundaries and safety filters exist.
- Deals must not become a marketplace or payment surface in V1.

## 10. Codex Workflow Rules

- Every implementation milestone should be its own branch.
- Every Codex task should start with repo state inspection: `pwd`, branch, `git status --short`, recent log, and relevant file tree.
- Codex should use Plan/Goals for multi-step work.
- Final reports must include branch, commits, files changed, checks run, and proof.
- No merge to `main` without explicit review.
- Do not scaffold app code unless the user explicitly approves an implementation task.
- Do not create package files, framework files, database migrations, API routes, UI files, or implementation files during documentation-only tasks.
- If a task touches security, privacy, verification, moderation, or AI, include a risk summary in the final report.

## 11. Next Three Codex Tasks

1. Execute M0 validation/no-code waitlist preparation.
   - Use Plan/Goals: yes.
   - Output: waitlist tool decision, finalized privacy-safe form fields, outreach list, interview script, ambassador screening flow, and data handling owner.
   - Purpose: validate concentrated demand and first-base/community readiness before app-code work.

2. Create a counsel/security review packet.
   - Use Plan/Goals: yes.
   - Output: summarized open questions for trademark/name clearance, privacy, verification consent, manual upload handling, AI notice, incident response, and vendor disclosure.
   - Purpose: prepare qualified review before private beta.

3. Start M1 App Foundation only if explicitly approved.
   - Use Plan/Goals: yes.
   - Output: app scaffold branch, if approved.
   - Purpose: create the minimal app foundation with TypeScript strict mode, linting, environment pattern, CI/security baseline, and no product shortcuts.

The first recommended task remains documentation/planning unless the user explicitly approves app-code work.
