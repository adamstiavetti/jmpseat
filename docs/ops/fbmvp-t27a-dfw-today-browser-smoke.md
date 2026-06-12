# FBMVP-T27A DFW Today Browser Smoke

Date: 2026-06-12

## Purpose

This docs-only record captures authenticated browser smoke for the
FBMVP-T27A DFW Today lightweight MVP baseline.

This record does not edit app code, edit migrations, edit tests, mutate runtime
data, apply migrations, run broad Supabase database push, deploy, stage files,
or commit.

## Repo State During Smoke

- Repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- Branch: `main`
- Worktree: clean
- HEAD/origin: `de92bab`
- Latest commit: `de92bab feat: add dfw today baseline`
- No files were changed, staged, or committed during smoke.

## Deployment Tested

- Host: `https://beta.jmpseat.com`
- Route tested: `https://beta.jmpseat.com/app/hubs/dfw/today`

Deployment contained T27A because:

- the authenticated route rendered the new DFW Today page
- the DFW Hub overview included the new `/app/hubs/dfw/today` card/link

## Authenticated Route Result

Result: passed.

An authenticated eligible private-beta session reached:

- `/app/hubs/dfw/today`

Observed:

- no login redirect
- no access-restricted redirect
- `DFW Today` title rendered
- static read-only DFW Today content rendered
- quick checks rendered
- `Useful today` rendered
- utility cards rendered
- safety boundary copy rendered
- future/static baseline copy rendered
- no unavailable or generic error state appeared

## Navigation Result

The DFW Hub overview contained the DFW Today card/link with:

- `href="/app/hubs/dfw/today"`

The Channels card/link remained intact at:

- `/app/hubs/dfw/channels`

Activating the focused DFW Today card opened:

- `/app/hubs/dfw/today`

Note: browser automation's initial pointer click focused the DFW Today card
without changing URL, but keyboard activation of the focused link navigated
correctly. The href and route behavior were verified.

## Channel Cross-Link Result

DFW Today links pointed to the expected protected private app routes:

- `/app/hubs/dfw/channels/commuting-parking`
- `/app/hubs/dfw/channels/terminal-ground-logistics`
- `/app/hubs/dfw/channels/food-coffee-breaks`
- `/app/hubs/dfw/channels/dfw-q-and-a`

No posts were created.

## No-Cookie / Public-Domain Boundary

No-cookie beta request:

- `https://beta.jmpseat.com/app/hubs/dfw/today`

returned:

- `307` to `/login?next=%2Fapp%2Fhubs%2Fdfw%2Ftoday`

Public apex request:

- `https://jmpseat.com/app/hubs/dfw/today`

canonicalized to:

- `https://www.jmpseat.com/app/hubs/dfw/today`

Public `www` request:

- `https://www.jmpseat.com/app/hubs/dfw/today`

returned:

- `307` to `/`

The private app route was not exposed on the public domain.

## Product Boundary Checks

DFW Today did not render:

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
- DFW Base or Layover baseline functionality
- user-facing Baseboard label

## Safety / Privacy Checks

No visible exposure of:

- live flight loads
- live operational status
- airport/security-sensitive procedures
- exact crew hotel exposure
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

## Unexpected Findings

None blocking.

Browser automation's initial pointer click focused the DFW Today card without
changing URL; keyboard activation worked, and href/route behavior were
verified.

## Status

T27A authenticated browser smoke passed.

T27A remains read-only and static/config-backed.

No runtime migration was needed.

UI/UX polish remains deferred.

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t27a-dfw-today-lightweight-baseline.md`
- `docs/ops/hub-pivot-plan.md`
- this browser-smoke record

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because no schema, table, RPC,
  migration, or persistent data model changed.
- Broad roadmap docs were not rewritten because this record only changes the
  smoke status for an already-scoped focused 05B ticket.

Scope Impact:

- Browser-smoke documentation only.
- No app behavior changed in this docs task.
- Base and Layover remain separate MVP pillar work.

Runtime Apply Docs Needed?

- No. T27A has no runtime migration or database apply.

Browser Smoke Docs Needed?

- Satisfied for T27A after this record is reviewed and committed.
