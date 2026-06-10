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
- [Epoch 03: Authorization Security Events Implementation](epochs/epoch-03-authorization-security-events-implementation.md)
- [Epoch 03: Validation And Handoff Review](epochs/epoch-03-validation-and-handoff-review.md)
- [Epoch 04: Worker Verification Foundation Ticket Pack](epochs/epoch-04-worker-verification-foundation-tickets.md)
- [Epoch 04: Verification Claim Lifecycle Decision](epochs/epoch-04-verification-claim-lifecycle-decision.md)
- [Epoch 04: Verification Data Model Implementation](epochs/epoch-04-verification-data-model-implementation.md)
- [Epoch 04: Work Email Verification Foundation Implementation](epochs/epoch-04-work-email-verification-foundation-implementation.md)
- [Epoch 04: Redacted Proof Storage Retention Design](epochs/epoch-04-redacted-proof-storage-retention-design.md)
- [Epoch 04: Verification Submission Surface Implementation](epochs/epoch-04-verification-submission-surface-implementation.md)
- [Epoch 04: Verification Request Evidence Flows Implementation](epochs/epoch-04-verification-request-evidence-flows-implementation.md)
- [Epoch 04: Human Review Queue Foundation Implementation](epochs/epoch-04-human-review-queue-foundation-implementation.md)
- [Epoch 04: Verification Security Events Implementation](epochs/epoch-04-verification-security-events-implementation.md)
- [Epoch 04: Claims-Based Authorization Preparation](epochs/epoch-04-claims-based-authorization-preparation.md)
- [Epoch 04: Exit Report](epochs/epoch-04-exit-report.md)
- [Epoch 05: Operator/Admin Tooling Foundation Ticket Pack](epochs/epoch-05-operator-admin-tooling-tickets.md)
- [Product Pivot: Airline Email Verification And Community-Managed Boards](strategy/product-pivot-email-verification-community-boards.md) - forward direction: airline-email access for general app use and community-admin approval for restricted boards.
- [Airline Email Access Gate Decision](strategy/airline-email-access-gate-decision.md) - defines private-testing, first-base launch, and long-term app access gates for confirmed approved airline employee email.
- [Board / Community Access Model Decision](strategy/board-community-access-model-decision.md) - defines general baseboards, restricted boards, board memberships, access requests, and community-admin authority.
- [Proof-System Freeze / Deprecation Plan](strategy/proof-system-freeze-deprecation-plan.md) - freezes proof upload as a forward product path while preserving legacy cleanup, audit, and data-retirement safety.
- [First-Base MVP Scope](strategy/first-base-mvp-scope.md) - defines the first complete base launch package, including airline-email access, boards, posting/Q&A, moderation expectations, trust copy, and launch boundaries.
- [Base Board Product Definition](strategy/base-board-product-definition.md) - canonical definition of a Base Board as the main verified hub/container for an aviation base, combining structured base intel, posts/comments, useful/trending knowledge, related Layover Boards, and restricted Verified Lounges while preserving safety boundaries and T05 model validity.
- [Home Base And Board Follow Decision](strategy/home-base-board-follow-decision.md) - canonical T06 product decision that Home Base is optional personalization state in the initial DFW-only rollout, not authorization truth; setting Home Base auto-follows the matching Base Board; users may follow many boards; follows and self-declared profile fields do not grant restricted-board access.
- [Home Dashboard Product Definition](strategy/home-dashboard-product-definition.md) - canonical definition of the first private-app Home Dashboard as a utility dashboard, not a generic feed, with persistent search followed by Home Base, Crew Picks, Following, Your Lounges, and Saved.
- [Verified Lounge Access Model](strategy/verified-lounge-access-model.md) - canonical definition for restricted lounge access before `FBMVP-T07`, including request lifecycle, Crew Lead scope, request-thread limits, privacy boundaries, and the rule that Home Base, board follows, and self-declared profile fields do not grant lounge access.
- [Hub / Board Taxonomy](strategy/hub-board-taxonomy.md) - canonical product taxonomy that defines Hubs as top-level airport/location containers and defines product-facing Baseboard, Layovers, Lounges, and Crew Picks surfaces, including the MVP seeded Layovers strategy for common DFW crew destinations.
- [Community Admin Responsibilities / Disclaimer Policy](strategy/community-admin-responsibilities-disclaimer-policy.md) - defines board-scoped community-admin responsibilities, limits, privacy boundaries, non-sponsorship disclaimers, abuse controls, and escalation expectations.
- [Launch-Readiness Gate Transition Plan](strategy/launch-readiness-gate-transition-plan.md) - defines the explicit transition from private-testing beta gates to first-base launch gates without removing beta too early, requiring one-by-one beta grants, or bypassing airline-email verification.
- [Beta Invite-Code Foundation Decision](strategy/beta-invite-code-foundation-decision.md) - defines batch-generated, single-use beta invite codes as private-testing capacity control that must not bypass airline-email verification or become a first-base launch requirement.
- [05B First-Base MVP Planning](ops/05b-first-base-mvp-planning.md) - controlling narrow-lane planning note for the current 05B implementation start; use this doc so older broad beta/V1 planning does not pull the first slice too wide.
- [FBMVP-T05 Base Board Runtime Pass](ops/fbmvp-t05-base-board-runtime-pass.md) - records targeted runtime application of `20260609020355 create_base_board_model` to the intended `jmpseat` Supabase project, confirms only T05 was recorded in migration history, preserves known migration drift handling, and verifies DFW/base-board seed state plus RLS on the new metadata tables.
- [FBMVP-T06 Home Base And Board Follows](ops/fbmvp-t06-home-base-board-follows.md) - foundation for optional Home Base preference state, board follows as personalization state, and the authenticated `set_user_home_base` RPC that auto-follows the matching active Base Board without granting restricted access; the intended runtime has the base T06 schema/functions recorded as remote migration `20260609194858`, while the local repo file remains `20260609130534`, so follow-up hardening must use targeted migrations rather than re-applying or retro-marking local T06.
- [FBMVP-T06 Home Base And Board Follows Runtime Pass](ops/fbmvp-t06-home-base-board-follows-runtime-pass.md) - records the targeted runtime pass for T06, confirms the base T06 schema/functions already existed remotely as `20260609194858`, documents the local-vs-remote migration-ledger mismatch, and verifies targeted application of `20260609200310 harden_home_base_rpc_execute_grants` without unrelated migration changes.
- [FBMVP-T07 Verified Lounge Access Foundation](ops/fbmvp-t07-lounge-access-foundation.md) - schema/RLS foundation for restricted Verified Lounge memberships, access requests, request-scoped comments, and board-scoped Crew Lead grants; no UI, direct mutation policies, posts/comments, moderation, AI, or proof uploads are included.
- [FBMVP-T07 Verified Lounge Access Runtime Pass](ops/fbmvp-t07-lounge-access-runtime-pass.md) - records targeted runtime application of `20260609220055 create_lounge_access_foundation` to the intended `jmpseat` Supabase project, confirms only T07 was recorded in migration history, preserves known migration drift handling, and verifies RLS/policy posture on the new lounge access tables.
- [FBMVP-T08 Home Dashboard And DFW Hub Shell](ops/fbmvp-t08-home-hub-shell.md) - read-only private-app Home Dashboard and DFW Hub shell using product-facing Hub, Baseboard, Layovers, Lounges, and Crew Picks labels while preserving existing app gates and avoiding migrations, dashboard mutations, posting, saves, search backend, lounge request/review flows, AI, seed content, and proof-upload scope.
- [First-Base MVP Implementation Ticket Pack](epochs/first-base-mvp-implementation-ticket-pack.md) - translates the pivot strategy docs into the ordered `FBMVP` implementation sequence; the immediate post-Epoch-5 narrow lane is first reconciled in `ops/private-beta-readiness-bridge.md`, and auth email branding/custom SMTP is now tracked as a deferred beta-readiness polish TODO rather than the active next auth-flow implementation task.
- [FBMVP-T01: Freeze User-Facing Proof Verification Surfaces](epochs/fbmvp-t01-freeze-user-facing-proof-verification-surfaces.md) - freezes normal proof-upload UX while preserving historical proof infrastructure, cleanup, audit, and admin/operator safety.
- [FBMVP-T02: Airline Email Verification Access State Design](epochs/fbmvp-t02-airline-email-verification-access-state-design.md) - defines the forward `airline_email_verified` app-level eligibility state and how it maps from existing work-email verification foundations.
- [FBMVP-T02: Airline Email Verification Access State Implementation](epochs/fbmvp-t02-airline-email-verification-access-state-implementation.md) - adds the pure helper/adapter for deriving forward airline-email eligibility state without changing gates or creating migrations.
- [FBMVP-T03: Private-Testing Versus First-Base-Launch Gate Implementation](epochs/fbmvp-t03-private-testing-versus-first-base-launch-gate-implementation.md) - adds explicit launch modes and wires airline-email eligibility into the existing private-app access gate without creating migrations or implementing boards.
- [FBMVP-T03A: Beta Invite-Code Foundation Implementation](epochs/fbmvp-t03a-beta-invite-code-foundation-implementation.md) - adds hash-only beta invite-code storage, operator-only server generation, verified-airline-email-gated redemption, and private-testing access-hold entry without changing first-base or broader-launch gates.
- [FBMVP-T03A: Beta Invite-Code Foundation Runtime Pass](ops/beta-invite-code-foundation-runtime-pass.md) - records linked-runtime migration apply and validation for hash-only invite-code generation, redemption, audit behavior, and gate boundaries.
- [FBMVP-T04: Onboarding / Signup Flow Update](epochs/fbmvp-t04-onboarding-signup-flow-update.md) - aligns signup, login, profile, and access-hold copy with the airline-email eligibility and beta invite-code journey without changing gate rules or creating migrations. `/app/verification` is now deprecated in favor of `/app/access-hold`.
- [Founder/Admin Private-App Access Implementation](epochs/founder-admin-private-app-access-implementation.md) - reuses explicit operator grants for narrow internal private-app access during private testing without marking internal accounts as airline-email verified or changing normal user gates.
- [Operator Grant Management Implementation](epochs/operator-grant-management-implementation.md) - adds the authenticated post-bootstrap operator-managed grant path for minimal internal private-app access after the one-time bootstrap route is closed.
- [E05 Operator Grant Management Runtime Pass](ops/e05-operator-grant-management-runtime-pass.md) - records linked-runtime proof for the post-bootstrap operator grant RPC/action path, duplicate safety, non-operator denial, minimal internal scope behavior, and audit metadata redaction.
- [Operator Private-App Scope Gate Fix](ops/operator-private-app-scope-gate-fix.md) - narrows the private-app operator override to `operator.internal_private_app_access` only, keeps unrelated operator/admin tooling scopes separate from app-entry override, and is merged, beta-deployed, and runtime-proven at `03d7455`.
- [Security Events Trust Boundary Fix](ops/security-events-trust-boundary-fix.md) - runtime-proven security hardening that removes direct authenticated inserts into trusted `security_events`, marks legacy audit rows as unverified, keeps operator/admin audit views filtered to trusted server-produced rows, and preserves the server-side/service-role audit writer without broad Supabase `db push`.
- [Proof Upload Content Validation Fix](ops/proof-upload-content-validation-fix.md) - historical deployed proof-upload hardening that stops redacted proof upload from trusting browser MIME/extension alone and requires server-side JPEG/PNG byte validation before private Storage upload; proof uploads are now deprecated/out of current scope, and the old live authenticated mutation test is not an active blocker.
- [Security Headers Hardening](ops/security-headers-hardening.md) - runtime-proven browser header hardening that adds `nosniff`, strict-origin referrer policy, restrictive permissions policy, enforced anti-framing, and report-only broad CSP while leaving Vercel-provided HSTS unchanged and preserving public/beta behavior.
- [Public Vercel Analytics Readiness](ops/public-vercel-analytics-readiness.md) - review-ready public-only Vercel Web Analytics instrumentation for apex/`www` waitlist, Privacy, and Terms pages with host/path allowlisting, privacy-copy disclosure, and explicit exclusion of beta/auth/admin/app/lab routes.
- [Public Vercel Analytics Runtime Pass](ops/public-vercel-analytics-runtime-pass.md) - records deployment of public-only Vercel Web Analytics to apex/`www`, verification that analytics appears only on `/`, `/privacy`, and `/terms`, and preservation of beta/auth/app/admin/lab exclusion.
- [Beta Vercel Env Scoping](ops/beta-vercel-env-scoping.md) - records the persistent Preview env strategy for `beta.jmpseat.com`, including the required Supabase env names, the root cause of prior deployment-scoped env injection, normal beta deploy verification without manual Supabase env injection, and apex/`www` preservation.
- [Epoch 5 Final Closeout](ops/epoch-5-final-closeout.md) - closes the bounded operator/admin/security hardening lane with explicit carry-forward items for deprecated proof-upload scope, CSP reporting/enforcement, Vercel deployment-model maturity, Supabase migration-history drift handling, auth email branding/custom SMTP, and the next community-access/moderation lane.
- [Private Beta Readiness Bridge](ops/private-beta-readiness-bridge.md) - reconciles the closed Epoch 5 baseline with the broader private-beta docs, keeps proof uploads deprecated/out of current scope while preserving historical privacy/security obligations, tracks auth email branding/custom SMTP as deferred trust/deliverability polish, and defines the narrow lane before broader 05B / community-access implementation.
- [Post-E05 Public Waitlist Launch Plan](ops/post-e05-public-waitlist-launch-plan.md) - current planning source for the public `jmpseat.com` waitlist release, first-party capture, first-party metrics/admin dashboard, and Vercel/Supabase/Expo architecture direction.
- [Public Waitlist Page Polish](ops/public-waitlist-page-polish.md) - implementation note for first-party public waitlist email capture, optional product-shaping follow-up questions, safe persistence, and the continued separation from private beta/auth/admin.
- [Waitlist Question Research Selection](ops/waitlist-question-research-selection.md) - research-derived optional public waitlist follow-up question set and sensitive-data boundaries.
- [Waitlist Metrics Dashboard](ops/waitlist-metrics-dashboard.md) - implementation note for the operator/admin-only `/app/admin/waitlist` dashboard, aggregate demand signals and database-projected masked contact labels for `operator.read_audit`, server-side raw-contact loading only after `operator.view_waitlist_contacts`, controlled post-bootstrap waitlist-contact grants, first-operator bootstrap alignment for fresh environments, and pending runtime validation.
- [Public Waitlist Launch Readiness Check](ops/public-waitlist-launch-readiness-check.md) - W05 audit for root-domain launch readiness, W05A metadata/legal/accessibility blocker resolution, post-copy-polish readiness rerun status, rollback steps, and the final cutover checklist for moving the public waitlist to `jmpseat.com` while keeping `beta.jmpseat.com` private.
- [Public Waitlist Root Cutover Runtime Pass](ops/public-waitlist-root-cutover-runtime-pass.md) - records the successful `jmpseat.com` apex cutover, root waitlist capture/survey runtime proof, beta preservation checks, social metadata proof, rollback plan, and the remaining `www` DNS follow-up.
- [Public Waitlist Www Runtime Pass](ops/public-waitlist-www-runtime-pass.md) - records the successful `www.jmpseat.com` DNS/Vercel alias follow-up, public waitlist smoke test, apex preservation, beta preservation, and local resolver-cache caveat.
- [Waitlist Duplicate Survey Token Fix](ops/waitlist-duplicate-survey-token-fix.md) - runtime-proven security hardening for preventing anonymous duplicate waitlist submissions from receiving an existing signup's survey token or editing another signup's optional survey answers.
- [Auth Email Branding / Confirmation Template Ops Plan](ops/auth-email-branding-confirmation-template-plan.md) - deferred TODO package for branded jmpseat auth-email polish, covering ownership split across already-working Supabase and repo-owned email flows, sender/domain requirements, callback/redirect expectations, template copy targets, manual dashboard/provider steps, and later validation if this trust/deliverability work is activated.
- [Auth Design System Style Guide](ops/auth-design-system-style-guide.md) - defines the canonical auth visual system, current auth/onboarding surfaces, mobile fit rules, and deprecated auth UI patterns after the auth-flow redesign.
- [Auth Design Overhaul Docs Audit](ops/auth-design-overhaul-docs-audit.md) - records which current docs were updated for the auth design overhaul and which older epoch/strategy docs remain historical.
- [Work-Email Verification Code Flow Implementation](epochs/work-email-confirmation-email-flow-implementation.md) - records the approved-domain work-email verification switch to app-generated six-digit codes with hash-only storage, bounded failed attempts, inline `/app/access-hold` code entry, and legacy confirm-route compatibility.
- [Account Signup Code Confirmation Implementation](epochs/account-signup-code-confirmation-implementation.md) - switches normal Supabase account email confirmation to a code-first signup UX using Supabase Auth-native six-digit account confirmation codes while keeping airline employee email verification, beta access, launch mode, and legacy token-hash auth routes separate.
- [Auth Detour Closeout Runtime Pass](ops/auth-detour-closeout-runtime-pass.md) - records founder-confirmed stable beta auth runtime pass, `/app/access-hold` as the active verification/status surface, the soft-disable of the temporary `jmpseat.com` approved-domain workaround, and the return lane to Epoch 5 operator/admin tooling.
- [E05-T01: Operator Access Model Decision](epochs/e05-operator-access-model-decision.md)
- [E05-T02: Admin Shell And Navigation Foundation](epochs/e05-admin-shell-navigation-foundation.md)
- [E05 Operator Grants Foundation](epochs/e05-operator-grants-foundation.md) - explicit operator grants plus a one-time protected bootstrap route for the zero-grant state.
- [E05-T03: Approved Email Domain Management](epochs/e05-approved-domain-management.md) - operator-managed approved work-email domains with audited create/update/disable flows.
- [E05-T04: Reviewer Scope Management](epochs/e05-reviewer-scope-management.md) - operator-managed verification reviewer scopes with audited grant/revoke flows and self-escalation controls.
- [E05-T05: Verification Audit Inspection](epochs/e05-verification-audit-inspection.md) - operator-scoped metadata-only verification and security-event inspection without raw proof or URL exposure.
- [E05-T06: Proof Cleanup Monitoring](epochs/e05-proof-cleanup-monitoring.md) - read-only operator monitoring for proof cleanup status, failures, and sanitized cleanup audit events.
- [E05-T07: Protected Manual Proof Cleanup Controls](epochs/e05-protected-manual-proof-cleanup-controls.md) - bounded operator-triggered cleanup through the existing proof-retention helper with summary-only audit events.
- [Epoch 04: Approved Email Domain Read Policy Fix](epochs/epoch-04-approved-email-domain-read-policy-fix.md)
- [Verification Transactional Review Action Hardening](epochs/verification-transactional-review-action-hardening.md)
- [Redacted Proof Upload Storage Foundation](epochs/redacted-proof-upload-storage-foundation.md)
- [Redacted Proof Reviewer Routing Context Fix](epochs/redacted-proof-reviewer-routing-context-fix.md)
- [Proof Routing Context RPC Persistence Fix](epochs/proof-routing-context-rpc-persistence-fix.md)
- [Proof Request Reviewer RLS Routing Fix](epochs/proof-request-reviewer-rls-routing-fix.md)
- [Controlled Reviewer Proof Viewing Design](epochs/controlled-reviewer-proof-viewing-design.md)
- [Controlled Reviewer Proof Viewing Foundation](epochs/controlled-reviewer-proof-viewing-foundation.md)
- [Proof Retention Deletion Automation Design](epochs/proof-retention-deletion-automation-design.md)
- [Proof Retention Deletion Cleanup Foundation](epochs/proof-retention-deletion-cleanup-foundation.md)
- [Proof Retention Cleanup Trigger Foundation](epochs/proof-retention-cleanup-trigger-foundation.md)
- [Proof Cleanup Vercel Cron Compatibility](epochs/proof-cleanup-vercel-cron-compatibility.md)
- [Verification Runtime Pass: American Airlines Test](ops/verification-runtime-pass-american-airlines.md)
- [Redacted Proof Upload Runtime Pass](ops/redacted-proof-upload-runtime-pass.md)
- [Controlled Proof Viewing Runtime Pass](ops/controlled-proof-viewing-runtime-pass.md)
- [Proof Retention Deletion Runtime Pass](ops/proof-retention-deletion-runtime-pass.md)
- [Proof Retention Cleanup Trigger Runtime Pass](ops/proof-retention-cleanup-trigger-runtime-pass.md)
- [Operator Grants Bootstrap Runtime Pass](ops/operator-grants-bootstrap-runtime-pass.md)
- [Approved Domain Management Runtime Pass](ops/approved-domain-management-runtime-pass.md)
- [Reviewer Scope Management Runtime Pass](ops/reviewer-scope-management-runtime-pass.md)
- [Verification Audit Inspection Runtime Pass](ops/verification-audit-inspection-runtime-pass.md)
- [Proof Cleanup Monitoring Runtime Pass](ops/proof-cleanup-monitoring-runtime-pass.md)
- [Protected Manual Proof Cleanup Controls Runtime Pass](ops/protected-manual-proof-cleanup-controls-runtime-pass.md)
- [Proof Retention Cleanup Operator Runbook](ops/proof-retention-cleanup-operator-runbook.md)
- [Proof Retention Cleanup Scheduler Compatibility](ops/proof-retention-cleanup-scheduler-compatibility.md)
- [Supabase Runtime Setup](ops/supabase-runtime-setup.md)
- [Supabase CLI Migration Workflow](ops/supabase-cli-migration-workflow.md)
- [Verification Method Decision](VERIFICATION_METHOD_DECISION.md)

