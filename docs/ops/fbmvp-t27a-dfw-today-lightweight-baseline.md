# FBMVP-T27A DFW Today Lightweight Baseline

Date: 2026-06-12

## Purpose

T27A adds a narrow, read-only DFW Today baseline for the DFW Hub MVP.

This is intended to make the DFW Hub feel like a utility product, not only a
forum. It adds a protected `/app/hubs/dfw/today` route with curated/static
private-beta content and safe links into existing DFW Channels.

## Implementation Summary

Created:

- `app/app/hubs/dfw/today/page.tsx`
- `src/lib/privateApp/dfwToday.ts`
- `test/private-app/dfwToday.test.mts`

Updated:

- `src/components/privateApp/HomeHubShell.tsx`
- `test/private-app/homeHubShell.test.mts`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/hub-pivot-plan.md`

## Route

The route is:

- `/app/hubs/dfw/today`

It uses the existing DFW Hub route gate:

- `requireDfwHubRouteAccess({ route: "/app/hubs/dfw/today", section: "dfw-today" })`

The route is server-rendered and protected by the same private app / DFW Hub
access pattern as the other DFW Hub routes. It does not rely on client-side
hiding as the access boundary.

## Content Model

DFW Today content is static/config-backed in:

- `src/lib/privateApp/dfwToday.ts`

The baseline includes:

- quick checks
- curated utility cards
- safety boundary copy
- a private-beta/future-state note

The utility cards link to existing Channels routes:

- `/app/hubs/dfw/channels/commuting-parking`
- `/app/hubs/dfw/channels/terminal-ground-logistics`
- `/app/hubs/dfw/channels/food-coffee-breaks`
- `/app/hubs/dfw/channels/dfw-q-and-a`

## Safety Boundaries

T27A intentionally avoids:

- live operational data
- live weather, traffic, flight, or airport integrations
- airline portal login
- schedule scraping
- roster/calendar integrations
- AI-generated operational advice
- security-sensitive procedures
- checkpoint-sensitive procedures
- exact crew hotel exposure
- passenger private information
- company-confidential content
- live crew movement/location
- user posting
- comments
- reports
- moderation controls
- Request a Channel workflow
- NonRev Deals
- payments or marketplace behavior

The route tells users to rely on official/employer sources for live operations
and security procedures.

## Navigation

The DFW Hub overview now links its DFW Today card to:

- `/app/hubs/dfw/today`

Channels navigation remains intact. T27A does not redesign the broader app
shell.

## Runtime / Migration Status

No database migration was introduced.

No runtime migration apply is needed.

No runtime data was mutated.

No broad Supabase database push is needed.

## Browser Smoke

Authenticated beta browser smoke passed after deployment and is recorded in:

- `docs/ops/fbmvp-t27a-dfw-today-browser-smoke.md`

The smoke verified:

- authenticated eligible beta/private-app user can reach `/app/hubs/dfw/today`
- unauthenticated beta access redirects to login
- public domain does not expose the private app route
- DFW Today content renders
- channel links render and navigate to existing channel routes
- no live data, posting, comments, reports, moderation controls, IDs, proof
  data, storage paths, signed URLs, or sensitive aviation content are exposed

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/hub-pivot-plan.md`
- this implementation note

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because T27A adds no schema, runtime
  table, RPC, migration, or persistent data model change.
- Broad roadmap docs were not rewritten because the focused 05B/backlog docs
  already define DFW Today as an MVP pillar, and this ticket only implements a
  narrow read-only baseline.

Scope Impact:

- Read-only DFW Today MVP baseline only.
- No Channels behavior was reopened except safe cross-links from DFW Today to
  existing DFW channel routes.
- Base and Layover remain separate MVP pillars.

Runtime Apply Docs Needed?

- No. T27A adds no migration or runtime database change.

Browser Smoke Docs Needed?

- Satisfied by `docs/ops/fbmvp-t27a-dfw-today-browser-smoke.md` after that
  record is reviewed and committed.

## Status

T27A is implemented and browser-smoked on beta.

Runtime apply is not applicable.

UI/UX polish remains deferred.
