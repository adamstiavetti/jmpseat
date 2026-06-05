# Proof-System Freeze / Deprecation Plan

Brand note: jmpseat is the canonical product and app name. This plan does not
claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Proof upload is frozen as a forward product path.

jmpseat will not ask users to upload badges, redacted proof files, employment
documents, screenshots, or similar sensitive evidence under the new model.
Forward app access should use confirmed approved airline employee email, and
restricted role/base board access should use board-level membership and
community-admin approval.

Existing proof systems remain historical/runtime-applied infrastructure until
they are safely deprecated. No existing proof tables, migrations, Storage
buckets, runtime docs, cleanup routes, cleanup helpers, or audit history should
be removed without a separate reviewed deprecation/removal plan.

## 2. What Is Frozen Immediately

The following forward work is frozen unless explicitly re-approved:

- redacted proof upload UI expansion
- badge/document upload UX
- controlled proof viewing expansion
- human proof review expansion
- proof-based role/base claim issuance
- proof cleanup monitoring expansion
- protected manual proof cleanup expansion
- new proof storage features
- AI/OCR proof-reading or proof-approval flows
- community-admin or board-admin proof access

Existing runtime-applied proof work remains in place as legacy safety
infrastructure. Frozen means "do not expand as product direction," not "delete
without review."

## 3. What Remains Active For Safety / Ops

Existing proof infrastructure may need to remain available for data safety and
audit accountability while any proof rows, proof objects, or proof-derived audit
events still exist.

The following should remain intact until data-retirement review says otherwise:

- existing proof retention/deletion cleanup
- existing cleanup routes if proof rows or Storage objects already exist
- audit/event history
- runtime proof docs
- Storage bucket history
- `deleted_at` / `delete_after` semantics
- admin/operator audit trails
- failure monitoring for legacy cleanup

Dormant does not mean safe to ignore. If proof data exists, cleanup and audit
hygiene still matter. Existing cleanup behavior should not be broken until
proof-data retirement is confirmed.

## 4. What Must Be Hidden From Users

Future implementation should hide, remove, or disable these normal-user
surfaces:

- proof upload forms
- "upload badge" or "upload proof" copy
- proof submission CTAs
- proof-review status messaging for normal users
- any implication that users need documents for app access
- proof-based role/base verification messaging
- proof-upload references in onboarding or launch copy

The user-facing product should explain the new model clearly: general access is
based on confirmed approved airline employee email, and restricted board access
is community-managed.

## 5. What Must Remain Inaccessible

Legacy proof infrastructure must continue to preserve these boundaries:

- no raw proof file access for users
- no public proof URLs
- no signed URL exposure outside the existing controlled reviewer path while
  legacy proof viewing still exists
- no proof path/object identifiers in UI
- no arbitrary delete controls
- no user re-download of uploaded proof
- no community-admin access to stored proof files
- no board-admin proof viewing
- no proof file sharing with airlines, employers, unions, or airports

If a later plan removes the controlled reviewer path, it should do so by
disabling or retiring the flow safely, not by broadening access.

## 6. Data Retention Posture

Existing proof files, if any, should continue to follow the established
`delete_after` / `deleted_at` cleanup semantics.

Failed deletion should remain visible to authorized operators until resolved.
Raw proof should not become permanent identity storage. Safe metadata and audit
rows may remain for accountability unless a later legal/privacy deletion policy
requires a different retention rule.

A future data-retirement task should inspect whether proof files exist, whether
legacy proof rows still reference Storage objects, whether cleanup failures are
present, and whether rows can be archived or retained as metadata only.

## 7. Database / Migration Posture

Existing applied migrations cannot simply be removed.

Existing tables, functions, policies, triggers, and Storage buckets should not
be dropped until all of the following are true:

- no active code depends on them
- no stored proof objects remain
- retention obligations are satisfied
- audit/history needs are understood
- rollback implications are reviewed
- operator cleanup and audit visibility are no longer needed for safety

Future implementation should prefer disabling or hiding user-facing flows before
dropping schema. Any schema removal must be a separate migration with review,
tests, migration-state verification, and runtime validation.

## 8. Route / UI Freeze Plan

Likely future route and component review:

- `/app/verification`: update copy or replace with airline-email access
  verification status; hide proof-upload paths from normal users.
- Proof upload forms/actions: hide or disable for normal users; do not accept
  new badge/document uploads under the forward model.
- Reviewer proof viewing actions: keep only if needed for legacy audit or
  cleanup investigation; otherwise deprecate later through a reviewed plan.
