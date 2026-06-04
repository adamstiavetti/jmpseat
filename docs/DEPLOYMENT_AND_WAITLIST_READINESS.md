# Deployment and Waitlist Readiness

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

This guide prepares the current M1A splash/waitlist app for preview or production deployment and connection to an external waitlist form.

M1A is a public validation surface, not the full jmpseat product. Deployment should help review the landing page, connect a safe external waitlist CTA, and support controlled first outreach. It should not add internal waitlist storage, user accounts, verification, community features, AI, payments, analytics SDKs, or airline integrations.

## 2. Current App Scope

Implemented:

- Public splash page at `/`.
- Private beta placeholder at `/app`.
- External waitlist URL behavior through `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- Safe fallback message when `NEXT_PUBLIC_WAITLIST_FORM_URL` is missing.
- No internal data collection.

Intentionally not implemented:

- Auth or user accounts.
- Database, Supabase, migrations, or persistence.
- API routes for waitlist submissions.
- Verification uploads or storage.
- Crew Rooms, Base Boards, Layover Boards, posts, comments, search, moderation, or admin workflows.
- AI, payments, marketplace, analytics SDK, schedule integrations, airline portal login, flight-load requests, nearby crew tracking, or dating/swiping.

## 3. Tally Waitlist Form Requirements

Use Tally, or an equivalent external form tool, for waitlist capture. Do not collect waitlist submissions inside the app.

| Field | Requirement | Notes |
| --- | --- | --- |
| Preferred name | Optional | Use for outreach personalization only. |
| Email | Required | Use for waitlist, interview, and beta invite communication. |
| Aviation role | Required | Include flight attendant, pilot, gate agent, ramp agent, dispatcher, crew scheduler, airport ops, regional worker, new hire, commuter, and other aviation role. |
| Base / airport | Required | Use short text or structured choices if a first-base target exists. |
| Airline/company | Optional | Do not imply airline endorsement, partnership, or employer approval. |
| Current status | Required | Suggested choices: active worker, former worker, new hire, student/aspiring, other. |
| Feature interest ranking | Required | Rank Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, The Galley, NonRev Deals, Ready Room, Ramp Talk, and Crew Rest. |
| Current alternatives used | Optional | Examples: Facebook groups, Reddit, group chats, crew apps, union pages, coworkers, notes. |
| Main pain point | Optional | Ask for one base, layover, career, commute, or community pain. |
| Privacy/verification concern | Optional | Ask what would make private verification comfortable or uncomfortable. |
| Willing to interview | Optional | Yes/no/maybe. |
| Willing to be an ambassador | Optional | Yes/no/maybe. |
| Referral source | Optional | Track personal network, friend, group, Reddit, LinkedIn, or other. |

## 4. Public Waitlist Safety Rules

The public waitlist must not collect:

- Badge uploads.
- Company ID images.
- Government IDs.
- Employee numbers.
- Schedules or schedule screenshots.
- Airline portal credentials.
- Exact crew hotel information.
- Passenger information.
- Live location.
- Confidential company documents.
- Airport security procedures.
- Non-rev load information.

If a respondent includes sensitive information in a free-text answer, do not copy it into project docs or summaries. Delete or redact it according to the selected form tool's process.

## 5. Recommended Tally Copy

Form title:

> Join the jmpseat private beta waitlist

Form description:

> jmpseat is a working-name concept for a verified off-duty network for airline people. We are validating demand for base intel, layover boards, anonymous but accountable crew discussion, career tools, and crew-friendly perks before opening private beta access.

Privacy/safety note:

> Please do not upload or submit badges, IDs, employee numbers, schedules, airline portal credentials, exact crew hotel information, passenger information, live location, confidential company documents, or airport security procedures. If invited to beta, any verification steps will happen separately through a private process.

Confirmation message:

> You're on the waitlist. If your base, role, or airline fits the first private beta group, we may reach out for a short interview and separate verification steps. jmpseat is a working name pending legal/trademark clearance and is not affiliated with or endorsed by any airline, airport, union, or employer.

## 6. Environment Variable Setup

The app reads one public environment variable:

```bash
NEXT_PUBLIC_WAITLIST_FORM_URL=
```

Local setup:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```bash
NEXT_PUBLIC_WAITLIST_FORM_URL=https://your-external-form-url
```

Vercel Preview setup:

- Add `NEXT_PUBLIC_WAITLIST_FORM_URL` in the Vercel project environment variables.
- Scope it to Preview.
- Use the Tally form URL or the approved external waitlist URL.
- Redeploy the preview after adding or changing the variable.

Vercel Production setup:

- Add `NEXT_PUBLIC_WAITLIST_FORM_URL` in the Vercel project environment variables.
- Scope it to Production.
- Use only the reviewed external waitlist URL.
- Redeploy production after adding or changing the variable.

If the variable is missing, the splash page should show:

> Waitlist form coming soon.

## 7. Local Verification

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run build
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Local verification checks:

- `/` loads.
- `/app` shows the private beta placeholder.
- Waitlist CTA links to the external URL when `NEXT_PUBLIC_WAITLIST_FORM_URL` is set.
- Waitlist fallback appears when `NEXT_PUBLIC_WAITLIST_FORM_URL` is missing.
- Footer disclaimer is visible.
- No form fields collect data inside the app.

## 8. Vercel Preview Deployment

Login:

```bash
npx vercel login
```

Create or deploy a preview:

```bash
npx vercel
```

Add the environment variable:

- Open the Vercel project dashboard.
- Go to Settings -> Environment Variables.
- Add `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- Set the value to the reviewed external waitlist form URL.
- Select the Preview environment.

