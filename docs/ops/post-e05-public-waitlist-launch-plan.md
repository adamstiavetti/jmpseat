# Post-E05 Public Waitlist Launch Plan

Date: 2026-06-07

Baseline commit: `8c7b0ca docs: record e05 grant management runtime proof`

## Summary

After the Epoch 5 operator/admin tooling closeout, the next focus is public
waitlist launch readiness. The public `jmpseat.com` surface should become a
polished waitlist/marketing page only, while `beta.jmpseat.com` remains the
private beta, auth, app, admin, and operator surface.

This is a planning note. The first-party waitlist capture implementation is now
tracked in `ops/public-waitlist-page-polish.md`. This plan still does not record
root-domain cutover, deployment, DNS changes, Vercel changes, Supabase runtime
settings changes, native-app work, admin dashboards, or runtime mutations.

## Domain Split

Current intent:

- `jmpseat.com` serves the public waitlist/marketing page only.
- Public `jmpseat.com` does not expose a Beta Access button.
- Public `jmpseat.com` does not expose a normal auth entry from the root
  waitlist page unless intentionally reintroduced later.
- `beta.jmpseat.com` remains the private beta/auth/admin/operator access
  surface.
- Private beta app gates remain unchanged.
- Founder/admin/operator access remains separate from airline-email eligibility.
- Beta invite-code behavior remains separate from public waitlist capture.

This split keeps public marketing simple while preserving the stable beta
runtime for account confirmation, login/signup, airline employee email
verification, beta access, profile completion, admin/operator tools, and runtime
validation.

## Public Waitlist Release Scope

Before releasing the public waitlist page on `jmpseat.com`, complete this
checklist:

- Polish page copy and design.
- Remove or hide Beta Access from the public domain.
- Confirm mobile responsiveness.
- Confirm SEO and social metadata.
- Confirm no private beta, admin, operator, proof, or privileged language leaks
  onto the public page.
- Confirm first-party email capture works.
- Confirm the post-submit optional product-shaping follow-up appears.
- Confirm optional answers can be submitted or skipped.
- Confirm accessibility basics: semantic headings, keyboard CTA access, visible
  focus, label/description clarity, color contrast, and reduced-motion safety if
  motion is present.
- Confirm analytics and event capture.
- Confirm production domain cutover plan.
- Confirm rollback plan.

The public page should remain a marketing and waitlist surface only. It should
not add account creation, work-email verification, beta invite redemption,
admin/operator entry, proof upload, badge upload, document upload, proof review,
community posts, board access, or runtime grants.

## First-Party Waitlist Capture

First-party jmpseat capture is the primary public waitlist path. Tally is no
longer the primary public waitlist capture path and should be treated as
backup/research-only unless intentionally reintroduced later.

Current implementation direction:

- Capture email directly on the public landing page.
- Persist email immediately before showing optional follow-up questions.
- Keep optional survey persistence server-owned so public clients cannot write
  arbitrary survey payloads directly.
- Enforce database-side survey allowlists, maximum selection counts, length
  bounds, empty-string normalization, and sensitive-content rejection.
- Use the optional question set from
  `ops/waitlist-question-research-selection.md`.
- Keep all follow-up questions optional.
- Do not expose Beta Access on the public page.
- Keep `beta.jmpseat.com` as the private beta/auth/admin/operator surface.

Data minimization:

- Store only necessary waitlist fields.
- Do not request employee IDs.
- Do not request badge/proof uploads.
- Do not request documents.
- Do not request schedules, screenshots, passenger data, airline portal
  credentials, exact crew hotel details, confidential company documents, airport
  security procedures, or privileged work details.
- Keep consent/copy clear that waitlist submission does not guarantee access,
  beta timing, airline-email verification, beta approval, role/base access, or
  restricted-board claims.

Operations:

- Assign a data owner for first-party waitlist responses before public launch.
- Keep exports out of the repo unless explicitly redacted and approved.
- Perform non-sensitive runtime validation before public release.
- Document any future Tally fallback before use.

## Metrics Capture Plan

The public waitlist launch should include first-party funnel metrics. Vercel Web
Analytics can supplement traffic visibility, but first-party metrics should own
product funnel data.

Recommended events:

- Public page viewed.
- Primary CTA clicked.
- Waitlist email submitted.
- Waitlist submit failed.
- Optional survey viewed.
- Optional survey submitted.
- Optional survey skipped.
- Source/referrer captured.
- UTM parameters captured.
- Device class and browser family captured if safe.
- Basic geography captured only if available safely and without sensitive
  precision.

Do not capture:

