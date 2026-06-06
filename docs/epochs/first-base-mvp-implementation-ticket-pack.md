# First-Base MVP Implementation Ticket Pack

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Executive Summary

This is the implementation ticket pack for the pivoted First-Base MVP. It translates the completed strategy docs into an ordered, reviewable implementation plan for airline-email general access, general baseboards, restricted board access requests, community-admin approval, text-only board content, baseline moderation/reporting, and launch-readiness validation.

This pack supersedes continuing E05-T08 as the next implementation path. E05-T08 remains paused unless explicitly reactivated. The completed Epoch 04 and Epoch 05 proof/admin foundations remain historical/runtime-proven infrastructure, not the forward product roadmap.

Implementation should proceed in small, reviewable slices. Each ticket should stop before commit for review unless the user explicitly asks for commit/merge work after review.

Proof-upload expansion remains frozen. The First-Base MVP must not add new badge upload, proof upload, proof review, proof-based role/base claims, or proof cleanup expansion.

## 2. Source Docs

This pack is based on:

- `docs/strategy/product-pivot-email-verification-community-boards.md`
- `docs/strategy/airline-email-access-gate-decision.md`
- `docs/strategy/board-community-access-model-decision.md`
- `docs/strategy/proof-system-freeze-deprecation-plan.md`
- `docs/strategy/first-base-mvp-scope.md`
- `docs/strategy/community-admin-responsibilities-disclaimer-policy.md`
- `docs/strategy/launch-readiness-gate-transition-plan.md`
- `docs/strategy/beta-invite-code-foundation-decision.md`
- `docs/ops/auth-email-branding-confirmation-template-plan.md`

## 3. Non-Negotiable Boundaries

- No badge upload.
- No proof upload.
- No proof-based role/base claims.
- No employer-system lookup.
- No AI/OCR verification.
- No official airline sponsorship implication.
- No community-admin access to proof systems.
- No deleting existing proof infrastructure without a separate reviewed plan.
- No removing the beta gate except through an explicit launch-readiness task.
- No code or migration task should combine unrelated concerns.

## 4. Recommended Implementation Sequence

Recommended order:

1. `FBMVP-T01` Freeze user-facing proof verification surfaces. Implemented and merged; see `docs/epochs/fbmvp-t01-freeze-user-facing-proof-verification-surfaces.md`.
2. `FBMVP-T02` Airline-email verification access state design/implementation. Helper implementation complete and merged; see `docs/epochs/fbmvp-t02-airline-email-verification-access-state-design.md` and `docs/epochs/fbmvp-t02-airline-email-verification-access-state-implementation.md`.
3. `FBMVP-T03` Private-testing versus first-base-launch gate implementation. Implemented and merged; see `docs/epochs/fbmvp-t03-private-testing-versus-first-base-launch-gate-implementation.md`.
4. `FBMVP-T03A` Beta invite-code foundation. Implemented and runtime-proven on the linked Supabase runtime; see `docs/strategy/beta-invite-code-foundation-decision.md`, `docs/epochs/fbmvp-t03a-beta-invite-code-foundation-implementation.md`, and `docs/ops/beta-invite-code-foundation-runtime-pass.md`.
5. `FBMVP-T04` Onboarding/signup flow update. Implemented and merged; see `docs/epochs/fbmvp-t04-onboarding-signup-flow-update.md`.
6. Auth email branding / confirmation template manual ops. Planned; see `docs/ops/auth-email-branding-confirmation-template-plan.md`. This should be completed before founder/Yuri Vercel testing or public-ish Closed Beta Login entry.
7. `FBMVP-T05` Base and board data model design.
8. `FBMVP-T06` Board membership and access request model.
9. `FBMVP-T07` Community-admin role model.
10. `FBMVP-T08` General baseboard route foundation.
11. `FBMVP-T09` Restricted board request-access flow.
12. `FBMVP-T10` Community-admin request review UI.
13. `FBMVP-T11` Text-only posts and replies MVP.
14. `FBMVP-T12` Basic moderation/reporting MVP.
15. `FBMVP-T13` Trust/disclaimer copy placement.
16. `FBMVP-T14` First-base launch readiness validation.

## 5. Per-Ticket Detail

### FBMVP-T01 Freeze User-Facing Proof Verification Surfaces

