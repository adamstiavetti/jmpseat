# FBMVP-T26D/T26C Post-Fix Browser Smoke

Date: 2026-06-12

This record captures the authenticated beta browser smoke after the
`dfbdc79 fix: accept channel post uuids` app-side UUID validation fix.

This is a post-fix functional smoke record. It does not claim the selected
channel UI is visually final, and it does not claim full T26D create-browser
redirect coverage because no new post was authorized for this smoke.

## Commit / Repo State

Smoke was run from:

- repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- branch: `main`
- worktree: clean
- HEAD: `dfbdc79`
- origin/main: `dfbdc79`

No files were changed, staged, or committed during the browser-smoke task.

## Deployment Tested

Host reviewed:

- `https://beta.jmpseat.com`

The reviewed deployment contained `dfbdc79` or newer app code because the
selected-channel detail route rendered the existing safe smoke post instead of
the previous unavailable state.

## Existing Smoke Post Reused

The smoke reused the existing safe child-channel post created during the earlier
T26D browser smoke.

- channel: `dfw-q-and-a`
- post UUID: `7f93f9a9-3dd1-4718-979a-2acc8194a999`
- title: `DFW Q&A smoke test thread`
- runtime status/visibility: `published` / `board`

No new post was created. The existing smoke post was not edited or deleted.

## Detail Route Result

Passed.

Visited:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a/7f93f9a9-3dd1-4718-979a-2acc8194a999`

Verified:

- authenticated eligible beta/private-app session had no login redirect
- no access-restricted redirect
- detail route rendered the created post
- title rendered: `DFW Q&A smoke test thread`
- body rendered safe smoke-test text
- channel breadcrumb/name rendered
- author label rendered safely
- safe metadata rendered
- back navigation to selected channel rendered
- prior unavailable state did not render

## Thread List Result

Passed.

Visited:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a`

Verified:

- `DFW Q&A` rendered
- existing smoke post appeared in the selected-channel thread list
- thread link target was
  `/app/hubs/dfw/channels/dfw-q-and-a/7f93f9a9-3dd1-4718-979a-2acc8194a999`
- click-through rendered the detail route
- no duplicate smoke post was created

## T26B / T26C / T26D Status

T26B happy-path status:

- passed
- selected-channel thread list reads and displays the existing child-channel
  post

T26C happy-path status:

- passed
- selected-channel post detail route renders the existing valid UUID post after
  the UUID validation fix

T26D create re-smoke boundary:

- composer was not submitted
- no browser create redirect test was performed in this smoke
- create-action UUID handling is covered by committed tests in `dfbdc79`
- full browser create redirect can be tested later only if another safe post is
  explicitly authorized

## No-Cookie / Public-Domain Boundaries

Passed.

No-cookie beta checks:

- selected-channel route returned `307` to login with `next`
- detail route returned `307` to login with `next`

Public-domain checks:

- `https://jmpseat.com/...` canonicalized to `https://www.jmpseat.com/...`
- public selected-channel app route redirected to `/`
- public selected-channel detail app route redirected to `/`
- private app route was not exposed on public domain

## Product Boundary Checks

Passed with one expected note: the selected-channel page still contains the T26D
composer and `Start a Thread` affordance, but it was not used during this smoke.

Verified absent as functional surfaces:

- comments/replies UI
- report controls
- moderation controls
- Request a Channel workflow
- fake activity counts
- fake thread counts
- DFW Today/Base/Layover functionality
- private-app user-facing `Baseboard` label

The page includes explanatory copy that comments/reports are later scoped
tickets. That copy is acceptable because no comment/report controls or content
were shown.

## Security / Privacy Checks

No visible exposure of:

- board IDs
- base IDs
- parent board IDs
- author user IDs
- reporter identity
- verification/proof data
- storage paths
- signed URLs
- runtime comments/reports
- passenger private information
- exact crew hotel exposure
- airport/security-sensitive procedures
- company-confidential content
- live crew movement/location

## Optional Runtime Verification

Read-only SQL returned one matching published/board-visible post:

- channel slug: `dfw-q-and-a`
- channel name: `DFW Q&A`
- title: `DFW Q&A smoke test thread`
- status/visibility: `published` / `board`

No runtime data was mutated. Internal board/base/author identifiers are not
included in this record.

## Unexpected Findings

None blocking.

The selected-channel page contains boundary copy mentioning comments/reports as
later scoped tickets, but no functional comments/reports surface exists.

## Remaining Work

T26D full create-browser redirect remains untested after the fix because this
smoke intentionally reused the existing safe post and did not submit the
composer. A future full create redirect smoke requires explicit authorization to
create another safe post.

That final authorized create-browser smoke is now recorded in
`docs/ops/fbmvp-t26d-final-create-browser-smoke.md`. Exactly one additional
safe post was created and list/detail reads passed, but the browser stayed on
the selected-channel page instead of redirecting to the new post detail route.

The follow-up redirect fix and passing browser smoke are recorded in
`docs/ops/fbmvp-t26d-channel-composer-redirect-fix.md` and
`docs/ops/fbmvp-t26d-final-create-redirect-browser-smoke-pass.md`. After
`82f4399`, T26D create redirect passed with exactly one additional authorized
safe post, while T26B list and T26C detail regressions continued to pass.

UI/UX polish remains deferred.

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26d-t26c-post-fix-browser-smoke.md`
- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26d-channel-composer-uuid-validation-fix.md`
- `docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-read-foundation.md`
- `docs/ops/fbmvp-t26b-channel-thread-list-read-foundation.md`
- `docs/ops/fbmvp-t26d-final-create-browser-smoke.md`

Docs not updated / why:

- Broad roadmap docs were not updated because this is a focused browser-smoke
  status record, not a roadmap or MVP-boundary change.
- Runtime-apply docs were not updated because no runtime migration or SQL apply
  was needed for the UUID validation fix.
- App, migration, and test files were not updated because this task only records
  browser-smoke results.

Scope impact:

- Post-fix browser-smoke documentation only.
- No app behavior, migrations, tests, runtime data, deployment settings, or
  Supabase schema changed in this docs task.

Runtime apply docs needed?

- No.

Browser smoke docs needed?

- Satisfied by this record for the post-fix T26B selected-channel list and T26C
  selected-channel detail read path.
- Final T26D create-browser redirect smoke later passed after `82f4399` and is
  recorded in
  `docs/ops/fbmvp-t26d-final-create-redirect-browser-smoke-pass.md`.
