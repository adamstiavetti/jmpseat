# M0 Validation Operating Packet

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This is a documentation-only M0 operating packet. It does not create a landing page, live waitlist, form, spreadsheet, app scaffold, framework files, package files, database code, deployment config, or production legal document.

## 1. Purpose

M0 validates demand, trust, and first-community density before app scaffolding. The goal is to learn whether airline people understand the wedge and will join a focused private beta for base intel, layover boards, anonymous but accountable crew discussion, career tools, and crew-friendly perks.

M0 is no-code or low-code validation only. It may use external no-code tools after approval, but this repo only documents the operating plan. Do not collect real user data from this packet alone.

M0 must not imply official airline affiliation, employer endorsement, legal/trademark clearance, or public launch readiness.

## 2. M0 Success Definition

Use a pass/fail decision, not vanity signup totals.

| Metric | Pass threshold | Fail / concern threshold | Decision impact |
| --- | --- | --- | --- |
| Total waitlist signups | 150+ total signups | Fewer than 75 total signups after focused outreach | Total demand alone is not enough to proceed, but low total demand means continue validation or narrow positioning. |
| Likely aviation-worker signups | 75+ likely aviation-worker signups | Fewer than 40 likely aviation-worker signups | Low qualified demand blocks M1. |
| Base/community concentration | 40+ signups around one base/airport or tightly related community | No base/community reaches 25 signups | Concentration is required before selecting first beta community. |
| Role diversity | 4+ roles represented in top base/community | Mostly one role unless intentionally narrowed | Role diversity supports the broader airline ecosystem wedge. |
| Ambassador candidates | 10+ candidates, with 5+ tied to top base/community | Fewer than 3 credible candidates | Weak ambassador pool blocks private beta readiness. |
| Interview volunteers | 20+ interview volunteers | Fewer than 8 interview volunteers | Low interview willingness suggests weak pull or trust. |
| Feature demand signal | 30+ respondents rank Base Boards, Layover Boards, or Crew Rooms in top three | Demand centers on generic social, dating, nearby crew, flight loads, or schedule import | Utility-first signal is required. |
| Privacy/verification concern signal | 10+ useful concern responses that can be addressed with copy/process | Concerns are mostly unresolved or users reject verification | High unresolved privacy resistance blocks app build. |
| Referral signal | 20%+ referral-source responses from trusted aviation peers | Little or no peer referral signal | Peer referral supports density and trust. |
| Pain intensity | 15+ respondents name specific pain with current tools/groups | Responses are vague or only "sounds cool" | Specific pain is required to justify M1. |

M0 passes only if qualified demand, community concentration, ambassador pool, and utility-first feature demand all pass. If only total signups pass, continue validation.

## 3. M0 Decision Outcomes

| Outcome | Criteria | Action |
| --- | --- | --- |
| Proceed to M1 App Foundation | Passes qualified demand, top-base concentration, 10+ ambassador candidates, 20+ interview volunteers, strong utility-first ranking, and privacy concerns are addressable. | Prepare M1 prompt, but start app scaffolding only after explicit approval. |
| Continue validation | Some signal exists, but top base has fewer than 40 signups or role/ambassador density is weak. | Continue outreach for 2-3 weeks or test a narrower base/role message. |
| Narrow the wedge | Respondents strongly prefer one utility surface, such as Base Boards or Layover Boards, over the full community. | Reframe validation around the strongest utility surface without expanding V1. |
| Pivot positioning | Users understand the concept but do not trust anonymous discussion, verification, or broad community framing. | Test alternate positioning such as "base and layover intel for verified airline workers." |
| Pause / kill | Low qualified demand, no concentration, poor interview willingness, high distrust, or demand mostly for excluded features. | Do not scaffold. Reassess audience, name, wedge, or timing. |

## 4. Recommended First Beta Community

Default strategy: one base across multiple roles.

This is better than launching everywhere because jmpseat needs density, trust, and useful local knowledge. A single base can validate Base Boards, role diversity, commuter questions, layover-adjacent knowledge, new-hire support, and cross-role utility without creating an empty nationwide community.

Final base selection placeholder:

- Final first beta base/community: `[TBD]`
- Selection owner: `[TBD]`
- Selection date: `[TBD]`

Candidate base selection criteria:

- Existing personal access to trusted aviation workers.
- High density of airline workers.
- Role diversity across flight attendants, pilots, gate agents, ramp agents, dispatchers, schedulers, ops, regional workers, new hires, and commuters.
- Likelihood of peer referrals.
- Local vendor/deal potential without relying on deals as the wedge.
- Safety/moderation feasibility.
- Useful base and layover questions that do not require exact crew hotel exposure.
- At least 25 waitlist signups, with a target of 40+, tied to the base before selection.

