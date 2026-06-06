# Founder Testing Vercel Preview Runtime Note

## Summary

- Date: 2026-06-06
- Commit present: `e31b0dc`
- Preview deployment URL: `https://jmpseat-8v4031st9-adam-stiavetti-s-projects.vercel.app`
- Deployment type: Vercel Preview only
- Production deployment: not run
- DNS changes: none
- `jmpseat.com` DNS/custom-domain changes: none
- Landing-page Beta Access entry: added

This preview exists to give founder/work-email verification testing a real
HTTPS app URL instead of a `localhost` confirmation link.

The current landing page includes a `Beta Access` entry that routes users into
the existing login/auth flow at `/login?next=/app`.

This entry does not bypass:

- authentication
- beta access requirements
- airline-email verification requirements
- private app launch/access gates

This preview also includes the normal account-confirmation callback fix for
Supabase signup confirmation links.

Supabase Auth configuration was updated for this preview so account
confirmation links use the preview Site URL and the app-supported
`/auth/confirm` token-hash route. The confirmation template no longer relies on
the localhost Site URL for this preview validation pass.

## Environment Checklist

The Preview deployment was created with deployment-scoped environment values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `JMPSEAT_LAUNCH_MODE`

No environment values, SMTP credentials, auth links, verification links, reset
links, magic links, tokens, privileged identifiers, or plaintext invite codes are
recorded in this note.

`NEXT_PUBLIC_APP_URL` was not set for the preview deployment. The work-email
confirmation URL helper can use Vercel's `VERCEL_URL` fallback, which produces a
real HTTPS preview URL for confirmation links.

## Smoke Test

Preview smoke checks confirmed:

- landing page loads over HTTPS
- landing page includes the `Beta Access` entry
- `Beta Access` routes into `/login?next=/app`
- `/login` renders with `200`
- `/signup` renders with `200`
- `/app` redirects to `/login?next=%2Fapp`
- `/app/verification` redirects to `/login?next=%2Fapp%2Fverification`
- malformed `/auth/confirm` requests do not `404`; they redirect safely back to
  login with an invalid/expired confirmation message

No work-email verification request was submitted during this deployment task.
No work-email confirmation email was sent during this deployment task.

## Founder Manual Next Test Steps

1. Open the Preview deployment URL.
2. Use the current preview for follow-on work-email verification testing now
   that normal account confirmation has succeeded.
3. Do not paste or record auth links, confirmation links, verification links,
   tokens, or full private emails.

## Caveats

- Production deployment remains separate.
- Corporate inbox deliverability still needs validation through the AA inbox and
  any available quarantine/spam controls.
- The Vercel project is not currently connected to a Git repository, so Preview
  environment values for this pass were supplied at deployment scope rather than
  saved as branch-scoped Preview project settings.
- Supabase Auth Site URL, redirect allowlist, and Confirm Signup template were
  updated for this preview origin and `/auth/callback` / `/auth/confirm`
  routes. Production-domain auth configuration remains a separate future step.
- Normal account confirmation was runtime-validated successfully from a
  controlled inbox. See
  `docs/ops/account-confirmation-callback-runtime-pass.md`.
