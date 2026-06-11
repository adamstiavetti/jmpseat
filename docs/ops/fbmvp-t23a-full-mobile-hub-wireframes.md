# FBMVP-T23A Full Mobile Hub Wireframes

Date: 2026-06-11

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

## Purpose And Scope

This is a docs/design wireframe packet for the updated mobile-first jmpseat
private-beta experience after the Hub pivot.

This packet covers:

- private beta dashboard/home
- DFW Hub overview
- DFW Today
- Base
- Layover
- Channels overview
- Channel detail/thread list
- Thread detail
- Start a Thread composer
- reply/comment flow
- report flow
- saved/empty states
- navigation model

This packet does not implement app code, edit migrations, mutate runtime data,
change database/RPC behavior, deploy, add media uploads, add live
weather/traffic, or add free channel creation. There is no real production UGC
yet, so the wireframes use empty states and example placeholders rather than
claiming live community content exists.

## Source Of Truth

Use these docs first for any Hub or wireframe continuation:

- `docs/ops/hub-pivot-plan.md`
- `docs/ops/fbmvp-t21-dfw-hub-product-framing-runtime-smoke.md`
- `docs/ops/fbmvp-t22-hub-channels-ia-data-model-lock.md`
- `docs/BUILD_TICKETS.md`
- `docs/DATA_MODEL.md`
- `docs/ops/05b-first-base-mvp-planning.md`

Product language:

- `[AIRPORT] Hub`
- `[AIRPORT] Today`
- Base
- Layover
- Channels
- Recent Useful Threads
- Request a Channel inside Channels
- Thread for the current post primitive
- Reply/comment for the current comment primitive

## Visual Direction Summary

The mobile experience should feel closer to the older polished mobile dashboard
mockup than the current placeholder-heavy shell:

- clean iPhone-first layout
- strong jmpseat wordmark top-left
- notification and profile affordances top-right
- verified/account status row near the top
- global search near the top
- large airport Hub hero card with image/color split
- bold airport code treatment
- clear primary CTA
- quick actions row
- card-based utility hierarchy
- bottom navigation
- premium aviation-worker utility feel
- not a generic social feed

Visual reference interpretation:

- Preserve the reference's overall mobile hierarchy: wordmark, account/status
  row, search, large airport hero, quick actions, card sections, and bottom
  navigation.
- Translate old board/room phrasing into the current Hub model. The hero
  becomes `DFW Hub`. Quick actions become Hub, Channels, Layover, and Saved
  actions. Layover appears as a Hub-contained section. Restricted/member-only
  surfaces are not a primary part of this mobile Hub packet.
- Use the polished iPhone-first rhythm as the inspiration, but keep current
  safety, access, and product-language boundaries.

The visual hierarchy should make utility feel immediate. Community behavior
should sit underneath scoped Hub sections, especially Channels and Recent
Useful Threads.

## Visual Mockup Review Outcome

Codex generated five visual approval mockups for:

- Home / Dashboard
- DFW Hub Overview
- DFW Channels Overview
- Channel Detail / Thread List
- Thread Detail + Reply Composer

The overall direction is approved. The polished mobile dashboard direction is
strong, the Hub-first model is clear, Channels correctly stays browse-first,
Request a Channel correctly lives on the Channels overview as a secondary
action, Start a Thread correctly lives inside a selected Channel detail page,
and Thread detail correctly centers reply/report behavior.

### Approved Direction

Preserve these decisions in the next static prototype:

- premium mobile aviation-worker utility feel
- strong jmpseat wordmark and account affordances
- verified/account status row
- global search near the top
- large airport Hub hero card
- bold airport code treatment
- clear primary CTA hierarchy
- bottom navigation
- Hub-first language throughout
- Channels overview as browse/select, not creation-first
- Request a Channel as secondary
- Start a Thread as primary only inside a selected Channel
- Thread detail focused on reading, replying, and reporting

### Required Revisions Before Static Prototype

The generated mockups are approval comps, not literal implementation specs.
Before creating a static prototype route:

- Do not blindly copy the heavy card treatment for Channels and thread lists.
- Remove fake scale claims such as large post counts, member counts, or
  engagement totals.
