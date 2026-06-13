# FBMVP-T27B DFW Base Browser Smoke

Date: 2026-06-12

## Purpose

This docs-only record captures authenticated browser smoke for the T27B DFW
Base lightweight MVP baseline on the reviewed beta/private-app deployment.

## Repo State During Smoke

- Repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- Branch: `main`
- Worktree: clean
- HEAD/origin: `6d64546`

No files were changed, staged, or committed during the smoke.

## Deployment Tested

- Host: `https://beta.jmpseat.com`
- Route tested: `https://beta.jmpseat.com/app/hubs/dfw/base`

The deployment contained T27B because:

- the authenticated route rendered the new DFW Base page
- the DFW Hub overview included the `/app/hubs/dfw/base` card/link

## Authenticated Route Result

Result: passed.

An authenticated eligible private-beta session reached `/app/hubs/dfw/base`
with no login redirect and no access-restricted redirect.

The route rendered:

- `DFW Base`
- `Start here`
- `Base essentials`
- `Useful next`
- safety boundary copy
- private-beta/static future copy

No unavailable or generic error state appeared.

## Navigation Result

The DFW Hub overview had exactly one Base card/link to:

- `/app/hubs/dfw/base`

Selecting it opened the DFW Base route.

The neighboring pillar links remained intact:

- DFW Today: `/app/hubs/dfw/today`
- Channels: `/app/hubs/dfw/channels`

## Channel / Utility Cross-Link Result

DFW Base links pointed to the expected protected private-app routes:

- `/app/hubs/dfw/channels/commuting-parking`
- `/app/hubs/dfw/channels/terminal-ground-logistics`
- `/app/hubs/dfw/channels/food-coffee-breaks`
- `/app/hubs/dfw/channels/new-to-dfw`
- `/app/hubs/dfw/today`
- `/app/hubs/dfw/channels`

No posts were created.

## No-Cookie / Public-Domain Boundary

No-cookie beta request to `/app/hubs/dfw/base` returned `307` to:

- `/login?next=%2Fapp%2Fhubs%2Fdfw%2Fbase`

Public-domain checks:

- `https://jmpseat.com/app/hubs/dfw/base` returned `308` canonicalizing to
  `https://www.jmpseat.com/app/hubs/dfw/base`
- `https://www.jmpseat.com/app/hubs/dfw/base` returned `307` to `/`

The private app route was not exposed on the public domain.

## Product Boundary Checks

DFW Base did not visibly render:

- composer/posting UI
- comments/replies
- report controls
- moderation controls
- Request a Channel workflow
- AI/Jumpseat Brief behavior
- NonRev Deals
- search/saves/reactions/media
- fake live data
- fake activity/thread counts
- DFW Layover baseline functionality
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
- UUID-like internal IDs

## Unexpected Findings

None blocking.

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t27b-dfw-base-lightweight-baseline.md`
- `docs/ops/hub-pivot-plan.md`
- this smoke record

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because T27B has no schema, table, RPC,
  migration, or persistent data model change.
- Broad roadmap docs were not rewritten because this task records a focused
  browser smoke result for an already-scoped 05B MVP baseline.

Scope Impact:

- Browser-smoke documentation only.
- T27B remains read-only/static/config-backed.
- No Channels, DFW Today, Layover, posting, comment, report, moderation,
  Request a Channel, live data, external integration, or AI scope was added.

Runtime Apply Docs Needed?

- No. T27B introduced no runtime migration or database change.

Browser Smoke Docs Needed?

- Satisfied for T27B after this record is reviewed and committed.

## Status

T27B authenticated browser smoke passed.

Runtime apply is not applicable.

UI/UX polish remains deferred.
