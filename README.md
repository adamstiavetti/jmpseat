# Deadhead Club

Deadhead Club is a verified off-duty network for airline people: flight attendants, pilots, gate agents, ramp agents, dispatchers, crew schedulers, airport operations teams, regional airline workers, new hires, commuters, and eventually aspiring aviation workers with limited access.

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This repo does not claim that the name is cleared for legal or trademark use.

This repository contains Deadhead Club product planning docs and the first narrow app foundation slice: an M1A public splash/waitlist landing page. It intentionally does not include authentication, database migrations, Supabase configuration, API routes, verification uploads, community features, AI implementation, payments, or persistence.

## Product North Star

Utility first. Community second. Social feed last.

Deadhead Club should become the trusted aviation-worker utility layer for base intel, layover planning, anonymous crew talk, career movement, and crew-friendly perks. The identity model is:

Verified privately. Anonymous publicly. Accountable internally.

Users prove aviation affiliation behind the scenes, then participate under a public handle or anonymous identity depending on room rules. Admins retain enough internal accountability to enforce safety rules.

## Audience

Deadhead Club serves the broader airline ecosystem, not only pilots and flight attendants:

- Flight attendants
- Pilots
- Gate agents
- Ramp agents
- Dispatchers
- Crew schedulers
- Airport operations workers
- Regional airline workers
- New hires and trainees
- Commuters
- Eventually, aspiring aviation workers with limited-access accounts

## MVP Summary

V1 should not try to beat schedule, roster, or non-rev load tools. Research confirms that Flight Crew View, CrewLounge CONNECT, StaffTraveler, and several newer layover/social apps already compete strongly on those surfaces. Deadhead Club's wedge is verified anonymous discussion, base intelligence, layover boards, AI summaries, career tools, safety-first moderation, and crew-friendly marketplace context.

Core V1 capabilities:

- Account creation
- Aviation worker verification
- Airline, role, and base profile
- Anonymous public handle
- Crew Rooms
- Base Boards
- City and airport Layover Boards
- Posts, comments, saves, and search
- Jumpseat Brief AI layover planner
- Basic crew-friendly deals directory
- Reporting and moderation
- Admin verification dashboard

V1 explicitly excludes airline portal login, schedule scraping, public nearby crew tracking, dating/swiping behavior, exact public crew hotel exposure, live schedule/location tracking, flight-load request infrastructure, native mobile apps, full marketplace payments, advanced employment-verification API dependency, and roster/calendar integrations.

## Docs Index

- [Deadhead Club Blueprint](docs/DEADHEAD_CLUB_BLUEPRINT.md)
- [MVP Scope](docs/MVP_SCOPE.md)
- [Feature Roadmap](docs/FEATURE_ROADMAP.md)
- [Trust and Safety](docs/TRUST_AND_SAFETY.md)
- [Monetization](docs/MONETIZATION.md)
- [Data Model](docs/DATA_MODEL.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Competitive Positioning](docs/COMPETITIVE_POSITIONING.md)
- [Build Tickets](docs/BUILD_TICKETS.md)
- [Beta Readiness Checklist](docs/BETA_READINESS_CHECKLIST.md)
- [Private Beta Operating Plan](docs/PRIVATE_BETA_OPERATING_PLAN.md)
- [Milestone Execution Plan](docs/MILESTONE_EXECUTION_PLAN.md)
- [Landing Page Waitlist Plan](docs/LANDING_PAGE_WAITLIST_PLAN.md)
- [M0 Validation Operating Packet](docs/M0_VALIDATION_OPERATING_PACKET.md)
- [No-Code Waitlist Execution](docs/NO_CODE_WAITLIST_EXECUTION.md)
- [Product Delivery Operating Model](docs/PRODUCT_DELIVERY_OPERATING_MODEL.md)
- [Discovery Research Plan](docs/DISCOVERY_RESEARCH_PLAN.md)
- [Problem/Solution Validation Matrix](docs/PROBLEM_SOLUTION_VALIDATION_MATRIX.md)
- [Discovery Research Report 001](docs/DISCOVERY_RESEARCH_REPORT_001.md)
- [App Foundation Notes](docs/APP_FOUNDATION_NOTES.md)
- [Deployment and Waitlist Readiness](docs/DEPLOYMENT_AND_WAITLIST_READINESS.md)
- [Legal Policy Requirements](docs/LEGAL_POLICY_REQUIREMENTS.md)
- [Docs Consistency Review](docs/DOCS_CONSISTENCY_REVIEW.md)
- [Research Notes](docs/RESEARCH_NOTES.md)

## Current Repo Boundary

This repo is now both the planning source of truth and the home for the first approved M1A app foundation slice. Product-feature implementation remains out of scope until explicitly approved, and no auth, database, Supabase, verification, community, AI, moderation, admin, payment, or deployment work should begin until the relevant validation, policy, safety, and sequencing gates are accepted.

## App Foundation Quick Start

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run build
```

Configure the external waitlist CTA:

```bash
cp .env.example .env.local
```

Then set:

```bash
NEXT_PUBLIC_WAITLIST_FORM_URL=
```

If `NEXT_PUBLIC_WAITLIST_FORM_URL` is set, the splash page links to that external form. If it is missing, the page shows `Waitlist form coming soon.` No waitlist submissions are stored in this app.

Implemented now:

- `/` public splash/waitlist landing page.
- `/app` inaccessible private beta placeholder.
- Next.js App Router, TypeScript strict mode, ESLint, responsive CSS, and accessible semantic HTML.

Intentionally not implemented:

- Auth or user accounts.
- Supabase or database.
- API waitlist submission or persistence.
- Verification uploads or storage.
- Crew Rooms, Base Boards, Layover Boards, posts, comments, moderation, admin dashboard, AI, payments, marketplace, native mobile, schedule integrations, airline portal login, flight-load requests, nearby crew tracking, or dating/swiping.

## Engineering Standards Baseline

Future implementation should use these standards as planning gates:

- OWASP Top 10 and OWASP ASVS as the web application security baseline.
- Row Level Security plus server-side authorization for sensitive data access.
- Private storage, upload validation, malware scanning where available, short-lived signed URLs, and retention limits for verification artifacts.
- Server-side AI calls only, structured outputs where practical, prompt-injection defenses, sensitive-data filtering, and human review for verification or final moderation outcomes.
- WCAG 2.2 AA as the accessibility target for auth, verification, posting, reporting, search, and admin workflows.
- CI checks for type safety, linting, tests, dependency audit, secret scanning, and security review before release.