Status: implemented and validated locally; stop before commit for review. See `docs/epochs/fbmvp-t01-freeze-user-facing-proof-verification-surfaces.md`.

Goal: Hide or disable proof upload from normal user flows and update verification copy so proof upload is no longer presented as a forward app-access path.

Scope:

- Hide or disable proof upload CTAs/forms for normal users.
- Update `/app/verification` copy around the pivot.
- Preserve legacy proof ops/admin safety.
- Add regression tests preventing proof-upload reintroduction in normal user flows.

Out of scope:

- Schema deletion.
- Storage bucket deletion.
- Proof cleanup behavior changes.
- Reviewer/operator proof tooling removal.

Likely files/areas:

- `app/app/verification/page.tsx`
- `src/lib/verification/surface.ts`
- `src/lib/verification/actions.ts` only if needed to block normal proof submission safely
- verification surface tests
- strategy/epoch docs and runtime proof docs

Migration likely needed: no.

Authorization/security boundaries:

- Normal users must not be offered proof upload.
- Legacy operator/reviewer proof safety tools must remain protected and unchanged unless explicitly scoped.
- No raw proof files, storage paths, signed URLs, filenames, or proof contents may be exposed.

Tests expected:

- Verification page no longer presents proof upload as a current path.
- Normal user proof-upload action is unavailable or safely blocked if still reachable.
- Existing proof access, proof retention, and cleanup tests remain passing.
- Approved-domain/work-email tests remain passing.

Runtime validation expected:

- Confirm `/app/verification` shows pivot-safe airline-email copy.
- Confirm no normal proof-upload path is visible.
- Confirm legacy proof cleanup/admin routes remain protected.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not run `supabase db push` unless a later reviewed migration task explicitly requires it.

### FBMVP-T02 Airline-Email Verification Access State Design/Implementation

Status: helper implementation complete pending review. See `docs/epochs/fbmvp-t02-airline-email-verification-access-state-design.md` and `docs/epochs/fbmvp-t02-airline-email-verification-access-state-implementation.md`.

Goal: Refactor existing work-email verification into the forward `airline_email_verified` app-level access state.

Implemented scope:

- Add a pure helper/adapter that derives safe airline-email access state from existing approved-domain, verification request, evidence, and claim records.
- Preserve approved domain management without schema changes.
- Support verification timestamp, pending, unsupported-domain, revoked, expired, not-verified, and not-ready states.
- Keep login email and airline employee email distinct.

Deferred scope:

- Schema normalization for future expiry/refresh/revocation complexity, if later justified by a reviewed migration task.
- Gate integration and launch-mode behavior.

Out of scope:

- Role/base claim issuance.
- Board membership.
- Launch gate switch.
- Proof upload.

Implemented files/areas:

- `src/lib/verification/airlineEmailAccess.ts`
- `test/verification/airlineEmailAccess.test.mts`
- `docs/epochs/fbmvp-t02-airline-email-verification-access-state-implementation.md`

Migration likely needed: no for the helper/adapter implementation. Future schema work may still be reviewed separately if the adapter becomes insufficient.

Authorization/security boundaries:

- Airline-email verification proves broad eligibility only.
- Unsupported domains must not grant access.
- Personal login email alone must not prove eligibility.
- Verification state must not grant restricted-board access.

Tests expected:

- Supported approved-domain email can become `airline_email_verified`.
- Unsupported, expired, revoked, or pending states do not grant access.
- Login email and airline employee email can be distinct.
- No role/base/global restricted-board claims are issued.

Runtime validation expected:

- Apply migration only after review/merge in a separate runtime task.
- Runtime-prove approved and unsupported domain paths without printing privileged identifiers or secrets.

Stop-before-commit/review requirements:

- Stop before commit after implementation and local validation.
- Keep migration unapplied until explicit migration-apply task.

### FBMVP-T03 Private-Testing Versus First-Base-Launch Gate Implementation

Goal: Add explicit launch mode behavior for private testing, first-base launch, broader launch, and internal test flags.

Scope:

- Add explicit launch mode config: `private_testing`, `first_base_launch`, `broader_launch`, `internal_test`.
- During `private_testing`, require beta access plus airline-email verification.
- During `first_base_launch`, require airline-email verification for the launched population without one-by-one beta grants.
- Add access-hold/access-restricted copy for each relevant denial state.

