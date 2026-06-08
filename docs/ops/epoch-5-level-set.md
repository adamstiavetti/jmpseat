# Epoch 5 Level-Set

Date: 2026-06-07

Current baseline commit: `835972c fix: redact operator grant audit identifiers`

## Summary

Epoch 5 is the bounded operator/admin tooling foundation for running verification
operations without routine manual SQL. The original E05-T01 through E05-T07
operator/admin slices are implemented and runtime-proven, and the newer
post-bootstrap operator grant management path is now runtime-proven through the
linked runtime RPC/action path used by `/app/admin/operator-access`. The
auth/onboarding detour is closed, `/app/access-hold` is the active airline
employee email verification and beta status surface, and founder/admin internal
access uses explicit operator grants instead of temporary work-email domain
approval.

## Capability Matrix

| Capability | Status | Evidence files | Notes |
| --- | --- | --- | --- |
| Epoch 5 scope and sequencing | runtime-proven | `docs/EPOCH_ROADMAP.md`, `docs/BUILD_TICKETS.md`, `docs/epochs/epoch-05-operator-admin-tooling-tickets.md`, `docs/ops/e05-operator-grant-management-runtime-pass.md` | Current roadmap says E05 is a paused/runtime-proven foundation. E05-T01 through E05-T07 and the post-bootstrap operator grant management path are implemented and runtime-proven. |
| Operator access model | done | `docs/epochs/e05-operator-access-model-decision.md` | Explicit database-backed operator grants are the model. Operator/admin access is separate from login email, work email, profile text, beta access, verification claims, and reviewer scopes. |
| Admin shell and navigation | runtime-proven | `docs/epochs/e05-admin-shell-navigation-foundation.md`, `docs/ops/operator-grants-bootstrap-runtime-pass.md`, `app/app/admin/page.tsx`, `src/components/admin/AdminShell.tsx`, `src/lib/admin/access.ts`, `test/admin/adminShell.test.mts` | `/app/admin` exists, protected admin navigation exists, normal users do not get privileged tools, and reviewer queue behavior remains separate. |
| Operator grants foundation and first bootstrap | runtime-proven | `docs/epochs/e05-operator-grants-foundation.md`, `docs/ops/operator-grants-bootstrap-runtime-pass.md`, `app/api/ops/operator-bootstrap/route.ts`, `src/lib/admin/operatorBootstrapRoute.ts`, `supabase/migrations/20260605113000_create_operator_grants_foundation.sql`, `test/admin/operatorBootstrapRoute.test.mts` | First-operator bootstrap was validated in the linked runtime and closes after an active grant exists. |
| Founder/admin internal private-app access | runtime-proven | `docs/epochs/founder-admin-private-app-access-implementation.md`, `docs/ops/founder-admin-private-app-access-runtime-pass.md`, `docs/ops/operator-private-app-scope-gate-fix.md`, `docs/ops/auth-detour-closeout-runtime-pass.md`, `src/lib/privateApp/access.ts`, `src/lib/betaAccess/server.ts`, `test/private-app/access.test.mts` | Internal access resolves through `operator_internal`, now runtime-provenly requires the dedicated `operator.internal_private_app_access` scope for app-entry override, and does not grant beta access, airline-email eligibility, role claims, base claims, or restricted-board claims. |
| Post-bootstrap operator grant management | runtime-proven | `docs/epochs/operator-grant-management-implementation.md`, `docs/ops/operator-grant-audit-metadata-redaction.md`, `docs/ops/e05-operator-grant-management-runtime-pass.md`, `app/app/admin/operator-access/page.tsx`, `src/lib/admin/operatorGrants.ts`, `src/lib/admin/operatorGrantLookup.ts`, `test/admin/operatorAccess.test.mts`, `supabase/migrations/20260606203000_add_operator_internal_private_app_access_scope.sql`, `supabase/migrations/20260607103000_redact_operator_grant_audit_metadata.sql` | The redaction migration SQL is active in the linked runtime. Existing-operator grant, duplicate active grant, non-operator denial, minimal internal scope behavior, and redacted audit metadata are runtime-proven through the RPC/action path used by `/app/admin/operator-access`. Browser-authenticated form submission remains an optional smoke check because this pass did not use private credentials. |
| Approved-domain management | runtime-proven | `docs/epochs/e05-approved-domain-management.md`, `docs/ops/approved-domain-management-runtime-pass.md`, `app/app/admin/approved-domains/page.tsx`, `src/lib/admin/approvedDomains.ts`, `supabase/migrations/20260605184500_add_operator_managed_approved_email_domains.sql`, `supabase/migrations/20260605190500_fix_approved_domain_test_tld_validation.sql`, `test/admin/approvedDomains.test.mts` | Operator-only list/create/update/disable exists and is runtime-proven. Disabled domains stay hidden from normal work-email reads. |
| Reviewer-scope management | runtime-proven | `docs/epochs/e05-reviewer-scope-management.md`, `docs/ops/reviewer-scope-management-runtime-pass.md`, `app/app/admin/reviewer-scopes/page.tsx`, `src/lib/admin/reviewerScopes.ts`, `supabase/migrations/20260605213000_add_operator_managed_reviewer_scopes.sql`, `test/admin/reviewerScopes.test.mts` | Operator-controlled reviewer scope grant/revoke exists, with self-escalation protections and linked-runtime proof. |
| Verification review/admin queue | runtime-proven | `app/app/admin/verification/page.tsx`, `src/lib/verification/review.ts`, `src/lib/verification/reviewActions.ts`, `docs/epochs/epoch-04-human-review-queue-foundation-implementation.md`, `docs/ops/verification-runtime-pass-american-airlines.md`, `test/verification/review.test.mts` | Existing reviewer-scope based queue remains separate from operator/admin access. No proof review expansion is part of the current forward path. |
| Verification audit and event inspection | runtime-proven | `docs/epochs/e05-verification-audit-inspection.md`, `docs/ops/verification-audit-inspection-runtime-pass.md`, `app/app/admin/audit/page.tsx`, `src/lib/admin/verificationAudit.ts`, `supabase/migrations/20260605223000_add_operator_verification_audit_inspection.sql`, `test/admin/verificationAudit.test.mts` | Metadata-only inspection exists. It excludes raw proof, persistent proof locations, and sensitive runtime values. |
| Security events trust boundary | runtime-proven | `docs/ops/security-events-trust-boundary-fix.md`, `src/lib/securityEvents/server.ts`, `supabase/migrations/20260608201541_harden_security_events_trust_boundary.sql`, `test/security-events/securityEventsTrustBoundary.test.mts` | Direct authenticated/anon inserts into trusted `security_events` are removed, legacy rows are marked unverified, future server rows default to trusted, operator/admin audit readers filter to trusted server-produced rows, and the deployed server recorder path is runtime-proven through service-role insertion. |
| Proof upload content validation | patch pending runtime deploy | `docs/ops/proof-upload-content-validation-fix.md`, `src/lib/verification/proofUpload.ts`, `src/lib/verification/actions.ts`, `test/verification/proofUpload.test.mts` | Redacted proof upload now requires server-side JPEG/PNG byte validation instead of trusting browser MIME/extension alone. Private proof bucket behavior and reviewer signed-URL controls remain unchanged. Runtime deploy validation remains pending after review/merge. |
| Proof cleanup monitoring | runtime-proven | `docs/epochs/e05-proof-cleanup-monitoring.md`, `docs/ops/proof-cleanup-monitoring-runtime-pass.md`, `app/app/admin/proof-cleanup/page.tsx`, `src/lib/admin/proofCleanupMonitoring.ts`, `supabase/migrations/20260605233000_add_operator_proof_cleanup_monitoring.sql`, `test/admin/proofCleanupMonitoring.test.mts` | Read-only cleanup health, failures, and bounded cleanup audit visibility are runtime-proven. |
| Protected manual proof cleanup controls | runtime-proven | `docs/epochs/e05-protected-manual-proof-cleanup-controls.md`, `docs/ops/protected-manual-proof-cleanup-controls-runtime-pass.md`, `src/lib/admin/proofCleanupControls.ts`, `src/lib/admin/proofCleanupControlsCore.ts`, `supabase/migrations/20260605234500_add_operator_manual_proof_cleanup_controls.sql`, `test/admin/proofCleanupControls.test.mts` | Manual cleanup runs only through the existing helper with bounded controls and summary-only audit. Runtime proof did not force a destructive delete because there were zero eligible expired proof rows. |
| Proof upload/review forward product state | deferred | `docs/strategy/proof-system-freeze-deprecation-plan.md`, `docs/epochs/fbmvp-t01-freeze-user-facing-proof-verification-surfaces.md`, `docs/EPOCH_ROADMAP.md`, `docs/BUILD_TICKETS.md` | Proof upload/review infrastructure remains historical and safety-preserved. Forward user-facing proof expansion is frozen unless explicitly reopened. |
| Beta invite-code operator tooling | runtime-proven | `docs/epochs/fbmvp-t03a-beta-invite-code-foundation-implementation.md`, `docs/ops/beta-invite-code-foundation-runtime-pass.md`, `src/lib/betaAccess/inviteCodes.ts`, `test/beta-access/betaInviteCodes.test.mts` | Adjacent private-testing capacity tooling exists and is runtime-proven. It is not a replacement for airline-email eligibility and is not a first-base launch requirement. |
| Auth detour closeout | runtime-proven | `docs/ops/auth-detour-closeout-runtime-pass.md`, `docs/ops/stable-beta-auth-runtime-pass.md`, `docs/ops/auth-design-system-style-guide.md`, `docs/ops/auth-design-overhaul-docs-audit.md` | Founder-confirmed stable beta auth flow is documented. Temporary `jmpseat.com` approved-domain state was soft-disabled and historical rows were preserved. |
| E05-T08 runtime validation and handoff | deferred | `docs/epochs/epoch-05-operator-admin-tooling-tickets.md`, `docs/EPOCH_ROADMAP.md`, `docs/BUILD_TICKETS.md` | Paused by the product pivot. Current docs should not treat E05-T08 as the next code-bearing feature. |
| Community-admin tools, boards, posting, restricted-board gates | missing | `docs/strategy/board-community-access-model-decision.md`, `docs/strategy/community-admin-responsibilities-disclaimer-policy.md`, `docs/epochs/first-base-mvp-implementation-ticket-pack.md` | Not part of Epoch 5. These belong to later community/baseboard implementation lanes. |

