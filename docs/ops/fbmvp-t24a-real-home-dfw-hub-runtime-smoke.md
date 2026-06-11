# FBMVP-T24A Real Home + DFW Hub Runtime Smoke

Date: 2026-06-11

## Purpose

This note records the deployed beta/private-app browser smoke for
`FBMVP-T24A: Real Home + DFW Hub Visual Refresh`.

This is a docs-only runtime/browser smoke record. It does not deploy, mutate
runtime data, apply migrations, run a broad database push, or change app code.

## Commit Reviewed

- `12df45b feat: refresh home and dfw hub surfaces`

## Browser / Deployment Context

- Host reviewed: `beta.jmpseat.com`
- Routes reviewed:
  - `/app`
  - `/app/hubs/dfw`
- Account/access state used: authenticated beta/private app user as applicable
  from the user-reported manual browser review.
- Untested access states:
  - signed-out access was not tested as part of this T24A smoke record.
  - non-beta authenticated access was not tested as part of this T24A smoke
    record.
  - admin/reviewer/operator access behavior was not retested as part of this
    T24A smoke record.

## Runtime Smoke Result

Decision: runtime smoke passed with non-blocking visual polish.

The deployed beta UI still needs visual polish, and the user may make those
visual tweaks later. No functionality blocker was observed. No further T24A
implementation patch is required before moving forward.

Remaining issues are visual polish only and can be handled later by the user or
in a dedicated polish pass.

## Home `/app` Review

User-reported deployed beta review result:

- Home rendered successfully.
- Home points users toward DFW Hub.
- The DFW Hub hero and `Open DFW Hub` CTA are present.
- Quick actions render.
- Recent Useful Threads renders.
- Suggested Channels renders.
- Remaining visual improvement needs are non-blocking.

## DFW Hub `/app/hubs/dfw` Review

User-reported deployed beta review result:

- DFW Hub rendered successfully.
- The Hub is section-first, not raw-feed-first.
- DFW Today, Base, Layover, Channels, and Recent Useful Threads are present.
- No functionality blocker was observed.
- Remaining visual improvement needs are non-blocking.

## Scope / Safety Confirmation

This smoke record confirms the intended T24A scope boundary:

- no runtime mutation was performed for this docs record.
- no migration was created or applied for this docs record.
- no broad `supabase db push` was run for this docs record.
- no deploy action was associated with this docs record.
- T24A did not introduce DB/RPC-backed Channels.
- Search, Saved, DFW Today, and Base remain placeholder/non-functional
  affordances where no implementation exists.
- DB/RPC-backed Channels remain deferred until explicitly scoped.

## Known Non-Blocking Visual Polish

- The UI still needs some visual refinement.
- The user may make later individual visual tweaks.
- These polish items should not block next implementation planning unless a
  functional issue appears.

## Next Recommended Step

Move to next implementation planning. Do not keep polishing T24A unless a
functional issue appears.

Next likely decision:

- DFW Channels Foundation planning; or
- a small Home/Hub polish ticket if the user explicitly wants polish before new
  functionality.

DB/RPC-backed Channels must remain explicitly scoped before implementation.
