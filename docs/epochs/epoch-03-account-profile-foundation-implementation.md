# Epoch 03 Account Profile Foundation Implementation

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Purpose

This note records what `E03-T04` implemented for the bounded account and profile foundation slice.

This implementation is intentionally narrow:

- it adds the first app-account/profile data layer
- it adds profile completion behavior for authenticated users
- it does not add beta approval
- it does not add worker verification
- it does not add badge/proof upload
- it does not add email-domain verification
- it does not add storage
- it does not add AI

## Data Model Added

Added a new migration:

- `supabase/migrations/20260604113000_create_profiles.sql`

The migration creates `public.profiles` with:

- `id uuid primary key references auth.users(id) on delete cascade`
- `handle text unique`
- `display_name text`
- `claimed_airline text`
- `claimed_role text`
- `claimed_base text`
- `profile_completed_at timestamptz`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

The migration also:

- enables RLS
- limits read/insert/update to the authenticated owner row
- keeps the table private by default
- updates `updated_at` through a database trigger on profile changes

## Profile Fields And Meaning

The current profile foundation fields are:

- `handle`
- `display_name`
- `claimed_airline`
- `claimed_role`
- `claimed_base`

Important boundary:

- `claimed_airline`, `claimed_role`, and `claimed_base` are self-declared profile fields only
- they are not verified worker claims
- they must not grant airline/base/role room access
- they exist to support onboarding, identity foundation, and later verification/community routing

## Profile Completion Behavior

For `E03-T04`, a profile is considered complete only when all of these are present:

- `handle`
- `display_name`
- `claimed_airline`
- `claimed_role`
- `claimed_base`

Current behavior:

- authenticated user with incomplete profile is routed to `/app/profile`
- authenticated user with complete profile can continue to `/app`
- `/app` still lands in the locked private shell placeholder after profile completion

Profile completion remains separate from:

- beta approval
- worker verification
- airline/base/role-specific access grants

## Routes And Server Helpers Added

Added:

- `app/app/profile/page.tsx`
- `src/lib/profile/profile.ts`
- `src/lib/profile/server.ts`
- `src/lib/profile/actions.ts`

These files currently handle:

- profile field normalization
- profile completion evaluation
- current-user profile read behavior
- profile upsert behavior for the authenticated user
- profile-aware `/app` entry redirect
- profile-aware auth callback resolution

## Auth And Route Behavior Changes

`/app` now behaves as follows when Supabase auth is configured:

- signed out user is redirected to `/login`
- signed in user with incomplete profile is redirected to `/app/profile`
- signed in user with complete profile reaches the existing locked private shell

`/auth/callback` now resolves authenticated users based on profile state:

- incomplete or missing profile routes to `/app/profile`
- complete profile routes to `/app` or the approved next path

The profile onboarding surface clearly states:

- profile details are self-declared
- claimed airline, role, and base are not verified claims yet
- profile completion is not beta approval
- profile completion is not worker verification

## Runtime And Configuration Notes

Local build, test, and docs workflows still work without real Supabase env vars.

Runtime profile operations require:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- a Supabase project where the `profiles` migration has been applied

If auth env is missing:

- the app still builds and typechecks
- `/app/profile` shows configuration-required guidance instead of crashing static validation

If auth env exists but the `profiles` table has not been applied to the target Supabase project:

- profile read/write behavior shows or returns a clear profile-storage-not-ready error

## Explicitly Not Implemented

- beta access table or invite model
- beta approval gating
- verification claims table
- worker verification workflow
- airline email-domain verification
- badge/proof upload
- Supabase Storage
- AI pre-check
- reviewer/admin UI
- boards, rooms, posts, comments, search, or saves
- moderation workflow
- payments
- mobile app scaffold

## What Remains For E03-T05 Through E03-T07

### E03-T05

- invite model
- beta-access state model
- access-hold behavior for non-approved accounts

### E03-T06

- full private-app access gates
- profile-complete plus beta-active combined routing
- access-restricted behavior for later suspended/disabled states

### E03-T07

- stronger authorization baseline
- security-event capture expansion
- later database-side access hardening around new private data

## Later Verification Boundary

Worker verification remains a later epoch concern.

Later verification work should build on this profile foundation without collapsing concepts:

- app account is not beta approval
- profile completion is not beta approval
- claimed airline/role/base is not worker verification
- later verification should use approved methods from `VERIFICATION_METHOD_DECISION.md`
- employer-system lookup remains prohibited