## Do Not Reopen Auth Detour

The auth/onboarding detour is closed at the current baseline. Do not reopen it
as an Epoch 5 task unless a real regression is found.

Closed auth facts:

- Stable beta auth runtime pass is recorded.
- Account signup confirmation is code-first.
- Work-email verification is code-first and inline on `/app/access-hold`.
- `/app/verification` is deprecated and redirects to `/app/access-hold`.
- Founder/admin access uses explicit operator grants.
- `jmpseat.com` temporary approved-domain state is documented as soft-disabled.
- Founder/admin access is separate from airline-email eligibility.

Relevant auth-detour artifacts that remain useful to Epoch 5:

- `operator_internal` access-source audit metadata for internal private-app entry.
- The `operator.internal_private_app_access` scope.
- The closeout record confirming temporary domain cleanup.
- The auth design-system docs for future admin/login consistency checks.

## Open Epoch 5 Gaps

1. The admin shell is implemented and covered, but signed-in visual/browser
   runtime proof for every scoped admin route is scattered across individual
   runtime passes rather than gathered into one final handoff artifact.
2. Proof cleanup runtime validation did not perform a live destructive delete,
   because there were no eligible expired proof rows. This is acceptable and
   documented, but it remains a precision caveat.
3. The post-bootstrap operator grant management runtime proof used the
   server-side RPC/action path with authenticated runtime context simulation; a
   live browser-authenticated form submission remains optional if a safe operator
   session is available.
