# No-Code Waitlist Execution

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This is a documentation-only checklist for setting up external no-code validation. It does not create app code, framework files, package files, deployment config, a real landing page, or a real form in this repository.

## 1. Purpose

This checklist guides the external no-code setup for the M0 validation campaign. The goal is to publish a simple landing page and waitlist form outside this repo, validate whether aviation workers understand the wedge, and recruit the first private beta candidates before app scaffolding.

No app code is being built. The landing page and waitlist form should be created manually in no-code tools and operated as a validation campaign, not as a production product.

The public waitlist must not imply official airline affiliation, employer endorsement, legal/trademark clearance, public launch readiness, or access to unavailable V1 features.

## 2. Recommended Tool Stack

Primary recommendation: Carrd + Tally.

Why this stack fits M0:

- Fast enough to launch without engineering work.
- Low cost and easy to revise as messaging is tested.
- Keeps validation outside the app repo.
- Avoids premature Next.js, Supabase, deployment, or analytics setup.
- Tally can handle structured waitlist responses without creating custom data infrastructure.
- Carrd provides a more credible landing page than a standalone form.

Fastest fallback: Tally only.

Use Tally-only if speed matters more than polish or if the first test is limited to trusted contacts. Do not use a custom-coded landing page for M0 unless app-code work is explicitly approved later.

## 3. Required Assets Before Setup

- [ ] Landing page headline.
- [ ] Hero subheadline.
- [ ] Short product description.
- [ ] Feature bullets.
- [ ] Privacy and anonymity explanation.
- [ ] Verification expectation note.
- [ ] No-official-affiliation disclaimer.
- [ ] Working-name caveat.
- [ ] Waitlist form fields.
- [ ] Waitlist confirmation message.
- [ ] Ambassador CTA.
- [ ] Safety note prohibiting sensitive aviation, passenger, hotel, schedule, credential, and company-confidential information.

## 4. Landing Page Setup Checklist

- [ ] Create the page title: `jmpseat - Private Beta Waitlist`.
- [ ] Add the hero headline and subheadline from the copy bank.
- [ ] Add one primary CTA button: `Join the private beta waitlist`.
- [ ] Add a problem section focused on scattered base intel, hard-to-search group chats, unsafe public forums, and fragmented layover knowledge.
- [ ] Add a feature preview covering Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, Ready Room, Ramp Talk, Crew Rest, The Galley, and NonRev Deals.
- [ ] Add a privacy/verification section explaining verified privately, anonymous publicly, accountable internally.
- [ ] Add a "what is not included" section listing no airline portal login, schedule scraping, public nearby crew tracking, dating/swiping, exact crew hotel exposure, flight-load requests, native mobile, full marketplace payments, or employment/payroll API dependency.
- [ ] Add an ambassador callout for people with useful base, role, commute, or layover knowledge.
- [ ] Embed or link the Tally waitlist form.
- [ ] Add a footer disclaimer covering working-name status and no official airline affiliation.
- [ ] Add a safety reminder not to submit passenger private information, exact crew hotel details, schedules, portal credentials, confidential company documents, or airport security procedures.

## 5. Tally Form Setup Checklist

| Field | Required or optional | Notes |
| --- | --- | --- |
| Preferred name | Required | Use for direct outreach only. |
| Email | Required | Use for waitlist, interview, and beta invite communication. |
| Aviation role | Required | Use role choices plus an "other aviation role" option. |
| Base/airport | Required | Use free text or short text; this drives first-community selection. |
| Airline/company | Optional | Do not imply airline endorsement or partnership. |
| Current status | Required | Active worker, former worker, new hire, student/aspiring, or other. |
| Feature interest ranking | Required | Rank Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, The Galley, NonRev Deals, Ready Room, Ramp Talk, Crew Rest. |
| Privacy/verification concern | Optional | Ask what would make them comfortable or uncomfortable verifying privately. |
| Current alternatives used | Optional | Examples: Facebook groups, Reddit, group chats, notes, crew tools, coworkers. |
| Pain point | Required | Ask for one specific base, layover, career, commute, or community pain. |
| Willingness to interview | Required | Yes/no/maybe. |
| Willingness to be an ambassador | Required | Yes/no/maybe. |
| Referral source | Optional | Track personal network, friend, group, Reddit, LinkedIn, or other. |

Form setup checks:

- [ ] Do not add file upload fields.
- [ ] Do not request badge images, IDs, schedules, employee numbers, portal credentials, exact hotels, passenger information, or company documents.
- [ ] Add a short note before submission that private beta may require separate verification later.
- [ ] Add a checkbox or acknowledgement for basic safety expectations.
- [ ] Configure the confirmation message from the copy bank.
- [ ] Test the form with a non-sensitive dummy response.

## 6. Data Handling Checklist

- [ ] Assign one founder/operator as the waitlist data owner before publishing.
- [ ] Store responses in Tally and, if needed, one restricted Google Sheet, Airtable, ConvertKit, or Beehiiv list.
- [ ] Limit access to the founder/operator and explicitly approved reviewers.
- [ ] Do not give ambassadors raw waitlist access.
- [ ] Do not give vendors, airlines, employers, or outside communities access to response data.
- [ ] Do not store waitlist exports in this repo.
- [ ] Do not publicly share names, emails, airlines, bases tied to identifiable people, or free-text responses.
- [ ] Do not sell waitlist data.
- [ ] Create a manual deletion/export request process before broad outreach.
- [ ] Delete a respondent's data from the form tool and synced storage if requested.
- [ ] Analyze only aggregated counts and anonymized themes.
- [ ] Review retention after 90 days.
- [ ] Confirm no sensitive document collection is enabled.

Safe to analyze:

