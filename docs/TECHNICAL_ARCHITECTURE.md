# Technical Architecture

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## MVP Architecture Recommendation

jmpseat should start with a pragmatic web architecture that supports fast iteration, strong privacy controls, and admin moderation from day one.

Scale-readiness rule:

- Future implementation must follow `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`.
- jmpseat should be built for tens of thousands of registered users with scale-ready but not overbuilt architecture.
- Simplicity is still the MVP goal, but future auth, data, storage, authorization, moderation, and search decisions should not assume tiny data volume forever.

Recommended stack:

- Frontend: Next.js / React.
- Backend: Next.js route handlers or separate API layer.
- Database: Postgres, likely Supabase for MVP speed.
- Auth: Supabase Auth or equivalent.
- Authorization: Row Level Security and server-side authorization checks.
- Verification storage: private object storage with strict retention/deletion policy.
- Search: Postgres full-text first.
- AI: server-side calls only.
- Payments: Stripe later.
- Deployment: Vercel plus managed Postgres/Supabase.
- Admin moderation dashboard from day one.
- Native mobile deferred until web MVP proves demand.

## Best-Practice Baseline

Future implementation should meet a practical baseline rather than just "working locally":

- Use OWASP Top 10 and OWASP ASVS as the security planning baseline.
- Treat broken access control as the highest-risk class for this product because verification, anonymity, admin review, and room permissions all depend on correct authorization.
- Apply privacy-by-design: data minimization, purpose limitation, retention limits, deletion workflows, and auditability for sensitive access.
- Use WCAG 2.2 AA as the accessibility target.
- Use 12-factor style configuration: secrets and environment-specific config live outside source control.
- Use least privilege across database roles, service keys, admin roles, CI tokens, and third-party integrations.
- Prefer boring, typed, testable server-side code for sensitive workflows.

## Frontend

Use Next.js and React when implementation begins.

Initial surfaces:

- Auth pages.
- Verification submission.
- Profile setup.
- Crew Rooms.
- Base Boards.
- Layover Boards.
- Posts and comments.
- Saved items.
- Search.
- Jumpseat Brief.
- NonRev Deals.
- Admin verification dashboard.
- Admin moderation queue.

Frontend notes:

- Build the utility experience first, not a marketing-first social feed.
- Make account state visible: waitlist, email verified, pending verification, verified, restricted, suspended.
- Keep native mobile out of V1 until web demand is proven.
- Meet WCAG 2.2 AA for keyboard navigation, visible focus, form labels, error messages, status messages, target size, and accessible authentication.
- Avoid client-only authorization checks; client state can improve UX but cannot be the security boundary.
- Do not expose server-only environment variables, service role keys, AI keys, or moderation internals to client bundles.
- Treat rich text, markdown, links, image previews, and user-generated content as untrusted content.

## Backend

Next.js route handlers are acceptable for MVP if the app remains cohesive.

Backend responsibilities:

- Auth session enforcement.
- Server-side authorization.
- Verification submission and review.
- Profile management.
- Room permissions.
- Post, comment, save, search, and report APIs.
- Moderation actions.
- Server-side AI calls.
- Deal directory management.
- Input validation and output encoding.
- Rate limiting and abuse controls.
- Security event logging.
- File upload validation.

Split into a separate API layer later if:

- Admin workflows become complex.
- Mobile or partner API consumers become important.
- Background jobs grow.
- Verification or moderation needs stronger service boundaries.

## Database

Use Postgres as the system of record.

Early schema areas:

- Users and profiles.
- Verification records.
- Airlines, roles, bases, airports.
- Crew rooms.
- Posts and comments.
- Saved items.
- Layover boards.
- Deals and vendors.
- Reports and moderation actions.
- AI briefs.
- Trust levels.

Database notes:

- Use explicit foreign keys where practical.
- Add indexes for room, board, author, status, created_at, and search fields.
- Keep deleted_at for records where auditability matters.
- Add created_by, updated_by, and reviewed_by fields on sensitive admin-managed records where useful.
- Separate private verification identity from public profile records.
- Avoid storing raw secrets, tokens, portal credentials, or unnecessary government IDs.
- Use database constraints for invariants that must never rely only on application code.
- Avoid modeling schedules, flight loads, live locations, marketplace payments, and roster integrations in V1.
- Follow the indexing, pagination, ownership, moderation-state, and soft-delete guidance in `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`.

## Auth

Supabase Auth or an equivalent provider should support:

- Email/password signup.
- Email verification.
- Sessions.
- Admin role checks.
- Account status enforcement.
- Auth rate limiting.
- Password reset and email-change flows with generic error messages.
- MFA-ready admin accounts.

OAuth can be added later but should not be required for launch.

## Authorization

Use both:

- Row Level Security for database-level defense in depth.
- Server-side authorization checks for business rules, role checks, room permissions, anonymous posting rules, admin actions, and AI access.

RLS should be enabled on exposed tables. Server-side checks should remain the source of product-specific permission logic.

Implementation requirements:

- Enable RLS on every table in exposed schemas.
- Deny by default, then add narrow policies.
- Never expose service role or secret keys to the client.
- Test RLS policies with representative users: unverified, verified, restricted, suspended, moderator, and admin.
- Enforce room visibility, anonymous posting, admin actions, and report access server-side even when RLS exists.
- Add regression tests for broken access control scenarios before beta.

## Verification Storage

Verification evidence must be private.

Requirements:

- Store artifacts in private object storage.
- Use short-lived signed URLs for admin review.
- Restrict access to authorized admins.
- Log sensitive access.
- Record review decisions separately from artifact storage.
- Define retention and deletion policy before beta.
- Never send verification documents to AI services.
- Validate allowed file types, size limits, content type, file signatures where practical, and filenames.
- Rename uploaded files on storage and avoid user-controlled public paths.
- Consider malware scanning before admin preview/download.
- Do not render uploaded documents inline in ways that can execute active content.

## AI

AI must be server-side only.

V1 feature:

- Jumpseat Brief: AI layover planner.

Possible later features:

- Base Brief.
- Layover Board summary.
- Career Copilot.
- Contract Explainer.
- Search Assistant.
- Safety Filter.
- Moderation Assistant.

AI requirements:

- Keep API keys server-side.
- Use structured outputs where practical.
- Moderate or filter high-risk inputs and outputs.
- Treat retrieved community content as untrusted input that can contain prompt injection.
- Keep AI tools least-privilege; Jumpseat Brief should not have write access to user content or admin actions.
- Log model, prompt category, output safety flags, and refusal state without retaining unnecessary sensitive text.
- Add deterministic policy checks outside the model for banned categories.
- Do not auto-post on behalf of users.
- Do not approve verification.
- Do not make final moderation bans without human/admin review.
- Do not expose sensitive/private data.
- Do not provide aviation security procedures.
- Do not rely on hidden prompts as the only safety boundary.

## Search

Use Postgres full-text search first.

Search must respect:

- Verification state.
- Room visibility.
- Account restrictions.
- Deleted or removed content.
- Anonymous display rules.
- Safety removals.

Dedicated search or vector search can wait until content volume and query needs justify it.

## Payments

Do not build payments in V1.

Stripe should be the default later option for:

- Premium subscriptions.
- Sponsored deals.
- Featured crash pad listings.
- Vendor marketplace payments.

## Deployment

Recommended MVP deployment:

- Vercel for Next.js.
- Managed Postgres or Supabase.
- Supabase Storage or equivalent private object storage.
- Separate preview and production environments.
- Environment variables for secrets.
- Dependency lockfile committed.
- CI checks before merge.
- Separate production secrets from preview/development secrets.

## Coding Standards for Future Implementation

Use these standards when app code is eventually created:

- TypeScript strict mode.
- Server-only modules for privileged data access and AI calls.
- Zod or equivalent schema validation at API boundaries.
- Parameterized database queries or generated query clients; no string-built SQL.
- Centralized authorization helpers for account status, room access, admin actions, and anonymous posting eligibility.
- Centralized error handling that avoids leaking sensitive implementation details.
- Structured logs with request ID, actor ID where available, event type, outcome, and severity.
- Tests for auth, RLS, room permissions, anonymous posting, moderation, verification, upload validation, and AI safety filters.
- Dependency scanning with npm audit or equivalent.
- Secret scanning and no committed secrets.
- Pin or review third-party packages and GitHub Actions with least-privilege workflow permissions.
- Security headers including CSP, frame protections, referrer policy, and appropriate cookie settings.

## Security and Privacy Notes

- Use least-privilege admin permissions.
- Log access to verification artifacts.
- Avoid storing unnecessary personal data.
- Separate private identity from public handle.
- Enforce anonymous posting rules server-side.
- Rate-limit auth, posting, search, reporting, verification upload, and AI endpoints.
- Keep AI prompts and outputs auditable without storing sensitive source material unnecessarily.
- Define backup, deletion, and retention policy before beta.
- Add security logging for authentication failures, authorization failures, admin actions, verification artifact access, moderation actions, upload failures, and AI safety refusals.
- Keep security logs protected from ordinary admins if they contain sensitive metadata.
- Document incident response for credential leak, verification artifact exposure, passenger-data exposure, and safety/security escalation.

## Release Gates

Before beta, require:

- Threat model for verification, anonymous posting, moderation, AI, file upload, and admin workflows.
- RLS policy test coverage.
- Manual privacy review of verification storage and retention.
- Accessibility pass on core flows.
- Dependency and secret scan.
- Admin abuse-case review.
- Confirmation that V1 exclusions are not implemented.

## What Not to Build Yet

- No airline portal login.
- No schedule scraping.
- No public nearby crew tracking.
- No dating/swiping.
- No exact public crew hotel database.
- No live schedule/location tracking.
- No flight-load request infrastructure.
- No native mobile app.
- No full marketplace payments.
- No advanced employment verification API dependency.
- No roster/calendar integrations.
