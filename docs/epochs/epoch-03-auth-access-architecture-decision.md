# Epoch 03 Auth Access Architecture Decision

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

`E03-T01` exists to lock the auth, account, and beta-access architecture before any Epoch 03 implementation begins.

This decision must:

- support the web MVP now
- preserve a path for a future native mobile client later
- stay scale-ready for tens of thousands of registered users
- avoid overbuilding before private-beta validation exists

This is a planning and architecture decision artifact only. It does not implement auth, database schema, provider setup, verification, moderation, or mobile code.

## 2. Decision Summary

The intended Epoch 03 provider path remains:

- Auth provider: `Supabase Auth`
- Primary application database: `Postgres`, with `Supabase Postgres` as the planned MVP path
- Authorization model: `Row Level Security (RLS) plus server-side authorization checks`

This is the controlling architecture direction for Epoch 03 implementation planning.

This decision is based on repeated existing repo guidance, not on new implementation work:

- [docs/TECHNICAL_ARCHITECTURE.md](</Users/ClawdBot/deadheadclub/docs/TECHNICAL_ARCHITECTURE.md:1>) recommends `Postgres, likely Supabase for MVP speed` and `Supabase Auth or equivalent`.
- [docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md](</Users/ClawdBot/deadheadclub/docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md:1>) recommends `Supabase Auth or equivalent`, `Postgres, likely Supabase for MVP speed`, and `RLS plus server-side authorization checks`.
- [docs/JMPSEAT_BLUEPRINT.md](</Users/ClawdBot/deadheadclub/docs/JMPSEAT_BLUEPRINT.md:1>) repeats the same MVP direction.
- [docs/BUILD_TICKETS.md](</Users/ClawdBot/deadheadclub/docs/BUILD_TICKETS.md:1>) defines auth foundation in a way consistent with Supabase Auth.
- [docs/EPOCH_ROADMAP.md](</Users/ClawdBot/deadheadclub/docs/EPOCH_ROADMAP.md:1>) and [docs/epochs/epoch-03-auth-account-beta-access-tickets.md](</Users/ClawdBot/deadheadclub/docs/epochs/epoch-03-auth-account-beta-access-tickets.md:1>) require an auth/access decision before implementation.

Repo-state evidence also matters:

- [package.json](</Users/ClawdBot/deadheadclub/package.json:1>) contains no auth or database provider dependency yet.
- [.env.example](</Users/ClawdBot/deadheadclub/.env.example:1>) contains only the public waitlist variable and no auth provider configuration.
- No existing Supabase project config, auth middleware, or provider setup files are present in the repo.

Therefore:

- the provider direction is clear enough to confirm the intended MVP path as Supabase
- the operational implementation details are not yet configured and remain implementation work for later Epoch 03 tickets

## 3. Provider Decision

### Confirmed direction

Supabase remains the chosen provider direction for Epoch 03 planning:

- `Supabase Auth` for account authentication and session management
- `Supabase Postgres` for the core private-app system of record
- `Supabase-backed RLS` for database-side enforcement where exposed tables exist

### Why this direction is supported by evidence

- It is the only provider path named consistently across the current architecture set.
- It fits the repo's managed-services preference and the "scale-ready, not overbuilt" rule.
- It supports web-first delivery now without forcing a web-only auth model later.
- It fits the requirement that future native mobile must reuse the same backend, auth, data, and authorization rules.

### What is not yet decided

This document does not claim that provider setup is complete. These implementation-level details remain open for later tickets:

- exact Supabase project/environment setup
- exact auth UX mix for launch: email/password only vs email/password plus magic link
- exact redirect URL inventory for preview and production environments
- exact admin-role assignment workflow
- exact server integration pattern inside Next.js for route handlers, server actions, and middleware usage

Those open points do not block the provider-path decision, but they do block implementation details until resolved in later Epoch 03 tickets.

## 4. Client Model

Epoch 03 auth/access must support one product with multiple clients:

- public marketing website
- private web app
- future native mobile app
- shared backend/data/account state
- shared authorization rules

