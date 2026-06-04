# jmpseat Blueprint

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Product Vision

jmpseat is a verified aviation-worker utility community for base intel, layover planning, anonymous crew talk, career movement, and crew-friendly perks.

The product should not become generic social media. Its durable value is the verified aviation-specific knowledge graph created by workers across airlines, bases, roles, airports, and career stages.

## Problem Statement

Airline workers rely on fragmented tools and communities:

- Schedule and roster apps solve operational personal workflow, but do not own cross-role community knowledge.
- Non-rev tools solve flight-load requests, but do not own base intelligence or anonymous worker discussion.
- Deals apps provide perks, but are not enough to create durable community utility.
- Facebook groups and Reddit capture scattered institutional knowledge, but verification, moderation, retrieval, and privacy are inconsistent.
- Anonymous workplace communities like Blind validate the power of verified anonymous discussion, but are not aviation-specific and do not address crew hotel, airport security, live schedule, or passenger privacy risks.

jmpseat should make off-duty aviation knowledge easier to trust, search, summarize, and reuse.

## Target Users

Primary V1 users:

- Flight attendants
- Pilots
- Gate agents
- Ramp agents
- Dispatchers
- Crew schedulers
- Airport operations workers
- Regional airline workers
- New hires
- Commuters

Future limited-access users:

- Aspiring aviation workers
- Aviation students
- Applicants preparing for interviews
- Vendors and recruiters with constrained permissions

## Core Positioning

jmpseat is a verified off-duty network for airline people.

It owns the utility layer around:

- Base-specific institutional knowledge
- Layover and airport intel
- Anonymous but accountable crew discussion
- Career and interview preparation
- Crew-friendly perks and local deals

## Governing Product Principle

Utility first. Community second. Social feed last.

Every feature should answer a practical aviation-worker need before optimizing for engagement.

## Identity Principle

Verified privately. Anonymous publicly. Accountable internally.

The product should separate:

- Private verification: proof of aviation affiliation.
- Public participation: public handle or room-approved anonymous identity.
- Internal accountability: admin-accessible account history for trust and safety enforcement.

## Research-Backed Product Implications

Competitor research supports these planning decisions:

- Flight Crew View and CrewLounge CONNECT have strong schedule, roster, calendar, hotel, and crew-connect utility. jmpseat should not enter V1 as a schedule app.
- StaffTraveler is tightly positioned around non-rev load requests and staff-travel utility. jmpseat should not build flight-load request infrastructure in V1.
- CrewVIP validates crew discounts and location-based offers, but deals alone are not a strong enough wedge for jmpseat.
- Newer crew social and layover apps show demand for layover chat, crew verification, meetups, crash pads, and nearby crew features. They also highlight risk: jmpseat should avoid public live location tracking and dating/swiping behavior in V1.
- Blind validates work-email verification and anonymous professional discussion, but also shows that employer email verification can create perceived privacy risk if employer mail logs reveal verification attempts.
- TSA Sensitive Security Information guidance and aviation privacy sources support strict bans on airport security procedures, live operations-sensitive information, and careless handling of passenger or crew-location data.

See [Research Notes](RESEARCH_NOTES.md) for source-level detail.

## Product Principles

- Utility first, community second, social feed last.
- Verified privately, anonymous publicly, accountable internally.
- Include the broader airline ecosystem, not only pilots and flight attendants.
- Treat base-specific institutional knowledge as a core product asset.
- Use AI to turn community knowledge into useful outputs; AI is not the brand gimmick.
- Build trust, safety, aviation privacy, and moderation from day one.
- No airline portal login in V1.
- No schedule scraping in V1.
- No public nearby crew tracking in V1.
- No dating or swiping vibe in V1.
- No exact crew hotel exposure as a public feature.
- No live operations-sensitive information.
- No passenger private information.
- No doxxing, harassment, threats, or impersonation.
- No confidential company documents unless explicitly public or allowed.

## Capability Map

Identity and access:

- Account creation
- Email/password auth
- Verification tiers
- Airline, role, and base profile
- Anonymous public handle
- Trust levels and account restrictions

Community utility:

- Crew Rooms: airline/base/role/topic communities
- Base Board: base-specific intel
- Layover Boards: city and airport crew intel
- The Galley: casual/off-duty discussion
- Ramp Talk: gate/ramp/ops discussion
- Crew Rest: wellness, sleep, downtime
- Ready Room: career/interview/professional tools

