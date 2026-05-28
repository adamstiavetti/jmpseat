# MVP Scope

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This document does not claim legal or trademark clearance.

## MVP Goal

The MVP should prove that verified airline people will use Deadhead Club as a practical utility community for base intel, layover planning, anonymous crew discussion, and crew-friendly perks.

V1 should not compete directly with roster/schedule apps, non-rev load request tools, dating/meetup apps, or full crew marketplaces.

## In V1

### Account Creation

- Email/password sign up and login.
- Basic email verification.
- Account states: waitlist, email verified, pending aviation verification, verified, restricted, suspended.

### Aviation Worker Verification

- Tier 0: unverified / waitlist.
- Tier 1: basic email verified.
- Tier 2: aviation work email verified where practical.
- Tier 3: manual document or badge verified.
- Tier 4: peer-vouched by verified members, gated behind admin controls.
- Tier 5: employment/payroll/API verified later, not required for V1.

V1 verification should support work email and manual review. Tier 3 manual review can be non-upload review during private beta if upload controls are not ready, such as live call review, founder/admin-known verification, work email plus manual context, or non-stored visual confirmation. Manual badge/document uploads are allowed only if private storage, validation, short-lived admin links, access logging, and delete-after-review controls are ready. V1 should not depend on advanced vendors such as SheerID, Truework, Argyle, or Atomic.

### Airline, Role, and Base Profile

- User profile tied to airline, role, and base.
- Role model includes flight attendants, pilots, gate agents, ramp agents, dispatchers, crew schedulers, airport ops, regional workers, new hires, and commuters.
- Public handle is separate from private identity.

### Anonymous Public Handle

- Public handle required for participation.
- Anonymous posting available only where room rules allow it.
- Admins retain account-level accountability.

### Crew Rooms

Crew Rooms are airline/base/role/topic communities.

V1 room types:

- Airline room.
- Base room.
- Role room.
- Topic room.
- Casual room for The Galley.
- Operational-adjacent but non-sensitive room for Ramp Talk.
- Wellness room for Crew Rest.
- Career room for Ready Room.

### Base Boards

Base Board is base-specific intel.

V1 categories:

- Commuting.
- Parking.
- New-hire survival.
- Reserve life.
- Food and errands.
- Transit.
- Crash pad discussion without exact resident exposure.
- Base culture.

### City and Airport Layover Boards

Layover Boards are city and airport crew intel.

V1 categories:

- Food.
- Transportation.
- Wellness and sleep.
- Safety notes.
- Downtime.
- Airport-area tips.
- Crew-friendly places.

No public exact crew hotel exposure is allowed.

### Posts, Comments, Saves, Search

- Create, edit, delete own posts where allowed.
- Comment on posts.
- Save posts, deals, boards, and AI briefs.
- Basic search across visible content.
- Search must respect room visibility, account status, removed content, and anonymous display rules.

### Jumpseat Brief

Jumpseat Brief is the AI layover planner.

V1 behavior:

- Server-side AI calls only.
- Structured outputs where practical.
- Uses allowed content and user-provided trip context.
- Blocks exact crew hotel exposure, live operations-sensitive information, passenger private information, airport security procedures, and confidential company information.
- Does not auto-post on behalf of users.

### NonRev Deals

NonRev Deals are perks and discounts.

V1 includes:

- Basic deal directory.
- Vendor, category, location, terms, sponsorship status, and verification status.
- Admin-created or admin-reviewed deals only.

### Reporting and Moderation

- User reports.
- Automated risk flags for high-risk categories.
- Admin review queue.
- Strike system.
- Takedown workflow.
- Appeal workflow.
- Emergency escalation category for safety/security issues.
- Base or room moderators later.

### Admin Verification Dashboard

- Review pending verification submissions.
- Approve, reject, or request more information.
- Access sensitive verification artifacts only through private storage controls.
- Log review decisions.

## Excluded From V1

- Airline portal login.
- Schedule scraping.
- Public nearby crew tracking.
- Dating/swiping experience.
- Exact public crew hotel exposure.
- Live schedule/location tracking.
- Flight-load request infrastructure.
- Native mobile app.
- Full marketplace payments.
- Advanced employment verification API dependency.
- Roster/calendar integrations.
- Vendor self-serve portal.
- Recruiter dashboard.
- AI auto-approval of verification.
- AI final bans without admin review.
- Public display of passenger private information.
- Airport security procedures.
- Confidential internal company documents unless explicitly public or allowed.

## MVP Acceptance Criteria

- User can create an account and verify email.
- User can submit aviation verification through work email or manual review path.
- Admin can approve, reject, or request more information.
- Verified user can create airline, role, base, and public handle profile.
- Verified user can view allowed Crew Rooms, Base Boards, and Layover Boards.
- Verified user can post, comment, save, and search visible content.
- Anonymous posting works only where room rules allow it.
- User can report posts, comments, deals, and profiles.
- Admin can review reports and apply moderation actions.
- Emergency reports can be categorized separately for safety/security escalation.
- Jumpseat Brief produces a useful layover plan while excluding sensitive categories.
- NonRev Deals lists basic crew-friendly perks and discounts.
- Verification artifacts are private, access-controlled, and subject to retention/deletion policy.
- The product does not include any V1 excluded features.

## MVP Engineering Acceptance Criteria

- OWASP Top 10 risks are reviewed before beta, with special focus on broken access control, injection, insecure design, security misconfiguration, authentication failures, and logging/monitoring failures.
- RLS is enabled on exposed tables and backed by server-side authorization checks.
- Verification uploads enforce allowed file types, size limits, private storage, short-lived access, and deletion policy.
- AI calls are server-side only and include safety filtering, structured outputs where practical, and human review boundaries.
- Core user flows meet WCAG 2.2 AA: auth, verification, posting, reporting, search, and admin review.
- CI includes type checking, linting, tests, dependency audit, and secret scanning before production launch.
- Security events are logged for auth failures, authorization denials, verification artifact access, moderation actions, upload rejections, and AI safety refusals.
