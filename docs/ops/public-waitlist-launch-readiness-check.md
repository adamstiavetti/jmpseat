# Public Waitlist Launch Readiness Check

Date: 2026-06-08

Baseline commits:

- `4e68569 feat: add first party waitlist capture`
- `6eba81c docs: record public waitlist runtime pass`
- `75f53f0 polish: refine waitlist survey copy`
- `b88df14 docs: record waitlist survey copy runtime pass`
- `b9bd7e6 feat: add waitlist metrics dashboard`
- `b4fd9f5 docs: record waitlist metrics dashboard runtime pass`
- `2894c9e polish: refine admin access and waitlist dashboard`
- `653281d docs: record waitlist contact dashboard runtime pass`
- `80b68a2 docs: record founder waitlist dashboard visual pass`
- `9af7a91 polish: prepare public waitlist metadata`
- `44b1115 polish: refine public waitlist launch copy`
- `66f0127 fix: escape terms apostrophe`

## Readiness Status

Status: `Ready with final manual visual QA`

Summary:

- The first-party public waitlist flow is implemented and runtime-proven.
- The operator/admin waitlist dashboard is implemented and runtime-proven,
  including founder-confirmed full-contact mode for authorized admin use.
- The public/private domain split is clear in code, tests, and current docs.
- W05A code addressed the prior launch blockers by adding launch-ready public
  waitlist metadata, replacing placeholder Privacy/Terms effective dates, and
  tying the email helper text to the email input.
- The merged public-copy polish updates now also remove preview/internal legal
  wording and align the homepage, Privacy page, and Terms page with the actual
  public waitlist implementation.
- Open Graph and Twitter metadata now point at a dedicated `1200 x 630`
  `public/jmpseat/social-preview.png` asset whose file dimensions match the
  declared social-card metadata.
- Root-domain cutover to `jmpseat.com` still has not happened. Launch readiness
  remains gated only by final manual visual QA and an explicit cutover
  decision. No code/docs blockers remain in this audit.

## Checklist

| Area | Status | Notes |
| --- | --- | --- |
| Public/private domain split | Pass | Public root is intended to stay waitlist/marketing-only while `beta.jmpseat.com` remains the private beta/auth/admin surface. |
| No public Beta Access exposure | Pass | Public page/tests confirm no Beta Access button and no `/login?next=/app` root entry. |
| Email-first waitlist capture | Pass | Email field appears above the main CTA and submit state is runtime-proven. |
| Invalid email handling | Pass | Safe invalid-email state is implemented and test-covered. |
| Duplicate signup handling | Pass | Friendly duplicate behavior is implemented and runtime-proven. |
| Optional survey after email submit | Pass | Survey appears only after successful email capture and can be skipped or submitted. |
| URL safety | Pass | Raw email and survey token do not appear in URL state. |
| Public data exposure | Pass | Public page does not expose waitlist emails, survey answers, internal IDs, or tokens. |
| Admin waitlist dashboard | Pass | `/app/admin/waitlist` exists, is not public, and supports masked audit mode plus contact-authorized detail mode. |
| Contact-detail permission split | Pass | `operator.read_audit` remains masked/aggregate only; `operator.view_waitlist_contacts` is required for raw contact-detail mode. |
| Public copy safety boundaries | Pass | No proof upload, badge upload, manual review, role/base claim, or guaranteed beta-access language appears on the public page. |
| Responsive layout and form semantics | Pass | Layout, headings, labels, alerts, and success states are in place; the public email input is tied to its helper text with `aria-describedby`. |
| SEO/social metadata | Pass | Public root metadata now includes launch-ready title, description, Open Graph, Twitter card, canonical root URL handling, indexable robots posture, and a dedicated `1200 x 630` social preview image for `jmpseat.com`. |
| Linked legal page readiness | Pass | Privacy and Terms use concrete effective dates, public-ready wording, and no internal launch notes or preview-phase copy. |

## Resolved Blockers

1. Public waitlist metadata is not launch-ready.
   Resolved. W05A adds launch-ready public root metadata for `jmpseat.com`, including
   title, description, Open Graph title/description/URL, Twitter card
   title/description/card type, canonical root URL handling, and indexable
   robots posture. It also replaces the mismatched runway hero image reference
   with `public/jmpseat/social-preview.png`, a dedicated `1200 x 630` PNG that
   matches the declared social-card dimensions.

2. Linked legal pages still contain placeholder effective dates.
   Resolved. W05A replaces `/privacy` and `/terms` placeholder effective dates with
   `Effective date: June 8, 2026`.

