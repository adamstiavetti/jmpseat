# FBMVP-T02 Airline Email Verification Access State Implementation

Date: 2026-06-06

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## Summary

FBMVP-T02 adds a narrow app-level helper/adapter for the forward `airline_email_verified` access state.

The helper derives safe airline-email eligibility from existing work-email verification data. It does not create migrations, change private-app gates, remove beta gating, issue role/base claims, create board access, or reactivate proof-upload flows.

## Helper Added

Module:

- `src/lib/verification/airlineEmailAccess.ts`

Primary helper:

- `getCurrentAirlineEmailAccessState(...)`

The helper is pure and data-driven. It accepts existing approved-domain, verification request, verification evidence, and verification claim records and returns a structured state that later gate code can consume.

## State Shape

Returned state includes:

- `status`: `pending`, `verified`, `expired`, `revoked`, `unsupported_domain`, `not_verified`, or `not_ready`
- `airlineEmailVerified`: boolean
- `domain`: normalized airline employee email domain when safe
- `airline`: approved-domain-derived airline label when safe
- `verifiedAt`: verification timestamp when available
- `source`: `work_email`, `legacy_claim_work_email`, or `unknown`
- `messageKey`: stable copy/status key for future UI use

The helper does not return full airline employee email, login email, storage paths, proof filenames, signed URLs, proof content, tokens, sessions, or service-role details.

## Mapping Rules

The helper verifies only conservative work-email provenance:

- approved work-email request plus work-email evidence from an active approved domain can resolve to `verified`
- active approved `airline_worker` claim can resolve to `verified` only when the claim has work-email provenance and linked work-email evidence from an active approved domain
- expired work-email provenance resolves to `expired`
- revoked work-email provenance resolves to `revoked`
- unsupported or disabled domains resolve to `unsupported_domain`
- submitted, pending-review, or needs-resubmission work-email requests resolve to `pending`

The helper combines request-derived and claim-derived work-email candidates into one globally ranked candidate list before selecting the current state. It ranks matching work-email history by authority and recency instead of trusting caller-provided array order or source ordering:

- newer verified work-email history beats older pending or expired history
- newer revoked or expired history can override older verified status when it clearly applies to the same verified domain context
- stale claim history cannot override newer work-email request history merely because claims are processed first
- newer work-email claim history can beat older request history when it is clearly work-email based and current
- pending or unsupported-domain attempts do not silently override an already verified state
- when timestamps are missing, the helper falls back to a stable deterministic sort using status authority, source authority, and stable record keys

The helper does not count:

- proof-upload requests or evidence
- ambiguous legacy claims without work-email provenance
- proof-based `airline_worker` claims
- role claims
- base claims
- self-declared profile fields
- beta access
- login email alone

## No Migration

No migration was created because the helper can derive the first implementation of `airline_email_verified` from existing request/evidence/claim data.

Future schema normalization may still be useful if expiry, revocation, multiple airline emails, or lifecycle audit needs become too complex for the adapter. That decision should be made in a reviewed migration task.

## No Gate Changes

This implementation does not wire the helper into:

- private app route gates
- beta access gates
- `/app/access-hold`
- `/app/access-restricted`
- first-base launch mode
- board routes

FBMVP-T03 remains responsible for private-testing versus first-base-launch gate behavior.

No private-app, beta, launch-mode, or board gate behavior was changed in this task.

## Proof-System Freeze

Proof infrastructure remains frozen as forward product work and preserved as historical/runtime-applied infrastructure.

This implementation does not delete proof tables, proof storage, proof cleanup helpers, proof runtime docs, reviewer proof viewing, proof cleanup routes, or operator proof tooling.

## Validation

Validation run:

- `node --test test/verification/airlineEmailAccess.test.mts`
- `node --test test/verification/workEmail.test.mts test/verification/verificationRequestFlows.test.mts test/verification/verificationSurface.test.mts test/verification/claimsAuth.test.mts`
- `node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts`
- `node --test test/profile/profile.test.mts`
- `node --test test/beta-access/betaAccess.test.mts`
- `node --test test/private-app/privateShellPlaceholder.test.mts test/private-app/access.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

All commands passed. `npm run lint` reported existing unrelated warnings in the live-globe proof and hero flight-control files; those files were not changed.

## Next Ticket

Recommended next ticket:

- `FBMVP-T03 Private-Testing Versus First-Base-Launch Gate Implementation`

FBMVP-T03 should consume this helper only after review and should keep launch-mode changes explicit, test-covered, and separate from board/community implementation.
