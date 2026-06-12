# Product Delivery Operating Model

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This is a documentation-only operating model. It does not create app code, framework files, package files, deployment config, a landing page, a form, or implementation files.

## 1. Purpose

This document governs how jmpseat work should move from idea to validated product. It exists to keep discovery, validation, MVP scope, build sequencing, and feature expansion aligned across founder, product, engineering, design, legal/policy, and future Codex sessions.

The goal is to avoid building features before validating the assumptions behind them. jmpseat should not expand V1 because a feature sounds useful, a competitor has it, or it is easy to build. New work should move through evidence, scope, acceptance criteria, and review.

This model preserves the current repo boundary: no app feature implementation without explicit approval and a scoped branch.

## 2. Product Delivery Philosophy

- Discovery before build.
- Problem validation before solution expansion.
- MVP before full platform.
- User feedback before feature stories.
- Utility surfaces before social-feed mechanics.
- Trust, privacy, safety, moderation, and authorization before real anonymous participation.
- Small branches, bounded commits, and reviewable outputs.
- No V1 scope expansion without validated user evidence.
- No official airline affiliation or endorsement unless explicitly obtained.
- No merge to `main` without review.

## 3. Phase Model

### Phase 0 - Discovery and Market Validation

Goal: validate whether the problem, audience, and first community are real enough to justify app work.

Required validation:

- Validate the problem: fragmented base intel, layover planning, anonymous crew discussion, career movement, and crew-friendly perks.
- Validate the audience: flight attendants, pilots, gate agents, ramp agents, dispatchers, crew schedulers, airport ops, regional airline workers, new hires, and commuters.
- Validate willingness to join the waitlist.
- Validate one focused first base/community.
- Validate privacy and verification comfort.
- Validate that users do not primarily want excluded V1 features.

Primary artifacts:

- `M0_VALIDATION_OPERATING_PACKET.md`
- `NO_CODE_WAITLIST_EXECUTION.md`
- Waitlist results and interview notes stored outside this repo.

### Phase 1 - Problem/Solution Validation

Goal: validate that jmpseat's proposed solution matches real airline-worker pain.

Required validation:

- Utility-first wedge: base intel, layover boards, Crew Rooms, and verified anonymous discussion are understood.
- Feature priority: Base Boards, Layover Boards, and Crew Rooms rank high enough to justify the MVP.
- Trust and safety concerns are addressable through verification, anonymity rules, and moderation.
- Ambassadors can help seed useful content without becoming moderators or verification approvers.
- Waitlist and interviews show pull beyond generic "cool idea" feedback.

### Phase 2 - MVP Definition

Goal: lock the smallest MVP scope needed to test the core loop.

Required outputs:

- Core user journeys.
- Exact V1 scope.
- Explicit V1 exclusions.
- Acceptance criteria.
- Security, privacy, accessibility, moderation, verification, and AI gates.
- Build tickets and milestone order.

V1 remains constrained to account creation, aviation-worker verification, profile, anonymous public handle, Crew Rooms, Base Boards, Layover Boards, posts/comments/saves/search, Jumpseat Brief MVP, basic NonRev Deals directory, reporting/moderation, and admin verification dashboard.

### Phase 3 - MVP Build

Goal: build only approved MVP slices in scoped branches.

Rules:

- Start with foundation and splash/waitlist page work only when explicitly approved.
- Keep the private app inaccessible until beta-ready.
- Build behind feature and access gates.
- Do not expose real anonymous posting until auth, authorization, verification, moderation/reporting, trust/safety rules, emergency escalation, and admin controls are ready.
- Do not add airline portal login, schedule scraping, public nearby crew tracking, dating/swiping, exact public crew hotel exposure, flight-load requests, native mobile, full marketplace payments, advanced employment/payroll verification API dependency, or roster/calendar integrations.

### Phase 4 - MVP Delivery / Private Beta

Goal: deliver a controlled, useful, safe beta to a focused community.

Required operation:

- Invite controlled beta users.
- Verify users through practical private-beta paths.
- Seed the first community before broad access.
- Monitor moderation and safety daily.
- Collect feedback through interviews, issue logs, ambassador notes, and usage behavior.
- Keep beta scope narrower than public launch.

### Phase 5 - Assumption Validation

