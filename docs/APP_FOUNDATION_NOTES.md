# App Foundation Notes

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## M1A Scope

M1A creates the first narrow app-code slice for jmpseat:

- Minimal Next.js App Router foundation.
- TypeScript strict mode.
- ESLint.
- Public splash/waitlist landing page.
- Private beta placeholder route.
- External waitlist CTA via environment variable.

This slice is a validation asset and founder-pitch surface. It is not the full product and does not implement private beta workflows.

## Implemented Routes

- `/`: public splash/waitlist landing page.
- `/app`: private beta placeholder that says access is required and links back to `/`.

## Visual Direction

The splash page follows the approved jmpseat mockup direction:

- Premium dark aviation-native landing page.
- Airside Night palette.
- Deep navy / black background.
- Charcoal/navy cards.
- Cloud-white text.
- Taxiway amber primary CTA.
- Signal-blue accents.
- Minimal runway-red for warnings and privacy boundaries.
- Boarding-pass inspired cards.
- Flight-board / terminal-signage microcopy.
- Route-line arcs and airport-code labels.
- Crew lounge plus airport ops aesthetic.

## Waitlist Behavior

The app does not store waitlist submissions.

Configure the external waitlist form URL with:

```bash
NEXT_PUBLIC_WAITLIST_FORM_URL=
```

If the variable is present, `/` shows `Join the Private Beta Waitlist` as an external link. If it is missing, `/` shows `Waitlist form coming soon.`

## Explicit Exclusions

This slice does not implement:

- Auth.
- User accounts.
- Supabase.
- Database schema or migrations.
- API routes for waitlist submission.
- Verification uploads.
- File storage.
- Crew Rooms functionality.
- Base Boards functionality.
- Layover Boards functionality.
- Posts or comments.
- Moderation dashboard.
- Admin dashboard.
- AI / Jumpseat Brief functionality.
- Payments.
- Marketplace.
- Native mobile.
- Schedule integrations.
- Airline portal login.
- Flight-load requests.
- Public nearby crew tracking.
- Dating/swiping.

## Checks To Run

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

## Known Limitations

- The waitlist CTA depends on an external form URL.
- No analytics SDK is included.
- No backend or persistence exists.
- The `/app` route is a static placeholder, not an authenticated area.
- The landing page uses CSS-only visual accents rather than image assets.

## Next Recommended Task

Review the M1A splash page in browser at desktop and mobile widths, then decide whether to connect a real external waitlist form URL or prepare a narrow M1B private app shell prompt. Do not start auth, database, verification, community, AI, or admin work without a new scoped task.
