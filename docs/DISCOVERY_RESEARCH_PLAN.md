# Discovery Research Plan

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This research plan does not claim legal or trademark clearance.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This is a documentation-only research plan. It does not create app code, framework files, package files, deployment config, a landing page, a form, or implementation files.

## 1. Purpose

This document governs discovery research before deeper MVP build. It defines how Deadhead Club should gather evidence about airline-worker pain, current alternatives, first-community density, privacy and verification comfort, and feature priority before moving from no-code validation into app implementation.

Web research is useful for market discovery, competitor teardown, verification patterns, trust/safety risks, and policy constraints. It does not fully replace real user validation. Deadhead Club still needs direct interviews, waitlist behavior, ambassador commitments, and eventually beta usage to confirm whether the product should be built and which features deserve priority.

Discovery is not complete yet. Findings should be treated as assumptions until they are supported by repeated user evidence or beta behavior.

## 2. Discovery Research Questions

Target user pain:

- What painful, recurring problems do airline workers have around base intel, layover planning, anonymous crew discussion, career movement, commuting, and crew-friendly perks?
- Which pains are urgent enough that users would join a new verified community?
- Which roles feel underserved by existing tools and groups?

Current alternatives:

- What do users use today: Flight Crew View, StaffTraveler, CrewLounge CONNECT, CrewVIP, Facebook groups, Reddit, group chats, notes, coworkers, union resources, company resources, or personal networks?
- What works well enough that Deadhead Club should not try to replace it?
- What is fragmented, unsafe, hard to search, stale, or untrusted?

Competitor gaps:

- Which competitor surfaces are already strong enough to avoid in V1?
- Where do users see gaps in schedule apps, non-rev tools, deal directories, crew social apps, and public forums?
- What gaps are specific to verified aviation-worker community knowledge?

Verification comfort:

- Which verification methods feel acceptable: basic email, aviation work email, non-upload manual review, founder-known verification, live/non-stored visual confirmation, peer vouching, or later employment/API verification?
- What privacy concerns does work email verification create?
- Would verification increase trust enough to justify friction?

Anonymous discussion trust:

- Do users want anonymous or handle-based participation?
- Do they understand and accept internal accountability?
- What topics should allow anonymous posting, and what topics should require visible handles?

Base intel demand:

- What base-specific knowledge is hard to find today?
- Which Base Board categories matter most: commuting, parking, reserve life, new-hire survival, errands, transit, food, base culture, or crash pad discussion without exact resident exposure?
- Which first base/community has enough density to avoid an empty launch?

Layover intel demand:

- What layover tips are valuable without exposing exact crew hotel details?
- How do users currently find safe food, transportation, wellness, downtime, and airport-area tips?
- Would an AI-assisted Jumpseat Brief be useful as an output from community knowledge?

Career tool demand:

- Which Ready Room topics matter: interviews, role transitions, regional-to-mainline movement, resume prep, new-hire preparation, or professional norms?
- Are career tools a Phase 2 utility or needed in V1?

Deal/perk demand:

- Are crew-friendly perks useful enough as a supporting layer?
- Which deals are trusted and relevant?
- Would users tolerate sponsored deals if clearly labeled and admin-reviewed?

Privacy/safety objections:

- What would make users distrust Deadhead Club immediately?
- Which data should never be collected?
- Are users worried about employer visibility, doxxing, harassment, exact crew hotel exposure, passenger information, airport security content, or company-confidential information?

First beta community choice:

- Should the first beta be one base across multiple roles, one airline plus one base, or one role across multiple bases?
- Which option has the strongest existing access, referral likelihood, role diversity, and moderation feasibility?

## 3. Research Tracks

### Competitor Teardown

Review direct and adjacent competitors for positioning, feature sets, trust model, pricing, and V1 boundaries. Focus on what Deadhead Club should not copy as much as what it can learn.

Targets:

- Flight Crew View.
- StaffTraveler.
- CrewLounge CONNECT.
- CrewVIP.
- Newer crew-social and layover apps.
- Facebook groups, Reddit, and Blind as indirect alternatives.

### App Review Mining

Mine public app-store reviews for repeated pain patterns, praise, complaints, privacy concerns, pricing concerns, reliability issues, and feature requests. Do not overreact to isolated comments.

Outputs:

- Repeated praise patterns.
- Repeated complaint patterns.
- Privacy/security concerns.
- Feature requests that overlap or conflict with Deadhead Club's V1.
- Quotes summarized in original language without copying long copyrighted passages.

### Public Forum / Social Listening

Review public aviation-worker discussions where accessible and allowed. Respect community rules. Do not scrape private groups or copy sensitive personal information into repo docs.

Look for:

- Base intel pain.
- Layover planning pain.
- New-hire and commuter questions.
- Anonymous discussion needs.
- Verification and privacy objections.
- Complaints about existing tools.

### Aviation-Worker Workflow Research

Map real worker workflows around commuting, reserve life, base changes, layover planning, career movement, and off-duty crew discussion. The goal is to understand context before designing solutions.

### Trust/Safety and Privacy Research