- Use beta-safe placeholders: No threads yet, Sample threads, Recently active,
  New, and Coming soon.
- Do not show mutually exclusive states together. Do not show thread rows and
  "No threads yet" at the same time. Do not show "No replies yet" and
  "Could not load replies" at the same time.
- Keep the bottom navigation consistent: Home, Hubs, Search, Saved, Me.
- Keep Hubs active for DFW Hub, Channels, Channel detail, and Thread detail
  flows reached from Hubs.
- Keep report access available but visually quiet except on detail screens.
- Keep safety reminders concise near composer/report flows. Use fuller safety
  cards only where they improve comprehension.

This Required Revisions section is controlling for T23B prototype
implementation. If an earlier sample wireframe block conflicts with these
rules, T23B must split the conflict into separate prototype states. Do not show
thread rows and an empty state together, and do not show "No replies yet" and
an error state together.

### Card Vs Compact Row Treatment

Use cards for major destinations and emphasis:

- Hub hero
- DFW Today preview
- Base preview
- Layover preview
- Channels preview
- empty states
- safety reminders
- thread detail container

Use compact rows/lists for repeatable items:

- Channels list
- thread list
- comments/replies
- search results
- saved items

Channels overview should feel like a focused native mobile list, not a stack of
oversized cards. Thread lists should feel like compact forum rows, not a social
feed.

### Prototype Handoff Rules

The next likely implementation ticket is:

`FBMVP-T23B: Protected Static Hub Wireframe Prototype Route`

The likely route is:

`/app/admin/design/dfw-hub-wireframes`

T23B should be a protected static prototype route only. It should not add real
Hub Channels data, DB/RPC changes, migrations, free channel creation, media,
live weather/traffic, saves, reactions, search, or runtime mutations.

T23B must use fake/mock/static data only. It must not call Supabase content
RPCs, query or display real `board_posts`, comments, reports, author IDs,
reporter identity, or runtime UGC, and must not mutate runtime data. It must
not implement DB/RPC-backed Channels, apply migrations, or depend on live
weather/traffic, search, saves, reactions, or media.

The prototype should:

- use the approved T23A visual direction
- apply the required revisions above
- use only fake/mock/static beta-safe placeholder content
- make no Supabase content RPC calls
- keep Hubs active in bottom navigation for Hub-derived screens
- show one state at a time per screen
- use compact list rows for repeated Channels, threads, comments, search
  results, and saved items
- keep Request a Channel secondary
- keep Start a Thread inside selected Channel detail

## Navigation Model

Recommended mobile bottom navigation:

- Home
- Hubs
- Search
- Saved
- Me

Why this model:

- Home is the personalized private-beta dashboard.
- Hubs keeps DFW and future airport/base Hubs discoverable.
- Search is important enough to deserve persistent navigation later, but must
  still respect access controls.
- Saved can exist as a navigation promise, but should render a clear future or
  empty state until saves are implemented.
- Me keeps profile, status, verification, and settings separate from community
  browsing.

Header pattern:

```text
[Top Bar]
jmpseat                                      bell   avatar
```

Bottom nav pattern:

```text
[Bottom Nav]
Home        Hubs        Search        Saved        Me
```

## Home / Dashboard Wireframe

Route intent: `/app`

Primary action: open the relevant Hub.

```text
[Top Bar]
jmpseat                                      bell   avatar

[Welcome]
Welcome back, Alex
Verified - Flight Attendant - AUS Base

[Search]
Search jmpseat...

[Hero Card: DFW Hub]
DFW Launch
DFW Hub
DFW Today - Base - Layover - Channels
CTA: Open DFW Hub

[Quick Actions]
Open DFW Hub | Browse Channels | Find Layover Info | Saved

[Recent Useful Threads]
Useful DFW threads will appear here as verified workers contribute.
CTA: Browse DFW Channels

[Suggested Channels]
DFW Questions
Commuting & Parking
Food & Coffee

[Saved / Recently Viewed]
No saved items yet.
Saved threads and Hub sections will appear here later.

[Bottom Nav]
Home        Hubs        Search        Saved        Me
```

Notes:

- Do not make the dashboard a raw feed.
- Do not make thread creation the dashboard's primary action.
- The primary dashboard behavior is opening DFW Hub or returning to useful
  Hub content.
