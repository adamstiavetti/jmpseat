# Docs Consistency Review

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This review does not claim legal or trademark clearance.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

This is a review-only consistency check across the Deadhead Club planning docs. It compares product scope, beta gates, legal/policy requirements, safety boundaries, technical sequencing, and future build guidance.

This report does not implement corrections, rewrite product docs, create policy documents, scaffold app code, or expand V1 scope. Corrections are listed as proposed follow-up tasks.

## 2. Source Documents Reviewed

| Document | Purpose |
| --- | --- |
| `README.md` | Repo overview, north star, audience, MVP summary, docs index, and repo boundary. |
| `docs/DEADHEAD_CLUB_BLUEPRINT.md` | Full product vision, positioning, capability map, MVP definition, roadmap, safety, monetization, technical summary, and initial build sequence. |
| `docs/MVP_SCOPE.md` | Exact V1 inclusion, exclusion, and MVP acceptance criteria. |
| `docs/FEATURE_ROADMAP.md` | Phase 1 through Phase 4 roadmap and deferred features. |
| `docs/TRUST_AND_SAFETY.md` | Aviation-specific safety rules, identity model, verification tiers, moderation workflow, and AI moderation boundaries. |
| `docs/MONETIZATION.md` | Free/premium/sponsored/affiliate/recruiting/marketplace/crash-pad monetization direction and display-ad rationale. |
| `docs/DATA_MODEL.md` | First-pass implementation-ready entities, relationships, and model boundaries. |
| `docs/TECHNICAL_ARCHITECTURE.md` | MVP stack recommendation, security/privacy/AI/search/payment/deployment guidance, and future coding standards. |
| `docs/COMPETITIVE_POSITIONING.md` | Competitor comparison and Deadhead Club wedge. |
| `docs/BUILD_TICKETS.md` | Initial implementation backlog and ticket-level dependencies. |
| `docs/RESEARCH_NOTES.md` | Public source log supporting competitor, verification, aviation safety, technical, security, and policy recommendations. |
| `docs/BETA_READINESS_CHECKLIST.md` | Concrete pre-beta and pre-public-launch gates. |
| `docs/PRIVATE_BETA_OPERATING_PLAN.md` | Private beta operating model, first community strategy, first 50 users, seed content, moderation, AI, and beta decisions. |
| `docs/MILESTONE_EXECUTION_PLAN.md` | Practical milestone sequence connecting tickets, beta gates, and operating decisions. |
| `docs/LANDING_PAGE_WAITLIST_PLAN.md` | Demand-validation landing page, waitlist, messaging, and no-code validation plan. |
| `docs/LEGAL_POLICY_REQUIREMENTS.md` | Founder/engineering/legal-review checklist for policy artifacts, privacy, verification, AI, moderation, incident response, and trademark requirements. |

## 3. Executive Verdict

The docs are broadly consistent. The core product, V1 scope, V1 exclusions, identity model, aviation safety boundaries, AI boundaries, and monetization posture are repeated consistently across the repo.

App scaffolding is conditionally allowed only as M1 App Foundation after explicit user approval and after the P1 documentation corrections below are made or consciously accepted. Product-feature implementation and private beta launch remain blocked until M0 validation, legal/policy minimums, verification handling, moderation, authorization, and beta readiness gates are resolved.

No reviewed document claims trademark clearance, official airline affiliation, or employer endorsement. No reviewed document intentionally expands V1 into schedule scraping, non-rev loads, dating/swiping, nearby tracking, native mobile, marketplace payments, or roster/calendar integrations.

Main issues found:

- P1: `BUILD_TICKETS.md` sequencing can be read as building posts/comments before moderation/reporting, while `MILESTONE_EXECUTION_PLAN.md` correctly requires moderation before real anonymous posting.
- P1: Data model naming around `Subscription` and `AuditLog` is not fully harmonized across `DATA_MODEL.md` and `BETA_READINESS_CHECKLIST.md`.
- P1: Manual verification upload language is safe overall but could be clearer that private beta may use non-upload manual review if upload controls are not ready.
- P1: Recommended next-task sections in older docs are stale and point to docs that now exist.
- P2: Legal/policy gates added after `MILESTONE_EXECUTION_PLAN.md` are not yet referenced in that milestone plan.

