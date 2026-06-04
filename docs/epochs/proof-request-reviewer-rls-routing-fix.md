# Proof Request Reviewer RLS Routing Fix

## Purpose

This fix closes the next runtime gap found after the proof-routing-context RPC persistence fix was applied and rerun against the linked Supabase project.

At that point:

- proof upload succeeded
- `requested_airline` persisted into `verification_evidence.metadata`
- `routing_context_source` persisted into `verification_evidence.metadata`
- but an airline-scoped reviewer still could not see the proof request

## Runtime Bug

Observed runtime behavior:

- reviewer `jmpseatapp@gmail.com` had only:
  - `scope_type = airline`
  - `scope_value = American Airlines`
- the applicant proof upload stored:
  - `requested_airline = American Airlines`
  - `routing_context_source = self_declared`
- reviewer session could read its own reviewer-scope row
- reviewer session still saw zero submitted verification requests

This proved the remaining bug was not in app-side queue filtering.

## Root Cause

`public.can_review_verification_request(...)` still routed reviewer visibility using only these evidence metadata keys:

- `airline`
- `role`
- `base`

It did not consider:

- `requested_airline`

That meant:

- app-side queue filtering already supported proof routing by `requested_airline`
- but reviewer sessions could not read the underlying request rows through RLS
- the queue therefore remained empty before app-side filtering could even run

## Migration Fix

Migration:

- `20260604223611_include_requested_airline_in_reviewer_routing.sql`

The migration updates `public.can_review_verification_request(...)` to preserve the existing bounded posture while extending airline reviewer matching to use:

- `metadata ->> 'airline'`
- or, when absent, `metadata ->> 'requested_airline'`

The function continues to:

- require an authenticated reviewer
- block self-review
- allow global scope to read reviewable requests
- keep role/base handling unchanged
- avoid any broad public reviewer reads

## Reviewer Routing Behavior

After this fix is applied remotely:

- airline-scoped reviewers can read proof requests whose `requested_airline` matches their active airline scope
- unrelated airline-scoped reviewers still cannot read mismatched proof requests
- global reviewers still work unchanged

This remains routing behavior only.

`requested_airline` is still:

- self-declared routing context
- not verified proof
- not a claim
- not authorization for claim-gated access

## Boundaries Preserved

This fix does not add:

- proof viewing
- signed URLs
- public URLs
- previews
- downloads
- AI
- employer-system lookup
- automatic approval
- automatic claim issuance

Role and base claim boundaries remain unchanged.

## Runtime Follow-Up

After merge, the next runtime rerun should confirm:

- proof upload still succeeds
- proof metadata still persists:
  - `requested_airline`
  - `routing_context_source`
- airline-scoped reviewer can now see the proof request without global scope
- queue output remains metadata-only
- no claim is issued from upload alone

## Remote Handling

Remote `db push` is deferred until after review and merge of this fix branch.
