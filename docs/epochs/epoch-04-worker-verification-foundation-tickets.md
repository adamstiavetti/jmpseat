# Epoch 04: Worker Verification Foundation Ticket Pack

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Executive Summary

Epoch 04 is the **Worker Verification Foundation** epoch.

Its purpose is to build the first real verification foundation for confirming that users are airline workers while preserving privacy, minimizing sensitive data collection, and avoiding legally risky verification methods.

Epoch 04 must keep verification separate from:

- public waitlist capture
- Supabase auth identity
- profile completion
- beta access
- future moderation/admin role systems

Epoch 04 should be implemented in bounded slices. It must not drift into community features, payments, full moderation operations, mobile scaffolding, or generalized admin-product work.

## 2. Relationship To Epoch 03

Epoch 03 established:

- auth foundation
- account/profile foundation
- beta-access foundation
- private-app access gates
- authorization/security-event baseline

Epoch 04 builds on that base by adding worker-verification state, evidence handling rules, human review design, and claims-based authorization preparation.

Epoch 04 must preserve all existing Epoch 03 boundaries:

- auth is not verification
- profile completion is not verification
- beta approval is not verification
- self-declared airline, role, and base fields are not verified claims

## 3. Purpose Of Epoch 04

Epoch 04 is intended to:

- define and implement the worker-verification claim model
- define and implement verification request/evidence metadata foundations
- support the initial approved verification methods
- prepare `/app/verification` as the user-facing verification submission/status surface
- define or implement a bounded human-review foundation
- prepare claims-based authorization for later rooms/boards
- preserve privacy, auditability, and retention/deletion controls

Initial approved verification methods remain:

1. airline work-email verification where available
2. redacted badge/proof upload with human review

Additional hard rules:

- AI may assist later only as advisory pre-check, not final approval
- employer-system lookup is prohibited unless jmpseat has explicit written employer authorization
- future room/private access must rely on approved claims, not self-declared profile fields

## 4. What Epoch 04 Is

Epoch 04 is in scope for:

- verification architecture and claim-state decisions
- verification data-model foundations
- verification request lifecycle
- evidence metadata/storage-policy design
- bounded verification submission UI/surfaces
- bounded reviewer queue/review tooling planning or minimal implementation
- verification-related audit/security-event extension
- retention/deletion/privacy rules
- validation and handoff review for the verification foundation

## 5. What Epoch 04 Is Not

Epoch 04 must not implement:

- community boards/posts/rooms
- full moderation dashboard
- payments
- mobile app scaffold
- AI final approval
- employer-system lookup
- scraping private airline systems or private groups
- employee database lookup
- storing unredacted badge data longer than needed
- broad admin platform work beyond bounded verification review needs

## 6. Core Verification Rules

Every Epoch 04 ticket must preserve these rules:

- work-email verification is separate from login email when needed
- raw proof is sensitive, private, and short-lived
- reviewer actions must be auditable
- reviewers cannot approve themselves
- verification results produce claims, not social trust theater
- no route or UI should imply beta approval or worker verification are the same thing
- no route or UI should imply employer endorsement

## 7. Mobile-Readiness Rule

Epoch 04 tickets must classify work as:

- `web-only`
- `mobile-ready`
- `shared-core`

Verification data, status, evidence metadata, claims, retention policy, and authorization rules should be `mobile-ready` or `shared-core` unless a task is strictly web-delivery UI.

## 8. Ordered Ticket List

1. `E04-T01` - Lock Verification Claim And Lifecycle Decision
2. `E04-T02` - Implement Verification Data Model Foundation
3. `E04-T03` - Define Airline Work-Email Verification Foundation
4. `E04-T04` - Define Redacted Proof Storage And Retention Design
5. `E04-T05` - Implement Verification Submission Surface Foundation
6. `E04-T06` - Implement Verification Request And Evidence Metadata Flows
7. `E04-T07` - Implement Human Review Queue Foundation
8. `E04-T08` - Extend Security Events And Audit Rules For Verification
9. `E04-T09` - Define Claims-Based Authorization Preparation
10. `E04-T10` - Run Epoch 04 Validation And Handoff Review

