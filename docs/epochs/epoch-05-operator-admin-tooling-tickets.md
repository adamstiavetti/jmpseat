# Epoch 05: Operator/Admin Tooling Foundation Ticket Pack

Brand note: jmpseat is the canonical product and app name. This ticket pack does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Epoch Objective

Epoch 05 builds the bounded operator/admin tooling foundation needed to run verification safely without routine manual SQL.

Epoch 04 proved the worker-verification repo/runtime foundation: work-email verification, redacted proof upload, reviewer routing, controlled proof viewing, proof retention/deletion cleanup, protected cleanup triggers, and audit events all exist. The next bottleneck is operational safety. Approved domains, reviewer scopes, cleanup monitoring, and audit inspection still require operator-level care that should not remain ad hoc as real users and real proof uploads increase.

Epoch 05 bridges the verification foundation and future claim-gated community features by making verification operations manageable, authorized, audited, and privacy-preserving.

## 2. Epoch 04 Baseline

Epoch 05 starts from the completed Epoch 04 repo/runtime foundation, including:

- Verification data model.
- Approved email domains.
- Work-email verification foundation.
- Reviewer scopes.
- Human review queue.
- Transactional review RPC.
- Verification security events.
- Claims-based authorization preparation.
- Redacted proof upload to private Storage.
- Requested-airline reviewer routing.
- Controlled reviewer proof viewing.
- Proof retention/deletion cleanup.
- Protected manual cleanup trigger.
- Vercel-Cron-compatible cleanup route.
- Runtime proof docs and operator docs.

This baseline is complete for verification foundation work, but it does not complete public launch readiness, legal/privacy copy, production monitoring, or scalable operator workflows.

## 3. Why This Comes Before Community

Claim-gated community surfaces should not be built on top of manual verification operations.

Before rooms, boards, posts, comments, or feeds are exposed, operators need safe ways to manage:

- Who can use operator/admin tools.
- Which email domains are approved for work-email verification.
- Which reviewers can review which airline, role, base, or global scopes.
- Whether proof cleanup is running and failing safely.
- Which verification requests, claims, review actions, and security events need attention.

Without these tools, community access would depend on fragile manual SQL workflows and would increase the risk of overbroad reviewer access, stale domains, missed cleanup failures, and insufficient audit visibility.

## 4. Non-Goals

Epoch 05 must not include:

- Community boards, rooms, posts, comments, feeds, or anonymous posting.
- Claim-gated community implementation.
- Verification claim issuance rule changes unless explicitly ticketed and reviewed.
- Employer-system lookup.
- Private airline-system scraping.
- AI/OCR approval or AI precheck.
- Public proof URLs.
- Broad Supabase Storage list/read policies.
- Query-string secrets for privileged actions.
- Client-side service-role behavior.
- Signed proof URL storage or logging.
- Arbitrary Storage object deletion.
- UI delete controls for ordinary reviewers.
- Mobile app implementation.
- Custom SMTP/auth email branding implementation.
- Public launch/legal/privacy readiness claims.

## 5. Security And Privacy Boundaries

All Epoch 05 work must preserve these boundaries:

- Operator/admin access must be role/scope-backed, not hard-coded to founder or admin email addresses.
- Operator authorization must be checked server-side and, where applicable, enforced by RLS/RPC boundaries.
- Self-escalation must be prevented for operator access, approved-domain management, and reviewer-scope management.
- Every privileged operator action must be audited.
- Service-role credentials must remain server-only.
- Normal users must not see privileged navigation, privileged data, or privileged actions.
- Reviewer tools must remain separate from broader operator/admin tools unless a ticket explicitly bridges them.
- Raw proof files must remain private.
- Proof storage paths, signed URLs, public URLs, raw filenames, proof contents, OCR text, employee IDs, badge numbers, barcode data, QR data, secrets, tokens, and passwords must not appear in UI or security-event metadata.
- Existing controlled proof-viewing and proof-cleanup helpers should be reused rather than bypassed.

## 6. Required Runtime Validation Posture

Each code-bearing Epoch 05 ticket must include:

- Focused unit/integration tests for the touched authorization, route, RPC, RLS, and UI behavior.
- Negative authorization tests for ordinary users and unauthorized operators.
- Self-escalation tests where scope or access changes are possible.
- Audit-event tests for privileged actions.
- Metadata-sanitization tests for any security event or operator response.
- `npm run lint`, `npm run typecheck`, and `npm run build` unless explicitly docs-only.
- Runtime validation docs before declaring the ticket complete if the ticket affects privileged production behavior.

