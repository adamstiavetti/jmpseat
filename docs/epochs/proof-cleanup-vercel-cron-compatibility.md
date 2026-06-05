# Proof Cleanup Vercel Cron Compatibility

## Purpose

This slice adds a Vercel-Cron-compatible trigger for proof-retention cleanup without weakening the existing manual operator route.

The existing cleanup helper and manual trigger were already runtime-proven. Vercel Cron invokes configured paths with `GET`, so the manual `POST` route remains unchanged and a separate `GET` cron route is introduced.

## Manual Route Preserved

Manual operator route:

- `POST /api/ops/proof-retention-cleanup`
- requires `x-jmpseat-ops-secret: <OPS_CLEANUP_SECRET>`
- rejects `GET`
- does not rely on a browser session
- delegates to the same server-only cleanup helper

The manual route does not accept bearer authorization and does not accept query-string secrets.

## Cron Route Added

Cron route:

- `GET /api/ops/proof-retention-cleanup/cron`
- requires `Authorization: Bearer <OPS_CLEANUP_SECRET>`
- rejects non-`GET` methods
- rejects missing, malformed, or wrong bearer tokens
- ignores query-string secrets
- does not rely on a browser session
- delegates to the same server-only cleanup helper as the manual route

Batch behavior:

- default `limit` is `10`
- optional `?limit=` is capped at `50`

## Vercel Cron Configuration

Relevant Vercel docs:

- [Cron Jobs](https://vercel.com/docs/cron-jobs/)
- [Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)

`vercel.json` configures the cron path:

```json
{
  "crons": [
    {
      "path": "/api/ops/proof-retention-cleanup/cron?limit=10",
      "schedule": "0 9 * * *"
    }
  ]
}
```

No secret is stored in `vercel.json`.

Production must configure:

- `OPS_CLEANUP_SECRET`
- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- normal app Supabase environment values

For this compatibility slice, set `CRON_SECRET` to the same value as `OPS_CLEANUP_SECRET`. Vercel Cron sends `CRON_SECRET` as the `Authorization: Bearer` value, and the route validates the bearer token against `OPS_CLEANUP_SECRET`.

## Response Safety

Both manual and cron routes return only:

- `ok`
- `limit`
- `scannedCount`
- `deletedCount`
- `missingCount`
- `failedCount`
- `skippedCount`

Responses must not include:

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

## Runtime Boundary

This slice does not add:

- UI delete controls
- reviewer delete controls
- proof upload redesign
- proof viewing changes
- AI/OCR
- automatic approval
- claim issuance changes
- employer-system lookup
- community features
- mobile scaffold
- custom SMTP/auth branding

No migration is needed and no remote database push is required.

## Runtime Validation Needed

After deployment, validate:

1. Vercel has `OPS_CLEANUP_SECRET` configured.
2. Vercel has `CRON_SECRET` configured to the same value.
3. Vercel has `SUPABASE_SERVICE_ROLE_KEY` configured server-side.
4. Direct unauthenticated cron route calls return denied.
5. Direct wrong-bearer cron route calls return denied.
6. Correct bearer cron route calls return a summary-only response.
7. The scheduled Vercel Cron run reaches the cron route.
8. Cleanup audit events are recorded.
9. No response, log, or event metadata exposes paths, URLs, filenames, proof contents, employee identifiers, badge data, OCR text, barcode or QR data, secrets, tokens, or passwords.

## Follow-Up

If production needs independent rotation of operator and scheduler secrets, add a later scoped change for a dedicated cron secret environment variable. That later change should preserve the same route isolation and summary-only response contract.