## 9. Detailed Tickets

### E04-T01

**Title**  
Lock Verification Claim And Lifecycle Decision

**Status**
Complete for planning. See [Epoch 04 Verification Claim Lifecycle Decision](epoch-04-verification-claim-lifecycle-decision.md).

**Objective**  
Define the verification claim model and lifecycle before implementation begins.

**Scope**

- verification claim types
- verification request statuses
- evidence method types
- reviewer-role boundaries
- expiration/reverification model
- route/state expectations for `/app/verification`

**Out Of Scope**

- upload implementation
- storage bucket implementation
- reviewer dashboard implementation
- community authorization implementation

**Implementation Notes**

- Define broad claims and scoped claims separately:
  - `airline_worker`
  - `airline:<carrier>`
  - `role:<role>`
  - `base:<base>`
- Define request states such as:
  - `not_started`
  - `draft`
  - `submitted`
  - `email_pending`
  - `under_review`
  - `approved`
  - `rejected`
  - `expired`
  - `recheck_required`
- Define evidence types such as:
  - `work_email`
  - `redacted_badge`
  - `redacted_document`

**Data/Security Notes**

- Keep verification state separate from auth, profile, and beta access
- Define what metadata may exist without storing raw proof
- Prohibit employer-system lookup explicitly in the decision artifact

**Mobile-Readiness Classification**  
`shared-core`

**Scalability Considerations**

- status fields must support reviewer queue filters
- claim records must support future indexing by user, claim type, status, and expiration

**Docs Impact**

- create the controlling Epoch 04 verification decision artifact
- cross-link `VERIFICATION_METHOD_DECISION.md`

**Validation Expectations**

- confirm the claim model is specific enough to drive schema and UI work
- confirm no state collapses auth/profile/beta/verification into one model

**Completion Criteria**

- claim types are explicit
- lifecycle states are explicit
- evidence methods are explicit
- reviewer-role and expiration rules are explicit

### E04-T02

**Title**  
Implement Verification Data Model Foundation

**Status**
Complete for implementation. See [Epoch 04 Verification Data Model Implementation](epoch-04-verification-data-model-implementation.md).

**Objective**  
Create the database foundation for verification requests, claims, and evidence metadata.

**Scope**

- migrations for verification requests
- migrations for issued claims
- migrations for evidence metadata only
- indexes, status fields, timestamps, reviewer references
- RLS and ownership rules

**Out Of Scope**

- raw file upload implementation
- storage bucket setup
- reviewer dashboard
- room authorization rollout

**Implementation Notes**

- likely entities:
  - `verification_requests`
  - `verification_claims`
  - `verification_evidence_metadata`
- include expiration/reverification planning fields
- include request/audit references needed for human review

**Data/Security Notes**

- raw proof should not live in table rows
- evidence metadata must not store badge numbers, employee IDs, or raw extracted sensitive text
- RLS must prevent users from reading other users’ verification records
- no user self-approval or self-claim issuance paths

**Mobile-Readiness Classification**  
`shared-core`

**Scalability Considerations**

- index by `user_id`, `status`, `claim_type`, `created_at`, and expiration/recheck fields
- design reviewer queues for pagination/filtering from the start

**Docs Impact**

- implementation note for schema and RLS posture

**Validation Expectations**

- migration review
- schema tests or migration-content tests
- RLS/access-path review

**Completion Criteria**

- verification schema exists
- RLS posture is explicit
- indexes/constraints support reviewer queues and claim lookup
- no upload/storage implementation is added prematurely

### E04-T03

**Title**  
Define Airline Work-Email Verification Foundation

**Status**
Complete for implementation. See [Epoch 04 Work Email Verification Foundation Implementation](epoch-04-work-email-verification-foundation-implementation.md).

**Objective**  
Define the approved-domain model and work-email verification flow boundary.

**Scope**

