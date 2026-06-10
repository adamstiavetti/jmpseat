# Seeded Layovers Editorial Model

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Canonical Definition

Seeded Layovers are MVP bridge content for destinations DFW-based crew
commonly lay over in.

They are not full Hubs yet.

They are not throwaway content.

They should later graduate into Hub Layovers content when that destination
becomes a full Hub.

They are utility-first, not social-feed-first.

This note is a product and editorial definition only. It does not create
schema, content, AI behavior, runtime data, or UI.

## 2. Product-Facing Structure

Seeded Layovers should not feel like a raw forum feed.

Use these product-facing sections:

- `Featured Picks`
- `Categories`
- `Crew Notes`
- `Questions`

Definitions:

- `Featured Picks`: high-signal admin-curated or later saved-driven layover
  recommendations
- `Categories`: Food, Coffee, Transportation, Fitness, Things To Do, Crew Tips
- `Crew Notes`: lightweight crew-shared practical notes
- `Questions`: Q&A-style threads

The user experience should feel like practical destination utility with room
for community knowledge, not an undifferentiated content stream.

## 3. Internal Content Direction

Future implementation may still use shared post/thread primitives under the
hood, but the product should present utility-first language rather than forum
terminology by default.

Potential future content types:

- `recommendation`
- `question`
- `note`
- `guide`

Potential future categories:

- `food`
- `coffee`
- `transportation`
- `fitness`
- `things_to_do`
- `crew_tips`
- `safety`
- `general`

This task does not create schema for any of the above.

## 4. Editorial Workflow

Canonical workflow:

1. research
2. optional AI-assisted draft
3. required human/admin review
4. publish
5. periodic refresh
6. later flag/report/update loop

Seeded Layovers are an editorial surface first. Even when community content
exists later, the launch posture should favor high-signal, reviewed utility.

## 5. AI Rules

AI may assist drafting or research only.

AI must not auto-publish.

AI must not become source of truth.

AI-drafted recommendations require human/admin review before publication.

AI must not recommend unsafe or sensitive content without review.

## 6. Safety Rules

Seeded Layovers must never include or encourage:

- exact crew hotel locations
- "where crews stay"
- live crew locations
- exact current meetup or location tied to crew identity
- airline-specific lodging details
- passenger/private information
- private company information
- airport security procedures
- operationally sensitive information
- confidential company documents
- anything that creates crew-tracking or hotel-exposure risk

These boundaries apply whether content is admin-written, community-sourced, or
AI-assisted.

## 7. MVP Tier 1 Destinations

Treat this list as a user-provided operational assumption, not externally
verified data.

Tier 1 destinations:

- `LAX`
- `ORD`
- `NYC airports: LGA/JFK`
- `DEN`
- `LAS`
- `PHX`
- `SEA`
- `MCO`
- `MIA`
- `ATL`
- `CLT`
- `PHL`
- `DCA`

Notes:

- Product UX may group `LGA/JFK` as NYC while preserving airport-level detail
  later.
- `DCA` may later be considered alongside `IAD/BWI` if that becomes more
  useful, but MVP Tier 1 uses `DCA` as provided.
- This list should be revisited after user research and crew feedback.

## 8. Graduation Path

Canonical progression:

```text
Seeded Layovers destination
  -> engagement and feedback
  -> more Crew Notes and Questions
  -> candidate for full Hub
  -> full Hub with Baseboard, Layovers, Lounges, and Crew Picks as appropriate
```

This keeps early utility work investable instead of disposable.

## 9. MVP Non-Goals

This definition does not implement:

- schema
- seed content creation
- scraping
- live AI answers
- automatic recommendations
- posting implementation
- comments implementation
- search backend
- moderation implementation
- Crew Picks ranking
- lounge access changes
- runtime data changes

## 10. Future Implementation Decision

The next implementation decision after this doc remains open:

- implement shared post/thread foundation first
- or implement seeded layover content schema first

Recommended direction:

- Baseboard posts/thread foundation likely comes before seeded layover
  implementation, because Layovers can reuse the same post/thread foundation
  with content types and categories layered on top.
