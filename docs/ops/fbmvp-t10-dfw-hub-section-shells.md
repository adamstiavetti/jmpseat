# FBMVP-T10 DFW Hub Section Route Shells

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T10` gives the read-only DFW Hub section cards real private-app
destinations without implementing the underlying content systems yet.

This is a route-shell ticket only. It adds no schema, migrations, deployment,
runtime Supabase mutation, posting, comments, search backend, saves, reactions,
Crew Picks ranking, lounge request/review flows, Crew Lead panel, AI, seed
layover content, or proof-upload scope.

## Routes

New read-only routes:

- `/app/hubs/dfw/baseboard`
- `/app/hubs/dfw/layovers`
- `/app/hubs/dfw/lounges`
- `/app/hubs/dfw/crew-picks`

Each route:

- is dynamic/private
- uses the same private app gate and server-side security-event audit path as
  the DFW Hub shell
- links back to `/app/hubs/dfw`
- renders placeholder content only
- states what comes later
- avoids implying live posting, comments, search backend, saves, reactions,
  lounge request/review, Crew Lead panel, ranking, AI, or seeded content exists

The parent DFW Hub page now links its section cards to these routes.

## Section Definitions

### DFW Baseboard

Purpose:

- based-there community surface for DFW aviation workers
- base Q&A, updates, practical notes, and useful discussion

Placeholder boundaries:

- Recent discussions are coming later.
- Ask Baseboard is coming later.
- Community posting is not live yet.

### DFW Layovers

Purpose:

- crew layover utility for people passing through DFW
- food, coffee, gyms, transportation basics, quick recommendations, weather
  basics, and Q&A

Safety boundaries:

- no exact crew hotel locations
- no live crew tracking
- no security-sensitive or operationally sensitive information

Placeholder boundaries:

- Recommendations are coming later.
- Layover Q&A is coming later.
- Seeded destination strategy remains future work and is not implemented here.

### DFW Lounges

Purpose:

- restricted membership-based spaces associated with the DFW Hub
- managed by Crew Leads later

Access boundaries:

- Home Base does not grant lounge access.
- Board follows do not grant lounge access.
- Self-declared profile fields do not grant lounge access.
- Lounge request/review flow is not live yet.

Placeholder boundaries:

- Flight Attendants Lounge is coming later.
- Pilots Lounge is coming later.
- New Hires Lounge is coming later.
- Request access is coming later.

### DFW Crew Picks

Purpose:

- high-signal useful content curated by admins or saved-driven over time

Placeholder boundaries:

- Useful posts are coming later.
- Layover picks are coming later.
- Lounge-visible content remains access-aware later.
- No ranking or AI surfacing is live.

## Preserved Boundaries

T10 preserves these boundaries:

- no migrations
- no runtime data mutation
- no deployment
- no posting or comments
- no search backend
- no saves or reactions
- no Crew Picks ranking
- no lounge request/review flow
- no Crew Lead panel
- no AI
- no seed layover content
- no proof uploads
- no use of self-declared profile fields as authorization truth
- no Home Base or board-follow grant of lounge access

## Validation

Source/static tests cover:

- all four new route files exist
- all four routes are dynamic/private
- all four routes use the shared private gate/audit helper
- the parent DFW Hub shell links to the section routes
- product-facing labels exist for DFW Baseboard, DFW Layovers, DFW Lounges, and
  DFW Crew Picks
- Layovers safety copy exists
- lounge access boundaries remain explicit
- no migration is added
- no proof-upload scope is introduced

Runtime validation remains pending until this branch is reviewed, merged, and
tested on the intended private beta surface.
