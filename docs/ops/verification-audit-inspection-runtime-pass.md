# E05-T05: Verification Audit Inspection Runtime Pass

Brand note: jmpseat is the canonical product and app name. This runtime proof
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Summary

Date: 2026-06-05

Commit validated:

- `5d2b480 feat: add verification audit inspection`

Migration applied:

- `20260605223000_add_operator_verification_audit_inspection.sql`

The linked Supabase migration history is clean and the E05-T05 verification
audit inspection migration is applied remotely.

The initial operator identity was validated for this runtime pass, but the
privileged operator UUID and email are intentionally redacted from committed
docs and handoff output.

## 2. Preflight

Preflight checks confirmed:

- local branch was clean on `main` before runtime validation docs were written
- the E05-T05 migration file existed locally
- the only pending local migration before apply was
  `20260605223000_add_operator_verification_audit_inspection.sql`
- required Supabase env names were present without printing values
- an active operator grant exists
- the active operator has both E05-T05 read scopes:
  `operator.read_audit` and `operator.read_verification_requests`

The migration was applied with `npx supabase db push --yes`. No deployment was
run.

## 3. Migration State

Before apply, linked migration history matched local history through:

- `20260605213000_add_operator_managed_reviewer_scopes.sql`

After apply, `npx supabase migration list --linked` showed matching local and
remote history through:

- `20260605223000_add_operator_verification_audit_inspection.sql`

## 4. Route And RPC Authorization

Runtime checks confirmed:

- anonymous audit RPC calls are denied safely with structured
  `authenticated_operator_required` responses and empty arrays
- in this linked runtime, anonymous callers can execute the RPC wrapper but do
  not reach any audit data because the function body fails closed when
  `auth.uid()` is absent
- a non-operator active-beta user cannot list verification request audit data
- a non-operator active-beta user cannot list security-event audit data
- a reviewer-only user cannot list verification request audit data
- a reviewer-only user cannot list security-event audit data
- the operator-scope RPC reports both E05-T05 audit scopes for the validated
  operator
- `is_operator_with_scope(...)` returns true for the granted audit scopes
- an ungranted operator scope returns false

No privileged operator UUID or email was printed or committed.

## 5. Verification Request Inspection

Runtime checks confirmed:

- authorized operators with `operator.read_verification_requests` can list
  verification request summaries
- request summary responses are bounded by the requested limit
- a valid verification request UUID loads metadata-only detail
- a well-formed missing request UUID returns a safe `target_request_not_found`
  detail response
- malformed `request_id` values are rejected before the UUID RPC by the app
  layer, covered by the post-migration automated regression tests
- request detail responses did not expose raw proof files, signed URLs, public
  URLs, storage paths, raw filenames, proof-content keys, token fields, magic
  links, sessions, service-role fields, or secrets

## 6. Security And Audit Event Inspection

Runtime checks confirmed:

- authorized operators with `operator.read_audit` can list security/audit
  events
- event list responses are bounded by the requested limit
- event-type filtering works for the audit event list RPC
- `operator_audit.viewed` persists for authorized audit-inspection reads
- `operator_audit.unauthorized_attempt` persists for denied audit-inspection
  reads
- event responses did not expose secrets, tokens, signed URLs, public URLs,
  magic links, sessions, service-role fields, privileged operator identifiers,
  raw proof files, raw proof contents, or storage paths

## 7. Recursive Sanitizer

Runtime checks inserted a transaction-scoped audit event containing top-level,
nested-object, and array-contained sensitive metadata, then read it through the
operator event-list RPC.

Runtime checks confirmed:

- top-level sensitive keys were removed
- nested object sensitive keys were removed
- sensitive keys inside arrays were removed
- proof-content keys such as proof text/content/body/data, raw proof values,
  and extracted text were removed
- safe top-level, nested, and array metadata keys were preserved
- database-side sanitization protects direct authenticated RPC callers
- page-side TypeScript sanitization remains defense-in-depth, not the only
  privacy boundary

## 8. Scope Separation

Runtime checks confirmed:

- `operator.read_verification_requests` can inspect verification request
  metadata without security-event list access
- `operator.read_audit` can inspect security events without verification
  request-list access
- reviewer scope does not imply audit-inspection access
- operator audit scopes do not imply reviewer queue access
- `/app/admin/verification` remains reviewer-scope based by automated
  validation

Split-scope checks used rolled-back temporary grants so no temporary
authorization change survived the validation pass.

## 9. Admin Shell And Navigation

Automated validation and build output confirmed:

- `/app/admin/audit` is present as an implemented route
- Audit Inspection becomes available for operators with
  `operator.read_audit` or `operator.read_verification_requests`
- `/app/admin/audit` uses the shared AdminShell pattern
- Approved Domains and Reviewer Scopes remain scoped to their own implemented
  operator grants
- future operator sections remain disabled until their routes/tools are
  implemented

This runtime pass did not use a browser-authenticated visual session for the
signed-in admin shell.

## 10. Tests And Validation

Validation run:

- `npx supabase db push --yes`
- `npx supabase migration list --linked`
- `node --test test/admin/verificationAudit.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/admin/approvedDomains.test.mts test/admin/reviewerScopes.test.mts`
- `node --test test/verification/review.test.mts test/verification/claimsAuth.test.mts`
- `node --test test/security-events/securityEvents.test.mts test/security-events/verificationSecurityEvents.test.mts`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `git diff --check`

All automated validations passed after the migration apply. `npm run lint`
completed with existing unrelated warnings in the known lab/scroll files; those
warnings were not changed or fixed in this task.

## 11. Caveats

- Production deployment/runtime validation is separate if this was local/dev
  runtime only.
- Anonymous audit RPC denial happens through structured in-function denial in
  this linked runtime, not through a transport-level execute-permission denial.
- No cleanup-monitoring or community tools were implemented.
- No E05-T06 work was started.