3. Public legal/copy surfaces still read like prelaunch material.
   Resolved. The merged public waitlist polish removes preview-phase wording,
   removes internal inbox/domain-confirmation notes, and aligns homepage,
   Privacy, and Terms language with the real public waitlist and optional
   survey flow.

## Remaining Manual QA

- Do one final manual visual pass on a root-domain preview or cutover candidate
  to confirm mobile spacing, contrast, CTA/focus affordances, and footer-link
  rendering.
- Verify the final root deployment shows the expected social preview, canonical
  URL, and legal/footer surfaces in the production domain context.

## Public / Private Domain Split

- Future `jmpseat.com` target: public waitlist/marketing only.
- Future `jmpseat.com` must not expose Beta Access.
- Future `jmpseat.com` must not route visitors into `/login?next=/app` from the
  public waitlist page.
- `beta.jmpseat.com` remains the private beta/auth/admin/operator surface.
- Root cutover must not disturb beta auth, admin, or operator tooling on
  `beta.jmpseat.com`.

## Waitlist Flow Summary

- Email-first capture is implemented on the public route.
- Invalid email handling fails safely.
- Successful email submit shows a safe success state.
- Optional product-shaping survey appears only after successful email capture.
- Optional survey submit and skip paths are implemented and runtime-proven.
- Duplicate signup behavior is friendly and runtime-proven.
- Raw email and survey token do not appear in the URL.
- The public page does not expose waitlist emails or survey answers.

## Admin Dashboard Summary

- `/app/admin/waitlist` exists and is restricted to authorized operator/admin
  users.
- Founder/admin full-contact mode has been browser-confirmed separately in
  runtime notes.
- `operator.read_audit` supports aggregate metrics plus masked recent-submission
  summaries only.
- `operator.view_waitlist_contacts` is required for full contact email and
  per-person survey detail.
- Public waitlist users cannot see dashboard data, waitlist emails, survey
  answers, or internal identifiers.

## SEO / Metadata Summary

Current public waitlist metadata coverage:

- W05A adds launch-ready page title and description.
- W05A adds Open Graph title, description, and URL metadata.
- W05A adds Twitter summary-card metadata.
- W05A points Open Graph and Twitter image metadata at the dedicated
  `1200 x 630` `public/jmpseat/social-preview.png` asset.
- W05A adds canonical URL handling for the future `https://jmpseat.com` root.
- W05A sets the public root waitlist to indexable robots posture.

These metadata changes are now merged on `main`. The remaining step is final
manual visual QA before root cutover approval.

## Mobile / Accessibility Summary

Code review indicates the public waitlist page is structurally in good shape:

- Responsive layout rules are present.
- Heading order is semantic.
- Labels exist for the public email field and survey controls.
- Error states use `role="alert"`.
- Success state uses `role="status"`.
- Fieldsets/legends are present for grouped survey choices.
- Focus styles exist for primary form controls.

Remaining manual QA:

- Recheck mobile/footer affordances visually on the root launch target before
  cutover.

## Final Root Cutover Checklist

1. Confirm the current production target serves the latest reviewed `main`.
2. Do one final manual mobile/desktop visual pass on the root cutover target.
3. Point `jmpseat.com` at the public waitlist deployment only.
4. Keep `beta.jmpseat.com` pointed at the private beta/auth/admin deployment.
5. Verify root `jmpseat.com` has no Beta Access button or `/login?next=/app`
   entry path.
6. Verify a non-sensitive waitlist signup succeeds on root.
7. Verify optional survey submit and skip still work on root.
8. Verify `/privacy` and `/terms` render final effective dates and launch-ready
   copy.
9. Verify social preview/canonical/robots behavior on the root deployment.
10. Verify `beta.jmpseat.com/app/admin/waitlist` still works for authorized
    operator/admin users.

## Rollback Plan

1. Re-alias `jmpseat.com` back to the previous known-good deployment.
2. Reconfirm `beta.jmpseat.com` was not changed and still serves the private
   beta/auth/admin surface.
3. Re-test the public waitlist root after rollback.
4. Record what failed, revert only the launch-surface change, and keep beta
   runtime untouched.

## Recommended Next Action

Recommended next task:

`W05C Root Cutover Manual QA And Approval`

Scope:

- Run the final manual mobile/desktop visual check on the root launch target.
- Confirm root-domain public waitlist behavior and footer/legal rendering.
- Approve or reject root cutover as a separate explicit task.

Root cutover to `jmpseat.com` should happen only after that manual QA is
complete and explicitly approved.
