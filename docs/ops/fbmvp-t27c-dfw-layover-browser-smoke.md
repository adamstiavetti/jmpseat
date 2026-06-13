# FBMVP-T27C DFW Layover Browser Smoke

Date: 2026-06-13

Commit under smoke: `604bf31 feat: add dfw layover baseline`

Target host: `https://beta.jmpseat.com`

Target route: `/app/hubs/dfw/layover`

## Result

Passed.

Authenticated browser smoke verified the deployed DFW Layover lightweight MVP
baseline after `604bf31`.

## Repo State During Smoke

- Repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- Branch: `main`
- Worktree: clean
- HEAD/origin: `604bf31`
- Latest commit: `604bf31 feat: add dfw layover baseline`

No files were changed, staged, or committed during the browser smoke.

## Deployment Tested

Host tested:

- `https://beta.jmpseat.com`

Route tested:

- `https://beta.jmpseat.com/app/hubs/dfw/layover`

The deployment contained T27C because:

- the authenticated route rendered the new DFW Layover page
- the DFW Hub overview linked to `/app/hubs/dfw/layover`
- the Home quick action pointed to `/app/hubs/dfw/layover`

## Authenticated Route Result

Passed.

An authenticated eligible private-beta session reached
`/app/hubs/dfw/layover` without a login redirect or access-restricted redirect.

The route rendered:

- `DFW Layover`
- `Start here`
- `Layover essentials`
- `Useful next`
- `Safety boundary`
- `Private beta baseline`
- `No live tracking or hotel directory.`

No unavailable or generic error state appeared.

## Navigation Result

Passed.

- The DFW Hub overview had exactly one Layover card/link to
  `/app/hubs/dfw/layover`.
- Selecting the DFW Hub Layover card opened `/app/hubs/dfw/layover`.
- The DFW Today link remained intact at `/app/hubs/dfw/today`.
- The DFW Base link remained intact at `/app/hubs/dfw/base`.
- The Channels link remained intact at `/app/hubs/dfw/channels`.
- The Home quick action `Find Layover Info` pointed to
  `/app/hubs/dfw/layover`.
- Selecting the Home quick action opened `/app/hubs/dfw/layover`.

## Channel And Utility Cross-Links

Passed.

DFW Layover links pointed to the expected protected private-app routes:

- `/app/hubs/dfw/channels/food-coffee-breaks`
- `/app/hubs/dfw/channels/dfw-layover-local`
- `/app/hubs/dfw/channels/terminal-ground-logistics`
- `/app/hubs/dfw/today`
- `/app/hubs/dfw/base`
- `/app/hubs/dfw/channels`

No posts were created.

## No-Cookie And Public-Domain Boundaries

Passed.

- No-cookie beta request to `/app/hubs/dfw/layover` returned `307` to
  `/login?next=%2Fapp%2Fhubs%2Fdfw%2Flayover`.
- `https://jmpseat.com/app/hubs/dfw/layover` returned `308` canonicalizing to
  `https://www.jmpseat.com/app/hubs/dfw/layover`.
- `https://www.jmpseat.com/app/hubs/dfw/layover` returned `307` to `/`.
- The private app route was not exposed on the public domain.

## Product Boundary Checks

Passed.

DFW Layover did not visibly render:

- exact crew hotel details or hotel directory behavior
- crew tracking/live-location behavior
- public nearby crew behavior
- dating/swiping/nightlife-primary behavior
- composer/posting UI
- comments/replies
- report controls
- moderation controls
- Request a Channel workflow
- AI/Jumpseat Brief behavior
- NonRev Deals
- search/saves/reactions/media
- fake live data
- fake activity counts
- fake thread counts
- user-facing Baseboard label

The page includes safety copy saying it avoids exact crew hotel exposure and
live location. It does not expose actual crew hotels, crew locations, or
tracking.

## Safety And Privacy Checks

Passed.

No visible exposure of:

- live flight loads
- live operational status
- airport/security-sensitive procedures
- exact crew hotel details
- passenger private information
- company-confidential content
- airline portal login
- schedule scraping
- crew live location
- exact real-time crew movement
- AI-generated operational advice
- external live data integration
- board/base/parent IDs
- author/user IDs
- reporter identity
- verification/proof data
- storage paths
- signed URLs
- UUID-like internal IDs

## Unexpected Findings

None blocking.

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t27c-dfw-layover-lightweight-baseline.md`
- `docs/ops/hub-pivot-plan.md`
- this browser smoke record

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because T27C adds no schema, runtime
  table, RPC, migration, or persistent data model change.
- Broad roadmap docs were not rewritten because this smoke only records
  deployment verification for the focused T27C baseline.

Scope Impact:

- Browser-smoke documentation only.
- T27C remains read-only/static/config-backed.
- No runtime data, Channels behavior, DFW Today behavior, DFW Base behavior, or
  future Layover scope was changed.

Runtime Apply Docs Needed?

- No. T27C has no migration or runtime database change.

Browser Smoke Docs Needed?

- Satisfied for T27C after this record is reviewed and committed.

## Status

T27C authenticated browser smoke passed.

Runtime apply is not applicable.

UI/UX polish remains deferred.