Documentation hygiene reminder:

- Future tickets should identify documentation impact and include docs-update acceptance criteria when applicable. See `PRODUCT_DELIVERY_OPERATING_MODEL.md`.
- Current implementation work is paused for the product pivot. E05-T08 should not proceed until pivot planning is complete, and future tasks should not expand proof-upload verification unless explicitly instructed.
- E05-T07 runtime proof is committed on `main`; if an older or parallel branch still has uncommitted E05-T07 runtime-proof docs, commit those before starting pivot planning.
- Next implementation work should follow the post-E05 public waitlist launch lane in `ops/post-e05-public-waitlist-launch-plan.md`: keep first-party public waitlist capture Beta Access-free, keep `beta.jmpseat.com` as the private beta/auth/admin surface, preserve the future Expo/EAS native path, and use `ops/public-waitlist-launch-readiness-check.md`, `ops/public-waitlist-root-cutover-runtime-pass.md`, `ops/public-waitlist-www-runtime-pass.md`, and `ops/waitlist-duplicate-survey-token-fix.md` as the current W05 launch record. W05A addresses the prior metadata/legal/accessibility launch blockers in code, the public homepage and legal-copy polish are merged, root `jmpseat.com` now serves the public waitlist with runtime-proven capture and optional survey persistence, `www.jmpseat.com` now serves the same public waitlist experience, and duplicate survey-token hardening is migration-first deployed and runtime-proven. Tally is backup/research-only unless intentionally reintroduced later. `FBMVP-T01` through `FBMVP-T04`, auth design-system overhaul, founder/admin internal access, post-bootstrap operator grant management, app-generated work-email verification codes, account signup code confirmation, auth detour closeout, public waitlist runtime validation, waitlist dashboard runtime validation, and founder full-contact dashboard visual confirmation are already implemented or documented in their respective epoch/ops notes. `ops/auth-email-branding-confirmation-template-plan.md` remains the deferred Supabase Auth confirmation/reset branding TODO for trust/deliverability/polish; it is not an auth-flow implementation blocker. Content/moderation policy can still be refined before live community launch if needed.

