# Epoch 04 Exit Report: Worker Verification Foundation

## 1. Completion Verdict

Epoch 04 is complete for the repo/runtime foundation.

The implemented foundation now supports the first bounded worker-verification loop: users can submit work-email or redacted-proof verification requests, reviewers can review bounded metadata and controlled proof access, approved review can issue supported claims, and raw proof retention/deletion is implemented with protected cleanup triggers.

This verdict does not mean public launch, production legal readiness, final privacy-policy readiness, final email-delivery branding, or scalable operator workflows are complete. It means the repo and linked runtime now have the core verification foundation needed to move out of Epoch 04 feature work.

## 2. What Epoch 04 Delivered

Epoch 04 delivered the following foundation:

- Verification claims and lifecycle: defined and implemented verification requests, evidence, claims, statuses, reviewer actions, and claim issuance boundaries.
- Verification data model: created Supabase tables, RLS, indexes, ownership rules, reviewer references, evidence metadata, and audit-ready lifecycle fields.
- Work-email verification foundation: added domain-based work-email submission that stores only bounded domain metadata and avoids raw work-email evidence storage.
- Approved-domain path: implemented active approved-domain reads and runtime-proven `aa.com` test-domain matching for `American Airlines`.
- `/app/verification`: added the private-app verification status/submission surface.
- Request/evidence flows: implemented request creation, evidence metadata creation, duplicate-active-request handling, and safe metadata builders.
- Human review queue: added `/app/admin/verification` with bounded reviewer queue behavior.
- Reviewer scopes: added global, airline, role, and base reviewer-scope primitives with self-review protection.
- Transactional review approval: moved review decisions into `public.apply_verification_review_decision(...)` so request status, review action, and supported claim issuance are atomic.
- Verification security events: added bounded verification request, evidence, review, claim, proof-view, and proof-deletion audit events with metadata sanitization.
- Claims-based authorization preparation: added helpers and tests for approved claims without implementing community surfaces.
- Redacted proof upload/storage: added private Supabase Storage bucket `verification-proofs`, JPEG/PNG-only upload, UUID-only paths, redaction acknowledgement, and evidence metadata persistence.
- Requested-airline reviewer routing: added self-declared `requested_airline` routing context for proof requests and updated reviewer routing to use it without treating it as proof.
- Controlled proof viewing: added server-only service-role signed URL creation after reviewer authorization, with short TTL and audited view events.
- Proof retention/deletion cleanup: added cleanup helper that deletes expired raw proof objects, marks `deleted_at`, preserves safe metadata, and records deletion audit events.
- Protected cleanup trigger: added `POST /api/ops/proof-retention-cleanup` protected by `x-jmpseat-ops-secret`.
- Cron-compatible cleanup route: added `GET /api/ops/proof-retention-cleanup/cron` protected by `Authorization: Bearer <OPS_CLEANUP_SECRET>` and Vercel Cron configuration.
- Runtime and operator docs: recorded runtime pass artifacts, scheduler compatibility guidance, and cleanup operator runbook documentation so the repo reflects both the implementation and the bounded operating posture.

## 3. Runtime Proof Summary

Major runtime proofs recorded during Epoch 04:

- Work-email American Airlines domain test: `test@aa.com`/`transaction-test@aa.com` created work-email requests, reviewer approval succeeded, and `airline_worker` plus `airline = American Airlines` claims were issued through the bounded review path.
- Active beta and reviewer route tests: app-ready applicant/reviewer accounts exercised `/app/verification` and `/app/admin/verification`; non-reviewers were denied reviewer access.
- Proof upload/storage runtime pass: dummy PNG upload succeeded into private Storage, request/evidence rows were created, UUID-only storage path was used, metadata was safe, and no claims were issued from upload alone.
- Proof reviewer-routing runtime pass: requested-airline routing context persisted and airline-scoped reviewer access worked without temporary global scope.
- Controlled proof-viewing runtime pass: reviewer authorization produced short-lived signed URL access without exposing storage path, public URL, preview, or persistent download controls.
- Proof deletion runtime pass: an expired dummy proof object was deleted from private Storage, `deleted_at` was set, safe metadata remained, and post-deletion proof access denied with `proof_deleted`.
- Protected cleanup trigger runtime pass: `POST /api/ops/proof-retention-cleanup` denied unauthenticated calls, accepted the correct secret header, deleted the controlled proof object, and recorded deletion audit events.
- Cron-compatible cleanup route runtime pass: `GET /api/ops/proof-retention-cleanup/cron` denied missing/malformed/wrong bearer tokens and query-string secrets, accepted the correct bearer token, deleted one controlled dummy proof object, recorded deletion events, and preserved manual route behavior.

Primary runtime artifacts:

- [Verification Runtime Pass: American Airlines Test](../ops/verification-runtime-pass-american-airlines.md)
- [Redacted Proof Upload Runtime Pass](../ops/redacted-proof-upload-runtime-pass.md)
- [Controlled Proof Viewing Runtime Pass](../ops/controlled-proof-viewing-runtime-pass.md)
- [Proof Retention Deletion Runtime Pass](../ops/proof-retention-deletion-runtime-pass.md)
- [Proof Retention Cleanup Trigger Runtime Pass](../ops/proof-retention-cleanup-trigger-runtime-pass.md)
- [Proof Retention Cleanup Scheduler Compatibility](../ops/proof-retention-cleanup-scheduler-compatibility.md)