Out of scope:

- Board implementation.
- Airline-email state creation if not already complete.
- Broad public launch.

Likely files/areas:

- `src/lib/privateApp/access.ts`
- `src/lib/betaAccess/*`
- `app/app/access-hold/page.tsx`
- `app/auth/callback/route.ts`
- private-app/access tests
- auth route tests

Migration likely needed: unlikely unless mode is stored in database.

Authorization/security boundaries:

- Do not remove beta casually.
- Do not let beta imply airline-email eligibility.
- Do not let airline-email verification grant restricted board access.
- Launch mode must be explicit and test-covered.

Tests expected:

- `private_testing` requires beta plus airline-email verification.
- `first_base_launch` does not require manual beta grants for launched population.
- Unsupported/unverified airline email blocks app/baseboard access.
- Reviewer/operator/community-admin authority is not inferred from app access.

Runtime validation expected:

- Runtime-prove each launch mode gate with safe test users or safe fixtures.
- Record runtime proof docs for gate behavior.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not change production launch mode or deploy in the implementation task.

### FBMVP-T03A Beta Invite-Code Foundation

Status: implemented and runtime-proven on the linked Supabase runtime; runtime-proof review pending. See `docs/strategy/beta-invite-code-foundation-decision.md`, `docs/epochs/fbmvp-t03a-beta-invite-code-foundation-implementation.md`, and `docs/ops/beta-invite-code-foundation-runtime-pass.md`.

Goal: Implement the private-testing beta invite-code foundation before onboarding/signup work depends on invite-code copy, access-hold behavior, or beta-access grant semantics.

Implemented scope:

- Batch-generated invite codes for private testing capacity control.
- Single-use by default.
- Random and non-personal by default.
- Hash-only storage after generation.
- Operator-only server batch generation helper requiring `operator.manage_beta_invites`.
- Batch pause/close/revoke states and code revoked/expired/redeemed states.
- Safe audit event taxonomy for batch creation, redemption, failed redemption, and beta grants from invite redemption.
- Redemption grants beta access only after server-side validation.
- Invite codes never prove airline eligibility.
- Access-hold redemption form appears only when beta access is required and airline-email eligibility is verified.

Out of scope:

- Full operator/admin invite-code UI.
- FBMVP-T04 onboarding/signup changes.
- Baseboards, board memberships, posting, or restricted-board gates.
- App-gate changes beyond beta access becoming grantable through invite redemption.
- Launch-mode behavior changes for `first_base_launch` or `broader_launch`.
- Community-admin invite management.
- Restricted-board access.
- Proof upload or badge upload.

Implemented files/areas:

- `supabase/migrations/20260606120000_add_beta_invite_code_foundation.sql`
- `src/lib/betaAccess/*`
- `app/app/access-hold/page.tsx`
- beta access and private-app access tests

Migration created and applied to the linked Supabase runtime. Runtime validation is recorded in `docs/ops/beta-invite-code-foundation-runtime-pass.md`.

Authorization/security boundaries:

- Invite code alone must not grant app access.
- Invite code must not grant airline-email verification.
- Invite code must not grant restricted board access, reviewer access, operator access, or community-admin authority.
- Plaintext invite codes must not be logged or stored after generation.
- Redemption errors must not reveal whether a code exists, expired, was revoked, or was already redeemed in an enumeration-helpful way.

Tests expected:

- Batch generation is operator-only and bounded.
- Codes are single-use by default.
- Redemption grants beta access only through server-side validation.
- `private_testing` still requires airline-email verification plus beta access.
- `first_base_launch` and `broader_launch` do not require invite codes for general launched access.
- Invalid redemption failures are safe and generic.
- Plaintext codes, secrets, tokens, and private identifiers are not logged or returned after generation.

Runtime validation expected:

- Runtime-prove operator batch generation, redemption, duplicate redemption denial, revoked/expired denial, and launch-mode boundaries without printing secrets, privileged identifiers, plaintext codes, or private user data.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not run `supabase db push` until an explicit migration-apply task.

### FBMVP-T04 Onboarding/Signup Flow Update

