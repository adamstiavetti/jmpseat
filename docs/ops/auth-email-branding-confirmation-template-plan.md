# Auth Email Branding / Confirmation Template Readiness

Date: 2026-06-08

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Auth email branding must be improved before broader non-founder private-beta
testing.

The current product state supports:

- Supabase Auth-native account signup confirmation with a six-digit code UI
- Supabase Auth password reset with callback recovery
- legacy-safe `/auth/confirm` and `/auth/callback` handling for Supabase auth
  links/codes
- app-owned work-email verification email delivery for airline employee email
  confirmation

This task is a readiness/ops package. It does not change app auth logic,
Supabase settings, SMTP settings, DNS, Vercel, or runtime data.

## 2. Current Auth Email Surface

Current relevant auth emails are:

1. Account confirmation / signup code email
2. Password reset email
3. Email change confirmation email, if enabled in Supabase Auth
4. Magic link / login link email, if enabled in Supabase Auth
5. Work-email verification email for airline employee email confirmation

Currently not active as a branded auth-email requirement:

- invite-code distribution email
- beta approval / beta access activation email
- waitlist marketing or research email
- board/community notifications

There is no repo-owned invite or beta-access email flow that should be branded
in this task.

## 3. Ownership Split: Supabase Versus Repo

### Supabase dashboard/template owned

These flows are controlled primarily by Supabase Auth configuration and email
templates:

- account signup confirmation email
- password reset email
- email change confirmation email, if enabled
- magic link / login link email, if enabled

Repo evidence:

- `src/lib/auth/actions.ts`
  - `signUpAction()` calls `supabase.auth.signUp(...)`
  - `confirmAccountCodeAction()` calls `supabase.auth.verifyOtp(...)`
  - `resendAccountCodeAction()` calls `supabase.auth.resend(...)`
  - `requestPasswordResetAction()` calls
    `supabase.auth.resetPasswordForEmail(...)`
- `app/auth/callback/route.ts` exchanges Supabase callback codes and handles
  password reset recovery routing
- `app/auth/confirm/route.ts` verifies Supabase `token_hash` flows for:
  - `signup`
  - `recovery`
  - `invite`
  - `magiclink`
  - `email_change`

### Repo-owned

This flow is app-owned and not Supabase-template owned:

- work-email verification email for airline employee email confirmation

Repo evidence:

- `src/lib/verification/workEmailConfirmation.ts`
  - reads `RESEND_API_KEY`
  - reads `RESEND_FROM_EMAIL`
  - reads `NEXT_PUBLIC_APP_URL` / `VERCEL_URL`
  - defines `WORK_EMAIL_CONFIRMATION_EMAIL_SUBJECT`
  - builds the actual work-email verification email copy in
    `buildWorkEmailConfirmationEmail(...)`

Important nuance:

- The app still has legacy-compatible work-email confirmation link plumbing via
  `/app/verification/confirm`.
- The current repo-owned work-email email copy is code-first, not link-first.

## 4. Current Auth Flow Baseline

### Account signup confirmation

- User signs up at `/signup`
- `signUpAction()` sends `emailRedirectTo = <origin>/auth/callback`
- User is redirected to the code-first confirm state on `/signup?mode=confirm`
- User enters the six-digit account code from the Supabase email
- `confirmAccountCodeAction()` verifies the code with Supabase Auth

This is already runtime-confirmed on stable beta in
`docs/ops/auth-detour-closeout-runtime-pass.md`.

### Password reset

- User requests reset at `/reset-password`
- `requestPasswordResetAction()` sends:
  - `redirectTo = <origin>/auth/callback?next=/reset-password&mode=update`
- Supabase recovery email is sent
- Callback route resolves recovery into `/reset-password?mode=update`
- User sets a new password through the existing app form

### Magic link and email change

- The repo has route support for Supabase `magiclink` and `email_change`
  confirmation types in `app/auth/confirm/route.ts`
- The repo does not expose a first-class magic-link login UI today
- These templates are relevant only if enabled in Supabase Auth

### Work-email verification

- The app sends a repo-owned work-email verification message
- Current UX is code-first on `/app/access-hold`
- The email is for airline employee email control only
- It is explicitly separate from:
  - account signup confirmation
  - beta invite code
  - role/base claims
  - employer endorsement

