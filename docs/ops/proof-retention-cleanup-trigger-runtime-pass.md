# Proof Retention Cleanup Trigger Runtime Pass

## Purpose

This artifact records that the protected proof-retention cleanup route works against the live Supabase runtime.

It confirms that `/api/ops/proof-retention-cleanup` safely invokes proof cleanup only when authorized by the local operator secret and that route-triggered cleanup now persists deletion audit events.

## Runtime Environment

- repo path: `/Users/ClawdBot/jmpseat`
- final repo state: clean `main`
- fix commit present:
  - `05ba5f1 fix: record cleanup trigger audit events`
- local runtime had required server-only environment values present
- `.env.local` was ignored
- no environment values or secrets are included in this artifact
- no `db push` was run

## Route Protection Result

Route tested:

- `/api/ops/proof-retention-cleanup`

Denied checks:

- `GET` returned `405`
- `POST` without `x-jmpseat-ops-secret` returned `401`
- `POST` with a wrong `x-jmpseat-ops-secret` returned `401`

Denied responses were small JSON bodies and did not include:

- Storage paths
- URLs
- filenames
- proof contents
- secrets
- stack traces

## Authorized Cleanup Result

Test users:

- applicant:
  - `adamstiavetti@gmail.com`
- reviewer:
  - `jmpseatapp@gmail.com`
- reviewer scope:
  - `American Airlines`

Test fixture:

- request id:
  - `47a01493-7e62-4589-b2e8-15fe7befdef0`
- evidence id:
  - `880f2cce-6f59-47e4-8bfa-787f695d7493`
- dummy PNG only
- not a real badge
- no employee ID
- no badge number
- no barcode or QR code
- no security markings
- no personal document

Authorized route call:

- `POST /api/ops/proof-retention-cleanup?limit=5`
- header:
  - `x-jmpseat-ops-secret`

Runtime note:

- the first authorized call returned `scannedCount = 0` because it ran before the controlled `delete_after` update was confirmed
- after the row was confirmed eligible and the private object existed, the route was invoked again for the actual cleanup pass

Cleanup response:

- `ok = true`
- `limit = 5`
- `scannedCount = 1`
- `deletedCount = 1`
- `missingCount = 0`
- `failedCount = 0`
- `skippedCount = 0`

The response was summary-only and did not include:

- Storage path
- bucket
- signed URL
- public URL
- filename
- proof contents
- OCR text
- employee ID
- badge number
- barcode or QR data
- secrets, tokens, or passwords

## DB And Storage Result

After cleanup:

- the `verification_evidence` row remained
- `deleted_at` was set
- safe metadata remained
- the private Storage object was gone
- no claim issuance changed

Retained metadata stayed bounded to safe upload and routing fields such as:

- file size
- MIME type
- original extension
- upload client
- redaction acknowledgement
- evidence method
- requested airline routing context
- routing context source

## Post-Deletion Proof-View Result

The reviewer authorization path still resolved for the request, but proof access was denied after deletion.

Post-deletion proof-view result:

- denied with `proof_deleted`
- no signed URL was created by the decision path
- no proof content was exposed
- no Storage path or URL was exposed

## Audit And Security Events

The route-triggered cleanup recorded:

- `verification_evidence.deletion_scheduled`
- `verification_evidence.deleted`

Post-deletion proof-view validation recorded:

- `verification_evidence.view_denied`
  - `reason_code = proof_deleted`

No `verification_evidence.deletion_failed` event was recorded for the successful cleanup path.

Event metadata remained bounded to safe audit fields such as:

- verification request id
- verification evidence id
- evidence type
- status
- `delete_after`
- `deleted_at`
- reason code

Confirmed absent from relevant event metadata:

- Storage path
- signed URL
- public URL
- raw filename
- proof contents
- OCR text
- employee ID
- badge number
- barcode or QR data
- secrets, tokens, or passwords

## Bug Fixed

Prior protected-route runtime validation found that cleanup succeeded but route-triggered deletion events were not persisted.

Root cause:

- the protected ops route runs without an authenticated browser user session
- cleanup audit events used the normal session-backed `recordSecurityEvent` path
- `security_events` RLS caused those inserts to fail soft

Fix:

- route cleanup now uses a server-only proof-retention cleanup entrypoint
- that entrypoint records deletion audit events with a service-role-backed security-event recorder
- `src/lib/securityEvents/server.ts` now uses a real `import "server-only"` guard
- normal user/session security-event recording remains unchanged
- event metadata still flows through the shared sanitizer

## Remaining Limitations

- actual scheduler cadence still needs deployment configuration, such as Vercel Cron or an equivalent scheduler
- `object_already_missing` runtime behavior remains covered by focused tests unless separately exercised
- deletion-failure runtime behavior remains covered by focused tests unless separately exercised
- no operator cleanup dashboard exists yet
- privacy/legal rollout remains needed before public use with real uploads at scale

## Recommended Next Work

1. Configure the chosen scheduler for `/api/ops/proof-retention-cleanup`.
2. Verify scheduler compatibility with the required cleanup secret header.
3. Add operator tooling for cleanup failures and retries.
4. Add approved-domain and reviewer-scope operator tooling.
5. Finalize production privacy and legal copy before real uploads at scale.

Operator runbook:

- [Proof Retention Cleanup Operator Runbook](proof-retention-cleanup-operator-runbook.md)