Redeploy preview:

```bash
npx vercel
```

Preview deployment review:

- Open the preview URL on desktop.
- Open the preview URL on mobile.
- Click the waitlist CTA.
- Confirm the CTA opens the external form in the expected destination.
- Confirm no sensitive data is requested by the external form.
- Confirm no official airline affiliation or legal/trademark clearance is implied.

## 9. Vercel Production Deployment

Production deployment should happen only after preview review.

Deploy production:

```bash
npx vercel --prod
```

Production checks:

- Verify the production URL loads.
- Verify the waitlist CTA links to the reviewed external form.
- Verify the fallback state is not accidentally showing unless intentionally deployed without a form URL.
- Verify footer disclaimers are visible.
- Verify `/app` remains a placeholder only.
- Verify no new features or data collection paths are present.

Do not deploy production until the founder or designated reviewer approves the preview.

## 10. Deployment Acceptance Checklist

- [ ] Page loads at `/`.
- [ ] Mobile layout works.
- [ ] Waitlist button works when `NEXT_PUBLIC_WAITLIST_FORM_URL` is configured.
- [ ] Fallback message works if `NEXT_PUBLIC_WAITLIST_FORM_URL` is missing.
- [ ] External waitlist form does not request sensitive data.
- [ ] No badge upload, ID upload, schedule, portal credential, exact hotel, passenger info, live location, or confidential document field exists.
- [ ] No-official-affiliation disclaimer is visible.
- [ ] Working-name/legal-trademark caveat is visible.
- [ ] `/app` remains a private beta placeholder only.
- [ ] No auth, database, Supabase, API persistence, verification uploads, community features, AI, payments, analytics SDK, airline integrations, schedule scraping, flight-load requests, nearby crew tracking, or dating/swiping were added.

## 11. First Outreach Readiness

Start with controlled feedback, not broad launch.

Recommended sequence:

1. Send the preview to 5 trusted aviation contacts first.
2. Ask whether the page is clear, credible, and trustworthy.
3. Ask what feels unsafe, confusing, overpromised, or not useful.
4. Ask them to review the waitlist form before sharing it more broadly.
5. Review initial responses for sensitive-data issues.
6. Fix copy or form-field issues before broader outreach.

Do not broadly launch until initial clarity and trust feedback is checked.

## 12. Known Non-Goals

This readiness pass does not create or approve:

- Auth.
- Database.
- Supabase.
- Internal waitlist capture.
- API persistence.
- Verification uploads.
- File storage.
- Community features.
- Posts or comments.
- Moderation or admin dashboards.
- AI features.
- Payments.
- Marketplace.
- Analytics SDK.
- Production legal documents.
- Official airline affiliation claims.
- Legal/trademark clearance claims.

Next implementation work must be explicitly scoped in a new task and branch.