Continue researching aviation-specific safety risks, anonymous professional community risks, verification privacy, exact crew hotel exposure, passenger private information, live operations-sensitive information, and airport security-sensitive information.

### Verification Research

Compare practical V1 verification paths and later-stage vendor options. Keep V1 focused on basic email, aviation work email where comfortable, and controlled manual review. Do not make employment/payroll verification APIs a V1 dependency.

### Monetization Research

Validate whether NonRev Deals, sponsored local crew deals, affiliate revenue, recruiting, vendor marketplace, and crash pad listings are later-stage monetization opportunities. Do not treat deals as the core V1 wedge.

### Wife / FA Expert Interview

Use the founder's wife as an expert informant, not a complete validation sample. Her feedback can sharpen questions, identify risks, test copy, and reveal workflow detail, but it cannot replace broader user discovery.

### Real User Interviews

Interview flight attendants, pilots, gate agents, ramp agents, dispatchers, crew schedulers, airport ops, regional workers, new hires, and commuters. Prioritize the likely first base/community.

## 4. Source Priority

Use this priority order when resolving conflicts:

1. Repeated real user interviews and beta behavior from the target audience.
2. Strong concentrated waitlist behavior by role/base/community.
3. Official aviation, security, privacy, accessibility, and platform sources.
4. Primary competitor pages, official help centers, and app-store listings.
5. Public app reviews with repeated patterns.
6. Public forums and discussions where context is clear.
7. Expert informant feedback, including the wife/FA interview.
8. Founder intuition and isolated comments.

Source types to record:

- Primary competitor page.
- App-store listing.
- Public app review.
- Official aviation/security/privacy source.
- Public forum or discussion.
- User interview.
- Expert informant feedback.
- Vendor documentation.
- Secondary reporting.

## 5. Evidence Quality Scale

High confidence:

- Repeated user interviews with consistent pain across multiple roles or the target first community.
- Strong concentrated waitlist behavior from likely aviation workers.
- App-store review patterns repeated across many reviews.
- Official government, security, privacy, platform, or standards source.
- Beta behavior showing activation, retention, contribution, and manageable safety load.

Medium confidence:

- Competitor positioning and public product pages.
- Public forum patterns with multiple independent examples.
- Expert informant feedback from someone with direct aviation-worker context.
- Small but consistent interview sample.
- Waitlist interest without base/community concentration.

Low confidence:

- Isolated comments.
- Founder intuition.
- Single-source claims.
- One enthusiastic interview.
- Social likes without waitlist or interview action.
- Feature requests from people outside the target audience.

## 6. Research Output Format

Capture each research finding in this format:

```markdown
### [Finding title]

- Finding:
- Source:
- Source type:
- Date accessed or interview date:
- Confidence: high / medium / low
- Affected assumption:
- Product implication:
- Open questions:
- Follow-up action:
```

Rules:

- Do not claim validation is complete unless the evidence supports it.
- Distinguish desk research from user validation.
- Summarize public sources in original language without copying long copyrighted passages.
- Do not include passenger private information, exact crew hotel details, schedules, portal credentials, confidential company documents, live location, or airport security procedures.
- Update `PROBLEM_SOLUTION_VALIDATION_MATRIX.md` when a finding changes confidence or status.

## 7. Wife / FA Expert Interview Guide

Purpose: use a respectful expert interview to sharpen product understanding and risk awareness. This should not be treated as representative validation by itself.

Opening:

- "I want your honest take as someone who understands this world. I am not looking for validation of my idea. I am trying to find what is actually painful, useful, unsafe, or unrealistic."
- "Please do not share passenger information, exact hotel details, schedules, company-confidential information, or security procedures."

Questions:

1. What tools, group chats, Facebook groups, Reddit threads, coworkers, notes, or apps do you use today for base, layover, career, or off-duty crew information?
2. What do those tools handle well?
3. Where do they break down, feel unsafe, get stale, or become hard to search?
4. What base information do people repeatedly ask for?
5. What did you wish you knew earlier about base life, commuting, reserve, errands, parking, transit, food, or base culture?
6. What layover information is actually useful without exposing exact crew hotels?
7. What kinds of crew groups feel helpful, and what kinds become messy, unsafe, or cringe?
8. Would verified-private and anonymous-public participation make people more honest, more unsafe, or both?
9. What would make you comfortable or uncomfortable with verification?
10. What would make airline workers distrust this immediately?
11. Which roles are usually ignored by crew-focused tools or communities?
12. Read the waitlist headline and subheadline. What sounds clear, vague, overpromised, or off-putting?
13. Rank these features by usefulness: Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, The Galley, NonRev Deals, Ready Room, Ramp Talk, Crew Rest.
14. Which one feature would make this worth joining if everything else were basic?
15. What feels unsafe, too social, too much like dating, too employer-risky, or too likely to cause drama?
16. If this started with one base across multiple roles, what would need to be true for that to work?
17. Who should not be allowed into the first private beta?
18. What should the product never collect?
19. What would be a useful first beta success signal?
20. What am I missing because I am too close to the idea?

Close:

