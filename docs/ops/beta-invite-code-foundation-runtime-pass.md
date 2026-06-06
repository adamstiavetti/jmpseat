# Beta Invite-Code Foundation Runtime Pass

Date: 2026-06-06

Commit validated:

- `efd71b6` (`feat: add beta invite code foundation`)

Migration applied:

- `20260606120000_add_beta_invite_code_foundation.sql`

Operator identity:

- Validated against the linked Supabase runtime.
- Privileged operator UUID and email are intentionally redacted.
- The active operator grant was confirmed and brought up to the reviewed `operator.manage_beta_invites` scope for this runtime validation without printing privileged identifiers.

Plaintext invite-code handling:

- Plaintext invite codes were generated only in local process memory for validation.
- Plaintext invite codes were not printed.
- Plaintext invite codes were not committed.
- Plaintext invite codes were not stored in database columns.
- Plaintext invite codes were not logged in security-event metadata.

## Scope

This runtime pass validates the FBMVP-T03A beta invite-code foundation on the linked Supabase runtime after migration apply.

Validated scope:

- hash-only beta invite-code storage
- bounded operator batch generation through `operator.manage_beta_invites`
- verified-airline-email-gated redemption through the server helper boundary
- single-use redemption behavior
- generic failed-redemption behavior
- invite-code beta access linkage
- audit events without plaintext codes or code hashes
- redeemed invite-code rows surviving auth user deletion through nullable `redeemed_by_user_id`

Not added or changed:

- no `first_base_launch` or `broader_launch` gate changes
- no invite-code requirement outside `private_testing` or `internal_test`
- no airline-email bypass
- no role/base claims
- no baseboards, board memberships, posting, community-admin tools, or restricted-board gates
- no proof infrastructure deletion
- no raw proof files, proof content, signed URLs, public proof URLs, storage paths, filenames, tokens, sessions, service-role details, or secrets exposed

## Migration Apply

Preflight confirmed `main` was clean and the only local migration missing from the linked runtime was:

- `20260606120000_add_beta_invite_code_foundation.sql`

The local Supabase CLI could not inspect the linked project because a CLI access token was not available in the shell. The authenticated Supabase connector was used to apply the reviewed migration SQL to the linked jmpseat project.

After apply, migration history was verified and aligned so the linked runtime reports:

- `20260606120000` / `add_beta_invite_code_foundation`

No `supabase db push` command was run during this task.

## Env And Operator Preflight

Confirmed without printing values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Confirmed without printing privileged identifiers:

- linked Supabase project is active and reachable
- active operator grant exists
- operator access-management scope exists for the validated operator
- `operator.manage_beta_invites` was present after runtime grant alignment
- runtime access mode behavior can be tested without committing env values

## Runtime Validation

### 1. Migration And Schema Checks

Validated against linked runtime:

- `beta_invite_batches` exists
- `beta_invite_codes` exists
- `beta_access.invite_code_id` exists
- `beta_invite_codes.code_hash` exists
- no plaintext invite-code storage columns exist
- redeemed-state constraint exists
- invite-code status/index coverage exists

Validated redeemed-row user deletion behavior:

- redeemed rows may have `redeemed_by_user_id` set to null through auth-user deletion cleanup
- redeemed rows retain `redeemed_at`
- redeemed rows retain `redeemed_count`

### 2. Operator Generation Checks

Validated:

- operator without `operator.manage_beta_invites` is denied
- operator with `operator.manage_beta_invites` can create a small runtime validation batch
- batch generation stores hashes only
- plaintext generated codes are not stored
- `beta_invite.batch_created` audit event persists
- audit metadata does not include plaintext invite codes or code hashes

### 3. Redemption Authorization Checks

Validated:

- missing airline-email eligibility is stopped before the database redemption call
- verified airline-email eligibility can redeem one active invite code
- successful redemption grants active beta access
- successful redemption sets `source = 'invite_code'`
- successful redemption links `beta_access.invite_code_id`
- redeemed code cannot redeem again
- revoked code cannot redeem
- expired code cannot redeem
- paused-batch code cannot redeem
- already-beta-active user receives safe `already_has_beta_access` behavior
- failure responses remain generic and use `invalid_or_unavailable_code` for unavailable inventory states

The unauthenticated redemption path is covered by source tests because the database RPC is service-role-only and the app wrapper requires an authenticated user context before calling it.

### 4. Gate Behavior Checks

Validated through focused tests and runtime helper exercise:

- `private_testing` requires airline-email eligibility plus beta access
- `internal_test` remains beta-required
- invite-code redemption grants beta access through the existing beta gate path
- `first_base_launch` still bypasses beta and still requires airline-email eligibility
- `broader_launch` still bypasses beta and still requires airline-email eligibility
- invite codes are not required in `first_base_launch` or `broader_launch`
- invite code alone does not grant app entry without airline-email verification
- `/app/access-hold` shows invite-code entry only when beta is required, the user lacks beta, and airline-email eligibility is verified
- `/app/access-hold` does not suggest proof upload

### 5. Audit And Security Checks

Validated:

- `beta_invite.code_redeemed` persists without plaintext code
- `beta_invite.redemption_failed` persists without plaintext code
- `beta_access.granted_from_invite` persists
- invite-code-like security-event metadata keys are redacted by source tests
- no plaintext invite codes appear in security-event metadata
- no code hashes appear in invite audit metadata
- unauthorized users are not granted invite inventory access

### 6. Existing Behavior Unchanged

Validated:

- proof upload remains frozen from the user-facing verification page
- proof upload/access/retention/cleanup regression tests still pass
- auth, profile, private app, launch-mode, security-event, and admin/operator tests still pass
- no baseboard, board, posting, community-admin, or restricted-board functionality was added

## Tests And Validation Run

Passed:

- `node --test test/beta-access/betaInviteCodes.test.mts`
- `node --test test/beta-access/betaAccess.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `node --test test/verification/airlineEmailAccess.test.mts test/verification/workEmail.test.mts test/verification/verificationRequestFlows.test.mts test/verification/verificationSurface.test.mts test/verification/claimsAuth.test.mts`
- `node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts`
- `node --test test/profile/profile.test.mts`
- `node --test test/security-events/securityEvents.test.mts test/security-events/verificationSecurityEvents.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/verification/proofUpload.test.mts test/verification/proofAccess.test.mts test/verification/proofRetention.test.mts test/ops/proofRetentionCleanupRoute.test.mts`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `git diff --check`

Lint note:

- `npm run lint` passed with only the known pre-existing warnings in `app/lab/live-globe-proof/page.tsx` and `src/lib/scroll/heroFlightControl.ts`

Node test note:

- direct Node test runs emitted the existing `MODULE_TYPELESS_PACKAGE_JSON` warnings

## Caveats

- production deployment/runtime validation is separate if this pass was performed only against linked local/dev runtime infrastructure
- no baseboards, boards, posting, community-admin tools, or restricted-board gates were implemented
- no plaintext invite codes were printed, committed, stored, or logged
- the local Supabase CLI lacked shell authentication, so migration apply and migration-history verification used the authenticated Supabase connector
