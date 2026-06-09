# FBMVP-T06 Home Base And Board Follows

Date: 2026-06-09

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This note records the local implementation scope for `FBMVP-T06: Home Base
Preference + Board Follow Foundation`.

T06 builds on the runtime-applied T05 base/board metadata model. It adds the
data foundation for:

- optional Home Base preference state, at most one preference per user
- board follows as personalization/subscription state
- atomic Home Base setting by active base code
- automatic following of the matching active Base Board

T06 does not build onboarding UI, dashboard UI, posts, comments, search,
saves, reactions, restricted-lounge memberships, access requests, reports, or
moderation.

Runtime apply status:

- The T06 schema/functions already exist in the intended Supabase runtime.
- The remote migration ledger recorded that runtime apply as
  `20260609194858 create_home_base_board_follows`.
- The local repo migration remains
  `20260609130534_create_home_base_board_follows.sql`.
- Do not re-apply the local T06 migration.
- Do not mark local `20260609130534` applied retroactively.
- Use targeted follow-up migrations only because remote migration history has
  documented drift.
- A follow-up least-privilege migration,
  `20260609200310_harden_home_base_rpc_execute_grants.sql`, removes explicit
  `anon` EXECUTE grants from the T06 RPCs while preserving authenticated and
  service-role execution.

## 2. Implemented Scope

T06 adds:

- `user_home_base_preferences`
- `board_follows`
- `set_user_home_base(p_base_code text)`
- `get_current_user_home_base()`
- `list_current_user_board_follows()`
- server-side helper functions in `src/lib/community/homeBase.ts`
- static/source tests for the schema and boundary assumptions

`user_home_base_preferences` stores the current selected Home Base for a user
when the user chooses one. It is optional, at most one row per user, and
references `public.bases`.

`board_follows` stores followed boards for personalization. It has a unique
`(user_id, board_id)` constraint and constrained values for:

- `source`: `manual`, `home_base`, `onboarding`, `system`
- `notification_level`: `default`, `muted`, `important`

The `set_user_home_base` RPC:

- requires `auth.uid()`
- accepts an active base code, such as `DFW`
- requires the target base to be active
- finds the active `base_board` for that base
- upserts the user's Home Base preference
- upserts a follow for the matching Base Board with source `home_base`
- preserves old board follows
- does not touch profile claim fields
- does not grant restricted-board access
- is restricted by a follow-up execute-grant hardening migration so `anon`
  cannot execute it, even though the function still enforces `auth.uid()`
  internally

The read RPCs return only the authenticated user's own Home Base preference and
board follows with the minimum base/board metadata needed by later app
surfaces. They avoid opening broad direct reads on the T05 metadata tables.
The follow-up execute-grant hardening migration also removes `anon` EXECUTE
from those read RPCs and keeps them available to `authenticated` and
`service_role`.

## 3. Initial DFW-Only Behavior

The initial rollout remains DFW-only.

T06 supports the intended optional DFW-start step after work-email verification:

1. User chooses Start with DFW or Skip for now.
2. The server calls `set_user_home_base('DFW')`.
   only if the user starts with DFW.
3. If the user starts with DFW, Home Base is set to DFW.
4. If the user starts with DFW, the DFW Base Board is followed.
5. If the user skips, no Home Base preference is created.
6. If the user skips, no automatic board follow is required.
7. The user is still allowed into the app when the real app-entry gates pass.
8. The dashboard can later show an exploratory/default experience until the
   user sets a Home Base or follows boards.

T06 does not implement that UI step. It provides the data and server helper
foundation for the later onboarding/dashboard task.

## 4. Authorization Boundary

Home Base is personalization state, not authorization truth.

Board follows are personalization/subscription state, not access grants.

No Home Base is a valid initial DFW-only rollout state. Missing Home Base must
not block app access.

T06 does not verify:

- employment
- airline affiliation
- role
- base assignment
- restricted-board eligibility
- Verified Lounge membership

Self-declared profile fields such as `claimed_base`, `claimed_airline`, and
`claimed_role` are not referenced by the T06 migration or helper. They remain
non-authoritative profile/onboarding fields.

Work-email verification remains the aviation-worker eligibility gate.

Restricted Verified Lounges still require a later membership/access approval
model.

## 5. RLS And Client Access

RLS is enabled on both new tables.

Authenticated users can read only their own Home Base preference and board
follows.

No anon policies are added.

No `using (true)` or permissive public policies are added.

Direct client writes are intentionally conservative in this ticket. Home Base
setting and the automatic base-board follow happen through the authenticated
`set_user_home_base` RPC. Manual board follow creation, unfollowing, favorites,
restricted lounge follow behavior, and notification preference editing remain
later implementation work.

## 6. Source Helpers

The server-only helper module provides:

- `getCurrentUserHomeBase()`
- `setUserHomeBaseByCode(baseCode)`
- `listCurrentUserBoardFollows()`

The helper calls the T06 RPCs for reads and writes. It does not write
`board_follows` directly, does not read broad board metadata directly, and does
not read or write self-declared profile claim fields.

## 7. Deferred Scope

The following remain later tickets:

- onboarding UI for the DFW-start step
- personalized Home dashboard UI
- exploratory/default dashboard behavior for users without Home Base
- manual board follow/unfollow UI
- board discovery UI
- restricted lounge memberships
- restricted lounge access requests
- community-admin approval
- posts
- comments/replies
- saves
- reactions/useful marks
- search
- reports
- moderation/admin queues
- board intel/wiki structured content

Proof uploads remain deprecated/out of current scope.

## 8. Validation

Local validation for this branch should include:

- `node --test test/community/homeBaseBoardFollows.test.mts`
- `node --test test/community/baseBoardModel.test.mts`
- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Runtime validation is pending until the T06 migration is approved for targeted
follow-up apply of the RPC execute-grant hardening migration. The base T06
schema/functions are already present remotely under migration ledger version
`20260609194858`; the local `20260609130534` migration must not be re-applied
or retroactively marked applied.

## 9. Next Lane

After review and targeted migration apply, the next implementation lane remains
the narrow follow-on path toward:

- optional DFW-start onboarding step
- read-only personalized Home/Base Board shell
- future manual board discovery/follow surfaces

Do not start posts/comments, restricted lounge access, reports, moderation, or
broad member-generated content exposure until their controlling tickets are
active.