Status: implemented and merged. See `docs/epochs/fbmvp-t04-onboarding-signup-flow-update.md`.

Goal: Update onboarding and signup so airline employee email is collected or verified as the eligibility credential while login credentials remain stable account credentials.

Implemented scope:

- Updated signup/login copy so account credentials, airline-email eligibility, and closed beta invite-code requirements are legible.
- Updated access-hold copy while preserving existing launch-mode and invite-code gate behavior.
- Updated verification page copy to reflect the implemented gate model.
- Updated profile copy to keep self-declared profile fields separate from airline employee email verification.
- Kept profile requirements minimal and did not add a migration.

Out of scope:

- Proof upload.
- Restricted board requests.
- Community-admin tooling.

Likely files/areas:

- `app/signup/page.tsx`
- `app/app/profile/page.tsx`
- `src/lib/profile/*`
- `src/lib/auth/*`
- verification request flow modules
- profile/auth tests

Migration created: no.

Authorization/security boundaries:

- Do not treat personal login email as eligibility.
- Do not expose full airline employee email in public/profile surfaces.
- Avoid over-collecting profile data.

Tests expected:

- Distinct login email and airline employee email are supported.
- Minimal required profile fields are enforced.
- Unsupported airline email routes users to safe hold/copy.
- No proof-upload onboarding requirement exists.

Runtime validation expected:

- Verify signup/onboarding paths for supported and unsupported domains.
- Confirm user-facing copy does not imply official airline sponsorship.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not deploy or change live rollout copy without review.

Follow-up before founder/Yuri Vercel testing or public-ish waitlist login entry:

- Supabase confirmation email template / custom SMTP / auth email branding polish, following `docs/ops/auth-email-branding-confirmation-template-plan.md`.
- Keep the Closed Beta Login landing entry deferred until this auth email experience is configured and validated.

### FBMVP-T05 Base And Board Data Model Design

Goal: Define the base and board schema needed for one general baseboard and a small restricted-board set.

Scope:

- Define bases, boards, board types, slugs, and visibility.
- Keep the first migration narrow.
- Include RLS/server authorization plan.
- Use DFW as a planning fixture only unless formally selected.

Out of scope:

- Posts/replies unless intentionally deferred to later tickets.
- Access request review UI.
- Community-admin actions.

Likely files/areas:

- `supabase/migrations`
- `src/lib/community` or similar future shared-core module
- future route tests and RLS/source tests
- docs indexes and epoch docs

Migration likely needed: yes.

Authorization/security boundaries:

- General board visibility must still require app eligibility.
- Restricted board content visibility must not be implemented until membership exists.
- Slugs must not leak private membership details.

Tests expected:

- Source/migration tests for tables, constraints, indexes, RLS posture, and slug uniqueness.
- Server helpers only expose safe board metadata to eligible users.

Runtime validation expected:

- Migration apply in separate runtime task after review/merge.
- Confirm board metadata reads are bounded and access-controlled.

Stop-before-commit/review requirements:

- Stop before commit after implementation and local validation.
- Keep migration unapplied until explicit migration-apply task.

### FBMVP-T06 Board Membership And Access Request Model

Goal: Define board-scoped membership and request records for restricted boards.

Scope:

- Create `board_memberships` and `board_access_requests`.
- Support statuses: `requested`, `approved`, `denied`, `revoked`; `expired` optional later.
- Enforce board-scoped access only.
- Add audit/security event plan.

Out of scope:

- Global role/base claims.
- Posts/replies.
- Community-admin UI.

Likely files/areas:

- `supabase/migrations`
- future community access libraries
- RLS/source tests
- docs/epochs updates

Migration likely needed: yes.

Authorization/security boundaries:

- Membership in one board must not grant another board.
- General baseboard access must not grant restricted-board content.
- Airline-email verification alone must not grant restricted-board access.

Tests expected:

- Request lifecycle source tests.
- Membership access matrix tests.
- RLS/source tests for board-scoped read/write boundaries.

Runtime validation expected:

- Runtime-prove request creation and membership-gated reads after migration apply.

Stop-before-commit/review requirements:

- Stop before commit after implementation and local validation.
- Do not combine with posting implementation.

### FBMVP-T07 Community-Admin Role Model

Goal: Define board-scoped community admin grants and the explicit first-admin appointment model.

