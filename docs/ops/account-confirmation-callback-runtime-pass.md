# Account Confirmation Callback Runtime Pass

## Summary

- Date: 2026-06-06
- Commit validated: `e31b0dc`
- Preview URL used: `https://jmpseat-8v4031st9-adam-stiavetti-s-projects.vercel.app`
- Validation scope: Vercel Preview only
- Production deployment: not run
- DNS changes: none

This runtime pass validated normal jmpseat account signup confirmation against
the active Vercel preview after the account-confirmation callback fix shipped on
`main`.

## Safe Auth Configuration Checks

Safe validation confirmed:

- preview origin configured for signup confirmation: yes
- confirmation flow targets `/auth/confirm`: yes
- confirmation flow uses token-hash signup confirmation: yes
- localhost confirmation target still present: no
- preview auth routes allowed for callback/confirm handling: yes

These checks are recorded without raw Supabase Auth config responses, auth
links, or tokens.

## Runtime Result

A fresh preview signup was created using a founder-controlled test inbox alias.
The confirmation email arrived in the controlled mailbox.

Runtime validation confirmed:

- the fresh signup confirmation email no longer pointed to localhost
- the confirmation link opened the preview app instead of hanging on
  `about:blank`
- the user did not hit the `Missing authentication callback code` dead-end
- account confirmation succeeded
- the confirmed user landed in the expected post-auth profile onboarding flow at
  `/app/profile`

No work-email confirmation, beta invite redemption, or beta grant flow was
tested in this pass.

## Tests Run

- `node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `node --test test/verification/workEmailConfirmation.test.mts test/verification/verificationSurface.test.mts`
- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

All passed during this runtime validation pass.

## Security Handling

- No raw Supabase Auth config responses were copied into docs.
- No auth links, confirmation links, work-email verification links, reset links,
  magic links, tokens, or full private emails are recorded here.
- No secrets, environment values, SMTP credentials, or privileged identifiers
  are recorded here.

## Caveats

- This is preview-only validation.
- Production-domain Site URL, redirect allowlist, and confirmation template
  settings still need a separate production cutover pass.
