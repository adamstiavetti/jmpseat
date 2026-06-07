# Public Waitlist Survey Copy Runtime Pass

Date: 2026-06-07

Baseline commit: `75f53f0 polish: refine waitlist survey copy`

Stable beta target: `https://beta.jmpseat.com`

## Summary

The public waitlist survey-copy polish was aligned in the linked Supabase
runtime and validated on stable beta. The survey allowlist migration from
`75f53f0` was applied to the linked runtime, stable beta was refreshed to serve
current `main`, and the optional survey flow was rechecked end to end using the
polished wording.

Root `jmpseat.com` was not deployed, aliased, or cut over in this task.

## Migration Apply

Source migration file:

- `supabase/migrations/20260607204212_polish_waitlist_survey_copy.sql`

Runtime result:

- the linked runtime accepted the migration successfully
- remote migration history now records the survey-copy runtime apply
- no unrelated pending local migration was pushed in this task
- no broad `supabase db push` was used

## Stable Beta Check

Stable beta was initially serving an older waitlist deployment that did not
reflect current `main` waitlist behavior. A fresh Vercel preview deployment was
created from current `main` with deployment-scoped environment injection from
local ignored `.env.local`, then `beta.jmpseat.com` was re-aliased to that
preview deployment only.

No root-domain deploy, root-domain alias change, DNS change, or Vercel project
setting change was performed.

## Runtime Validation

Confirmed on stable beta:

- public waitlist page loads
- `Beta Access` is absent
- public private-app auth CTA remains absent
- waitlist email capture succeeds
- success state appears after email capture
- optional survey appears after email success
- polished survey copy is displayed:
  - `Base tips from people who actually work there`
  - `Verified crew lounges based on role`
  - `Commuter or non-rev-adjacent tips`
  - company airline email verification-comfort wording
  - `Team outreach`
- removed value is absent from the live survey:
  - `AI layover brief`
- safe optional answers submit successfully through the live UI
- stored survey values round-trip correctly for the polished selections
- removed value is rejected by the runtime allowlist
- proof upload, badge upload, and document upload copy remain absent
- no beta grant, role claim, base claim, or restricted-board claim was created

Test email, row identifiers, and survey token values are intentionally omitted
from this note. The synthetic UI validation row was cleaned up after stored
value confirmation.

## Validation

Passed:

- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `npm run typecheck`
- `git diff --check`

## Notes

- This pass validates the public waitlist survey-copy runtime alignment only.
- Root public cutover to `jmpseat.com` did not happen in this task.
