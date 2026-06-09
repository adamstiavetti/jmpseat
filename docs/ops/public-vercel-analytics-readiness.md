# Public Vercel Analytics Readiness

Date: June 8, 2026

## Status

Prepared for review on branch `feat/public-vercel-analytics`.

This pass instruments Vercel Web Analytics for the public jmpseat
waitlist/marketing surface only. It does not add Google Analytics, GA4, Google
Tag Manager, Speed Insights, or private-app analytics.

## Scope

Tracked after deployment:

- `https://jmpseat.com/`
- `https://jmpseat.com/privacy`
- `https://jmpseat.com/terms`
- `https://www.jmpseat.com/`
- `https://www.jmpseat.com/privacy`
- `https://www.jmpseat.com/terms`

Explicitly not tracked by the app-owned wrapper:

- `beta.jmpseat.com`
- `/login`
- `/signup`
- `/reset-password`
- `/auth/*`
- `/app/*`
- `/admin/*`
- `/lab/*`

The route and host allowlist is implemented in
`src/components/analytics/PublicVercelAnalytics.tsx`.

## Privacy Copy

The public Privacy page now discloses that jmpseat uses Vercel Web Analytics on
the public waitlist, Privacy, and Terms pages to understand basic page traffic
and performance for the public marketing surface.

The copy also states that analytics are not enabled on private beta, auth,
admin, app, or lab routes, and that Google Analytics is not enabled in this
implementation.

## Boundaries Preserved

- Public waitlist behavior is unchanged except for the route-gated analytics
  component.
- Public root still must not expose Beta Access or `/login?next=/app`.
- No waitlist database behavior changed.
- No private beta/auth/admin route is intentionally tracked.
- No Vercel project settings, DNS records, Supabase settings, migrations, or
  runtime data were changed.
- The legacy/confusing Vercel project naming remains an ops-maturity cleanup
  item and was not changed.

## Review And Runtime Validation Pending

Before deployment, run:

```bash
node --test test/analytics/publicVercelAnalytics.test.mts
node --test test/waitlist/jmpseatWaitlist.test.mts
npm run typecheck
npm run lint
npm run build
git diff --check
```

After deployment, verify:

- The public pages above load on apex and `www`.
- Vercel Web Analytics appears only on the public allowlisted host/path
  combinations.
- `beta.jmpseat.com/login`, `beta.jmpseat.com/app`, admin routes, auth routes,
  and lab routes do not render the analytics component.
- Privacy copy is live before treating analytics as production-enabled.