- approved airline/employer domain model
- work-email verification flow design
- separation from login email
- privacy/copy expectations
- decision whether implementation lands in Epoch 04 or a later bounded slice

**Out Of Scope**

- custom SMTP
- auth email template branding
- room authorization
- badge/proof upload

**Implementation Notes**

- define whether approved domains are hard-coded seed data, reference tables, or admin-managed records
- define whether domain verification issues broad `airline_worker` plus airline-scoped claims
- define how a user can verify work email while still logging in with personal email

**Data/Security Notes**

- work email must never be publicly exposed
- avoid logging raw full work email when domain-only metadata is sufficient
- verification email flow must not imply employer endorsement

**Mobile-Readiness Classification**  
`mobile-ready`

**Scalability Considerations**

- approved-domain model should support many airlines/employers without hard-coded rewrites
- verification lookups should be indexable by domain and status

**Docs Impact**

- implementation note or decision addendum for approved-domain handling

**Validation Expectations**

- verify work-email flow remains separate from auth identity
- verify domain model does not create web-only assumptions

**Completion Criteria**

- approved-domain model is explicit
- work-email flow boundary is explicit
- separation from login email is preserved
- decision is made on whether actual flow implementation belongs in Epoch 04 or a follow-up slice

### E04-T04

**Title**  
Define Redacted Proof Storage And Retention Design

**Status**
Complete for design. See [Epoch 04 Redacted Proof Storage Retention Design](epoch-04-redacted-proof-storage-retention-design.md).

**Objective**  
Define storage, retention, deletion, and reviewer-access rules before any upload implementation begins.

**Scope**

- private bucket/storage strategy
- allowed file types
- file-size limits
- filename/randomization rules
- access policy and signed-link rules
- retention/deletion window
- redaction acknowledgement requirements

**Out Of Scope**

- upload UI
- upload API implementation
- malware scanning implementation unless separately approved
- AI review

**Implementation Notes**

- define a short-lived raw-proof retention model
- define what minimal metadata remains after review
- define explicit user guidance for redactions:
  - employee IDs
  - barcode/QR codes
  - badge backside
  - security markings
  - unnecessary personal details

**Data/Security Notes**

- no public bucket paths
- no raw proof in logs
- no employee IDs or badge numbers retained unless a reviewed policy explicitly allows it later
- reviewer access must be least-privilege and auditable

**Mobile-Readiness Classification**  
`shared-core`

**Scalability Considerations**

- storage rules must scale to many submissions without manual path conventions
- retention/deletion should be enforceable through lifecycle jobs later

**Docs Impact**

- storage-policy runbook or implementation note

**Validation Expectations**

- review against trust/safety and privacy requirements
- verify retention window and deletion triggers are explicit

**Completion Criteria**

- storage policy is explicit
- retention/deletion policy is explicit
- reviewer-access policy is explicit
- upload implementation remains blocked until these rules are approved

### E04-T05

**Title**  
Implement Verification Submission Surface Foundation

**Status**
Complete for implementation. See [Epoch 04 Verification Submission Surface Implementation](epoch-04-verification-submission-surface-implementation.md).

**Objective**  
Build the first bounded `/app/verification` submission and status surface.

**Scope**

- `/app/verification` route foundation
- verification method selection
- claimed airline/role/base confirmation for verification context
- status messaging
- copy explaining verification boundaries

**Out Of Scope**

- granting access automatically
- room access
- beta approval changes
- AI-assisted review

**Implementation Notes**

- the route should support:
  - method selection
  - status display
  - submission guidance
  - privacy/redaction instructions
- keep it clearly separate from `/app/profile`
- keep it clearly separate from `/app/access-hold`

**Data/Security Notes**

- do not expose reviewer-only metadata
- do not expose sensitive storage paths
- do not imply verified status before approval

**Mobile-Readiness Classification**  
`mobile-ready`

**Scalability Considerations**

- surface should be driven by request/claim state, not hard-coded route branching
- status handling should support future reverification and resubmission

**Docs Impact**

