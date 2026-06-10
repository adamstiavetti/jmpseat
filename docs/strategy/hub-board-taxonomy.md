# Hub / Board Taxonomy

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This note defines the canonical product taxonomy for Hubs, Baseboards,
Layovers, Lounges, and Crew Picks before further board discovery, dashboard,
search, posting, or seed-content implementation.

The goal is to keep navigation, data modeling, and future UI language aligned:
a Hub is the user-facing airport/location container, while the surfaces inside
that Hub provide community, utility, restricted access, and curated knowledge.

This is a product-definition note only. It does not implement schema, UI,
content, AI, or runtime behavior.

## 2. Product-Facing Terms

Use these labels in current product planning and future UI copy:

- `Hub`: top-level airport/location container, such as DFW Hub.
- `Baseboard`: primary based-there community surface.
- `Layovers`: crew layover utility and discussion.
- `Lounges`: restricted membership-based spaces.
- `Crew Picks`: high-signal saved/admin-curated useful content.

Avoid user-facing `Base Board` and `Layover Guide` unless the copy is
historical or explicitly discussing internal/database terms.

Implementation can use whatever internal model is safest. Current database
terms such as `base_board`, `layover_board`, and `verified_lounge` remain valid
internal classifications.

## 3. Hub

A Hub is the user-facing top-level airport or location container.

Examples:

- DFW Hub
- ATL Hub
- MIA Hub

A Hub is not itself a discussion board.

A Hub organizes related community and utility surfaces for an airport,
location, or aviation base area.

Canonical DFW Hub contents:

- Baseboard
- Layovers
- Lounges
- Crew Picks

## 4. Relationship Model

Canonical relationship:

```text
Hub
  |- Baseboard
  |- Layovers
  |- Lounges
  `- Crew Picks
```

The Hub is the parent/location container.

Baseboard, Layovers, Lounges, and Crew Picks are surfaces within or under a
Hub.

Boards should not contain other boards by default.

Layovers are not children of Baseboard.

Lounges are not children of Baseboard.

Avoid recursive board structures. If future UI visually groups surfaces under
a Hub, that grouping should not imply that one board is the parent database
owner of another board.

## 5. Baseboard

Purpose:

- community surface for aviation workers based at that location
- Home Base-oriented discussion and Q&A
- base-specific posts, questions, Crew Picks, and useful content

Examples:

- DFW Baseboard
- ATL Baseboard

Rules:

- Home Base preference primarily points to the user's active Baseboard/Hub.
- Baseboard remains more important than Layovers in the Home Dashboard.
- Baseboard does not grant lounge access.

## 6. Layovers

Purpose:

- crew layover utility and discussion for people passing through that airport
  or location
- food
- coffee
- gyms
- transportation basics
- quick recommendations
- weather basics
- general area tips
- Q&A

Use `Layovers` as the user-facing label because it is clear and familiar.

Examples:

- DFW Layovers
- ATL Layovers
- MIA Layovers

Rules:

- Layovers are useful to crews passing through, not only people based there.
- Layovers should be searchable and discoverable.
- Layovers can be seeded before a full Hub/Baseboard is launched.
- Seeded Layovers are bridge content, not throwaway content.
- Seeded Layovers can later become part of a full Hub when demand justifies
  launching that Hub.
- AI may assist drafting or researching layover recommendations later, but only
  as admin-reviewed content. AI must not auto-publish, become source of truth,
  or recommend unsafe/sensitive content without review.

Safety boundaries:

- no exact crew hotel locations
- no live crew location tracking
- no passenger/private information
- no private company information
- no airport security procedures
- no operationally sensitive information
- no exact current meetup/location tied to crew identity

## 7. MVP Seeded Layovers Strategy

DFW Hub is the full MVP Hub.

For MVP, jmpseat should add or plan selected seeded Layovers for common DFW
crew destinations so DFW-based users get utility outside DFW.

These seeded destinations are not full Hubs yet. They are lightweight layover
surfaces that can later graduate into full Hubs.

Initial MVP shape:

```text
DFW Hub
  |- Baseboard
  |- Layovers
  |- Lounges
  `- Crew Picks

Selected seeded Layovers destinations
  |- common DFW crew layover destination
  |- common DFW crew layover destination
  `- common DFW crew layover destination
```

Future expansion example:

```text
MIA Layovers
```

Possible later MIA full Hub:

```text
MIA Hub
  |- Baseboard
  |- Layovers
  |- Lounges
  `- Crew Picks
```

This lets jmpseat provide real utility for DFW-based workers without pretending
every useful layover destination is already a full launched Hub.

This task does not create seeded layover content.

`FBMVP-T08` adds the first read-only DFW Hub destination shell at
`/app/hubs/dfw`. That shell demonstrates the taxonomy labels but does not
create seeded Layovers content, board discovery, posting, saves, search, lounge
request/review flows, or Crew Picks ranking.

## 8. Lounges

Purpose:

- restricted spaces associated with a Hub
- membership-based access
- managed by Crew Leads
- role-, airline-, or criteria-based groups

Examples:

- DFW Flight Attendants Lounge
- DFW Pilots Lounge
- DFW New Hires Lounge

Rules:

- Lounge access is controlled by lounge membership.
- Home Base does not grant lounge access.
- Board follows do not grant lounge access.
- Self-declared profile fields do not grant lounge access.

Use `verified-lounge-access-model.md` as the controlling access model for
lounge request lifecycle, Crew Lead scope, privacy boundaries, and audit
expectations.

## 9. Crew Picks

Purpose:

- high-signal saved/admin-curated useful content
- useful Baseboard posts
- Layovers content
- other accessible content that helps aviation workers get something done

Saved activity is the primary utility signal for Crew Picks over time.

Early MVP Crew Picks may be manually/admin curated.

Crew Picks can include content from Baseboard, Layovers, or other accessible
surfaces. Crew Picks must remain access-aware and must not reveal restricted
Lounge content to users who lack access.

## 10. Navigation And Home Relationship

Home Dashboard remains:

1. Search
2. Home Base / Hub
3. Crew Picks
4. Following
5. Your Lounges
6. Saved

Hub/Boards discovery should eventually organize around:

- DFW Hub
- seeded Layovers destinations
- future Hubs as launched

Following:

- users may follow Hubs later
- users may follow Baseboard/Layovers surfaces if implementation supports it
- lounge access remains membership-based, not follow-based

Search, Home, and board discovery must remain access-aware. They must not
reveal restricted Lounge content to users who lack access.

## 11. Data Model Implications

Current T05 model:

- `bases` are the closest current data-model anchor for Hub-like airport/base
  containers.
- `boards` are user-facing spaces.
- `board_types` classify board behavior.
- `base_board`, `layover_board`, and `verified_lounge` are the initial board
  types.

Product-facing Hub language can be introduced in UI/navigation before a
separate `hubs` table exists. A future migration may introduce explicit Hub
records if the product needs location containers that are broader than
aviation bases.

Until then, avoid treating `boards.parent_board_id` as the Hub model. Boards
should not contain other boards for the current product taxonomy.

## 12. Out Of Scope

This taxonomy note does not implement:

- migrations
- UI
- board discovery
- search
- posting
- lounge request/review flows
- Crew Lead panel UI
- AI
- proof uploads
- seed content creation

This note defines product language and hierarchy only.
