# Epoch 03 Auth Foundation Implementation

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Purpose

This note records what `E03-T03` actually implemented for the first bounded auth slice.

This implementation is intentionally narrow:

- it adds auth foundation only
- it does not add profile tables
- it does not add beta approval
- it does not add airline-worker verification
- it does not add badge/proof upload
- it does not add storage
- it does not add AI

## Packages Added

- `@supabase/supabase-js`
- `@supabase/ssr`

## Environment Variables Required

The auth foundation expects:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No service-role or secret key was added to browser-accessible code.

## Routes Created

- `/login`
- `/signup`
- `/auth/callback`
- `/reset-password`

## Supabase Utility Structure

Added:

- `src/lib/supabase/config.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/proxy.ts`
- root `proxy.ts`

Purpose:

- browser client creation
- server client creation
- cookie/session refresh plumbing
- bounded signed-out redirect support for `/app` paths when auth is configured

## Callback Behavior

`/auth/callback` currently:

- exchanges the Supabase auth code for a session
- redirects to a safe post-auth path
- defaults to `/app` for the bounded E03-T03 slice
- supports password-recovery continuation into `/reset-password?mode=update`

## Temporary Behavior

Because profile and beta-access data do not exist yet:

- post-auth resolution defaults to `/app`
- no real profile-complete check exists yet
- no real beta-approved check exists yet
- no suspended/disabled data model exists yet

`/app` signed-out redirect support is bounded auth plumbing only. It must not be mistaken for the full E03-T06 private-app gate behavior.

## What Remains For E03-T04 Through E03-T07

### E03-T04

- account/profile foundation
- minimum profile completeness rules
- public handle and approved identity fields

### E03-T05

- invite model
- beta-access model
- no-beta hold-state data behavior

### E03-T06

- full private-app access gates
- profile-incomplete routing
- beta-inactive routing
- restricted-state routing

### E03-T07

- stronger authorization baseline
- security-event capture expansion
- later RLS and access-boundary work

## Explicitly Not Implemented

- database schema or migrations
- RLS policies
- profile/account tables
- beta-access tables
- verification claims
- badge/proof upload
- Supabase Storage
- AI pre-check
- reviewer/admin UI
- boards, rooms, posts, comments, search, or saves
- mobile app scaffold
