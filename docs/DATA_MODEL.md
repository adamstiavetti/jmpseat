# Data Model

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

This is a first-pass implementation-ready model. It is intentionally moderate in complexity and should be refined during technical design.

## Scale-Readiness Requirement

Future schema work must follow `SCALABILITY_AND_ARCHITECTURE_REQUIREMENTS.md`.

That means future tables and schema revisions should account for:

- indexing on high-growth tables
- pagination on user/community/admin-facing lists
- ownership and access-control fields
- moderation/report/review state where relevant
- soft-delete or status-based removal where audit history matters
- separation between auth identity, profile data, beta access, verification state, and admin/moderation state

## User

Auth-level account.

Important fields:

- id
- email
- email_verified_at
- auth_provider_id
- account_status
- is_admin
- created_at
- updated_at
- last_login_at
- deleted_at

Relationships:

- Has one Profile.
- Has many Verifications.
- Has many Posts, Comments, SavedItems, Reports, ModerationActions, and AIBriefs.
- Has one current TrustLevel.

## Profile

Aviation identity and public display settings.

Current 05B note:

- `claimed_airline`, `claimed_role`, and `claimed_base` remain self-declared
  onboarding/profile fields only.
- Future Home Base state should be treated as required personalization
  preference for the MVP path, not authorization truth.
- Home Base should not verify employment, airline, role, base assignment, or
  restricted-board eligibility.
- Self-declared airline text may be editable in profile, but future
  airline-specific boards or lounges must rely on verified airline or
  approved-domain logic rather than self-declared airline text.

Important fields:

- id
- user_id
- public_handle
- display_name
- anonymous_handle_seed
- airline_id
- role_id
- base_id
- employment_status
- bio
- is_profile_public
- created_at
- updated_at

Relationships:

- Belongs to User, Airline, Role, and Base.
- Later may have a Home Base preference and board follows used for
  personalization, not authorization.

## Verification

Aviation affiliation review.

Important fields:

- id
- user_id
- tier_requested
- tier_granted
- status
- method
- work_email_domain
- submitted_evidence_path
- evidence_redaction_confirmed
- evidence_expires_at
- reviewer_user_id
- reviewed_at
- rejection_reason
- created_at
- updated_at
- deleted_at

Relationships:

- Belongs to User.
- Reviewed by admin User.
- May create ModerationAction or audit entries.

## Airline

Airline or aviation employer.

Important fields:

- id
- name
- code
- country
- work_email_domains
- is_active
- created_at
- updated_at

Relationships:

- Has many Profiles and Bases.
- Can have CrewRooms.

## Role

Worker role.

Important fields:

- id
- name
- slug
- category
- is_active
- created_at
- updated_at

Examples:

- Flight attendant
- Pilot
- Gate agent
- Ramp agent
- Dispatcher
- Crew scheduler
- Airport operations
- Regional worker
- New hire
- Commuter

## Base

Current T05 implementation note:

- `bases` is implemented as the First-Base MVP base/airport community anchor
  table.
- The T05 runtime apply pass is recorded in
  `docs/ops/fbmvp-t05-base-board-runtime-pass.md`.
- DFW is seeded as the first launch and only live base in the initial rollout,
  but the table is designed for many bases from the start.
- Self-declared profile base text remains separate and must not become
  authorization truth.

Airline base or domicile.

Important fields:

- id
- code
- name
- airport_name
- city
- state
- country
- timezone
- status
- launch_priority
- created_at
- updated_at

Relationships:

- Can anchor many Boards.
- Can be referenced later by profile preferences or follow/home-base state.
- Does not prove a user's role, airline, or restricted-board membership.

## BoardType

Current T05 implementation note:

- `board_types` is implemented as controlled board taxonomy.
- The T05 runtime apply pass records seeded runtime board types for
  `base_board`, `layover_board`, and `verified_lounge`.
- Seeded types are `base_board`, `layover_board`, and `verified_lounge`.
- Verified Lounges are modeled as a board type.
- Board wiki/intel is not a board type; it should be structured content
  attached to boards in a later ticket.

Important fields:

- id
- key
- label
- description
- default_visibility
- default_posting_mode
- display_order
- is_active
- created_at
- updated_at

Relationships:

- Has many Boards.

## Board

Current T05 implementation note:

- `boards` is implemented as the user-facing board-space table.
- DFW Base Board is seeded as the first available board.
- The T05 runtime apply pass confirms the seeded `DFW Base Board` row exists as
  active metadata in the intended Supabase runtime.
- The table is designed for many base boards, layover boards, and restricted
  lounge boards over time.