## 4. Consistency Matrix

| Area | Status | Docs involved | Finding | Recommended follow-up |
| --- | --- | --- | --- | --- |
| Product positioning | Consistent | README, Blueprint, MVP Scope, Competitive Positioning, Landing Page Plan | The product is consistently framed as a verified aviation-worker utility community, not generic social media. | None. Preserve phrasing. |
| V1 scope | Consistent | README, MVP Scope, Blueprint, Feature Roadmap, Build Tickets | V1 capabilities align around account creation, verification, profile, rooms/boards, posts/comments/saves/search, Jumpseat Brief, deals directory, moderation, and admin verification. | None. |
| V1 exclusions | Consistent | README, MVP Scope, Roadmap, Technical Architecture, Beta Checklist, Landing Page Plan, Legal Policy | Excluded features are consistently listed: no portal login, scraping, public nearby tracking, dating/swiping, exact public crew hotels, flight-load requests, native mobile, full marketplace payments, employment/payroll API dependency, or roster/calendar integrations. | Minor follow-up: standardize wording between "exact public crew hotel exposure" and "exact public crew hotel database." |
| Verification tiers | Consistent | MVP Scope, Trust and Safety, Blueprint, Beta Checklist, Legal Policy | Tier 0 through Tier 5 are aligned. Tier 5 remains later-stage. | None. |
| Verification upload policy | Minor issue | MVP Scope, Trust and Safety, Beta Checklist, Private Beta Plan, Legal Policy, Technical Architecture | Docs agree uploads require private storage, validation, short-lived links, logging, and deletion. However, MVP language could still be read as requiring badge/document uploads in V1 rather than allowing non-upload manual review for beta. | Clarify that Tier 3 can be satisfied through controlled non-upload manual review in private beta if upload controls are not ready. |
| Verification artifact retention/deletion | Unresolved | Private Beta Plan, Beta Checklist, Legal Policy, Technical Architecture, Data Model | All docs require a retention/deletion policy, but exact retention period remains open. Private Beta proposes immediate deletion after review and no later than 7 days; Legal marks exact period for legal review. | Decide beta retention period with legal/privacy reviewer before accepting uploads. |
| Anonymous identity model | Consistent | README, Blueprint, MVP Scope, Trust and Safety, Legal Policy | "Verified privately. Anonymous publicly. Accountable internally." is preserved and consistently explained. | None. |
| Trust and safety rules | Consistent | Trust and Safety, MVP Scope, Beta Checklist, Private Beta Plan, Legal Policy | Banned categories are aligned and aviation-specific. | None. |
| Aviation-sensitive content | Consistent | Trust and Safety, Blueprint, Beta Checklist, Private Beta Plan, Legal Policy, Technical Architecture | Passenger private information, airport security procedures, live operations-sensitive information, exact crew hotel exposure, and confidential documents are consistently banned or restricted. | None. |
| AI safety boundaries | Minor issue | MVP Scope, Trust and Safety, Technical Architecture, Beta Checklist, Private Beta Plan, Legal Policy | Boundaries align: server-side, structured outputs, no verification approval, no final bans, no auto-posting, no sensitive/security output. Private Beta leans live-limited Jumpseat Brief if ready; Legal recommends considering demo/limited first. | Decide private beta AI mode before Wave 1: live-limited or demo-only. |
| Moderation and appeals | Consistent | Trust and Safety, MVP Scope, Beta Checklist, Private Beta Plan, Legal Policy, Build Tickets | Report, queue, strike, takedown, appeal, emergency escalation, and human review are aligned. | None, except sequencing item below. |
| Data model entities | Minor issue | Data Model, Beta Checklist, Technical Architecture, Build Tickets, Legal Policy | Core entities align. `SecurityEvent` and `UploadArtifact` exist in Data Model. `Subscription` is explicitly deferred in Beta Checklist but has no Data Model section. `AuditLog` is allowed to be covered by `SecurityEvent`, `ModerationAction`, and verification history, but Data Model does not state this as its own heading. | Add a future correction clarifying deferred `Subscription` and explicit `AuditLog` strategy in `DATA_MODEL.md`. |
| Technical architecture | Consistent | Technical Architecture, README, Milestone Plan, Build Tickets, Research Notes | Next.js/React, Postgres/Supabase, Supabase Auth or equivalent, RLS plus server-side authorization, private storage, server-side AI, Postgres full-text search, Stripe later, and Vercel are aligned. | None. |
| Build ticket sequencing | Minor issue | Build Tickets, Milestone Plan, Beta Checklist | Build Tickets first sequence puts moderation/reporting after posts/comments. Milestone Plan correctly requires M5 moderation before M4 community launch to real users. | Update Build Tickets to split "build content primitives" from "enable real anonymous posting" and require reporting/moderation before launch. |
| Milestone sequencing | Consistent | Milestone Plan, Beta Checklist, Private Beta Plan | M0 through M9 sequencing is sensible: validation/policy, foundation, auth, verification, moderation, community, AI, deals, admin, beta readiness. | Update Milestone Plan to include Legal Policy Requirements as a source doc. |
| Beta readiness gates | Consistent | Beta Checklist, Private Beta Plan, Milestone Plan, Legal Policy | Private beta blockers mostly align: verification, retention, moderation, emergency escalation, legal/policy minimums, safety, security, accessibility, AI review, seed content, first 50, rollback. | Add legal/policy gates to Milestone Plan Beta Acceptance Dependencies. |
| Legal/policy gates | Minor issue | Legal Policy, Beta Checklist, Private Beta Plan, Landing Page Plan, Milestone Plan | Legal Policy is strong and aligned but was created after Milestone Plan, so older milestone text does not fully include the policy artifact list. | Update Milestone Plan and Build Tickets to reference Legal Policy Requirements. |
| Landing page/waitlist promises | Consistent | Landing Page Plan, Legal Policy, MVP Scope, Competitive Positioning | Waitlist does not collect badge uploads, IDs, schedules, passenger information, exact hotels, or credentials. Copy avoids official affiliation and overpromising. | None. |
| Monetization scope | Consistent | Monetization, MVP Scope, Feature Roadmap, Legal Policy, Beta Checklist | Display ads are not primary. V1 deals are directory/admin-reviewed only. Sponsored/affiliate disclosure and marketplace/payment deferral are aligned. | None. |