Scalability guardrail:

- Future auth, database, community, moderation, storage, search, admin, and AI tickets should follow `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`.
- Future auth, account/profile, beta-access, verification, community, moderation, notifications, storage, admin, and AI tickets should also follow `MOBILE_APP_STRATEGY.md`.

Client-scope rule:

- Future implementation tickets must identify whether the work is `web-only`, `mobile-ready`, or `shared-core`.
- If a ticket is `shared-core` or `mobile-ready`, it must describe how the logic, data access, and authorization rules can be reused by a future mobile client.

## Current 05B Lane

Use `ops/05b-first-base-mvp-planning.md` as the controlling note for the
current 05B implementation start.

Use `strategy/base-board-product-definition.md` as the canonical product
definition for what a Base Board is when extending the T05/T06 foundation.

Use `strategy/home-base-board-follow-decision.md` as the canonical product
decision for Home Base and Board Follow behavior in T06 and later follow
surfaces.

Use `strategy/home-dashboard-product-definition.md` as the canonical product
definition for the first private-app Home Dashboard before implementing
restricted lounge access or the DFW Base Board dashboard shell.

Use `strategy/verified-lounge-access-model.md` as the canonical product
definition for Verified Lounge access, request lifecycle, Crew Lead scope, and
privacy boundaries before implementing `FBMVP-T07`.

