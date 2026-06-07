# Waitlist Question Research Selection

Date: 2026-06-07
Status: Draft for review
Scope: First-party public waitlist question selection only. No implementation, migration, deployment, or runtime change has been made.

## Summary

jmpseat should use a first-party waitlist flow that captures email immediately, then offers a short optional product-shaping follow-up. The follow-up should prioritize invite sequencing, first community selection, feature confidence, verification comfort, and interview or seed-user willingness without collecting sensitive aviation, employer, identity, schedule, hotel, passenger, or credential data.

This recommendation supersedes a Tally-primary public waitlist posture for the main capture flow. Tally can remain a temporary research or fallback tool if intentionally retained later, but the primary public waitlist should be first-party so jmpseat owns the signup record, attribution, and optional prioritization signals from the start.

## Research Sources Reviewed

- `docs/DISCOVERY_RESEARCH_PLAN.md`
- `docs/DISCOVERY_RESEARCH_REPORT_001.md`
- `docs/RESEARCH_NOTES.md`
- `docs/PROBLEM_SOLUTION_VALIDATION_MATRIX.md`
- `docs/COMPETITIVE_POSITIONING.md`
- `docs/MVP_SCOPE.md`
- `docs/FIRST_RELEASE_MVP.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/post-e05-public-waitlist-launch-plan.md`

## Key Research Themes

- Base-specific institutional knowledge is the strongest wedge for early jmpseat utility, especially if a first beta can concentrate demand around one base or airport community.
- Layover knowledge is a durable crew behavior pattern, but should be framed as community recommendations rather than location tracking or exact hotel intelligence.
- Verified-private trust matters. The product needs a crew-only feel, but the waitlist should not ask for proof uploads, employee IDs, documents, or employer-confidential data.
- The current alternative set is fragmented across social groups, group chats, coworkers, personal notes, schedule-adjacent tools, and crew-specific products.
- Anonymous-public but accountable-internal participation remains important to validate, especially for comfort with private verification later.
- First communities should be selected by density and usefulness, not just total signups.
- Interview volunteers and seed contributors are high-leverage because the early product needs specific base and layover content, not only passive demand.
- Deals, AI briefs, and career/community surfaces are useful secondary signals, but should not displace base intel, layover knowledge, and trust as the core waitlist learning goals.

## Recommended Flow

1. Capture email first with a simple public waitlist form.
2. Confirm the email was captured before asking anything else.
3. Show an optional follow-up panel:
   - "Help us prioritize your invite and shape jmpseat."
4. Make every follow-up question optional.
5. Keep the follow-up short enough to finish in under two minutes.
6. Bound free-text prompts with explicit safety copy that asks users not to share sensitive or confidential information.

## Final Recommended Question Set

| # | Question text | Answer type | Options | Why it matters | Research theme | Required |
|---|---|---|---|---|---|---|
| 1 | What best describes your aviation connection? | Single select | Flight attendant; Pilot; Gate agent or customer service; Ramp, baggage, or cargo; Dispatcher, crew scheduler, or ops; Airport ops; Regional airline worker; New hire or trainee; Commuter; Former airline worker; Aspiring aviation worker; Other | Helps understand role mix and whether the first community has enough cross-role density. | First beta density, role mix, community shape | Optional |
| 2 | Which base or airport community should jmpseat prioritize first? | Short text | Prefer a base or airport code when possible. | Identifies where demand is concentrated without asking for exact location or employer details. | Base Boards, invite sequencing, first community selection | Optional |
| 3 | What would make jmpseat most useful to you first? | Multi-select, up to 3 | Base intel; Layover recommendations; Verified crew rooms; Anonymous-but-accountable discussion; Career, interview, or new-hire help; Crew-friendly deals or perks; AI layover brief; Commuter or non-rev-adjacent tips without flight loads; Wellness, rest, or downtime; Other | Prioritizes the first product surfaces against the validated MVP themes. | MVP prioritization, feature confidence | Optional |
| 4 | What is the biggest pain you would want jmpseat to solve? | Short text, bounded length | Free text with safety copy. | Captures concrete language and unmet needs beyond predefined options. | Problem validation, qualitative discovery | Optional |
| 5 | What tools or communities do you use today for airline-life information? | Multi-select | Facebook groups; Reddit; Group chats or text threads; Coworkers or friends; Notes or spreadsheets; StaffTraveler; Flight Crew View; CrewLounge; CrewVIP; Union or company resources; Other | Shows current behavior and where jmpseat must be meaningfully better. | Alternative behavior, acquisition, positioning | Optional |
| 6 | How comfortable would you be verifying privately later to keep the community crew-only? | Single select | Comfortable using an airline employee email later; Comfortable with a non-upload manual review later; I need more privacy details first; Not comfortable; Not applicable yet | Tests trust and verification friction without collecting proof. | Verified-private trust, access model validation | Optional |
| 7 | Would you be open to helping shape the first beta? | Multi-select | I would do a short interview; I might seed useful base or layover posts; I could invite trusted coworkers later; I only want launch updates for now | Finds interview volunteers, seed contributors, and future ambassador candidates. | Private beta operations, seed community | Optional |
| 8 | How did you hear about jmpseat? | Single select plus optional other | Friend or coworker; Group chat; Facebook group; Reddit; LinkedIn; Instagram or TikTok; Search; Founder or team outreach; Other | Helps measure which early channels are creating qualified demand. | Acquisition learning, launch sequencing | Optional |
| 9 | Any privacy or trust concern we should design around? | Short text, bounded length | Free text with safety copy. | Surfaces blockers to joining while reinforcing that sensitive details should not be shared. | Trust, safety, verification comfort | Optional |

