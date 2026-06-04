# Epoch 02 Private Route Behavior

## Purpose

This note records the completed `E02-T04` slice for private child-route placeholder behavior under `/app`.

## Routes Implemented

- `/app/home`
- `/app/base`
- `/app/layovers`
- `/app/rooms`
- `/app/profile`
- `/app/verification`
- `/app/admin`

## Behavior Implemented

- Each route renders the same locked private shell structure as `/app`
- Each route displays route-specific placeholder copy
- Each route states that the surface is not available yet
- Each route explicitly keeps real login and verification in later epochs
- Unknown `/app/[section]` slugs do not resolve to a placeholder and instead fall through to `notFound()`

## What Is Intentionally Non-Functional

- No auth
- No sessions
- No account state
- No verification workflow
- No Base Boards, Layover Boards, Verified Rooms, Profile, Verification, or Admin feature behavior
- No posts, comments, moderation actions, or admin tooling
- No links that imply working product capability

## Why This Is Not Real Security

These routes are placeholder shells only.

They do not enforce:

- authentication
- authorization
- beta-access gating
- verification gating

The locked route experience is informational scaffolding, not a security boundary.

## Docs Impact

- Added this route-behavior note for the app repo
- Reused and extended the shared private-shell placeholder config rather than duplicating route copy
- Preserved alignment with the planning docs in `jmpseat-main-docs`
