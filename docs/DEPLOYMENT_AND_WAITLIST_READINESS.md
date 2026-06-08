# Deployment and Waitlist Readiness

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

This guide prepares the current public waitlist app for preview or production
deployment and first-party waitlist capture.

The public page is a validation surface, not the full jmpseat product.
Deployment should help review the landing page, validate first-party email
capture, and support controlled first outreach. It should not add user accounts,
verification, community features, AI, payments, analytics SDKs, or airline
integrations.

Current post-E05 update:

- Use `ops/post-e05-public-waitlist-launch-plan.md` as the current launch plan
  for the public `jmpseat.com` waitlist release.
- `jmpseat.com` should serve the public waitlist/marketing page only.
- Public `jmpseat.com` should not expose Beta Access.
- `beta.jmpseat.com` remains the private beta/auth/admin/operator surface.
- First-party jmpseat capture is the public waitlist path.
- Tally is backup/research-only unless intentionally reintroduced later.
- First-party waitlist funnel metrics and the operator/admin dashboard are now
  implemented and runtime-proven through existing waitlist signup/survey data.
- Use `ops/public-waitlist-launch-readiness-check.md` as the current W05
  cutover-readiness source of truth before moving the public waitlist to
  `jmpseat.com`.
- W05A addressed the prior metadata/legal blockers in code.
- The merged public-waitlist copy polish now also aligns the homepage, Privacy,
  and Terms copy with the actual public waitlist and optional survey behavior.
- Founder manual visual QA passed, and the public root cutover is now
  runtime-proven on `https://jmpseat.com`.
- `www.jmpseat.com` is now configured and smoke-tested against the same public
  waitlist deployment as apex.
- Root `jmpseat.com` serves the public waitlist/marketing page only, while
  `beta.jmpseat.com` remains the private beta/auth/admin/operator surface.
- The Epoch 5 private-app operator override hardening is now merged, pushed,
  beta-deployed, and runtime-proven at `03d7455`: only the dedicated
  `operator.internal_private_app_access` scope grants internal private-app
  override. Unrelated operator/admin tooling scopes no longer grant app-entry
  override, and no beta grants or runtime operator grants were changed by this
  fix.
- The Epoch 5 security-events trust-boundary fix is now merged, singly migrated,
  deployed, and runtime-proven at `ba74e02`: direct authenticated/anon inserts
  into trusted `security_events` are removed, legacy rows are marked
  `legacy_unverified`, future server rows default to `trusted_server`, and
  operator/admin audit readers filter to trusted server-produced rows. No broad
  Supabase `db push`, runtime grants, DNS changes, Supabase setting changes, or
  beta alias disruption occurred.
- A pending proof-upload content-validation hardening patch stops redacted proof
  upload from trusting browser MIME metadata or filename extensions alone. Proof
  files must pass server-side JPEG/PNG byte validation before private Storage
  upload, while proof bucket privacy, reviewer signed-URL controls, public
  waitlist behavior, and security-events trust-boundary behavior remain
  unchanged. Runtime deploy validation remains pending after review/merge.
- Duplicate-survey-token hardening is migrated, deployed, and runtime-proven on
  apex and `www`: duplicate waitlist submissions no longer receive existing
  survey tokens or edit another signup's optional survey answers. The app still
  intentionally fails closed for any legacy token-only signup RPC response
  rather than trusting a shape that cannot distinguish new signups from
  duplicates.
- W05A also adds a dedicated `1200 x 630` social preview image so Open Graph
  and Twitter metadata match the actual asset dimensions.

## 2. Current App Scope

Implemented:

- Public splash page at `/`.
- Private beta placeholder at `/app`.
- First-party public waitlist email capture.
- Post-submit optional product-shaping follow-up questions.
- Safe duplicate submission behavior.
- Duplicate submissions do not receive another signup's optional survey token.
- The duplicate survey-token hardening rollout was completed migration-first;
  accepting legacy token-only RPC responses remains rejected because the legacy
  RPC cannot distinguish new signups from duplicates.
- Transient optional-survey save failures preserve the current session token for
  retry, while definitive invalid/consumed token states clear the cookie.
- Operator/admin-only waitlist dashboard at `/app/admin/waitlist`.

Intentionally not implemented:

- Public auth or user accounts on the waitlist page.
- Verification uploads or storage.
- Crew Rooms, Base Boards, Layover Boards, posts, comments, search, moderation,
  or public/admin community workflows.
- AI, payments, marketplace, third-party analytics SDK, schedule integrations,
  airline portal login, flight-load requests, nearby crew tracking, or
  dating/swiping.

## 3. First-Party Waitlist Capture Requirements

Use first-party jmpseat capture for the primary public waitlist. Tally should be
treated as backup/research-only unless a later task intentionally reintroduces
it.

