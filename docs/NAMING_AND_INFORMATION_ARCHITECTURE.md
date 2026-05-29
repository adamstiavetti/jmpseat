# Naming and Information Architecture

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This document does not prove legal, trademark, or brand-name safety.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

Deadhead Club is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Purpose

This document defines the naming and information architecture foundation for the logged-in Deadhead Club app before the private app shell is built.

The public brand can be cinematic, bold, and aviation-native. The logged-in product must be clearer: trusted, role-aware, gated, useful, and navigable on mobile. Names should help airline workers know where to go and what is safe to do.

This is not a legal clearance document. It does not implement app code, routes, auth, database, verification, community features, AI, payments, analytics, or deployment configuration.

## 2. Naming Strategy

Good Deadhead Club names should:

- Sound aviation-native without becoming corny.
- Be understandable to flight attendants and broader airline workers.
- Avoid sounding AI-generated or generic SaaS.
- Avoid implying official airline, airport, union, employer, security, dispatch, or operations authority.
- Avoid exposing or normalizing security-sensitive physical locations such as real crew rooms.
- Support role, base, station, airport, and airline segmentation.
- Stay short enough for mobile navigation.
- Be specific enough that users can predict what they will find.
- Make utility clear before social energy.

Naming should prefer clear product nouns over overly clever metaphors. Aviation language is useful when it increases recognition. It becomes risky when it implies operational control, live tracking, security systems, official airline access, or military command software.

## 3. Audience Segmentation

Deadhead Club should serve the broader airline ecosystem, but not every label works equally for every role.

| Audience | Terminology needs | IA implication |
| --- | --- | --- |
| Flight attendants | Understand crew, base, layover, galley, bid, reserve, commuter language. | Flight-crew language can appear in copy and room names, but should not dominate global navigation. |
| Pilots | Understand crew, base, flight deck, dispatch, bid, commute, layover language. | Avoid making the app sound pilot-only through labels like Flight Deck. |
| Gate agents | May relate more to station, airport, role, shift, irregular ops, passenger-facing workflows. | Use role-aware rooms and consider Base / Station copy. |
| Ramp agents | May relate more to station, airport, ramp, ops, weather, equipment, and role-specific rooms. | Avoid FA-only naming at top level; use role segmentation. |
| Maintenance | May relate more to station, hangar, base, aircraft, and safety-sensitive work. | Avoid operational/security wording and keep role rooms gated. |
| Dispatchers | "Dispatch" is a real operational function. | Do not use Dispatch as the home label or generic feature label. |
| Crew schedulers | Work near sensitive staffing/schedule topics. | Avoid schedule scraping, roster import, or live operations implication. |
| Airport ops | May interpret "airside" and "operations" literally. | Use brand atmosphere carefully; avoid official operations-system language. |
| Regional airline workers | Need career movement, base, commute, and mainline transition language. | Career Path should support regional-to-mainline workflows. |
| New hires | Need clear onboarding, base, reserve, pay, legality, and "what do I do first" content. | Home should surface guided next steps without overwhelming. |
| Commuters | Need base, station, hotels, transportation, deals, and layover utility. | Base Boards, Layover Boards, and Crew-Friendly Deals are important secondary surfaces. |
| Former or aspiring aviation workers, if allowed later | Need constrained access and clear eligibility language. | Do not grant the same room visibility without separate access policy. |

## 4. Recommended Top-Level Navigation

Research direction:

- Mobile apps should keep top-level navigation short, stable, and visible.
- Bottom navigation works best for a small number of primary destinations.
- Navigation rails or sidebars work better for medium and desktop layouts.
- Labels should be clear, familiar, concise, and consistent.
- Contextual tabs/chips should handle subcategories inside a section instead of adding too many global destinations.

Desktop recommendation:

- Use a left sidebar or navigation rail for primary destinations.
- Use a top context bar for current base, role, verification state, search, and safety notices.
- Use the main content panel for boards, rooms, and detail views.
- Add an optional right-side insight/safety panel later for pinned rules, related intel, saved items, or moderation context.

