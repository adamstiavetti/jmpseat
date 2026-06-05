# Proof Retention Cleanup Scheduler Compatibility

## Purpose

This document records the scheduler compatibility decision for the protected proof-retention cleanup trigger.

The current route is runtime-proven for manual/operator invocation. The remaining production question is how a scheduler should call it without weakening cleanup authorization or exposing secrets.

This started as a design/check artifact. The Vercel Cron compatibility slice now adds a separate cron-compatible route and `vercel.json`; it still does not add migrations, runtime scheduling validation, or environment secrets.

## Current Route Contract

Manual route:

- `/api/ops/proof-retention-cleanup`

Method:

- `POST`

Required auth header:

- `x-jmpseat-ops-secret: <OPS_CLEANUP_SECRET>`

Required server-side environment:

- `OPS_CLEANUP_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- app Supabase URL/key environment already used by the app

Session behavior:

- no browser user session is required
- cleanup is authorized by the operator/scheduler secret

Response shape:

- `ok`
- `limit`
- `scannedCount`
- `deletedCount`
- `missingCount`
- `failedCount`
- `skippedCount`

The response is summary-only and must not expose Storage paths, buckets, signed URLs, public URLs, filenames, proof contents, OCR text, employee identifiers, badge numbers, barcode or QR data, secrets, tokens, or passwords.

Cron route:

- `/api/ops/proof-retention-cleanup/cron`

Method:

- `GET`

Required auth header:

- `Authorization: Bearer <OPS_CLEANUP_SECRET>`

The cron route exists only for scheduler compatibility. It ignores query-string secrets, does not rely on a browser session, and delegates to the same server-only cleanup helper as the manual route.

## Scheduler Compatibility Question

Before production scheduling, confirm:

- can the scheduler send `POST`?
- can the scheduler send custom headers?
- can the scheduler inject secrets securely?
- can the scheduler avoid putting secrets in the URL?
- how does the route remain protected from public abuse?

Current repo findings before the compatibility slice:

- no `vercel.json` is present
- no local Vercel Cron docs are present in the repo
- `.env.example` defines `OPS_CLEANUP_SECRET` as server-only
- the current route requires `POST` and `x-jmpseat-ops-secret`
- local runtime validated manual authorized invocation with that header

Current compatibility-slice findings:

- `vercel.json` now targets `/api/ops/proof-retention-cleanup/cron?limit=10`
- the cron route is `GET`-only
- the cron route validates bearer authorization
- no secrets are stored in `vercel.json`
- production must set Vercel `CRON_SECRET` to the same value as `OPS_CLEANUP_SECRET` for this slice
- Vercel references:
  - [Cron Jobs](https://vercel.com/docs/cron-jobs/)
  - [Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)

Runtime validation after deployment is still needed before treating scheduled cleanup as production-proven.

## Candidate Production Scheduling Options

### A. Vercel Cron Directly Calls Current Manual Route

This option keeps the route unchanged.

It is valid only if Vercel Cron can:

- call `POST`
- include `x-jmpseat-ops-secret`
- source the header value from a protected environment secret

If Vercel Cron cannot send `POST` with custom headers, this option is not compatible with the current manual route.

Do not switch cleanup to `GET` just to satisfy a scheduler.

### B. Add `Authorization: Bearer <OPS_CLEANUP_SECRET>`

This option keeps one route and extends authorization compatibility.

Future route behavior:

- continue accepting `x-jmpseat-ops-secret`
- additionally accept `Authorization: Bearer <OPS_CLEANUP_SECRET>`
- keep the same server-side secret comparison
- continue requiring `POST`
- never accept the secret in the query string
- keep summary-only responses

This remains an option for other schedulers, but the implemented Vercel-compatible route keeps bearer auth isolated from the manual route.

### C. Add A Separate Internal Cron Route

This option adds a second server-only route for scheduler invocation.

Future route behavior:

- validate scheduler-specific auth such as `CRON_SECRET` or a provider authorization header
- delegate to the same proof cleanup helper
- return the same summary-only response

Tradeoff:

- clearer scheduler boundary
- more code surface and another route to test

This is the selected MVP compatibility path.

### D. Use An External Scheduler

An external scheduler can be compatible if it supports:

- `POST`
- custom headers
- protected secret storage
- sane retry and logging behavior

Tradeoff:

- fewer app-code changes
- more operations/vendor surface
- logs must be reviewed for secret handling

### E. Supabase Scheduled Edge Function

Supabase scheduling is viable because cleanup operates on Supabase rows and Storage.

Tradeoff:

- cleanup runs closer to Supabase
- separate deployment and runtime model
- may duplicate existing Next.js/server-only setup unless designed carefully

This remains a reasonable later option, but the current app already has a runtime-proven Next.js cleanup trigger.

## Recommendation

Implemented path:

1. Keep the current manual operator header:
   - `x-jmpseat-ops-secret`
2. Keep the current manual route as `POST`-only.
3. Add a separate cron route:
   - `GET /api/ops/proof-retention-cleanup/cron`
4. Require:
   - `Authorization: Bearer <OPS_CLEANUP_SECRET>`
5. Configure Vercel Cron to call:
   - `/api/ops/proof-retention-cleanup/cron?limit=10`
6. Set Vercel `CRON_SECRET` to the same value as `OPS_CLEANUP_SECRET`.
7. Never accept cleanup secrets in query strings.
8. Never expose cleanup controls in user or reviewer UI.

This keeps manual operations stable while giving production scheduling a narrowly scoped compatibility path.

## Security Requirements For Future Scheduler Implementation

Any scheduler implementation must preserve:

- no query-string secrets
- no public unauthenticated cleanup
- no logging of `OPS_CLEANUP_SECRET`
- no logging of `SUPABASE_SERVICE_ROLE_KEY`
- constant-time-ish secret comparison if practical
- `POST` only for manual cleanup execution
- `GET` only for the isolated cron route
- summary-only route response
- no Storage path, URL, filename, or proof-content exposure
- cleanup events persisted for scheduled/deleted/failed paths
- `failedCount > 0` monitored by operators

The route must remain server-only and must not expose cleanup controls in user or reviewer UI.

## Vercel Deployment Checklist

Before enabling production scheduling:

- set `OPS_CLEANUP_SECRET` in Vercel environment variables
- set `CRON_SECRET` in Vercel environment variables to the same value as `OPS_CLEANUP_SECRET`
- set `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables
- set app Supabase public environment variables
- verify secrets are not exposed with `NEXT_PUBLIC_`
- verify Vercel Cron sends the expected bearer authorization
- test manual protected invocation in preview or production
- test cron protected invocation in preview or production
- verify route responses do not include sensitive fields
- verify no secrets appear in logs
- verify deletion audit events are recorded