## 5. Beta Gate Alignment

`BETA_READINESS_CHECKLIST.md`, `PRIVATE_BETA_OPERATING_PLAN.md`, `LEGAL_POLICY_REQUIREMENTS.md`, and `MILESTONE_EXECUTION_PLAN.md` are directionally aligned. They all require controlled beta scope, practical verification, private identity separation, moderation, emergency escalation, safety rules, AI limits, and review before real users.

Aligned private beta blockers:

- V1 excluded features must be absent.
- Verification artifacts require private storage, access control, logging, and retention/deletion policy before uploads.
- No AI verification approval or final moderation bans.
- Reporting and moderation queue must exist before real anonymous participation.
- Emergency escalation must exist for safety/security issues.
- Exact public crew hotel exposure, passenger private information, airport security procedures, live operations-sensitive information, confidential documents, doxxing, harassment, threats, and impersonation are banned.
- Working-name status must not be represented as legally cleared.
- Beta needs admin coverage, seed content, test users, security/privacy/accessibility review, and rollback plan.

Blockers present in one doc but weaker or missing elsewhere:

- `LEGAL_POLICY_REQUIREMENTS.md` requires beta participation terms, privacy notice, community rules, verification consent, AI notice if enabled, no-affiliation disclaimer, and emergency/safety escalation. `MILESTONE_EXECUTION_PLAN.md` mentions policy ownership but should now reference the complete legal/policy minimum set.
- `LANDING_PAGE_WAITLIST_PLAN.md` requires no sensitive uploads and waitlist privacy copy. `BETA_READINESS_CHECKLIST.md` focuses more on app beta than waitlist readiness; this is acceptable but should be cross-referenced in a future correction.
- `PRIVATE_BETA_OPERATING_PLAN.md` proposes live-limited Jumpseat Brief for Wave 1 if safety checks are ready. `LEGAL_POLICY_REQUIREMENTS.md` is more conservative and says consider demo/limited mode first. This is not a conflict, but the beta AI mode remains an explicit decision.