- `/app/admin/verification`: treat proof-review surfaces as legacy verification
  operations and avoid expanding them into forward community access tooling.
- `/app/admin/proof-cleanup`: keep operator-only for legacy cleanup safety while
  proof data may exist; label as legacy safety tooling in future copy.
- Proof cleanup monitoring/manual cleanup controls: keep operator-only and
  bounded while legacy proof data may exist; do not expand as a product feature.
- Proof-related copy: update any copy that describes proof upload as a current
  app-access path.

Suggested categories:

- hide from normal users: proof upload forms, proof upload CTAs, proof-review
  user status copy
- keep operator-only for legacy ops: proof cleanup monitoring and manual cleanup
  controls
- update copy: `/app/verification`, onboarding, admin labels
- deprecate later: reviewer proof viewing and proof-review workflows after data
  retirement and policy review

## 9. Admin / Operator Posture

jmpseat operators may still need legacy proof-system visibility for cleanup,
audit, and privacy-response work.

Community admins should never gain proof-system access. Operator tools for
proof cleanup should be treated as legacy safety tools, not forward product
features.

New operator work should prioritize community/board safety tooling, community
admin accountability, launch-readiness gate transition, and moderation
readiness instead of proof tooling expansion.

## 10. Security / Privacy Boundaries

The forward model includes:

- no badge upload
- no proof upload
- no OCR/AI proof approval
- no employer-system lookup
- no proof sharing with community admins
- no proof sharing with airlines, airports, unions, or employers
- no role/base global claim issuance from proof
- no new proof storage expansion
- no public proof URLs
- no proof filename/path exposure
- no arbitrary proof deletion controls

These boundaries apply to user-facing surfaces, community-admin tooling,
operator docs, and future implementation tickets unless explicitly re-approved.

## 11. Transition Strategy

Recommended staged transition:

1. Stage 1: docs freeze
   - Declare proof upload frozen as a forward product path.
   - Treat existing proof systems as historical/runtime-applied infrastructure.
2. Stage 2: UX freeze
   - Hide or disable proof upload from normal user flows.
   - Update `/app/verification` copy.
   - Remove document-upload expectations from onboarding and launch copy.
3. Stage 3: gate refactor
   - Make airline-email verification the forward app-level access state.
   - Keep private beta behavior explicit until launch-readiness work changes it.
4. Stage 4: legacy ops review
   - Confirm whether any proof files or rows remain.
   - Keep cleanup and monitoring until Storage is empty or policy says
     otherwise.
   - Inspect failed cleanup state before disabling legacy tools.
5. Stage 5: deprecation/removal decision
   - Decide whether to keep tables as historical metadata, archive rows, retain
     dormant schema, or drop schema later.
   - Implement any removal through a separate reviewed migration.

## 12. Implementation Implications

Likely future tickets:

- hide proof upload UI
- update verification page copy
- add airline-email verification gate state
- audit proof-related routes for exposure
- mark proof cleanup tools as legacy operator safety tools
- inspect the proof Storage bucket for remaining objects
- inspect `verification_evidence` rows for active proof references
- create a proof data-retirement runbook
- add policy copy that jmpseat does not request badge/document uploads
- decide whether reviewer proof-viewing routes should remain available for
  legacy operations
- update tests so future user-facing flows cannot reintroduce proof upload
  without explicit approval

## 13. Non-Goals

This task does not include:

- code changes
- database migrations
- proof data deletion
- Storage bucket deletion
- schema dropping
- runtime cleanup execution
- E05-T08 work
- proof-route disabling
- proof UI hiding
- airline-email gate implementation
- board/community implementation

## 14. Open Questions

- Are there any real user proof files in Storage?
- Are there only test proof files?
- Should legacy proof tables remain indefinitely as audit metadata?
- Should the proof Storage bucket be disabled, emptied, or retained dormant?
- How should privacy policy/terms describe legacy proof handling?
- Should proof-related admin pages be hidden from all operators except platform
  safety admins?
- Do cleanup routes stay enabled until all proof objects are gone?
- What is the safest user-facing message for removing proof upload?
- Do we need a data-retirement audit before launch?
- Should reviewer proof-viewing routes be disabled before first-base launch if
  no legacy proof data remains?
- Which operator scope should own any future data-retirement inspection?

## 15. Source-Of-Truth Statement

This plan freezes proof-upload verification as a forward product path.

It does not delete, alter, or invalidate historical/runtime-applied proof
infrastructure.

Future implementation must not expand proof upload, proof review, proof viewing,
or proof cleanup features unless explicitly re-approved.

Future implementation should prefer airline-email access and community-admin
board membership.
