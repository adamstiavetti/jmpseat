# Waitlist Duplicate Survey Token Fix

Date: 2026-06-08

Branch: `fix/waitlist-duplicate-survey-token`

Status: implementation ready for review; runtime migration apply and deployment
validation remain pending.

## Summary

This patch fixes a public waitlist integrity issue where an anonymous duplicate
waitlist submission could receive or rebind the existing signup's optional
survey token.

The public waitlist still returns a friendly success state for duplicate email
submissions, but duplicates no longer receive the existing signup's survey token
and no longer get an editable optional survey tied to that existing row.

No root rollback occurred. `https://jmpseat.com` should stay live while this
patch is reviewed, merged, migrated, deployed, and runtime-tested through the
normal launch hotfix lane.

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

## Runtime Follow-Up

After review and merge:

1. Apply the new migration through the normal reviewed runtime path before
   deploying the app commit.
2. Deploy the current reviewed commit after the migration is applied.
3. Runtime-test a new waitlist signup and optional survey.
4. Runtime-test a duplicate signup and confirm no survey form/token is issued.
5. Runtime-test token reuse after survey save and confirm it cannot overwrite
   the saved response.
6. Runtime-test a transient survey save failure and confirm the same current
   signup session can retry without losing the survey cookie.
7. Runtime-test a recoverable survey validation error and confirm the same
   current signup session can correct and resubmit.
8. Runtime-test skip and confirm it invalidates the current survey path.
9. Confirm pre-fix survey tokens are invalidated after migration apply.
10. Confirm apex `jmpseat.com`, `www.jmpseat.com`, and beta preservation.

No broad Supabase db push, deploy, DNS change, Vercel setting change, Supabase
setting change, runtime mutation, beta grant, role/base claim, or private beta
auth change was performed as part of this implementation pass.