Mobile recommendation:

- Use a top header with current section, search/action, and verification/access status.
- Use bottom navigation for the most important destinations.
- Use contextual tabs/chips inside each area.
- Do not use a persistent left sidebar on small screens.
- Avoid more than five bottom nav items.

Recommended primary labels:

Desktop primary:

- Home Base
- Base Boards
- Layover Boards
- Verified Rooms
- Career Path
- Profile

Desktop utility / secondary:

- Safety & Rules
- Saved
- Crew-Friendly Deals
- Jumpseat Brief
- Admin, later and role-gated

Mobile bottom nav:

- Home
- Base
- Layover
- Rooms
- Profile

Rationale:

- This gives mobile five clear destinations.
- Career Path, Deals, Jumpseat Brief, Saved, and Safety & Rules can live inside Home, Profile, or contextual secondary menus at first.
- The top-level app stays utility-first and avoids a generic social feed structure.

## 5. Logged-In Home Name

| Option | Pros | Cons | Aviation fit | Risk / confusion | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Command Center | Strong, confident, implies control and overview. | Can feel military, official, or operational. | Medium. | May imply real airline/airport operations or command authority. | Do not use as user-facing default; acceptable as internal design metaphor. |
| Home Base | Aviation-native, warm, understandable, not too official. | "Base" may be flight-crew-weighted. | High. | Ground roles may need station language in copy. | Recommended logged-in home name. |
| Crew Deck | Aviation-adjacent and branded. | Could feel invented or pilot/ship-coded. | Medium. | Less clear than Home Base. | Not recommended for top-level home. |
| Dashboard | Immediately clear. | Generic SaaS. | Low. | Weak brand and no aviation feel. | Avoid unless user testing rejects all aviation names. |
| Briefing | Useful daily-start metaphor. | Sounds like a content module, not full app home. | Medium. | Could imply official operational briefing. | Use for a section/card, not app home. |
| Airside | Premium brand feel. | Can imply restricted airport operations area. | Medium. | May be too broad or official. | Use in brand/visual copy, not global home label. |
| Dispatch | Aviation-specific. | Dispatch is a real regulated/operational role. | Medium. | High confusion and official-operation risk. | Avoid. |
| Flight Deck | Aviation-specific. | Pilot-coded. | Medium. | Excludes FAs and ground roles; may imply cockpit/operations. | Avoid. |
| Basecamp | Familiar planning metaphor. | Generic startup/project feel; not airline-native. | Low-medium. | Less serious. | Avoid. |
| Hub | Simple and inclusive. | Generic and travel/airport-booking adjacent. | Medium. | Weak product personality. | Possible fallback, not preferred. |

Recommendation: use **Home Base** for the logged-in home screen. Use **Home** as the shortened mobile label. Avoid Command Center as the visible product label unless testing shows users prefer it.

## 6. Base Board Naming

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Base Boards | Clear to flight crew; already in product docs; strong wedge. | May feel less inclusive to some ground/station roles. | Recommended primary label. |
| Station Boards | More inclusive for airport and ground workers. | Less natural for some FAs/pilots; may sound operational. | Use in explanatory copy and role-aware labels. |
| Base Intel | Strong utility signal. | "Intel" can feel unofficial/sensitive if overused. | Use as copy, not main nav. |
| Base Hub | Friendly but generic. | Less board/knowledge-specific. | Not primary. |
| Base Desk | Utility feel. | Sounds like support/helpdesk. | Avoid. |
| Base Room | Fits rooms model. | Confuses boards vs discussion rooms. | Avoid as top-level board label. |
| Station Intel | Inclusive and useful. | More operational/sensitive tone. | Use carefully in copy. |

Recommendation: keep **Base Boards** as the primary product label. Use **Base / Station Boards** in explanatory copy and consider role-aware language inside the app. For example, a ramp or gate user could see station context in filters, descriptions, or onboarding without changing the global nav.

