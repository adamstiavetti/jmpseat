# Private Beta Readiness Bridge

Date: 2026-06-08

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This bridge reconciles the current post-Epoch-5 repo state with the broader
private-beta planning docs.

It defines the narrow lane between the closed Epoch 5 operator/admin/security
closeout and the broader `05B / Community Access Architecture` implementation
lane.

Use this doc when deciding what "private beta readiness" means right now. Do
not read the broader private-beta docs as immediate implementation scope unless
this bridge or a newer roadmap doc explicitly says so.

## 2. Executive Summary

Epoch 5 is closed with explicit carry-forward items.

jmpseat is not yet claiming readiness for a real broader private beta user
population. The current repo supports:

- public waitlist/marketing on `jmpseat.com` and `www.jmpseat.com`
- private beta/auth/admin on `beta.jmpseat.com`
- stable auth/onboarding/access-hold foundations
- bounded operator/admin tooling and related security hardening

The immediate next lane is a narrow private beta readiness bridge, not broad
community/baseboard implementation.

The bridge exists to:

- confirm what is actually implemented today
- keep conditional security follow-up visible
- complete near-term auth/email operational readiness
- prevent broader beta docs from being misread as current-ready scope
- define the stop conditions before moving into `05B`

## 3. What Is Actually Implemented Today

Current implemented/runtime-proven baseline:

- `jmpseat.com` and `www.jmpseat.com` serve the public waitlist/marketing page.
- `beta.jmpseat.com` remains the private beta/auth/admin surface.
- Public waitlist capture is live with optional follow-up survey.
- Public root has no Beta Access CTA, no `/login?next=/app` CTA, and no
  proof/badge/document/manual-review upload copy.
- Initial-scroll bug on the public page is fixed live.
- Duplicate waitlist survey-token hardening is deployed and runtime-proven.
- Stable beta auth flow is founder-confirmed at runtime.
- `/app/access-hold` is the canonical airline employee email verification and
  beta-status surface.
- Work-email verification is code-first and inline on `/app/access-hold`.
- Normal account signup confirmation is code-first through Supabase Auth-native
  flow.
- Founder/admin internal private-app access uses explicit operator grants.
- Private-app operator override now requires the dedicated
  `operator.internal_private_app_access` scope.
- Trusted `security_events` boundary hardening is deployed and runtime-proven.
- Proof-upload content validation is deployed and test-covered.
- Security headers are live on public and beta routes.
- Beta Preview Supabase env scoping is fixed persistently in Vercel Preview.

## 4. What Epoch 5 Closed

Epoch 5 closed the bounded operator/admin/security hardening lane.

Closed live:

- public root/www waitlist launch and preservation
- public initial-scroll hotfix
- duplicate waitlist survey-token hardening
- operator private-app scope gate hardening
- `security_events` trust-boundary hardening
- security headers hardening
- persistent beta Preview Supabase env scoping

Conditionally closed:

- proof-upload content validation is deployed and test-covered, but a safe live
  authenticated proof-upload mutation test remains pending

## 5. What Private Beta Readiness Means Right Now

Narrowly, private beta readiness now means:

- the repo has a truthful post-Epoch-5 operating baseline
- the remaining conditional security item is explicitly tracked
- auth email branding/custom SMTP work is treated as near-term readiness work
- beta deployment/runtime caveats are documented
- the roadmap clearly separates immediate readiness work from later 05B
  community/baseboard implementation

It does not yet mean:

- jmpseat is ready for a real broad private beta invite wave
- the broader private-beta feature set in older docs is fully implemented
- community boards, posting, moderation, or community-admin tools are ready
- proof-upload validation has full live authenticated runtime proof

## 6. What Private Beta Readiness Explicitly Does Not Mean Yet

This bridge does not mean:

- airline portal login
- schedule scraping
- roster/calendar integrations
- public live crew tracking
- dating/swiping
- exact public crew hotel exposure
- passenger private information handling beyond current policy boundaries
- airport security procedure handling beyond current policy boundaries
- live ops-sensitive community launch
- AI final verification decisions
- AI final moderation/ban decisions
- broad UGC/community launch without moderation/admin gates

It also does not mean the proof bucket is public or that proof files should be
used as a forward product path.

## 7. How To Read The Broader Beta Docs