Goal: determine whether the MVP is working before expanding.

Validate:

- Activation.
- Retention.
- Base/community density.
- Posting and contribution behavior.
- Search, save, board, and Jumpseat Brief usage.
- Feature demand.
- Verification completion and abandonment.
- Trust and safety load.
- Moderation burden.
- Privacy concerns.

### Phase 6 - Feature Story Expansion

Goal: convert validated learning into user stories and prioritize by evidence.

Rules:

- User stories require an evidence source.
- Feature expansion must not undermine the utility-first wedge.
- V1 exclusions remain excluded unless a later phase explicitly reopens them with legal, security, privacy, and user validation.
- Build in small branches with acceptance criteria and review.

## 4. Assumption Register

These assumptions must be validated before they become build commitments:

| Assumption | Validation method | Decision signal |
| --- | --- | --- |
| Airline workers want a verified off-duty network. | Waitlist signups, interviews, referral behavior. | Qualified aviation-worker demand reaches M0 thresholds. |
| Users will join before the app is fully built. | No-code waitlist and outreach. | Signups and interview volunteers come from likely aviation workers. |
| One-base/multi-role launch is viable. | Base/airport concentration and role distribution. | One base or tightly related community reaches enough density. |
| Users are comfortable with verification. | Waitlist privacy responses and interviews. | Verification concerns are specific and addressable. |
| Anonymous but accountable posting is trusted. | Interviews and beta behavior. | Users understand internal accountability and still want participation. |
| Base Boards, Layover Boards, and Crew Rooms rank highly. | Feature ranking survey and beta usage. | These surfaces rank above generic social or excluded features. |
| Ambassadors can seed activity. | Ambassador commitments and first outreach. | Credible ambassadors agree to seed useful content and invite trusted peers. |
| Privacy concerns are addressable. | Waitlist responses, interviews, beta support issues. | Concerns can be handled through copy, process, and product limits. |
| Users do not primarily demand excluded features. | Survey, interviews, beta requests. | Demand does not center on schedules, flight loads, public tracking, dating, native mobile, or marketplace payments. |

## 5. Evidence Standards

Evidence that can justify moving forward:

- Waitlist signups from likely aviation workers.
- Role and base concentration.
- Interview feedback with concrete pain.
- Referral behavior from trusted aviation workers.
- Ambassador commitments.
- Feature ranking results.
- Repeat usage during beta.
- Posts, comments, saves, and search behavior during beta.
- Moderation burden and report volume.
- Support and safety issues.
- Privacy and verification concern themes.

Evidence that is not enough by itself:

- Founder excitement alone.
- Generic "cool idea" feedback.
- Unqualified signups.
- Social likes without waitlist action.
- Competitor feature envy.
- Codex-built features with no user signal.
- One-off requests that conflict with V1 exclusions.
- Large signup totals with no base/community concentration.

## 6. Build Gate Rules

Codex may move from docs/planning into app implementation only when all of these are true:

- The user explicitly approves implementation work.
- The task names the scope and branch.
- A scoped ticket or milestone is identified.
- Acceptance criteria are written before implementation.
- The task states whether app code, config, package files, database work, API routes, UI, or deployment files are allowed.
- V1-excluded features remain out of scope.
- Security, privacy, accessibility, authorization, verification, moderation, AI, and policy constraints are included when relevant.
- Future implementation tickets touching auth, data, storage, search, moderation, admin, or community features must also state scalability impact, access-control approach, pagination/indexing expectations, and whether new private or sensitive data is introduced.
- Future implementation tickets and reports touching auth, account/profile, data, verification, community, moderation, notifications, storage, admin, or AI should also state client impact when relevant: `web-only`, `mobile-ready`, or `shared-core`.
- The final report includes branch, commits, files changed, checks run, and scope boundary confirmation.

No hidden feature expansion is allowed. If implementation uncovers a needed feature outside scope, document it as a follow-up instead of building it.

## 7. Branching and Commit Rules

- Work from `main`.
- Confirm `pwd`, current branch, `git status --short`, recent log, required branches, and working-tree cleanliness before new tasks.
- Create short-lived branches for bounded tasks.
- Use one bounded task per branch.
- Prefer fast-forward merges when safe.
- Commit every completed bounded slice.
- Keep the working tree clean before starting new tasks.
- Do not merge to `main` without explicit review.
- Do not rewrite or revert user changes unless explicitly requested.
- Final Codex reports must include branch, commit hash, status, files changed, checks run, and confirmation that scope boundaries were respected.

