# FBMVP-T27B DFW Base Lightweight Baseline

Date: 2026-06-12

## Purpose

T27B adds a narrow, read-only DFW Base baseline for the DFW Hub MVP.

This gives verified DFW aviation workers a static base-orientation utility
surface without turning Base into a social feed, live operations board, or
admin-managed content system.

## Implementation Summary

Created:

- `app/app/hubs/dfw/base/page.tsx`
- `src/lib/privateApp/dfwBase.ts`
- `test/private-app/dfwBase.test.mts`

Updated:

- `src/components/privateApp/HomeHubShell.tsx`
- `test/private-app/homeHubShell.test.mts`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/hub-pivot-plan.md`

## Route

The route is:

- `/app/hubs/dfw/base`

It uses the existing DFW Hub route gate:

- `requireDfwHubRouteAccess({ route: "/app/hubs/dfw/base", section: "dfw-base" })`

The route is server-rendered and protected by the same private app / DFW Hub
access pattern as the other DFW Hub routes. It does not rely on client-side
hiding as the access boundary.

## Content Model

DFW Base content is static/config-backed in:

- `src/lib/privateApp/dfwBase.ts`

The baseline includes:

- start-here orientation reminders
- base essentials cards
- useful next links
- safety boundary copy
- a private-beta/future-state note

The base essentials cards link to existing Channels routes:

- `/app/hubs/dfw/channels/commuting-parking`
- `/app/hubs/dfw/channels/terminal-ground-logistics`
- `/app/hubs/dfw/channels/food-coffee-breaks`
- `/app/hubs/dfw/channels/new-to-dfw`

The useful next links point to:

- `/app/hubs/dfw/today`
- `/app/hubs/dfw/channels`

## Safety Boundaries

T27B intentionally avoids:

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

The route tells users to rely on official/employer sources for live operations,
security procedures, and current policies.

## Navigation

The DFW Hub overview now links its Base card to:

- `/app/hubs/dfw/base`

DFW Today and Channels navigation remain intact. T27B does not redesign the
broader app shell.

## Runtime / Migration Status

No database migration was introduced.

No runtime migration apply is needed.

No runtime data was mutated.

No broad Supabase database push is needed.

## Browser Smoke

Authenticated beta browser smoke passed after deployment and is recorded in:

- `docs/ops/fbmvp-t27b-dfw-base-browser-smoke.md`

The smoke verified:

- authenticated eligible beta/private-app user can reach `/app/hubs/dfw/base`
- unauthenticated beta access redirects to login
- public domain does not expose the private app route
- DFW Base content renders
- channel links render and point to existing DFW channel routes
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

- `docs/DATA_MODEL.md` was not updated because T27B adds no schema, runtime
  table, RPC, migration, or persistent data model change.
- Broad roadmap docs were not rewritten because the focused 05B/backlog docs
  already define Base as an MVP pillar, and this ticket only implements a
  narrow read-only baseline.

Scope Impact:

- Read-only DFW Base MVP baseline only.
- No Channels behavior was reopened except safe cross-links from DFW Base to
  existing DFW channel routes.
- Layover remains a separate MVP pillar.

Runtime Apply Docs Needed?

- No. T27B adds no migration or runtime database change.

Browser Smoke Docs Needed?

- Satisfied by `docs/ops/fbmvp-t27b-dfw-base-browser-smoke.md` after that
  record is reviewed and committed.

## Status

T27B is locally implemented.

Runtime apply is not applicable.

Browser smoke passed on beta.

UI/UX polish remains deferred.
