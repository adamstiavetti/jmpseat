# Deadhead Club

Deadhead Club is a verified off-duty network for airline people: flight attendants, pilots, gate agents, ramp agents, dispatchers, crew schedulers, airport operations teams, regional airline workers, new hires, commuters, and eventually aspiring aviation workers with limited access.

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This repo does not claim that the name is cleared for legal or trademark use.

This repository currently contains product planning and build-blueprint documentation only. It intentionally does not include application code, framework scaffolding, database migrations, Supabase configuration, API routes, or UI implementation.

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
- [Milestone Execution Plan](docs/MILESTONE_EXECUTION_PLAN.md)
- [Landing Page Waitlist Plan](docs/LANDING_PAGE_WAITLIST_PLAN.md)
- [Legal Policy Requirements](docs/LEGAL_POLICY_REQUIREMENTS.md)
- [Research Notes](docs/RESEARCH_NOTES.md)

## Current Repo Boundary

This repo is a planning source of truth for future build work. The next implementation task may create the app foundation from these documents, but implementation remains out of scope until explicitly requested.

## Engineering Standards Baseline

Future implementation should use these standards as planning gates:

- OWASP Top 10 and OWASP ASVS as the web application security baseline.
- Row Level Security plus server-side authorization for sensitive data access.
- Private storage, upload validation, malware scanning where available, short-lived signed URLs, and retention limits for verification artifacts.
- Server-side AI calls only, structured outputs where practical, prompt-injection defenses, sensitive-data filtering, and human review for verification or final moderation outcomes.
- WCAG 2.2 AA as the accessibility target for auth, verification, posting, reporting, search, and admin workflows.
- CI checks for type safety, linting, tests, dependency audit, secret scanning, and security review before release.
