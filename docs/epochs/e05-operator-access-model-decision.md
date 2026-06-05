# E05-T01: Operator Access Model Decision

Brand note: jmpseat is the canonical product and app name. This decision does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Decision Summary

Epoch 05 should use explicit, database-backed operator grants with bounded operator scopes.

The minimum viable operator/admin authorization model is:

- Role/scope-backed.
- Durable in the database.
- Auditable.
- Separate from public profile text, beta access, verification claims, and reviewer scopes.
- Checked server-side before privileged data is fetched.
- Designed to prevent self-escalation.

Operator/admin access must not be hard-coded to founder/admin email addresses. Email-address-based authorization is brittle, hard to audit, hard to rotate, and easy to accidentally treat as identity policy instead of operational authorization.

The recommended future implementation is an `operator_grants` model or equivalent, where trusted users are granted one or more explicit operator scopes. The first implementation ticket may choose a normalized table or an array-backed scope model, but the authorization decision is that operator access must be explicitly granted and revocable.

## 2. Definitions

Normal user:

- An authenticated jmpseat user without approved verification claims, reviewer scope, or operator grants.
- Can access only normal private-app surfaces allowed by auth/profile/beta gates.

Verified airline worker:

- A user with an approved `airline_worker` verification claim.
- This status is useful for future claim-gated product access.
- It does not imply operator/admin access.

Reviewer:

- A user with active reviewer scope for verification review, such as global, airline, role, or base scope.
- Reviewers can review verification requests only within their reviewer authorization boundaries.
- Reviewer scope does not imply operator/admin access.

Operator:

- A user with one or more explicit operator scopes for managing operational workflows such as approved domains, reviewer scopes, audit inspection, or cleanup monitoring.
- Operators have bounded privileges and should receive only the scopes needed for their job.

Admin:

- A highest-trust operator class with access to sensitive grant/revoke operations, especially `operator.manage_operator_access`.
- Admin is not an email address, a profile label, or a public identity trait.
- Admin behavior should be implemented as a narrowly granted operator scope or equivalent database-backed authorization.

Service-role/server-only privileged operation:

- A server-side operation that uses privileged credentials or privileged RPC paths unavailable to browser/client code.
- Service-role behavior must remain server-only and should be used only where ordinary RLS/RPC authorization cannot safely perform the required operation.

## 3. Recommended Authorization Model

Operator authorization should be explicit and separate from user-facing identity.

The recommended model:

- Store operator/admin grants in a durable database-backed authorization model.
- Grant named operator scopes to specific authenticated users.
- Require active grant status before an operator action is allowed.
- Evaluate operator authorization server-side for every privileged route, action, and RPC.
- Keep reviewer scopes focused on verification review only.
- Keep verification claims focused on product authorization only.

The model must not infer operator/admin access from:

- Email domain.
- Login email.
- Work email.
- Beta access.
- Public profile text.
- Claimed airline, role, base, or employer.
- `airline_worker` claim.
- Reviewer scope alone.

Existing reviewer scopes remain useful for verification review and controlled proof viewing. They should not become broad admin rights.

## 4. Minimum Viable Operator Scopes

Future implementation should start with named scopes rather than one broad admin flag.

Proposed MVP scopes:

- `operator.read_audit`: inspect allowed audit/security-event views and verification history metadata.
- `operator.manage_approved_domains`: create, update, and disable approved email-domain records.
- `operator.manage_reviewer_scopes`: grant and revoke reviewer scopes.
- `operator.read_verification_requests`: inspect verification request, evidence metadata, review action, and claim state without raw proof access outside the existing controlled proof-viewing path.
- `operator.monitor_proof_cleanup`: inspect proof cleanup status, counts, failures, and safe evidence identifiers.
- `operator.run_proof_cleanup`: run bounded proof cleanup through the existing reviewed cleanup helper.
- `operator.manage_operator_access`: grant and revoke operator scopes; reserved for highest-trust admin use.

Scope semantics:

- Scopes should be additive and least-privilege.
- A user may hold multiple scopes.
- Narrow scopes must not imply broader scopes.
- `operator.manage_operator_access` must be treated as high risk and should not be bundled casually with operational scopes.

## 5. Self-Escalation Prevention

The operator model must explicitly prevent self-escalation.

Requirements:

- A user must not grant themselves operator/admin access.
- A user must not add scopes to their own operator grant.
- A user must not reactivate their own revoked or disabled operator grant.
- A reviewer must not become an operator merely by being a reviewer.
- An operator with narrow scopes must not grant broader scopes.
- An operator must not revoke or alter grants in a way that bypasses review controls unless explicitly authorized by `operator.manage_operator_access`.
- Grant/revoke actions must be audited.

Bootstrap path:

- The initial operator bootstrap may require one carefully reviewed SQL/manual grant for the first highest-trust operator.
- The bootstrap grant should be narrow, documented, and limited to the minimum scope required to begin building/operator-testing E05 tooling.
- If possible, bootstrap should record an audit event or be paired with an operator log entry.
- Bootstrap must not include real user emails or secret values in docs.
- Bootstrap should be replaced by audited operator-access tooling during Epoch 05.

## 6. Likely Database, RLS, And RPC Needs

This decision does not create migrations. It identifies likely future implementation needs only.

Likely database model:

- `operator_grants` table or equivalent.
- `user_id` referencing the authenticated user.
- Active/revoked status.
- Scope array or normalized operator-scope table.
- `created_by`.
- `created_at`.
- `revoked_by`.
- `revoked_at`.
- Optional `reason` or `notes` field with strict sanitization.

Likely helper functions:

- `public.is_operator_with_scope(required_scope text)` or equivalent.
- `public.current_user_operator_scopes()` or equivalent bounded read helper.
- Helper behavior should use `auth.uid()` and fail closed when no authenticated user exists.

Likely RPCs:

- Grant operator scope.
- Revoke operator scope.
- List operator grants for authorized operators.
- Read audit/verification operational views.

RPC posture:

- Use safe `search_path` for security-definer functions where needed.
- Grant execute only to authenticated users when appropriate.
- Enforce scope checks inside privileged RPCs.
- Avoid service-role use unless server-only privileged behavior is truly unavoidable.

RLS posture:

- Ordinary users should not read operator grant records.
- Operators should read only grant data appropriate to their scopes.
- Scope mutation should happen through reviewed RPCs rather than broad client-writable table policies.

## 7. Admin Route Protection Model

Route model:

- `/app/admin` should require an authenticated user.
- Privileged subroutes should require matching operator scope.
- Existing `/app/admin/verification` reviewer queue should keep using reviewer authorization for verification review.
- The reviewer queue should not accidentally become broad admin access.
- Operator/admin navigation should show only tools the current user is authorized to use.

Authorization order:

- Authenticate the user.
- Resolve the required operator scope or reviewer authorization for the route.
- Deny safely if authorization fails.
- Fetch privileged data only after authorization succeeds.

Denied behavior:

- Denied access should route safely to `/app/access-restricted` or an equivalent existing restricted-access surface.
- Denied responses must not include privileged data, stack traces, proof paths, signed URLs, public URLs, raw filenames, proof contents, secrets, or tokens.

## 8. Audit Requirements

Operator/admin tooling must be audit-first.

Proposed event taxonomy for future implementation:

- `operator_access.granted`
- `operator_access.revoked`
- `operator_access.unauthorized_attempt`
- `approved_email_domain.created`
- `approved_email_domain.updated`
- `approved_email_domain.disabled`
- `reviewer_scope.granted`
- `reviewer_scope.revoked`
- `proof_cleanup.manual_requested`
- `proof_cleanup.manual_completed`
- `proof_cleanup.manual_denied`

Event metadata may include:

- Target user id.
- Actor user id.
- Scope names.
- Result.
- Reason code.
- Domain id.
- Reviewer scope id.
- Evidence id or request id where needed.
- Created/updated/revoked timestamps.

Event metadata must not include:

- Secrets.
- Tokens.
- Passwords.
- Service-role values.
- Raw proof filenames.
- Storage paths.
- Signed URLs.
- Public URLs.
- Proof contents.
- OCR text.
- Employee IDs.
- Badge numbers.
- Barcode data.
- QR data.
- Raw work email.
- Email local-part.

Logging should remain fail-soft for user-facing operations where possible, but failed audit logging for privileged mutation paths should be visible to operators and may need stricter handling in implementation tickets.

## 9. Privacy And Security Boundaries

Epoch 05 operator/admin tooling must preserve the Epoch 04 verification boundaries:

- No public proof URLs.
- No signed URL storage or logging.
- No broad Storage list/read policies.
- No service-role exposure to client code.
- No query-string secrets.
- No operator access based on profile text.
- No operator access based on email domain.
- No operator access based on beta access.
- No operator access based on verification claim alone.
- No employer-system lookup.
- No private airline-system scraping.
- No AI/OCR approval.
- No automatic claim issuance from operator inspection.
- No community boards, rooms, posts, comments, or feeds.

## 10. Bootstrap Recommendation

Recommended initial bootstrap:

- Use one carefully reviewed manual database grant for the first highest-trust operator if no operator-access UI exists yet.
- Grant only the minimum scopes needed for the next implementation/runtime validation step.
- Prefer granting `operator.manage_operator_access` only when the immediate next slice requires operator-access tooling validation.
- Record the bootstrap action in a durable operator log or security event if the event path exists at that point.
- Document the bootstrap run in an ops note without including real user emails, secrets, or environment values.

Bootstrap should be treated as temporary. The goal of Epoch 05 is to replace manual grant/revoke handling with explicit, authorized, audited operator tooling.

## 11. Acceptance Criteria For E05-T01

E05-T01 is complete when:

- This decision doc exists.
- The recommended operator access model is explicit.
- The model is role/scope-backed and database-backed.
- Hard-coded founder/admin email authorization is rejected.
- Reviewer scopes are explicitly not broad admin rights.
- Verification claims are explicitly not operator/admin rights.
- Minimum viable operator scopes are named.
- Self-escalation requirements are clear.
- Likely future database, RLS, and RPC needs are identified without implementing them.
- Audit-event requirements are defined.
- Privacy/security boundaries are clear.
- No app code, migrations, Supabase db push, production commands, or secrets were added.

## 12. Source-Of-Truth Status

This document is the source of truth for E05-T01.

Future Epoch 05 implementation tickets should reference this decision before adding admin shell behavior, approved-domain management, reviewer-scope management, audit inspection, proof cleanup monitoring, or manual cleanup controls.
