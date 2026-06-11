# FBMVP-T24A Real Home + DFW Hub Visual Refresh

Date: 2026-06-11

## Purpose

`FBMVP-T24A` is the narrow production UI implementation slice after the
protected T23B static prototype review. It refreshes the real private-app
Home/dashboard and the real `/app/hubs/dfw` Hub overview using the approved
post-Hub-pivot mobile direction.

This note is not a runtime smoke report and does not claim deployment.

## Scope

Implemented surfaces:

- real Home/dashboard shell in `src/components/privateApp/HomeHubShell.tsx`
- real DFW Hub overview shell in the same component
- supporting production styles in
  `src/components/privateApp/homeHubShell.module.css`
- focused source tests in `test/private-app/homeHubShell.test.mts`

The protected static prototype route remains a review artifact only and was not
used as production CSS.

## Product Behavior

Home now keeps a utility-first hierarchy:

- jmpseat header and verified/account status row
- safe global search affordance
- prominent DFW Hub hero card
- primary `Open DFW Hub` CTA
- quick actions for `Open DFW Hub`, `Browse Channels`, `Find Layover Info`,
  and `Saved`
- `Recent Useful Threads` safe empty state
- compact `Suggested Channels` rows
- Home/Hubs/Search/Saved/Me visual bottom navigation

The real DFW Hub overview now keeps a section-first hierarchy:

- DFW Hub title and image-led hero
- safe `Search within DFW` affordance
- DFW Today, Base, Layover, Channels, and Recent Useful Threads section cards
- no top-level `Open DFW Hub` CTA because the user is already in the Hub
- no top-level `Start a Thread`
- no top-level `Request a Channel`

`Request a Channel` remains secondary inside the existing DFW Channels section
path.

## Boundaries Preserved

T24A does not:

- implement DB/RPC-backed Channels
- create child `public.boards` channel rows
- add migrations
- apply migrations
- run broad `supabase db push`
- mutate runtime data
- add new content RPC calls
- add live weather, traffic, search, saves, reactions, media, or upload
  behavior
- change private app, public-domain, admin, moderation, report, verification,
  proof-upload, or RLS behavior
- rename internal Baseboard tables, RPCs, helpers, or route primitives

## Validation

Validation run during local implementation:

```bash
git diff --check
node --test test/private-app/homeHubShell.test.mts
npm run typecheck
npm run lint
npm run build
```

Nearby access/admin/domain checks were also run:

```bash
node --test test/private-app/homeHubShell.test.mts test/private-app/domainGate.test.mts test/private-app/access.test.mts test/admin/adminShell.test.mts test/admin/communityModerationAccess.test.mts
```

Local browser review was performed against `http://127.0.0.1:3024/app` and
`http://127.0.0.1:3024/app/hubs/dfw`. Both routes rendered locally with the
expected refreshed hierarchy and no login redirect in the local environment.

`npm run lint` completed with only the known unrelated warnings in
`app/lab/live-globe-proof/page.tsx` and
`src/lib/scroll/heroFlightControl.ts`.
