# Feature Roadmap

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This document does not claim legal or trademark clearance.

## Roadmap Principle

Utility first. Community second. Social feed last.

The roadmap should deepen practical utility before expanding into social, marketplace, or integration-heavy features.

## Phase 1: MVP

Goal: prove the verified aviation-worker utility community.

- Account creation.
- Supabase Auth or equivalent email/password auth.
- Aviation worker verification through work email and manual review.
- Airline, role, and base profile.
- Anonymous public handle.
- Crew Rooms: airline/base/role/topic communities.
- Base Board: base-specific intel.
- Layover Boards: city and airport crew intel.
- Posts, comments, saves, search.
- Jumpseat Brief: AI layover planner MVP.
- Basic NonRev Deals directory.
- Reporting and moderation.
- Admin verification dashboard.
- OWASP/ASVS-informed security baseline.
- WCAG 2.2 AA core-flow accessibility.
- CI gates for type checking, linting, tests, dependency audit, and secret scanning.
- Security logging for sensitive workflows.

V1 excludes airline portal login, schedule scraping, public nearby crew tracking, dating/swiping, exact public crew hotel exposure, live schedule/location tracking, flight-load requests, native mobile, full marketplace payments, advanced employment verification APIs, and roster/calendar integrations.

## Phase 2: AI Briefs, Career Tools, Crash Pad Board, Sponsored Deals

Goal: deepen utility after the core community loop works.

- Improved Jumpseat Brief with source-aware summaries and stronger risk filtering.
- Base Brief for base-specific summaries.
- Layover Board summaries.
- Ready Room career/interview/professional tools.
- Career Copilot.
- Contract Explainer with disclaimers and no legal-advice claims.
- Crash pad board with anti-scam and privacy controls.
- Sponsored local crew deals.
- Crew Rest wellness, sleep, and downtime resources.
- Expanded abuse monitoring and moderator tooling.
- Accessibility and usability improvements from beta findings.

Phase 2 still avoids public live location tracking, dating/swiping, schedule scraping, and public exact hotel exposure.

## Phase 3: Vendor Marketplace, Recruiting, Verification APIs, Advanced Admin

Goal: formalize business and trust infrastructure.

- Vendor marketplace for crew-relevant services.
- Recruiting/job posts.
- Employer or recruiter accounts with constrained permissions.
- SheerID, Truework, Argyle, Atomic, or similar verification exploration if justified by cost, coverage, and privacy review.
- Advanced admin analytics.
- Room/base moderators.
- Moderation quality review.
- Structured appeals.
- Trust-level automation with human review.
- Advanced security monitoring and incident response playbooks.
- Formal vendor risk review for marketplace, recruiting, payments, and verification integrations.

Revenue expansion should not weaken anonymity, safety, or verified-member trust.

## Phase 4: Optional Roster and Calendar Integrations

Goal: add integrations only after trust is established.

- Optional roster or calendar integrations.
- Explicit opt-in permissions.
- Clear data retention and deletion controls.
- No hidden schedule scraping.
- No airline portal credential collection without a separate security/legal review.
- No public crew tracking.
- No public precise trip, hotel, or operational details.

## Deferred Unless Proven Necessary

- Native mobile apps.
- Push-heavy real-time social loops.
- Public nearby crew map.
- Dating/swiping mechanics.
- Flight-load request marketplace.
- Dedicated search/vector infrastructure.
- Fully automated verification.