## 7. Layover Board Naming

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Layover Boards | Clear to flight crew; already understood; strong product surface. | Less relevant to some ground roles. | Recommended primary label. |
| City Boards | Inclusive for city intel. | Too broad; could sound like a local forum. | Use as a filter or sublabel. |
| Airport Boards | Useful for airport-specific intel. | Misses city/layover lifestyle content. | Use as a filter or sublabel. |
| Layover Intel | Strong utility signal. | "Intel" may imply sensitive info if unmanaged. | Use in copy, not nav. |
| Crew City Guides | Friendly and clear. | Guide implies editorial/static content, not community board. | Possible public copy, not primary app nav. |
| Stopover Boards | Aviation/travel language. | Less common in US airline-worker language. | Avoid primary. |
| Layover Guide | Clear. | Singular/editorial; less community-oriented. | Use for curated summaries later. |

Recommendation: use **Layover Boards** as the primary label. Inside the section, separate **Cities**, **Airports**, and **Safety Notes**. Preserve the rule: no exact public crew hotel exposure.

## 8. Discussion Room Naming

The FA expert signal in the task context clarified that gated discussion areas are useful. The concern is not necessarily the term "Crew Rooms" by itself, but real crew-room details, passwords, locations, and sensitive content must never be exposed.

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Verified Rooms | Communicates gating and trust; role-neutral. | Slightly abstract. | Recommended top-level label. |
| Role Rooms | Clearly signals segmentation. | Too narrow for base/airline/topic rooms. | Use as room type. |
| Base Rooms | Useful for base-specific discussion. | Confuses with Base Boards. | Use inside Verified Rooms, not top-level. |
| Airline Rooms | Useful for airline-specific discussion. | Needs strong safety rules and access control. | Use inside Verified Rooms, if verified/gated. |
| Gated Rooms | Clear access-control meaning. | Cold and product-mechanical. | Use in explanatory copy. |
| Crew Rooms | Familiar and previously documented. | Flight-crew-coded; real crew rooms are sensitive. | Use carefully for legacy/public copy; not preferred as top-level app nav. |
| Forums | Clear and old-school. | Generic and less premium. | Use internally if needed, not product label. |
| Channels | Familiar from Slack/Discord. | Makes product feel like a chat app clone. | Avoid top-level. |
| Spaces | Modern and broad. | Generic SaaS/community term. | Not preferred. |
| Boards | Utility-first. | Already used for Base and Layover; could blur content types. | Keep for knowledge boards. |

Recommendation: use **Verified Rooms** as the top-level product label for gated discussion areas.

Specific room examples:

- FA Room
- Pilot Room
- Gate Agent Room
- Ramp Room
- New Hire Room
- Commuter Room
- DFW Base Room
- Career Path Room
- The Galley

## 9. Casual Discussion Naming

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| The Galley | Authentic, memorable, airline-native. | FA/cabin-coded; can become casual gossip if unmanaged. | Recommended as a room inside Verified Rooms, not top-level nav. |
| Lounge | Broad and friendly. | Generic; airport lounge/travel consumer vibe. | Possible fallback. |
| Crew Talk | Clear. | Generic and chatty. | Acceptable room description, not preferred name. |
| Off-Duty | Fits brand positioning. | Broad, less concrete. | Good section copy. |
| Breakroom | Worker-inclusive. | Generic workplace feel. | Possible fallback. |
| Cabin Talk | Authentic for FAs. | Too FA-only. | Avoid top-level. |
| Hangar | Maintenance/aviation feel. | Not inclusive; can sound themed. | Avoid unless for maintenance-specific room. |
| Ramp Talk | Useful for ramp/gate/ops. | Role-specific; not general casual. | Use as a specific role/topic room if validated. |
| Social | Clear. | Generic and invites feed behavior. | Avoid. |

Recommendation: keep **The Galley** as a casual room inside Verified Rooms, with strong rules against gossip, drama, harassment, PII, and sensitive operational content.

## 10. Career Section Naming