Recommended safety copy for short-answer questions:

> Please keep this general. Do not share employee IDs, documents, schedules, exact hotel details, passenger information, portal credentials, tokens, codes, or confidential company information.

## Rejected Questions

| Rejected question | Reason |
|---|---|
| What is your employee ID or badge number? | Collects sensitive employment identifiers and conflicts with the no-proof-upload boundary. |
| Upload proof that you work for an airline. | Reintroduces proof/document upload behavior that is explicitly out of scope. |
| What is your exact schedule or next trip? | Collects sensitive schedule/location data and is not needed for waitlist prioritization. |
| Which crew hotel do you stay at on layovers? | Exact hotel intelligence creates safety risk and is not required for product validation. |
| Enter company portal credentials or connect your schedule. | Credentials and portal access are outside the product boundary and should never be requested. |
| What passengers, incidents, or confidential company issues should jmpseat discuss? | Invites confidential or inappropriate disclosures. |
| What is your full legal name and employer? | Too identity-heavy for a public waitlist and better handled later through private account/profile flows if needed. |
| Do you want nearby crew, live location, or dating features? | Conflicts with excluded/risky product directions and can distort the waitlist around non-core use cases. |
| What invite code do you have? | Public waitlist capture should not ask for or expose private beta invite codes. |
| Which exact airline domain should be approved? | Approved-domain management is an operator/admin concern, not a public waitlist collection question. |

## Sensitive Data Boundaries

The waitlist should not collect or recommend collecting:

- Employee IDs, badge IDs, document uploads, proof photos, or screenshots.
- Schedules, trips, pairings, rosters, live location, exact hotel details, or commute-specific sensitive details.
- Company portal credentials, private tokens, confirmation links, reset links, verification links, invite codes, or account codes.
- Passenger information, employer-confidential information, incident details, or restricted operational data.
- Full private emails in docs, exports, screenshots, analytics examples, or public reports.
- Privileged operator identifiers or internal user identifiers in public-facing analytics or docs.

Free-text fields should be bounded, optional, and accompanied by safety copy. Admin/reporting surfaces should prefer aggregate counts and category trends over raw response exposure unless there is a specific moderation or research reason to inspect individual answers.

## Suggested Data Model Implications

No migration or code change is included in this report. If implemented later, the first-party waitlist model should support:

- A required email capture record created before optional questions are shown.
- Nullable optional response fields stored separately from the core email capture.
- Enum-like fields for aviation connection, top product interests, current alternatives, verification comfort, beta help willingness, and discovery source.
- A short bounded text field for base or airport community preference.
- Short bounded text fields for biggest pain and privacy/trust concern.
- Consent and timestamp metadata for waitlist submission.
- Source and campaign attribution fields if available, without storing private links or tokens.
- A clear distinction between public waitlist status, private beta access, airline employee verification, and operator/admin access.
- Aggregate admin reporting for role mix, base density, feature priority, interview volunteers, and privacy concerns.
- Deletion/export readiness for waitlist data.

The waitlist model should not grant beta access, mark airline-email verification, issue role/base/restricted-board claims, or create operator privileges.

## Recommended Next Implementation Ticket

Recommended next ticket:

**W01A First-Party Waitlist Email Capture And Optional Product-Shaping Follow-Up**

Ticket scope:

- Replace the Tally-primary public waitlist path with first-party email capture.
- Capture email immediately before showing optional questions.
- Add the optional follow-up question set from this report.
- Keep all follow-up questions optional.
- Add safety copy around free-text fields.
- Store waitlist data without granting beta access or changing auth/verification state.
- Add basic aggregate-ready fields for role mix, base density, feature interest, source, verification comfort, and beta-shaping willingness.
- Keep `beta.jmpseat.com` private beta/auth/admin separate from the public waitlist flow.

Optional follow-ups after W01A:

- Waitlist admin metrics dashboard.
- Source/campaign attribution reporting.
- Interview volunteer export or operator review workflow.
- First-base selection report once enough responses are captured.

