# Build Tickets

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.
Rename note: Deadhead Club is retired and should not be used in current docs, UI, code, or planning. Older Git history may still contain legacy references.

This is a prioritized implementation plan for a future build phase. No app code is included in this documentation-only repository initialization.

Labels used: docs, product, foundation, auth, verification, community, moderation, AI, monetization, admin, later.

Supplemental epoch-specific ticket packs:

- [Epoch 02: Private App Foundation Ticket Pack](epochs/epoch-02-private-app-foundation-tickets.md)
- [Epoch 03: Auth, Profiles, and Beta Access Ticket Pack](epochs/epoch-03-auth-account-beta-access-tickets.md)
- [Epoch 03: Auth Access Architecture Decision](epochs/epoch-03-auth-access-architecture-decision.md)
- [Epoch 03: Auth Route Account State Map](epochs/epoch-03-auth-route-account-state-map.md)
- [Epoch 03: Account Profile Foundation Implementation](epochs/epoch-03-account-profile-foundation-implementation.md)
- [Epoch 03: Beta Access Model Implementation](epochs/epoch-03-beta-access-model-implementation.md)
- [Epoch 03: Private App Access Gates Implementation](epochs/epoch-03-private-app-access-gates-implementation.md)
- [Verification Method Decision](VERIFICATION_METHOD_DECISION.md)

Documentation hygiene reminder:

- Future tickets should identify documentation impact and include docs-update acceptance criteria when applicable. See `PRODUCT_DELIVERY_OPERATING_MODEL.md`.

Scalability guardrail:

- Future auth, database, community, moderation, storage, search, admin, and AI tickets should follow `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`.
- Future auth, account/profile, beta-access, verification, community, moderation, notifications, storage, admin, and AI tickets should also follow `MOBILE_APP_STRATEGY.md`.

Client-scope rule:

- Future implementation tickets must identify whether the work is `web-only`, `mobile-ready`, or `shared-core`.
- If a ticket is `shared-core` or `mobile-ready`, it must describe how the logic, data access, and authorization rules can be reused by a future mobile client.

## Required First Implementation Sequence

Use this order when implementation begins:

1. App scaffold.
2. Auth foundation.
3. User/profile model.
4. Verification model.
5. Crew Rooms.
6. Base Boards.
7. Posts/comments.
8. Moderation/reporting.
9. Jumpseat Brief MVP.
10. Admin dashboard.

The detailed backlog below includes supporting storage, authorization, and policy tickets around that sequence, but the sequence above should guide the first build pass.

Sequencing guardrail: Crew Rooms, Base Boards, and posts/comments may be implemented structurally before moderation is complete only in a local, non-user-facing, non-beta state. Real anonymous posting, member-generated content exposure, or beta use must remain blocked until auth/authorization, aviation-worker verification, reporting, moderation queue, emergency escalation, trust/safety rules, and admin controls are ready.

## Milestone 0: Product Readiness

### DHC-001: Research Review and PRD Lock

Label: product

Goal: Convert the planning docs into a launch-ready PRD.

Scope:

- Confirm V1 capabilities and exclusions.
- Confirm identity principle and verification tiers.
- Confirm competitor positioning.

Acceptance criteria:

- PRD preserves "Utility first. Community second. Social feed last."
- PRD preserves "Verified privately. Anonymous publicly. Accountable internally."
- V1 exclusions are explicit.

Dependencies: None.

### DHC-002: Verification Policy

Label: verification

Goal: Define acceptable V1 verification methods.

Scope:

- Basic email verification.
- Aviation work email verification.
- Manual badge/document verification.
- Peer-vouching rules for later or limited testing.
- Tier 5 vendor/API verification deferred.

Acceptance criteria:

- Verification methods map to Tiers 0 through 5.
- Work-email privacy caveat is documented.
- Manual evidence retention/deletion rules are defined.

Dependencies: DHC-001.

### DHC-003: Content and Safety Policy

Label: moderation

Goal: Convert safety rules into enforceable policy.

Scope:

- Banned content categories.
- Emergency escalation category.
- Anonymous posting rules.
- Vendor spam and unsafe meetup rules.

Acceptance criteria:

- Policy covers doxxing, harassment, threats, passenger private information, crew hotel exposure, live location tracking, operations-sensitive information, airport security procedures, confidential documents, impersonation, vendor spam, dating/swiping behavior, and unsafe meetup pressure.

Dependencies: DHC-001.

### DHC-004: Room and Board Taxonomy

Label: community

Goal: Define initial Crew Rooms, Base Boards, and Layover Boards.

Scope:

- Room types.
- Room visibility.
- Anonymous posting settings.
- Seed categories for Base Board and Layover Boards.

