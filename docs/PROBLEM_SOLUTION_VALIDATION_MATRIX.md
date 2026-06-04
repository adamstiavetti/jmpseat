# Problem/Solution Validation Matrix

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This is a documentation-only validation matrix. It does not create app code, framework files, package files, deployment config, a landing page, a form, or implementation files.

## 1. Purpose

This matrix tracks jmpseat's core product assumptions against evidence. It should be updated as discovery research, expert interviews, no-code waitlist results, user interviews, ambassador commitments, and beta behavior create stronger or weaker evidence.

Current state: customer discovery is not complete. Most assumptions are desk-researched or untested with real users. No assumption should be treated as fully validated until evidence is recorded.

## 2. Assumption Table

Status values:

- Untested.
- Desk-researched.
- Expert-reviewed.
- User-validated.
- Beta-validated.
- Invalidated.

| ID | Assumption | Category | Current confidence | Evidence needed | Current evidence | Validation method | Pass/fail threshold | Product decision if validated | Product decision if invalidated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-000 | Airline workers want niche aviation tools. | Demand | Desk-researched, high | Evidence that existing aviation-worker tools serve meaningful audiences and repeated workflows. | Discovery Research Report 001 maps strong competitor categories across schedule/roster, non-rev, crew deals, layover, crew social, and verified professional discussion. No direct jmpseat user validation recorded. | Web research, app review mining, user interviews, no-code waitlist. | Pass: specialized competitor categories continue to show repeated usage and user interviews confirm tool fragmentation. Fail: target users report existing tools fully solve the problem. | Continue specialized aviation-worker positioning. | Reassess whether a new niche tool is needed. |
| A-001 | Airline workers want a verified off-duty network. | Demand | Desk-researched, medium | Qualified waitlist signups, interviews, referrals, beta activation. | Adjacent crew-only tools, Blind-style verified anonymity, and anonymous crew-room concepts support the pattern. No direct user validation recorded yet. | User interviews, no-code waitlist, referral tracking, beta behavior. | Pass: 75+ likely aviation-worker signups and 20+ interview volunteers. Fail: fewer than 40 likely aviation-worker signups after focused outreach. | Proceed toward M1 planning if other gates pass. | Narrow audience, reframe around strongest utility, or pause. |
| A-002 | Base intel is a painful enough problem. | Problem | Desk-researched, medium | Repeated base-specific pain in interviews and waitlist responses. | Discovery Research Report 001 identifies base-specific institutional knowledge as the best opening, but public evidence remains indirect. | Interviews, waitlist pain field, forum mining, beta posts/searches. | Pass: 15+ respondents name concrete base pain and 30+ rank Base Boards top three. Fail: vague interest only. | Keep Base Board central to MVP. | Narrow or reposition away from base-first wedge. |
| A-003 | Layover Boards are useful. | Problem/solution | Desk-researched, high | Repeated layover planning pain and safe tip demand. | Competitor research strongly supports layover planning, crew recommendations, and city/airport crew intel demand; V1 excludes exact hotel exposure. | Interviews, app review mining, feature ranking, beta saves/searches. | Pass: 30+ rank Layover Boards top three or 5+ beta layover contributions in first two weeks. Fail: users rely on existing tools and do not value a board. | Keep Layover Boards in V1. | Defer or reduce Layover Boards to lighter MVP surface. |
| A-004 | Anonymous but accountable discussion is trusted. | Trust | Desk-researched, medium | Users understand and accept verified-private / anonymous-public / accountable-internal model. | Blind and anonymous crew-room patterns support the model, but aviation-specific trust requires interviews. | Expert interview, user interviews, waitlist privacy concern field, beta behavior. | Pass: majority of interviewees say model increases comfort and fewer than 20% reject verification/anonymity model. Fail: high distrust or fear of employer exposure. | Keep anonymous posting with strict room rules. | Limit anonymity, require handles, or reposition as non-anonymous utility. |
| A-005 | Users will verify. | Verification | Desk-researched, medium | Willingness to use practical V1 verification paths. | StaffTraveler and Blind patterns support verification, but user comfort depends on method, work-email caveat, and delete-after-review handling. | Interviews, waitlist concern field, beta verification completion. | Pass: 60%+ beta account creators complete or reach pending verification. Fail: verification abandonment exceeds 20% because the path feels confusing or risky. | Keep verification as access gate. | Simplify verification, use narrower trusted beta, or pause verified community model. |
| A-006 | Users prefer no airline portal login in V1. | Scope/safety | Desk-researched, high | Users accept utility without schedule import or portal access. | Competitor and safety research strongly support avoiding portal login and scraping; Discovery Report 001 records schedule-login/cybersecurity concern as a risk signal. | Interviews, waitlist objections, competitor review mining. | Pass: users do not identify portal login as required for value. Fail: target users say product is not useful without schedule import. | Preserve no-portal-login V1 boundary. | Reassess product wedge before any app build; do not add portal login without later security/legal review. |
| A-007 | One-base/multi-role launch is best. | Go-to-market | Untested, low-medium | Base concentration, role diversity, ambassador candidates. | Private beta plan recommends one base across multiple roles; Discovery Report 001 does not provide direct evidence and no final base is selected. | Waitlist base field, outreach, first-base candidate research. | Pass: 40+ signups around one base/community with 4+ roles and 5+ ambassador candidates. Fail: no base reaches 25 signups. | Select first beta base/community. | Continue validation, narrow by role, or test one airline plus one base. |
| A-008 | Ambassadors can seed the community. | Community seeding | Untested, low | Credible users commit to seed posts, invite peers, and flag safety concerns. | Ambassador model is documented; no roster yet and Discovery Report 001 adds no direct ambassador evidence. | Waitlist ambassador field, interviews, referral behavior. | Pass: 10+ ambassador candidates, 5+ tied to top base/community. Fail: fewer than 3 credible candidates. | Recruit ambassador cohort before beta. | Delay beta, reduce invite scope, or seed more founder-led content. |
| A-009 | Jumpseat Brief is useful but not the main wedge. | AI/utility | Desk-researched, medium-high | Users rank AI as useful but not ahead of base/community utility. | Competitor research shows AI layover planning exists; Discovery Report 001 concludes AI is useful but not defensible alone unless grounded in verified community intel. | Feature ranking, interviews, beta usage, safety review. | Pass: Jumpseat Brief gets meaningful interest but Base Boards/Layover Boards/Crew Rooms remain top utility signal. Fail: users only care about AI or distrust it entirely. | Keep Jumpseat Brief as limited/demo MVP. | Defer AI or reposition as later enhancement. |
| A-010 | Deals are a monetization layer, not core wedge. | Monetization | Desk-researched, high | Users value deals but do not treat them as primary reason to join. | CrewVIP and StaffTraveler research validates deals; Discovery Report 001 keeps deals as supporting utility/monetization rather than core wedge. | Interviews, waitlist ranking, beta clicks/saves. | Pass: deals rank below core utility but still show supporting interest. Fail: users only want deals or ignore them completely. | Keep basic admin-reviewed NonRev Deals directory. | Defer deals or avoid monetizing before community trust. |
| A-011 | Users do not primarily demand excluded V1 features. | Scope | Untested, low | Feature requests do not center on schedules, non-rev loads, public tracking, dating, native mobile, marketplace payments, or roster integrations. | V1 exclusions are strongly documented, but competitor demand exists for several excluded features. User demand for jmpseat's narrower wedge remains untested. | Waitlist feature ranking, interviews, beta requests. | Pass: fewer than 3 structured feedback responses primarily request excluded risky features. Fail: demand centers on excluded features. | Preserve MVP scope. | Pause build, narrow wedge, or reassess whether product thesis is wrong. |
| A-012 | Privacy/safety concerns are addressable. | Trust/safety | Desk-researched, medium | Concerns can be answered through policy, copy, data minimization, verification controls, and moderation. | Legal, safety, and beta docs define constraints; Discovery Report 001 supports preserving strict safety controls. User comfort remains untested. | Expert interview, user interviews, waitlist privacy field, beta support issues. | Pass: 10+ useful concern responses that can be addressed and no dominant unresolved objection. Fail: repeated unaddressable distrust. | Proceed with documented safeguards. | Rework trust model, defer sensitive features, or pause. |
| A-013 | Career tools matter enough for later phases. | Roadmap | Desk-researched, medium | Users show repeated demand for interview, role movement, new-hire, and professional tools. | Competitor positioning makes career utility plausible, but Discovery Report 001 keeps Ready Room as Phase 2 unless interviews show urgency. | Interviews, waitlist ranking, public forum mining, beta posts. | Pass: career tools rank meaningfully but not above core utility in M0; repeated career pain appears. Fail: little demand. | Keep Ready Room lightweight in V1 and expand later. | Defer career tooling beyond Phase 2. |

