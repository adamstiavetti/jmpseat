# Beta Domain Stable Testing Setup

## Purpose

`https://beta.jmpseat.com` is the intended stable private-beta testing URL for
jmpseat. This is not a public launch URL. Private testing posture remains in
place and the app must continue to run with `JMPSEAT_LAUNCH_MODE=private_testing`.

## Current Vercel Status

- Linked Vercel project: `jmpseat`
- Git-connected to repository: no
- Production branch auto-deploy from `main`: not configured
- Safe one-off deployment performed from current `main`: yes
- Current deployed Vercel URL:
  `https://jmpseat-drnzd8xpn-adam-stiavetti-s-projects.vercel.app`
- Vercel-side alias created for `beta.jmpseat.com`: yes

Because the Vercel project is not Git-connected, future `main` pushes will not
automatically update `beta.jmpseat.com` yet. That remains a follow-up Vercel
project configuration step.

## Environment Variables

The Vercel environment serving the stable beta target now has these names
configured:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `JMPSEAT_LAUNCH_MODE`
- `NEXT_PUBLIC_APP_URL`

Stable beta intent:

- `JMPSEAT_LAUNCH_MODE` should remain `private_testing`
- `NEXT_PUBLIC_APP_URL` should resolve to `https://beta.jmpseat.com`

No values are recorded in this note.

## DNS Record Required

Vercel accepted `beta.jmpseat.com` and returned a DNS action requirement for
the external DNS provider.

Required Namecheap record:

- Type: `A`
- Host: `beta`
- Value / Target: `76.76.21.21`
- TTL: Namecheap default / automatic is acceptable unless a different house
  standard is preferred

Status after stable-beta auth validation:

- Vercel-side domain attachment: complete
- Namecheap DNS change: completed outside this note's original setup pass
- Public DNS resolution for `beta.jmpseat.com`: live

## Supabase Auth Status

Stable beta requires Supabase Auth to use `https://beta.jmpseat.com` rather than
the previous throwaway preview origin for:

- Site URL
- redirect allowlist
- Confirm Signup template routing

Intended stable beta configuration:

- Site URL: `https://beta.jmpseat.com`
- Redirect URLs:
  - `https://beta.jmpseat.com`
  - `https://beta.jmpseat.com/auth/callback`
  - `https://beta.jmpseat.com/auth/confirm`
  - `https://beta.jmpseat.com/**`
- Confirm Signup template link target:
  - `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`

Stable-beta auth runtime validation has now confirmed the saved Auth behavior is
using the stable beta host and the app-supported confirmation route.

Manual Supabase dashboard reference:

1. Open project `jmpseat` in Supabase.
2. Go to `Authentication -> URL Configuration`.
3. Set Site URL to `https://beta.jmpseat.com`.
4. Ensure the beta redirect URLs above are present.
5. Go to `Authentication -> Emails`.
6. Confirm the Confirm Signup template routes through
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`.
7. Save and verify no localhost or throwaway preview origin remains as the
   default account-confirmation target.

## Smoke Test Results

Smoke test ran successfully against the deployed Vercel URL:

- waitlist page loads
- `Beta Access` entry appears
- `Beta Access` routes to `/login?next=/app`
- `/login` renders
- `/signup` renders
- `/app` remains protected and redirects into login flow
- malformed `/auth/confirm` does not `404` and is handled safely

Public smoke testing later confirmed `https://beta.jmpseat.com` is live and
serving the expected stable beta deployment.

See `docs/ops/stable-beta-auth-runtime-pass.md` for the completed stable beta
auth runtime proof.

## Known Caveat

AA-domain work-email deliverability remains unresolved. Link-only work-email
verification is not an acceptable sole launch path for DFW / AA and still needs
separate design and hardening work.