4. E05-T08 is paused by product pivot and should not be treated as a feature
   ticket until the pivot direction explicitly calls for it.

## Recommended Next Ticket

Recommended next single ticket:

`E05 Final Handoff Index And Epoch 6 Bridge`

Goal:

Create one final Epoch 5 handoff index that points to each runtime proof and
then bridge planning to the next community-access/moderation lane.

Scope:

- Create a single index of Epoch 5 runtime-pass docs and caveats.
- Keep E05-T08 paused unless explicitly reactivated.
- Carry forward only the remaining production/operator follow-ups.
- Define the next community-access/moderation planning lane without adding app
  code.

Why this is the highest-leverage next ticket:

The original Epoch 5 operator/admin tools and the newer post-bootstrap operator
grant management path are now runtime-proven. The highest-leverage next step is
to make the handoff easy to follow and avoid accidentally reopening auth,
proof-upload, or broad operator tooling detours.

Optional follow-ups after that ticket:

- Continue the manual auth email branding/custom SMTP plan before broader
  closed-beta entry.
- Begin the next non-Epoch-5 product lane only after the current roadmap says
  it is time.

## Not In Scope Yet

- Public launch readiness.
- Community boards, baseboards, rooms, posts, comments, or feeds.
- Community-admin tooling.
- Restricted-board gates or board memberships.
- Role/base/restricted-board claims.
- Employer-system lookup.
- Airline portal login.
- AI verification approval.
- Payments or marketplace features.
- New proof upload, badge upload, document upload, or proof review expansion.
- Proof cleanup expansion beyond the existing runtime-proven monitoring/manual
  controls.

