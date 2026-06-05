# Proof Retention Cleanup Operator Runbook

## Purpose

This runbook describes how operators should configure, manually trigger, and monitor the protected proof-retention cleanup route.

The route deletes expired raw redacted proof objects from the private `verification-proofs` bucket, sets `verification_evidence.deleted_at`, and preserves safe database metadata plus audit history.

This runbook does not add a scheduler or change application behavior.

## Route

Protected route:

- `/api/ops/proof-retention-cleanup`

Method:

- `POST`

Required auth header:

- `x-jmpseat-ops-secret`

Required server-side environment:

- `OPS_CLEANUP_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- app Supabase URL/key environment already used by the app

The route does not require a browser user session. It is intended for server/operator invocation only.

## Environment Setup

Local runtime:

- configure `.env.local`
- keep `.env.local` ignored
- never commit `.env.local`
- never print environment values

Production runtime:

- configure `OPS_CLEANUP_SECRET` in the production hosting environment
- configure `SUPABASE_SERVICE_ROLE_KEY` in the production hosting environment
- keep service-role credentials server-only
- never use `NEXT_PUBLIC_` for `OPS_CLEANUP_SECRET`
- never expose the service-role key to browser code

Secret handling:

- rotate `OPS_CLEANUP_SECRET` if it is exposed
- rotate the Supabase service-role key if it is exposed
- do not paste secrets into tickets, chats, logs, screenshots, or docs

## Manual Trigger Command

Production template:

```bash
curl -X POST \
  "https://<production-domain>/api/ops/proof-retention-cleanup?limit=10" \
  -H "x-jmpseat-ops-secret: <OPS_CLEANUP_SECRET>"
```

Local template:

```bash
curl -X POST \
  "http://localhost:3000/api/ops/proof-retention-cleanup?limit=5" \
  -H "x-jmpseat-ops-secret: <OPS_CLEANUP_SECRET>"
```

Use conservative limits for manual runs until production behavior is observed.

## Expected Response

The response should include only:

- `ok`
- `limit`
- `scannedCount`
- `deletedCount`
- `missingCount`
- `failedCount`
- `skippedCount`

The response must not include:

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

Successful path example shape:

```json
{
  "ok": true,
  "limit": 10,
  "scannedCount": 1,
  "deletedCount": 1,
  "missingCount": 0,
  "failedCount": 0,
  "skippedCount": 0
}
```

## Suggested Scheduler Cadence

Recommended initial cadence:

- daily
- small batch size
- monitor `failedCount` before increasing the batch size

Possible later cadence:

- every 6 to 12 hours if upload volume or retention policy requires it
- increase batch size only after successful production observations

Avoid aggressive schedules until operators have visibility into failures and retry behavior.

## Vercel Cron Configuration Design

Desired future scheduler behavior:

- call `POST /api/ops/proof-retention-cleanup?limit=10`
- include operator authorization
- record deletion audit events
- return summary-only output

Current route requirement:

- `x-jmpseat-ops-secret: <OPS_CLEANUP_SECRET>`

Scheduler compatibility must be verified before production scheduling.

If Vercel Cron cannot send the required custom header directly, use a later scoped implementation change such as:

- a Vercel Cron route that validates Vercel's cron authorization and then invokes the cleanup helper server-side
- a protected internal route that validates `CRON_SECRET` or an `Authorization` header
- extending the existing cleanup route to also accept `Authorization: Bearer <OPS_CLEANUP_SECRET>`

Do not implement scheduler compatibility without a scoped review because this route deletes private proof objects.

## Manual Operator Checklist

Before running cleanup:

- confirm `OPS_CLEANUP_SECRET` is configured
- confirm `SUPABASE_SERVICE_ROLE_KEY` is configured server-side
- confirm the app Supabase URL/key environment is configured
- confirm there is no active incident or deploy freeze
- use a conservative `limit`
- avoid copying secrets into shell history when possible

Run cleanup:

- use the manual trigger command
- inspect the JSON response
- confirm `failedCount`
- confirm the response contains no sensitive fields

After running cleanup:

- inspect recent security events
- confirm expected `verification_evidence.deletion_scheduled` events
- confirm expected `verification_evidence.deleted` events
- investigate any `verification_evidence.deletion_failed` events
- never copy Storage paths into public tickets or chats

## SQL Verification Snippets

Recent deletion events:

```sql
select event_type, result, metadata, created_at
from public.security_events
where event_type in (
  'verification_evidence.deletion_scheduled',
  'verification_evidence.deleted',
  'verification_evidence.deletion_failed'
)
order by created_at desc
limit 50;
```

Recent proof evidence retention state:

```sql
select id, evidence_type, deleted_at, delete_after
from public.verification_evidence
where evidence_type = 'redacted_badge_or_proof'
order by created_at desc
limit 50;
```

The default verification query intentionally does not select `storage_path`.

## Failure Handling

If `failedCount > 0`:

- investigate before increasing the batch limit
- check for `verification_evidence.deletion_failed` events
- confirm failed rows still have `deleted_at = null`
- retry after the underlying issue is understood
- keep audit metadata sanitized in incident notes

Do not manually delete random Storage objects without matching evidence rows unless following a documented incident procedure.

If an object is already missing:

- cleanup may mark the evidence row deleted with an `object_already_missing` reason
- treat this as idempotent cleanup, not a reason to recreate proof files

## Incident And Security Notes

If `OPS_CLEANUP_SECRET` is exposed:

- rotate it immediately
- update production hosting environment values
- review recent cleanup route activity

If `SUPABASE_SERVICE_ROLE_KEY` is exposed:

- rotate it immediately in Supabase
- update production hosting environment values
- review recent security events and Storage activity

Operational safety:

- do not disclose Storage paths
- do not disclose proof metadata beyond bounded audit fields
- disable scheduled cleanup temporarily if it malfunctions
- preserve security-event history for incident review

## Current Limitations

- no production scheduler is configured yet
- no operator dashboard exists
- no alerting exists for nonzero `failedCount`
- no automated failed-cleanup notification exists
- no final privacy/legal policy rollout is recorded yet

## Recommended Next Implementation

1. Verify whether the chosen scheduler can send the required `x-jmpseat-ops-secret` header.
2. Implement scheduler compatibility if the scheduler cannot send the current required header.
3. Add production scheduler configuration with a conservative cadence and batch limit.
4. Add alerting or reporting for `failedCount > 0`.
5. Add operator tooling for cleanup failures and retries.
