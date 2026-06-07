# Auth Design Overhaul Docs Audit

Date: 2026-06-07

## Summary

This audit records the documentation updates required by the auth design-system
overhaul.

Current implementation truth:

- `/login` is the canonical sign-in surface.
- `/signup` is the canonical account creation and account-code confirmation
  surface.
- `/reset-password` is the canonical account recovery surface.
- `/app/profile` is the canonical profile setup surface.
- `/app/access-hold` is the canonical access status and airline employee email
  verification surface.
- `/app/verification` is deprecated as a standalone user-facing page and
  redirects to `/app/access-hold`.
- `/app/verification/confirm` remains for legacy-compatible work-email
  confirmation links.
- Work-email verification now starts inline on `/app/access-hold`; after submit,
  the email input and button are replaced by masked sent-confirmation copy plus
  six digit boxes.
- Proof upload, badge upload, document upload, and proof review remain frozen
  as forward normal-user auth paths.

## Docs Updated

- `docs/BUILD_TICKETS.md`
  - Added the auth design-system style guide and this audit to the supplemental
    docs list.
  - Updated work-email verification wording from `/app/verification` code entry
    to inline `/app/access-hold` code entry.
  - Updated the current implementation reminder so `/app/access-hold` is the
    canonical airline employee email verification surface.

- `docs/EPOCH_ROADMAP.md`
  - Updated current project state to reflect `/app/verification` deprecation,
    access-hold inline verification, app-generated work-email code flow, and
    auth design-system docs.
  - Added the auth design docs to the relevant epoch rows.

- `docs/epochs/fbmvp-t04-onboarding-signup-flow-update.md`
  - Added a current-state note that `/app/verification` was later deprecated.
  - Reframed the verification surface behavior around `/app/access-hold`.
  - Clarified profile completion remains separate from airline employee email
    verification and beta approval.

- `docs/epochs/work-email-confirmation-email-flow-implementation.md`
  - Updated the surfaces section so `/app/access-hold` is the current inline
    verification UI.
  - Kept `/app/verification/confirm` documented as the legacy-compatible
    confirmation route.
  - Documented that failures return to `/app/access-hold`.

- `docs/ops/airline-email-verification-remedy-route-fix.md`
  - Marked the earlier remedy-route fix as superseded by the auth design-system
    overhaul.
  - Reframed the remedy around inline access-hold verification.

- `docs/ops/auth-design-system-style-guide.md`
  - Added desktop rules for avoiding incidental scroll, preserving shared auth
    constants, and preventing profile setup from drifting into oversized page
    layouts.

## Historical Docs Not Rewritten

The repository contains many epoch, strategy, and runtime notes that accurately
describe older implementation phases where `/app/verification` existed as a
standalone surface. Those documents were not rewritten line-by-line because
they are historical records, not current implementation instructions.

Historical references remain in places such as:

- Epoch 02 route maps and private-shell notes.
- Epoch 04 worker-verification foundation and submission-surface notes.
- Older proof-upload and reviewer-routing implementation notes.
- Strategy docs that say `/app/verification` should be reframed or replaced.

When planning new work, treat this audit and
`docs/ops/auth-design-system-style-guide.md` as the current auth UX source of
truth, and treat older `/app/verification` descriptions as historical unless a
new ticket explicitly reactivates that surface.

## Follow-Up Watchlist

- If the inline access-hold verification flow is later runtime-validated, add an
  ops runtime pass note that confirms the signed-in access-hold state visually
  and functionally.
- If the old `/app/verification` route is eventually removed entirely, update
  this audit, `AUTH_ROUTES`, private-app route tests, and any legacy confirm-link
  docs.
- If auth visuals change again, update the style guide before changing more
  page-specific CSS.