Acceptance criteria:

- Engineers can implement room_type, visibility, and anonymous_posting_allowed fields.
- Initial seed list is approved.

Dependencies: DHC-001.

### DHC-005: AI Safety Requirements

Label: AI

Goal: Define AI product and safety rules before implementation.

Scope:

- Jumpseat Brief MVP output.
- Structured output schema.
- Safety filter categories.
- Human review boundaries.

Acceptance criteria:

- AI is server-side only.
- AI does not approve verification, make final bans, auto-post, expose sensitive data, provide aviation security procedures, or rely only on hidden prompts.

Dependencies: DHC-003.

### DHC-006: Engineering Standards and Release Gates

Label: foundation

Goal: Define the technical quality bar before implementation starts.

Scope:

- OWASP Top 10 and ASVS baseline.
- WCAG 2.2 AA target.
- TypeScript strict mode.
- API boundary validation.
- RLS plus server-side authorization.
- Security logging requirements.
- CI gates.

Acceptance criteria:

- Future implementation tickets reference the standards baseline.
- Release gates cover security, privacy, accessibility, AI safety, and V1 exclusions.
- No implementation begins without documented acceptance criteria for sensitive workflows.

Dependencies: DHC-001, DHC-003, DHC-005.

## Milestone 1: Foundation Sequence

### DHC-007: App Scaffold

Label: foundation

Goal: Create the future web app foundation.

Scope:

- Next.js / React scaffold.
- TypeScript.
- Linting.
- Environment handling.
- Deployment baseline.

Acceptance criteria:

- App runs locally.
- No product feature shortcuts bypass documented architecture.
- Docs remain intact.

Dependencies: DHC-001.

### DHC-008: Auth Foundation

Label: auth

Goal: Implement account creation and login.

Scope:

- Supabase Auth or equivalent.
- Email/password signup.
- Email verification.
- Session handling.
- Account status enforcement.
- Generic auth errors.
- Rate-limit-aware behavior.
- Admin MFA-ready design.

Acceptance criteria:

- User can sign up, verify email, log in, and log out.
- Unverified users cannot access verified-only areas.

Dependencies: DHC-007.

### DHC-009: User/Profile Model

Label: auth

Goal: Implement core user and aviation profile records.

Scope:

- User.
- Profile.
- Airline.
- Role.
- Base.
- Airport.
- Public handle.

Acceptance criteria:

- User can create a profile after auth.
- Public handle is unique.
- Private identity is separate from public handle.

Dependencies: DHC-008.

### DHC-010: Verification Model

Label: verification

Goal: Implement verification data structures and status flow.

Scope:

- Verification table/model.
- Verification tiers.
- Pending, approved, rejected, more-info states.
- Private evidence path.

Acceptance criteria:

- Verification status is tied to account access.
- Evidence metadata supports retention/deletion.

Dependencies: DHC-009.

### DHC-011: Authorization Baseline

Label: foundation

Goal: Establish server-side authorization and RLS plan.

Scope:

- RLS on exposed tables.
- Server-side checks for account status, room access, anonymous posting, and admin actions.
- RLS test matrix for account states and admin roles.

Acceptance criteria:

- Unauthorized users cannot read or mutate verified-only data.
- Admin-only actions are protected server-side.
- Broken-access-control tests are required before beta.

Dependencies: DHC-008, DHC-009.

## Milestone 2: Verification and Admin

### DHC-012: Verification Submission

Label: verification

Goal: Let users submit aviation verification.

Scope:

- Work email path.
- Manual badge/document upload path.
- Redaction guidance.
- Pending status.

Acceptance criteria:

- User can submit verification.
- Artifact is private.
- User sees current verification status.

Dependencies: DHC-010, DHC-011.

### DHC-013: Private Verification Storage

Label: verification

Goal: Secure verification evidence.

Scope:

- Private storage bucket.
- Short-lived admin access.
- Access logging plan.
- Retention/deletion hooks.
- Upload validation.
- Malware scanning evaluation.
- Safe preview/download behavior.

Acceptance criteria:

- Evidence is not publicly accessible.
- Admin access uses short-lived access.
- Evidence can be deleted under policy.
- Invalid file types and oversize files are rejected.

Dependencies: DHC-012.

### DHC-014: Admin Verification Dashboard

Label: admin

Goal: Allow admins to review verification submissions.

Scope:

- Pending queue.
- Approve.
- Reject.
- Request more information.
- Decision history.

Acceptance criteria:

- Admin can process verification.
- User account status updates correctly.
- Decision is recorded.

Dependencies: DHC-012, DHC-013.

## Milestone 3: Community Utility