- Signup totals.
- Counts by role.
- Counts by base/airport.
- Feature rankings.
- Ambassador interest.
- Interview willingness.
- Referral source patterns.
- Anonymized privacy concerns.
- Anonymized pain-point themes.

## 7. Copy Bank

Hero headline:

> jmpseat is the off-duty network for airline people.

Hero subheadline:

> A verified aviation-worker utility community for base intel, layover tips, anonymous crew talk, career movement, and crew-friendly perks.

CTA:

> Join the private beta waitlist

Waitlist intro:

> jmpseat is recruiting a small private beta group to validate whether verified airline people want a safer, more useful place for base intel, layover boards, anonymous but accountable crew discussion, career tools, and crew-friendly perks.

Privacy note:

> jmpseat is designed around a simple identity model: verified privately, anonymous publicly, accountable internally. If invited to beta, you may be asked to prove aviation affiliation through a separate private process. Do not upload badges, IDs, schedules, or company documents here.

No-official-affiliation disclaimer:

> jmpseat is a working name pending legal/trademark clearance. jmpseat is not affiliated with, endorsed by, or officially connected to any airline unless explicitly stated.

Ambassador callout:

> Know your base, commute, role, or layover cities better than most? Beta ambassadors help seed useful posts, invite trusted peers, provide feedback, and flag safety concerns. Ambassadors do not verify users, act as final moderators, or represent any airline.

Confirmation message:

> You're on the waitlist. If your base, role, or airline fits the first private beta group, we may reach out for a short interview and separate verification steps. Please do not send IDs, badges, schedules, passenger information, exact crew hotel details, portal credentials, or confidential company documents.

Safety footer:

> Do not submit passenger private information, confidential company documents, exact crew hotel details, live operations-sensitive information, schedules, portal credentials, or airport security procedures.

## 8. Form Safety Rules

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

If a respondent submits sensitive information in a free-text field, remove it from any working notes, avoid copying it into summaries, and handle deletion according to the chosen tool's process.

## 9. Validation Tracking

Use a manual dashboard or spreadsheet outside this repo. Suggested columns:

| Metric | Source | Target / note |
| --- | --- | --- |
| Total signups | Tally responses | Track daily and cumulative count. |
| Likely aviation workers | Role/status fields | Target 75+ likely aviation-worker signups for M0 pass. |
| Base concentration | Base/airport field | Target 40+ around one base or tightly related community. |
| Role distribution | Aviation role field | Target at least 4 roles in the top base/community. |
| Ambassador candidates | Ambassador field + interviews | Target 10+ candidates, with 5+ tied to top base/community. |
| Interview volunteers | Interview field | Target 20+ volunteers. |
| Feature rankings | Ranking field | Look for Base Boards, Layover Boards, or Crew Rooms in top three. |
| Privacy concerns | Open text | Summarize anonymized themes and severity. |
| Referral sources | Referral field | Track peer referral signal and high-quality channels. |

Review pass/fail status weekly against `docs/M0_VALIDATION_OPERATING_PACKET.md`.

## 10. Launch Checklist

- [ ] Preview the landing page on desktop and mobile.
- [ ] Test every CTA link.
- [ ] Submit one non-sensitive test form response.
- [ ] Verify the confirmation message appears.
- [ ] Verify response storage location.
- [ ] Verify only approved people can access responses.
- [ ] Verify the working-name caveat is visible.
- [ ] Verify the no-official-affiliation disclaimer is visible.
- [ ] Verify there is no upload field.
- [ ] Verify the form does not ask for IDs, badges, schedules, portal credentials, exact hotel info, passenger info, live location, or company documents.
- [ ] Verify the ambassador CTA does not imply moderator, verification, or airline-representative authority.
- [ ] Share with first trusted testers only.
- [ ] Fix confusing copy before broader outreach.

## 11. First Outreach Sequence

Use controlled manual outreach. Do not spam groups or post where community rules prohibit promotion.

1. Share with 5 trusted aviation contacts.
   - Ask them to review the page, complete the form, and tell you what feels unclear or untrustworthy.
   - Ask for feedback before asking for shares.
2. Share with 10 warm second-degree contacts.
   - Use trusted introductions where possible.
   - Ask what base/role community would be most useful.
3. Share with 20 broader but targeted aviation workers.
   - Prioritize the likely first beta base/community.
   - Ask each person for one concrete pain point and whether they would invite peers.
4. Review quality before scaling.
   - If responses cluster around excluded features, pause and adjust positioning.
   - If responses are scattered across too many bases, narrow outreach.
   - If privacy concern is high, improve verification and anonymity copy before wider sharing.

Safe channels:

- Personal network.
- Aviation friends of friends.
- Aviation Facebook groups only where rules allow.
- Reddit only where subreddit rules allow.
- LinkedIn direct outreach.
- Aviation school or new-hire communities where allowed.
- Local airport or crew-adjacent communities where allowed.

## 12. Completion Report Template

Use this template after the external no-code setup is complete:

```markdown
## No-Code Waitlist Setup Report

- Landing page URL:
- Waitlist form URL:
- Tool choices:
- Date launched:
- Data owner:
- Data storage location:
- People with response access:
- Initial trusted testers:
- Test response completed: yes/no
- Sensitive upload fields removed/absent: yes/no
- Working-name caveat visible: yes/no
- No-official-affiliation disclaimer visible: yes/no
- Known issues:
- First outreach group:
- Next action:
```

## 13. Recommended Next Tasks

1. Manually create the no-code landing page and Tally waitlist form outside this repo using this checklist.
2. Record the completed setup in a future documentation update using the completion report template.
3. Begin the first 20 interview and outreach cycle, then compare results against the M0 pass/fail thresholds.