The FA expert signal provided in task context said to change **Ready Room**.

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Career Path | Clear, inclusive, mobile-friendly. | Less aviation-flavored. | Recommended. |
| Next Leg | Aviation-native and optimistic. | May be too cute or unclear for new users. | Possible campaign/module name. |
| Flight Path | Aviation-native. | Pilot/flight-coded; common generic career metaphor. | Not preferred. |
| Upgrade Path | Aviation/career meaning. | Pilot seniority/upgrade-coded. | Use as subtopic, not section. |
| Career Board | Clear. | Sounds job-board-only. | Not broad enough. |
| Crew Path | Aviation-ish. | Crew-coded and less inclusive for ground roles. | Avoid primary. |
| Pathways | Inclusive. | Generic and vague. | Not preferred. |
| Hiring Board | Clear for hiring questions. | Too narrow. | Use as subcategory. |
| The Next Leg | Memorable. | Too clever for primary navigation. | Use in copy if desired. |

Recommendation: rename **Ready Room** to **Career Path**. It should cover regional-to-mainline, ramp/gate-to-FA, FA-to-pilot, new-hire/interview prep, and "who is hiring" questions.

## 11. Deals Section Naming

| Option | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| Crew-Friendly Deals | Clear, trust-oriented, descriptive. | Longer for mobile. | Recommended formal label. |
| NonRev Deals | Aviation-native and already documented. | Non-rev can imply flight-load/staff-travel utility, which is excluded. | Avoid as primary label. |
| Perks | Short. | Too broad. | Possible mobile/secondary label. |
| Crew Perks | Short and friendly. | Slightly less specific than Deals. | Good secondary label. |
| Travel Perks | Consumer travel vibe. | Could imply booking site. | Avoid primary. |
| Commuter Deals | Strong for hotels/car rentals. | Too narrow. | Use as filter/category. |
| Deals | Simple. | Generic and spammy. | Avoid alone. |
| Marketplace | Business-like. | Implies payments/vendor platform, out of scope. | Avoid until marketplace is approved. |

Recommendation: use **Crew-Friendly Deals** as the formal product label and **Crew Perks** as a shorter secondary/mobile label if needed. Do not make deals top-level early unless validation supports it. Deals must be admin-reviewed and should not look like ads.

## 12. Verification / Trust Naming

Preferred terminology:

- **Verified**: general user-facing state.
- **Aviation Verified**: user has passed an aviation affiliation verification path.
- **Work Email Verified**: user verified through an aviation/company work email code.
- **Manual Review Pending**: human review needed.
- **Manually Verified**: human-admin verification decision.
- **Role Verified**: use only if the platform actually verifies role, not just self-reported profile.
- **Base Verified**: avoid unless base assignment is actually verified.
- **Beta Access**: invite/access status, separate from verification.
- **Room Access**: what rooms the user can see or join.
- **Private Identity**: admin-protected identity information.
- **Public Handle**: user-facing display identity.

Clarifications:

- Auth is not verification.
- Beta access is not verification.
- Work email code is the preferred early verification path.
- Employee number may be considered later for private admin verification, but not public waitlist.
- Badge upload remains deferred unless private storage, validation, access logging, short-lived admin links, and delete-after-review controls exist.
- Public waitlist must not collect sensitive proof.
- Avoid exposing "Trust Level" as a gamified user-facing rank. Use it internally for admin/moderation eligibility if needed.

## 13. Profile / Identity Naming

User-facing labels:

- Public Handle
- Role
- Airline / Company
- Base / Station / Airport
- Verification Status
- Room Access
- Privacy Settings
- Saved

Admin-only or restricted labels:

- Private Identity
- Login Email
- Work Email Verification
- Verification Method
- Verification Reviewer
- Trust Status
- Moderation History
- Security Events
- Beta Access Status

User-facing profile should explain what is public, what is private, and what admins can see. Admin views can connect public handles and anonymous room activity to internal identity only for policy enforcement, safety/security review, appeals, verification fraud, or required investigation.