## 8. Documentation Hygiene

Keep documentation updates proportional, but intentional.

Rules:

- Every ticket must identify documentation impact.
- Every implementation report or review report must state whether docs were updated or why no docs update was needed.
- Route, product, architecture, policy, and scope decisions must be captured in repo docs, not only in chat.
- Behavior changes should update the relevant roadmap, epoch, architecture, policy, or review doc when applicable.
- Trivial code-only fixes do not require forced documentation churn, but "no doc impact" must be stated explicitly.
- Acceptance criteria for future tickets should include docs updated when applicable.

This is a lightweight discipline rule, not a new documentation-heavy process. The goal is to keep repo truth current without overproducing docs for minor work.

## 9. Documentation Governance for Feature Tickets

Feature tickets must keep controlling roadmap, ticket, data-model, checkpoint,
and MVP backlog docs synchronized with product behavior.

Rules:

- Every feature ticket must identify affected docs before implementation.
- Every implementation prompt should list docs expected to change.
- Every Codex final report must include:
  - Docs Updated.
  - Docs Not Updated / Why.
  - Scope Impact.
  - Runtime Apply Docs Needed?
  - Browser Smoke Docs Needed?
- Every review must check whether docs stayed aligned with:
  - `docs/BUILD_TICKETS.md`
  - `docs/DATA_MODEL.md`
  - `docs/ops/05b-first-base-mvp-planning.md`
  - `docs/ops/hub-pivot-plan.md`
  - current focused ops docs
  - current MVP remaining backlog
- Any product pivot, renamed surface, changed milestone, or new MVP/deferred
  boundary must update the controlling backlog/checkpoint docs.
- Runtime migration applies require runtime-apply docs.
- Browser smoke passes or deferrals require smoke/checkpoint docs.
- If no docs change, the final report must explicitly justify why.
- Review should fail or pause if implementation changes product behavior but
  controlling docs are stale.
- Current focused milestone/checkpoint docs override older broad roadmap docs
  when there is conflict.
- Older broad docs should be treated as historical or V1 context unless brought
  current by a focused decision.

jmpseat-specific continuity requirements:

- Future work must not lose the four DFW MVP utility pillars:
  - DFW Today
  - Base
  - Layover
  - Channels
- Future work must keep these concepts separate:
  - auth state
  - beta access state
  - verification state
  - profile state
  - admin/reviewer/operator authorization
  - moderation state

Safety boundaries to preserve:

- no airline portal login
- no schedule scraping
- no roster/calendar integrations
- no public live crew tracking
- no dating/swiping behavior
- no exact public crew hotel exposure
- no passenger private information
- no airport/security-sensitive procedures
- no company-confidential content
- no AI final verification
- no AI final moderation/bans
- no public proof exposure

## 10. Codex Plan/Goals Usage

Codex must use Plan/Goals for:

- Multi-step documentation work.
- Any app scaffold.
- Any auth, database, authorization, or security work.
- Any AI work.
- Any moderation, verification, admin, or trust/safety work.
- Any task with multiple files or dependencies.
- Any branch/merge workflow with proof requirements.

Plan items should be updated as work progresses. Final reports should explicitly state which goals completed and which, if any, did not.

## 11. User Story Intake Rules

Future features should become user stories only after discovery or beta evidence. A story without evidence belongs in an assumption register or backlog note, not in an implementation sprint.

Required format:

```markdown
### [Story title]

As a [user type],
I want [capability],
So that [outcome].

Acceptance criteria:
- [ ] ...

Evidence source:
- Waitlist result, interview note, beta usage, ambassador feedback, support issue, or research source.

Risk/safety notes:
- Privacy, aviation-sensitive content, moderation, verification, AI, legal/policy, abuse, accessibility, or security risks.

Dependencies:
- Required data model, auth, authorization, admin, moderation, policy, or design work.
```

Story rules:

- No story can imply official airline affiliation unless obtained.
- No story can rely on airline portal credentials, schedule scraping, public nearby tracking, dating/swiping, exact crew hotel exposure, flight-load requests, native mobile, full marketplace payments, or employment/payroll API dependency in V1.
- Anonymous posting stories must include internal accountability and moderation dependencies.