## 3. Validation Methods

Web research:

- Use for market structure, competitor positioning, verification patterns, technical/security constraints, legal/policy inputs, and early risk discovery.
- Does not prove that jmpseat's target users will join or contribute.

App review mining:

- Use to identify repeated complaints, praise, pricing concerns, privacy concerns, and workflow gaps.
- Stronger when patterns repeat across many reviews or multiple apps.

Expert informant interview:

- Use the wife/FA interview to sharpen vocabulary, workflow understanding, safety risks, copy, and interview questions.
- Treat as medium-confidence at most unless confirmed by broader users.

User interviews:

- Use to validate pain, current alternatives, trust barriers, feature priority, and referral likelihood.
- Prioritize target roles and likely first beta community.

Waitlist form data:

- Use to validate qualified demand, role/base concentration, feature rankings, ambassador interest, interview willingness, and privacy concerns.
- Do not treat unqualified signups as demand validation.

Feature ranking:

- Use to compare Crew Rooms, Base Boards, Layover Boards, Jumpseat Brief, The Galley, NonRev Deals, Ready Room, Ramp Talk, and Crew Rest.
- Watch for drift toward generic social, dating, schedule import, non-rev loads, or public tracking.

Ambassador commitments:

- Use to validate whether the first community can be seeded by credible members.
- Ambassador interest is stronger when tied to a specific base/community and referral ability.