Scope:

- Define board/community admin grants.
- Appoint first community admin explicitly by jmpseat operator.
- Keep community-admin authority separate from platform operator tools.
- Audit grant/revoke actions.

Out of scope:

- Community-admin request review UI.
- Platform operator grant redesign.
- Proof-system access.

Likely files/areas:

- `supabase/migrations`
- `src/lib/admin/access.ts` if operator appointment tooling is added
- future `src/lib/communityAdmin/*`
- admin/community tests

Migration likely needed: yes.

Authorization/security boundaries:

- Community admin cannot access platform operator tools.
- Community admin cannot access proof systems.
- Community admin authority is board-scoped and revocable.
- Community admin is not inferred from airline domain, beta, profile, or verification status.

Tests expected:

- Board-scoped admin grant/revoke tests.
- Cross-board denial tests.
- Proof/admin platform access denial tests for community admins.

Runtime validation expected:

- Runtime-prove first-admin appointment and revocation with redacted operator/user identifiers.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Keep migration unapplied until explicit migration-apply task.

### FBMVP-T08 General Baseboard Route Foundation

Goal: Implement the first general baseboard route shell for eligible users.

Scope:

- Add first base route shell.
- Use DFW as a planning fixture only unless formally selected.
- Show general board shell to eligible users.
- Keep content minimal until posts are implemented.

Out of scope:

- Overbuilt forum behavior.
- Restricted board content.
- Posts/replies.
- Broad base directory.

Likely files/areas:

- `app/app/base` or selected route pattern
- future `src/lib/community/*`
- private app nav/shell
- route tests

Migration likely needed: no if FBMVP-T05 already created required schema.

Authorization/security boundaries:

- Route must require private app gate and airline-email eligibility.
- No proof status should be required.
- No restricted-board content should leak.

Tests expected:

- Unauthorized users are denied.
- Eligible users can view general board shell.
- Beta-only or proof-only users do not bypass airline-email gate.
- Restricted boards remain hidden or request-only.

Runtime validation expected:

- Runtime-prove route access for eligible and ineligible users.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not launch broad live community content in this ticket.

### FBMVP-T09 Restricted Board Request-Access Flow

Goal: Make restricted boards discoverable/requestable while keeping content hidden until membership is approved.

Scope:

- Add restricted board request-access screen.
- Allow eligible users to submit a board access request.
- Keep request fields minimal.
- Provide safe copy that request approval is community-managed.

Out of scope:

- Proof upload.
- Community-admin review UI.
- Restricted content display before membership approval.

Likely files/areas:

- `app/app/base/[baseCode]/boards/[boardSlug]/request-access`
- future community access actions/helpers
- request flow tests

Migration likely needed: no if FBMVP-T06 already created required schema.

Authorization/security boundaries:

- Request creation requires airline-email app eligibility.
- Restricted content remains hidden before approval.
- No badge/document/proof fields are accepted.

Tests expected:

- Eligible users can request access.
- Ineligible users cannot request access.
- Duplicate active requests are bounded.
- Request payload cannot include proof files, storage paths, or hidden IDs.

Runtime validation expected:

- Runtime-prove request creation and denial paths.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not add approval UI in the same ticket unless explicitly rescoped.

### FBMVP-T10 Community-Admin Request Review UI

Goal: Give board-scoped community admins a minimal queue for approving, denying, and revoking restricted board access.

Scope:

- Board-scoped request queue.
- Approve, deny, and revoke actions.
- Audited actions.
- Minimal applicant visibility.

Out of scope:

- Platform operator tools beyond appointment/override if already scoped.
- Full moderation queue.
- Proof access.

Likely files/areas:

- future `app/app/admin/community` or scoped community-admin route
- future `src/lib/communityAdmin/*`
- security event taxonomy/tests
- admin shell/nav if needed

Migration likely needed: possibly for audit event types or action tables.

Authorization/security boundaries:

- Community admins can review only boards they manage.
- Applicant visibility must remain minimal.
- Full login/airline emails, proof files, platform audit internals, and unrelated memberships remain hidden.

Tests expected:

- Board admin can approve/deny/revoke only for managed boards.
- Cross-board attempts are denied.
- Normal users, reviewers, beta users, and operators without scoped community-admin role cannot use board-admin actions unless separately granted.
- Audit events are recorded.