Runtime validation must confirm that privileged routes do not expose secrets, proof paths, signed URLs, public URLs, raw filenames, proof contents, or stack traces.

## 7. Ordered Tickets

### E05-T01 Operator Access Model Decision

Status: not started.

Type: docs/design only.

Objective:

- Decide the minimum viable authorization model for operator/admin tools before implementing any operator surface.

Scope:

- Define who can access operator/admin tools.
- Avoid hard-coded founder/admin email checks.
- Prefer role/scope-backed access that can be managed and audited.
- Decide whether the MVP should use a dedicated operator role table, approved claims, reviewer scopes, or a separate admin-scope model.
- Identify likely RLS, RPC, table, and security-event needs without implementing them.
- Define self-escalation prevention requirements.
- Define audit requirements for operator access grants, revocations, and privileged actions.
- Define how operator authorization relates to existing reviewer scopes without accidentally making every reviewer a broad operator.

Out of scope:

- App code.
- Migrations.
- Operator UI.
- Reviewer-scope changes.
- Approved-domain changes.
- Any production behavior change.

Acceptance criteria:

- A decision doc exists and is linked from the roadmap/build tickets.
- The chosen MVP operator authorization model is explicit.
- Founder/admin email hard-coding is rejected or tightly constrained as a temporary non-production fallback only if unavoidable.
- Self-escalation rules are explicit.
- Audit-event requirements are explicit.
- Follow-on implementation tickets know which data model and authorization checks to build.

### E05-T02 Admin Shell And Navigation Foundation

Status: not started.

Objective:

- Build a safe operator/admin surface structure without changing verification decision rules.

Scope:

- Add protected admin/operator route structure and navigation.
- Keep the existing verification reviewer queue intact.
- Hide privileged navigation from normal users.
- Deny direct access for normal users server-side.
- Provide clear empty/loading/error states that do not leak privileged data.

Security requirements:

- Must use the E05-T01 operator access model.
- Must not expose raw proof files, storage paths, signed URLs, public URLs, or privileged internals.
- Must audit denied operator access where appropriate.

Acceptance criteria:

- Authorized operators can reach the admin shell.
- Normal users cannot see or access privileged tools.
- Existing reviewer queue behavior is preserved.
- No privileged data leakage occurs in UI, responses, or events.

### E05-T03 Approved Email Domain Management

Status: not started.

Objective:

- Provide an operator-safe path to manage approved work-email domains.

Scope:

- List and search approved domains with bounded metadata.
- Add approved domains.
- Update approved-domain display/routing metadata.
- Disable approved domains without deleting history.
- Avoid hard-coded airline domains.
- Audit every add, update, disable, and denied action.

Security requirements:

- Inactive/internal domain details must not be broadly exposed.
- Operators must not be able to self-escalate through domain metadata.
- Changes must not automatically issue claims.

Acceptance criteria:

- Operators can manage domains without manual SQL.
- Ordinary users cannot read inactive/internal domain data.
- Audit events are sanitized and complete enough for operator review.
- Work-email verification behavior remains bounded to reviewed approved-domain records.

### E05-T04 Reviewer Scope Management

Status: implemented and runtime-proven.

Objective:

- Provide an operator-safe path to manage reviewer scopes.

Scope:

- List and search reviewer scopes.
- Add reviewer scopes.
- Revoke or deactivate reviewer scopes.
- Make global, airline, role, and base scoping explicit.
- Show scope status and provenance safely.
- Audit every add, revoke, update, and denied action.

Security requirements:

- Prevent self-escalation.
- Prevent ordinary reviewers from granting themselves broader access.
- Preserve self-review protection.
- Do not grant proof-view access outside existing reviewer authorization rules.

Acceptance criteria:

- Operators can manage reviewer scopes without manual SQL.
- Airline/base/role/global semantics are clear in UI and tests.
- Unauthorized users cannot list or mutate reviewer scopes.
- All privileged mutations are audited without leaking sensitive metadata.

### E05-T05 Verification Audit Inspection

Status: implemented and runtime-proven.

Objective:

- Provide operator-safe inspection of verification operations and audit history.

Scope:

- Inspect verification requests.
- Inspect evidence metadata.
- Inspect claims.
- Inspect review actions.
- Inspect relevant security events.
- Provide filters for status, method, claim type, evidence type, reviewer, and time range where practical.

Security requirements:

- No raw proof display except through the existing controlled proof-viewing path.
- No public URLs.
- No signed URLs stored, logged, or rendered in audit history.
- No proof storage paths, raw filenames, proof contents, OCR text, employee IDs, badge numbers, barcode data, or QR data in operator views.