## 6. V1 Scope Drift Check

No reviewed doc accidentally includes the following excluded features as V1 commitments:

- Airline portal login: consistently excluded.
- Schedule scraping: consistently excluded.
- Public nearby crew tracking: consistently excluded.
- Dating/swiping: consistently excluded.
- Exact public crew hotel exposure: consistently excluded.
- Flight-load requests: consistently excluded.
- Native mobile: consistently excluded.
- Full marketplace payments: consistently excluded.
- Employment/payroll API dependency: consistently excluded from V1 and deferred to later.
- Roster/calendar integrations: consistently excluded from V1 and deferred to Phase 4.

Potential wording drift:

- `TECHNICAL_ARCHITECTURE.md` uses "No exact public crew hotel database" while most docs use "No exact public crew hotel exposure." Meaning is aligned, but standardizing the phrase would reduce ambiguity.
- `MONETIZATION.md` describes future crash pad listings as a revenue path. This is clearly later-stage and not V1, but future docs should continue pairing crash pads with anti-scam, privacy, and payment-risk controls.

## 7. Legal/Policy Alignment

Legal/policy requirements align with trust/safety, beta readiness, landing page, and monetization docs.

Checks:

- Working-name caveat is consistent across all primary docs.
- No doc claims legal or trademark clearance.
- No doc implies official airline affiliation, employer endorsement, or official verification by an airline.
- Landing page copy includes a no-affiliation disclaimer and working-name caveat.
- Monetization aligns with FTC-style disclosure requirements in Legal Policy Requirements.
- Trust and Safety banned categories map cleanly to Legal Policy Requirements community, aviation-sensitive content, moderation, and incident response sections.

Open legal/policy issues that remain intentionally unresolved:

- Trademark counsel path.
- Exact verification artifact retention period.
- Whether manual badge uploads are acceptable in private beta.
- Whether beta content should be confidential.
- Whether former/aspiring aviation workers are allowed in beta and with what access.
- Whether anonymous company-specific discussion needs special safeguards.

## 8. Data Model Alignment

Entity alignment is mostly solid.

| Entity | Alignment finding |
| --- | --- |
| User | Present in Data Model; referenced across auth, profile, reports, moderation, AI, and security. |
| Profile | Present and correctly separates public handle from private identity. |
| Verification | Present with method, status, tier, reviewer, and evidence path; retention/deletion metadata exists. |
| TrustLevel | Present and aligned with account restrictions and moderation. |
| Airline, Role, Base, Airport | Present and aligned with profile, Crew Rooms, Base Boards, and Layover Boards. |
| CrewRoom, Post, Comment, SavedItem, LayoverBoard | Present and aligned with community MVP. |
| Deal, Vendor | Present and aligned with directory-only NonRev Deals. |
| Report, ModerationAction | Present and aligned with reporting, strikes, appeals, and admin actions. |
| AIBrief | Present and aligned with Jumpseat Brief and saved AI briefs. |
| SecurityEvent | Present and aligned with logging requirements. |
| UploadArtifact | Present and aligned with verification upload handling. |
| Subscription | Not defined as an entity in Data Model; Beta Checklist explicitly defers it because V1 has no payments. This is acceptable but should be documented in Data Model for clarity. |
| AuditLog | Not a standalone entity. Beta Checklist allows it to be covered by `SecurityEvent`, `ModerationAction`, and verification history. Data Model should explicitly state this strategy. |