## 14. App Navigation IA

Recommended desktop IA:

```text
App Shell
  Home Base
  Base Boards
    My Base
    Other Bases / Stations
    Commuting
    Reserve / New Hire
    Food / Errands
    Parking / Transit
  Layover Boards
    Cities
    Airports
    Food
    Transportation
    Safety Notes
    Things To Do
  Verified Rooms
    Role Rooms
    Base Rooms
    Airline Rooms
    Topic Rooms
    The Galley
  Career Path
    Hiring
    Interviews
    New Hire
    Regional to Mainline
    Ramp/Gate to FA
    FA to Pilot
  Profile / Verification
    Public Handle
    Private Identity
    Verification Status
    Room Access
    Privacy Settings
  Safety & Rules
```

Recommended mobile bottom nav:

```text
Home
Base
Layover
Rooms
Profile
```

Secondary destinations:

- The Galley: inside Verified Rooms.
- Crew-Friendly Deals / Crew Perks: secondary Home or utility section until validated as top-level.
- Jumpseat Brief: Home card or Layover Boards utility, not top-level until validated.
- Saved: Profile or Home secondary utility.
- Safety & Rules: Profile and room-level persistent link.
- Admin: later, hidden unless admin role exists.

Why some features are not top-level early:

- Too many mobile destinations will dilute the core loop.
- Deals are supporting monetization, not the wedge.
- Jumpseat Brief is useful but should not become the brand gimmick.
- The Galley is important but should not make the app feel social-first.
- Safety & Rules must be visible contextually, but it does not need a bottom-nav slot.

## 15. Route Naming Recommendation

Use plain, durable URLs:

```text
/app
/app/base
/app/layovers
/app/rooms
/app/career
/app/profile
/app/safety
/app/saved
/app/deals
/app/admin
```

Rules:

- Avoid overly cute URLs.
- Avoid operational URLs such as `/app/dispatch`, `/app/ops-control`, or `/app/flight-tracker`.
- Keep route names stable even if display labels evolve.
- Keep `/app/admin` later and admin-only.
- Do not create these routes until a future implementation task explicitly approves it.

## 16. Naming Decision Table

| Concept | Candidate names | Recommended name | Rationale | Risks | Status |
| --- | --- | --- | --- | --- | --- |
| Logged-in home | Command Center, Home Base, Crew Deck, Dashboard, Briefing, Airside, Dispatch, Flight Deck, Basecamp, Hub | Home Base | Aviation-native, warm, useful, not too official. | May need station copy for ground roles. | Provisional |
| Base/station knowledge | Base Boards, Station Boards, Base Intel, Base Hub, Base Desk, Base Room, Station Intel | Base Boards | Clear, already central to wedge. | "Base" may be flight-crew weighted. | Accepted for now |
| Inclusive base copy | Base / Station Boards, Station Intel | Base / Station Boards | Supports broader airline-worker inclusion. | Longer label. | Provisional copy pattern |
| Layover knowledge | Layover Boards, City Boards, Airport Boards, Layover Intel, Crew City Guides, Stopover Boards | Layover Boards | Clear and supported by research. | Less relevant to some ground roles. | Accepted for now |
| Gated discussions | Crew Rooms, Verified Rooms, Role Rooms, Base Rooms, Airline Rooms, Forums, Channels, Spaces | Verified Rooms | Trust and access are clear; less physical-crew-room risk. | Slightly abstract. | Provisional |
| Casual discussion | The Galley, Lounge, Crew Talk, Off-Duty, Breakroom, Cabin Talk, Hangar, Ramp Talk, Social | The Galley | Authentic and memorable as a room. | FA-coded; needs anti-gossip rules. | Provisional room name |
| Career tools | Ready Room, Career Path, Next Leg, Flight Path, Upgrade Path, Career Board, Crew Path, Pathways | Career Path | Clear and inclusive; responds to FA feedback to replace Ready Room. | Less aviation-flavored. | Recommended |
| Deals | Crew-Friendly Deals, NonRev Deals, Perks, Crew Perks, Travel Perks, Commuter Deals, Marketplace | Crew-Friendly Deals | Clear and trust-oriented. | Long label. | Provisional secondary |
| Verification state | Verified, Aviation Verified, Work Email Verified, Manually Verified, Trust Level, Access Level | Aviation Verified | Specific and honest. | Must not overstate role/base verification. | Provisional |
| Identity display | Public Handle, Private Identity, Anonymous Mode | Public Handle / Private Identity | Supports verified-private, anonymous-public model. | Needs clear user education. | Accepted concept |
| Admin access | Admin, Moderator, Review Queue, Safety Desk | Admin / Review Queue | Clear and non-cute. | Must not expose to normal users. | Later/deferred |