- implementation note for route behavior and state model

**Validation Expectations**

- route smoke tests
- boundary-copy tests
- ensure verification surface does not replace beta access or auth

**Completion Criteria**

- `/app/verification` exists as a real bounded surface
- user can understand current verification state and next steps
- no access claims are granted automatically

### E04-T06

**Title**  
Implement Verification Request And Evidence Metadata Flows

**Status**
Complete for implementation. See [Epoch 04 Verification Request Evidence Flows Implementation](epoch-04-verification-request-evidence-flows-implementation.md).

**Objective**  
Implement server-side creation/update flows for verification requests and evidence metadata.

**Scope**

- create/update verification request
- link chosen evidence method
- store minimal evidence metadata
- request status transitions such as draft to submitted

**Out Of Scope**

- raw proof storage implementation unless explicitly approved by prior ticket
- reviewer approval UI
- claim-based room authorization

**Implementation Notes**

- keep request creation/upserts server-side
- status transitions should be validated centrally
- request flows should support either work-email path or redacted-proof path

**Data/Security Notes**

- metadata must be minimal and privacy-safe
- do not store raw proof in DB rows
- do not log sensitive evidence text

**Mobile-Readiness Classification**  
`shared-core`

**Scalability Considerations**

- request transitions should be queryable and auditable
- avoid write patterns that would require rewriting for future mobile/API use

**Docs Impact**

- implementation note for request lifecycle and evidence metadata semantics

**Validation Expectations**

- server-helper tests
- status-transition tests
- negative tests for invalid state moves

**Completion Criteria**

- request lifecycle exists server-side
- evidence metadata is stored minimally
- no raw-proof leakage appears in code paths or logs

### E04-T07

**Title**  
Implement Human Review Queue Foundation

**Status**
Complete for implementation. See [Epoch 04 Human Review Queue Foundation Implementation](epoch-04-human-review-queue-foundation-implementation.md).

**Objective**  
Create a bounded reviewer foundation for approving or rejecting verification requests.

**Scope**

- minimal reviewer queue foundation
- bounded reviewer decision actions
- reviewer audit trail
- self-approval prevention

**Out Of Scope**

- full admin dashboard
- moderation system expansion
- reviewer analytics platform

**Implementation Notes**

- if UI is implemented, keep it narrow and internal-only
- if UI is too broad for this epoch slice, implement the model plus minimal operator path first
- reviewer roles should be explicit, not inferred from beta status

**Data/Security Notes**

- reviewers cannot approve themselves
- reviewer actions must be auditable
- reviewers must not use employer systems
- reviewer access to raw proof must be minimum necessary only

**Mobile-Readiness Classification**  
`web-only` UI, `shared-core` decision model

**Scalability Considerations**

- queue must support pagination and filters
- reviewer decisions should store consistent status/reason fields for later reporting

**Docs Impact**

- implementation note for reviewer flow and role boundaries

**Validation Expectations**

- reviewer authorization tests
- self-approval prevention tests
- queue pagination/filtering expectations documented

**Completion Criteria**

- bounded reviewer flow exists or is explicitly staged with minimal safe operator path
- self-approval is blocked
- reviewer actions are recorded

### E04-T08

**Title**  
Extend Security Events And Audit Rules For Verification

**Status**
Complete for implementation. See [Epoch 04 Verification Security Events Implementation](epoch-04-verification-security-events-implementation.md).

**Objective**  
Extend the existing security/audit baseline for verification submission and review lifecycle events.

**Scope**

- verification submission events
- reviewer decision events
- storage-access or proof-access events where appropriate
- metadata sanitization rules for verification lifecycle

**Out Of Scope**

- analytics instrumentation
- raw proof logging
- generalized observability platform work

**Implementation Notes**

- extend the existing `security_events` model only where necessary
- keep taxonomy bounded and operationally useful

**Data/Security Notes**

- do not log raw proof
- do not log employee IDs
- do not log badge numbers
- do not log sensitive airline/security information

