# Epoch 04 Claims-Based Authorization Preparation

## Purpose

`E04-T09` prepares future claim-gated access for rooms, boards, and other protected private areas without implementing any of those surfaces yet.

This ticket introduces a bounded claim-requirement model and claim-evaluation helpers on top of the existing verification claims system.

## Claim Requirements Modeled

The new helper models four requirement shapes:

- `{ claimType: "airline_worker" }`
- `{ claimType: "airline", claimValue: string }`
- `{ claimType: "role", claimValue: string }`
- `{ claimType: "base", claimValue: string }`

These requirements intentionally map only to approved verification claims, not self-declared profile fields.

## How Approved Claims Are Evaluated

The helper evaluates requirements conservatively:

- only `approved` claims count
- `pending`, `rejected`, `needs_resubmission`, `expired`, and `revoked` claims do not count
- claims with `revoked_at` set do not count
- claims past `expires_at` do not count
- `claim_type` must match exactly
- `claim_value` matching is case-insensitive where a value is required

The helper returns structured results:

- `allowed`
- `matchedRequirements`
- `missingRequirements`
- `denyReasons`

## Future Access Policy Preparation

The helper includes pure requirement builders for future access patterns:

- broad verified-worker area:
  - `airline_worker`
- airline-specific room:
  - `airline_worker`
  - `airline`
- base-specific area:
  - `airline_worker`
  - `base`
- role-specific area:
  - `airline_worker`
  - `role`

These are examples for future authorization wiring only. They do not create routes or surfaces in this ticket.

## Expired, Revoked, And Pending Claim Handling

This slice deliberately treats the following as non-authoritative for protected access:

- pending claims
- rejected claims
- revoked claims
- expired claims
- claims with a historical `revoked_at`

That keeps protected access dependent on currently active approved claims only.

## Self-Declared Profile Fields Are Not Trusted

This ticket does not trust:

- `claimed_airline`
- `claimed_role`
- `claimed_base`

Those remain onboarding/profile fields, not verified authorization inputs.

## Server Helper Decision

No new dedicated server helper was added in this slice.

Reason:

- the repo already has current-user verification reads in `src/lib/verification/server.ts`
- adding another server reader here would duplicate scope without enabling a real protected surface yet

Server integration for actual room/board gates remains later work once protected areas exist.

## What Was Not Implemented

This ticket adds no:

- rooms
- boards
- posts
- comments
- saves
- search
- moderation workflows
- proof upload
- Storage bucket work
- AI
- mobile scaffold
- custom SMTP or auth-email branding work

## What Remains Later

### E04-T10

- validation and final worker-verification epoch handoff

### Later community epochs

- actual protected room/board routes
- route-level claim checks
- content posting/commenting
- moderation and community policy enforcement
