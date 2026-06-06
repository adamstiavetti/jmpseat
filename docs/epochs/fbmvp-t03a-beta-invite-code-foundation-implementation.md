# FBMVP-T03A Beta Invite-Code Foundation Implementation

Date: 2026-06-06

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## Summary

FBMVP-T03A adds the beta invite-code foundation for controlled private testing.

Invite codes are private-testing capacity controls only. They do not prove airline eligibility, do not bypass airline-email verification, do not grant restricted-board access, and are not required for `first_base_launch` or `broader_launch` general access.

Runtime validation is complete for the linked Supabase runtime. See `docs/ops/beta-invite-code-foundation-runtime-pass.md`.

## Migration

Migration created:

- `supabase/migrations/20260606120000_add_beta_invite_code_foundation.sql`

The migration adds:

- `beta_invite_batches` for bounded operator-created batches
- `beta_invite_codes` for hash-only invite inventory
- `beta_access.invite_code_id` linkage for invite-sourced beta grants
- `operator.manage_beta_invites` in the operator scope allowlist
- security event types for invite batch creation, redemption, failed redemption, and beta grants from invite redemption

Plaintext invite codes are not stored in the database. The database stores only `code_hash`.

Redeemed invite-code rows preserve useful redemption history even if the redeeming auth user is later deleted. `redeemed_by_user_id` uses `on delete set null`, so it may become null during auth-user cleanup. `redeemed_at` and `redeemed_count` remain the durable redemption indicators, and active/unredeemed rows must still have no redemption user, timestamp, or count.

The migration has been applied and runtime-proven on the linked Supabase runtime. The runtime proof is recorded in `docs/ops/beta-invite-code-foundation-runtime-pass.md`.

## Generation Behavior

Generation helper:

- `src/lib/betaAccess/inviteCodeShared.ts`

Server-only operator helper:

- `src/lib/betaAccess/inviteCodes.ts`

Invite codes are generated with cryptographically secure randomness, use an ambiguous-character-avoiding alphabet, and normalize to grouped uppercase codes.

Batch generation is bounded to at most 100 codes per call.

The operator generation path requires explicit `operator.manage_beta_invites`. It returns plaintext codes only in the successful generation result so an operator can distribute them once. Failed generation returns no plaintext codes.

No full admin UI was added in this slice. The foundation is DB/server-side first; an operator UI can be reviewed separately if needed.

## Redemption Behavior

Core redemption helper:

- `src/lib/betaAccess/inviteCodeCore.ts`

Server redemption action:

- `src/lib/betaAccess/inviteCodes.ts`

User entry surface:

- `app/app/access-hold/page.tsx`

Redemption requires:

- authenticated user
- active `private_testing` or `internal_test` beta-required mode
- missing active beta access
- confirmed approved airline employee email eligibility
- valid normalized invite code
- active, unused, unexpired invite code in an active, unexpired batch

Redeemed, revoked, expired, unavailable, or paused/closed/revoked-batch codes do not grant beta access. Failure responses are generic so they do not reveal invite inventory details.

Successful redemption grants beta access with `source = 'invite_code'` and links the beta-access row to the invite code id.

## Access-Hold Behavior

`/app/access-hold` shows the invite-code form only when the user is eligible to redeem during beta-required modes:

- launch mode requires beta access
- user does not already have active beta access
- airline-email eligibility is verified

If airline-email eligibility is not verified, the page explains that beta invite codes do not replace airline-email verification.

The access-hold page does not expose invite inventory, proof files, proof upload, badge upload, signed URLs, storage paths, filenames, or proof content.

## Airline-Email Dependency

Invite redemption depends on the FBMVP-T02 airline-email access-state helper.

Invite code redemption does not create, infer, or upgrade airline-email verification. A personal login email alone is not enough. Unsupported, pending, expired, revoked, or not-ready airline-email states block redemption.

This preserves the launch/access rule that beta access is rollout control and airline-email verification is the eligibility credential.

## Launch-Mode Boundaries

This implementation does not change `first_base_launch` or `broader_launch` gate behavior.

Beta invite codes are used only where beta access remains required:

- `private_testing`
- `internal_test`

Invite codes are not required for general app access in:

- `first_base_launch`
- `broader_launch`

## Security And Audit Behavior

Security event types added:

- `beta_invite.batch_created`
- `beta_invite.code_redeemed`
- `beta_invite.redemption_failed`
- `beta_access.granted_from_invite`

Audit metadata remains safe:

- no plaintext invite codes
- no code hashes
- no secrets
- no tokens or sessions
- no proof files, proof content, signed URLs, public proof URLs, storage paths, or filenames

Security-event redaction now treats invite-code-like metadata keys as sensitive.

The database RPCs are service-role-only and are not granted to normal authenticated users.

## Non-Goals

This implementation does not:

- run `supabase db push`
- deploy anything
- implement FBMVP-T04 or later tickets
- implement baseboards
- implement board memberships
- implement posting
- implement community-admin tools
- implement restricted-board gates
- issue role or base claims
- auto-upgrade ambiguous proof-based claims
- delete proof infrastructure
- require invite codes outside `private_testing` or `internal_test`
- make invite codes a first-base or broader-launch requirement
- add a full operator UI

## Validation

Focused validation for this branch should include:

- `node --test test/beta-access/betaInviteCodes.test.mts`
- `node --test test/beta-access/betaAccess.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- verification, auth, profile, security-events, and operator regression tests
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

Runtime validation is complete for the linked Supabase runtime. Production deployment/runtime validation remains separate if this pass was performed against local/dev runtime infrastructure.

## Next Ticket

Recommended next implementation ticket after runtime-proof review:

- `FBMVP-T04 Onboarding/Signup Flow Update`

FBMVP-T04 should continue using confirmed approved airline employee email as the eligibility credential and should not reintroduce proof upload, role/base claims, board access, or beta invite codes as a launch-mode requirement.
