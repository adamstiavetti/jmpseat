# FBMVP-T26D Channel Composer UUID Validation Fix

Date: 2026-06-12

## Purpose

This record captures the local app-side fix for the T26D/T26C Channels defect
found during authenticated browser smoke.

The defect was not in runtime SQL. The create and detail paths used a malformed
UUID validation regex that rejected the valid post UUID returned by the create
RPC and present in the selected-channel thread list.

Known safe smoke post to reuse after deployment:

- channel: `dfw-q-and-a`
- post UUID: `7f93f9a9-3dd1-4718-979a-2acc8194a999`
- title: `DFW Q&A smoke test thread`
- runtime status/visibility: `published` / `board`

## Root Cause

Malformed app-side UUID regex existed in:

- `src/lib/community/hubChannelActions.ts`
- `src/lib/community/hubChannels.ts`

The bad pattern omitted the final hyphen between the UUID fourth and fifth
groups:

- bad: `^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$`
- fixed: `^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`

This explains both smoke failures:

- T26D create inserted the post, then rejected the returned valid UUID before
  redirecting to detail.
- T26C detail rejected the same valid UUID before calling
  `public.get_open_hub_channel_post(...)`.

T26B thread-list reads still worked because the selected-channel list route did
not validate the post UUID before rendering the row.

## Local Fix

The fix adds one shared app-side helper:

- `src/lib/community/uuid.ts`

Both channel paths now import the same `isUuid(...)` helper:

- `src/lib/community/hubChannelActions.ts`
- `src/lib/community/hubChannels.ts`

This keeps selected-channel create and detail UUID validation aligned with the
existing working board-post UUID pattern.

## Tests

Focused tests now assert that the real smoke UUID is accepted by both paths and
that invalid IDs are still rejected safely:

- `test/community/hubChannelPostCreate.test.mts`
- `test/community/hubChannelPostDetail.test.mts`

The T26D docs-state expectations were also updated so tests reflect the current
truth:

- runtime apply is complete
- browser smoke failed/partially passed
- follow-up browser smoke remains needed after deployment
- T26C happy path failed for the created safe post before this local fix

## Runtime / Deployment Boundary

No runtime migration is needed.

No Supabase SQL was changed or applied.

No runtime post should be created, deleted, or modified for this fix. The
existing safe smoke post can be reused for browser re-smoke after deployment.

## Re-Smoke Needed

After deployment, browser re-smoke should verify:

- direct detail route renders the existing safe post
- selected-channel thread-list row click reaches the detail route
- a future create flow redirects to detail rather than
  `?post=dfw_channel_post_failed`
- no comments, reports, moderation controls, fake counts, IDs, proof/storage
  fields, or sensitive content are exposed

Do not claim T26D or T26C browser smoke is fixed until the deployed app is
verified.

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26d-channel-composer-uuid-validation-fix.md`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`

Docs not updated / why:

- Runtime-apply docs were not updated because no runtime migration or SQL apply
  is needed.
- Broad roadmap docs were not updated because this is a narrow app-side bugfix.

Scope impact:

- UUID validation fix only.
- No app routes, runtime SQL, migrations, access gates, reporting/moderation
  behavior, or UI scope changed.

Runtime apply docs needed?

- No.

Browser smoke docs needed?

- Yes, after deployment/re-smoke.
