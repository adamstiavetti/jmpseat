# Epoch 03 Private App Access Gates Implementation

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Purpose

This note records what `E03-T06` implemented for the bounded private-route access hardening slice.

This implementation is intentionally narrow:

- it centralizes private-app access-gate decisions
- it makes `/app` and known private child routes follow the same gate order
- it preserves the existing placeholder-only private surfaces
- it does not add worker verification
- it does not add community features
- it does not add admin functionality

## Final Private-Route Gate Order

When Supabase auth and the required profile plus beta-access migrations are configured, private-route access now resolves in this order:

1. signed out user -> `/login`
2. signed-in user with incomplete or missing profile -> `/app/profile`
3. signed-in user with complete profile but non-active beta access -> `/app/access-hold`
4. signed-in user with complete profile and active beta access -> allowed through

Allowed-through behavior in this epoch:

- `/app` renders the existing locked private shell placeholder
- known `/app/[section]` routes render the existing route-specific private placeholders

## Routes Guarded

Shared private-app gate logic now covers:

- `/app`
- `/app/home`
- `/app/base`
- `/app/layovers`
- `/app/rooms`
- `/app/verification`
- `/app/admin`

The shared gate helper lives in:

- `src/lib/privateApp/access.ts`

The root and child private routes now use the same gate result model instead of duplicating route-by-route redirect decisions.

## `/app/profile` Behavior

`/app/profile` now behaves as follows:

- signed out -> `/login`
- signed in -> profile page remains available, even if beta access is not active yet
- complete profiles may still view and edit profile fields
- no beta gate is applied to the profile page
- no worker-verification gate is applied to the profile page

This keeps profile editing separate from private-beta entry approval.

## `/app/access-hold` Behavior

`/app/access-hold` now behaves as follows:

- signed out -> `/login`
- incomplete profile -> `/app/profile`
- complete profile plus active beta -> `/app`
- complete profile plus non-active beta -> hold page renders
- no worker-verification gate is applied

This keeps the hold-state route focused on invite-only beta access, not verification.

## Unknown Private Route Behavior

Unknown `/app/[section]` routes still return `404`.

Implementation detail:

- slug validation still runs before the shared private gate for `app/app/[section]/page.tsx`
- this preserves the existing unknown-section behavior instead of converting all unknown slugs into auth/profile/beta redirects

## Missing Env And Missing Migration Safety

Local build, test, and docs workflows still work without real Supabase env vars.

Safety behavior remains:

- production `/app` does not silently bypass auth if Supabase env is missing
- profile-migration failures do not silently grant private access
- beta-access migration failures do not silently grant private access

Current route behavior when storage is not ready:

- profile storage issues redirect toward `/app/profile` with a clear error
- beta-access storage issues redirect toward `/app/access-hold` with a clear error

This keeps private route rendering behind explicit server-side state checks.

## Access-Before-Render Boundary

This slice preserves the rule that private-route access is resolved before route-specific private placeholder rendering.

That matters now even though the private routes are still placeholders because later private data fetches must not run before authorization is known.

## What Remains For E03-T07

`E03-T06` does not add suspended or disabled account behavior beyond the existing architectural planning.

`E03-T07` still owns:

- stronger authorization baseline
- security-event capture expansion
- any later restricted-state model if suspended/disabled states are introduced cleanly

## Explicitly Not Implemented

- worker verification claims
- badge/proof upload
- airline email-domain verification
- Supabase Storage
- AI pre-check
- boards, rooms, posts, comments, search, or saves
- moderation workflow
- payments
- admin dashboard
- mobile app scaffold

## Separation Boundaries Preserved

This slice continues to preserve:

- waitlist email is not an app account
- auth is not beta approval
- profile completion is not beta approval
- beta approval is not airline-worker verification
- claimed airline/role/base is not a verified claim
- later worker verification should still use approved work-email and redacted-proof paths
- employer-system lookup remains prohibited
