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

Airline base or domicile.

Important fields:

- id
- airline_id
- airport_id
- name
- code
- city
- state_region
- country
- is_active
- created_at
- updated_at

Relationships:

- Belongs to Airline and Airport.
- Has many Profiles.
- Can have Base Board CrewRooms.

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