Runtime validation expected:

- Runtime-prove scoped approval, denial, revocation, and cross-board denial.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Keep migrations unapplied until explicit migration-apply task.

### FBMVP-T11 Text-Only Posts And Replies MVP

Goal: Add the smallest useful board discussion primitives for general and restricted boards.

Scope:

- Board threads/posts.
- Replies/comments.
- Text only.
- Basic author display identity and timestamps.
- Respect board access gates.

Out of scope:

- Images/files/rich media.
- Direct messages.
- AI content tools.
- Anonymous posting unless separately approved.

Likely files/areas:

- `supabase/migrations`
- future `src/lib/communityPosts/*`
- board route pages
- post/reply tests

Migration likely needed: yes.

Authorization/security boundaries:

- Posts and replies must be server-authorized and RLS-protected.
- Users cannot read/write restricted-board content without membership.
- Output must be escaped/sanitized.
- Deleted/hidden content must not appear to ordinary users.

Tests expected:

- Create/read reply flows for general and restricted boards.
- Unauthorized read/write denial.
- Stored XSS regression tests.
- Deleted/hidden visibility tests.

Runtime validation expected:

- Runtime-prove text-only post/reply behavior for eligible, member, and non-member users.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not add media/files/DMs in this ticket.

### FBMVP-T12 Basic Moderation/Reporting MVP

Goal: Add minimum reporting and scoped moderation needed before real launch.

Scope:

- Report post/comment.
- Hide/remove content if scoped moderation is included.
- Operator escalation path.
- Audit moderation actions.

Out of scope:

- Broad platform moderation overbuild.
- Automated AI moderation.
- Strike/appeal workflow beyond lightweight MVP if not explicitly scoped.

Likely files/areas:

- `supabase/migrations`
- future `src/lib/moderation/*`
- report actions/routes
- community-admin/operator moderation UI
- moderation tests

Migration likely needed: yes.

Authorization/security boundaries:

- Reports must not expose reporter identity broadly.
- Moderation authority must be board-scoped unless platform operator authority is explicitly used.
- Actions must be audited.

Tests expected:

- Report creation.
- Duplicate/spam controls if implemented.
- Scoped hide/remove authorization.
- Audit event coverage.
- Unauthorized moderation denial.

Runtime validation expected:

- Runtime-prove report and moderation smoke paths before launch.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not open real member-generated content broadly before this is complete.

### FBMVP-T13 Trust/Disclaimer Copy Placement

Goal: Place non-sponsorship, community-admin, and proof-free access copy in the user flows where trust boundaries matter.

Scope:

- Non-sponsorship disclaimers.
- Community-admin disclaimers.
- No official airline verification language.
- No proof upload copy.
- Terms/disclaimer acceptance hooks if required.

Out of scope:

- Final legal policy approval.
- New access model behavior unless already implemented by prior tickets.

Likely files/areas:

- access-hold/restricted pages
- verification/onboarding pages
- board/request-access pages
- community-admin pages
- docs and tests for copy boundaries

Migration likely needed: possibly if acceptance needs persistence.

Authorization/security boundaries:

- Copy must not imply airline/airport/union/employer endorsement.
- Copy must not describe restricted-board membership as official verification.
- Copy must not request sensitive employer documents.

Tests expected:

- Source tests for required disclaimer snippets.
- Regression tests ensuring proof-upload copy is absent from forward user flows.
- Accessibility checks for required notices.

Runtime validation expected:

- Manual or browser validation of key routes.
- Confirm no proof-upload, official sponsorship, or employer-verification implication appears.

Stop-before-commit/review requirements:

- Stop before commit after implementation and validation.
- Do not deploy broad launch copy without review.

### FBMVP-T14 First-Base Launch Readiness Validation

Goal: Runtime-prove the completed First-Base MVP flow before declaring launch readiness.

Scope:

- End-to-end testing.
- Launch mode verification.
- Airline-email access gate runtime proof.
- Board access request runtime proof.
- Community-admin approval runtime proof.
- Moderation/reporting smoke test.
- Rollback plan.

Out of scope:

- New feature implementation.
- Production deployment unless explicitly requested.
- Proof cleanup/proof upload expansion.

