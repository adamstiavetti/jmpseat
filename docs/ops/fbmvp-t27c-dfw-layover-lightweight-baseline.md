# FBMVP-T27C DFW Layover Lightweight Baseline

Date: 2026-06-12

## Purpose

T27C adds a narrow, read-only DFW Layover baseline for the DFW Hub MVP.

This gives verified aviation workers a static layover/local utility surface for
DFW without turning Layover into a public travel blog, hotel-tracking product,
crew-location surface, social feed, or live operations board.

## Implementation Summary

Created:

- `app/app/hubs/dfw/layover/page.tsx`
- `src/lib/privateApp/dfwLayover.ts`
- `test/private-app/dfwLayover.test.mts`

Updated:

- `src/components/privateApp/HomeHubShell.tsx`
- `test/private-app/homeHubShell.test.mts`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/hub-pivot-plan.md`

## Route

The route is:

- `/app/hubs/dfw/layover`

It uses the existing DFW Hub route gate:

- `requireDfwHubRouteAccess({ route: "/app/hubs/dfw/layover", section: "dfw-layover" })`

The route is server-rendered and protected by the same private app / DFW Hub
access pattern as the other DFW Hub routes. It does not rely on client-side
hiding as the access boundary.

The older `/app/hubs/dfw/layovers` placeholder remains in place as legacy shell
context, but DFW Hub navigation now points to the singular MVP baseline route.

## Content Model

DFW Layover content is static/config-backed in:

- `src/lib/privateApp/dfwLayover.ts`

The baseline includes:

- start-here layover reminders
- layover essentials cards
- useful next links
- safety boundary copy
- a private-beta/future-state note

The layover essentials cards link to existing Channels routes:

- `/app/hubs/dfw/channels/food-coffee-breaks`
- `/app/hubs/dfw/channels/dfw-layover-local`
- `/app/hubs/dfw/channels/terminal-ground-logistics`

The useful next links point to:

- `/app/hubs/dfw/today`
- `/app/hubs/dfw/base`
- `/app/hubs/dfw/channels`

## Safety Boundaries

T27C intentionally avoids:

- exact crew hotel exposure
- public nearby crew tracking
- live crew location
- live operational data
- live weather, traffic, flight, or airport integrations
- airline portal login
- schedule scraping
- roster/calendar integrations
- AI-generated operational advice
- security-sensitive procedures
- checkpoint-sensitive procedures
- passenger private information
- company-confidential content
- user posting
- comments
- reports
- moderation controls
- Request a Channel workflow
- NonRev Deals
- payments or marketplace behavior
- dating, swiping, or nightlife-primary behavior

The route tells users to rely on official/employer sources for duty/rest timing,
live operations, security procedures, and current policies.

## Navigation

The DFW Hub overview now links its Layover card to:

- `/app/hubs/dfw/layover`

The Home quick action for layover info also points to:

- `/app/hubs/dfw/layover`

DFW Today, DFW Base, and Channels navigation remain intact. T27C does not
redesign the broader app shell.

## Runtime / Migration Status

No database migration was introduced.

No runtime migration apply is needed.

No runtime data was mutated.

No broad Supabase database push is needed.

## Browser Smoke

Authenticated beta browser smoke passed after deployment and is recorded in
`docs/ops/fbmvp-t27c-dfw-layover-browser-smoke.md`.

The smoke should verify:

- authenticated eligible beta/private-app user can reach `/app/hubs/dfw/layover`
- unauthenticated beta access redirects to login
- public domain does not expose the private app route
- DFW Layover content renders
- channel links render and point to existing DFW channel routes
- DFW Today, DFW Base, and Channels links render
- no exact crew hotels, live location, live operations data, posting, comments,
  reports, moderation controls, IDs, proof data, storage paths, signed URLs, or
  sensitive aviation content are exposed

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/hub-pivot-plan.md`
- this implementation note

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because T27C adds no schema, runtime
  table, RPC, migration, or persistent data model change.
- Broad roadmap docs were not rewritten because the focused 05B/backlog docs
  already define Layover as an MVP pillar, and this ticket only implements a
  narrow read-only baseline.

Scope Impact:

- Read-only DFW Layover MVP baseline only.
- No Channels behavior was reopened except safe cross-links from DFW Layover to
  existing DFW channel routes.
- DFW Today and DFW Base remain separate MVP pillars.

Runtime Apply Docs Needed?

- No. T27C adds no migration or runtime database change.

Browser Smoke Docs Needed?

- Satisfied by `docs/ops/fbmvp-t27c-dfw-layover-browser-smoke.md` after review
  and commit.

## Status

T27C is locally implemented and browser-smoked on beta.

Runtime apply is not applicable.

Browser smoke passed after deployment.

UI/UX polish remains deferred.