Current first code ticket:

- `FBMVP-T05: Base, Board, And Board-Type Data Model Design`

Current T05 implementation status:

- Merged on `main` at `87b7693`.
- Runtime-applied to the intended `jmpseat` Supabase project through the
  targeted T05 pass recorded in `ops/fbmvp-t05-base-board-runtime-pass.md`.
- Adds `bases`, `board_types`, and `boards`.
- Seeds DFW as the first launch base and DFW Base Board as the first available
  board.
- Initial rollout remains DFW-only; T06 should use an optional DFW-start choice
  instead of a fake one-option Home Base picker.
- Seeds board types `base_board`, `layover_board`, and `verified_lounge`.
- Does not implement follows, home-base preferences, memberships, access
  requests, posts, comments, saves, reactions, search, reports, or moderation.

Current T06 implementation status:

- Merged on `main` at `a4cb0b1`.
- The intended Supabase runtime already has the T06 schema/functions recorded
  as remote migration `20260609194858 create_home_base_board_follows`.
- The local repo T06 file remains
  `20260609130534_create_home_base_board_follows.sql`; do not re-apply it and
  do not mark `20260609130534` applied retroactively.
- Adds `user_home_base_preferences` and `board_follows`.
- Adds an authenticated `set_user_home_base(p_base_code text)` RPC to set the
  current user's Home Base and auto-follow the matching active Base Board.
