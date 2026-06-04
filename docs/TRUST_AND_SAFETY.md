# Trust and Safety

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Safety Position

jmpseat must be designed for aviation privacy from day one. Airline people need practical and candid spaces, but the product cannot allow content that exposes passengers, crew, live operations, hotels, airport security procedures, or confidential company information.

The trust model should follow privacy-by-design and safety-by-design: minimize collection, restrict access, log sensitive access, define deletion paths, and review high-impact decisions with humans.

## Aviation-Specific Safety Rules

- No doxxing.
- No harassment.
- No threats.
- No passenger private information.
- No exact public crew hotel exposure.
- No live location tracking.
- No live operations-sensitive information.
- No airport security procedures.
- No confidential internal company documents unless explicitly public or allowed.
- No impersonation.
- No vendor spam.
- No dating/swiping behavior.
- No unsafe meetup pressure.
- No encouragement to evade airline, airport, or regulatory safety rules.

## Anonymous but Accountable Identity Model

Verified privately. Anonymous publicly. Accountable internally.

- Users verify aviation affiliation privately.
- Users choose a public handle.
- Anonymous posting is controlled by room rules.
- Anonymous posts hide public identity from other users, not from platform accountability.
- Admins can enforce policy against the underlying account.
- Verification evidence is private, access-controlled, and retained only as long as needed.

## Verification Tiers

- Tier 0: unverified / waitlist.
- Tier 1: basic email verified.
- Tier 2: aviation work email verified.
- Tier 3: manual document or badge verified.
- Tier 4: peer-vouched by verified members.
- Tier 5: employment/payroll/API verified later.

V1 should focus on Tiers 0 through 3 and cautiously test Tier 4. Tier 5 should wait until the product has enough demand, budget, consent design, and privacy review to justify vendor integration.

## Verification Risk Notes

Work email verification is useful but not risk-free. Employer mail logs may reveal that a verification email was requested, even if public activity remains anonymous. The product should disclose that risk plainly and offer manual verification as an alternative.

Manual document or badge verification should minimize collection:

- Ask users to redact unnecessary data when possible.
- Avoid storing documents longer than needed.
- Store artifacts in private object storage.
- Use short-lived admin access links.
- Log sensitive access.
- Validate upload types and size.
- Rename files on storage.
- Avoid user-controlled public file paths.
- Consider malware scanning before admin preview.
- Never send verification documents to AI systems.

Peer vouching should not launch as the only verification method because it can create cliques, pressure, and abuse. Use it as a supplemental trust signal.

## Banned Content Categories

- Passenger names, contact details, records, photos, itineraries, incidents, medical information, or identifying seat/trip details.
- Crew member doxxing, hotel disclosure, personal contact details, private social accounts, or exact live whereabouts.
- Threats, harassment, hate, sexualized targeting, or unsafe meetup pressure.
- Live operational details that could affect safety, security, or airline operations.
- Airport security procedures or information that could help someone bypass security.
- Exact public crew hotel identification tied to airline, route, date, crew, or trip.
- Confidential internal company documents, screenshots, manuals, memos, or systems unless explicitly public or allowed.
- Impersonation of airline workers, vendors, recruiters, moderators, or admins.
- Vendor spam, undisclosed sponsored promotion, scam listings, and fake deals.
- Dating/swiping behavior or romantic targeting.

## Moderation Workflow

User reports:

- Report posts, comments, deals, rooms, profiles, and users.
- Require a report category.
- Allow optional notes and supporting context.

Automated risk flags:

- Flag passenger private information.
- Flag exact hotel/location exposure.
- Flag threats, harassment, doxxing, and impersonation.
- Flag airport security or live operations-sensitive language.
- Flag vendor spam and suspicious deals.

Admin review queue:

- Show reported content, reporter context, author context, prior reports, trust level, and room rules.
- Support dismiss, remove, warn, restrict, suspend, escalate, and appeal-ready outcomes.
- Record moderation actions and internal notes.

Strike system:

- Low-risk mistake: education or warning.
- Repeated or moderate-risk violation: temporary restriction.
- Severe safety/privacy violation: suspension or emergency escalation.

Takedown workflow:

- Remove or hide content from public view.
- Preserve internal audit record where needed.
- Notify user when appropriate.

Appeal workflow:

- V1 can be manual support review.
- Later phases should add structured appeals and moderator quality review.

Emergency escalation:

- Safety/security issue.
- Credible threat.
- Passenger or crew private information exposure.
- Airport security procedure disclosure.
- Live operations-sensitive disclosure.

## Moderator and Admin Best Practices

- Use least-privilege admin roles.
- Require stronger auth controls for admins than ordinary users.
- Log verification artifact access and moderation actions.
- Separate moderation notes from public user-facing explanations.
- Require human review for suspensions, verification denials, emergency escalations, and appeals.
- Use consistent decision categories so future analytics can identify policy gaps and moderator drift.
- Avoid giving volunteer/base moderators access to verification documents, private identity evidence, or sensitive security logs.

## AI Moderation Boundaries

AI may assist with risk classification and queue prioritization, but must not:

- Approve verification.
- Make final moderation bans.
- Auto-post on behalf of users.
- Expose sensitive/private data.
- Provide aviation security procedures.
- Treat hidden prompts as the only safety boundary.

Human/admin review remains required for verification decisions, final bans, and high-impact enforcement.

AI safety requirements:

- Treat user posts and retrieved community content as untrusted input.
- Use deterministic checks for banned categories outside the model.
- Use structured outputs for moderation suggestions where practical.
- Store AI safety flags and refusal states without over-retaining sensitive prompts.
- Test for prompt injection, sensitive information disclosure, overbroad agency, and overreliance before beta.

## Risky Features to Avoid in V1

- Airline portal login.
- Schedule scraping.
- Roster/calendar import.
- Public nearby crew tracking.
- Dating/swiping.
- Public exact crew hotel databases.
- Live operational alerts.
- Open vendor posting without review.
- Automated verification decisions without human review.