## 17. Terms to Avoid

Avoid or use very carefully:

- Crew room password/location.
- Exact crew hotel.
- Airline operations.
- Dispatch, unless referring to the actual role.
- Flight tracker.
- Live tracking.
- Official.
- Airline approved.
- Employer approved.
- Employee database.
- Surveillance-like wording.
- Anonymous with no accountability.
- Nearby crew.
- Radar for real people.
- Dating, swipe, match, or meetup-first language.
- Crew room details.
- Security procedures.
- Ops control.
- Command authority.
- Flight deck as a global app label.
- Public hotel list.

## 18. Open Naming Questions

- Should the logged-in home be Home Base, Command Center, or another name after user feedback?
- Should Verified Rooms replace Crew Rooms everywhere, or should Crew Rooms remain in some public copy?
- Should Base Boards become Base / Station Boards for inclusivity?
- Is The Galley too FA-coded for the casual discussion room?
- Should Career Path be the final replacement for Ready Room?
- Should Crew-Friendly Deals be top-level, secondary, or deferred until more validation?
- Should role-specific naming change after more FA, pilot, gate, ramp, maintenance, dispatch, scheduler, and airport ops feedback?
- Should Jumpseat Brief become a top-level utility later, or remain inside Home/Layovers?
- Should Safety & Rules be a desktop top-level item or a persistent utility link?

## 19. Recommended Next Tasks

1. Validate naming with 3-5 FA/aviation contacts.
2. Update landing page/waitlist copy if naming changes affect public terminology.
3. Use the recommended IA to build the private app shell lab only after explicit approval.
4. Do not build real community features until auth, verification, moderation, admin, and safety gates exist.

## Research Basis

This plan is informed by:

- [Apple Human Interface Guidelines: Tab bars](https://developer.apple.com/design/Human-Interface-Guidelines/tab-bars) for mobile top-level navigation constraints.
- [Material Design navigation rail](https://m2.material.io/components/navigation-rail) and [navigation drawer](https://m1.material.io/patterns/navigation-drawer.html) guidance for desktop/tablet rail/sidebar patterns and mobile avoidance.
- [Nielsen Norman Group menu design checklist](https://media.nngroup.com/media/articles/attachments/PDF_Menu-Design-Checklist.pdf) for visible navigation, clear text labels, concise labels, and consistent terminology.
- [Information Architecture Authority navigation design](https://informationarchitectureauthority.com/navigation-design) and [labeling systems](https://informationarchitectureauthority.com/labeling-systems) summaries for organization, labeling, navigation, and search systems.
- [Slack channel documentation](https://slack.com/help/articles/360017938993-What-is-a-channel) and [channel prefix guidance](https://slack.com/hc/en-gb/articles/360033618294-create-channel-prefixes-for-your-workspace) as examples of clear shared-knowledge spaces and naming conventions.
- [Discord roles and permissions documentation](https://support.discord.com/hc/en-us/articles/214836687-Discord-Roles-and-Permissions) as a cautionary pattern for role-gated spaces.
- [FAA Pilot/Controller Glossary](https://www.faa.gov/Air_traffic/Publications/atpubs/pcg_html/) as a caution against using real operational terms such as Dispatch or Flight Deck loosely.
