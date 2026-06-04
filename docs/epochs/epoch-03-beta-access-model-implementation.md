# Epoch 03 Beta Access Model Implementation

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Purpose

This note records what `E03-T05` implemented for the bounded invite and beta-access slice.

This implementation is intentionally narrow:

- it adds the beta-access data layer and routing model
- it adds the access-hold surface for non-active users
- it does not add worker verification
- it does not add badge/proof upload
- it does not add email-domain verification
- it does not add storage
- it does not add AI
- it does not add a full admin dashboard

## Data Model Added

Added a new migration:

- `supabase/migrations/20260604124500_create_beta_access.sql`

The migration creates `public.beta_access` with:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `status text not null`
- `source text`
- `invited_email text`
- `invited_by uuid references auth.users(id)`
- `approved_by uuid references auth.users(id)`
- `approved_at timestamptz`
- `revoked_by uuid references auth.users(id)`
- `revoked_at timestamptz`
- `reason text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

The migration also:

- enforces valid status values
- keeps one beta-access row per user
- adds indexes for `user_id`, `status`, and `invited_email`
- updates `updated_at` through a database trigger
- enables RLS
- allows authenticated users to read only their own beta-access row
- does not allow normal users to create, approve, revoke, or update their own beta access

## Beta Access States Added

The current beta-access state model is:

- `none`
- `waitlisted`
- `invited`
- `active`
- `denied`
- `revoked`
- `paused`

Important boundaries:

- public waitlist membership is not an app account
- auth account creation is not beta approval
- profile completion is not beta approval
- beta approval is not worker verification
- claimed airline/role/base is not a verified claim

For `E03-T05`, only `active` grants entry past the hold state.

## How Beta-Active Is Determined

Private app entry now resolves in this order when auth and migrations are configured:

1. signed out -> `/login`
2. signed in with incomplete profile -> `/app/profile`
3. signed in with complete profile but non-active beta status -> `/app/access-hold`
4. signed in with complete profile and `active` beta status -> `/app`

If the beta-access migration has not been applied:

- private app entry does not silently grant access
- the user is held behind a clear beta-storage-not-ready message

## `/app/access-hold` Behavior

Added:

- `app/app/access-hold/page.tsx`

This surface:

- is for signed-in users whose profiles are complete but whose beta status is not `active`
- explains that beta approval is separate from signup and profile completion
- explicitly states that beta approval is separate from worker verification
- does not show badge upload, verification workflow, or community features
- tells the user they will be notified when beta access is approved

## Server And Route Logic Added

Added:

- `src/lib/betaAccess/betaAccess.ts`
- `src/lib/betaAccess/server.ts`

These files currently handle:

- beta-status normalization
- beta-active evaluation
- current-user beta-access reads
- combined auth + profile + beta-access route resolution
- beta-aware `/app` redirect behavior
- beta-aware `/auth/callback` redirect behavior

## Manual Beta Access Grant For Early Testing

No admin UI was added in this slice.

For early private-beta testing, beta access can be granted manually in Supabase/Postgres after the migration is applied.

Example pattern:

```sql
insert into public.beta_access (
  user_id,
  status,
  source,
  invited_email,
  approved_at
)
values (
  '<auth-user-uuid>',
  'active',
  'founder-manual',
  'crew@example.com',
  now()
)
on conflict (user_id)
do update set
  status = excluded.status,
  source = excluded.source,
  invited_email = excluded.invited_email,
  approved_at = excluded.approved_at,
  revoked_at = null,
  revoked_by = null,
  reason = null;
```

This is an operator-only workflow, not a public product surface.

## Separation Boundaries Preserved

This slice keeps these concepts separate:

- waitlist email
- auth account
- profile completion
- beta approval
- worker verification
- later airline/base/role verified claims

`E03-T05` does not imply that a beta-active user is a verified airline worker.

## Runtime And Configuration Notes

Local build, test, and docs workflows still work without real Supabase env vars.

Runtime beta-access operations require:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- a Supabase project where both the `profiles` and `beta_access` migrations have been applied

If auth env is missing:

- the app still builds and typechecks
- auth/beta runtime checks stay unavailable locally without crashing static validation

If auth env exists but the `beta_access` table has not been applied:

- beta-aware route resolution shows a clear beta-storage-not-ready message
- access is not silently granted

## Explicitly Not Implemented

- worker verification claims
- badge/proof upload
- airline email-domain verification
- Supabase Storage
- AI pre-check
- reviewer/admin verification UI
- full admin dashboard
- boards, rooms, posts, comments, search, or saves
- moderation workflow
- payments
- mobile app scaffold

## What Remains For E03-T06 And E03-T07

### E03-T06

- full private-app access gates
- restricted-state handling for later suspended/disabled models
- route behavior expansion beyond profile-complete and beta-active checks

### E03-T07

- stronger authorization baseline
- security-event capture expansion
- later access hardening around growing private data

## Later Verification Boundary

Worker verification remains a later epoch concern.

Later verification work should build on this beta-access foundation without collapsing concepts:

- beta approval is not worker verification
- later verification should use approved work-email and redacted-proof methods
- employer-system lookup remains prohibited