### DHC-015: Crew Rooms

Label: community

Goal: Build airline/base/role/topic communities.

Scope:

- CrewRoom model.
- Room list.
- Room detail.
- Visibility rules.
- Anonymous posting configuration.

Acceptance criteria:

- Verified users can view allowed rooms.
- Room permissions are enforced server-side.

Dependencies: DHC-011, DHC-014.

### DHC-016: Base Boards

Label: community

Goal: Build base-specific intel surfaces.

Scope:

- Base Board room type.
- Base categories.
- Base-specific filters.

Acceptance criteria:

- Verified users can browse base intel.
- Content is linked to base and room context.

Dependencies: DHC-015.

### DHC-017: Layover Boards

Label: community

Goal: Build city and airport crew intel.

Scope:

- LayoverBoard model.
- Airport/city pages.
- Layover categories.
- Hotel-detail policy indicator.

Acceptance criteria:

- Verified users can browse layover intel.
- Exact public crew hotel exposure is blocked by policy and UI copy.

Dependencies: DHC-015.

### DHC-018: Posts and Comments

Label: community

Goal: Enable discussion and knowledge capture.

Scope:

- Create posts.
- Edit own posts.
- Delete own posts where allowed.
- Comment.
- Anonymous posting where allowed.
- Input validation and output encoding for user-generated content.
- Link/image sanitization policy.

Acceptance criteria:

- Content belongs to a room or board.
- Anonymous display follows room rules.
- Removed content is hidden from ordinary users.
- Stored XSS and unauthorized edit/delete tests are covered.
- Real anonymous posting remains disabled for beta users until reporting, moderation queue, emergency escalation, and admin controls are ready.

Dependencies: DHC-015, DHC-016, DHC-017.

### DHC-019: Saves

Label: community

Goal: Allow users to save useful content.

Scope:

- Save post.
- Save deal.
- Save board.
- Save AI brief.
- Remove saved item.

Acceptance criteria:

- User can save and unsave supported items.
- Saved list respects access permissions.

Dependencies: DHC-018.

### DHC-020: Search

Label: community

Goal: Add Postgres full-text search.

Scope:

- Search posts and boards.
- Filters by room, board, airport, base, and tag.
- Ranking basics.

Acceptance criteria:

- Search excludes unauthorized, deleted, or removed content.
- Search supports base and layover intel discovery.

Dependencies: DHC-018.

## Milestone 4: Moderation and Safety

### DHC-021: Reporting

Label: moderation

Goal: Let users report unsafe or policy-breaking content.

Scope:

- Report posts.
- Report comments.
- Report deals.
- Report users.
- Categories and notes.

Acceptance criteria:

- Reports enter admin queue.
- Emergency safety/security category exists.

Dependencies: DHC-018, DHC-003.

### DHC-022: Automated Risk Flags

Label: moderation

Goal: Add first-pass risk flagging.

Scope:

- Passenger private information.
- Exact hotel/location exposure.
- Threats, harassment, doxxing.
- Airport security or live operations-sensitive language.
- Vendor spam.

Acceptance criteria:

- Flagged content is queued for admin review.
- Risk flags do not automatically ban users.

Dependencies: DHC-021.

### DHC-023: Moderation Queue

Label: admin

Goal: Give admins tools to process reports and risk flags.

Scope:

- Report list.
- Report detail.
- Dismiss.
- Remove content.
- Warn.
- Restrict.
- Suspend.
- Internal notes.
- Security logging.

Acceptance criteria:

- Admin decisions are recorded.
- Content and user states update correctly.
- Sensitive notes remain admin-only.
- Admin actions are auditable.

Dependencies: DHC-021, DHC-022.

### DHC-024: Strike and Appeal Workflow

Label: moderation

Goal: Add accountable enforcement lifecycle.

Scope:

- Strike count.
- Warning/restriction/suspension mapping.
- Manual appeal intake.

Acceptance criteria:

- Strikes are visible to admins.
- Users can request manual appeal where allowed.

Dependencies: DHC-023.

## Milestone 5: AI MVP

### DHC-025: Jumpseat Brief MVP

Label: AI

Goal: Add AI-powered layover planning.

Scope:

- Airport/city input.
- User constraints.
- Server-side AI call.
- Structured output.
- Safety filters.
- Prompt-injection tests.
- Deterministic banned-category checks outside the model.

Acceptance criteria:

- API key is never exposed client-side.
- Output excludes banned sensitive categories.
- User can generate a useful layover plan.
- AI has no write access to posts, moderation actions, or verification decisions.

Dependencies: DHC-005, DHC-017, DHC-020.

### DHC-026: AI Brief Save and Audit