Beta behavior:

- Use to validate activation, verification completion, retention, posting, comments, saves, search, Jumpseat Brief usage, report volume, and moderation load.
- Beta behavior is stronger evidence than pre-build stated preference.

## 4. Current Status

Current assumption status summary:

- Desk-researched: A-000, A-001, A-002, A-003, A-004, A-005, A-006, A-009, A-010, A-012, A-013.
- Untested: A-007, A-008, A-011.
- Expert-reviewed: none yet.
- User-validated: none yet.
- Beta-validated: none yet.
- Invalidated: none yet.

Project status:

- Discovery planning exists.
- Competitor and policy desk research exists.
- No-code waitlist execution checklist exists.
- Discovery Research Report 001 exists as a desk-research synthesis.
- Customer discovery with real users has not been completed.
- FA expert interview remains pending.
- No assumption should be treated as fully validated.

## 5. Next Validation Actions

Immediate actions:

1. Conduct the FA expert interview.
   - Update this matrix with expert-reviewed notes and confidence changes.
2. Perform competitor review mining.
   - Start with Flight Crew View, StaffTraveler, CrewVIP, CrewLounge CONNECT, and newer crew-social apps.
3. Launch the no-code waitlist outside this repo.
   - Use `NO_CODE_WAITLIST_EXECUTION.md`.
4. Interview the first 10 aviation workers.
   - Include multiple roles if possible.
   - Prioritize likely first-base candidates.
5. Update this matrix after evidence.
   - Add dates, source references, confidence changes, and product implications.

Do not move assumptions to user-validated or beta-validated without recorded evidence.