- Sensitive identifiers.
- Proof, badge, or document data.
- Account auth data on the public page.
- Work-email verification codes.
- Account confirmation codes.
- Invite codes.
- Private emails in event metadata.
- Raw IP addresses unless a reviewed privacy/legal decision explicitly allows
  that storage.

Recommended storage and viewing:

- Prefer a small first-party waitlist metrics/event table or an existing
  sanitized analytics/event path if one is already available when implemented.
- Use server-side event ingestion where practical so client events stay bounded.
- Add an admin viewer such as `/app/admin/waitlist` or equivalent once the
  metrics path exists.
- Keep dashboard access operator/admin scoped.

Recommended admin metrics cards:

- Total waitlist submissions.
- Submissions today.
- Submissions over 7 days.
- Submissions over 30 days.
- Landing page views.
- CTA clicks.
- Conversion rate.
- Top sources/referrers.
- Recent submissions, with sensitive data minimized.
- Failed submissions.

The metrics dashboard should not grant beta access, mutate airline-email
verification, issue role/base/restricted-board claims, or expose proof/upload
data.

## Architecture Direction

Hosting and web:

- Vercel remains the web hosting platform.
- `jmpseat.com` hosts the public waitlist/marketing page.
- `beta.jmpseat.com` hosts the private beta web app, auth, admin, and operator
  surfaces.
- Production domain cutover should be planned and reversible.

Backend:

- Supabase remains the shared backend/auth/database/storage platform.
- Web and future native clients should reuse Supabase-backed identity, data,
  authorization, and RPC/business-rule contracts.
- Product rules should not live only in Next.js/browser redirects.
- Private app gates, operator/admin authorization, beta access, airline-email
  eligibility, and future board/community permissions should remain
  server/database enforced.

Native:

- Expo/EAS is the preferred future native path for iOS and Android.
- The current app is not Expo today.
- Do not add Expo, React Native, EAS, native dependencies, or app-store
  configuration as part of the public waitlist launch.
- Native transition should happen after web/private beta core contracts
  stabilize.
- Future native clients should reuse Supabase and shared server-side/RPC
  business rules rather than duplicating gate logic in app-only screens.

## Proposed Next Ticket Sequence

1. `W01 First-Party Public Waitlist Capture`
   Implement first-party email capture on the public waitlist page, remove/no-show
   public Beta Access entry, add optional product-shaping follow-up questions,
   and keep private beta/auth/admin on `beta.jmpseat.com`.

2. `W02 Public Waitlist Runtime Validation`
   Apply the migration through the normal reviewed runtime path, validate a
   non-sensitive waitlist submission, duplicate submission, optional survey
   submission, and skip behavior.

3. `W03 Waitlist Metrics Event Capture`
   Add first-party public funnel events for page view, CTA click, email submit,
   submit failure, optional survey view, optional survey submit, optional survey
   skip, referrer/source, UTM, and safe device/browser metadata.

4. `W04 Admin Waitlist Metrics Dashboard`
   Add an operator/admin-scoped viewer for waitlist metrics, conversion,
   sources/referrers, recent submissions, and failed submissions without
   exposing sensitive data.

5. `W05 Public Domain Cutover To jmpseat.com`
   Prepare and execute the reversible production-domain cutover so the public
   waitlist page serves from `jmpseat.com` while `beta.jmpseat.com` remains the
   private beta/auth/admin surface.

6. `W06 Native App Architecture Readiness Note / Expo Prep`
   Document the eventual Expo/EAS path, shared Supabase backend contracts, and
   mobile-ready implementation gates before native work starts.

## Safety Boundaries

- Do not implement waitlist changes in this planning task.
- Do not deploy.
- Do not change DNS.
- Do not change Vercel settings.
- Do not change Supabase settings or runtime data.
- Do not create or edit migrations.
- Do not run Supabase db push.
- Do not print or store secrets, env values, private emails, identifiers,
  private links, tokens, plaintext codes, or invite codes.
- Do not reintroduce proof upload, badge upload, document upload, or proof
  review.
- Do not grant beta access.
- Do not mutate airline-email verification.
- Do not issue role/base/restricted-board claims.
- Do not implement community/baseboard features in the waitlist launch lane.

## Current Caveats

- The public page currently needs an implementation pass before it matches this
  domain split because the public route has historically included private-beta
  entry affordances.
- Existing waitlist readiness docs include older M1A/no-code assumptions. Treat
  this plan as the current post-E05 intent and keep older docs as historical
  context unless explicitly updated by a future ticket.
- Metrics implementation may require a later migration or analytics/event-table
  decision, but no schema work is part of this planning pass.
