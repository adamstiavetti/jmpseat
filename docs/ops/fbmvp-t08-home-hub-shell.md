# FBMVP-T08 Home Dashboard And DFW Hub Shell

Date: 2026-06-09

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T08` adds the first read-only private-app Home Dashboard shell and DFW
Hub destination shell.

This is a web UI shell only. It does not add schema, migrations, deployment,
runtime Supabase mutation, dashboard mutations, posting, comments, saves,
search backend, lounge request/review flows, Crew Lead panel tooling, AI, or
seed content.

## Routes

Implemented routes:

- `/app`
- `/app/hubs/dfw`

Both routes preserve the existing private app gate and server-side security
event audit path.

`/app` becomes the read-only Home Dashboard shell after app-entry gates pass.
It uses the T06 Home Base helper only to read optional Home Base state. Missing
Home Base remains valid and does not block app entry.

`/app/hubs/dfw` is a read-only DFW Hub shell. It shows the intended Hub
surfaces without implementing their content or mutation behavior.

## Product-Facing Labels

Use the current product-facing taxonomy from
`docs/strategy/hub-board-taxonomy.md`:

- `Hub`
- `Baseboard`
- `Layovers`
- `Lounges`
- `Crew Picks`

The implementation may still use existing internal table names and board type
keys such as `base_board`, `layover_board`, and `verified_lounge`.

## Home Dashboard Shape

The Home Dashboard shell follows the product definition in
`docs/strategy/home-dashboard-product-definition.md`:

1. Search jmpseat
2. Home Base / Hub
3. Crew Picks
4. Following
5. Your Lounges
6. Saved

Search is a prominent retrieval affordance, not a full search implementation.

Crew Picks are described as saved-driven/admin-curated useful content, not
generic trending. Ranking is not implemented.

Following initially means followed boards. User follows are not implemented.

Your Lounges remains membership-gated future state. Request and review flows
are not implemented.

Saved remains a personal knowledge-library placeholder. Saves are not
implemented.

## Initial DFW-Only States

For users with DFW Home Base:

- show DFW Hub / Home Base card
- route the card to `/app/hubs/dfw`
- show DFW Baseboard as a followed-board placeholder
- state that Home Base is personalization only, not authorization truth

For users with no Home Base:

- show "Welcome to jmpseat"
- show "DFW Hub is live first"
- show a disabled "Start with DFW" placeholder
- show a clear no-Home-Base state
- do not fake-assign DFW Home Base
- do not require an automatic board follow

The actual Start with DFW mutation path is not implemented by T08.

## Safety Boundaries

T08 preserves these boundaries:

- Home Base does not grant lounge access.
- Board follows do not grant lounge access.
- Self-declared profile fields are not authorization truth.
- Work Email verification remains the broad app eligibility gate.
- Restricted lounge membership remains the future restricted-content access
  truth.
- No exact crew hotel exposure.
- No live crew location tracking.
- No passenger/private information.
- No airport security procedures.
- No operationally sensitive information.
- No proof uploads.

## Validation

Source/static tests cover:

- Home Dashboard hierarchy and labels
- DFW Hub shell taxonomy labels
- skip-for-now/no-Home-Base state
- private gate/audit preservation on the DFW Hub route
- no backend mutation scope
- no T08 migration
- no proof-upload scope

Full runtime validation remains pending until this branch is reviewed, merged,
deployed, and smoke-tested on the intended private beta surface.