Only configure the schedule after route authentication compatibility is confirmed.

## Runtime Validation Plan

After deployment:

1. Call the cron route without auth.
   - Expected: denied.
2. Call the cron route with wrong auth.
   - Expected: denied.
3. Call the cron route with correct bearer auth.
   - Expected: summary-only cleanup response.
4. Force one dummy expired proof in a non-production or preview fixture.
5. Run the scheduled/manual route invocation.
6. Confirm `deleted_at` is set.
7. Confirm the private object is gone.
8. Confirm `verification_evidence.deletion_scheduled`.
9. Confirm `verification_evidence.deleted`.
10. Confirm no `verification_evidence.deletion_failed` on the successful path.
11. Confirm no path, URL, filename, proof content, employee identifier, badge data, OCR text, barcode or QR data, secret, token, or password appears in the response or event metadata.
12. Confirm `failedCount = 0`.

## Out Of Scope

This document does not implement:

- environment secret creation
- production runtime scheduling validation
- alerting
- operator dashboard
- proof upload changes
- proof viewing changes
- AI or OCR
- automatic approval
- claim issuance changes
- employer-system lookup
- community features
- mobile scaffold
- custom SMTP or auth email branding

## Recommended Next Implementation Slice

Next slice depends on scheduler verification:

- if the selected scheduler can send `POST` and `x-jmpseat-ops-secret`, add reviewed scheduler configuration
- if the selected scheduler cannot send the current header, implement bearer-token compatibility for the cleanup route
- if production deployment is not ready, defer scheduler config and keep manual operator invocation using the current runbook

The likely next implementation is a narrow bearer-token compatibility update plus tests, followed by scheduler configuration once the deployment environment is ready.