`docs/BETA_READINESS_CHECKLIST.md` and
`docs/PRIVATE_BETA_OPERATING_PLAN.md` remain useful as broader/full-beta target
references.

They should currently be read as:

- aspirational/full-beta references
- later-lane planning inputs
- not the immediate post-Epoch-5 implementation scope

In particular, community boards, restricted-board gates, posting, comments,
moderation, community-admin tooling, and broader launch-density assumptions
belong to `05B / Community Access Architecture`, not this bridge.

## 8. Carry-Forward Items From Epoch 5

These remain active carry-forward items:

1. Safe live authenticated proof-upload mutation test with a founder-controlled
   workflow and cleanup path.
2. Auth email branding/custom SMTP readiness before broader Closed Beta Login
   exposure.
3. Future CSP reporting/enforcement planning. The broad CSP remains
   report-only.
4. Future Vercel deployment-model maturity decision. This is deferred ops work,
   not an immediate blocker.
5. Existing Supabase migration-history drift. Continue targeted migration apply
   only until explicitly resolved.

## 9. First Bridge Tasks

Recommended bridge tasks:

1. `Auth Email Branding / Confirmation Template Readiness`
2. `Private Beta Readiness Checklist Reconciliation`
3. `Safe Live Proof-Upload Mutation Validation`, if final security signoff
   requires it before broader beta readiness claims
4. `Post-Bridge 05B Entry Decision`

Task notes:

- The auth email branding/custom SMTP task is near-term readiness work before
  broader Closed Beta Login exposure.
- The proof-upload live mutation task remains important, but it should only run
  when a safe founder-controlled account/workflow and cleanup path exist.
- The Vercel deployment-model decision is intentionally not a bridge blocker.

## 10. Which Task Should Come First And Why

Recommended first task:

`Auth Email Branding / Confirmation Template Readiness`

Why:

- newer docs already treat it as the next near-term auth-readiness task
- it is a real blocker for broader non-founder auth exposure
- it is narrower and lower-risk than moving directly into 05B implementation
- it does not require reopening proof-upload, operator/admin, or board work

Exception:

If final security signoff requires a live authenticated proof-upload mutation
test before any further beta-readiness claim, run that validation first.

## 11. Required User Decisions Before Implementation

Before implementation starts, the user should decide:

1. Whether the safe live authenticated proof-upload mutation test is mandatory
   before any further beta-readiness work.
2. Whether the immediate next task should be auth email branding/custom SMTP,
   assuming the proof-upload mutation test is not mandatory first.
3. Whether the broader private-beta docs should remain aspirational references
   or be narrowed later to reflect a smaller near-term beta target.
4. Whether 05B should begin immediately after the bridge or pause for more
   beta-readiness/auth operations work.

## 12. Stop Conditions Before Moving Into 05B

Do not move into broader `05B / Community Access Architecture` work if:

- the user wants the live proof-upload mutation validation completed first and
  no safe founder-controlled workflow exists yet
- auth email branding/custom SMTP is still not ready for broader Closed Beta
  Login exposure
- the repo docs still imply a broader current beta scope than the product
  actually supports
- the user has not decided whether the broader beta docs remain aspirational or
  should be narrowed

## 13. Current Doc Inconsistencies

This bridge resolves or flags these inconsistencies:

- `docs/epochs/first-base-mvp-implementation-ticket-pack.md` still described
  the app-generated work-email confirmation flow as pending review/merge/
  migration/runtime validation, while newer roadmap and auth-closeout docs
  describe the current auth flow as implemented and founder-confirmed on beta.
- `docs/ops/epoch-5-level-set.md` still used stale next-step language that
  pointed to a final Epoch 5 handoff/bridge framing even though the final
  closeout already exists.

Historical implementation docs may still describe earlier pre-runtime states.
Treat the newer closeout/runtime docs and this bridge as the controlling source
for immediate next-lane planning unless a newer doc supersedes them.

## 14. Next Lane After The Bridge

After the bridge, the next broader implementation lane remains:

`05B / Community Access Architecture`

That lane covers:

- general baseboards
- restricted-board gates and access requests
- community-admin authority
- text-first board content
- moderation/reporting foundation for real community surfaces

Those items are explicitly not part of this bridge unless a newer roadmap doc
changes scope.