Likely files/areas:

- `docs/ops/*runtime-pass.md`
- `docs/BUILD_TICKETS.md`
- `docs/EPOCH_ROADMAP.md`
- focused runtime validation scripts/docs if needed

Migration likely needed: no, unless a runtime defect requires a reviewed fix.

Authorization/security boundaries:

- No secrets, privileged identifiers, raw proof files, signed URLs, storage paths, or user-private data in runtime docs.
- Runtime proof should use redacted identifiers and safe summaries.

Tests expected:

- Rerun focused tests for auth, private gate, airline-email verification, boards, membership, community-admin actions, posts, reports, and security events.
- Run lint/typecheck/build where applicable.

Runtime validation expected:

- Validate the full flow against the linked runtime after migrations are applied through reviewed migration-apply tasks.
- Record caveats and rollback behavior.

Stop-before-commit/review requirements:

- Stop before commit after runtime proof docs are written.
- Commit runtime proof only after review.

## 6. Dependency Map

- Proof freeze before launch access implementation.
- Airline-email access before launch gate.
- Launch gate before broad first-base access.
- Beta invite-code decision before onboarding/signup invite-code or access-hold integration.
- Base/board model before posts.
- Membership/access request before restricted board content.
- Community-admin model before community-admin review UI.
- Moderation/disclaimer before real launch.
- Runtime proof before declaring a sensitive gate/access ticket complete.

## 7. Recommended First Implementation Ticket

Recommended first code ticket: `FBMVP-T01 Freeze User-Facing Proof Verification Surfaces`.

Rationale:

- It prevents accidental proof-upload expansion before new flows are built.
- It reduces user-facing privacy risk.
- It aligns current visible verification copy with the pivot.
- It preserves legacy proof ops/admin safety while making the forward product direction clear.

Next ticket after `FBMVP-T03`: `FBMVP-T03A Beta Invite-Code Foundation`, because private testing still needs a clear batch/single-use invite-code model before onboarding and access-hold copy depend on invite redemption behavior.

Next auth-flow task after `FBMVP-T04`: follow `docs/ops/auth-email-branding-confirmation-template-plan.md` to configure and validate Supabase confirmation/reset email branding, custom SMTP or sender-domain decisions, redirect URLs, and safe test-email behavior. The user-facing flow now describes the correct gates, but confirmation/reset emails still need jmpseat-branded trust polish before founder/Yuri Vercel testing or public-ish waitlist login entry.

The public landing Closed Beta Login entry remains deferred until that auth email plan is executed and reviewed.

## 8. Validation Standards

Every implementation ticket should run focused tests first, then broader checks appropriate to its blast radius.

Expected standards:

- Run focused node tests for touched auth/profile/beta/verification/community/moderation/admin modules.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` for code changes unless explicitly scoped otherwise.
- Run `git diff --check`.
- Do not run `supabase db push` before review.
- Treat migration apply as separate from merge.
- Create runtime proof docs for sensitive gate/access changes.
- Do not print or commit secrets, env values, privileged identifiers, raw proof contents, signed URLs, public proof URLs, storage paths, service-role data, or private user data.

## 9. Documentation Update Requirements

Each implementation ticket should update:

- `docs/BUILD_TICKETS.md`
- `docs/EPOCH_ROADMAP.md`
- relevant strategy/epoch docs
- runtime proof docs when applicable

Documentation should preserve historical Epoch 04 and Epoch 05 proof/operator work as completed/runtime history while making clear it is not the forward product roadmap.

## 10. Open Questions Blocking Implementation

These questions should be answered before implementation begins:

- Is DFW formally selected as first base?
- Is first-base launch airport-wide or airline-specific?
- Which airline domains are included for first launch?
- Which restricted boards are MVP?
- What minimal profile fields are required?
- Should users self-select base before general board access?
- What exact moderation tooling is required before first live launch?
- Who appoints first community admins?

## 11. Source-Of-Truth Statement

This ticket pack is the forward implementation plan for the pivoted First-Base MVP.

It replaces continuing proof-upload verification/admin expansion as the next implementation path. E05-T08 remains paused unless explicitly reactivated.

Future Codex tasks should follow this ticket pack unless the user updates the strategy docs.
