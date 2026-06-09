# Public Vercel Analytics Runtime Pass

Date: June 8, 2026

## Summary

Public-only Vercel Web Analytics from `21ddf4b` was deployed to the active
`jmpseat` Vercel project and explicitly aliased to the public Production
domains:

- `https://jmpseat.com`
- `https://www.jmpseat.com`

`beta.jmpseat.com` was not aliased to the new Production deployment and remains
on its separate Preview deployment.

No DNS, Supabase settings, Vercel project settings, migrations, runtime data,
Google Analytics, GA4, Google Tag Manager, Speed Insights, or private-route
analytics changes were made.

## Deploy Method

Used a Production Vercel deploy with automatic domain movement skipped, then
explicitly aliased only:

- `jmpseat.com`
- `www.jmpseat.com`

The first apex alias attempt hit a local `npx` cache collision while a parallel
alias command was running; it did not complete. The apex alias was retried as a
single command and succeeded. `www` succeeded on the first alias command.

## Public Route Verification

The following routes returned `200` after aliasing:

- `https://jmpseat.com/`
- `https://www.jmpseat.com/`
- `https://jmpseat.com/privacy`
- `https://jmpseat.com/terms`

Browser checks confirmed:

- public waitlist renders on apex and `www`
- `/` and `/#top` load at `scrollY: 0`
- public root still has no `Beta Access`
- public root still has no `/login?next=/app` CTA
- public root still has no proof/badge/document/manual-review upload copy
- Privacy page includes the public-site Vercel Web Analytics disclosure

## Analytics Boundary Verification

Vercel Analytics script was present only on the public allowlisted host/path
combinations:

- `jmpseat.com` `/`
- `jmpseat.com` `/privacy`
- `jmpseat.com` `/terms`
- `www.jmpseat.com` `/`
- `www.jmpseat.com` `/privacy`
- `www.jmpseat.com` `/terms`

Analytics was absent from:

- `beta.jmpseat.com/`
- `beta.jmpseat.com/login`
- `beta.jmpseat.com/app`
- `jmpseat.com/login`
- `jmpseat.com/signup`
- `jmpseat.com/reset-password`
- `jmpseat.com/auth/confirm`
- `jmpseat.com/app`
- `jmpseat.com/lab/live-globe-proof`

`beta.jmpseat.com` still showed its Preview-only feedback script, which is
separate from the app-owned public Vercel Analytics wrapper.

## Non-Vercel Analytics Verification

Browser checks found no Google Analytics, GA4, Google Tag Manager, Speed
Insights, Plausible, PostHog, or Mixpanel scripts/requests on the checked
public, beta, auth, app, and lab routes.

## Dashboard/Data Caveat

The runtime pass verified deployed script presence and route exclusion in the
browser. Vercel Analytics dashboard pageview ingestion was not treated as a hard
pass/fail signal because CLI-visible analytics data can lag and no dashboard
setting was changed during this task.