Required model:

- The public marketing website remains a separate public surface.
- The private web app is the first real authenticated client.
- The future native mobile client must use the same account, beta-access, verification, and authorization model.
- Account state, beta-access state, and verification state must not be embedded only in web route behavior.
- Server-side and database-side checks must remain the security boundary across clients.

Client impact classification for this decision: `mobile-ready`.

Reason:

- web is the first implementation client
- the backend/auth/account/access model is being locked to remain reusable by future mobile

## 5. Auth Routes And Surfaces

This section defines the planned route and surface model for the web MVP. It does not implement routes yet.

### Public surfaces

- `/`
  - public waitlist landing page
  - remains external-waitlist oriented
- `/privacy`
  - public policy surface
- `/terms`
  - public policy surface

### Planned auth and account surfaces

- `/auth/sign-in`
  - sign-in surface for existing accounts
- `/auth/sign-up`
  - account creation surface for invited or otherwise eligible beta entrants
- `/auth/confirm`
  - email verification / confirmation handoff surface
- `/auth/reset-password`
  - password reset surface if password auth is enabled
- `/auth/magic-link`
  - reserved only if magic-link auth is approved later
- `/app`
  - private app entry route
- `/app/onboarding`
  - account/profile onboarding surface
- `/app/profile`
  - profile completion and account identity surface
- `/app/access-hold`
  - signed-in but not beta-approved holding surface
- `/app/verification`
  - reserved placeholder for later aviation-worker verification epoch

### Planned behavior by user state

- Signed out user opening `/app`
  - redirected to sign-in or sign-up entry
  - no private app content is rendered
- Signed-in user without active beta access
  - routed to an access-hold surface
  - no private app content is rendered
- Signed-in user with active beta access but incomplete profile
  - routed to onboarding/profile completion
- Signed-in user with active beta access and complete required profile
  - allowed through the private app gate
- Signed-in user who is suspended, disabled, paused, or revoked
  - routed to a controlled restricted-access surface

The verification surface remains reserved for Epoch 04 and must not imply that aviation-worker verification is complete in Epoch 03.

## 6. Account State Model

Epoch 03 should define account-level states clearly and keep them separate from verification.

### Core account states

- `unauthenticated`
  - no session
- `authenticated`
  - signed in, but no guarantee of beta access or profile completion
- `email_verified`
  - email ownership confirmed
- `profile_incomplete`
  - authenticated account missing required onboarding/profile fields
- `profile_complete`
  - required Epoch 03 profile data is complete

### Beta-access states

- `beta_none`
  - no beta access record or no approval
- `beta_waitlisted`
  - external waitlist interest exists, but no app-access grant exists
- `beta_invited`
  - invite exists but access is not yet fully accepted/activated
- `beta_active`
  - account may pass the private beta gate
- `beta_paused`
  - access temporarily disabled
- `beta_revoked`
  - access removed

### Restriction states

- `suspended`
  - account cannot access the private app
- `disabled`
  - account unavailable because of admin/security action

### Later-role states

- `moderator`
  - later epoch, not an Epoch 03 feature target
- `admin`
  - later broader admin powers, though the model must leave room for explicit admin access control

### Epoch ownership

Epoch 03 owns:

- authentication/session state
- email-verification state
- minimal onboarding/profile completeness state
- beta-access state
- restricted/suspended account gating

Later epochs own:

- aviation-worker verification states and workflows
- trust-level progression
- moderation status details
- full admin role model beyond access-planning foundations

## 7. Beta Access Model

Private beta access must follow these rules:

- waitlist email is not the same thing as an app account
- app account creation is not the same thing as beta approval
- beta access must be explicit
- beta access must be enforced server-side and database-side
- private `/app` access must not rely on client-only guards

Recommended flow:

1. A person joins the external waitlist.
2. Founder/admin reviews waitlist and manually selects invite candidates.
3. A beta invite/access record is created separately from the waitlist submission.
4. The invited person creates an app account or authenticates an existing one.
5. The system links the account to invite/beta-access state.
6. Private-app entry is granted only if the account passes the approved access checks.

