# FBMVP-T04 Onboarding / Signup Flow Update

Date: 2026-06-06

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## Summary

FBMVP-T04 updated the user-facing auth, profile, and access-hold copy so the current access journey is coherent after the airline-email access gate, launch-mode gate, and beta invite-code foundation work.

Current-state note: the later auth design-system overhaul deprecated
`/app/verification` as a standalone user-facing page. `/app/access-hold` is now
the canonical access status and airline employee email verification surface.

The implemented journey is:

- create or log in to a jmpseat account
- complete minimal profile onboarding
- verify an approved airline employee email on `/app/access-hold` as the
  app-level eligibility credential
- redeem a beta invite code only when `private_testing` or `internal_test` still requires beta access
- enter the app when the existing gate rules pass

No migration was created.

## Surfaces Changed

Updated surfaces:

- `app/signup/page.tsx`
- `app/login/page.tsx`
- `app/app/profile/page.tsx`
- `app/app/access-hold/page.tsx`
- `app/app/verification/page.tsx` was originally updated by this ticket, but
  later became a compatibility redirect to `/app/access-hold`.

Updated tests:

- `test/auth/authPages.test.mts`
- `test/profile/profile.test.mts`
- `test/beta-access/betaInviteCodes.test.mts`
- `test/verification/verificationSurface.test.mts`

## Signup And Login Behavior

Signup and login now explain that:

- the login account is the account credential
- airline employee email verification is required for app access
- closed beta/private testing may also require a beta invite code
- login email can be separate from airline employee email
- an invite code does not replace airline-email verification

The auth mechanics were not changed.

## Access-Hold Behavior

`/app/access-hold` continues to use the existing gate state. This ticket did not change launch-mode behavior.

Current behavior remains:

- `private_testing` and `internal_test` require beta access plus airline-email eligibility
- `first_base_launch` and `broader_launch` bypass beta but still require airline-email eligibility
- beta invite-code redemption appears only when beta is required, beta access is missing, and airline-email eligibility is verified
- invite-code failures remain generic

Copy now clarifies that first-base or broader launch access does not require a beta invite code when beta is bypassed.

## Verification Surface Behavior

`/app/access-hold` is now the airline employee email eligibility surface.
`/app/verification` is deprecated as a standalone page and redirects to
`/app/access-hold`.

The current access-hold surface reflects the already-implemented access model:

- app entry checks profile completion, airline-email eligibility, and beta access when private testing requires it
- airline-email eligibility does not grant role, base, or restricted-board membership
- work email is not public
- restricted-board access remains a later board/community-admin approval flow
- proof upload remains frozen as a forward access path

No proof upload, badge upload, document upload, signed URL, public proof URL, storage path, filename, proof content, token, session, or service-role behavior was exposed.

## Profile Behavior

`/app/profile` remains minimal profile onboarding. This ticket did not add heavier profile requirements.

The profile page continues to treat claimed airline, role, and base as self-declared fields. Profile completion remains separate from airline employee email verification and beta approval.

## Gate Rules Unchanged

This implementation does not change:

- authentication requirements
- profile completion requirements
- `private_testing`
- `internal_test`
- `first_base_launch`
- `broader_launch`
- beta invite-code redemption rules
- airline-email eligibility derivation
- proof retention, cleanup, storage, viewing, or audit behavior

Invite codes still do not bypass airline-email verification and are not required for `first_base_launch` or `broader_launch`.

## Confirmation Email Follow-Up

Supabase confirmation email template polish, custom SMTP, and auth email branding remain separate follow-up work before founder/Yuri Vercel testing or public-ish waitlist login entry.

The public landing "Closed Beta Login" entry remains deferred until the auth flow and confirmation email experience are polished and reviewed.

Recommended next auth-polish task:

- Supabase confirmation email template / custom SMTP / auth email branding

## Non-Goals

This implementation does not:

- create migrations
- run `supabase db push`
- deploy anything
- implement FBMVP-T05 or later tickets
- implement baseboards
- implement board memberships
- implement posting
- implement community-admin tools
- implement restricted-board gates
- issue role or base claims
- auto-upgrade ambiguous proof-based claims
- delete proof infrastructure
- reintroduce proof upload, badge upload, document upload, or employment-document upload
- make invite codes required outside `private_testing` or `internal_test`
- change `first_base_launch` or `broader_launch` behavior

## Validation

Validation run:

- `node --test test/beta-access/betaInviteCodes.test.mts test/beta-access/betaAccess.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `node --test test/verification/airlineEmailAccess.test.mts test/verification/workEmail.test.mts test/verification/verificationRequestFlows.test.mts test/verification/verificationSurface.test.mts test/verification/claimsAuth.test.mts`
- `node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts`
- `node --test test/profile/profile.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

All commands passed. `npm run lint` reported only the known unrelated warnings in `app/lab/live-globe-proof/page.tsx` and `src/lib/scroll/heroFlightControl.ts`.

## Next Ticket

Recommended next task before broad founder/Yuri Vercel testing or public-ish waitlist login entry:

- Supabase confirmation email template / custom SMTP / auth email branding

Baseboards, board memberships, posting, community-admin tools, and restricted-board gates remain pending later FBMVP tickets.
