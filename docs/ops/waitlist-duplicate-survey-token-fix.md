# Waitlist Duplicate Survey Token Fix

Date: 2026-06-08

Branch: `fix/waitlist-duplicate-survey-token`

Status: runtime-proven on apex and www after migration-first rollout.

Runtime pass: 2026-06-08 19:21 UTC.

## Summary

This patch fixes a public waitlist integrity issue where an anonymous duplicate
waitlist submission could receive or rebind the existing signup's optional
survey token.

The public waitlist still returns a friendly success state for duplicate email
submissions, but duplicates no longer receive the existing signup's survey token
and no longer get an editable optional survey tied to that existing row.

No root rollback occurred. `https://jmpseat.com` and
`https://www.jmpseat.com` stayed live on the public waitlist deployment, and
`https://beta.jmpseat.com` remained on the separate private beta/auth/admin
deployment.

## Security Issue

Before this fix, the signup RPC used conflict-update behavior and returned the
row's `survey_token` even when the email was already on the waitlist. An
anonymous user who knew or guessed a waitlisted email could resubmit it, receive
the current survey token through the server action flow, and then submit
optional survey answers for that existing signup.

This did not grant app access or expose waitlist contact data, but it could
poison waitlist product signals and attribution for another signup.

## Fix

The new migration replaces the waitlist RPC behavior:

- New waitlist signup inserts still receive a one-time survey token for the
  current browser session.
- Duplicate waitlist submissions return a generic success response with
  `survey_allowed: false` and `survey_token: null`.
- Duplicate submissions do not update existing waitlist attribution fields.
- Existing survey tokens are rotated when the migration is applied, so tokens
  issued before this hardening patch stop working.
- Survey submission consumes the current token by rotating it before saving the
  optional survey response.
- Reusing the same token after a successful survey save no longer matches a
  signup row.
- Recoverable survey validation errors, such as invalid allowlist values or
  sensitive free-text rejection, preserve the current session token so the
  legitimate new signup can correct and resubmit in the same browser session.
- Transient survey save failures, such as RPC errors, missing response data, or
  backend/service-role availability problems, also preserve the current session
  token and return the visitor to a generic retry state.
- Definitive invalid, stale, reused, expired, rotated, or missing-token states
  clear the survey cookie because the anonymous session can no longer safely
  attach optional answers.
- Skip flow calls a server-only token invalidation RPC when a valid token is
  present, then clears the cookie. Skip is final for the anonymous waitlist
  survey flow.

The server action now sets the HTTP-only survey cookie only when the signup RPC
explicitly returns `survey_allowed: true` and a valid token. Otherwise it clears
the survey cookie and redirects to a friendly joined state that does not render
an editable survey.

## Rollout Order

This hardening must be rolled out migration-first:

1. Apply `20260608131000_harden_waitlist_survey_tokens.sql`.
2. Deploy the reviewed app commit.
3. Runtime-test new signup, duplicate signup, survey completion, token reuse,
   and skip behavior.

The app intentionally fails closed if it receives a legacy token-only signup RPC
response with no `survey_allowed: true` field. In that app-first ordering, a
legitimate new signup may temporarily see the safe joined state without the
optional survey. That is preferable to accepting legacy token-only responses,
because the legacy RPC cannot distinguish a new signup token from a duplicate
signup token and trusting it would preserve the duplicate-token takeover issue.

Migration-first is compatible with the current deployed app: the database
boundary stops duplicate submissions from receiving survey tokens, while new
signup token issuance remains available.

## Product Behavior

Expected public UX after this patch:

- New visitor joins the waitlist and can answer the optional survey.
- Duplicate email submitter sees a friendly success state.
- Duplicate email submitter does not receive a survey token.
- Duplicate email submitter does not see an editable survey for the existing
  waitlist row.
- Missing, invalid, expired, rotated, or reused survey tokens return a safe
  non-sensitive state.
- Recoverable survey validation errors keep the form available without exposing
  raw submitted values, row IDs, email, or token values.
- Transient backend or RPC save errors keep the form available and preserve the
  current session token so the visitor can retry without exposing database
  errors, service details, email, row IDs, or token values.
- Successful survey submission consumes the token by rotating it in the
  database and clearing the browser cookie.
- Skipping the optional survey is final for the anonymous flow; users are not
  told they can finish later.
- Raw email and survey token values are not placed in URLs.

Future survey editing, if desired, should require email ownership proof or an
authenticated account flow. It should not be anonymous-by-email.

## Runtime Pass

The rollout was completed migration-first:

1. Applied only `20260608131000_harden_waitlist_survey_tokens.sql` to the
   linked Supabase runtime.
2. Marked only migration version `20260608131000` as applied in migration
   history because remote migration history has known drift and a broad
   `db push` would have attempted unrelated local-only versions.
3. Verified the hardened RPC shape before app deployment using generated,
   redacted test rows:
   - new signup returned `survey_allowed: true` with a token
   - duplicate signup returned `survey_allowed: false` with no token
   - survey save consumed/rotated the token
   - token reuse was rejected
4. Merged and pushed app commit `c430748`.
5. Deployed the app with automatic domain promotion skipped, then explicitly
   aliased only `https://jmpseat.com` and `https://www.jmpseat.com` to the new
   public deployment.

Runtime browser verification passed:

- Apex `/` and `/#top` load at scrollY 0 with `id="top"` on the root `main`.
- `www` `/` and `/#top` load at scrollY 0 with the same public waitlist
  experience.
- Public root has no Beta Access CTA, no `/login?next=/app` CTA, and no
  proof/badge/document/manual-review upload copy.
- Privacy and Terms links render with concrete effective dates.
- New waitlist signup succeeds, shows the optional survey, keeps raw email and
  survey token out of the URL, and sets the survey cookie as HTTP-only.
- Optional survey save succeeds and clears the survey cookie.
- Duplicate signup returns friendly success, does not receive a survey cookie,
  lands in the survey-unavailable state, and does not overwrite original
  attribution or survey data.
- Recoverable sensitive-content validation keeps the survey form available,
  preserves the current session cookie, and allows corrected safe answers to
  submit successfully.
- Skip invalidates/clears the current survey path, uses final skip copy, and
  does not promise finish-later.
- Duplicate submit after skip cannot recover the old survey token.
- `https://beta.jmpseat.com` still loads separately; `/login` renders, signed
  out `/app` redirects to login, and signed-out `/app/admin/waitlist` redirects
  to login.

Generated founder-controlled test rows used for this runtime pass were cleaned
up after verification. No raw emails, survey tokens, private identifiers, or
secret values were recorded.

No broad Supabase db push, DNS change, Vercel setting change, Supabase setting
change, beta grant, role/base claim, private beta auth change, proof upload
change, or root rollback was performed. The migration intentionally rotated
existing waitlist survey tokens as part of the approved hardening behavior.
