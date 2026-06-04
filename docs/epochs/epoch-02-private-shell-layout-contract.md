# Epoch 02 Private Shell Layout Contract

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

This document defines the shell layout contract for `E02-T02` in Epoch 02: Private App Foundation.

Its purpose is to describe the future private app frame under the `/app` namespace without implementing real product functionality. The shell must establish a stable layout boundary that later epochs can use for auth, profiles, verification, boards, rooms, moderation, and admin work.

This is planning only. It does not implement app code, auth, user state, sessions, verification, beta access, content features, moderation, admin actions, AI, payments, or database work.

## 2. Shell Role In Epoch 02

The private shell exists to:

- separate the private product area from the public waitlist surface
- provide a consistent frame for future private routes
- support honest locked and unavailable placeholder states
- establish mobile-first navigation and layout expectations early
- reduce later rework by defining stable shell zones before feature work begins

The shell does not exist to:

- create the illusion of a working private beta
- simulate authenticated states
- expose hidden product functionality behind visual locks
- act as the real security boundary

## 3. Route Namespace

Canonical private namespace:

- `/app`

Related placeholder routes defined by the Epoch 02 route map:

- `/app`
- `/app/home`
- `/app/base`
- `/app/layovers`
- `/app/rooms`
- `/app/profile`
- `/app/verification`
- `/app/admin`

The shell contract assumes all of these routes are placeholder-only in Epoch 02.

## 4. Public / Private Boundary

The public and private surfaces must remain clearly distinct.

Public surface:

- `/`
- later public policy routes such as `/privacy`, `/terms`, and `/community-guidelines`

Private surface:

- `/app` and child routes

Boundary rules:

- Public routes remain marketing, trust, and policy surfaces.
- Private routes remain non-functional placeholder product surfaces during Epoch 02.
- The shell must not inherit cinematic marketing patterns that make the private app feel like another waitlist page.
- The shell must not change the public waitlist experience.

## 5. Shell Layout Zones

The private shell should be defined as a small set of stable layout zones.

### Header / Topbar

Purpose:

- identify the current private area
- provide current section context
- surface lock or unavailable status messaging at a high level
- provide space for future search, account state, and safety notices in later epochs

Epoch 02 expectation:

- no working account controls
- no real user avatar
- no real verification badge
- no real notifications

### Primary Navigation

Desktop expectation:

- sidebar or navigation rail

Mobile expectation:

- bottom navigation or compact mobile nav pattern

Purpose:

- orient users to the future app structure
- expose placeholder route labels consistently
- keep the private shell utility-first rather than feed-first

Epoch 02 expectation:

- navigation items may be visible as placeholders
- navigation must not imply that the linked areas are functional
- unavailable states should be obvious

### Main Content Area

Purpose:

- host the current route placeholder
- display locked, unavailable, or future-surface messaging
- provide the main readable content region for later epochs

Epoch 02 expectation:

- no real feeds
- no real boards
- no real forms
- no live data
- no user-specific content

### Locked-State Region

Purpose:

- make the locked or not-yet-available state explicit
- explain the private-beta status honestly
- set expectations without pretending access exists

This may exist inside the main content area or as a distinct shell-level block, but the contract should reserve a clear place for it.

### Footer / Help / Safety Region

Purpose:

- provide future space for safety reminders, route limitations, privacy cues, or help links
- reinforce trust and constraint messaging without overwhelming the shell

Epoch 02 expectation:

- optional in the first implementation
- if present, should stay minimal and informational

## 6. Placeholder Navigation Items

The shell should reserve navigation for the following future private routes:

- `/app` - locked private shell entry
- `/app/home` - Home Base
- `/app/base` - Base Boards
- `/app/layovers` - Layover Boards
- `/app/rooms` - Verified Rooms
- `/app/profile` - Profile
- `/app/verification` - Verification
- `/app/admin` - Admin

Navigation rules:

- labels should stay aligned with the current information architecture
- unavailable items must read as placeholders, not working destinations
- navigation must stay narrow and utility-oriented
- the shell must not promote excluded V1 areas such as payments, marketplace, nearby crew, or schedule tools

## 7. Locked / Private Placeholder Behavior

Epoch 02 shell behavior must remain honest.

Required behavior principles:

- the private shell may show locked placeholders
- the shell may describe future invite-only access
- the shell may explain that the private app is not yet open through this surface
- the shell must not imply that a route is protected by real auth if auth does not exist yet

Not allowed:

- fake logged-in state
- fake invited-user state
- fake verification status
- fake moderation/admin access
- cosmetic UI that suggests data exists behind the lock

Client-only locked views may help explain the shell structure, but they must never be described as real security.

## 8. Mobile-First Layout Expectations

The private shell should be designed mobile-first.

Requirements:

- core shell zones must work on narrow screens before wider desktop layouts
- primary navigation should be simple and legible on mobile
- the main content area should prioritize readable locked-state messaging over decorative layout
- header content should remain compact and avoid fake account density
- the shell should not rely on hover-only interaction or desktop-only patterns

Desktop can expand into a sidebar or rail, but mobile must remain the first reference point.

## 9. Accessibility Expectations

The shell contract should preserve the repo's WCAG 2.2 AA direction.

Shell-level expectations:

- clear page landmarks
- visible focus states
- keyboard-reachable navigation
- logical reading order
- headings that identify the current route or state
- locked-state copy that is understandable without visual cues alone
- status or unavailable messaging that can be consumed by assistive technology

The shell contract does not define later feature-form accessibility, but it should avoid creating patterns that later work will need to undo.

## 10. Copy And Tone Guidelines For Locked States

Locked-state copy should feel:

- clear
- calm
- trustworthy
- low-drama
- not gimmicky
- not obviously AI-generated

Copy should:

- explain that this is a private app surface
- state that access is not open here yet
- avoid implying failure or brokenness
- avoid pretending the user is one step away from real access when no such flow exists yet
- reinforce that future access is invite-only and tied to later access controls

Copy should not:

- sound like a teaser landing page
- sound like a fake dashboard
- sound like a system warning or security alert unless a true security event exists
- imply official airline, airport, union, or employer authority

## 11. Documentation Impact Expectations

This shell contract follows the repo's documentation hygiene rule.

Implications for future work:

- implementation tickets using this shell should identify documentation impact
- implementation or review reports should state whether docs were updated or why no doc update was needed
- future shell behavior changes should update the relevant epoch, route-map, architecture, or review docs when applicable

## 12. Implementation Guardrails

- Do not modify the public waitlist page.
- Do not modify cinematic, globe, or Three.js work.
- Do not implement auth, sessions, or beta access.
- Do not implement boards, rooms, posting, comments, saves, search, or moderation.
- Do not implement admin workflows.
- Do not implement AI or payments.
- Do not introduce database, API, or storage dependencies.
- Do not present client-only locked states as real security.
- Do not create fake account, profile, or verification state.
- Keep the shell structural, minimal, and ready for later utility-focused product work.

## 13. Future Epoch Ownership

This contract belongs to Epoch 02 only.

Later epochs should own the following:

- Epoch 03: real auth, account states, profile and beta-access gating
- Epoch 04: verification states and workflows
- Epoch 05: Base Boards, Layover Boards, Verified Rooms, and structural community surfaces
- Epoch 06: moderation, reporting, admin actions, and operational controls

If later epochs need to evolve the shell, they should do so by updating this contract or a successor doc rather than drifting through ad hoc implementation decisions.

## 14. Unresolved Shell Decisions

These decisions remain open after E02-T02:

- whether the desktop shell should prefer a left sidebar or a slimmer navigation rail
- whether the mobile shell should use bottom navigation or a more compact topbar-plus-drawer pattern
- whether the locked-state region should always appear in the main content area or be reinforced at the shell level
- whether `/app` should act as the same placeholder as `/app/home` or remain a distinct shell-entry state
- whether a footer/help/safety region is necessary in the first shell implementation or should remain optional

These unresolved decisions do not block E02-T02 because the shell zones, route namespace, and guardrails are now defined clearly enough for future implementation planning.

## 15. E02-T02 Readiness

`E02-T02` is planning-complete when:

- the shell purpose is defined
- the `/app` namespace is preserved
- shell zones are documented
- placeholder navigation items are named
- mobile-first and accessibility expectations are stated
- locked-state behavior is honest and non-security-pretending
- later epoch ownership is explicit

That threshold is met by this contract.