Recommended follow-up: update `DATA_MODEL.md` with short "Deferred and Covered Entities" notes for `Subscription` and `AuditLog`.

## 9. Build Sequencing Review

`BUILD_TICKETS.md` and `MILESTONE_EXECUTION_PLAN.md` mostly align, but one sequencing issue should be corrected before implementation.

Confirmed alignment:

- Auth foundation precedes user/profile model.
- User/profile model precedes verification model.
- Authorization baseline is planned before verification submission and community permissions.
- Verification, authorization, and moderation are all required before real anonymous posting.
- Jumpseat Brief comes after AI safety requirements.
- Deals remain directory-only before marketplace payments.

Issue:

- `BUILD_TICKETS.md` "Required First Implementation Sequence" lists Crew Rooms, Base Boards, posts/comments, then moderation/reporting. This is reasonable for local feature construction if content is not exposed to real users, but it conflicts with the stronger launch-safety language in `MILESTONE_EXECUTION_PLAN.md`, which moves Moderation and Safety before Community Core for real anonymous posting.

Recommended follow-up: update `BUILD_TICKETS.md` to clarify that content primitives may be built before moderation only in a local/non-user-facing state, but reporting, moderation, emergency escalation, and admin review must exist before real anonymous posting or beta exposure.

## 10. Landing Page Promise Review

`LANDING_PAGE_WAITLIST_PLAN.md` aligns with V1 exclusions and legal/policy requirements.

Confirmed:

- Waitlist does not collect badge uploads, IDs, schedules, passenger information, exact hotel assignments, employee numbers, or portal credentials.
- Landing copy does not promise schedule import, flight-load requests, nearby crew tracking, dating/social matching, native mobile, marketplace payments, roster/calendar integrations, employment/payroll API verification, exact crew hotel databases, official airline endorsement, legal clearance, or immediate public launch.
- The landing page is positioned as demand validation before full app build.
- Ambassador language does not give ambassadors verification, moderation, airline-representative, or sensitive-content approval authority.
- The plan explicitly recommends no-code tools before custom app build.

No landing-page drift found.

## 11. Research Notes Alignment

`RESEARCH_NOTES.md` supports the major research-backed recommendations. It includes competitor, verification vendor, aviation safety/privacy, AI, technical architecture, security/coding standards, accessibility, and legal/policy sources.

Supported recommendation areas:

- Competitor positioning against Flight Crew View, StaffTraveler, CrewLounge CONNECT, CrewVIP, Facebook, Reddit, Blind, and newer crew apps.
- Verification options and risks from StaffTraveler, Blind, SheerID, Truework, Argyle, and Atomic.
- Aviation-sensitive content restrictions from TSA and transportation security sources.
- Security/coding standards from OWASP, NIST, Supabase, Next.js, GitHub, npm, and WCAG.
- Legal/policy recommendations from USPTO, FTC, NIST, OWASP, TSA, OpenAI, platform docs, and vendor docs.

Minor research-notes issue:

- Some source categories are duplicated across older research sections and the later Legal and Policy Requirements section. This is not harmful, but a future cleanup could group repeated sources under canonical source entries with multiple "used by" references.
- Not every recommendation in older product docs has a table-level confidence label; `LEGAL_POLICY_REQUIREMENTS.md` does include confidence labels as requested. This is acceptable because confidence labels were required for legal/policy checklist areas, not every historical product doc.
- Source limitations are now well surfaced in the legal/policy source section. Older competitor sections include less formal limitation language, but they generally describe product-plan impact clearly.

## 12. Recommended Corrections