| Field | Requirement | Notes |
| --- | --- | --- |
| Email | Required | Captured first and used for waitlist and product updates. |
| Aviation connection | Optional | Helps understand first-community role mix. |
| Base / airport community | Optional | Helps prioritize launch communities. |
| Product usefulness drivers | Optional | Multi-select, bounded to keep the follow-up low-friction. |
| Current alternatives used | Optional | Examples: Facebook groups, Reddit, group chats, crew apps, union pages, coworkers, notes. |
| Main pain point | Optional | General free text only. |
| Verification comfort | Optional | Tests trust and privacy needs without collecting proof. |
| Willing to shape beta | Optional | Identifies interview volunteers and seed contributors. |
| Referral source | Optional | Tracks high-level source/channel. |
| Privacy/trust concern | Optional | General free text only. |

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

If a respondent includes sensitive information in a free-text answer, do not
copy it into project docs or summaries. Delete or redact it according to the
selected data-retention process.

## 5. Recommended Public Waitlist Copy

Form title:

> Join the jmpseat private beta waitlist

Description:

> A private hub for airline workers, bringing base questions, layover recommendations, crew conversations, and everyday resources into one place.

Privacy/safety note:

> Please keep optional answers general. Do not share sensitive or confidential work details.

Confirmation message:

> You're on the waitlist. Help us prioritize your invite and shape jmpseat.

Independence disclaimer:

> jmpseat is independent and is not sponsored by or affiliated with any airline, airport, union, or employer.

## 6. Environment Setup

The first-party waitlist uses the existing Supabase public browser env names for
server-side RPC calls. Do not commit env values. Do not hard-code private form
URLs or tokens.

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
- Email input appears above the waitlist CTA.
- Email submission returns a safe success state.
- Duplicate submission returns a safe success state.
- Optional survey appears only after email capture.
- Optional survey can be submitted or skipped.
- Footer disclaimer is visible.
- Launch-ready root metadata is present for title, description, Open Graph,
  Twitter card, canonical URL handling, and indexable robots posture.
- Open Graph and Twitter image metadata points at a dedicated social preview
  asset whose file dimensions match the declared `1200 x 630` card size.
- `/privacy` and `/terms` render concrete effective dates.
- No public Beta Access entry appears.
- `/app/admin/waitlist` remains operator/admin-only and, when reviewed by an
  authorized founder/admin user, may show contact emails plus bounded survey
  detail while still hiding internal IDs and tokens.

## 8. Vercel Preview Deployment

Login:

```bash
npx vercel login
```

Create or deploy a preview:

```bash
npx vercel
```

Preview deployment review:

- Open the preview URL on desktop.
- Open the preview URL on mobile.
- Submit a non-sensitive test email.
- Confirm the safe success state appears.
- Confirm optional survey submit behavior.
- Confirm optional survey skip behavior.
- Confirm no sensitive data is requested by the public page.
- Confirm no official airline affiliation or legal/trademark clearance is implied.

## 9. Vercel Production Deployment

Production deployment should happen only after preview review.

Deploy production:

```bash
npx vercel --prod
```

Production checks:

- Verify the production URL loads.
- Verify the first-party waitlist email form works.
- Verify the optional survey submit and skip states work.
- Verify footer disclaimers are visible.
- Verify launch metadata and social preview posture are correct for
  `https://jmpseat.com`.
- Verify `/privacy` and `/terms` render concrete effective dates.
- Verify `/app` remains the private beta app surface and is not exposed from the
  public waitlist page.
- Verify no new features or data collection paths are present.

Root production cutover has been completed and runtime-proven for the apex
`https://jmpseat.com`. `www.jmpseat.com` is also configured and smoke-tested as
the same public waitlist experience.

## 10. Deployment Acceptance Checklist

- [x] Page loads at `/`.
- [x] Mobile layout works.
- [x] Waitlist email submit works.
- [x] Duplicate waitlist email submit is safe and friendly.
- [x] Optional survey submit works.
- [x] Optional survey skip works.
- [x] Public waitlist form does not request sensitive data.
- [x] No badge upload, ID upload, schedule, portal credential, exact hotel, passenger info, live location, or confidential document field exists.
- [x] No-official-affiliation disclaimer is visible.
- [x] Working-name/legal-trademark caveat is visible.
- [x] Public root metadata has title, description, Open Graph, Twitter card,
      canonical URL handling, and indexable robots posture.
- [x] Privacy and Terms pages use concrete effective dates.
- [x] `/app` remains the private beta app surface and is not exposed from the
      public waitlist page.
- [x] No public auth entry, verification uploads, community features, AI,
      payments, third-party analytics SDK, airline integrations, schedule
      scraping, flight-load requests, nearby crew tracking, or dating/swiping
      were added.

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

- Public auth entry.
- New database platform.
- New Supabase project.
- Verification uploads.
- File storage.
- Community features.
- Posts or comments.
- Moderation dashboards.
- AI features.
- Payments.
- Marketplace.
- Third-party analytics SDK.
- Production legal documents.
- Official airline affiliation claims.
- Legal/trademark clearance claims.

Next implementation work must be explicitly scoped in a new task and branch.