Required private-app behavior:

- access-denied states must be user-friendly
- access-denied states must not leak private app content, route data, or private community structure
- signed-in but non-approved users should see a clear hold/wait state rather than a broken or misleading app shell

## 8. Verification Boundary

Aviation-worker verification is not the same as email/account authentication.

Epoch 03 must preserve these boundaries:

- account authentication proves control of a login identity
- email verification proves control of that email address
- beta access proves invite/approval status for private beta entry
- aviation-worker verification proves aviation affiliation through a separate later workflow

Epoch 03 does not implement the aviation-worker verification workflow unless a later ticket explicitly expands scope.

Verification state must remain separate from:

- auth identity
- account/profile state
- beta access state

Future verification must support:

- privacy-preserving handling
- auditability
- admin reviewability
- moderation/trust enforcement needs
- eventual artifact retention/deletion controls

## 9. Data Model Implications

This document does not create schema or migrations. It defines the conceptual separation required for later implementation.

### Auth identity / provider user

Owns:

- provider-level user ID
- login email
- authentication credentials and provider session data
- provider-side email confirmation state

Must not own:

- full app profile
- beta access business rules
- aviation-worker verification truth
- moderation or trust history as the only source of truth

Why separate:

- provider auth is infrastructure identity, not full app domain state
- future mobile must reuse app state independent of UI route assumptions

### App account / profile

Owns:

- internal app user/account record
- account status
- profile completeness state
- public handle
- airline/role/base profile fields approved for Epoch 03

Must not own:

- raw auth-provider credential logic
- beta invite history as the only source of truth
- verification review artifacts

Why separate:

- jmpseat needs app-level ownership over account state and onboarding beyond provider metadata

### Beta access / invite state

Owns:

- invite status
- invited email
- approval/activation/revocation state
- invited and accepted timestamps
- inviter/admin linkage where needed

Must not own:

- authentication credentials
- verification outcome
- moderation authority

Why separate:

- waitlist conversion and beta access are business rules, not auth-provider concerns
- account creation and beta approval must remain distinct

### Verification placeholder / future verification entity

Owns:

- future aviation-worker verification state
- method used
- reviewer/audit linkage
- future evidence metadata if approved later

Must not own:

- auth identity as its only identifier
- beta access approval as a substitute for verification

Why separate:

- verification is privacy-sensitive, auditable, and independently reviewable

### Admin / moderation role state

Owns:

- explicit privileged-role markers or relationships
- future admin/moderator authorization distinctions

Must not own:

- ordinary user account state as the only role mechanism
- hidden privilege encoded only in client logic

Why separate:

- privileged access must be explicit, reviewable, and auditable later

### Security / access events

Owns:

- auth failures
- access denials
- beta-access changes
- account-state transitions worth auditing
- future admin-sensitive actions

Must not own:

- raw secret material
- full content payload retention by default

Why separate:

- auditability must exist without over-retaining sensitive data

## 10. Authorization And RLS Strategy

Epoch 03 implementation must follow this strategy:

- private app authorization is enforced server-side and database-side
- if Supabase/Postgres is used, RLS is planned before private user or community data exists
- service-role and admin secrets are never exposed to browser or future mobile clients
- future mobile uses the same authorization model, not a weaker one
- admin and moderator powers are explicit and auditable

Required enforcement model:

- Web route guards may improve UX, but they are not the security boundary.
- The security boundary is the combination of authenticated server checks, app account state checks, beta-access checks, and database/RLS controls where exposed tables exist.
- Authorization helpers must be designed centrally enough that future mobile clients can rely on the same rules.

Minimum planned authorization categories for later implementation:

- signed-out access
- self-account/profile access
- beta-eligible private-app access
- restricted/suspended access denial
- future verification-review access
- future admin-only access

## 11. Mobile-Readiness Requirements

Epoch 03 auth/access implementation must not assume web-only login forever.