| Priority | Affected docs | Proposed change | Reason | Blocks app scaffold |
| --- | --- | --- | --- | --- |
| P1 | `BUILD_TICKETS.md`, optionally `MILESTONE_EXECUTION_PLAN.md` | Clarify that reporting/moderation/emergency escalation must be implemented before real anonymous posting or beta exposure, even if content primitives are built earlier locally. | Prevents future implementation from following the simpler ticket sequence too literally. | No for bare M1 scaffold; yes before community feature work. |
| P1 | `DATA_MODEL.md`, `BETA_READINESS_CHECKLIST.md` | Add a short note that `Subscription` is deferred until payments and that `AuditLog` is intentionally covered by `SecurityEvent`, `ModerationAction`, and verification decision history unless a distinct audit table is later chosen. | Removes entity naming ambiguity before schema design. | No for M1 scaffold; yes before schema implementation. |
| P1 | `MVP_SCOPE.md`, `PRIVATE_BETA_OPERATING_PLAN.md`, `LEGAL_POLICY_REQUIREMENTS.md` | Standardize Tier 3 manual verification language: private beta can use non-upload manual review unless safe upload controls are ready. | Avoids accidental pressure to accept badge/document uploads before storage/security/legal readiness. | No for M1 scaffold; yes before verification implementation. |
| P1 | `MILESTONE_EXECUTION_PLAN.md`, `BUILD_TICKETS.md` | Add `LEGAL_POLICY_REQUIREMENTS.md` as a source and map legal/policy minimums into M0/M9 gates. | Legal policy plan was created after milestone plan and should now be integrated. | No for M1 scaffold if explicitly approved; yes before private beta. |
| P1 | `MILESTONE_EXECUTION_PLAN.md`, `LANDING_PAGE_WAITLIST_PLAN.md`, `LEGAL_POLICY_REQUIREMENTS.md` | Update stale "Recommended Next Tasks" sections so they no longer recommend already-created docs as future tasks. | Reduces future Codex confusion and keeps project direction current. | No. |
| P2 | `TECHNICAL_ARCHITECTURE.md`, `MVP_SCOPE.md`, `TRUST_AND_SAFETY.md` | Standardize phrase "exact public crew hotel exposure" across docs. | Removes wording drift while preserving meaning. | No. |
| P2 | `RESEARCH_NOTES.md` | Deduplicate repeated source entries or add a canonical "used by" structure. | Improves maintainability of research notes. | No. |
| P2 | `README.md` | Replace "The next implementation task may create the app foundation" with a more conditional statement after the current review and correction pass. | README is slightly optimistic relative to current M0/legal/policy blockers. | No. |

No P0 issues were found.

## 13. App Scaffold Readiness Verdict

M1 App Foundation is conditionally allowed, not fully recommended as the immediate next task.

Conditions before M1 scaffold:

- User explicitly approves app-code work.
- P1 documentation corrections above are either completed or consciously accepted as non-blocking for a bare scaffold.
- M1 is limited to foundation only: scaffold, TypeScript strict mode, linting/formatting, environment config pattern, CI/security baseline, accessibility baseline, and no product features.
- No Supabase config, migrations, API routes, UI product flows, verification upload handling, or database implementation are created unless explicitly included in a later implementation task.
- No merge to `main` occurs without explicit review.

Blocked before community/product implementation:

- First beta community and first 50 plan are not finalized.
- Policy artifacts are not drafted/reviewed.
- Exact verification artifact retention period is unresolved.
- Manual badge/document upload acceptability remains unresolved.
- Authorization/RLS design and tests are not implemented.
- Moderation/reporting/emergency escalation are not implemented.
- AI live-beta mode is undecided.

First safe scaffold task, if explicitly approved later:

- Create an `M1 App Foundation` branch that only initializes the chosen app foundation and quality gates. Acceptance should include repo state proof, documentation boundary confirmation, no product feature implementation, no database schema, no verification upload flow, and no V1-excluded features.

## 14. Recommended Next Codex Task

Recommended next task after the P1 correction pass: execute M0 validation/no-code waitlist preparation.

Use Plan/Goals: yes.

Scope:

- Finalize the waitlist tool choice.
- Finalize privacy-safe form fields.
- Draft outreach and interview flow for first-base/community validation.
- Draft ambassador screening flow.
- Assign the waitlist data handling owner.
- Do not create app code.
- Do not expand V1 scope.
- Do not create production legal documents.
