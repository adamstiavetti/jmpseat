# Work-Email Confirmation Email Flow Implementation

Date: 2026-06-06

## Summary

This implementation adds app-generated airline employee email confirmation for
jmpseat work-email verification. It is separate from Supabase Auth account
confirmation/reset email and separate from beta invite codes.

When a signed-in user submits an approved airline employee email, jmpseat now
creates or reuses the existing work-email verification request, creates a
hashed confirmation token, sends a confirmation email to the submitted work
email through the configured app email provider, and confirms email control when
the user follows the confirmation route.

## Surfaces Changed

- `/app/verification` copy now explains that submitting an approved airline
  employee email sends a confirmation link to that inbox.
- `/app/verification/confirm` handles confirmation links, requires the current
  authenticated user to match the token owner, and routes the user through the
  existing app gate after confirmation.
- `src/lib/verification/actions.ts` now sends confirmation email only after an
  approved-domain work-email request/evidence row exists.
- `src/lib/verification/workEmailConfirmation.ts` contains token, hash, URL,
  domain, and safe email-copy helpers.
- `src/lib/verification/workEmailConfirmationEmail.ts` sends app-generated
  transactional email through Resend REST using server-only env values.

## Migration

New migration:

- `supabase/migrations/20260606160833_add_work_email_confirmation_flow.sql`

The migration creates `public.work_email_confirmation_tokens` and RPCs for:

- creating a token for the current authenticated user and request,
- marking a token as sent,
- revoking an active token,
- confirming a token and marking the existing work-email request/evidence as
  approved/accepted.

The migration also extends the bounded `security_events` event-type constraint
for work-email confirmation lifecycle events.

This migration remains unapplied in this branch. Runtime validation remains
pending after review, merge, and migration apply.

## Token And Storage Security

- Plaintext confirmation tokens are generated server-side and are not stored.
- The database stores only `token_hash`, `email_hash`, domain, status, and
  lifecycle timestamps.
- The confirmation URL is only used in-process to send the email and is not
  returned to the UI.
- Existing active tokens for the same user/request are revoked when a new token
  is created.
- Used, expired, revoked, wrong-user, and invalid tokens fail safely.
- Security-event metadata records bounded request/domain/status context only and
  must not include full work emails, tokens, links, SMTP credentials, invite
  codes, proof data, or secrets.

## Confirmation Behavior

Confirmation requires:

- authenticated user,
- token row owned by that user,
- active, unexpired token status,
- matching token hash,
- active work-email verification request/evidence,
- active approved email domain.

Unauthenticated confirmation uses a short-lived pending-confirmation cookie
handoff:

- the raw token is accepted only from the original email-click URL,
- the route stores it in an HttpOnly, SameSite=Lax cookie scoped to the
  confirmation route,
- login receives only the safe `next=/app/verification/confirm` path,
- the token does not enter login query strings, hidden login fields, or auth
  `next_path` security-event metadata,
- the pending cookie is cleared after success or failure.

Successful confirmation updates the existing work-email request to `approved`
and work-email evidence to `accepted` with confirmation metadata. This is the
state already consumed by the FBMVP-T02 airline-email access-state helper.

After confirmation, the route re-runs the existing private-app gate and honors
the gate's actual redirect path. If the gate allows entry, the user goes to
`/app`; otherwise the user goes to the exact profile/access-hold path returned
by the existing gate logic.

## Access-State Integration

Successful confirmation makes `getCurrentAirlineEmailAccessState` resolve the
user as `airline_email_verified` through the existing approved work-email
request/evidence path.

This implementation does not:

- grant beta access,
- change launch-mode behavior,
- issue role/base/restricted-board claims,
- create baseboards or board memberships,
- auto-upgrade ambiguous proof-derived records,
- reintroduce proof upload, badge upload, document upload, or proof review.

## Environment Names

The app-generated email flow uses these env names:

- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Real values must remain in local/provider/Vercel/Supabase settings and must not
be committed or printed.

## Validation

Added and updated tests cover:

- token hashing and expiry metadata,
- confirmation URL shape,
- scoped email copy,
- env-name config behavior,
- safe email hashing/domain extraction,
- migration token/RPC shape,
- submit action source behavior,
- confirmation route source behavior,
- verification-page copy,
- auth route constants,
- security-event taxonomy.

Runtime validation after migration apply should confirm:

- approved-domain submissions send real email through the configured provider,
- provider failures show safe failure and do not falsely report sent,
- confirmation links mark airline-email access verified,
- expired/used/wrong-user tokens fail safely,
- no plaintext tokens, confirmation links, full work emails, SMTP credentials,
  invite codes, or proof data are stored or logged.

## Caveats

- No Supabase `db push` was run in this implementation task.
- Runtime validation is separate after review, merge, migration apply, and
  environment setup.
- Rate limiting remains minimal. Re-requesting confirmation supersedes the
  prior active token for the same request, but a fuller resend throttle can be a
  follow-up if abuse or deliverability needs require it.