## Safety Boundaries

- Keep operator/admin access explicit, database-backed, scoped, revocable, and
  audited.
- Keep reviewer scope separate from operator/admin access.
- Keep founder/admin internal access separate from airline-email eligibility.
- Keep beta invite-code behavior separate from airline-email eligibility and
  first-base launch access.
- Preserve historical audit rows and verification history.
- Do not expose raw proof files, proof contents, persistent proof locations,
  raw filenames, private identifiers, sensitive runtime values, or operational
  credentials in docs, UI, events, or responses.
- Do not run migrations, deploy, change DNS, change Vercel settings, change
  Supabase Auth settings, or mutate runtime state as part of level-set work.

## Level-Set Answers

1. Epoch 5 covers bounded operator/admin tooling for verification operations:
   operator access, admin shell/navigation, approved-domain management,
   reviewer-scope management, audit inspection, proof cleanup monitoring, and
   protected manual proof cleanup.
2. Implemented items include E05-T01 through E05-T07, operator grant management,
   founder/admin internal access, and adjacent beta invite-code operator
   generation.
3. Runtime-proven items include E05-T03 through E05-T07, operator grants
   bootstrap, post-bootstrap operator grant management, founder/admin internal
   access, beta invite-code foundation, and auth detour closeout.
4. Implemented but not dedicated-runtime-proven: no current core Epoch 5
   operator/admin capability remains in this category.
5. Missing entirely from Epoch 5: no current missing core E05-T01 through E05-T07
   capability; community-admin and board tooling are missing because they are
   later product lanes, not Epoch 5.
6. Temporary auth-detour artifacts relevant to Epoch 5 are the internal operator
   scope, `operator_internal` audit source, `/app/access-hold` status surface,
   and `jmpseat.com` cleanup documentation.
7. `jmpseat.com` temporary approved-domain cleanup is documented as closed in
   `docs/ops/auth-detour-closeout-runtime-pass.md`.
8. Highest-leverage next ticket is a final Epoch 5 handoff index plus an Epoch 6
   bridge to community-access/moderation planning.
