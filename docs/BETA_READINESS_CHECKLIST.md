# Beta Readiness Checklist

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This checklist translates the current planning docs into concrete pre-beta gates. It is documentation-only and does not create or require app code in this repository.

Current scope note:

- This checklist remains the broader/full private-beta target reference.
- It should not be read as the immediate post-Epoch-5 implementation lane.
- Use `docs/ops/private-beta-readiness-bridge.md` for the current narrow bridge
  between the closed Epoch 5 baseline and broader `05B / Community Access
  Architecture` work.

## How to Use This Checklist

- Private beta means a small, controlled group of real users with admin coverage and manual operations.
- Public launch means broader availability beyond the controlled private beta.
- Any unchecked "Required for private beta" item is a launch blocker unless the founder explicitly accepts the risk in writing.
- Any item marked "Required before public launch" may be deferred from private beta only if the deferral is documented.

## 1. Product Scope Gate

V1 must prove the verified aviation-worker utility community without drifting into schedule apps, non-rev load tools, dating, tracking, or full marketplace scope.

Required for private beta:

- [ ] V1 includes account creation.
- [ ] V1 includes aviation worker verification.
- [ ] V1 includes airline / role / base profile.
- [ ] V1 includes anonymous public handle.
- [ ] V1 includes Crew Rooms.
- [ ] V1 includes Base Boards.
- [ ] V1 includes city and airport Layover Boards.
- [ ] V1 includes posts, comments, saves, and search.
- [ ] V1 includes Jumpseat Brief AI layover planner.
- [ ] V1 includes basic crew-friendly deals directory.
- [ ] V1 includes reporting and moderation.
- [ ] V1 includes admin verification dashboard.
- [ ] V1 does not include airline portal login.
- [ ] V1 does not include schedule scraping.
- [ ] V1 does not include public nearby crew tracking.
- [ ] V1 does not include dating/swiping.
- [ ] V1 does not include exact public crew hotel exposure.
- [ ] V1 does not include live schedule/location tracking.
- [ ] V1 does not include flight-load requests.
- [ ] V1 does not include native mobile apps.
- [ ] V1 does not include full marketplace payments.
- [ ] V1 does not include advanced employment verification APIs.
- [ ] V1 does not include roster/calendar integrations.
- [ ] V1 does not include vendor self-serve publishing.
- [ ] V1 does not include recruiter dashboards.

Required before public launch:

- [ ] Product analytics confirm users are using utility surfaces, not only casual posting.
- [ ] Founder has reviewed beta usage and confirmed no scope drift toward excluded features.

## 2. Verification Gate

Verification must be practical for V1 and privacy-preserving. Automation can help later, but no AI or vendor integration should become a V1 dependency.

Required for private beta:

- [ ] Tier 0: unverified / waitlist is documented.
- [ ] Tier 1: basic email verified is documented.
- [ ] Tier 2: aviation work email verified is documented.
- [ ] Tier 3: manual document or badge verified is documented.
- [ ] Tier 4: peer-vouched by verified members is documented as gated/supplemental.
- [ ] Tier 5: employment/payroll/API verified later is documented as later-stage only.
- [ ] V1 supports only practical verification paths: basic email, aviation work email where available, and manual review.
- [ ] Manual verification review workflow exists before real verification uploads are accepted.
- [ ] Admin verification dashboard exists or private beta has a documented manual admin process.
- [ ] Verification rejection and request-more-info states are defined.
- [ ] Work-email privacy caveat is disclosed to users before they use work email verification.
- [ ] Verification document retention/deletion policy exists before accepting real uploads.
- [ ] Verification artifact access is limited to authorized admins.
- [ ] Verification decisions are logged.
- [ ] No AI approves verification.

Required before public launch:

- [ ] Verification evidence handling has been privacy-reviewed.
- [ ] Tier 4 peer-vouching abuse risks are reviewed before enablement.
- [ ] Tier 5 vendor/API verification has a documented vendor-risk review if pursued.

## 3. Privacy Gate

The product must protect aviation identity, public anonymity, verification evidence, and location-sensitive crew information.

Required for private beta:

- [ ] Private identity is separated from public handle.
- [ ] Public handle can be shown without revealing private verification evidence.
- [ ] Anonymous posting remains accountable internally.
- [ ] Admins can enforce policy against the underlying account.
- [ ] Sensitive user fields are access-controlled.
- [ ] Verification artifacts are stored privately.
- [ ] Verification artifacts use short-lived admin access links.
- [ ] Verification artifact access is logged.
- [ ] Deletion policy is defined.
- [ ] Export policy is defined, even if manual for private beta.
- [ ] Exact crew hotel exposure is blocked by policy and product copy.
- [ ] Live location tracking is blocked by policy and product scope.
- [ ] Live schedule/location tracking is not implemented.
- [ ] Passenger private information is banned from user content.

Required before public launch:

- [ ] Privacy policy is drafted and reviewed.
- [ ] Terms of service are drafted and reviewed.
- [ ] Account deletion workflow is operational.
- [ ] Data export workflow is operational or a manual support process is documented.
- [ ] Retention windows are implemented or operationally enforceable.

## 4. Aviation Safety Gate

jmpseat must treat aviation privacy and security-sensitive information as product constraints, not afterthoughts.

Required for private beta:

- [ ] Banned content policy covers passenger private information.
- [ ] Banned content policy covers airport security procedures.
- [ ] Banned content policy covers live operations-sensitive information.
- [ ] Banned content policy covers confidential internal company documents unless explicitly public/allowed.
- [ ] Banned content policy covers exact public crew hotel exposure.
- [ ] Banned content policy covers doxxing.
- [ ] Banned content policy covers harassment.
- [ ] Banned content policy covers threats.
- [ ] Banned content policy covers impersonation.
- [ ] Banned content policy covers vendor spam.
- [ ] Banned content policy covers unsafe meetup pressure.
- [ ] Content surfaces include user-facing reminders where aviation-sensitive risk is likely.
- [ ] Emergency escalation category exists for safety/security issues.

Required before public launch:

- [ ] Emergency escalation handling has assigned owners and response expectations.
- [ ] Admin operating guide includes examples of aviation-sensitive violations.
- [ ] High-risk content categories are included in moderator training.

## 5. Moderation Gate

Moderation must exist before beta because anonymous worker communities can create safety, privacy, and harassment risks.

Required for private beta:

- [ ] User reporting workflow exists.
- [ ] Report categories exist.
- [ ] Admin moderation queue exists or a controlled manual queue exists for private beta.
- [ ] Reports can target posts.
- [ ] Reports can target comments.
- [ ] Reports can target users/profiles.
- [ ] Reports can target deals/vendors where deals exist.
- [ ] Automated risk flags are planned or implemented for high-risk categories.
- [ ] Automated risk flags do not automatically ban users.
- [ ] Strike system is documented.
- [ ] Takedown workflow is documented.
- [ ] Appeal workflow is documented, even if manual for private beta.
- [ ] Emergency escalation workflow is documented.
- [ ] Admin actions are logged.
- [ ] Moderation notes are admin-only.
- [ ] Base/room moderator model is explicitly deferred or phased.

Required before public launch:

- [ ] Moderator coverage schedule is defined.
- [ ] Appeals process has a user-facing path.
- [ ] Repeat-offender and ban-evasion handling are documented.
- [ ] Base/room moderator permissions are designed before any non-admin moderators are added.

## 6. AI Safety Gate

AI should turn community knowledge into useful outputs. AI is not the brand gimmick and cannot be the final authority for safety, verification, or bans.

Required for private beta:

- [ ] All AI calls are server-side only.
- [ ] AI API keys are not exposed client-side.
- [ ] Structured outputs are used where practical.
- [ ] Retrieved community content is treated as untrusted.
- [ ] Prompt-injection testing is included before beta.
- [ ] Deterministic banned-category checks exist outside the model or are documented as a beta blocker.
- [ ] Jumpseat Brief cannot write posts.
- [ ] AI cannot auto-post on behalf of users.
- [ ] AI cannot approve verification.
- [ ] AI cannot issue final moderation bans.
- [ ] AI cannot expose sensitive/private data.
- [ ] AI cannot provide aviation security procedures.
- [ ] Human review is required for verification decisions.
- [ ] Human review is required for final bans.
- [ ] Human review is required for high-impact moderation outcomes.
- [ ] AI safety flags/refusals are logged without over-retaining sensitive prompts.

Required before public launch:

- [ ] AI output quality has been reviewed against real beta examples.
- [ ] AI safety review includes passenger data, exact hotel exposure, live operations-sensitive information, and airport security procedures.
- [ ] AI cost and abuse limits are defined.

## 7. Security Gate

The beta must meet a practical security baseline before real users and verification evidence are accepted.

Required for private beta:

- [ ] OWASP Top 10 is the implementation baseline.
- [ ] OWASP ASVS is the secure development reference.
- [ ] Broken access control is treated as the highest-risk category.
- [ ] RLS is required for exposed tables.
- [ ] Server-side authorization checks are required in addition to RLS.
- [ ] Service role / secret keys are never exposed to clients.
- [ ] Centralized authorization helpers are planned for account status, room access, admin actions, and anonymous posting eligibility.
- [ ] API schema validation is required at route/action boundaries.
- [ ] Secure error handling is required and avoids leaking sensitive internals.
- [ ] Authentication failures are logged.
- [ ] Authorization denials are logged.
- [ ] Admin actions are logged.
- [ ] Dependency scanning is required.
- [ ] Secret scanning is required.
- [ ] GitHub Actions or CI security practices are planned before deployment.
- [ ] CI tokens and workflow permissions follow least privilege.
- [ ] Security headers are planned, including CSP and appropriate cookie settings.

Required before public launch:

- [ ] RLS/access-control tests pass for unverified, verified, restricted, suspended, admin, and moderator-like states.
- [ ] Dependency audit has no unaccepted high/critical findings.
- [ ] Secret scan has no unresolved findings.
- [ ] Security review has no unaccepted high/critical findings.
- [ ] Incident response plan exists for credential leak, verification artifact exposure, passenger-data exposure, and emergency safety/security escalation.

## 8. Upload Security Gate

Verification uploads are sensitive and should not be accepted until file handling is safe enough for real user documents.

Required for private beta:

- [ ] Verification uploads enforce allowed file types.
- [ ] Verification uploads enforce size limits.
- [ ] Verification uploads validate content type.
- [ ] Verification uploads validate file signatures where practical.
- [ ] Verification uploads use private storage only.
- [ ] Uploaded files are renamed on storage.
- [ ] Uploaded files are not served from public paths.
- [ ] Uploaded files use short-lived admin links.
- [ ] Uploaded file access is logged.
- [ ] Malware scanning is evaluated before beta or a documented deferred decision exists.
- [ ] Admin preview/download behavior avoids executing active content.
- [ ] No AI processing of verification documents in V1.

Required before public launch:

- [ ] Malware scanning decision is implemented or explicitly accepted with risk owner.
- [ ] Upload rejection events are logged as SecurityEvents.
- [ ] Retention/deletion automation exists or a manual process is documented and tested.

## 9. Accessibility Gate

The beta should be usable by keyboard and assistive technology users across core flows.

Required for private beta:

- [ ] WCAG 2.2 AA is the target.
- [ ] Keyboard navigation works across auth.
- [ ] Keyboard navigation works across verification.
- [ ] Keyboard navigation works across posting/commenting.
- [ ] Keyboard navigation works across reporting.
- [ ] Keyboard navigation works across search.
- [ ] Keyboard navigation works across admin queues.
- [ ] Semantic HTML is required.
- [ ] Color contrast meets WCAG 2.2 AA.
- [ ] Visible focus states are present.
- [ ] Form labels are programmatically associated.
- [ ] Errors are screen-reader-friendly.
- [ ] Status messages are screen-reader-friendly.
- [ ] Accessible authentication is supported: password managers and copy/paste are not blocked.

Required before public launch:

- [ ] Accessibility review is completed on all public launch flows.
- [ ] Known accessibility defects are triaged with severity and owner.

## 10. Data Model Gate

The data model must support the MVP without accidentally modeling excluded V1 features.

Required for private beta:

- [ ] User is accounted for.
- [ ] Profile is accounted for and separated from private verification evidence.
- [ ] Verification is accounted for with status, method, tier, reviewer, and retention metadata.
- [ ] TrustLevel is accounted for.
- [ ] Airline is accounted for.
- [ ] Role is accounted for.
- [ ] Base is accounted for.
- [ ] Airport is accounted for.
- [ ] CrewRoom is accounted for.
- [ ] Post is accounted for.
- [ ] Comment is accounted for.
- [ ] SavedItem is accounted for.
- [ ] LayoverBoard is accounted for.
- [ ] Deal is accounted for.
- [ ] Vendor is accounted for.
- [ ] Report is accounted for.
- [ ] ModerationAction is accounted for.
- [ ] AIBrief is accounted for.
- [ ] SecurityEvent is accounted for.
- [ ] UploadArtifact is accounted for.
- [ ] Subscription is explicitly deferred because V1 does not include payments.
- [ ] AuditLog is accounted for either as a distinct entity or explicitly covered by SecurityEvent, ModerationAction, and verification decision history.
- [ ] Sensitive entities have privacy/security notes: User, Profile, Verification, TrustLevel, Report, ModerationAction, AIBrief, SecurityEvent, UploadArtifact.
- [ ] The model does not include airline portal credentials.
- [ ] The model does not include scraped schedules.
- [ ] The model does not include live crew location records.
- [ ] The model does not include flight-load request infrastructure.
- [ ] The model does not include roster/calendar integrations.

Required before public launch:

- [ ] Data retention fields are reviewed and tested.
- [ ] Audit trail coverage is reviewed for verification, moderation, upload, admin, and AI safety events.
- [ ] Subscription model is designed before any paid subscription work begins.

## 11. Monetization Gate

Early monetization must reinforce utility and trust rather than pushing the product toward tracking, feed engagement, or spam.

Required for private beta:

- [ ] Display ads are not the primary early revenue model.
- [ ] V1 monetization does not create privacy/security risk.
- [ ] NonRev Deals are admin-created or admin-reviewed.
- [ ] Sponsored deals are clearly labeled.
- [ ] Affiliate relationships are disclosed where present.
- [ ] Vendor listings are controlled through moderation/admin review.
- [ ] Vendors cannot scrape member data.
- [ ] Vendors cannot access private member identity.
- [ ] Paid visibility does not affect member credibility.

Required before public launch:

- [ ] Sponsored deal policy is finalized.
- [ ] Vendor complaint/removal process is documented.
- [ ] Payment processing is not enabled until Stripe/payment security planning is complete.

## 12. Beta Launch Gate

Beta should launch only when the product is controlled, observable, reversible, and adequately moderated.

Minimum readiness criteria:

- [ ] At least two admin users are configured.
- [ ] Admin access uses stronger controls than ordinary users.
- [ ] Moderation coverage schedule is defined for private beta.
- [ ] Emergency escalation owner is defined.
- [ ] Verification review owner is defined.
- [ ] Seed content exists for initial Crew Rooms.
- [ ] Seed content exists for initial Base Boards.
- [ ] Seed content exists for initial Layover Boards.
- [ ] Initial NonRev Deals entries are reviewed.
- [ ] Test users cover unverified, email verified, pending verification, verified, restricted, suspended, and admin states.
- [ ] Verification testing covers work email path.
- [ ] Verification testing covers manual review path if manual uploads are enabled.
- [ ] Reporting and moderation have been tested end to end.
- [ ] Jumpseat Brief has been tested against banned categories.
- [ ] Security review is completed.
- [ ] Accessibility review is completed.
- [ ] Privacy review is completed.
- [ ] Rollback plan is documented.
- [ ] User support/contact path exists.
- [ ] Known limitations are documented for beta users.

Do not launch beta if:

- [ ] Verification artifacts are accepted without a retention/deletion policy.
- [ ] Verification artifacts are publicly accessible.
- [ ] Admin verification review is unavailable.
- [ ] Reporting or moderation queue is unavailable.
- [ ] Emergency escalation category is missing.
- [ ] Anonymous posting cannot be tied to an internal account for enforcement.
- [ ] RLS/server-side authorization has not been tested.
- [ ] AI can approve verification or issue final bans.
- [ ] Jumpseat Brief can output exact crew hotel exposure, passenger private information, airport security procedures, or live operations-sensitive information.
- [ ] V1 includes airline portal login, schedule scraping, public nearby crew tracking, dating/swiping, flight-load requests, native mobile, full marketplace payments, advanced employment verification APIs, or roster/calendar integrations.
- [ ] Legal/trademark status is represented as cleared.

## 13. Open Questions Before Beta

These decisions must be answered before real users are invited.