- Follow-up migration
  `20260609200310_harden_home_base_rpc_execute_grants.sql` removes explicit
  `anon` EXECUTE from the three T06 RPCs and preserves authenticated/service
  role execution.
- The targeted runtime apply pass for that hardening is recorded in
  `ops/fbmvp-t06-home-base-board-follows-runtime-pass.md`.
- Adds server-side helper functions for reading Home Base/follows and setting
  Home Base through the RPC.
- Keeps missing Home Base as a valid initial DFW-only rollout state that does
  not block app access.
- Keeps Home Base and follows as personalization/subscription state only.
- Does not grant restricted access, create lounge memberships, create access
  requests, or rely on self-declared `claimed_base`, `claimed_airline`, or
  `claimed_role`.
- Future runtime schema changes must still use targeted apply because known
  Supabase migration-history drift remains.

Current T07 implementation status:

- T07 is merged and runtime-applied.
- Runtime migration history includes
  `20260609220055 create_lounge_access_foundation`.
- Adds `lounge_memberships`, `lounge_access_requests`,
  `lounge_request_comments`, and `lounge_admin_grants`.
- Keeps active lounge membership as the future restricted content access truth.
- Keeps requests, Home Base, board follows, and self-declared profile fields
  from granting lounge access.
- Adds RLS and authenticated read policies scoped to own rows or active Crew
  Lead grants.
