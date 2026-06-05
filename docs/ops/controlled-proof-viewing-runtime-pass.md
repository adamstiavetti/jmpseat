# Controlled Proof Viewing Runtime Pass

## Purpose

This artifact records that controlled reviewer proof viewing now works end-to-end against the live Supabase runtime.

It also records the original Next server-action redirect bug and the fix that made the runtime flow work.

## Runtime Environment

- repo path: `/Users/ClawdBot/jmpseat`
- final repo state: clean `main`
- linked Supabase runtime was already aligned through the proof-view security-events migration:
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
- local runtime had the server-only `SUPABASE_SERVICE_ROLE_KEY` configured
- no environment values or secrets are included in this artifact

## Test Accounts And Request

- reviewer app-login account:
  - `jmpseatapp@gmail.com`
- applicant app-login account:
  - `adamstiavetti@gmail.com`
- proof request type:
  - latest submitted `redacted_badge_or_proof`
- requested airline:
  - `American Airlines`
- test data note:
  - dummy proof data only
  - not a real badge
  - no employee ID
  - no badge number
  - no barcode or QR code
  - no security markings
  - no personal document

## Positive Proof-View Flow

The controlled proof-viewing flow succeeded against the live runtime:

- reviewer logged in
- reviewer opened `/app/admin/verification`
- reviewer queue showed the expected proof request
- queue still showed metadata only
- reviewer clicked `View proof`
- reviewer authorization passed
- app created a short-lived signed URL
- browser exited the app through the controlled signed-URL path
- proof viewing succeeded

The successful reviewer flow remained bounded:

- no storage path shown in the app UI
- no storage bucket shown in the app UI
- no signed URL shown as text in the app UI
- no public URL shown in the app UI
- no preview added to the queue
- no persistent download button added to the queue

## Original Runtime Blocker

The original runtime failure was narrower than storage configuration:

- standalone server-side signed URL creation already worked for the exact proof object
- reviewer authorization already worked
- reviewer queue routing already worked
- but the live Next server-action path still failed

Observed runtime behavior before the fix:

- proof-view action recorded:
  - `verification_evidence.view_requested`
  - `verification_evidence.view_granted`
- then incorrectly recorded:
  - `verification_evidence.view_denied`
  - `reason_code = signed_url_unavailable`
- and redirected back to the reviewer queue with:
  - `Controlled proof viewing is not available in this environment yet.`

Root cause:

- `redirect(signedUrl)` in Next throws internally for control flow
- `src/lib/verification/proofAccess.ts` had a broad `catch`
- that `catch` swallowed the redirect throw
- the successful signed-URL path was incorrectly remapped to the fail-closed denial path

Fix:

- commit:
  - `74096a4c16ec2ca01a491d1d04fce3500902e774`
- implementation change:
  - use `unstable_rethrow(error)` before fail-closed denial handling in the proof-view action

## Security And Audit Result

Runtime audit events recorded during proof viewing:

- `verification_evidence.view_requested`
- `verification_evidence.view_granted`
- `verification_evidence.view_denied`

Denied path tested:

- invalid evidence id
- denied reason code:
  - `evidence_missing`

Event metadata stayed bounded and sanitized:

- no signed URL in event metadata
- no public URL in event metadata
- no storage path in event metadata
- no raw filename
- no proof contents
- no OCR text
- no employee IDs
- no badge numbers
- no barcode or QR data
- no secrets, tokens, or passwords

## UI And Privacy Result

The reviewer queue remained metadata-only even after proof-viewing became runtime-proven.

Safe metadata shown:

- evidence type
- status
- redaction acknowledged
- requested airline
- routing context source
- mime type
- file size

The reviewer queue still did not display:

- storage bucket
- storage path
- signed URL text
- public URL
- preview
- persistent download button

Applicant and non-reviewer boundary:

- applicant did not receive a visible `View proof` control

## Remaining Limitations

- signed-URL proof viewing works, but inline preview remains intentionally deferred
- no proof retention automation yet
- no AI or OCR
- no automatic approval
- no final airline-domain policy
- no finalized production legal or privacy copy
- no custom SMTP or auth email branding yet
- no claim-gated community areas yet

## Recommended Next Work

1. Proof retention and deletion automation.
2. Operator tooling for approved domains and reviewer scopes.
3. Finalized privacy and legal copy before real user uploads.
4. Custom SMTP and auth email branding before public work-email delivery.
5. Claim-gated community and room rollout after the privacy and verification surfaces are fully settled.

The next privacy-critical design step is documented in:

- [Proof Retention Deletion Automation Design](../epochs/proof-retention-deletion-automation-design.md)