Content:

- Posts
- Comments
- Saves
- Search
- Tags and structured categories
- Room rules and anonymity settings

AI:

- Jumpseat Brief: AI layover planner
- Base Brief
- Layover Board summaries
- Career Copilot
- Contract Explainer
- Search Assistant
- Safety Filter
- Moderation Assistant

AI must be server-side only, use structured outputs where practical, and never approve verification, make final bans, expose sensitive data, or rely on hidden prompts as the only safety boundary.

Commerce:

- NonRev Deals: perks and discounts
- Sponsored local crew deals
- Affiliate links
- Future vendor marketplace
- Future featured crash pad listings
- Future recruiting/job posts

Safety:

- User reports
- Automated risk flags
- Admin review queue
- Strike system
- Takedown workflow
- Appeal workflow
- Emergency escalation for safety/security issues
- Base or room moderators later

## Verification Model

V1 should support low-friction verification without depending on expensive or privacy-heavy employment APIs.

- Tier 0: unverified / waitlist
- Tier 1: basic email verified
- Tier 2: aviation work email verified
- Tier 3: manual document or badge verified
- Tier 4: peer-vouched by verified members
- Tier 5: employment/payroll/API verified later

V1 realistic options:

- Basic email verification
- Aviation work email verification where available
- Manual badge/document review
- Peer vouching after enough verified member density exists

Later-stage options:

- SheerID-style eligibility verification
- Truework-style employment verification
- Argyle or Atomic payroll connectivity
- Partner verification APIs

The later-stage options may add coverage and automation, but they introduce cost, privacy, consent, implementation, and user-trust complexity.

## MVP Definition

V1 should prove that verified aviation workers will contribute and reuse practical base and layover knowledge in a trusted environment.

MVP includes:

- Account creation
- Aviation worker verification
- Airline, role, and base profile
- Anonymous public handle
- Crew Rooms
- Base Boards
- City and airport Layover Boards
- Posts, comments, saves, search
- Jumpseat Brief AI layover planner
- Basic NonRev Deals directory
- Reporting and moderation
- Admin verification dashboard

## Phased Roadmap

Phase 1: MVP

- Core auth and verification
- Profile and identity model
- Crew Rooms, Base Boards, Layover Boards
- Posts, comments, saves, search
- Reporting and moderation
- Jumpseat Brief MVP
- Basic deals directory
- Admin verification dashboard

Phase 2: Utility Expansion

- Stronger AI briefs
- Base Brief and Layover Board summaries
- Ready Room career/interview tools
- Crash pad board with privacy and anti-scam controls
- Sponsored local crew deals
- Crew Rest resources

Phase 3: Marketplace and Institutional Layer

- Vendor marketplace
- Recruiting and job posts
- Verification APIs or partner workflows
- Advanced admin and analytics
- Room moderators
- Appeals and moderation quality review

Phase 4: Optional Integrations

- Roster or calendar integrations only after trust is established
- Explicit opt-in and deletion controls
- No public crew tracking
- No schedule scraping

## Technical Summary

Recommended MVP direction:

- Frontend: Next.js / React
- Backend: Next.js route handlers or separate API layer
- Database: Postgres, likely Supabase for MVP speed
- Auth: Supabase Auth or equivalent
- Authorization: Row Level Security plus server-side authorization checks
- Verification storage: private object storage with strict retention/deletion policy
- Search: Postgres full-text first
- AI: server-side calls only
- Payments: Stripe later
- Deployment: Vercel plus managed Postgres/Supabase
- Admin moderation dashboard from day one
- Native mobile deferred until web MVP proves demand

Best-practice baseline:

- OWASP Top 10 and OWASP ASVS for secure web application planning.
- Privacy-by-design for verification evidence, passenger data avoidance, retention, and deletion.
- WCAG 2.2 AA for core user and admin flows.
- RLS plus server-side authorization for sensitive data.
- Server-side AI calls, structured outputs where practical, and deterministic policy checks outside the model.
- Security logging for authentication, authorization, moderation, verification, uploads, and AI safety events.
- CI gates for type safety, linting, tests, dependency audit, and secret scanning.

## Initial Build Sequence

1. App scaffold.
2. Auth foundation.
3. User/profile model.
4. Verification model.
5. Crew Rooms.
6. Base Boards.
7. Posts/comments.
8. Moderation/reporting.
9. Jumpseat Brief MVP.
10. Admin dashboard.
