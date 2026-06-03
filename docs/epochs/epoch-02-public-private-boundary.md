# Epoch 02 Public / Private Boundary

## Purpose

This note records the `E02-T07` implementation pass that restores the public waitlist route and preserves the separation between the public marketing surface and the private `/app` placeholder shell.

## Public Route Restored

- `/`

The public root route was restored from the canonical waitlist implementation previously shipped in commit `718dcef` (`fix: align splash page with approved aviation mockup`).

## How The Boundary Is Preserved

- `/` renders the public waitlist and marketing surface.
- `/app` renders the locked private shell placeholder.
- `/app/home`
- `/app/base`
- `/app/layovers`
- `/app/rooms`
- `/app/profile`
- `/app/verification`
- `/app/admin`

All `/app` routes remain private-shell placeholders only and do not render public waitlist CTA or form content.

Unknown `/app/[section]` slugs still fall through to `notFound()`, which prevents the private namespace from acting like a broad catch-all.

## Files Touched

- `app/page.tsx`
- `app/globals.css`
- `test/private-app/privateShellPlaceholder.test.mts`
- `docs/epochs/epoch-02-public-private-boundary.md`

## Waitlist And Cinematic Impact

- Public waitlist files were touched only to restore the canonical root route and its matching styles.
- No waitlist behavior was redesigned.
- No Tally logic was changed beyond reconnecting the existing root page to its prior waitlist CTA behavior.
- No cinematic, globe, or Three.js files were modified.
- This restored page should be treated as the safe Epoch 02 baseline public surface on `main`.
- Any more advanced Skybyrd cinematic or globe-driven public landing work must be reconciled later from the correct dedicated branch or worktree, not through E02-T07.

## Private App Impact

- No private `/app` route behavior was changed.
- The locked private shell and child placeholders remain intact.
- A focused boundary assertion was added so the repo checks that public waitlist copy stays on `/` and private placeholder routes stay under `/app`.

## No Real Security Added

This slice did not add:

- auth
- sessions
- authorization
- verification gates
- beta access control

The boundary here is route separation and placeholder discipline only. Real private access control belongs to later epochs.

## Docs Impact

- Added this implementation note so the app repo records the restored public/private boundary.
- Kept the note scoped to Epoch 02 boundary behavior only.