## 4. Security And Privacy Boundaries Preserved

Epoch 04 preserved these boundaries:

- No employer-system lookup.
- No private airline-system scraping.
- No AI/OCR approval.
- No automatic claim issuance from proof upload.
- No role/base issuance from work-email or proof upload alone.
- No public proof URLs.
- No broad Storage listing/read policy.
- No normal-user or reviewer direct Storage read policy.
- No proof storage path, signed URL, public URL, raw filename, OCR text, proof text, employee ID, badge number, barcode, or QR data in UI or security events.
- No self-review.
- Service-role credentials remain server-only.
- Controlled proof viewing creates only short-lived signed URLs after reviewer authorization.
- Cleanup route is protected by `x-jmpseat-ops-secret`.
- Cron route is protected by bearer secret and does not accept query-string secrets.
- Deletion events remain sanitized and audit-oriented.

## 5. Claims And Authorization State

Current claim state:

- `airline_worker` claim issuance works through reviewer approval.
- `airline` claim issuance works from the supported work-email review path when safe approved-domain airline metadata exists.
- `role` remains unimplemented/unissued by current work-email and proof paths.
- `base` remains unimplemented/unissued by current work-email and proof paths.
- Requested-airline proof metadata is routing context only; it is not proof, not a verified claim, and not authorization.
- Claim-gated community rooms, boards, and posts are not implemented yet.

## 6. Remaining Non-Blocking Follow-Ups

The following do not block exiting Epoch 04, but they should be addressed before broader production or community rollout:

- Production Vercel environment variables:
  - `OPS_CLEANUP_SECRET`
  - `CRON_SECRET`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Production Vercel Cron deployment and monitoring.
- Final privacy/legal copy for proof collection, proof viewing, retention, and deletion.
- Supabase auth email templates and custom SMTP/auth sender branding.
- Operator tooling for approved email domains.
- Operator tooling for reviewer scopes.
- Cleanup failure monitoring and alerting.
- Final approved airline-domain policy.
- Production incident runbook covering proof access, proof deletion, secret rotation, and cleanup failures.

## 7. Known Limitations

Known limitations at Epoch 04 exit:

- No community rooms, boards, or posts yet.
- No mobile app.
- No AI precheck.
- No proof OCR.
- No full admin dashboard.
- No production legal/privacy launch approval yet.
- No final public work-email delivery branding yet.
- No operator UI for approved-domain management.
- No operator UI for reviewer-scope management.
- No cleanup failure dashboard or alerting.

## 8. Recommended Epoch 05 Options

### Option A: Operator/Admin Tooling Foundation

Scope:

- Approved-domain management UI.
- Reviewer-scope management UI.
- Cleanup monitoring.
- Audit inspection.
- Bounded operator actions and runbooks.

Why this is the best next path:

- Verification now works, but approved domains, reviewer scopes, and cleanup monitoring still require manual SQL/operator handling.
- Manual SQL operations do not scale safely once real users and real proof uploads exist.
- This path reduces operational risk before opening claim-gated community surfaces.

### Option B: Production Readiness / Trust And Legal Ops

Scope:

- Privacy policy.
- Auth email branding/custom SMTP.
- Incident/runbook hardening.
- Vercel environment and cron production setup.

Why this may be chosen:

- If the next goal is production hardening rather than product surface expansion, this is the right path.
- It should happen before public launch or real sensitive uploads at scale.

### Option C: Claim-Gated Community Foundation

Scope:

- Rooms/boards protected by approved claims.
- Read-only or seeded community structures.
- Later post/comment functionality only after moderation readiness.

Why this should wait:

- Community access should rely on stable operator management for verification domains, reviewers, and cleanup.
- Moderation/admin foundations are not complete.

Recommended next epoch:

- Epoch 05 = Operator/Admin Tooling Foundation.

Rationale:

- Epoch 04 proves verification works.
- The next bottleneck is safe operation, not verification feature coverage.
- Managing approved domains, reviewer scopes, cleanup failures, and audit inspection manually through SQL is not scalable or safe enough for real usage.

## 9. Merge And Deployment Status

Repo/runtime foundation status:

- Epoch 04 repo/runtime foundation is complete.
- All Epoch 04 feature slices were merged to `main`.
- Required Supabase migrations through the proof deletion security-event taxonomy were applied remotely.
- The Vercel-Cron-compatible cleanup route required no migration.
- No further Epoch 04 feature work is recommended before moving to the next epoch unless a bug appears.

Production deployment status:

- Production deployment still requires environment configuration and monitoring.
- Vercel `OPS_CLEANUP_SECRET`, `CRON_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` must be configured server-side before scheduled cleanup is treated as production-ready.
- Production privacy/legal review remains open.
- Operator/admin tooling remains open and is the recommended next epoch.

## 10. Exit Decision

Exit Epoch 04 and begin planning Epoch 05 as Operator/Admin Tooling Foundation.

Do not begin claim-gated community work until the team explicitly accepts the remaining operator, trust, legal, and moderation risks.