- [ ] What is the exact verification-document retention period?
- [ ] Are manual badge uploads accepted in private beta, or is private beta limited to work email/manual non-upload review?
- [ ] What is the target first base/community?
- [ ] What is the initial ambassador strategy?
- [ ] Who are the first 50 beta users?
- [ ] What is the legal/trademark clearance path for the jmpseat working name?
- [ ] Who drafts privacy policy and terms of service?
- [ ] Are crash pad listings excluded from V1 and held for Phase 2, or included only as discussion without listings/payments?
- [ ] Who owns emergency escalation during private beta?
- [ ] What are the admin response-time expectations for verification and reports?
- [ ] What exact content is seeded before beta?

## 14. Beta Acceptance Checklist

### Required for Private Beta

Product and scope:

- [ ] V1 scope reviewed against MVP_SCOPE.md.
- [ ] Excluded V1 features verified absent.
- [ ] Utility-first surfaces are usable: Crew Rooms, Base Boards, Layover Boards, search, saves, Jumpseat Brief, and deals directory.

Verification:

- [ ] Tier model reviewed.
- [ ] Practical V1 verification paths enabled or manually operable.
- [ ] Manual review process tested.
- [ ] Verification retention/deletion policy approved.
- [ ] No AI verification approval.

Privacy and safety:

- [ ] Private identity and public handle are separated.
- [ ] Anonymous posting is internally accountable.
- [ ] Exact crew hotel exposure is blocked.
- [ ] Live location tracking is absent.
- [ ] Passenger private information policy is visible to admins and moderators.
- [ ] Emergency escalation category exists.

Moderation:

- [ ] Reporting flow tested.
- [ ] Admin moderation queue tested.
- [ ] Takedown workflow tested.
- [ ] Appeal path documented.
- [ ] Admin action logging exists.

AI:

- [ ] Server-side AI only.
- [ ] Structured output plan implemented where practical.
- [ ] Prompt-injection and sensitive-output tests completed.
- [ ] Human review boundaries confirmed.

Security:

- [ ] OWASP/ASVS review completed.
- [ ] RLS plus server-side authorization tested.
- [ ] API validation required.
- [ ] Secure errors required.
- [ ] Dependency scan completed.
- [ ] Secret scan completed.
- [ ] CI/security practices reviewed.

Uploads:

- [ ] File type and size validation tested.
- [ ] Private storage tested.
- [ ] Short-lived admin links tested.
- [ ] Malware scanning decision documented.
- [ ] No AI processing of verification documents.

Accessibility:

- [ ] WCAG 2.2 AA review completed for auth.
- [ ] WCAG 2.2 AA review completed for verification.
- [ ] WCAG 2.2 AA review completed for posting/reporting/search.
- [ ] WCAG 2.2 AA review completed for admin queues.

Operations:

- [ ] Admin users configured.
- [ ] Moderator/admin coverage schedule defined.
- [ ] Seed content loaded.
- [ ] First beta user list approved.
- [ ] Support/contact process exists.
- [ ] Rollback plan documented.

### Required Before Public Launch

Product:

- [ ] Beta feedback reviewed.
- [ ] Scope drift review completed.
- [ ] Public launch feature set re-approved.

Legal and policy:

- [ ] Legal/trademark clearance path advanced; no public claim of clearance unless confirmed by counsel.
- [ ] Privacy policy finalized.
- [ ] Terms of service finalized.
- [ ] Community guidelines finalized.

Security and privacy:

- [ ] High/critical security findings fixed or formally accepted.
- [ ] Retention/deletion automation tested.
- [ ] Export/deletion support path tested.
- [ ] Incident response plan finalized.

Moderation:

- [ ] Public-launch moderation coverage defined.
- [ ] Appeals process operational.
- [ ] Moderator training material completed.

Accessibility:

- [ ] Public launch flows reviewed for WCAG 2.2 AA.
- [ ] Known accessibility issues triaged.

Monetization:

- [ ] Sponsored deal policy finalized.
- [ ] Vendor review/removal process finalized.
- [ ] No payments launched without payment-specific security review.

Data model:

- [ ] Subscription remains deferred or is designed before payment work begins.
- [ ] AuditLog strategy is explicit: distinct AuditLog entity or covered by SecurityEvent, ModerationAction, and verification decision history.
