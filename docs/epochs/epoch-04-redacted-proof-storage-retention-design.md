# Epoch 04 Redacted Proof Storage Retention Design

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

`E04-T04` locks the storage, privacy, retention, and access design for redacted proof uploads before any badge/proof upload implementation begins.

The goal is to define how jmpseat will handle redacted proof safely while preventing unsafe collection or retention of:

- employee IDs
- badge numbers
- barcodes
- QR codes
- badge backsides
- security/access markings
- unnecessary personal details

This is a design-only artifact. It does not create a Supabase Storage bucket, upload UI, upload code, reviewer tooling, or deletion automation.

## 2. Scope

In scope:

- private storage design
- allowed evidence type design
- file constraints
- storage path convention
- metadata rules
- redaction acknowledgement
- reviewer access concept
- retention and deletion rules
- resubmission triggers
- security-event expectations
- future implementation gates

Out of scope:

- actual Supabase Storage bucket creation
- upload UI
- upload code
- reviewer UI
- AI
- automatic approval
- employer-system lookup
- community features
- mobile app implementation

## 3. Storage Bucket Strategy

Proposed future bucket:

- bucket name: `verification-proofs`
- private bucket only
- no public URLs
- no broad anonymous access
- no normal user read access after upload unless a later reviewed ticket explicitly allows a bounded self-view path
- access should happen through signed or controlled server-side retrieval later, not broad client-side listing

Important boundary:

- Do not create this bucket in `E04-T04`.
- Bucket creation belongs to a later implementation ticket after storage-policy tests and reviewer access controls are ready.

## 4. Storage Path Convention

Recommended path structure inside the future private bucket:

```text
{user_id}/{verification_request_id}/{evidence_id}.{ext}
```

Alternative equivalent notation if the bucket name is shown inline:

```text
verification-proofs/{user_id}/{verification_request_id}/{evidence_id}.{ext}
```

Required path rules:

- no user-provided filenames
- no email addresses in paths
- no airline names in paths
- no employee IDs in paths
- no badge numbers in paths
- use UUIDs and controlled extensions only

Rationale:

- paths should not leak identity, employer, or sensitive proof details
- deterministic path structure supports later deletion, audit, and reviewer retrieval

## 5. Allowed File Types And Size Limits

Proposed initial allowed file types:

- `image/jpeg`
- `image/png`
- `image/heic` only if the later implementation can process and preview it safely
- `application/pdf` only if a later implementation ticket explicitly keeps PDFs in scope after privacy and preview review

Recommended initial limits:

- max file size: `5 MB` or less
- max file count per request: `1-3`
- no video in V1

Implementation guardrail:

- later upload implementation must enforce file-type and file-size rules server-side, not only client-side

## 6. Redaction Requirements

Users must redact or avoid uploading:

- employee ID numbers
- badge numbers
- barcodes
- QR codes
- badge backsides
- access-control markings
- security-sensitive markings
- personal addresses
- unnecessary birthdate or government-ID details
- passenger/customer information
- schedule or trip screenshots
- crew hotel information

Required interpretation:

- unsafe or unredacted proof should trigger `needs_resubmission`, not approval
- jmpseat should provide clear pre-upload copy explaining what must be redacted
- users must affirm that they redacted sensitive details before submitting

## 7. Redaction Acknowledgement

Required acknowledgement behavior:

- user must check or confirm that sensitive details were redacted before upload
- later implementation should store `redaction_acknowledged = true`
- acknowledgement does not transfer all responsibility to the user
- reviewers still reject unsafe evidence

Draft acknowledgement copy:

> I confirm I have redacted employee IDs, badge numbers, barcodes, QR codes, badge backsides, security/access markings, and unnecessary personal details before uploading.

Copy principles:

- plain and direct
- no legal theater
- no claim that acknowledgement alone makes proof safe

## 8. Metadata Rules

Use the existing `verification_evidence` table as metadata-only storage.

Allowed metadata examples:

- `file_size_bytes`
- `mime_type`
- `original_extension`
- `upload_client: web`
- `redaction_acknowledged`
- `evidence_method: redacted_badge_or_proof`
- `detected_issue` with generic, non-sensitive values only when later needed

Forbidden metadata:

- employee ID
- badge number
- barcode content
- QR content
- raw OCR text
- full extracted proof text
- unredacted birthdate
- home address
- passenger/customer data
- trip/schedule data
- hotel information
- raw work email

Metadata rule:

- metadata should support storage operations, audit, and safe reviewer workflow without becoming a shadow archive of the proof itself

## 9. Retention And Deletion Policy

Proposed initial retention model:

- raw proof retained only while the verification request is pending review
- delete raw proof after approval, rejection, or resubmission window, preferably within `7-30 days`
- if `needs_resubmission`, unsafe proof should be deleted promptly or within a short bounded window
- metadata may remain for audit as long as it does not retain sensitive proof contents
- claims remain separately with their own expiration and reverification policy

Existing fields that should support this later:

- `delete_after`
- `deleted_at`
- `verification_evidence.status`
- `verification_requests.status`
- `verification_review_actions`

Required implementation principles:

- deletion automation may land later, but implementation must not rely on manual cleanup forever
- raw badge/proof storage should not become permanent by default
- approved claims should outlive raw proof when privacy allows metadata-only audit retention

## 10. Reviewer Access Model

Required reviewer-access design:

- reviewers only see proof needed for assigned or pending verification requests
- normal users cannot browse proof files
- users cannot view other users’ proof
- reviewers cannot approve themselves
- reviewer access must be audited
- reviewer access should eventually be scoped by trust level, and later possibly airline/base/role scope where appropriate
- no employer-system lookup is permitted

Proof access should use least privilege:

- do not give volunteer or broad moderation roles raw proof access by default
- verification proof access should be narrower than ordinary moderation access

## 11. Storage And RLS Policy Design

Expected future Supabase Storage policy direction:

- authenticated users can upload evidence only for their own pending verification request
- users cannot overwrite existing evidence after submission unless the resubmission flow explicitly permits a bounded replacement path
- users cannot list bucket contents broadly
- users cannot read other users’ files
- reviewer/admin read access must be limited and auditable
- any service-role or privileged retrieval path must remain server-only

Important boundary:

- exact Storage policies belong to a later implementation ticket
- do not create Storage policies in `E04-T04`

## 12. Resubmission Triggers

Proof should be rejected or marked `needs_resubmission` if:

- employee ID or badge number is visible
- barcode or QR code is visible
- badge backside is uploaded
- security or access markings are visible
- image is too blurry to review safely
- file type is unsupported
- claimed airline, role, or base cannot be reasonably supported by the proof provided
- proof contains passenger, customer, trip, schedule, or hotel information
- proof appears unrelated, unsafe, manipulated, or suspicious

## 13. Security-Event Implications

Future security-event types should include:

- `verification_evidence.upload_attempt`
- `verification_evidence.uploaded`
- `verification_evidence.rejected_redaction`
- `verification_evidence.deleted`
- `verification_request.needs_resubmission`

Security-event metadata must not include:

- sensitive proof contents
- raw OCR text
- employee IDs
- badge numbers
- barcode content
- QR content
- raw work email

## 14. Privacy And Legal Positioning

Required privacy and legal framing:

- jmpseat is independent and not endorsed by airlines unless a formal partnership exists
- users submit proof voluntarily for private membership verification
- jmpseat should collect the minimum necessary proof
- raw proof should be deleted promptly
- the product must not claim perfect verification accuracy
- the product must not encourage employer-system lookup
- privacy policy should disclose proof collection clearly before launch of live uploads

## 15. Implementation Gates For Later Tickets

Before any proof-upload implementation begins, require:

- private bucket created
- server-side file-type and file-size validation
- redaction acknowledgement copy
- metadata safety tests
- Storage policy tests or documented manual verification
- reviewer access plan
- retention/deletion job or a clearly bounded manual-then-automated plan
- privacy/terms updates before live user-upload rollout

## 16. Open Questions

- exact retention window
- whether PDFs are allowed in V1
- whether HEIC is supported directly or converted
- whether users can view their uploaded proof after submission
- whether resubmission replaces an existing evidence row or creates a new one
- whether reviewer access uses signed URLs or server-rendered retrieval
- whether deletion begins as a scheduled job, manual admin action, or both
- exact privacy-policy language for live proof collection

## 17. Impact On Later Epoch 04 Tickets

This design should guide:

- `E04-T05`
  - verification submission surface copy, acknowledgement UX, and file-constraint messaging
- `E04-T06`
  - request/evidence metadata flows and upload-path implementation
- `E04-T07`
  - reviewer retrieval and review-action boundaries
- `E04-T08`
  - verification-evidence security events and audit rules
- `E04-T10`
  - final validation and handoff review for proof handling