## 5. Redirect And Callback URL Matrix

These values must be correct before broader beta testing.

### Stable beta

Primary auth host:

- `https://beta.jmpseat.com`

Required auth callback target:

- `https://beta.jmpseat.com/auth/callback`

Reset recovery callback target:

- `https://beta.jmpseat.com/auth/callback?next=/reset-password&mode=update`

Notes:

- Stable beta is the current private beta/auth/admin surface
- auth emails should not target `jmpseat.com` or `www.jmpseat.com`
- public waitlist domains are not auth callback targets

### Preview/testing

If founder/Yuri testing uses a preview deployment, Supabase Auth must allow the
preview origin used for:

- `/auth/callback`
- `/auth/confirm`
- `/reset-password` recovery handoff through `/auth/callback`

Notes:

- preview URLs should be explicitly reviewed before use
- do not assume arbitrary preview URLs are allowlisted
- bounded preview-domain strategy is preferable to ad hoc per-link behavior if
  the ops model allows it

### Local/dev

Local/dev should support:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`

Notes:

- local auth settings are for development/testing only
- localhost should never be the live beta target in real tester emails

### Work-email verification app URL

Repo-owned work-email verification depends on:

- `NEXT_PUBLIC_APP_URL`
  or
- `VERCEL_URL` fallback

This value must resolve to the intended app origin for the environment sending
the email.

For broader beta readiness, the intended work-email verification origin should
be the stable beta host, not the public waitlist root.

## 6. Sender / From Name / Domain Requirements

Before broader beta:

- use a branded sender name such as `jmpseat`
- use a branded from address on a controlled jmpseat domain
- do not use generic Supabase-looking sender branding for real tester trust
- do not use a personal mailbox as the long-term sender identity

Recommended sender examples:

- `no-reply@jmpseat.com`
- `support@jmpseat.com`

Sender setup likely requires:

- SPF
- DKIM
- DMARC

This task does not choose or configure the provider. It only defines the
readiness requirement.

## 7. Content Requirements For Branded Emails

All auth emails should:

- clearly say `jmpseat`
- feel operational and trustworthy, not promotional
- avoid implying public launch or open signup
- avoid claiming employer endorsement
- avoid proof/badge/document upload language
- avoid exposing sensitive profile, verification, or admin data
- explain the next step in plain language
- include an ignore-this-email line for unexpected requests

All auth emails should avoid:

- marketing-heavy tone
- feature promises that are not implemented
- language implying invite code alone grants access
- language implying account signup equals airline eligibility
- public/private-beta overclaim
- internal implementation detail like tokens, selectors, or storage behavior

## 8. Draft Email Templates

These drafts are product-copy targets. Do not paste real Supabase template
placeholders, live links, or secrets into docs.

### 8.1 Account confirmation / signup code email

Ownership:

- Supabase dashboard template

Subject:

```text
Confirm your jmpseat account
```

Body:

```text
You are creating a jmpseat account.

Enter the six-digit code from this email in jmpseat to finish account setup.

Account confirmation is separate from airline employee email verification and
beta access.

If you did not request this, you can ignore this email.
```

Additional note:

- if Supabase requires a displayed code placeholder, keep the template code-first
- do not emphasize a clickable confirmation link if the product UX is code-first

### 8.2 Password reset email

Ownership:

- Supabase dashboard template

Subject:

```text
Reset your jmpseat password
```

Body:

```text
We received a request to reset the password for your jmpseat account.

Use the secure link in this email to choose a new password.

If you did not request this, you can ignore this email.
```

Additional note:

- password reset is link-driven in the current repo flow
- the copy should make the expected domain clear if template controls allow it

### 8.3 Magic link / login link email

Ownership:

- Supabase dashboard template, if enabled

Current product status:

- route support exists
- first-class magic-link login UI is not currently exposed

Subject:

```text
Sign in to jmpseat
```

Body:

```text
Use the secure sign-in link in this email to continue to jmpseat.

This link is for account access only. Airline employee email verification and
beta access requirements may still apply after sign-in.

If you did not request this, you can ignore this email.
```

### 8.4 Email change confirmation

Ownership:

- Supabase dashboard template, if enabled

Subject:

```text
Confirm your new jmpseat email address
```

Body:

```text
Confirm this email change to continue using your jmpseat account.