- Does not add direct write policies or mutation RPCs.
- Does not implement UI, posts/comments, saves/reactions, search, moderation,
  AI, marketplace/deals, or proof-upload scope.
- The runtime pass used targeted apply only. Known Supabase migration-history
  drift remains and still blocks broad `supabase db push`.

DFW is the first launch base and the DFW Base Board is the first available base
board. DFW is not the whole product concept. The data model should support many
bases, base boards, layover boards, Verified Lounges / restricted role-based
spaces, follows/subscriptions, memberships, community-admin grants, and future
posts/comments/saves/reactions/search from the start.

Current sequence:

1. `FBMVP-T05` base, board, and board-type data model
2. `FBMVP-T06` Home Base preference and board-follow foundation, governed by
   the Home Base and Board Follow decision note
3. Home Dashboard product definition, governing the first private-app screen
   hierarchy before `FBMVP-T07`/`FBMVP-T08`
4. `FBMVP-T07` restricted lounge membership/access request/Crew Lead foundation
5. Hub / Board taxonomy, governing Hubs, Baseboard, Layovers, Lounges, Crew
   Picks, and MVP seeded Layovers before further dashboard/discovery/posting
   implementation
6. `FBMVP-T08` Home Dashboard and DFW Hub read-only shell
7. `FBMVP-T09` board/layover discovery and follow UI shell
8. `FBMVP-T10` text posts/comments foundation
9. `FBMVP-T11` saves/reactions/useful/trending foundation
10. `FBMVP-T12` search foundation with access-aware boundaries
11. `FBMVP-T13` reporting/moderation/admin controls
12. `FBMVP-T14` seeded DFW content, safety copy, and launch validation

Do not let older broad V1/backlog sections below turn this into an unsequenced
social feed or marketplace build. For the current lane, keep proof uploads,
manual proof/document uploads, generic global Crew Rooms expansion,
media/upload posting, AI auto-publishing, deals, full mobile scope, and
anonymous posting unless separately approved out of scope.

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

Current-status note:

- The sequence above remains a broad historical backlog reference.
- It is not the controlling first 05B implementation lane.
- For the current start point, use `ops/05b-first-base-mvp-planning.md` and
  begin with `FBMVP-T05`.

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
