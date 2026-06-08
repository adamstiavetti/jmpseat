# Security Headers Hardening

Date: 2026-06-08

## Summary

This patch adds app-owned production security headers for public and private
beta routes without changing application behavior, database behavior, auth
settings, or runtime data.

The prior deployed responses were missing common browser hardening headers
beyond Vercel-provided HSTS. The app now sets a safe global header policy
through `next.config.ts`.

## Headers Added

The following headers are applied to all app routes via `headers()`:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` with restrictive defaults for camera, microphone,
  geolocation, payment, USB, and other device/browser capabilities not used by
  jmpseat.
- `X-Frame-Options: DENY`
- `Content-Security-Policy: frame-ancestors 'none'`
- `Content-Security-Policy-Report-Only` with a broader baseline policy for
  scripts, styles, images, fonts, forms, objects, and Supabase/Vercel
  connections.

`poweredByHeader` is disabled so Next.js does not emit `X-Powered-By`.

## CSP Decision

Anti-framing is enforced immediately with:

- `Content-Security-Policy: frame-ancestors 'none'`
- `X-Frame-Options: DENY`

The broader CSP is intentionally `Content-Security-Policy-Report-Only` for this
pass. The app uses Next.js/Vercel runtime behavior, Supabase browser/server auth
flows, generated assets, and framework-managed inline script/style behavior.
Moving directly to a strict enforcing CSP would risk breaking auth callbacks,
client hydration, Vercel assets, or Supabase connections without a staged
browser/runtime pass.

Follow-up hardening can tighten and enforce the broader CSP after observing and
testing runtime reports across public apex, `www`, and beta.

## HSTS Decision

Vercel already emits HSTS on the live domains. This patch does not add an
app-managed `Strict-Transport-Security` header and does not add
`includeSubDomains` or `preload`.

Reason: HSTS preload/subdomain behavior has domain-wide implications and should
not be changed without a dedicated domain/security review.

## Scope

Headers are intended to cover:

- public waitlist routes: `/`, `/privacy`, `/terms`
- beta/auth/admin/app routes: `/login`, `/auth/...`, `/app`, `/app/admin/...`

The policy is deliberately compatible with:

- Supabase auth redirects/callbacks
- Vercel/Next.js runtime assets
- public social preview images
- private beta/auth/admin routing

## Boundaries Preserved

This patch does not change:

- public waitlist content or behavior
- waitlist database behavior
- private-app operator scope gate behavior
- security-events trust-boundary behavior
- proof upload validation behavior
- proof bucket privacy
- beta grants
- operator grants
- role claims
- base claims
- restricted-board claims
- private beta auth settings

No migrations were created. No Supabase `db push` was run. No DNS change,
Supabase setting change, or runtime data mutation was part of this patch.

## Validation Status

Code/test validation covers:

- app-owned security headers are configured globally
- anti-framing is enforced
- broader CSP is report-only
- app-managed HSTS/preload is not added
- public waitlist tests still pass
- auth/private-app/security-events/proof validation tests still pass

## Runtime Pass

Runtime deployment validation was completed on 2026-06-08 after merge to
`main`.

Deployed commit:

- `8558d2d fix: add security response headers`

Deployment and domain behavior:

- `https://jmpseat.com` was explicitly aliased to the new production deployment.
- `https://www.jmpseat.com` was explicitly aliased to the same production
  deployment.
- `https://beta.jmpseat.com` was explicitly aliased to a separate preview
  deployment for the private beta/auth/admin surface.
- No DNS changes were made.
- No Supabase settings were changed.
- No database migrations were created or applied.
- No runtime data was mutated.

Header validation passed on:

- `https://jmpseat.com/`
- `https://www.jmpseat.com/`
- `https://jmpseat.com/privacy`
- `https://jmpseat.com/terms`
- `https://beta.jmpseat.com/login`
- `https://beta.jmpseat.com/app`

Each checked response included:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- restrictive `Permissions-Policy`
- `X-Frame-Options: DENY`
- enforcing `Content-Security-Policy` containing `frame-ancestors 'none'`
- `Content-Security-Policy-Report-Only`
- Vercel-provided `Strict-Transport-Security`

Each checked response also confirmed:

- `X-Powered-By` was absent.
- HSTS did not include app-added `includeSubDomains` or `preload`.

Public behavior preservation:

- `https://jmpseat.com/`, `https://jmpseat.com/#top`,
  `https://www.jmpseat.com/`, and `https://www.jmpseat.com/#top` loaded at
  `scrollY: 0`.
- The public waitlist form still rendered on apex and `www`.
- Public pages still did not expose Beta Access, `/login?next=/app`, proof
  upload, badge upload, document upload, or manual-review upload copy.
- Privacy and Terms pages returned successfully.
- The metadata-defined social preview image
  `/jmpseat/social-preview.png` returned successfully on apex and `www`.
- No raw email or token appeared in the checked public URLs.

Beta behavior preservation:

- `https://beta.jmpseat.com/login` rendered successfully.
- Signed-out `https://beta.jmpseat.com/app` redirected to beta login.
- Signed-out `https://beta.jmpseat.com/app/admin/waitlist` redirected to beta
  login.
- No beta grants, role claims, base claims, restricted-board claims, or private
  beta auth settings were changed.

CSP remains split:

- Anti-framing is enforced with `frame-ancestors 'none'`.
- The broader baseline CSP remains report-only.
- No CSP `report-uri` or `report-to` endpoint is configured yet; future CSP
  enforcement work should add a supported report endpoint before relying on
  centralized report collection.

This security hardening item is closed.