- Saved can be visible as a future navigation area, but must not claim live
  save functionality if it is not implemented.

## DFW Hub Overview Wireframe

Route intent: `/app/hubs/dfw`

Primary action: browse Hub sections.

```text
[Top Bar]
jmpseat                                      bell   avatar

[DFW Hub Hero]
Dallas/Fort Worth
DFW
DFW Hub
A utility home for DFW aviation workers.
CTA: Browse Hub Sections

[Search]
Search within DFW...

[DFW Today Preview]
Curated current info
Weather placeholder - public advisories - app notes
CTA: View DFW Today

[Base Preview]
Commuting, parking, new-to-DFW, base life, practical airport info
CTA: View Base

[Layover Preview]
Essentials, food, getting around, things to do, crew tips
CTA: View Layover

[Channels Preview]
DFW Questions, Commuting & Parking, Food & Coffee...
CTA: Browse Channels

[Recent Useful Threads Preview]
No useful DFW threads yet.
Useful threads will appear as verified workers contribute and moderators or
admins surface high-signal posts.

[Bottom Nav]
Home        Hubs        Search        Saved        Me
```

Notes:

- The Hub overview should not be a raw chronological feed.
- Request a Channel should not appear as a large Hub-level CTA.
- Recent Useful Threads is high-signal community surfacing, not the default
  top-level browsing model.

## DFW Today Wireframe

Section intent: curated current information.

```text
[Header]
DFW Today
Curated current info for DFW aviation workers.

[Status Note]
Updated by jmpseat admins/founders. Live integrations are not active yet.

[Current Info Cards]
Weather placeholder
No live weather integration yet.

Traffic / public airport advisory placeholder
No live traffic integration yet.

App note
Private beta notes and recently updated sections can appear here.

Recently updated
Base, Layover, or Channels updates can be summarized here after review.

[Empty State]
No DFW Today updates yet.
Check Base, Layover, or Channels for evergreen and community information.
```

Rules:

- Do not claim live weather, traffic, airport, or advisory integrations exist.
- Do not imply AI is final publisher.
- Frame this as curated/admin/founder-approved content.

## Base Section Wireframe

Section intent: based-worker utility.

```text
[Header]
Base
Practical DFW information for people based at or working from the airport.

[Search / Filter]
Search Base info...

[Utility Cards]
Commuting
Parking
New to DFW
Base Life
Food and coffee near work areas
Practical airport basics

[Curated Info State]
Curated DFW Base information will be added as it is reviewed.

[Safety Note]
Do not post operationally sensitive, company-confidential, passenger-private,
or security-sensitive information.
```

Rules:

- Keep copy practical and safe.
- Avoid operationally sensitive or company-confidential claims.
- Do not imply workers can directly edit curated/admin content.

## Layover Section Wireframe

Section intent: Hub-contained layover utility.

```text
[Header]
Layover
Practical DFW layover information inside DFW Hub.

[Category Grid]
Essentials
Recommendations
Questions
Crew Tips
Getting Around
Food & Coffee
Things To Do
Short Layover
Long Layover

[Future UGC Note]
Crew-sourced recommendations and questions can appear here later after the
Channels model is stable.

[Empty State]
No layover recommendations yet.
Useful layover info will appear here after review.

[Safety Boundaries]
No exact crew hotels.
No live crew movement or location.
No passenger private information.
No security-sensitive procedures.
No company-confidential content.
No dating or social meetup behavior.
```

Rules:

- Layover lives inside the airport Hub.
- Do not present a separate top-level layover product.
- Do not add photo upload to this immediate design.
- Do not claim real layover UGC exists.

## Channels Overview Wireframe

Route intent: DFW Hub / Channels.

Primary behavior: browse and select an existing Channel.

Secondary action: Request a Channel, placed at the bottom as a lower-priority
reviewed action.

