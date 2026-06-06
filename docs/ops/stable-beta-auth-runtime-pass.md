# Stable Beta Auth Runtime Pass

## Summary

- Date: 2026-06-06
- Commits present on `main`:
  - `e31b0dc` `fix: support account confirmation callback`
  - `87695a8` `feat: add beta access landing entry`
  - `a35718b` `feat: add work email confirmation flow`
- Stable private-beta URL: `https://beta.jmpseat.com`
- Validation scope: stable beta auth only
- Public launch: not performed
- Production deploy: not changed in this pass
- Root `jmpseat.com`: unchanged

This runtime pass validates Lane 1 only: stable beta auth on
`https://beta.jmpseat.com`.

`beta.jmpseat.com` is now the stable private-beta testing URL for jmpseat. This
is not a public launch surface. `private_testing` remains active.

## Stable Beta Host Result

Safe runtime validation confirmed:

- public DNS for `beta.jmpseat.com` resolves to the expected Vercel edge target
- the stable beta alias serves the current ready Vercel deployment
- the landing page loads on the stable beta host
- the landing page includes the `Beta Access` entry
- `Beta Access` routes into `/login?next=/app`
- `/login` renders
- `/signup` renders
- `/app` remains protected and redirects into the login flow
- malformed `/auth/confirm` requests do not `404` and are handled safely

## Safe Auth Configuration Validation

Safe boolean-level validation confirmed:

- Site URL uses the stable beta host: yes
- Confirm Signup flow targets `/auth/confirm`: yes
- Confirm Signup flow uses token-hash confirmation: yes
- localhost confirmation target remains the default: no
- stable beta auth routes are allowed for the live confirmation flow: yes

These checks are recorded without raw Auth config responses, SMTP config, auth
links, confirmation links, verification links, reset links, magic links, or
tokens.

## Fresh Account Confirmation Result

A fresh signup was created from the stable beta signup surface using a
founder-controlled test inbox alias.

Runtime validation confirmed:

- the confirmation email arrived in the controlled inbox
- the confirmation email targeted `beta.jmpseat.com`, not localhost and not a
  throwaway preview origin
- the confirmation flow did not hang on `about:blank`
- the confirmation flow did not hit `Missing authentication callback code`
- account confirmation succeeded
- the confirmed user landed in the expected post-auth profile onboarding flow at
  `/app/profile`

No beta grant, invite redemption, or work-email confirmation was tested in this
pass.

## Founder Access Note

`jmpseat.com` remains active as a temporary approved test domain for
founder-controlled work-email verification testing.

That temporary test domain was not disabled here and should remain temporary
test-only until a proper founder/admin access path is implemented.

## Follow-Ups Still Separate

- work-email code fallback remains a separate follow-up
- AA/link-only employer-email delivery and verification reliability remain a
  separate follow-up
- founder/admin bypass access was not implemented here

## Validation Run

- `node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `node --test test/verification/workEmailConfirmation.test.mts test/verification/verificationSurface.test.mts`
- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

Results:

- all listed tests passed
- `npm run lint` passed with only the known unrelated warnings in
  `app/lab/live-globe-proof/page.tsx` and
  `src/lib/scroll/heroFlightControl.ts`
- `npm run typecheck` passed
- `npm run build` passed
- `git diff --check` passed

## Security Handling

- No secrets, environment values, SMTP credentials, auth links, confirmation
  links, verification links, reset links, magic links, tokens, full private
  emails, privileged identifiers, or plaintext invite codes are recorded here.
- No code changes, migrations, or launch-mode changes were made in this pass.

## Caveats

- Local Chrome on this machine still showed stale DNS for `beta.jmpseat.com`
  even though public DNS resolution and the live beta alias were correct. This
  did not block runtime confirmation validation, but it is worth keeping in mind
  for local operator testing.
- This pass validates stable beta auth only. It does not represent a public
  launch.