**Mobile-Readiness Classification**  
`shared-core`

**Scalability Considerations**

- event taxonomy should support audit lookups by user, request, event type, and time
- avoid noisy event spam

**Docs Impact**

- implementation note for event taxonomy and metadata rules

**Validation Expectations**

- metadata-sanitization tests
- event-recorder fail-soft tests
- audit coverage review

**Completion Criteria**

- verification event taxonomy exists
- metadata rules are explicit and tested
- logging cannot weaken authorization or expose sensitive proof data

### E04-T09

**Title**  
Define Claims-Based Authorization Preparation

**Objective**  
Define how future rooms/boards will rely on approved verification claims rather than self-declared profile fields.

**Scope**

- claim-to-access mapping model
- airline/role/base access semantics
- future reusable server-side authorization helper direction

**Out Of Scope**

- room implementation
- board implementation
- posting/commenting
- moderation expansion

**Implementation Notes**

- identify which claims gate which future surfaces
- define how broad worker verification differs from airline-specific or role/base-specific verification
- keep authorization reusable across web and future mobile

**Data/Security Notes**

- self-declared profile fields must remain non-authoritative
- claims should be auditable and revocable

**Mobile-Readiness Classification**  
`shared-core`

**Scalability Considerations**

- authorization lookups must be indexable and avoid per-route ad hoc logic
- design for later pagination/filtering of claim review and claim history

**Docs Impact**

- claims-authorization decision or implementation note

**Validation Expectations**

- confirm claims model does not depend on web-only route behavior
- confirm future room access can be enforced server-side/database-side

**Completion Criteria**

- claims-to-access mapping direction is explicit
- self-declared profile fields are explicitly excluded from authorization decisions

### E04-T10

**Title**  
Run Epoch 04 Validation And Handoff Review

**Objective**  
Validate the worker-verification foundation and record the handoff for the next epoch.

**Scope**

- full verification-focused validation pass
- docs review
- route/status smoke checks
- audit/privacy review

**Out Of Scope**

- new product features
- community rollout
- mobile app work

**Implementation Notes**

- confirm no employer-system lookup
- confirm no AI final approval
- confirm proof access is bounded and auditable
- confirm claims remain separate from auth/profile/beta state

**Data/Security Notes**

- verify retention/deletion rules are actually reflected in implementation
- confirm raw proof is not exposed through logs, URLs, or user-readable states

**Mobile-Readiness Classification**  
`shared-core`

**Scalability Considerations**

- validate indexes, queue pagination expectations, and claim lookup assumptions

**Docs Impact**

- create an Epoch 04 exit review/handoff artifact

**Validation Expectations**

- tests pass
- route smoke checks pass
- storage/privacy review passes
- security-event review passes

**Completion Criteria**

- Epoch 04 review document exists
- known limitations are explicit
- next safe implementation step is clear

## 10. Important Ops/Brand Follow-Up

This epoch should preserve, but not silently absorb, the following later operational follow-up:

- customize Supabase auth email templates for jmpseat branding
- configure custom SMTP/domain sender so confirmation and reset emails do not look third-party

These are important trust/brand tasks, but they are not automatically part of worker-verification implementation unless a later scoped ticket explicitly pulls them in as an ops/brand follow-up.

## 11. Suggested Implementation Order

Recommended bounded sequence:

1. `E04-T01`
2. `E04-T02`
3. `E04-T03`
4. `E04-T04`
5. `E04-T05`
6. `E04-T06`
7. `E04-T07`
8. `E04-T08`
9. `E04-T09`
10. `E04-T10`

## 12. Exit Criteria

Epoch 04 is complete when:

- verification claim model is explicit and implemented
- verification data model exists
- work-email and redacted-proof paths are clearly defined
- `/app/verification` exists as a bounded verification surface
- human review foundation exists
- claims-based authorization direction is explicit
- security/audit coverage exists for verification lifecycle events
- retention/deletion/privacy controls are documented and implemented for the approved slice
- no employer-system lookup is introduced
- no AI final approval exists
