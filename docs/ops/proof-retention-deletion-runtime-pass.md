# Proof Retention Deletion Runtime Pass

## Purpose

This artifact records that proof deletion cleanup works against the live Supabase runtime.

It confirms that raw proof can be deleted from private Storage while retaining safe metadata and bounded audit history in the database.

## Runtime Environment

- repo path: `/Users/ClawdBot/jmpseat`
- final repo state: clean `main`
- linked Supabase migration history included:
  - `20260604113000`
  - `20260604124500`
  - `20260604143000`
  - `20260604154521`
  - `20260604165541`
  - `20260604173625`
  - `20260604191118`
  - `20260604195441`
  - `20260604210259`
  - `20260604220401`
  - `20260604223611`
  - `20260604231332`
  - `20260605003656`
- local runtime had the server-only `SUPABASE_SERVICE_ROLE_KEY` configured
- no environment values or secrets are included in this artifact

## Test Evidence

- applicant app-login account:
  - `adamstiavetti@gmail.com`
- reviewer app-login account:
  - `jmpseatapp@gmail.com`
- request id:
  - `fa74711e-27af-4162-8ca6-9b626b066e6f`
- evidence id:
  - `2946d7b9-882b-4c99-ad53-25f234531236`

Test data note:

- dummy proof data only
- not a real badge
- no employee ID
- no badge number
- no barcode or QR code
- no security markings
- no personal document

## Pre-Cleanup State

Before cleanup:

- the private Storage object existed
- `deleted_at` was null
- reviewer scope was active for `American Airlines`
- `can_review_verification_request(...)` returned `true`
- proof access decision was `allowed`
- short-lived signed URL generation was possible

## Cleanup Setup

The runtime test reused the existing live dummy proof row instead of creating a new upload.

Only the target evidence row had `delete_after` moved into the past to make it eligible for cleanup.

No additional production-like rows were modified for this successful-path runtime test.

## Cleanup Result

Cleanup summary:

- `scannedCount: 1`
- `deletedCount: 1`
- `missingCount: 0`
- `failedCount: 0`
- `skippedCount: 0`

After cleanup:

- the private Storage object no longer existed
- the evidence row still existed
- `deleted_at` was set
- safe metadata remained
- no claim issuance changed

## Post-Deletion Proof-Viewing Result

After deletion:

- proof access was denied
- denial reason was `proof_deleted`
- no signed URL was created

This confirmed that deleted proof fails closed even when reviewer scope and request visibility remain valid.

## Security Events

The successful runtime path recorded:

- `verification_evidence.deletion_scheduled`
- `verification_evidence.deleted`
- `verification_evidence.view_denied`
  - `reason_code = proof_deleted`

No `verification_evidence.deletion_failed` event was recorded on the successful cleanup path.

## Metadata And Event Safety

Confirmed absent from retained evidence metadata and relevant security-event metadata:

- no storage path
- no signed URL
- no public URL
- no raw filename
- no proof contents
- no OCR text
- no employee ID
- no badge number
- no barcode or QR data
- no secrets, tokens, or passwords

Safe retained metadata remained bounded to operational review and audit fields such as:

- evidence id
- request id
- evidence type
- status
- `delete_after`
- `deleted_at`
- requested airline routing context
- mime type
- file size

## Deferred Runtime Cases

The following runtime cases remain covered by focused automated tests only:

- `object_already_missing`
- deletion failure behavior

They were deferred in live runtime to avoid mutating additional rows or objects beyond the single successful-path dummy proof row used for this bounded validation.

## Remaining Limitations

- no scheduled cron or Edge Function trigger is wired yet in runtime
- protected trigger foundation is now implemented, but still needs dedicated runtime trigger validation after deployment or local operator-secret setup
- no operator UI exists for cleanup
- no finalized retention-policy or legal review is recorded yet
- no finalized production privacy notice is recorded yet

## Recommended Next Work

1. Runtime-validate the protected cleanup trigger with operator-secret authentication.
2. Add operator tooling for cleanup failures and retries.
3. Finalize production privacy and legal copy for proof retention/deletion.
4. Add approved-domain and reviewer-scope operator tooling.
5. Proceed to claim-gated community surfaces only after those privacy and operator controls are settled.
