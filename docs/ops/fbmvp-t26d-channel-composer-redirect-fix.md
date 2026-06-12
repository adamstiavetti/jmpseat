# FBMVP-T26D Channel Composer Redirect Fix

Date: 2026-06-12

## Purpose

This record documents the local app-side fix for the remaining `FBMVP-T26D`
selected-channel create redirect defect.

The final authenticated browser smoke in
`docs/ops/fbmvp-t26d-final-create-browser-smoke.md` showed that the create RPC
inserted a valid child-channel post, T26B list reads rendered it, and T26C detail
reads rendered it, but the browser stayed on the selected-channel page after
submit instead of navigating to the created post detail route.

## Root Cause Addressed

The remaining issue was app-side post-submit navigation handling, not runtime SQL
or channel data.

The server action already created the post and knew the correct safe detail URL,
but relying only on a success `redirect()` did not land the authenticated browser
on `/app/hubs/dfw/channels/[channelSlug]/[postId]` during smoke.

## Local Fix

The local patch keeps the existing runtime RPC unchanged and changes the browser
navigation contract:

- `createDfwHubChannelPostAction(...)` keeps access checks, field validation, and
  the `create_open_hub_channel_post(...)` RPC server-side.
- On success, the action returns a narrow safe result:
  - `status: "created"`
  - `href: "/app/hubs/dfw/channels/[channelSlug]/[postId]"`
- Invalid input and RPC/create failures return safe failure states that keep the
  user on the selected-channel page.
- A small client composer wrapper uses the server action with action state and
  calls `router.push(href)` only when the server returns the safe created result.

The returned `href` contains only the selected channel slug and post UUID. The
fix does not expose board IDs, base IDs, parent board IDs, author user IDs,
reporter identity, moderation internals, verification/proof data, storage paths,
or signed URLs.

## Runtime / Migration Boundary

No runtime SQL change is needed.

No migration is needed.

No runtime-apply docs are needed.

The existing runtime functions remain the same:

- `public.list_open_hub_channels(...)`
- `public.list_open_hub_channel_posts(...)`
- `public.get_open_hub_channel_post(...)`
- `public.create_open_hub_channel_post(...)`

## Smoke Post Boundary

Existing safe smoke posts remain valid for list/detail regression checks:

- `7f93f9a9-3dd1-4718-979a-2acc8194a999`
- `8df32cc8-9254-4b43-8a37-102dc77739bd`

No additional smoke post was created during this patch task.

Final browser create-redirect re-smoke remains required after deployment. That
smoke should create exactly one additional safe post only if explicitly
authorized, unless an equivalent browser/e2e test is accepted in place of
runtime smoke.

## Explicitly Not Changed

This patch does not add:

- runtime SQL
- migrations
- broad Supabase database push
- comments
- replies
- reports
- moderation controls
- Request a Channel workflow
- DFW Today/Base/Layover functionality
- UI/UX redesign
- public-domain or access-gate changes

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26d-channel-composer-redirect-fix.md`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26d-final-create-browser-smoke.md`
- `docs/ops/fbmvp-t26d-channel-composer-create-foundation.md`

Docs not updated / why:

- Runtime-apply docs were not updated because no runtime SQL or migration apply
  is needed.
- Broad roadmap docs were not updated because this is a focused app-side defect
  fix, not a milestone or MVP-boundary change.

Scope impact:

- T26D selected-channel create redirect/navigation fix only.

Runtime apply docs needed?

- No.

Browser smoke docs needed?

- Yes. Browser create-redirect re-smoke remains pending after deployment.