## 5. Waitlist Tool Choice

Options:

- Carrd + Tally.
- Framer + Tally.
- Webflow + form.
- Tally only.
- Google Form only.
- Simple Next.js landing page later.

M0 recommendation: Carrd + Tally.

Reason:

- Fast to launch outside the app repo.
- Low cost.
- Easy to revise copy.
- Good enough to validate demand.
- Avoids premature app scaffolding.
- Keeps uploads out of scope.

Fallback:

- Tally only if speed matters more than landing-page polish.
- Google Form only for very small private outreach, but it feels less polished and may reduce trust.

Do not use a custom Next.js landing page in M0 unless the user explicitly approves app-code work later.

## 6. Waitlist Form Specification

| Field | Status | Sensitivity | M0 handling |
| --- | --- | --- | --- |
| Preferred name | Required | Low | Use for outreach personalization. |
| Email | Required | Medium | Use for beta/contact only. |
| Aviation role | Required | Medium | Use to qualify audience and role diversity. |
| Base/airport | Required | Medium | Use to measure community concentration. |
| Airline/company | Optional | Medium | Use only for analysis; do not imply employer endorsement. |
| Current status | Required | Medium | Choices: active worker, former worker, new hire, student/aspiring. |
| Feature interest ranking | Required | Low | Rank Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, The Galley, NonRev Deals, Ready Room, Ramp Talk, Crew Rest. |
| Privacy/verification concern | Optional | Medium | Analyze concerns; do not collect documents. |
| Current alternatives used | Optional | Low | Identify Facebook, Reddit, group chats, crew tools, notes, etc. |
| Pain point | Required | Low/medium | Ask for one concrete base, layover, career, commute, or trust pain. |
| Willingness to interview | Required | Low | Yes/no. |
| Willingness to be an ambassador | Required | Low | Yes/no/maybe. |
| Referral source | Optional | Low | Use to track trusted peer referral signal. |

Do not collect in M0:

- Badge uploads.
- IDs.
- Schedules.
- Portal credentials.
- Exact hotel information.
- Passenger information.
- Live location.
- Employee numbers.
- Company documents.
- Non-rev load information.

## 7. Waitlist Data Handling

Data owner:

- Assign one founder/operator as the M0 waitlist data owner before publishing any form.

Storage recommendation:

- Use Tally responses connected to a restricted Google Sheet, Airtable, ConvertKit, or Beehiiv list.
- Keep access limited to the founder/operator and approved reviewer.
- Do not store waitlist data in this repo.

Access rules:

- No public sharing.
- No selling waitlist data.
- No vendor access.
- No ambassador access to raw waitlist data.
- No airline/employer access.

Retention expectation:

- Keep waitlist data only while actively validating and recruiting beta.
- Review retention at 90 days.
- Delete records on request using the chosen tool's deletion process.

Export/deletion handling:

- Maintain a simple manual log of deletion/export requests outside this repo.
- Confirm deletion from the form tool and any synced sheet/list.
- Do not export sensitive free-text responses into public docs.

Safe to analyze:

- Counts by role.
- Counts by base/airport.
- Feature rankings.
- Ambassador interest.
- Interview willingness.
- Referral sources.
- Common privacy concerns in anonymized summary form.
- Top pain-point themes without names, exact hotels, passenger info, or confidential company details.

## 8. Landing Page Copy Requirements

Use `docs/LANDING_PAGE_WAITLIST_PLAN.md` as the source for full copy. M0 execution should include these sections:

- Hero.
- Problem.
- Product promise.
- Feature preview.
- Verification/privacy explanation.
- What is not included.
- Ambassador callout.
- Waitlist CTA.
- No-official-affiliation disclaimer.
- Working-name caveat.
- Safety note against sensitive aviation/security information.

M0 copy guardrails:

- Do not promise app access, immediate public launch, official airline affiliation, legal clearance, schedule import, flight-load requests, nearby crew tracking, dating/social matching, native mobile, marketplace payments, or employment/payroll API verification.
- Do not ask for badge uploads, IDs, schedules, passenger information, or exact crew hotel details.

## 9. Interview Script

Target length: 20 minutes.

Opening:

- "This is product discovery for a working-name concept called jmpseat. It is not affiliated with any airline, and we are not asking for confidential information."
- "Please do not share passenger information, exact crew hotel details, schedules, airport security procedures, or confidential company documents."

Questions:

