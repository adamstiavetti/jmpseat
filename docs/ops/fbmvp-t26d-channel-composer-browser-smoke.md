# FBMVP-T26D Channel Composer Browser Smoke

Date: 2026-06-12

## Purpose

This record captures authenticated browser/runtime smoke for the
`FBMVP-T26D` selected-channel composer/create-post foundation.

This was a failed/partial smoke. It does not claim T26D passed, and it does not
claim the selected-channel post detail happy path passed.

Target host:

- `https://beta.jmpseat.com`

Target route:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a`

## Repo And Deployment Context

Repo state during smoke:

- repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- branch: `main`
- worktree: clean
- `HEAD = origin/main = 327ce9e`
- no files changed, staged, committed, or deployed during smoke

Deployment tested:

- `https://beta.jmpseat.com`
- the selected-channel composer rendered, confirming the reviewed beta
  deployment contained T26D app code

## Smoke Post

Exactly one safe smoke post was created through the UI.

Title:

- `DFW Q&A smoke test thread`

Body:

- safe smoke-test text only
- no operational, security-sensitive, passenger, hotel, or
  company-confidential content

Created post UUID:

- `7f93f9a9-3dd1-4718-979a-2acc8194a999`

Do not create additional smoke posts until the T26D create/action and T26C
detail-read defect is investigated.

## Create Flow Result

Result:

- partial fail

Observed behavior:

- the post was created
- the post appeared in the selected-channel thread list
- the expected success redirect to
  `/app/hubs/dfw/channels/dfw-q-and-a/7f93f9a9-3dd1-4718-979a-2acc8194a999`
  did not happen
- the browser returned to:
  `/app/hubs/dfw/channels/dfw-q-and-a?post=dfw_channel_post_failed`
- safe failure copy appeared
- no raw error leaked

## Post Detail Result

Result:

- failed happy path

Direct visit tested:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a/7f93f9a9-3dd1-4718-979a-2acc8194a999`

Observed behavior:

- the route rendered the safe unavailable state instead of the created post
  detail
- the created post title/body did not render on the detail route

## Thread List Result

Result:

- passed for the created child-channel post

The selected-channel thread list rendered the created post with safe metadata:

- title/body
- `Note` / `General`
- safe author label

The selected-channel thread list did not expose IDs, comments, reports, or
moderation controls.

## Ticket Status

Status by ticket from this smoke:

- T26B happy path passed for the created child-channel post because the
  selected-channel thread list showed the post.
- T26C happy path failed because the detail route did not render the created
  published post.
- T26D happy path failed/partial because the create mutation inserted the post
  but the UI surfaced failure and did not redirect to detail.

## Access Boundary Checks

No-cookie beta selected-channel route:

- redirected to login with `next`

No-cookie beta detail route:

- redirected to login with `next`

Public-domain behavior:

- public apex canonicalized to `www`
- `www.jmpseat.com` selected/detail app routes redirected to `/`
- private app selected/detail routes were not exposed on the public apex

## Product Boundary Checks

The selected-channel page did not show:

- comments
- replies
- reports
- moderation controls
- `Request a Channel` workflow
- fake counts
- DFW Today/Base/Layover functionality
- user-facing `Baseboard` label

The channel overview did not render the composer.

`Request a Channel` remained static/secondary.

## Security And Privacy Checks

No visible exposure was observed for:

- board IDs
- base IDs
- parent board IDs
- author user IDs
- reporter identity
- verification/proof data
- storage paths
- signed URLs
- comments/reports
- passenger private information
- exact crew hotel exposure
- airport/security-sensitive procedures
- company-confidential content
- live crew movement/location

## Optional Runtime Verification

Read-only SQL confirmed one row for the created post:

- channel slug: `dfw-q-and-a`
- channel name: `DFW Q&A`
- title: `DFW Q&A smoke test thread`
- status: `published`
- visibility: `board`

Internal board/base/author IDs were not recorded in this doc.

## Unexpected Findings

Unexpected findings:

- T26D create flow created the post but reported failure instead of redirecting
  to detail.
- T26C detail route could not render the created published child-channel post.

Likely follow-up area:

- server helper/action handling of RPC return shape
- detail-read handling
- mismatch between create RPC output, list RPC output, and detail RPC
  expectations

This is a follow-up investigation target, not a confirmed root cause.

## Remaining Work

The next implementation task should investigate the T26D create/action return
handling and T26C detail-read mismatch before more composer smoke posts are
created.

UI/UX polish remains deferred.

T26D still does not add:

- comments
- replies
- reports
- moderation review changes
- `Request a Channel` workflow
- DFW Today MVP baseline
- Base MVP baseline
- Layover MVP baseline
- search
- saves
- reactions
- media uploads
- notifications
- AI behavior
- live weather or traffic integrations

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26d-channel-composer-create-foundation.md`
- `docs/ops/fbmvp-t26d-channel-composer-create-foundation-runtime-apply.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-read-foundation.md`

Docs not updated / why:

- App, migration, and test files were not updated because this task only records
  browser-smoke results.
- Broad roadmap docs were not updated because the focused T26D/T26C and active
  05B backlog docs are sufficient for this status change.

Scope impact:

- Browser-smoke documentation only.
- No app behavior, migrations, tests, runtime data, deployment settings, or
  Supabase schema changed in this docs task.

Runtime apply docs needed?

- Already satisfied by
  `docs/ops/fbmvp-t26d-channel-composer-create-foundation-runtime-apply.md`.

Browser smoke docs needed?

- Satisfied by this record for the failed/partial T26D browser smoke.
- Follow-up browser smoke will be needed after the create/detail defect is
  fixed.