```text
[Top Bar]
jmpseat                                      bell   avatar

[Breadcrumb]
DFW Hub / Channels

[Header]
DFW Channels
Focused discussion spaces for verified aviation workers.

[Search / Filter]
Search Channels...

[Channel List]

[Channel Card]
DFW Questions
Ask practical DFW questions and find useful answers.
Recent useful thread: No useful threads yet.
Meta: Open to verified DFW Hub members

[Channel Card]
Commuting & Parking
Commute patterns, parking notes, transit, and practical access tips.
Recent useful thread: No useful threads yet.
Meta: Keep it practical and non-sensitive

[Channel Card]
Food & Coffee
Food, coffee, and quick-stop recommendations around DFW.
Recent useful thread: No useful threads yet.
Meta: Recommendations should avoid private crew location details

[Channel Card]
New to DFW
Starter questions and practical orientation for workers new to DFW.
Recent useful thread: No useful threads yet.
Meta: Beginner-friendly

[Channel Card]
Base Life
Evergreen and semi-evergreen base-life discussion.
Recent useful thread: No useful threads yet.
Meta: Utility first

[Channel Card]
Crew Tips
Practical tips from aviation workers, with safety boundaries.
Recent useful thread: No useful threads yet.
Meta: No live ops-sensitive details

[Channel Card]
App Feedback
Focused feedback about the jmpseat private beta.
Recent useful thread: No useful threads yet.
Meta: Product feedback

[Secondary Footer Card]
Need a focused place for another aviation-worker topic?
Request a Channel
Admin review required. This is not instant creation.

[Bottom Nav]
Home        Hubs        Search        Saved        Me
```

Rules:

- Do not place Start a Thread as the main action on the Channels overview.
- Do not make Request a Channel visually compete with normal browsing.
- Channel cards should lead to a selected Channel detail/thread list.

## Channel Detail / Thread List Wireframe

Route intent: DFW Hub / Channels / Food & Coffee.

Primary action: Start a Thread.

```text
[Breadcrumb]
DFW Hub / Channels / Food & Coffee

[Channel Header]
Food & Coffee
Food, coffee, and quick-stop recommendations around DFW.
Scope: practical recommendations only. Avoid private crew location details.

[Primary CTA]
Start a Thread

[Sort / Filter]
Useful | Recent | Unanswered

[Thread List]

[Thread Card]
Where is the fastest coffee stop before a short turn?
Looking for practical options near the employee path.
Channel: Food & Coffee
Author: jmpseat member
Comments: 0
Last activity: Recently
Report

[Empty State]
No Food & Coffee threads yet.
Start the first practical thread for this Channel.
```

Rules:

- Start a Thread appears only after a user selects a specific Channel.
- No reactions or saves unless separately scoped.
- Thread list cards should not expose author IDs or private metadata.

## Thread Card Anatomy

Thread cards should include:

- title
- short excerpt
- channel label
- safe author label
- comment count
- last activity
- report affordance
- moderation state only when needed for safe admin/operator contexts

Thread cards must not expose:

- author IDs
- email addresses
- reporter identity
- verification evidence
- private paths
- signed URLs
- hidden/removed content in normal reads

Example:

```text
[Thread Card]
Best quick coffee near the employee path?
Practical options for a short connection window.
Food & Coffee
jmpseat member - 0 replies - recently active
Report
```

## Thread Detail Wireframe

Route intent: selected thread detail.

Primary action: Reply.

```text
[Breadcrumb]
DFW Hub / Channels / Food & Coffee

[Thread]
Best quick coffee near the employee path?
jmpseat member - recently active

Practical options for a short connection window.

[Secondary Actions]
Report thread

[Replies]
No replies yet.

[Reply Composer]
Add a helpful reply...
Safety: no passenger private information, exact crew hotels, live ops-sensitive
details, or security-sensitive procedures.
CTA: Reply

[Comment Actions]
Report comment

[States]
Loading replies...
Could not load replies. Try again in a moment.
This thread is unavailable.
```

Rules:

- No nested replies until separately supported.
- No reactions unless separately scoped.
- Do not reveal whether unavailable content is hidden, removed, unauthorized,
  or nonexistent.

## Start A Thread Composer Wireframe

Launch location: inside a specific Channel detail page only.

```text
[Composer Header]
Start a Thread
Channel: Food & Coffee

[Post Type]
Question | Recommendation | Tip | Update

[Title]
What do you want to ask or share?

[Body]
Add details that help other verified aviation workers.

[Safety Reminder]
Do not include:
- passenger private information
- exact crew hotel exposure
- live ops-sensitive content
- security-sensitive procedures
- company-confidential content

[Actions]
Cancel        Post Thread

[Validation States]
Choose a title.
Add a little more detail.
jmpseat could not post that right now. Try again in a moment.
```

