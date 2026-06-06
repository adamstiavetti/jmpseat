# Airline Email Verification Remedy Route Fix

Date: 2026-06-06

## Summary

Founder-testing surfaced an access dead-end in the current private-testing flow:

- the user could sign up or log in
- the user could complete the profile requirement
- the private app gate correctly blocked app entry because airline-email eligibility was not verified
- `/app/access-hold` explained the missing airline-email requirement
- `/app/verification` was still treated as a normal private child route, so it redirected back to `/app/access-hold`

The fix makes `/app/verification` a remedy route for authenticated users who have completed profile onboarding but still need airline employee email verification.

## Behavior

`/app/access-hold` now gives missing-airline-email users a clear "Verify airline employee email" link to `/app/verification`.

`/app/verification` remains protected by:

- Supabase auth
- completed profile onboarding

`/app/verification` no longer requires:

- active beta access
- already-approved airline-email eligibility

This keeps the verification page reachable specifically so users can resolve the missing eligibility state.

## Gate Rules Unchanged

This fix does not weaken app entry:

- normal `/app` private routes still require the existing launch-mode gate result
- `private_testing` and `internal_test` still require beta access plus airline-email eligibility
- `first_base_launch` and `broader_launch` still require airline-email eligibility
- invite codes still do not replace airline-email verification
- unverified users still cannot enter the app shell through ordinary private routes

## Proof Upload Remains Frozen

The verification remedy route still does not reintroduce:

- proof upload
- badge upload
- document upload
- proof-review user flow
- raw proof files or storage identifiers

The page remains an airline employee email eligibility surface.

## Validation

Validation should include:

- private-app gate tests for the new verification remedy route
- verification surface tests for the access-hold CTA
- beta access and invite-code tests to confirm invite codes still do not bypass airline-email verification
- auth/profile tests to confirm login and profile prerequisites are preserved
- lint, typecheck, build, and `git diff --check`
