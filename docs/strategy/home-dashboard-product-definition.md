# Home Dashboard Product Definition

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Canonical Definition

The Home Dashboard is the first private-app screen after app-entry gates. It is
not a generic social feed.

The Home Dashboard is a utility dashboard that helps verified aviation workers
quickly reach the most relevant base, board, saved, lounge, and high-signal
crew content.

The dashboard should feel like a practical operating surface for "what do I
need from jmpseat right now?" rather than a stream of undifferentiated posts.

Use `docs/strategy/hub-board-taxonomy.md` as the canonical taxonomy for Hubs,
Baseboards, Layovers, Lounges, and Crew Picks when deciding what Home cards or
Board destinations should open.

Use `docs/strategy/seeded-layovers-editorial-model.md` as the canonical
definition for how seeded Layovers destinations should be structured once
layover utility expands beyond the DFW Hub shell.

The first implementation slice is documented in
`docs/ops/fbmvp-t08-home-hub-shell.md`: a read-only `/app` Home Dashboard shell
and `/app/hubs/dfw` DFW Hub shell. That slice does not implement dashboard
mutations, Start with DFW mutations, posting, saves, search backend, lounge
request/review flows, Crew Lead tooling, seed content, or AI.

## 2. Dashboard Hierarchy

Canonical dashboard hierarchy:

1. Persistent/global search affordance
2. Home Base / Hub
3. Crew Picks
4. Following
5. Your Lounges
6. Saved

Search is not a normal content section. Search should be visually prominent
and persistent near the top because fast retrieval is core to jmpseat.

Home Base remains the first actual dashboard section.

## 3. Search

The search affordance should help the user quickly retrieve useful aviation
worker knowledge across content they are allowed to access.

Search should eventually cover:

- Base Boards
- Layover Boards
- seeded Layovers destinations
- board intel/wiki entries
- posts
- comments/replies
- saved/useful content
- restricted content only when the user has access

Search must remain access-aware. It must not reveal restricted lounge content,
private board content, or sensitive operational information to users who lack
access.

Search implementation is out of scope for this definition.

## 4. Home Base Section

The Home Base section is the first actual dashboard section.

For users with Home Base set, the Home Base / Hub card should preview the
selected Baseboard/Hub and open the Baseboard surface.

For the initial DFW-only rollout, a user who starts with DFW should see a DFW
Hub / Baseboard card. Tapping it should open the DFW Baseboard surface.

For users with no Home Base, the dashboard must not pretend the user has a DFW
Home Base. No Home Base remains a valid personalization state.

## 5. Crew Picks

Crew Picks are not generic trending posts.

Crew Picks are useful posts, guides, answers, updates, or similar high-signal
items surfaced because they are likely to help aviation workers get something
done or understand something important.

Saved activity is the primary utility signal for Crew Picks over time.

Early DFW launch Crew Picks may be manually/admin curated to solve cold start.

Later Crew Picks may combine:

- admin picks
- most-saved content
- frequently referenced posts
- helpful signals
- AI-assisted/admin-reviewed surfacing

AI must not auto-publish and must not become source of truth. AI-assisted
surfacing or summaries must remain server-side/admin-controlled and reviewed
before publication when sensitive, operationally risky, or user-facing content
is involved.

Dashboard preview:

- show 3-5 useful posts, guides, answers, or updates
- prefer saved/admin-curated utility content over generic popularity
- keep empty-state copy practical and non-marketing

Destination:

- tapping an item opens the post, guide, answer, or update directly
- `View All` opens a Crew Picks list when that surface exists

Crew Picks ranking implementation is out of scope for this definition.

## 6. Following

Following initially means followed boards.

Following does not initially mean followed users unless a later product
decision explicitly approves user follows in the active implementation lane.

Dashboard preview:

- show followed Baseboard and Layovers surfaces
- later, show followed Hubs only if a separate Hub-follow product decision is
  approved
- later, show restricted lounges only when the user has access
- if empty, show a useful empty state instead of blocking app access

Destination:

- tapping a board opens that board
- `View All` opens a Following page when that surface exists

Following a board does not grant restricted access.

## 7. Your Lounges

Your Lounges is the future restricted-space section for joined, pending, or
available Verified Lounges.

Use `docs/strategy/verified-lounge-access-model.md` as the canonical product
definition for Verified Lounge access before implementing lounge membership,
request, or Crew Lead tooling.

Dashboard preview:

- show joined lounges when membership exists
- later, show pending access requests when that model exists
- later, show available lounges only when discovery rules allow it

Destination:

- tapping a joined lounge opens that lounge
- pending and available states should route to the appropriate lounge access
  area when those surfaces exist

Lounge membership, access requests, community-admin approvals, and lounge UI
are out of scope for this definition.

## 8. Saved

Saved is the user's personal knowledge library.

Dashboard preview:

- show recently saved posts, guides, answers, updates, or board-intel items
- if empty, present saved content as a utility feature without implying the
  user has missed a required setup step

Destination:

- tapping an item opens the saved item directly
- `View All` opens the saved library

Saved implementation is out of scope for this definition.

## 9. DFW-Start State

For users who start with DFW, the Home Dashboard should use this shape:

1. Search jmpseat
2. DFW Hub / Baseboard card
3. Crew Picks
4. Following
5. Your Lounges
6. Saved

This state reflects the user's explicit DFW-start choice. It must not imply
that DFW proves the user's employment, airline, role, base assignment, or
restricted-board eligibility.

## 10. Skip-For-Now State

For users who skip Home Base during the initial DFW-only rollout, the Home
Dashboard should use this shape:

1. Search jmpseat
2. Welcome to jmpseat
3. DFW is live first
4. Start with DFW CTA
5. Crew Picks
6. Following empty state
7. Saved empty state

Skipping creates no Home Base preference and requires no automatic board
follow.

The dashboard must not show a fake DFW Home Base assignment for users who
skipped.

## 11. Bottom Navigation Recommendation

Recommended bottom navigation:

- Home
- Boards
- Search
- Saved
- Profile

Search should appear in bottom navigation even though a global search
affordance is also prominent near the top of Home. The top affordance supports
fast retrieval from the first screen; the bottom navigation gives Search a
stable app-level destination.

## 12. Out Of Scope

This definition does not implement:

- dashboard UI
- onboarding UI
- posts/comments
- saves
- Crew Picks ranking
- lounge membership/access requests
- lounge UI
- search
- AI surfacing or summaries
- generic social feed
- proof uploads

Moderation, reporting, and admin controls remain required before broad real
member-generated content exposure.