Label: AI

Goal: Store useful AI outputs without over-retaining sensitive data.

Scope:

- AIBrief record.
- Save brief.
- Safety flags.
- Model metadata.

Acceptance criteria:

- User can save a brief.
- Admins can inspect safety flags if needed.
- Sensitive prompts are not retained unnecessarily.

Dependencies: DHC-025.

## Milestone 6: Deals and Monetization Prep

### DHC-027: NonRev Deals Directory

Label: monetization

Goal: Add basic crew-friendly perks and discounts.

Scope:

- Deal list.
- Deal detail.
- Vendor fields.
- Sponsored and affiliate labels.
- Admin-created deals.

Acceptance criteria:

- Users can browse deals.
- Sponsored/affiliate status is clear.
- Deals can be airport or city relevant.

Dependencies: DHC-011.

### DHC-028: Vendor Review Workflow

Label: monetization

Goal: Keep deals useful and low-spam.

Scope:

- Vendor verification status.
- Deal approval status.
- Report vendor/deal flow.

Acceptance criteria:

- Unreviewed vendor deals do not appear as trusted.
- Users can report misleading or unsafe deals.

Dependencies: DHC-027, DHC-021.

## Milestone 7: Beta Readiness

### DHC-029: Privacy and Retention Controls

Label: foundation

Goal: Harden sensitive data handling before beta.

Scope:

- Verification artifact retention.
- Deletion flows.
- Sensitive access logging.
- Account deletion behavior.

Acceptance criteria:

- Verification artifacts can be deleted under policy.
- Sensitive admin access is auditable.
- Account deletion behavior is documented and implemented.

Dependencies: DHC-013, DHC-014, DHC-023.

### DHC-030: Beta QA Checklist

Label: docs

Goal: Define launch readiness checks.

Scope:

- Auth QA.
- Verification QA.
- Posting and search QA.
- Moderation QA.
- AI safety QA.
- Privacy QA.
- Accessibility QA.
- RLS/access-control QA.
- Dependency and secret scanning.

Acceptance criteria:

- QA checklist covers all V1 acceptance criteria.
- Known V1 exclusions are verified absent.
- Release gates are complete before beta.

Dependencies: DHC-007 through DHC-029.

### DHC-031: Founder/Admin Operating Guide

Label: docs

Goal: Document how to run the early community safely.

Scope:

- Verification review guide.
- Moderation decision guide.
- Emergency escalation guide.
- Deal approval guide.

Acceptance criteria:

- Founder/admin can operate beta without relying on undocumented judgment.
- High-risk categories have clear escalation instructions.

Dependencies: DHC-002, DHC-003, DHC-023.

### DHC-032: Accessibility Review

Label: foundation

Goal: Ensure core flows meet WCAG 2.2 AA before beta.

Scope:

- Auth.
- Verification.
- Posting/commenting.
- Reporting.
- Search.
- Admin queues.

Acceptance criteria:

- Keyboard navigation works across core flows.
- Visible focus and status messages are present.
- Forms have labels, errors, and accessible authentication behavior.

Dependencies: DHC-030.

### DHC-033: Security Review

Label: foundation

Goal: Verify the implementation against the security baseline before beta.

Scope:

- OWASP Top 10 review.
- ASVS-informed checklist.
- RLS tests.
- Upload validation review.
- Secret scanning.
- Dependency audit.
- AI prompt-injection and sensitive-disclosure tests.

Acceptance criteria:

- Critical/high findings are fixed or explicitly accepted before beta.
- V1 excluded features are absent.

Dependencies: DHC-030.

## Later Tickets

### DHC-034: Base/Room Moderators

Label: later

Goal: Add trusted community moderation roles.

Acceptance criteria:

- Moderators have constrained powers.
- Admins can review moderator actions.

Dependencies: DHC-024.

### DHC-035: Premium Subscription Planning

Label: later

Goal: Plan Stripe-backed premium features.

Acceptance criteria:

- Premium feature list adds utility without weakening trust.
- No Stripe implementation begins until approved.

Dependencies: DHC-025, DHC-027.

### DHC-036: Verification Vendor Evaluation

Label: later

Goal: Evaluate SheerID, Truework, Argyle, Atomic, or similar vendors.

Acceptance criteria:

- Evaluation covers cost, coverage, consent, privacy, user friction, and aviation fit.
- No V1 dependency is created.

Dependencies: DHC-014.

### DHC-037: Native Mobile Feasibility Review

Label: later

Goal: Decide whether native mobile is justified after web MVP.

Acceptance criteria:

- Decision is based on beta usage and retention.
- Native build is not started prematurely.

Dependencies: DHC-030.
