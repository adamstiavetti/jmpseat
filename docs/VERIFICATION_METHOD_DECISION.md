# Verification Method Decision

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

jmpseat must verify that private spaces are limited to real airline workers and, where needed later, airline-specific, base-specific, or role-specific members.

Verification must be strong enough to support trust and safety without becoming legally reckless, privacy-invasive, or operationally careless.

This document defines the initial verification-method direction before implementation begins.

This is a planning decision only. It does not implement uploads, storage, review tooling, claims issuance, or AI systems.

## 2. Initial Approved Verification Methods

The initial jmpseat verification model will support:

1. airline work-email verification where available
2. redacted badge or proof upload with human review
3. future optional peer vouching as a later possibility, not initial core
4. future AI-assisted pre-check as advisory only, not final approval

### Initial core methods

#### Airline work-email verification

- high-confidence path where an airline or aviation employer provides a usable work email
- useful for confirming an airline-affiliation claim
- not every airline worker will have this option
- not every airline worker will want to use this option

#### Redacted badge or proof upload with human review

- initial manual proof path for workers who do not have or do not want to use work email verification
- supports broader role coverage across flight attendants, pilots, gate agents, ramp agents, dispatchers, schedulers, airport ops, and related workers
- requires human review and privacy controls

### Later, not initial core

#### Peer vouching

- may become a supplemental trust signal later
- is not an initial core verification method
- must not be the only unknown-user verification path

#### AI-assisted pre-check

- may be considered later as an advisory aid for reviewer efficiency
- may help classify submission completeness or flag likely issues
- must not be the final approval authority unless a later policy explicitly permits that change

## 3. Explicitly Prohibited Verification Method

jmpseat must not ask or permit reviewers to access employer systems, crew scheduling tools, internal directories, employee databases, company portals, or confidential employer resources to verify applicants unless jmpseat has explicit written authorization from that employer.

Reviewer decisions must be based only on:

- submitted proof
- verified email-domain evidence
- user-provided information
- permitted personal knowledge
- approved jmpseat review workflows

This prohibition exists to avoid:

- unauthorized access to employer systems
- improper handling of confidential information
- reviewers improvising unsafe verification practices
- false claims of employer affiliation or endorsement

## 4. Email Verification Model

Airline work-email verification is a high-confidence method where available.

Required model:

- it should verify access to an approved airline or aviation-employer domain
- it must not expose the work email publicly
- it confirms an airline-affiliation claim, not full app access by itself
- it must remain separate from login email if the user chooses a personal email for their account

Important limits:

- not all airline workers will have a company email
- some workers may have a company email but reasonably refuse to use it because of privacy concerns
- work-email verification alone should not be treated as the same thing as auth identity, profile completion, or beta approval

## 5. Badge Or Proof Upload Model

User-submitted proof is allowed for the initial verification direction.

Users should be instructed to redact:

- employee ID numbers
- barcode or QR codes
- badge backside information
- security-sensitive markings
- unnecessary personal details

Required handling model:

- raw proof should be stored privately
- access should be limited to authorized reviewers
- raw proof should be retained only as long as necessary for review
- minimal verification result metadata should be stored after review
- raw proof should be deleted or expired after review according to a retention policy

Important boundary:

- badge or proof upload verifies a claim
- it is not the same thing as auth identity
- it is not the same thing as beta access

## 6. Claims-Based Authorization Model

Verification should produce approved claims that later authorization can use.

Examples:

- `airline_worker`
- `airline: United`
- `airline: Delta`
- `airline: Southwest`
- `role: Flight Attendant`
- `role: Pilot`
- `role: Gate Agent`
- `role: Ramp`
- `base: DEN`
- `base: IAH`

Authorization implication:

- rooms and private areas should require approved claims rather than trusting self-selected profile fields
- self-selected profile values may help onboarding and routing, but they must not be treated as authoritative verification by themselves

This keeps:

- profile data separate from verification outcomes
- verification reusable across web and future mobile
- authorization based on approved claims rather than client-entered assertions

## 7. Verification Levels

Initial conceptual verification levels:

- `account_only`
- `airline_worker_verified`
- `airline_specific_verified`
- `role_base_verified`
- `reviewer_or_admin_trusted_role`

Meaning:

- `account_only`: account exists, but worker verification is not complete
- `airline_worker_verified`: user is verified as an airline or aviation worker at a broad level
- `airline_specific_verified`: user is verified against a specific airline or aviation employer claim
- `role_base_verified`: user is verified strongly enough to support role-specific or base-specific access where later required
- `reviewer_or_admin_trusted_role`: privileged reviewer/admin status for later controlled operations

Not all levels need to be implemented immediately.

The purpose of this level model is to guide later authorization and review design, not to force premature implementation complexity.

## 8. Human Review Requirements

Human review is required for badge or proof approval.

Required review rules:

- reviewers must see only the minimum necessary information
- reviewer actions should be auditable
- reviewers cannot approve themselves
- reviewer scope should be limited by role, airline, or base where applicable later
- reviewers must follow the no-employer-system-lookup rule

Human review remains required for final approval decisions under this initial policy.

AI, if introduced later, may assist with preparation or triage only unless a later policy explicitly changes that rule.

## 9. Privacy And Legal-Risk Controls

Required controls:

- collect the minimum proof necessary
- disclose what is collected and why
- do not store proof longer than needed
- do not expose proof to normal users
- do not expose employee IDs or badge numbers
- do not make public claims that verification is perfect or employer-endorsed
- jmpseat remains independent and unaffiliated with airlines or employers unless formal partnerships exist

Additional guardrails:

- verification proof must not be used as a general-purpose identity archive
- verification handling should avoid collecting confidential employer information that is unnecessary for the review decision
- reviewers should avoid retaining proof outside approved jmpseat workflows

## 10. Relationship To Epoch 03

This decision does not change the existing Epoch 03 boundary.

Required interpretation:

- `E03-T03` should implement auth foundation only
- `E03-T04` should implement account/profile foundation
- `E03-T05` and `E03-T06` should implement beta access and gating
- full airline-worker verification workflow, including badge upload, storage, review, claims, and retention, belongs to a later verification ticket or epoch unless explicitly reticketed
- Epoch 03 work must not collapse auth, beta access, and worker verification into one state

Auth, beta access, and worker verification remain separate concerns:

- auth proves account/session control
- beta access proves private-beta entry approval
- verification proves worker claims

## 11. Future Implementation Considerations

The following items must be decided later before verification implementation:

- approved airline email domains
- proof upload file types and size limits
- proof retention period
- reviewer queue design
- AI pre-check provider and policy
- claim expiration or reverification schedule
- appeals and resubmission flow
- abuse and fraud handling
- audit-event retention

## 12. Status

Decision status: approved for planning.

Outcome:

- initial verification methods are defined
- employer-system lookup is explicitly prohibited
- claims-based authorization direction is defined
- auth, beta access, and worker verification remain separate
