# FBMVP-T11 Seeded Layovers Strategy And Editorial Model

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T11` locks the product and editorial model for Seeded Layovers before
any schema, seed content, dashboard expansion, or search/posting implementation
continues.

This is a docs-only ticket.

It does not create schema, seed content, AI behavior, runtime data, or UI.

## Canonical Strategy

Use `docs/strategy/seeded-layovers-editorial-model.md` as the controlling note
for:

- what Seeded Layovers are
- how they should feel in product UX
- the editorial workflow
- the AI drafting boundaries
- the safety model
- the Tier 1 MVP destination list
- the graduation path from seeded destination to full Hub candidate

## Product Shape

Seeded Layovers are:

- bridge content for destinations DFW-based crew commonly lay over in
- utility-first, not social-feed-first
- not full Hubs yet
- not throwaway content
- future candidates for graduation into real Hub Layovers surfaces

The product-facing shape should use:

- Featured Picks
- Categories
- Crew Notes
- Questions

Not a raw forum-feed presentation.

## Safety Boundaries

Seeded Layovers must not publish or encourage:

- exact crew hotel locations
- "where crews stay"
- live crew locations
- exact meetup/location tied to crew identity
- airline-specific lodging details
- passenger/private information
- private company information
- airport security procedures
- operationally sensitive information
- confidential company documents
- anything that creates crew-tracking or hotel-exposure risk

## Tier 1 Destinations

This ticket records the user-provided MVP Tier 1 destination assumption:

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

This list is not externally verified in this ticket and should be revisited
through user research and crew feedback later.

## Future Implementation Recommendation

The next implementation decision after T11 remains open:

- build shared post/thread foundation first
- or build seeded layover content schema first

Recommended direction:

- shared Baseboard posts/thread foundation likely comes first, because Seeded
  Layovers can reuse the same primitives with content types and categories

## Preserved Boundaries

T11 preserves these boundaries:

- no schema
- no seed content creation
- no scraping
- no live AI answers
- no automatic recommendations
- no posting implementation
- no comments implementation
- no search backend
- no moderation implementation
- no Crew Picks ranking
- no lounge access changes
- no runtime data changes
- no proof-upload scope
