# Private App Auth DB Architecture

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Purpose

This document plans the future private application architecture behind the current public splash page. It defines the intended route model, authentication model, database entities, beta access control, verification state, authorization expectations, admin/moderation foundation, and safe implementation sequence.

This is planning only. It does not implement auth, database tables, Supabase configuration, migrations, API routes, verification uploads, storage, community features, AI, payments, analytics, or deployment configuration.

## 2. Current App State

Current M1A implementation:

- `/` exists as the public splash/waitlist landing page.
- `/app` exists as a private beta placeholder.
- Waitlist capture remains external through `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- The app stores no waitlist submissions.
- No auth, database, Supabase, API persistence, storage, verification uploads, community features, AI, payments, analytics SDK, or admin workflows currently exist.

The public splash page remains safe and public. The private app must remain inaccessible until auth, authorization, beta access, verification, moderation, and admin controls are ready.

## 3. Architecture Principles

- Keep public marketing separate from the private app.
- Build from access control outward.
- Authorization comes before community features.
- Verification state comes before anonymous posting.
- Moderation comes before real user-generated content.
- Admin controls come before real verification, reports, or anonymous participation.
- Feature gates come before feature exposure.
- Data minimization applies from the first private-app slice.
- Public copy must not imply airline affiliation, employer endorsement, or legal/trademark clearance.
- V1-excluded features stay out of scope unless a later reviewed milestone reopens them.
- Future auth and DB implementation must follow `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md` so private-app foundations remain scale-ready without premature infrastructure complexity.

V1 exclusions remain:

- No airline portal login.
- No schedule scraping.
- No public nearby crew tracking.
- No dating/swiping.
- No exact public crew hotel exposure.
- No flight-load request infrastructure.
- No native mobile in V1.
- No full marketplace payments in V1.
- No employment/payroll API dependency in V1.
- No roster/calendar integrations in V1.

## 4. Recommended Stack

Future implementation should use the existing M1A foundation and add services deliberately:

- Frontend: Next.js App Router.
- Language: TypeScript strict mode.
- Auth: Supabase Auth or equivalent.
- Database: Postgres, likely Supabase for MVP speed.
- Authorization: Row Level Security plus server-side authorization checks.
- Storage: Supabase Storage or equivalent private object storage only when upload handling is explicitly approved.
- AI: server-side AI calls only, later.
- Payments: Stripe later only when premium or monetization work is approved.
- Deployment: Vercel for the Next.js app, with separate Preview and Production environments.

Do not add Supabase, storage, AI, Stripe, analytics, or internal waitlist capture in the next implementation slice unless the task explicitly approves it.

## 5. Public vs Private Route Model

Recommended route groups:

### Public

- `/` - splash/waitlist landing page.
- `/privacy` - public privacy notice or policy, later.
- `/terms` - public terms or beta terms, later.
- `/community-guidelines` - public community rules, later.

### Private Beta

- `/app` - private app home after auth and access gate.
- `/app/onboarding` - profile and beta onboarding.
- `/app/profile` - user profile and public handle.
- `/app/base` - Base Board surface.
- `/app/layovers` - Layover Boards.
- `/app/rooms` - Crew Rooms.
- `/app/admin` - admin console, later and admin-only.

Private routes must remain locked until auth and beta access exist. Client-side hiding is not sufficient; private route access needs server-side session checks and authorization decisions.

## 6. Auth Model

Recommended early auth options:

- Email/password.
- Magic link, if it improves beta conversion.
- OAuth/social login deferred unless user validation shows it is needed.

Login email and work email verification must be treated as separate concepts. A personal login email can authenticate the account, while an aviation work email can be used only as a verification method if the user consents.

Auth/account states:

- `waitlisted`
- `invited`
- `registered`
- `email_verified`
- `profile_started`
- `profile_complete`
- `verification_pending`
- `verified`
- `denied`
- `suspended`

Auth alone is not aviation verification. A user can authenticate and still be unverified, not invited, restricted, denied, or blocked from private community surfaces.

Auth/data separation requirements:

- Auth identity, profile, beta access, verification state, and authorization rules must remain separate concerns.
- Private access cannot rely on client-only gates.
- Auth-provider metadata should not become the only source of truth for core application state.

## 7. Beta Access Control Model

Private beta should be invite-only.

Recommended model:

- External waitlist remains outside the app first.
- Founder/admin reviews waitlist responses manually.
- Admin creates or imports an invite record for selected users.
- Invite grants a beta access status, not full verification.
- User registers and completes profile.
- Verification is completed separately.
- Private app access is granted only when required access gates pass.

Beta access fields should support:

- `beta_access_status`: none, invited, active, paused, revoked.
- `invite_code` or invite token, if needed.
- `invited_email`.
- `invited_by_user_id`.
- `invited_at`.
- `accepted_at`.
- `revoked_at`.
- `revoked_reason`.

Private app community features should not be self-serve public access in early beta. A logged-in user without active beta access should see a controlled access-hold state, not community data.

## 8. Verification Architecture

Verification should be modeled as a state machine, separate from auth and beta access.

Recommended states:

- `unverified`
- `basic_email_verified`
- `aviation_work_email_verified`
- `manual_review_pending`
- `manually_verified`
- `peer_vouched`
- `rejected`
- `expired`
- `recheck_required`

Verification rules:

- Tier 3 manual verification can use non-upload review first.
- Acceptable private-beta non-upload methods can include live call review, founder/admin-known verification, work email plus manual context, or non-stored visual confirmation.
- Manual badge/document uploads are allowed only if private storage, file validation, access logging, short-lived admin links, and delete-after-review controls are ready.
- Verification decisions must be reviewed by a human admin.
- AI must not approve verification.
- Verification status can expire or require recheck when employment context changes or abuse risk is detected.

Verification artifacts, if ever accepted, must not be processed by AI and must not be stored in public paths.

## 9. Anonymous Identity Model

jmpseat needs separate layers of identity:

- Private account identity: login email, internal user ID, account status.
- Private verification identity: work email domain, verification method, reviewer, verification decision, optional artifact metadata.
- Profile identity: role, airline/company if provided, base, employment status, public handle.
- Public display identity: public handle or anonymous room display mode.
- Internal accountability link: admin-only link between anonymous content and the underlying account.

Rules:

- Users should understand that anonymous public participation is not anonymous to platform accountability.
- Room rules determine whether anonymous posting is allowed.
- Admins can connect anonymous content to internal identity only for policy enforcement, safety/security review, appeals, verification fraud, or legally/policy-required investigation.
- Sensitive identity access must be logged.
- Moderators or ambassadors should not receive access to private identity or verification evidence by default.

Audit requirements:

- Log admin views of private identity fields where practical.
- Log moderation decisions tied to anonymous content.
- Log verification decisions and reviewer.
- Log security-sensitive access without overexposing raw private data in logs.

## 10. Initial Database Entities

| Entity | Purpose | Phase |
| --- | --- | --- |
| User | Auth-level account and account status. | M2 foundation |
| Profile | Public handle, role, airline/base profile, display settings. | M2 foundation |
| Verification | Aviation affiliation review state and decision history. | M3 verification |
| TrustLevel | Account trust, restrictions, strikes, and eligibility signals. | M3 verification |
| BetaAccess | Invite-only access state for private beta. | M2 foundation |
| Invite | Admin-created invitation record for waitlist-to-beta conversion. | M2 foundation |
| Airline | Airline or aviation employer reference data. | M2 foundation |
| Role | Worker role reference data. | M2 foundation |
| Base | Airline base or domicile reference data. | M2 foundation |
| Airport | Airport reference data for bases and layovers. | M2 foundation |
| CrewRoom | Airline/base/role/topic room structure. | M4 community |
| Post | User-generated content in rooms or boards. | M4 community |
| Comment | Replies on posts. | M4 community |
| SavedItem | User-saved posts, boards, deals, or briefs. | M4 community |
| Report | User report on content, profiles, users, rooms, or deals. | M5 moderation |
| ModerationAction | Admin enforcement action and decision record. | M5 moderation |
| SecurityEvent | Auth, authorization, admin, upload, and sensitive-access events. | M2 foundation |
| UploadArtifact | Metadata for sensitive uploads if uploads are approved later. | M3 verification |
| AIBrief | Jumpseat Brief output record or request metadata. | later/deferred |
| Subscription | Premium/payment state. | later/deferred |

`Subscription` should not be modeled until premium features or Stripe/payments enter scope. `UploadArtifact` should exist only when upload handling is approved or when metadata is needed for a clearly defined sensitive-artifact workflow.

## 11. RLS / Authorization Plan

RLS is required for exposed tables, but RLS is not sufficient by itself. Product-specific authorization must also be enforced through server-side helpers.

Rule categories:

- Public reads: only explicitly public content, public policy pages, and safe reference data.
- Authenticated reads: user can read their own account state and allowed onboarding data.
- Own-profile reads/writes: user can edit allowed profile fields, not admin-only fields.
- Verified-only reads/writes: verified users can access and contribute to allowed private surfaces.
- Room membership reads/writes: room visibility, posting permissions, and anonymous posting depend on room rules and user state.
- Admin-only review/actions: verification review, report review, moderation action, beta invite management, and trust controls.
- Audit/security event restrictions: admin/security-only, with strong limits on who can read raw event data.
- Upload artifact restrictions: private storage metadata and signed links only for authorized reviewers.

Authorization helper categories:

- Account state eligibility.
- Beta access eligibility.
- Verification eligibility.
- Room read/write access.
- Anonymous posting eligibility.
- Admin role and action permission.
- Sensitive artifact access.
- Report and moderation action permission.

Tests should cover unverified, invited, verified, denied, suspended, admin, and future moderator-like states.

## 12. Admin and Moderation Foundation

Future admin needs:

- Verification review.
- Beta invite management.
- User trust status controls.
- Reports queue.
- Moderation actions.
- Emergency escalation category.
- Audit/security event review.

Admin must exist before real anonymous posting. At minimum, private beta needs a controlled admin path to:

- Approve or reject verification.
- Revoke beta access.
- Suspend or restrict a user.
- Hide or remove content.
- Review reports.
- Escalate safety/security issues.
- See relevant audit history for a decision.

Ambassadors are not moderators by default and must not be able to verify users, approve sensitive content, or access private identity evidence.

## 13. Waitlist to Beta Conversion

Recommended future flow:

1. External Tally waitlist collects safe, non-sensitive interest.
2. Founder/admin reviews waitlist responses outside the app.
3. Selected users are invited manually.
4. Admin creates `Invite` and `BetaAccess` records.
5. User registers through the approved auth flow.
6. User completes profile with role, base, airline/company if provided, and public handle.
7. User completes the required verification path.
8. App access is granted when beta access, auth, profile, and verification gates pass.

Do not implement internal waitlist capture yet. Internal waitlist database capture should require a separate approved task, privacy review, and migration plan.

## 14. Feature Gate Plan

Recommended gates:

- `private_beta_access`: enables private app shell after invite/auth.
- `crew_rooms`: enables Crew Rooms navigation and read access.
- `base_boards`: enables Base Boards.
- `layover_boards`: enables Layover Boards.
- `anonymous_posting`: enables anonymous display mode only after verification, moderation, and admin controls exist.
- `jumpseat_brief`: enables limited/demo AI after AI safety work.
- `deals_directory`: enables admin-reviewed NonRev Deals directory.
- `admin_dashboard`: enables admin-only verification, invite, report, and trust controls.

Feature gates should be server-enforced. Client-side UI flags can improve user experience but must not be the security boundary.

## 15. Security and Privacy Requirements

Baseline requirements:

- Least privilege for database roles, service keys, admin accounts, CI tokens, and third-party integrations.
- No sensitive waitlist collection.
- No airline portal credentials.
- No schedule data.
- No exact crew hotel data.
- No passenger information.
- No public location tracking.
- Structured security logs for auth failures, authorization denials, admin actions, verification decisions, report decisions, and sensitive access.
- Access logging for sensitive admin actions.
- Deletion and retention design before accepting verification artifacts.
- No service-role keys in client bundles.
- No raw secrets in source control.
- Generic auth errors that do not leak account existence unnecessarily.
- Rate limiting and abuse controls for auth, invites, reports, and posting.

Privacy requirements:

- Separate private identity from public handle.
- Store verification decision metadata separately from raw artifacts.
- Delete raw verification artifacts after review unless a documented fraud/safety reason and retention policy exist.
- Avoid duplicating sensitive logs without a clear purpose.
- Support manual deletion/export process before private beta and operational process before public launch.

## 16. Phased Implementation Sequence

Safe sequence:

- M1A: public splash/waitlist page - complete.
- M1B: private app shell and route gate planning.
- M2: auth/profile foundation.
- M3: verification state and beta access model.
- M4: read-only community structure.
- M5: moderation/reporting/admin foundation.
- M6: limited posting only after moderation is ready.
- M7: Jumpseat Brief demo/limited AI later.

Important sequencing rule: do not enable real anonymous posting until auth, server-side authorization, beta access, verification state, reporting, moderation queue, admin controls, trust/safety rules, and emergency escalation exist.

## 17. What Not To Build Yet

Do not build yet:

- Internal waitlist database unless explicitly approved.
- Verification uploads.
- Anonymous posting.
- AI.
- Payments.
- Marketplace.
- Nearby crew features.
- Schedule import.
- Airline portal login.
- Non-rev load requests.
- Native mobile.
- Roster/calendar integrations.
- Employment/payroll verification API dependency.

These are not implied by the private app shell. If any become necessary, they need separate validation, policy review, security review, and a scoped implementation task.

## 18. Architecture Decision Records Needed

Future ADRs:

- Supabase vs alternative backend.
- Magic link vs password.
- Work email verification approach.
- Manual verification without uploads.
- Upload retention/deletion policy.
- RLS policy design.
- Admin role model.
- Internal vs external waitlist capture.
- Feature flag implementation.
- Audit/security event model.
- Beta invite token strategy.

Each ADR should state the decision, context, alternatives considered, security/privacy impact, operational impact, and rollback or migration considerations.

## 19. Recommended Next Tasks

1. Create the Tally/waitlist externally using `docs/DEPLOYMENT_AND_WAITLIST_READINESS.md`, then configure `NEXT_PUBLIC_WAITLIST_FORM_URL` in preview when ready.
2. Prepare an M1B private app shell prompt, but do not run it until explicitly approved; scope should be route structure and locked access states only.
3. Prepare a Supabase/Auth architecture research or ADR pass if the decision is made to proceed toward M2 auth/profile work.
