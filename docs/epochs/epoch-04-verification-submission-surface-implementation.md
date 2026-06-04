# Epoch 04 Verification Submission Surface Implementation

## Purpose

`E04-T05` implements the first real `/app/verification` surface for authenticated private-app users.

This ticket adds a bounded verification status and method-guidance page. It does not implement proof upload, reviewer tooling, automatic claim issuance, or claims-based access.

## What `/app/verification` Now Does

- remains behind the existing private-app gate stack
- shows a real verification page instead of falling through to the generic private placeholder
- explains that verification is separate from:
  - signup
  - profile completion
  - beta access
- shows a current-user verification status summary based on:
  - `verification_requests`
  - `verification_claims`
  - `verification_evidence`
- shows current request rows when they exist
- shows current approved or pending claim rows when they exist
- shows a no-request state when the user has not started verification
- explains the current work-email path
- explains the future redacted-proof path
- preserves privacy, redaction, and no-employer-system-lookup boundaries in user-facing copy

## What `/app/verification` Does Not Do

- does not create Supabase Storage buckets
- does not upload files
- does not expose a file input
- does not send work-email verification messages
- does not issue claims automatically
- does not approve verification automatically
- does not expose reviewer/admin reads
- does not change beta-access behavior
- does not grant room or board access

## Work-Email Request Creation

Work-email request creation is deferred in this ticket.

This slice only exposes:

- work-email method guidance
- supported-path explanation
- privacy boundaries
- a disabled submission affordance

The actual request and evidence-row write flow remains for later implementation because this ticket stays focused on the first user-facing verification surface and does not yet introduce the fuller submission lifecycle wiring.

## Redacted Proof Upload State

Redacted proof upload is explicitly disabled and deferred in this ticket.

The page explains:

- upload is not live yet
- proof will require private storage
- proof will require short retention
- proof will require strict redaction

The page also names the evidence that must be redacted or excluded:

- employee IDs
- badge numbers
- barcodes
- QR codes
- badge backsides
- security/access markings
- passenger/customer information
- trip/schedule screenshots
- crew hotel information

## Privacy And Policy Boundaries Preserved

The page preserves these boundaries:

- work email may differ from login email
- work email is not public
- approved claims remain separate from self-declared profile fields
- work email can support broad airline-worker verification and later airline-specific verification
- work email alone does not prove role or base
- jmpseat does not ask reviewers to use employer systems or internal directories
- no employer-system lookup is required or encouraged

## Status Model On The Surface

The surface currently summarizes the user state as:

- no request yet
- verification in progress
- verification needs resubmission
- verification claim approved

This summary is read-only and user-owned. It is driven by the user’s own verification rows only.

## RLS And Read Scope

This ticket relies on the conservative `E04-T02` verification-table RLS posture:

- users read only their own verification requests
- users read only their own verification claims
- users read only their own verification evidence metadata

No reviewer/admin write flows were added here.

## What Remains For Later Epoch 04 Tickets

### E04-T06

- request creation/update flows
- evidence metadata write flows
- fuller work-email submission handling

### E04-T07

- human review queue foundation
- reviewer decision actions
- self-approval prevention enforcement in reviewer flows

### E04-T08

- verification-specific security-event lifecycle expansion
- audit rules for submission and review behavior

### E04-T10

- final validation
- route smoke testing
- docs handoff and epoch review

## Scope Confirmation

This ticket adds no:

- upload implementation
- storage implementation
- AI
- reviewer/admin dashboard
- community feature work
- mobile scaffold
- custom SMTP or auth-email branding work