- Ask what should be changed in the waitlist copy before showing it to others.
- Ask whether she would recommend 2-3 people for broader discovery only if that feels comfortable and appropriate.
- Do not ask her to act as a moderator, verification approver, or airline representative.

## 8. Real User Interview Guide

Target length: 20 minutes.

Audience: flight attendants, pilots, gate agents, ramp agents, dispatchers, crew schedulers, airport ops workers, regional airline workers, new hires, and commuters.

Opening:

- "This is discovery for a working-name concept called Deadhead Club. It is not affiliated with any airline."
- "The goal is to understand your workflow and pain points before building deeper app features."
- "Please do not share passenger information, exact crew hotel details, schedules, portal credentials, airport security procedures, live operational details, or confidential company documents."

Script:

1. What is your role, base/airport, and general aviation background?
2. What do you currently use for base intel, layover tips, career questions, commuter information, or off-duty crew discussion?
3. What works well about those options?
4. What is frustrating, hard to trust, hard to search, stale, unsafe, or awkward about them?
5. What base-specific question have you asked or answered more than once?
6. What layover information do you wish was easier to find?
7. How do you currently decide whether a recommendation is trustworthy?
8. Would a verified aviation-worker community be more useful than public groups? Why or why not?
9. Would you be comfortable verifying privately if public participation could use a handle or anonymous mode where allowed?
10. What verification method would feel acceptable: work email, non-upload manual review, founder-known verification, live/non-stored visual confirmation, or something else?
11. What should Deadhead Club never collect?
12. Would anonymous but internally accountable posting make you more likely or less likely to participate?
13. Rank these features: Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, The Galley, NonRev Deals, Ready Room, Ramp Talk, Crew Rest.
14. Which feature would make the product useful even if the rest were basic?
15. What would make this feel unsafe, employer-risky, cringe, spammy, or not worth joining?
16. Would you join a private beta focused on one base across multiple roles?
17. Would you invite trusted peers? How many and from which roles?
18. Would you consider being a beta ambassador? What boundaries would matter?
19. What do you currently use instead of this idea?
20. What would make you not trust this product?

Close:

- Ask permission to follow up.
- Ask whether they know one other person in the target audience who may give candid feedback.
- Do not ask for documents, schedules, passenger information, exact hotel details, or employer-confidential information.

## 9. Research Backlog

First research tasks:

1. Flight Crew View review mining.
   - Goal: identify schedule-tool praise, complaints, privacy/security concerns, and boundaries Deadhead Club should avoid.
2. StaffTraveler positioning and verification review.
   - Goal: understand non-rev load positioning, verification expectations, and why Deadhead Club should not build flight-load requests in V1.
3. CrewVIP feature/positioning review.
   - Goal: understand deals, crew perks, AI layover planner, and why deals should remain a supporting layer.
4. CrewLounge CONNECT feature/positioning review.
   - Goal: understand roster/calendar-first patterns and privacy settings around sharing.
5. Newer crew-social app scan.
   - Goal: identify layover community, nearby crew, meetup, crash pad, marketplace, and dating/swiping risks.
6. Reddit/forum pain mining if accessible.
   - Goal: identify repeated base, layover, new-hire, commuter, and career questions from public posts without scraping private spaces.
7. First-base candidate research.
   - Goal: compare likely bases by personal access, role diversity, worker density, referral likelihood, local utility, and moderation feasibility.
8. Verification trust research.
   - Goal: identify acceptable verification paths and privacy objections.
9. Privacy/security objection research.
   - Goal: identify what could cause distrust around anonymity, employer visibility, exact hotels, passenger information, live operations, and company documents.

## 10. Decision Gates

### Before Waitlist Launch

Required:

- Landing page copy does not imply official airline affiliation, employer endorsement, legal/trademark clearance, public launch readiness, or V1-excluded features.
- Waitlist form does not collect badge uploads, IDs, schedules, portal credentials, exact hotel information, passenger information, live location, employee numbers, or company documents.
- Initial research questions and validation matrix are ready.
- Data handling owner and response access rules are defined.
- At least one expert informant or target-user read-through checks that copy is understandable and not unsafe.

### Before M1A Splash Page

Required:

- Explicit approval to create app-code work.
- Clear decision that M1A supports validation and will not include private app features.
- Waitlist messaging, disclaimers, and no-sensitive-data rules are stable enough to implement.
- The branch, scope, and acceptance criteria are defined.

### Before Deeper App Shell

Required:

- M0 signal is strong enough or the user explicitly accepts the risk of building before full validation.
- The first beta community hypothesis is documented.
- Verification comfort and privacy concerns have been tested with real users.
- V1 exclusions remain accepted.
- Build scope excludes product features not yet validated.

### Before Private Beta

Required:

- First beta community is selected.
- First 50 user plan is credible.
- Ambassador candidates are identified.
- Verification path is defined.
- Minimum private-beta policy set is ready.
- Moderation/reporting/emergency escalation is ready.
- Seed content plan is ready.
- Safety, privacy, accessibility, and rollback gates from `BETA_READINESS_CHECKLIST.md` are satisfied or explicitly risk-accepted.