Rules:

- The selected Channel must be clear and non-ambiguous.
- Do not allow top-level Channels overview thread creation.
- The server-side implementation later must resolve the Channel safely.

## Comment / Reply Flow Wireframe

```text
[Replies Section]
Replies

[Empty State]
No replies yet.
Be the first to add a helpful reply.

[Reply Composer]
Write a reply...
CTA: Reply

[Reply Card]
jmpseat member
Helpful reply text.
Report

[States]
Posting reply...
Reply posted.
Choose a reply before submitting.
jmpseat could not post that reply right now.
```

Rules:

- Support simple top-level comments only.
- Include a report affordance on comments.
- Keep loading and error states generic and safe.

## Report Flow Wireframe

Report flow applies to threads and replies/comments.

```text
[Report Sheet]
Report this thread

[Reason]
Spam
Harassment
Unsafe information
Privacy
Off topic
Other

[Optional Details]
Add context for the review team. Do not include private or sensitive details
unless necessary.

[Actions]
Cancel        Submit Report

[Confirmation]
Thanks. This was reported for review.
```

Rules:

- Reporter identity is hidden from public surfaces.
- Do not expose moderation internals.
- Do not show review queue details to normal users.
- Operator/admin review should remain server-gated.

## Saved / Empty States

Saved can appear in navigation and empty states as a future utility surface.

```text
[Saved]
No saved items yet.
Saved threads and Hub sections will appear here later.

[Empty Recent Useful Threads]
No useful DFW threads yet.
Useful threads will appear as verified workers contribute and moderators or
admins surface high-signal posts.
```

Rules:

- Do not claim saves are live if not implemented.
- Do not add saved-item behavior in the wireframe implementation handoff unless
  separately scoped.

## Admin / Community Moderation Touchpoints

At a high level:

- reports route to operator review
- operators hide/remove posts and comments through existing scoped controls
- normal users do not see moderation internals
- normal users do not get admin access
- AI is not the final moderation decision-maker

Do not design destructive admin actions in detail in this mobile user packet.
Existing operator moderation surfaces remain separate.

## What Changes From The Current T21 Shell

Future implementation should:

- reduce placeholder-heavy stacked cards
- make Home feel like the polished mobile dashboard mockup
- make Channels browse-first at the overview level
- make Start a Thread primary only inside a selected Channel
- make Request a Channel secondary on the Channels overview
- separate Hub overview from Channels thread experience
- make Recent Useful Threads high-signal, not a raw feed
- remove legacy product-facing labels from primary UI
- improve mobile hierarchy, spacing, and CTA clarity

## Implementation Handoff

Future implementation should:

- preserve T12-T20 safety primitives
- use existing board/post/comment/report/moderation primitives
- later map Channels to child `public.boards` rows per T22
- follow the visual mockup review revisions before creating a static prototype
- not create a standalone `channels` table yet
- not rename DB tables/RPCs
- not add free channel creation
- not add media upload, reactions, saves, search, or live weather/traffic
  unless separately scoped
- keep public-domain and admin access fixes intact
- keep protected surfaces server-gated

## Acceptance Criteria For Future Implementation

Future app implementation should pass these acceptance criteria:

- Home dashboard uses Hub-first language.
- DFW Hub has a clear section hierarchy.
- Channels overview prioritizes channel selection.
- Request a Channel is secondary.
- Start a Thread appears inside specific Channel pages.
- Channel detail has a thread list and composer entry.
- Thread detail supports replies/comments and reporting.
- Safety copy appears in composer and report flows.
- Existing access, domain, admin, community, report, and moderation tests still
  pass.
- No migration is added unless the implementation ticket explicitly scopes it.

## Out Of Scope

This wireframe packet does not add:

- app implementation
- migrations
- runtime data
- DB/RPC changes
- table/RPC renames
- free channel creation
- media uploads
- reactions
- saves
- search
- live weather/traffic
- public sharing
- normal user admin access
- AI final moderation
- proof-upload scope