Acceptance criteria:

- Authorized operators can investigate verification state without direct SQL.
- Unauthorized users are denied.
- Proof viewing still flows only through the controlled proof-view route.
- Audit views remain metadata-only and sanitized.

### E05-T06 Proof Cleanup Monitoring

Status: implemented; runtime validation pending.

Objective:

- Surface proof cleanup status and failures safely.

Scope:

- Show recent cleanup runs or trigger events if available.
- Show deleted, missing, failed, skipped, and scanned counts where recorded.
- Surface failed cleanup counts and failed evidence IDs safely.
- Link from evidence/request context to cleanup status without exposing storage paths.
- Preserve existing cleanup routes and helper logic.
- Read-only monitoring route implemented in
  [E05-T06: Proof Cleanup Monitoring](e05-proof-cleanup-monitoring.md).

Security requirements:

- Must not display storage paths.
- Must not display signed URLs, public URLs, raw filenames, proof contents, or secrets.
- Must not introduce arbitrary deletion controls.

Acceptance criteria:

- Operators can see whether cleanup is healthy.
- Failed cleanup cases are visible enough to investigate safely.
- Existing cleanup helper behavior is unchanged.
- No broad Storage inspection is exposed.

### E05-T07 Protected Manual Cleanup Controls

Status: not started.

Objective:

- Add bounded manual cleanup controls only if monitoring shows they are needed.

Scope:

- Trigger cleanup through the existing reviewed cleanup helper.
- Use small, explicit batch limits.
- Require operator authorization.
- Audit every requested, granted, denied, successful, and failed manual cleanup action.
- Preserve `deleted_at` semantics.

Security requirements:

- Must not allow arbitrary object deletion.
- Must not allow reviewers to delete proof files through the reviewer queue.
- Must not accept query-string secrets.
- Must not expose storage paths or service-role behavior client-side.

Acceptance criteria:

- Authorized operators can trigger bounded cleanup.
- Unauthorized users are denied.
- The existing cleanup helper remains the only deletion path.
- Audit events and responses are sanitized.

### E05-T08 Epoch 05 Runtime Validation And Handoff

Status: not started.

Objective:

- Validate and document the completed Epoch 05 operator/admin tooling foundation.

Scope:

- Run full validation for code-bearing tickets.
- Runtime-test privileged access, denied access, self-escalation prevention, audit logging, and metadata sanitization.
- Update roadmap and build tickets.
- Create runtime proof and handoff docs.
- Record remaining production/operator/legal follow-ups.

Acceptance criteria:

- Operator/admin tooling runtime proof docs exist.
- RLS/authz behavior is tested and runtime-proven for privileged tools.
- Verification reviewer queue still works.
- Proof viewing and proof cleanup boundaries are preserved.
- No community feature work has been introduced.
- Epoch 05 can be closed only when operator/admin tooling is safe enough to reduce manual SQL reliance.

## 8. Acceptance Criteria For Closing Epoch 05

Epoch 05 can close when:

- E05-T01 access-model decision is complete and accepted.
- Operator/admin access is role/scope-backed and not dependent on hard-coded email addresses.
- Admin shell and navigation are protected from normal users.
- Approved-domain management has a bounded operator path.
- Reviewer-scope management has a bounded operator path.
- Verification audit inspection exists without raw proof or URL leakage.
- Proof cleanup monitoring exists and surfaces failures safely.
- Any manual cleanup control, if implemented, uses the existing cleanup helper and is protected/audited.
- Operator actions are audited with sanitized metadata.
- Self-escalation is blocked and tested.
- Runtime validation docs prove the privileged flows.
- Production/public-launch follow-ups remain explicitly tracked and are not overclaimed as complete.
- Community boards, rooms, posts, comments, and feeds remain unimplemented unless a later epoch explicitly starts them.

## 9. Preserved Production Follow-Ups

Epoch 05 does not complete public launch readiness. The following remain tracked production follow-ups:

- Production Vercel environment verification for `OPS_CLEANUP_SECRET`, `CRON_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Production cron validation and monitoring.
- Cleanup failure monitoring and alerting.
- Privacy/legal copy for proof collection, proof viewing, retention, deletion, and operator access.
- Custom Supabase auth email templates and SMTP/domain sender branding.
- Final approved airline-domain policy.
- Production incident runbook.

## 10. Recommended First Ticket

Start Epoch 05 with E05-T01: Operator Access Model Decision.

Do not implement admin tooling until the access model, self-escalation rules, RLS/RPC posture, and audit requirements are explicitly decided.
