# Proof Retention Cleanup Trigger Foundation

## Purpose

This slice adds the first protected trigger for the already-implemented proof retention cleanup helper.

It makes cleanup invocable from a server-only route that can later be used by an operator or scheduler.

It does not add end-user delete controls, reviewer delete controls, or any product-facing cleanup UI.

## Route

- path: `/api/ops/proof-retention-cleanup`
- allowed method: `POST`
- `GET` and other methods return `405 Method Not Allowed`

The route is intended for:

- protected manual operator invocation
- future Vercel Cron or similar scheduler invocation

It is not intended for browser users, reviewer queue actions, or applicant-facing flows.

## Secret Protection

The route is protected with a server-only shared secret:

- env var: `OPS_CLEANUP_SECRET`
- request header: `x-jmpseat-ops-secret`

Protection rules:

- the secret must remain server-only
- the secret must never use `NEXT_PUBLIC_`
- if `OPS_CLEANUP_SECRET` is missing, the route fails closed
- if the request header is missing or wrong, the route denies access
- the route does not rely on logged-in user sessions

## Cleanup Invocation

On an authorized `POST`, the route calls the existing server-only proof cleanup helper.

Batch behavior:

- default limit: `10`
- max limit: `50`
- invalid, empty, zero, or negative limit values fall back to the default

The route accepts an optional query parameter:

- `?limit=<n>`

This remains bounded so operators and future schedulers cannot accidentally trigger oversized batches.

## Readiness Requirements

The trigger also checks server-side Storage admin readiness before starting cleanup.

If the service-role-backed Storage admin helper is unavailable, the route returns a safe unavailable response and does not begin cleanup.

## Response Shape

Successful cleanup runs return a bounded JSON summary:

- `ok`
- `limit`
- `scannedCount`
- `deletedCount`
- `missingCount`
- `failedCount`
- `skippedCount`

If some rows fail cleanup, the route still returns a bounded success response with the failure counts included.

If the run cannot start at all, the route returns a safe error response without internal details.

## Response Safety

The route response must not include:

- Storage paths
- Storage bucket names
- signed URLs
- public URLs
- raw filenames
- proof contents
- OCR text
- employee IDs
- badge numbers
- barcode or QR data
- secrets or tokens

The route is intentionally summary-only.

## Environment

`.env.example` now includes:

- `OPS_CLEANUP_SECRET=`

This is documentation only. Real secret values must remain local or deployment-managed and must never be committed.

## Tests

Focused route coverage was added for:

- missing secret env fails closed
- missing header denies
- wrong header denies
- correct header invokes cleanup
- default limit behavior
- max limit cap behavior
- safe unavailable response when Storage admin is not ready
- safe startup failure response
- response sanitization
- method restriction to `POST`

## Runtime Validation Still Needed

After deploy-time secret setup, run a bounded runtime pass:

1. Confirm `OPS_CLEANUP_SECRET` is configured in the deployment environment.
2. Invoke the protected route with the correct header.
3. Confirm cleanup summary returns bounded counts only.
4. Confirm an eligible dummy proof is deleted and marked with `deleted_at`.
5. Confirm post-deletion proof viewing is denied.
6. Confirm deletion events remain sanitized.

## Out Of Scope

This slice does not add:

- user-facing delete controls
- reviewer delete controls
- admin dashboard cleanup UI
- proof upload redesign
- proof viewing redesign
- AI or OCR
- automatic approval
- claim issuance changes
- employer-system lookup
- community features
- mobile scaffold
- custom SMTP or auth email branding

## Recommended Next Step

Run a dedicated runtime validation pass for the protected cleanup trigger after deployment or local secret setup, then decide whether the scheduled invocation should be Vercel Cron, a similar scheduler, or a manual-only operational path.
