# Base Board Product Definition

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Canonical Definition

A Base Board is the main verified hub for an aviation base. It combines
structured base intel, searchable community posts, useful/trending knowledge,
related Layover Boards, and restricted Verified Lounges.

Users can follow a Base Board, set it as their home base, post and comment in
it when allowed, save useful content, and use it as the starting point for
base-specific aviation knowledge.

DFW is the first seeded base and DFW Base Board is the first active base board.
DFW is the first live Base Board in the rollout, not proof that a user works at
DFW. DFW is not the whole jmpseat product concept. The product model supports
many bases and many boards over time.

## 2. What A Base Board Is

A Base Board is a hub/container for base-specific utility and community
knowledge.

It should eventually gather:

- structured base overview and quick intel
- user-generated posts and threads
- comments and replies under posts
- useful, saved, trending, or curated content
- related Layover Boards
- restricted Verified Lounges under or associated with the base
- access-aware search across content the user is allowed to see

A Base Board should feel like the starting point for "what do airline people
need to know about this base?" rather than a generic social feed.

## 3. What A Base Board Is Not

A Base Board is not one thread.

A Base Board is not a generic social feed.

A Base Board is not only a static wiki.

A Base Board is not proof that a user works at that base, airline, or role.
Self-declared base/profile fields must not become authorization truth.

## 4. Content Anatomy

Recommended Base Board anatomy:

- Header / identity: base name, airport, follow/home-base controls, post
  action, and search action.
- Quick Intel / Base Overview: structured admin-maintained information.
- Ask/Post in this Base: user-generated posts and threads.
- Useful or Trending Intel: high-signal posts, saved/useful/curated content.
- Verified Lounges: restricted role/community spaces with approval.
- Related Layover Boards: discoverable and independently followable layover
  spaces.
- Search This Base: access-aware search across allowed content.

Posts are threads inside boards. Comments and replies live under posts.

Board intel/wiki is structured content attached to boards. It is not a board
type.

## 5. Related Board Types

Initial board types:

- `base_board`: the main verified hub for a base.
- `layover_board`: a city, airport, or layover utility space that can be
  related to bases and followed independently.
- `verified_lounge`: a restricted board-like space under or associated with a
  base.

Verified Lounges are restricted boards under or associated with a base. They
require scoped membership/access approval and should not be opened by airline
email alone.

Layover Boards are separate board-type spaces. They may be related to a base,
but they are independently discoverable and followable.

## 6. Search And Personalization Direction

Search inside a base should eventually search:

- board metadata
- posts
- comments/replies
- board intel/wiki entries
- useful/trending content
- restricted content only when the user has access

The personalized app experience should eventually use home base, followed
Base Boards, followed Layover Boards, saved/useful content, followed users, and
Verified Lounge memberships to shape what a user sees first.

For the initial DFW-only rollout, the app should use a DFW-start confirmation
step after work-email verification rather than a fake one-option Home Base
picker. Future multi-base rollout can introduce real active-base selection and
switching behavior.

## 7. AI-Assisted Intel Boundary

AI-assisted base intel updates are future work. If introduced, they must be:

- server-side
- admin-controlled
- reviewed before publishing
- blocked from auto-publishing sensitive, private, operationally risky, or
  unsafe content

AI must not make final verification, moderation, access, or ban decisions.

## 8. Safety And Launch Boundaries

Moderation, reporting, and admin controls are required before broad real
member-generated content exposure.

The Base Board product direction must continue to exclude:

- exact public crew hotel exposure
- passenger private information
- airport security procedures
- live operations-sensitive information
- airline portal login
- schedule scraping
- public live crew tracking
- proof uploads as a current product path

Board content should remain useful, practical, aviation-worker specific, and
safe enough for a controlled verified-worker community.

## 9. Data Model Implications

The current T05 model remains valid:

- `bases` represent aviation base/community anchors.
- `boards` represent user-facing spaces.
- `board_types` classify board behavior.
- `base_board`, `layover_board`, and `verified_lounge` are the initial board
  types.

Board intel/wiki should be modeled later as structured content attached to a
board, not as a board type.

Verified Lounges should remain modeled as a board type.

T05 creates the metadata foundation only. It does not implement posts,
comments, follows, home-base preferences, memberships, access requests, saves,
reactions, search, reports, moderation, or broad user-generated content
exposure.
