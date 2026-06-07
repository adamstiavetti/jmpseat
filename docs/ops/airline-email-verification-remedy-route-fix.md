# Airline Email Verification Remedy Route Fix

Date: 2026-06-06

## Summary

Current-state note: this runtime fix has been superseded by the auth
design-system overhaul. `/app/access-hold` is now the canonical access status
and airline employee email verification surface. `/app/verification` is
deprecated as a standalone page and redirects to `/app/access-hold`; the
`/app/verification/confirm` route remains only for legacy-compatible work-email
confirmation links.

Founder-testing surfaced an access dead-end in the current private-testing flow:

- the user could sign up or log in
- the user could complete the profile requirement
- the private app gate correctly blocked app entry because airline-email eligibility was not verified
- `/app/access-hold` explained the missing airline-email requirement
- `/app/verification` was still treated as a normal private child route, so it redirected back to `/app/access-hold`

The original fix made `/app/verification` a remedy route for authenticated users
who had completed profile onboarding but still needed airline employee email
verification. That remedy has since moved inline to `/app/access-hold`.

## Behavior

`/app/access-hold` now gives missing-airline-email users the airline employee
email input and six-digit code confirmation flow directly on the access-hold
page.

`/app/verification` no longer renders a standalone remedy UI. It redirects to
`/app/access-hold`.

The legacy confirmation route `/app/verification/confirm` remains protected by:

- Supabase auth
- completed profile onboarding

The current access-hold verification remedy no longer requires:

- active beta access
- already-approved airline-email eligibility

This keeps the remedy reachable specifically so users can resolve the missing
eligibility state without a separate verification page.

## Gate Rules Unchanged

This fix does not weaken app entry:

- normal `/app` private routes still require the existing launch-mode gate result
- `private_testing` and `internal_test` still require beta access plus airline-email eligibility
- `first_base_launch` and `broader_launch` still require airline-email eligibility
- invite codes still do not replace airline-email verification
- unverified users still cannot enter the app shell through ordinary private routes

## Proof Upload Remains Frozen

The access-hold verification remedy still does not reintroduce:

- proof upload
- badge upload
- document upload
- proof-review user flow
- raw proof files or storage identifiers

The current page remains an airline employee email eligibility surface.

## Validation

Validation should include:

- private-app gate tests for the new verification remedy route
- verification surface tests for the access-hold CTA
- beta access and invite-code tests to confirm invite codes still do not bypass airline-email verification
- auth/profile tests to confirm login and profile prerequisites are preserved
- lint, typecheck, build, and `git diff --check`
