# Verification Runtime Pass: American Airlines Test

## Purpose

This artifact records the successful end-to-end runtime verification pass for the bounded work-email review flow after the approved-domain RLS fix.

## Runtime Summary

Runtime test setup:

- applicant app-login account: `adamstiavetti@gmail.com`
- reviewer app-login account: `jmpseatapp@gmail.com`
- test work-email input: `test@aa.com`
- seeded approved test domain: `aa.com`
- airline label on the seeded domain: `American Airlines`

Successful runtime flow:

- applicant reached `/app/verification`
- applicant submitted `test@aa.com`
- a verification request row was created
- a verification evidence metadata row was created
- reviewer reached `/app/admin/verification`
- reviewer approved the request
- claims issued:
  - `airline_worker`
  - `airline = American Airlines`
- claims not issued:
  - `role`
  - `base`

Security and negative-path confirmation:

- verification security events were recorded
- metadata remained sanitized
- unsupported-domain handling still created no verification rows
- non-reviewers could not access the reviewer route
- no employer-system lookup occurred

## Original Blocking Bug And Fix

Before the runtime pass succeeded:

- an active `approved_email_domains` row for `aa.com` existed
- the authenticated runtime path could not read it
- `/app/verification` still showed no supported domains
- `test@aa.com` returned unsupported

Root cause:

- `public.approved_email_domains` had RLS enabled
- active approved rows were not readable by authenticated app users

Fix migration:

- `20260604191118_allow_active_approved_email_domain_reads.sql`

Fix posture:

- authenticated users can read only active approved domains
- no write access was added
- no domains were hard-coded in app code

## Important Caveats

- `test@aa.com` was fake test input for domain-matching only
- this does not prove control of a real American Airlines work email
- American Airlines does not endorse jmpseat
- `aa.com` was a runtime smoke-test seed, not final production domain policy
- real work-email delivery does not exist yet
- proof upload does not exist yet

## Follow-Up Hardening Note

At the time of the runtime proof, one known hardening gap remained:

- review writes were still sequential rather than transactional

That follow-up is addressed by the later transactional review-action hardening work documented in:

- [Verification Transactional Review Action Hardening](../epochs/verification-transactional-review-action-hardening.md)

## Post-Transactional Review RPC Runtime Pass

After the transactional migration was applied remotely, the American Airlines runtime validation pass was rerun against the linked Supabase project.

Runtime context for this pass:

- repo path: `/Users/ClawdBot/jmpseat`
- linked migration history was aligned through:
  - `20260604195441`
- approved test domain:
  - `aa.com`
  - `American Airlines`
- reviewer app-login account:
  - `jmpseatapp@gmail.com`
- original applicant app-login account:
  - `adamstiavetti@gmail.com`
- fresh applicant used for first-time RPC claim issuance proof:
  - `adamstiavetti+txrpc20260604204555@gmail.com`
- test work-email input:
  - `transaction-test@aa.com`

### Why A Fresh Applicant Was Needed

The original applicant already had active approved verification claims from the earlier runtime pass:

- `airline_worker`
- `airline = American Airlines`

That meant the new transactional review path correctly skipped duplicate active claim insertion for that already-approved account.

To prove first-time claim issuance through `public.apply_verification_review_decision(...)`, a fresh applicant account was used for the final validation pass.

### Positive Runtime Result

Fresh-applicant submission path:

- the fresh applicant reached `/app/verification`
- the page showed `No verification request yet`
- the applicant submitted `transaction-test@aa.com`
- a `work_email` verification request row was created
- a `work_email` verification evidence metadata row was created
- no claim was issued at submission time
- the page refreshed into the submitted / in-progress state

Reviewer approval path:

- the reviewer reached `/app/admin/verification`
- the queue showed the fresh request with safe metadata only
- the reviewer approved the request
- approval succeeded through the RPC-backed review path
- the request status became `approved`
- a `verification_review_actions` row was created
- the queue no longer showed the request after approval

### Claims Result After RPC Approval

Claims issued for the fresh applicant:

- `airline_worker`
- `airline = American Airlines`

Claims not issued:

- `role`
- `base`

This remains consistent with the bounded work-email claim model:

- work email can support broad airline-worker verification
- work email can support an airline claim when safe airline metadata exists from the approved domain mapping
- work email alone still does not prove role or base

### Security Events And Metadata Result

The post-transactional runtime pass confirmed verification security events for:

- `verification_request.submitted`
- `verification_evidence.created`
- `verification_review.approved`
- `verification_claim.issued`
- `verification_request.unsupported_domain`

Evidence metadata and security-event metadata remained bounded and safe:

- no raw work email
- no email local-part
- no employee IDs
- no badge numbers
- no proof contents

Evidence metadata remained limited to domain-level fields such as:

- `email_domain`
- `airline`
- `source`
- `support_result`
- `verification_method`

### Negative Checks Still Held

The post-transactional runtime pass also reconfirmed:

- applicant and other non-reviewers still could not access the reviewer route
- non-reviewers were routed to `/app/access-restricted`
- unsupported domains still returned unsupported
- unsupported-domain attempts created no extra verification rows for the fresh applicant
- reviewer approval still did not issue `role`
- reviewer approval still did not issue `base`
- no employer-system lookup occurred anywhere in the tested flow

### Conclusion

The American Airlines verification runtime flow still works end-to-end after moving the review decision path into `public.apply_verification_review_decision(...)`.

This post-transactional runtime proof confirms:

- request creation still works
- evidence metadata creation still works
- reviewer queue access still works
- approval succeeds through the transactional RPC-backed path
- bounded claim issuance still works
- security-event recording remains intact and sanitized