- The canonical Base Board product definition is in
  `strategy/base-board-product-definition.md`: a Base Board is a hub/container
  for structured base intel, posts, useful/trending knowledge, related Layover
  Boards, and restricted Verified Lounges.
- Posting, comments, follows, memberships, access requests, saves, reactions,
  search, reports, and moderation remain later tickets.
- `strategy/home-base-board-follow-decision.md` defines the T06 product
  boundary: setting Home Base should auto-follow the corresponding main Base
  Board, users may follow many boards, and follows must not grant restricted
  access.

Important fields:

- id
- board_type_id
- base_id
- parent_board_id
- slug
- name
- short_name
- description
- visibility
- posting_mode
- discoverability
- status
- sort_order
- created_at
- updated_at

Relationships:

- Belongs to BoardType.
- May belong to Base.
- May have a parent Board.
- Later has follows, memberships, posts, comments, saves, reactions, reports,
  moderation actions, and search indexing.
- Later has board intel/wiki structured content attached to the board. Board
  intel/wiki is not a board type.

## HomeBasePreference

Planned 05B/T06 concept.

Home Base is the user's primary base preference for personalization and MVP
profile completion. It should not be treated as proof of employment, airline,
role, base assignment, or restricted-board eligibility.

Expected behavior:

- A user has one current Home Base preference.
- In the initial DFW-only rollout, onboarding should use a DFW-start
  confirmation step rather than a fake one-option Home Base picker.
- In that first rollout, confirming or starting with DFW should set Home Base
  to DFW and ensure the DFW Base Board is followed.
- Setting Home Base should ensure the base's main Base Board is followed.
- Future multi-base rollout should allow selection from active bases and later
  Home Base switching.
- Changing Home Base should keep the old board follow by default unless the
  user manually unfollows it.
- Home Base must not grant Verified Lounge or restricted-board access.

## BoardFollow

Planned 05B/T06 concept.

A board follow is a personalization signal, not an access grant.

Users may follow Base Boards, Layover Boards, and Verified Lounges where access
or membership permits. Following a restricted board must not bypass membership,
visibility, posting, moderation, or launch gates.

## Airport

Airport record.

Important fields:

- id
- iata_code
- icao_code
- name
- city
- state_region
- country
- timezone
- latitude
- longitude
- created_at
- updated_at

Relationships:

- Has many Bases and LayoverBoards.

## CrewRoom

Legacy / broader V1 note:

- The current 05B direction models Base Boards, Layover Boards, and Verified
  Lounges through `boards` plus `board_types`.
- Generic global Crew Rooms remain broader/later-lane planning, not the T05
  schema foundation.

Airline/base/role/topic community.

Important fields:

- id
- name
- slug
- room_type
- airline_id
- role_id
- base_id
- airport_id
- description
- visibility
- posting_permission
- anonymous_posting_allowed
- rules
- safety_level
- created_by_user_id
- created_at
- updated_at

Relationships:

- Can belong to Airline, Role, Base, or Airport.
- Has many Posts.
- Created by User.

## Post

Room or board content.

Important fields:

- id
- crew_room_id
- author_user_id
- title
- body
- post_type
- tags
- is_anonymous
- status
- risk_flags
- search_vector
- created_at
- updated_at
- deleted_at

Relationships:

- Belongs to CrewRoom and author User.
- Has many Comments, SavedItems, Reports, and ModerationActions.

## Comment

Reply on a post.

Important fields:

- id
- post_id
- author_user_id
- parent_comment_id
- body
- is_anonymous
- status
- risk_flags
- created_at
- updated_at
- deleted_at

Relationships:

- Belongs to Post and author User.
- Can belong to parent Comment.
- Has many Reports and ModerationActions.

## SavedItem

User-saved content.

Important fields:

- id
- user_id
- item_type
- item_id
- note
- created_at

Relationships:

- Belongs to User.
- References Post, Comment, Deal, LayoverBoard, or AIBrief by item_type and item_id.

## LayoverBoard

City or airport crew intel.

Important fields:

- id
- airport_id
- city
- state_region
- country
- slug
- description
- safety_notes
- visibility
- hotel_detail_policy
- created_at
- updated_at

Relationships:

- Belongs to Airport.
- Can have associated CrewRoom or Posts.
- Has many AIBriefs.

## Deal

Crew-friendly perk or discount.

Important fields:

- id
- vendor_id
- title
- description
- category
- terms
- location_city
- airport_id
- discount_type
- discount_value
- verification_status
- sponsored
- affiliate
- starts_at
- ends_at
- created_at
- updated_at

Relationships:

- Belongs to Vendor.
- Can belong to Airport.
- Has many SavedItems and Reports.

## Vendor

Business or partner.

Important fields:

- id
- name
- category
- website_url
- contact_email
- phone
- verification_status
- sponsorship_status
- notes
- created_at
- updated_at

