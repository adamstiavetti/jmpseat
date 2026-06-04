# Epoch 02 Route Map

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

This document defines the route-map planning artifact for `E02-T01` in Epoch 02: Private App Foundation.

Its job is to select the private route namespace, clarify the boundary between the public waitlist surface and the future private app shell, and name the placeholder private routes that later epochs will implement.

This is planning only. It does not implement app code, auth, verification, beta access, database work, community features, moderation, admin workflows, AI, payments, or analytics.

## 2. Epoch 02 Route Decision

Selected private route namespace: `/app`

Reasoning:

- The current planning set already treats `/` as the public splash/waitlist route and `/app` as the private app surface.
- `docs/EPOCH_ROADMAP.md` records `/app` as the current private beta placeholder.
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md` already defines `/app` as the recommended private beta namespace.
- `/app` is short, conventional, and keeps the public/private boundary obvious.
- No reviewed doc provided a stronger alternative namespace.

Epoch 02 should preserve this route decision unless a later architecture review discovers a critical conflict.

## 3. Route Boundary Principle

The app must keep two clearly different surfaces:

- Public marketing and waitlist surface
- Private product shell

The public surface explains the concept, captures waitlist interest externally, and remains safe to browse without access.

The private surface exists for the future invite-only MVP app, but Epoch 02 keeps it locked and placeholder-only.

This boundary is architectural, product, and trust-related. The cinematic public waitlist should not bleed into the private utility shell, and the private shell should not pretend to expose real product access before later epochs are ready.

## 4. Public Routes

These routes remain public marketing, trust, or policy surfaces.

### Current public route

- `/` - public splash / waitlist landing page

### Later public policy routes allowed by planning docs

- `/privacy` - public privacy policy or notice, later
- `/terms` - public terms or beta terms, later
- `/community-guidelines` - public community rules, later

Epoch 02 does not need to implement these routes. They are listed here only so the public/private boundary is complete at the planning level.

## 5. Private Route Namespace

All private-shell routes in Epoch 02 live under:

- `/app`

Epoch 02 planning assumption:

- `/app` is the canonical private-shell entry point.
- Child routes under `/app` are placeholder-only in Epoch 02.
- Private routes must not expose real user state, community data, or working account flows yet.

## 6. Private Placeholder Routes

These routes are allowed as locked placeholder surfaces only during Epoch 02.

### Canonical private shell entry

- `/app` - locked private shell landing state

### Future MVP placeholder surfaces

- `/app/home` - Home Base placeholder
- `/app/base` - Base Boards placeholder
- `/app/layovers` - Layover Boards placeholder
- `/app/rooms` - Verified Rooms placeholder
- `/app/profile` - Profile placeholder
- `/app/verification` - Verification placeholder
- `/app/admin` - Admin placeholder

## 7. Placeholder Route Intent

These routes exist in Epoch 02 only to:

- establish the future private information architecture
- give the shell a stable route map for later epochs
- make the product direction legible without turning features on

These routes must not:

- create accounts
- authenticate users
- verify workers
- grant access
- render real boards, rooms, or posts
- expose moderation or admin tools
- expose sensitive data
- imply a working internal community

## 8. Unauthorized / Not-Yet-Available Behavior

Epoch 02 defines route behavior at the planning level only.

Recommended planning behavior:

- Public visitors remain on public routes unless they intentionally navigate into `/app`.
- Direct navigation to `/app` or a child private route should resolve to an honest locked or unavailable placeholder state.
- Placeholder messaging should explain that the private app is invite-only and not yet open through this route.
- Placeholder messaging should not imply that a user is partially authenticated, invited, verified, or blocked by a real access-control system.
- Placeholder routing behavior must be described as temporary shell-level gating, not final security.

Allowed planning outcomes for private placeholder routes:

- locked placeholder page
- unavailable placeholder page
- controlled redirect to the locked `/app` shell entry

Not allowed in Epoch 02:

- fake logged-in state
- fake invited-member state
- fake verification status
- client-only gating described as real security
- exposure of private content behind cosmetic UI locks

## 9. Naming Notes For Placeholder Routes

Preferred user-facing labels based on the current information architecture:

- `/app/home` -> `Home Base`
- `/app/base` -> `Base Boards`
- `/app/layovers` -> `Layover Boards`
- `/app/rooms` -> `Verified Rooms`
- `/app/profile` -> `Profile`
- `/app/verification` -> `Verification`
- `/app/admin` -> `Admin`

Mobile-shortened labels may later differ in navigation, but the route map should stay stable unless a later IA review requires a change.

## 10. Route Rules To Preserve Future MVP Direction

The future MVP is a private, invite-only, verified airline-worker beta focused on Base Boards, Layover Boards, and gated discussion.

This route map supports that direction by:

- reserving a clean private namespace for the real MVP app
- naming the core utility surfaces early
- separating public marketing routes from the future product routes
- leaving room for later auth, verification, moderation, and admin gates without pretending they already exist

Epoch 02 must not use this route map to sneak MVP functionality into the shell.

## 11. Explicit Out Of Scope

This route-map artifact does not define or approve:

- auth implementation
- real access control
- session checks
- beta invite logic
- database schema
- user accounts
- profile flows
- aviation-worker verification workflows
- Base Board functionality
- Layover Board functionality
- Verified Rooms functionality
- posts, comments, saves, or search
- moderation tooling
- admin workflows beyond placeholder naming
- AI
- payments
- deals marketplace

## 12. Unresolved Decisions

These items remain intentionally unresolved for later tickets or epochs:

- whether private child routes should resolve by redirecting to `/app` or by rendering route-local locked placeholders
- whether `/app/home` should exist separately from `/app` in the first private shell implementation or whether `/app` itself should act as Home Base placeholder
- which later public policy routes should ship before private beta
- whether additional future placeholder routes such as saved items or safety/rules should be represented in Epoch 02 or deferred

None of these unresolved decisions block `E02-T01`, because the route namespace and boundary are already clear enough to begin shell planning.

## 13. E02-T01 Readiness

`E02-T01` is ready for implementation planning when all of the following are true:

- `/` is preserved as the public waitlist/marketing route
- `/app` is accepted as the private namespace
- placeholder routes are treated as non-functional only
- locked/unavailable behavior is described honestly
- no auth or feature behavior is implied by the route map

That threshold is met by this artifact.