1. What is your role, base/airport, and general aviation background?
2. What do you currently use for base intel, layover tips, career questions, or off-duty crew discussion?
3. What works well about those tools or communities?
4. What is frustrating, hard to trust, hard to search, or unsafe about them?
5. What base-specific information would have helped you when you were new, commuting, on reserve, or changing roles?
6. How do you currently plan layovers or find crew-friendly places without exposing sensitive details?
7. Would anonymous but internally accountable discussion be useful to you? Why or why not?
8. What would make you comfortable verifying aviation affiliation privately?
9. What verification methods would you accept: work email, founder-known verification, live call/non-stored visual confirmation, or later document upload under strict controls?
10. What would make you distrust this product immediately?
11. Rank these features: Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, The Galley, NonRev Deals, Ready Room, Ramp Talk, Crew Rest.
12. Which one feature would make this worth joining even if everything else were basic?
13. Would you join a private beta if it focused on one base across multiple roles?
14. Would you invite trusted peers? If yes, how many and from which roles?
15. Would you consider being a beta ambassador? What boundaries would make that comfortable?

Close:

- Ask permission to follow up.
- Ask for one referral only if appropriate.
- Do not request documents or sensitive verification materials during the interview.

## 10. Ambassador Screening Flow

Selection criteria:

- Current or recent aviation-worker context.
- Tied to the target base/community or a high-value role.
- Gives specific, useful base or layover pain.
- Has trusted peers to invite.
- Understands safety and privacy boundaries.
- Does not primarily want excluded features.
- Can model utility-first behavior.

Screening questions:

- What base or role knowledge would you seed first?
- What should never be posted in jmpseat?
- How would you explain verified privately, anonymous publicly, accountable internally?
- Who could you invite without spamming?
- What conflicts would prevent you from helping?
- Are you comfortable not being a moderator or verification approver?

Responsibilities:

- Seed useful posts later in beta.
- Invite trusted peers through controlled referral.
- Provide feedback.
- Flag safety concerns.
- Model good behavior.

Boundaries:

- Ambassadors are not moderators by default.
- Ambassadors do not approve verification.
- Ambassadors do not access private identity or verification artifacts.
- Ambassadors do not represent airlines.
- Ambassadors do not approve sensitive content.
- Ambassadors do not pressure meetups.
- Ambassadors do not promote vendors without disclosure.

Incentive ideas:

- Early premium access later if premium launches.
- Recognition in private beta notes.
- Limited invite privileges.
- Roadmap feedback access.

Conflict-of-interest rules:

- No payment per invited user.
- No moderation authority as a reward.
- No vendor/sponsored deal commission during private beta.
- Ambassadors must disclose vendor, recruiting, housing, or employer conflicts.

## 11. Outreach Plan

Safe outreach channels:

- Personal network.
- Aviation friends of friends.
- Aviation Facebook groups where allowed.
- Reddit only if rules allow.
- LinkedIn.
- Aviation school/new hire communities.
- Local airport/crew-adjacent communities.

Do-not-spam rules:

- Respect group rules.
- Ask moderators before posting in groups where promotion is restricted.
- Prefer one-to-one outreach and warm referrals.
- Do not scrape member lists.
- Do not mass DM.
- Do not imply official airline affiliation.
- Do not ask for sensitive documents.
- Do not target people during live operational contexts.
- Stop contacting anyone who declines.

## 12. Outreach Message Drafts

Direct message to airline worker:

> Hey `[Name]`, I am validating a working-name concept called jmpseat: an off-duty utility community for airline people around base intel, layover tips, anonymous but accountable crew talk, career tools, and crew-friendly perks. It is not affiliated with any airline and I am not asking for confidential info. Would you be open to a quick 20-minute feedback call?

Ambassador invite:

> You seem like someone who knows the real base/role details people always ask about. I am looking for a few beta ambassadors to help shape jmpseat before anything public launches. Ambassadors would help seed useful ideas, invite trusted peers, and flag safety concerns. They would not verify users, moderate, or represent any airline. Interested in talking?

Interview request:

> I am doing short discovery calls with airline people before building the app. The goal is to understand what base intel, layover planning, anonymous discussion, and career support would actually be useful. No sensitive documents, passenger info, schedules, exact hotels, or company confidential info. Would you have 20 minutes this week?

Waitlist invite:

> I am collecting interest for a private beta of jmpseat, a working-name off-duty network for airline people. The waitlist helps choose the first focused base/community. It will not ask for badge uploads, IDs, schedules, or credentials. Want the link when it is ready?

Follow-up after signup:

> Thanks for joining the waitlist. If your base, role, or airline fits the first private beta group, I may reach out for a short feedback call. Please do not send documents, schedules, passenger info, exact hotel details, or company confidential info by email or DM.

## 13. Feature Demand Survey

Ranking options:

- Crew Rooms.
- Base Boards.
- Layover Boards.
- Jumpseat Brief.
- The Galley.
- NonRev Deals.
- Ready Room.
- Ramp Talk.
- Crew Rest.

