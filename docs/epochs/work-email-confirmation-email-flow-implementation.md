# Work-Email Verification Code Flow Implementation

Date: 2026-06-06

## Summary

This implementation adds app-generated airline employee email verification-code
delivery for jmpseat work-email verification. It is separate from Supabase Auth
account confirmation/reset email and separate from beta invite codes.

When a signed-in user submits an approved airline employee email, jmpseat now
creates or reuses the existing work-email verification request, creates a
hashed short-lived verification code, sends that code to the submitted work
email through the configured app email provider, and confirms email control
when the user enters the code back into jmpseat.

## Surfaces Changed

- `/app/access-hold` is now the canonical user-facing airline employee email
  verification surface. It accepts the approved airline employee email inline,
  then swaps to a masked sent-confirmation state with six digit boxes for the
  current code.
- `/app/verification` is deprecated as a standalone page and redirects users to
  `/app/access-hold`.
- `/app/verification/confirm` remains as a backward-compatible route for any
  older link-based confirmations that are still in flight. Failure states return
  to `/app/access-hold`.
- `src/lib/verification/actions.ts` now sends and verifies work-email codes
  only after an approved-domain work-email request/evidence row exists.
- Code verifier row creation is server-owned through the service-role-backed
  server action path. Authenticated browser clients cannot choose `token_hash`,
  `code_nonce`, or other verifier material.
- Legacy link-token verifier creation is also no longer normal-user callable.
  The retained link confirmation route can validate existing server-created rows,
  but authenticated clients cannot create legacy verifier rows or choose verifier
  material.
- `src/lib/verification/workEmailConfirmation.ts` contains token, code, hash,
  URL, domain, and safe email-copy helpers.
- `src/lib/verification/workEmailConfirmationEmail.ts` sends app-generated
  transactional email through Resend REST using server-only env values.

## Migration

Relevant migrations:

- `supabase/migrations/20260606160833_add_work_email_confirmation_flow.sql`
- `supabase/migrations/20260606233000_add_work_email_confirmation_code_flow.sql`

The combined migrations create and extend
`public.work_email_confirmation_tokens` and RPCs for:

- marking a token as sent,
- revoking an active token,
- confirming a legacy token and marking the existing work-email request/evidence
  as approved/accepted,
- confirming a six-digit code for the current authenticated user,
- tracking bounded failed verification-code attempts before safe revocation.

Verifier creation is intentionally trusted-server-owned. The code-create path is
not exposed as an authenticated RPC, and the earlier legacy link-token create
RPC grant is revoked in the code-flow migration because it accepted
caller-supplied verifier material. The app server validates request ownership
and approved-domain state, then writes nonce-bound verifier rows through the
existing service-role server client.

This migration remains unapplied in this branch. Runtime validation remains
pending after review, merge, and migration apply.

## Token And Storage Security

- Plaintext verification codes are generated server-side and are not stored.
- Code rows store a row-specific `code_nonce` plus `token_hash`, where the
  verifier is derived from the nonce and the submitted code. Plain
  `sha256(code)` is not stored.
- Authenticated users submit only the code for confirmation. They cannot choose
  or write the stored verifier material.
- Authenticated users cannot execute work-email verifier-creation functions that
  accept caller-supplied verifier material. This includes the retained legacy
  link-token creation function from the earlier migration.
- Duplicate six-digit plaintext codes across users or historical rows do not
  collide because each code row uses its own nonce.
- The database stores only `token_hash`, `code_nonce`, `email_hash`, domain,
  status, failed attempt count, and lifecycle timestamps.
- The current code is only used in-process to send the email and is not
  returned to the UI after submit.
- Existing active tokens for the same user/request are revoked when a new token
  is created.
- Used, expired, revoked, too-many-attempts, wrong-user, and invalid secrets
  fail safely.
- Security-event metadata records bounded request/domain/status context only and
  must not include full work emails, codes, tokens, links, SMTP credentials,
  invite codes, proof data, or secrets.

## Confirmation Behavior

Verification requires:

- authenticated user,
- active, unexpired confirmation row owned by that user,
- submitted code matching the row-specific nonce-bound hash,
- active work-email verification request/evidence,
- active approved email domain.

Legacy unauthenticated link confirmation still uses the short-lived
pending-confirmation cookie handoff:

- legacy link confirmation is retained only for already-issued server-created
  rows,
- the raw token is accepted only from the original email-click URL,
- the route stores it in an HttpOnly, SameSite=Lax cookie scoped to the
  confirmation route,
- login receives only the safe `next=/app/verification/confirm` path,
- the token does not enter login query strings, hidden login fields, or auth
  `next_path` security-event metadata,
- the pending cookie is cleared after success or failure.
- failed or invalid legacy confirmation attempts return to `/app/access-hold`
  with safe generic error copy.

Successful code verification updates the existing work-email request to
`approved` and work-email evidence to `accepted` with confirmation metadata.
This is the state already consumed by the FBMVP-T02 airline-email access-state
helper.

After successful code verification, the user is sent back through the existing
private-app gate by redirecting to `/app`. If the gate allows entry, the user
lands in the app; otherwise the existing gate redirects to the exact
profile/access-hold path it already controls.

For the current user-facing flow, the user normally starts and completes
airline employee email verification from `/app/access-hold`. The deprecated
`/app/verification` page should not be treated as a primary UI surface.

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

The app-generated verification email flow uses these env names:

- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPABASE_SERVICE_ROLE_KEY`

Real values must remain in local/provider/Vercel/Supabase settings and must not
be committed or printed.

## Validation

Added and updated tests cover:

- token hashing and expiry metadata,
- six-digit code hashing and expiry metadata,
- confirmation URL shape,
- scoped code-email copy,
- env-name config behavior,
- safe email hashing/domain extraction,
- migration token/code/RPC shape,
- submit and verify action source behavior,
- server-owned code verifier creation,
- confirmation route source behavior,
- verification-page copy,
- security-event taxonomy.

Runtime validation after migration apply should confirm:

- approved-domain submissions send real email through the configured provider,
- provider failures show safe failure and do not falsely report sent,
- successful code verification marks airline-email access verified,
- expired/used/wrong-user/too-many-attempts code paths fail safely,
- no plaintext codes, confirmation links, full work emails, SMTP credentials,
  invite codes, or proof data are stored or logged.

## Caveats

- No Supabase `db push` was run in this implementation task.
- Runtime validation is separate after review, merge, migration apply, and
  environment setup.
- Rate limiting remains minimal. Re-requesting verification supersedes the
  prior active secret for the same request, but a fuller resend throttle can be
  a follow-up if abuse or deliverability needs require it.
