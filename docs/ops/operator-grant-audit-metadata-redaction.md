# Operator Grant Audit Metadata Redaction

Date: 2026-06-07

Branch: `fix/operator-grant-audit-metadata-redaction`

## Summary

The E05 grant-management runtime proof was blocked during preflight because
operator grant/revoke security-event metadata included raw target user
identifiers, and the admin audit reader could render top-level user references
outside sanitized metadata. This fix removes target identifiers from general
`security_events.metadata` for operator grant/revoke events and defensively
redacts target/actor/user identifier keys plus top-level user references from
the admin audit reader.

Runtime grant-management proof remains pending until this migration is applied
to the linked stable beta runtime.

## What Changed

- Added a replacement migration for `grant_operator_access(...)` and
  `revoke_operator_access(...)`.
- Removed raw target user identifiers from operator grant/revoke
  security-event metadata.
- Preserved useful audit metadata with safe booleans and flow markers.
- Updated the operator audit metadata sanitizer to redact identifier-shaped
  metadata keys from historical and future events, including `user_id`,
  `userId`, `target_user_id`, `targetUserId`, `actor_user_id`, and
  `actorUserId`.
- Updated the app-side sanitizer used by the admin audit reader as a
  defense-in-depth layer.
- Redacted top-level user references rendered by the admin audit UI so operator
  audit inspection does not display raw user identifiers outside metadata.

Safe operator grant/revoke event metadata may include:

- `operator_access_flow`
- `scope_names`
- `target_user_found`
- `target_already_had_active_grant`
- `target_had_active_grant`
- `grant_created`
- `grant_revoked`
- `reason_present`
- `reason_code`

## Source Of Truth

The dedicated `operator_grants` table remains the source of truth for actual
operator grant relationships. Target user identifiers stay in that privileged
grant table where they are required for database integrity and revocation.

General security-event metadata is not the source of truth for target identity
and should remain bounded to safe operational context.

## Boundaries Preserved

This fix does not:

- grant beta access
- mark `airline_email_verified`
- issue role claims
- issue base claims
- issue restricted-board claims
- change founder/admin/operator access behavior
- change work-email verification behavior
- reintroduce proof upload, badge upload, document upload, or proof review
- run runtime grant proof

## Validation Status

Local tests now cover:

- grant event metadata no longer includes target identifiers
- revoke event metadata no longer includes target identifiers
- duplicate active grant audit metadata stays safe/idempotent
- expected denials remain audited without throwing
- admin audit sanitizers redact target/actor/user identifier keys
- admin audit display redacts top-level request and event user references
- operator grant management remains separate from beta access,
  airline-email eligibility, role/base claims, and restricted-board claims

Runtime validation is pending after the migration is applied.

## Next Step

After merge and migration application, rerun:

`E05-Grant-Management Runtime Proof And Handoff Reconciliation`

That runtime proof should validate `/app/admin/operator-access` through an
authenticated operator session and then reconcile the remaining Epoch 5 docs.