Open-ended questions:

- What do you use today?
- What sucks about it?
- What would make this worth joining?
- What would make you not trust it?
- What would you want in your base board on day one?
- What should jmpseat never allow?

Interpretation:

- Strong M0 signal: Base Boards, Layover Boards, or Crew Rooms rank high with specific pain.
- Weak M0 signal: generic networking, discounts only, or vague curiosity.
- Risk signal: requests for flight loads, schedule import, exact hotels, nearby crew tracking, dating/swiping, or confidential documents.

## 14. Validation Dashboard Specification

This is a spreadsheet spec only. Do not create a real spreadsheet in this task.

Suggested tabs:

- Overview.
- Signups.
- Base concentration.
- Role mix.
- Feature rankings.
- Interviews.
- Ambassadors.
- Privacy concerns.
- Pain themes.
- Referral sources.
- Pass/fail decision.

Suggested columns:

| Column | Purpose |
| --- | --- |
| Signup date | Track campaign velocity. |
| Preferred name | Contact only. |
| Email | Contact only; restricted access. |
| Role | Role diversity. |
| Base/airport | Community concentration. |
| Airline/company | Optional segmentation. |
| Status | Active/former/new hire/student. |
| Top feature | Demand signal. |
| Top three features | Utility-fit analysis. |
| Pain point theme | Qualitative signal. |
| Privacy concern theme | Trust-risk analysis. |
| Interview volunteer | Interview pool. |
| Ambassador interest | Ambassador pool. |
| Referral source | Peer referral signal. |
| Qualified aviation worker? | Manual yes/no/maybe. |
| Excluded-feature risk? | Flag requests for out-of-scope features. |
| Follow-up status | Not contacted/contacted/interviewed/declined. |

Manual dashboard metrics:

- Signups by role.
- Signups by base.
- Feature rankings.
- Ambassador candidates.
- Interview volunteers.
- Privacy concerns.
- Top pain points.
- Referral sources.
- Pass/fail status against M0 thresholds.

## 15. M0 Risk Register

| Risk | Signal | Mitigation |
| --- | --- | --- |
| Weak demand | Low qualified signups or low interview willingness | Narrow outreach, test alternate copy, or pause. |
| Too scattered signups | No base reaches concentration threshold | Continue validation; do not launch everywhere. |
| Privacy concern too high | Users reject verification or anonymity model | Improve copy, offer non-upload manual review, pause if unresolved. |
| Verification friction | Users will join only without verification | Reassess trust model; do not weaken accountability. |
| Users only want excluded features | Demand centers on schedules, loads, tracking, dating, or exact hotels | Do not build those features; pivot or stop. |
| People like idea but will not invite peers | Low referral/ambassador signal | Community density may be too weak for beta. |
| Community starts too empty | Few seed contributors or ambassadors | Delay beta until first-base density improves. |
| Outreach channel backlash | Group moderators or users object | Stop outreach in that channel and respect rules. |
| Legal/name uncertainty | Name concerns block public promotion | Keep working-name caveat and prepare counsel review. |

## 16. M0 Exit Review

Hold an M0 exit review before M1.

Required inputs:

- Waitlist metrics.
- Base/community concentration.
- Role mix.
- Feature ranking summary.
- Interview notes summary.
- Ambassador candidate list.
- Privacy/verification concern summary.
- Excluded-feature demand summary.
- Referral source analysis.
- Legal/name risk status.

Required decisions:

- Continue or stop.
- First beta community.
- Feature ranking priority.
- Waitlist quality.
- Ambassador roster.
- Verification comfort.
- Whether M1 App Foundation is justified.
- Whether counsel/security review must happen before M1 or before private beta.

M1 is justified only if M0 passes with concentrated, qualified, utility-first demand and addressable trust concerns.

## 17. Recommended Next Tasks

1. Execute no-code landing/waitlist setup outside the app repo.
   - Use Plan/Goals: yes.
   - Output: approved no-code tool setup, live copy, privacy-safe form, data owner, and tracking plan.
   - Boundary: no app code, no repo implementation files, no sensitive document collection.

2. Prepare the counsel/security review packet.
   - Use Plan/Goals: yes.
   - Output: concise review packet for trademark/name clearance, privacy notice, verification consent, manual upload handling, AI notice, incident response, and vendor disclosure.
   - Boundary: do not draft production legal documents.

3. Prepare the M1 App Foundation prompt, but do not run it until M0 has enough signal.
   - Use Plan/Goals: yes.
   - Output: implementation prompt and acceptance criteria for foundation-only scaffold.
   - Boundary: M1 requires explicit approval and must not include product features, database schema, verification upload flow, or V1-excluded features.
