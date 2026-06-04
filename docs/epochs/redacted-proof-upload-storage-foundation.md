# Redacted Proof Upload Storage Foundation

## Purpose

This slice adds the first bounded redacted-proof upload path for worker verification.

It is intentionally narrow:

- private Supabase Storage bucket
- server-side upload validation
- redaction acknowledgement
- UUID-only storage path generation
- verification request creation for `redacted_badge_or_proof`
- verification evidence metadata creation
- bounded `/app/verification` upload form

It does not add:

- reviewer proof viewing
- signed reviewer download URLs
- public URLs
- AI pre-check
- automatic approval
- employer-system lookup
- community or room features

## Storage Bucket

Migration created:

- `20260604210259_create_verification_proofs_bucket.sql`

Bucket configuration:

- bucket id/name: `verification-proofs`
- public flag: `false`, meaning no public bucket exposure
- allowed MIME types:
  - `image/jpeg`
  - `image/png`
- file size limit:
  - `5 MB`

V1 exclusions:

- no PDF
- no video
- no HEIC

## Storage Policies

The storage policy posture is intentionally narrow.

Allowed:

- authenticated users may upload only to their own path prefix
- authenticated users may delete only their own path prefix for bounded rollback cleanup when no live `verification_evidence` row references the object yet

Not allowed:

- anonymous access
- broad listing
- broad read/download
- reviewer proof access

No `select` storage policy was added for normal users, so upload does not imply later self-view or download access.

## Path Convention

Stored proof object paths follow:

```text
{user_id}/{verification_request_id}/{evidence_id}.{ext}
```

Path rules:

- UUID-only identifiers
- controlled extension only
- no user-provided filename
- no email address
- no airline name
- no employee ID
- no badge number

## Upload Validation

The bounded upload helper validates:

- authenticated user required
- file required
- redaction acknowledgement required
- MIME type must be JPEG or PNG
- max file size `5 MB`
- no PDF
- no video
- no HEIC

The upload path remains human-review only:

- no OCR
- no badge-content inspection
- no claim issuance at upload time
- no automatic approval

## Request And Evidence Records

The upload flow creates:

- `verification_requests` row
  - method: `redacted_badge_or_proof`
  - status: `submitted`
  - requested claim types:
    - `airline_worker`

- `verification_evidence` row
  - evidence type: `redacted_badge_or_proof`
  - status: `submitted`
  - storage bucket: `verification-proofs`
  - storage path: generated UUID-only path
  - redaction acknowledged: `true`
  - uploaded_at: set
  - delete_after: `submitted_at + 30 days`

## Metadata Stored

Safe metadata only:

- `file_size_bytes`
- `mime_type`
- `original_extension`
- `upload_client`
- `redaction_acknowledged`
- `evidence_method`

Sensitive fields not stored in metadata:

- raw filename
- raw work email
- email local-part
- airline domain seeds
- employee IDs
- badge numbers
- barcode content
- QR code content
- OCR text
- proof text
- proof bytes/blob contents

## Consistency And Cleanup

The upload flow uses this ordering:

1. validate upload and acknowledgement
2. generate request/evidence UUIDs and private storage path
3. upload file to private storage
4. call a bounded transactional RPC to create request and evidence metadata together

The migration adds:

- `public.create_redacted_proof_verification_submission(...)`

That RPC atomically inserts:

- the verification request row
- the verification evidence row

If the storage upload succeeds but the RPC fails:

- the app attempts best-effort object deletion through the bounded own-path delete policy

This keeps the main residual risk on orphaned storage cleanup rather than partial request/evidence database state.

## Reviewer Queue Behavior

Reviewer queue behavior remains metadata-only.

Reviewers may see:

- evidence type
- status
- redaction acknowledgement
- upload time
- delete_after
- safe metadata such as MIME type and file size

Reviewers still do not get:

- storage path display
- signed URL
- public URL
- image preview
- download button

## Security Events

This slice adds bounded upload event coverage:

- `verification_evidence.uploaded`

The upload path records:

- `verification_request.submitted`
- `verification_evidence.created`
- `verification_evidence.uploaded`

Safe event metadata only:

- request id
- evidence id
- evidence type
- file size
- MIME type
- result

Sensitive event data still excluded:

- storage path
- raw filename
- employee IDs
- badge numbers
- proof text
- OCR text
- file contents

## UI Behavior

`/app/verification` now exposes a bounded redacted-proof form with:

- JPEG/PNG file input
- redaction acknowledgement checkbox
- explicit redaction instructions
- short-retention/privacy copy
- human-review-only copy
- no-employer-system-lookup copy

## Still Deferred

- reviewer proof viewing
- signed reviewer download/view URLs
- self-view/download after upload
- AI
- automatic approval
- employer-system lookup
- proof retention automation
- role/base proof issuance logic

## Remote Migration Status

- Migration is created locally in this branch.
- Remote Supabase migration push is deferred until after review and merge.

## Required Runtime Testing After Push

After the migration is pushed remotely, runtime testing should confirm:

- bucket exists and stays private
- JPEG and PNG uploads succeed
- PDF/video/HEIC uploads fail
- upload fails without redaction acknowledgement
- proof request row is created
- proof evidence row is created
- file lands under UUID-only own-prefix path
- reviewer queue shows metadata only
- reviewer queue does not expose proof file access
- security events record upload without leaking path or filename