Changing your account email does not by itself verify airline employee
eligibility or change beta access status.

If you did not request this, you can ignore this email.
```

### 8.5 Work-email verification email

Ownership:

- repo-owned app email copy

Current relevance:

- active and current
- used for airline employee email control verification

Recommended subject:

```text
Verify your airline employee email for jmpseat
```

Recommended body:

```text
Enter this six-digit code in jmpseat to confirm control of this airline
employee email address.

This verifies control of the email address only.
It does not verify role, base, seniority, or employer endorsement.

jmpseat is independent and is not sponsored by any airline, airport, union, or
employer.

If you did not request this, you can ignore this email.
```

Repo note:

- this already broadly matches the current app-owned copy in
  `src/lib/verification/workEmailConfirmation.ts`

## 9. Manual Supabase Dashboard Steps

Likely required manual steps:

1. Open the correct Supabase project/environment
2. Confirm whether the target is stable beta, preview testing, or local/dev
3. Review Auth Site URL
4. Review Auth redirect allowlist
5. Review Confirm Signup template
6. Review Password Reset / Recovery template
7. Review Email Change template, if enabled
8. Review Magic Link template, if enabled
9. Review sender/from name and from address
10. Review custom SMTP configuration if moving off default sender behavior
11. Record the resulting settings at a boolean/checklist level only

Do not paste:

- SMTP credentials
- provider API keys
- live template variables copied from the dashboard
- real confirmation links
- real recovery links
- magic links
- user email addresses

## 10. Manual Provider / Sender Steps

Before broader beta:

1. Decide the sender domain and mailbox
2. Configure SPF, DKIM, and DMARC
3. Configure custom SMTP/provider if Supabase should stop sending from
   default-looking branding
4. Confirm the sender name and from address match jmpseat branding
5. Confirm reply-handling expectations for support mailboxes

## 11. Runtime Validation Checklist After Settings Change

Do this only in a later approved runtime task.

### Signup confirmation

- create a safe founder-controlled account signup
- confirm the email arrives
- confirm the sender is branded as jmpseat
- confirm the message is code-first and not confusingly link-first
- confirm the code is six digits
- confirm the callback target is the intended beta/preview host
- confirm account confirmation lands in the existing post-auth flow

### Password reset

- request a reset for a safe founder-controlled account
- confirm the email arrives
- confirm sender/from branding
- confirm the reset flow lands in `/reset-password?mode=update` through the
  bounded callback path
- confirm updated-password flow returns the user to login safely

### Magic link / email change

- validate only if these flows are actually enabled
- confirm callback/confirm routes land on the expected host
- confirm the emails do not overpromise access or eligibility

### Work-email verification

- confirm sender/from branding for the app-owned work-email message
- confirm the message stays code-first
- confirm no proof-upload or invite-code language appears
- confirm the message does not expose internal link/query details
- confirm access-hold code entry still matches the email copy

### General checks

- mobile rendering looks credible
- no localhost target in live tester emails
- no public waitlist/root-domain auth targeting
- no secrets, tokens, or private identifiers captured in notes/screenshots

## 12. What Is Not Done Yet

Not done by this task:

- no Supabase dashboard changes
- no SMTP/provider change
- no DNS change
- no Vercel change
- no auth-behavior change
- no test emails sent
- no runtime validation performed
- no Closed Beta Login widening
- no invite or beta-access email implementation

## 13. Open Decisions / Blockers

User or operator decisions still required:

1. Which sender domain/address should be used for broader beta
2. Whether custom SMTP is required before any non-founder testing
3. Whether preview testing should be supported for auth emails, or whether all
   real auth-email validation should be pinned to `beta.jmpseat.com`
4. Whether magic-link and email-change templates need active branding work now
   or can stay as conditional follow-ups if those flows remain disabled

## 14. Source Of Truth Statement

This doc is the current readiness package for branded jmpseat auth emails.

It defines:

- current auth-email ownership
- required copy shape
- required callback/redirect expectations
- likely manual dashboard/provider steps
- runtime validation requirements

It does not change app code, migrations, Supabase dashboard settings, SMTP
settings, DNS, launch mode, beta gates, or invite behavior.