## 11. MVP Build Order

Once implementation is explicitly approved, use this order:

| Step | Name | Purpose | Gate |
| --- | --- | --- | --- |
| M1A | Splash/waitlist page | Support validation and basic product proof of concept. | May be built before full validation only with explicit approval and no sensitive data collection. |
| M1B | Private app shell behind access gate | Establish a non-public app surface. | Must remain inaccessible to general users. |
| M2 | Auth/profile foundation | Create account and profile base. | Required before user-specific features. |
| M3 | Verification state model | Represent verification and account states. | Required before verified-only participation. |
| M4 | Crew Rooms/Base Boards structural MVP | Build content structure. | Can be structural/local before launch; real posting remains gated. |
| M5 | Moderation/reporting/admin foundation | Govern user content and anonymous participation. | Required before real anonymous posting or beta exposure. |
| M6 | Jumpseat Brief limited/demo MVP | Test AI layover utility with safety limits. | Server-side AI, structured output, safety filtering, and logging required. |
| M7 | Private beta readiness | Confirm beta can launch safely. | Beta readiness, legal/policy, privacy, security, accessibility, seed content, and rollback gates required. |

Clarification: a splash/waitlist page may be built before full validation if explicitly approved because it supports validation and proof of concept. Deeper app features should wait for stronger signal from M0 and should not begin without a scoped implementation branch.

## 11. Feedback Loop

Feedback should be captured in controlled, reviewable places:

- Interviews.
- Waitlist form responses.
- Ambassador notes.
- Beta issue log.
- Feature requests.
- Safety concerns.
- Privacy and verification concerns.
- Recurring pain themes.
- Support requests.
- Moderation reports.

Feedback handling rules:

- Summarize sensitive feedback in anonymized form.
- Do not store waitlist exports or raw interview notes with personal data in this repo unless explicitly approved.
- Do not copy passenger information, exact crew hotel details, schedules, portal credentials, confidential company documents, live location, or airport security procedures into docs.
- Convert repeated validated pain into stories; keep isolated ideas as observations.

## 12. Decision Gates

| Gate | When to use | Decision criteria |
| --- | --- | --- |
| Continue validation | Signal exists but is weak, scattered, or ambiguous. | Keep no-code outreach running, narrow audience, or revise positioning. |
| Start M1 app foundation | M0 has enough signal or user explicitly approves foundation work. | Scope is limited, branch is explicit, acceptance criteria exist, and no product features are included unless approved. |
| Start private beta | MVP slices and beta readiness gates are complete. | Verification, moderation, safety, legal/policy minimums, seed content, admin coverage, and rollback plan are ready. |
| Expand features | Beta behavior validates the need. | Evidence shows repeat usage, pain intensity, and safe operation. |
| Pivot | Users want the problem solved but reject the current wedge or trust model. | Reposition around the strongest validated utility without expanding risky scope. |
| Pause / kill | Demand, trust, density, or safety signals fail. | Do not scaffold or continue build work without a new thesis. |

## 13. Anti-Patterns

Avoid:

- Building a generic social feed.
- Building before validation.
- Chasing competitor features.
- Adding schedule, non-rev load, public location, dating, or roster/calendar features in V1.
- Treating AI as the product instead of using it to summarize community knowledge.
- Collecting sensitive verification data too early.
- Accepting badge/document uploads before storage, validation, access logging, short-lived admin links, and deletion controls are ready.
- Launching empty communities.
- Treating ambassadors as moderators or verification approvers by default.
- Merging unreviewed code.
- Using one branch for too many changes.
- Letting landing page copy imply public launch, official airline affiliation, or legal/trademark clearance.

## 14. Recommended Next Step

Recommended next step: execute the no-code waitlist setup outside this repo using `NO_CODE_WAITLIST_EXECUTION.md`, then record the completed setup in a future documentation update.

Alternative next step, only if explicitly approved: prepare an M1A splash/waitlist app scaffold prompt with narrow acceptance criteria. The prompt should allow only the splash/waitlist proof-of-concept surface and should continue to prohibit app features, private beta workflows, verification uploads, database schemas, API routes, and V1-excluded features unless separately approved.