Required mobile-readiness rules:

- account/profile/beta-access states must be reusable by future mobile
- redirect and deep-link needs must be considered before provider config is locked
- mobile session persistence must be supportable later
- password reset and email confirmation flows must be supportable later
- auth/account state must not depend on Next.js-only route behavior for correctness
- no native app scaffold or Expo dependencies are added in Epoch 03 planning

This decision does not select a mobile auth SDK or add any native code. It only preserves the backend/auth model required for future reuse.

## 12. Scalability Requirements

Epoch 03 planning must assume growth to tens of thousands of registered users.

Required implications:

- account, profile, invite, beta-access, and security-event structures must be designed for intentional indexing when implemented
- no unbounded user or admin queries
- future admin queues must be paginated and filterable
- implementation tickets must state indexing, pagination, authorization, and sensitive-data impact where relevant
- auth/account/beta tables must separate high-growth operational state from unrelated product concerns

Expected high-growth areas:

- account records
- beta invite/access records
- account-state transition history if retained
- security/access events

## 13. Security And Event Logging

Epoch 03 should plan for auditability without overbuilding event infrastructure.

At minimum, later implementation should support logging for:

- authentication failures
- access-denied events
- beta-access grants, pauses, revocations, and activations
- account/profile state changes where relevant to access
- privileged-role changes if introduced

Planning constraints:

- do not overbuild a heavy event platform yet
- do not make future auditability impossible
- avoid logging secrets or unnecessary sensitive raw data
- keep privileged access changes attributable to an internal actor when applicable

## 14. Explicit Out Of Scope For E03-T01

This decision does not include:

- auth implementation
- database migrations
- Supabase project setup, except as a planned future implementation path
- aviation-worker verification implementation
- boards, posts, comments, rooms, search, or saves
- moderation workflow implementation
- AI
- payments
- mobile app scaffold

No app code, auth code, database code, or native mobile code is added by this document.

## 15. Impact On Later Epoch 03 Tickets

### E03-T02 - Auth Route And Account-State Map

Use this document's route categories, access-hold model, and state separation to define exact web flow behavior.

### E03-T03 - Auth Foundation

Implement the confirmed provider path:

- Supabase Auth
- shared account model separate from provider metadata
- no verification coupling

### E03-T04 - Account And Profile Foundation

Implement the app account/profile layer as distinct from auth identity and from beta-access approval.

### E03-T05 - Invite And Beta Access Model

Implement explicit invite and beta-access records, not client-side gates and not implicit waitlist assumptions.

### E03-T06 - Private-App Access Gates

Implement `/app` entry checks using server/database-enforced account and beta-access rules with user-friendly hold states.

### E03-T07 - Authorization Baseline And Security Events

Implement centralized authorization helpers, RLS planning, and minimal audit/security-event capture consistent with this document.

### E03-T08 - Validation And Handoff Review

Validate that implementation matches this architecture:

- provider path
- route/state model
- auth/beta/verification separation
- mobile-readiness constraints
- scalability/security requirements

## 16. Open Questions And Blockers

These items should be resolved before implementation details are finalized:

1. Should the first auth launch support only email/password, or also magic link from day one?
2. What exact preview and production redirect URL inventory is required for sign-in, email confirmation, password reset, and future mobile deep links?
3. What is the exact allowed path for account creation by non-invited users:
   should they be allowed to register and then be held, or should sign-up itself be invite-constrained?
4. What exact minimal Epoch 03 profile fields are required before private-app entry:
   likely public handle, airline, role, and base, but this should be locked explicitly in `E03-T02` and `E03-T04`.
5. What exact admin path will manage invites and beta-access changes before a later fuller admin surface exists?
6. What exact security-event retention window is appropriate for private beta before broader legal/policy decisions are finalized?

## 17. Status

`E03-T01` result: complete for planning.

Outcome:

- provider direction confirmed from existing repo evidence
- auth/access architecture confirmed strongly enough to unblock later Epoch 03 implementation tickets
- implementation remains intentionally deferred