Relationships:

- Has many Deals.

## Report

User safety or quality report.

Important fields:

- id
- reporter_user_id
- target_type
- target_id
- category
- severity
- description
- status
- emergency_escalation
- assigned_admin_user_id
- resolved_at
- created_at
- updated_at

Relationships:

- Belongs to reporter User.
- Assigned to admin User.
- Can result in ModerationAction.

## ModerationAction

Admin enforcement action.

Important fields:

- id
- admin_user_id
- target_user_id
- target_type
- target_id
- report_id
- action_type
- strike_count_delta
- reason
- internal_notes
- appeal_status
- created_at

Relationships:

- Belongs to admin User.
- May target User, Post, Comment, Deal, or Report.

## AIBrief

Generated Jumpseat Brief or future AI output.

Important fields:

- id
- user_id
- brief_type
- layover_board_id
- airport_id
- prompt
- structured_output
- source_scope
- safety_flags
- model_name
- created_at
- deleted_at

Relationships:

- Belongs to User.
- Belongs to LayoverBoard or Airport.
- Can be saved through SavedItem.

## TrustLevel

Current trust/access state.

Important fields:

- id
- user_id
- level
- verification_tier
- strike_count
- reason
- assigned_by_user_id
- assigned_at
- expires_at
- created_at

Relationships:

- Belongs to User.
- Assigned by admin User where applicable.

## SecurityEvent

Security-relevant audit event. This should be append-only for sensitive workflows.

Important fields:

- id
- actor_user_id
- target_user_id
- event_type
- severity
- request_id
- ip_hash
- user_agent_hash
- metadata
- created_at

Examples:

- login_failed
- authorization_denied
- verification_artifact_accessed
- verification_decision_changed
- moderation_action_created
- report_emergency_escalated
- upload_rejected
- ai_safety_refusal

Relationships:

- Can belong to actor User.
- Can target User.

## UploadArtifact

Private uploaded artifact metadata for verification evidence and future controlled uploads.

Important fields:

- id
- owner_user_id
- artifact_type
- storage_path
- original_filename_hash
- content_type
- size_bytes
- validation_status
- malware_scan_status
- retention_expires_at
- deleted_at
- created_at

Relationships:

- Belongs to User.
- May be referenced by Verification.

## Subscription

Deferred paid-account or premium-access entity.

V1 status:

- Do not model Subscription in V1 unless payments or premium features are explicitly approved.
- Do not add payment, billing, Stripe customer, or subscription lifecycle fields until Stripe/payments enter scope.
- If premium subscriptions are approved later, model Subscription separately from core verification, trust, and posting access so paid status cannot override safety or verification rules.

## AuditLog

Product/audit abstraction rather than a required standalone V1 table.

V1 strategy:

- Audit requirements should be backed by SecurityEvent, ModerationAction, verification decision history, admin action history, and relevant timestamp/reviewer fields.
- Do not duplicate sensitive logs into a separate AuditLog table unless there is a clear query, retention, compliance, or operational purpose.
- If a distinct AuditLog is added later, it must align with SecurityEvent and ModerationAction semantics and avoid copying raw verification artifacts, private notes, or sensitive content unnecessarily.

## Relationship Summary

- User owns Profile, Verification records, content, saved items, reports, moderation actions, AI briefs, and trust level.
- Profile connects User to Airline, Role, and Base.
- Base connects Airline and Airport.
- CrewRoom can represent airline, role, base, airport, or topic communities.
- Posts belong to CrewRooms; Comments belong to Posts.
- LayoverBoard belongs to Airport and powers layover-specific content and AI briefs.
- Deals belong to Vendors and may be airport-specific.
- Reports and ModerationActions enforce accountability across content and accounts.
- SecurityEvent records sensitive audit trails.
- UploadArtifact separates private file metadata from public profile and content records.
- Subscription is deferred until payments or premium features are explicitly in scope.
- AuditLog is covered by SecurityEvent, ModerationAction, verification decision history, and admin action history unless a later design needs a distinct table.

## Model Boundaries for V1

Do not model airline portal credentials, scraped schedules, live crew locations, flight-load request infrastructure, payments, subscriptions, native mobile device records, or roster/calendar integrations in V1.

## Data Modeling Best Practices

- Prefer explicit enums or constrained values for account_status, verification status, room type, visibility, moderation action type, and report category.
- Use database constraints for critical invariants.
- Keep public profile data separate from private verification data.
- Store only metadata needed for uploaded artifacts; do not store original filenames in clear text if they may contain personal information.
- Make sensitive audit logs append-only in application behavior.
- Design retention fields before launch rather than adding deletion as an afterthought.
