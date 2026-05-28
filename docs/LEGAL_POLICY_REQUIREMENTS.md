# Legal Policy Requirements

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This document does not claim legal or trademark clearance.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

This is a documentation-only requirements checklist for founder, engineering, security, and legal/policy review. It is not legal advice, does not draft production legal terms, and does not expand V1 scope.

## 1. Purpose and Non-Legal-Advice Disclaimer

Deadhead Club needs policy decisions before collecting real user data, accepting aviation-worker verification, enabling anonymous discussion, publishing AI outputs, or showing sponsored deals. This document converts current product plans and public research into reviewable requirements.

Production Terms of Service, Privacy Policy, Community Guidelines, verification consent language, advertising disclosures, incident response procedures, and trademark decisions require qualified legal review or an explicitly assigned policy owner before launch.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Internal policy requirements checklist | Use this doc as an internal planning checklist only, not as user-facing legal terms. | FTC business guidance separates practical security/privacy practices from company-specific legal drafting; USPTO guidance does not substitute for legal clearance. | High | Yes | Yes | Founder, attorney, policy owner | Keep all user-facing legal documents separately reviewed. |
| Non-legal-advice disclaimer | State that production legal documents require qualified legal review. | USPTO and FTC materials provide public guidance but do not clear a mark or draft platform policies. | High | Yes | Yes | Attorney | Do not present this document as counsel-reviewed unless that review occurs. |
| Working-name caveat | Treat "Deadhead Club" as a working name until trademark/brand clearance is documented. | USPTO likelihood-of-confusion guidance and trademark basics. | High | Yes | Yes | Founder, attorney | No public launch under the name until clearance decision is documented. |
| No official affiliation claim | Public copy and policies must say the product is not affiliated with, endorsed by, or officially connected to any airline unless that becomes true. | FTC advertising guidance on clear, non-misleading claims; product safety positioning. | High | Yes | Yes | Founder, attorney | Avoid airline logos or marks without permission. |

## 2. Required Policy Artifacts

These are not final documents. They are artifacts that need owners, review, and version control before real users rely on the product.

| Checklist item | Purpose | Why Deadhead Club needs it | Recommended minimum contents | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Terms of Service | Define account rules, permitted use, disclaimers, user content rights, enforcement, and dispute basics. | The product hosts anonymous worker discussion, AI outputs, user content, verification, and vendor/deal information. | Eligibility, account responsibility, prohibited conduct, no airline affiliation, user content license, moderation rights, beta limitations if applicable, AI limitations, vendor/deal disclaimers, termination, dispute/legal owner sections. | FTC clear-claims guidance; Blind community/product precedent; platform risk profile. | High | No, use beta terms minimum | Yes | Attorney | Do not draft as production terms without counsel. |
| Privacy Policy | Explain collection, use, sharing, retention, deletion/export, security, and user rights. | Verification, private identity, public handles, reports, AI logs, and admin actions create sensitive data flows. | Data categories, purposes, retention, access controls, verification artifact handling, AI processing, cookies/analytics, deletion/export request process, contact channel, state privacy rights where applicable. | FTC Start with Security; FTC Protecting Personal Information; NIST Privacy Framework; CCPA official resources. | High | Use privacy notice minimum | Yes | Attorney, security reviewer | State-law applicability requires review. |
| Community Guidelines | Set user-facing content and behavior rules. | Anonymous aviation-worker communities need clear rules before posting is enabled. | No doxxing, harassment, threats, passenger private info, airport security procedures, live operations-sensitive info, exact crew hotel exposure, confidential documents, impersonation, vendor spam, dating/swiping, unsafe meetup pressure, illegal facilitation. | Blind community guidelines; TSA SSI guidance; existing Trust and Safety doc. | High | Yes | Yes | Policy owner, attorney | Include aviation-specific examples. |
| Verification Consent Language | Explain verification data collection and review. | Users must understand what is collected, why, who reviews it, and when artifacts are deleted. | Method-specific consent, work-email caveat, upload redaction instructions, reviewer access, retention/deletion, metadata retained, no AI review, revocation/re-review path. | StaffTraveler verification support; Blind FAQ; SheerID, Truework, Argyle, Atomic vendor docs; FTC privacy guidance. | High | Yes | Yes | Attorney, security reviewer | Exact retention period remains open. |
| AI Disclaimer / AI Use Notice | Explain when AI is used and its limits. | Jumpseat Brief and later AI summaries can produce imperfect or unsafe outputs if unchecked. | AI feature scope, limitations, no safety/security/professional reliance, user feedback/reporting, no sensitive data submission, human review boundaries, AI logs summary. | NIST AI RMF; OWASP LLM Top 10; OpenAI structured outputs and moderation docs. | High | Yes if AI enabled | Yes | Policy owner, engineer | Demo-only AI still needs careful wording. |
| User Content Policy | Define ownership, license, deletion behavior, and moderation rights. | Posts, comments, board intel, AI summaries, and anonymous content need predictable handling. | User ownership, platform display/process license, anonymous content handling, deletion limits, removed-content handling, AI summarization permission if enabled, prohibited content. | FTC consumer clarity principles; community platform norms; OpenAI/NIST AI risk guidance for summaries. | Medium | Yes | Yes | Attorney | Counsel should draft exact license terms. |
| Moderator Policy | Define admin/moderator authority and limits. | Anonymous discussion requires consistent enforcement and auditability. | Role permissions, conflict-of-interest rule, ambassador is not moderator by default, action categories, audit logging, appeals, emergency escalation, access limits to private identity and artifacts. | OWASP logging guidance; Trust and Safety plan; Blind guidelines. | High | Yes | Yes | Policy owner, security reviewer | Volunteer/base moderator model remains deferred. |
| Vendor / Sponsored Deals Policy | Govern deals, affiliate links, sponsored placement, and vendor conduct. | NonRev Deals may create advertising, spam, scam, and disclosure risks. | Sponsored/affiliate labels, vendor review, offer accuracy, removal rights, no misleading offers, no unmoderated vendor posts, no full marketplace payments in V1. | FTC endorsement, native advertising, and dot-com disclosure guidance. | High | No, unless deals are live | Yes before monetized deals | Attorney, founder | Required before any paid placement or affiliate revenue. |
| Beta Participation Terms | Set expectations for invite-only beta. | Private beta users need clear expectations before real data and content are collected. | Beta status, bugs/changes, invite-only access, verification expectation, safety rules, feedback consent, removal rights, no airline affiliation, escalation contact. | FTC clear disclosures; private beta operating plan; privacy/security guidance. | High | Yes | No, replaced by full terms | Attorney, founder | Lightweight but reviewed terms are enough for private beta. |
| Trademark / Brand Clearance Memo | Document name-risk review and go/no-go decision. | The repo uses a working name with aviation and cultural meanings. | USPTO search results, common-law search notes, class/goods review, domain/social conflicts, counsel recommendation, decision owner. | USPTO trademark basics, search, and likelihood-of-confusion guidance. | High | No, but path required | Yes | Attorney | Public launch blocked until decision is documented. |
| Incident Response Policy | Define response to security, privacy, safety, and aviation-sensitive incidents. | Verification artifacts, private identity, passenger info, airport security content, and account compromise need a response path. | Contacts, severity categories, evidence preservation, takedown, notification decision path, response timing, postmortem, audit logs. | NIST Cybersecurity Framework; FTC security guidance; OWASP logging cheat sheet. | High | Yes, lightweight | Yes, full process | Security reviewer, attorney | Must include verification artifact mishandling. |

## 3. Private Beta Minimum Policy Set

Private beta should not start with real users until a lightweight but explicit policy set exists. It can be shorter than public-launch legal terms, but it must be clear enough for consent, safety, and moderation.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Beta participation terms | Create invite-only beta terms before first real user invite. | FTC disclosure guidance; private beta operating plan. | High | Yes | No | Attorney, founder | Can later be replaced by full Terms of Service. |
| Privacy notice | Publish or provide a beta privacy notice before waitlist-to-beta conversion. | FTC privacy/security guidance; NIST Privacy Framework; CCPA resources for user-right awareness. | High | Yes | Yes | Attorney | Must cover verification artifacts and anonymous/internal identity split. |
| Community rules | Use short user-facing rules plus admin examples. | Blind guidelines; TSA SSI guidance; current Trust and Safety doc. | High | Yes | Yes | Policy owner | Required before posts/comments are enabled. |
| Verification consent | Show consent before collecting work email or manual evidence. | StaffTraveler and Blind verification patterns; verification vendor consent models. | High | Yes | Yes | Attorney, security reviewer | Do not collect uploads until artifact handling is ready. |
| AI use notice | Required if Jumpseat Brief is live; optional if only static demos are shown. | NIST AI RMF; OWASP LLM Top 10; OpenAI docs. | High | Yes if AI enabled | Yes | Policy owner, engineer | Demo-only examples should still avoid overclaiming. |
| No-official-affiliation disclaimer | Include in beta invite, footer, and verification flow. | FTC non-misleading claim principles. | High | Yes | Yes | Founder, attorney | Do not use airline marks as endorsement signals. |
| Emergency/safety escalation process | Provide a report category and monitored owner for aviation/security-sensitive issues. | TSA SSI guidance; NIST incident response functions; Trust and Safety plan. | High | Yes | Yes | Policy owner, security reviewer | Private beta can be manual but must have an owner. |
| Name-clearance status note | State working-name status in beta materials. | USPTO trademark guidance. | High | Yes | Yes | Attorney | Do not claim trademark clearance. |

## 4. Public Launch Minimum Policy Set

Public launch requires more complete policy coverage because the audience, content volume, data rights requests, moderation scale, and monetization exposure increase.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Full Terms of Service | Counsel-reviewed terms must replace beta-only terms. | FTC disclosure principles; user-generated-content platform risk. | High | No | Yes | Attorney | Include eligibility and excluded V1 feature boundaries. |
| Full Privacy Policy | Publish reviewed privacy policy before broad access. | FTC; NIST Privacy Framework; state privacy resources. | High | Lightweight notice | Yes | Attorney, security reviewer | Applicability of state privacy laws needs counsel review. |
| Community Guidelines | Public, enforceable, and linked from posting/reporting flows. | Blind guidelines; TSA SSI. | High | Yes | Yes | Policy owner | Include aviation-specific examples. |
| Moderation rules and appeal process | Provide a clear enforcement and appeal path. | OWASP logging; trust/safety best practices from existing docs. | High | Lightweight manual path | Yes | Policy owner | Appeals can be manual, but path must exist. |
| Vendor/sponsored content rules | Require labels and admin approval before paid or affiliate deals. | FTC endorsement/native advertising/dot-com disclosure guidance. | High | If monetized deals live | Yes before monetized deals | Attorney, founder | Do not allow self-serve vendor posting in V1. |
| Data deletion/export process | Provide a user request channel and operational workflow. | FTC data minimization/security; NIST Privacy Framework; CCPA resources. | Medium | Manual process | Yes | Attorney, engineer | Exact legal obligations depend on entity, users, and thresholds. |
| Incident response process | Document security, privacy, content-safety, and aviation-sensitive response. | NIST CSF; FTC security; OWASP logging. | High | Lightweight | Yes | Security reviewer | Include artifact mishandling and account compromise. |
| Trademark/name clearance decision | Document counsel-reviewed decision before public launch. | USPTO trademark search and likelihood-of-confusion guidance. | High | Path only | Yes | Attorney | Do not launch publicly on an uncleared brand. |

## 5. Trademark / Name Clearance Requirements

"Deadhead Club" remains a working name only. No document in this repository states or implies that the mark is available, registerable, or legally cleared.

Questions for counsel:

- Is the exact mark available for the relevant goods and services?
- Are there confusingly similar marks in software, online social networking, aviation, travel, recruiting, marketplace, apparel, or merch?
- Are there domain, app-store, or social handle conflicts?
- Are there common-law users not visible in USPTO search results?
- Is "Deadhead" descriptive in an aviation context?
- Does the Grateful Dead / "Deadhead" fan meaning create brand or legal risk?
- Should public copy use a different beta codename until clearance is complete?

Recommendation: no public launch under the name until a clearance decision is documented by counsel or the designated legal owner.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| USPTO search | Run counsel-reviewed USPTO search across relevant marks and classes. | USPTO trademark search and likelihood-of-confusion guidance. | High | No | Yes | Attorney | Founder can do preliminary search, but not rely on it as clearance. |
| Common-law and marketplace search | Search web, app stores, domains, social handles, aviation/travel marketplaces, and apparel/merch. | USPTO basics note rights can depend on use and confusion, not just exact registration. | Medium | No | Yes | Attorney, founder | Document methodology and date. |
| Aviation descriptiveness review | Ask counsel whether "deadhead" is descriptive or weak for aviation-worker services. | USPTO basics and likelihood-of-confusion principles. | Medium | No | Yes | Attorney | A descriptive term may affect protectability. |
| Public naming decision | Treat the name as provisional until clearance memo is complete. | USPTO guidance. | High | Working-name note required | Yes | Founder, attorney | Beta can use caveat; public launch should not. |

## 6. Privacy Requirements

Deadhead Club must avoid collecting sensitive data it does not need. V1 should not collect airline portal credentials, schedules, live location, passenger private information, exact crew hotel data, or unnecessary government ID data.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Data minimization | Collect only data needed for account, verification, profile, posting, moderation, AI feature operation, and safety. | FTC Protecting Personal Information; NIST Privacy Framework. | High | Yes | Yes | Founder, engineer, attorney | Do not collect sensitive waitlist documents. |
| Purpose limitation | State why each sensitive data type is collected and avoid secondary use without review. | NIST Privacy Framework; FTC privacy guidance. | High | Yes | Yes | Attorney, policy owner | Especially important for verification artifacts and AI logs. |
| Retention/deletion | Define retention windows before accepting uploads; delete raw verification artifacts after review unless documented safety/fraud reason exists. | FTC security guidance; NIST Privacy Framework. | High | Yes | Yes | Attorney, security reviewer | Proposed private-beta artifact deletion: immediately after review, no later than 7 days. |
| Access control | Restrict sensitive user fields, verification artifacts, reports, moderation notes, and admin logs. | FTC Start with Security; Supabase RLS/storage docs; OWASP ASVS. | High | Yes | Yes | Engineer, security reviewer | RLS plus server-side authorization remains required later. |
| Deletion/export requests | Provide at least a manual support process for private beta; operationalize before public launch. | NIST Privacy Framework; CCPA official resources where applicable. | Medium | Yes, manual | Yes | Attorney, engineer | Applicability and timing require counsel review. |
| Public/private identity separation | Store public handle separately from private identity and verification evidence. | Blind anonymous professional model; existing product principle. | High | Yes | Yes | Engineer, policy owner | Anonymous publicly does not mean anonymous to platform admins. |
| No risky V1 data collection | Block schedules, portal credentials, live location, passenger private info, exact crew hotel data, and non-rev load infrastructure. | FTC data minimization; TSA SSI; competitor research on roster/location risk. | High | Yes | Yes | Founder, engineer | Add product-copy reminders where users may try to submit this data. |

## 7. Verification Consent Requirements

V1 verification should rely on practical, privacy-aware methods: basic email, aviation work email where comfortable, and controlled manual review only when safe upload handling exists. Tier 5 employment/payroll/API verification remains later-stage.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| What is collected | Tell users the exact method-specific data: email domain, redacted badge/document evidence, reviewer decision metadata, or peer-vouch metadata. | StaffTraveler verification support; Blind FAQ; vendor verification docs. | High | Yes | Yes | Attorney, policy owner | Do not ask for employee numbers unless counsel approves. |
| Why collected | Explain that verification keeps Crew Rooms, Base Boards, and Layover Boards aviation-worker focused. | Product positioning; verification vendor consent patterns. | High | Yes | Yes | Founder | Avoid implying airline endorsement. |
| Reviewer access | Limit raw artifacts to authorized admins with logged access. | FTC Start with Security; OWASP logging; Supabase private storage docs. | High | Yes | Yes | Engineer, security reviewer | Ambassadors cannot review artifacts. |
| Retention and deletion | Delete raw artifacts after review unless a documented safety/fraud reason exists; retain minimal verification metadata. | FTC/NIST privacy guidance; private beta plan. | High | Yes | Yes | Attorney, security reviewer | Exact period requires legal review. |
| Revocation/re-review | Define when status can be revoked or re-reviewed: fraud, impersonation, role change, abuse, expired evidence, or user request. | Verification vendor workflow patterns; Trust and Safety plan. | Medium | Yes | Yes | Policy owner | Include appeal or correction path. |
| What users should not upload | Ban uploads of passport, government ID unless explicitly approved, full schedules, passenger data, portal screenshots with sensitive data, employee numbers, or confidential documents. | FTC minimization; TSA/aviation-sensitive guidance; StaffTraveler examples with redaction caution. | High | Yes | Yes | Attorney, security reviewer | Use redaction instructions before upload. |
| No AI approval | AI must not approve, reject, or score verification artifacts. | NIST AI RMF; OWASP LLM Top 10; product safety principle. | High | Yes | Yes | Engineer, policy owner | No AI processing of verification documents in V1. |
| Private beta manual review | Allow uploads only if private storage, validation, signed links, access logging, and deletion workflow exist; otherwise use work email or non-retained live/manual review. | OWASP file upload; Supabase storage; FTC security. | High | Yes | Yes | Founder, security reviewer | This is a beta blocker if manual uploads are required. |

## 8. Community Guidelines Requirements

Community rules should be short enough for users to understand and specific enough for admins to enforce. Anonymous posting should be permitted only where room rules allow it and remains accountable internally.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Doxxing, harassment, threats | Ban and enforce against identity exposure, targeted abuse, threats, hate, sexualized targeting, and retaliation. | Blind community guidelines; Trust and Safety doc. | High | Yes | Yes | Policy owner | Include emergency escalation for credible threats. |
| Passenger private information | Ban passenger names, photos, itineraries, medical details, incidents, seat/trip identifiers, and contact details. | FTC privacy guidance; AP reporting on passenger data scrutiny. | High | Yes | Yes | Policy owner, attorney | Remove quickly if posted. |
| Security and operations content | Ban airport security procedures, live operations-sensitive information, and safety-rule evasion. | TSA SSI guidance; 49 CFR Part 1520. | High | Yes | Yes | Policy owner, security reviewer | Add report category for aviation/security-sensitive content. |
| Confidential company documents | Ban non-public company documents, manuals, screenshots, memos, and systems unless explicitly public/allowed. | Blind guidelines; FTC/contract-risk reasoning. | Medium | Yes | Yes | Attorney, policy owner | Counsel should review edge cases such as public union/contract materials. |
| Impersonation and unsafe behavior | Ban impersonation, vendor spam, dating/swiping behavior, unsafe meetup pressure, and illegal activity facilitation. | Blind guidelines; FTC advertising guidance; product V1 exclusions. | High | Yes | Yes | Policy owner | Ambassadors cannot imply airline authority. |

## 9. Aviation-Sensitive Content Requirements

Deadhead Club should educate users that base and layover utility is welcome, but security-sensitive or privacy-sensitive operational detail is not.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Airport security procedures | Remove content that explains restricted procedures, screening bypasses, access controls, badge/security processes, or SSI-like information. | TSA SSI page; 49 CFR Part 1520. | High | Yes | Yes | Policy owner, security reviewer | When uncertain, hide pending review. |
| Crew hotel/location exposure | Ban exact public crew hotel exposure tied to airline, route, date, crew, or trip; allow generalized neighborhood safety and layover tips. | Crew hotel safety research; privacy-by-design; V1 exclusions. | High | Yes | Yes | Policy owner | Include examples in Layover Board guidelines. |
| Passenger private information | Treat passenger PII as high-risk content requiring takedown and possible escalation. | FTC privacy guidance; AP passenger data reporting. | High | Yes | Yes | Policy owner, attorney | Preserve minimal evidence internally if needed. |
| Live operational details | Ban live flight, crew, airport, irregular ops, security, or staffing details that could affect safety or operations. | TSA SSI principles; existing safety docs. | High | Yes | Yes | Policy owner | General retrospective work discussion may be allowed if anonymized and non-sensitive. |
| Internal company materials | Ban confidential internal company documents unless explicitly public or allowed. | Blind guidelines; legal-risk review. | Medium | Yes | Yes | Attorney, policy owner | Public contracts or public union materials need separate rule. |
| Emergency escalation | Create a safety/security report category with owner, response target, and takedown authority. | NIST CSF; TSA-sensitive content risk; Trust and Safety plan. | High | Yes | Yes | Founder, security reviewer | Private beta can use a manual escalation inbox. |

## 10. Moderation and Appeals Requirements

Moderation is a launch requirement, not a later community feature. The first version may be manually operated, but it needs clear authority, logs, and appeal paths.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Report workflow | Users must be able to report posts, comments, profiles, deals, and users with categories and notes. | Trust and Safety plan; OWASP logging for event capture. | High | Yes | Yes | Engineer, policy owner | Manual beta process acceptable if documented. |
| Admin review queue | Admins need a queue or controlled tracker with content, reporter, author, history, and action options. | Existing beta readiness docs; OWASP logging. | High | Yes | Yes | Engineer, policy owner | Admin-only access required. |
| Enforcement ladder | Use warning, strike, restriction, suspension, ban, and emergency escalation categories. | Trust and Safety plan; Blind guidelines. | High | Yes | Yes | Policy owner | Final bans require human review. |
| Takedown and appeals | Hide/remove content, preserve audit record, notify user where appropriate, and provide manual appeal path. | FTC fairness/clarity principles; OWASP logging. | Medium | Yes | Yes | Attorney, policy owner | Appeals process can be simple for beta. |
| Audit logging | Log moderation actions, verification reviews, sensitive access, appeal outcomes, and emergency escalations. | OWASP Logging Cheat Sheet; NIST CSF. | High | Yes | Yes | Engineer, security reviewer | Logs must avoid overexposing sensitive content. |
| Moderator conflict-of-interest | Ambassadors are not moderators by default; moderators cannot adjudicate conflicts involving themselves. | Trust and Safety plan; moderation best practice. | Medium | Yes | Yes | Policy owner | Volunteer moderator model is deferred. |

## 11. AI Policy Requirements

AI should turn community knowledge into useful outputs. It is not the brand gimmick and cannot be the final authority for verification, bans, or safety-sensitive decisions.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AI use disclosure | Tell users when Jumpseat Brief or other features use AI and what they should not rely on it for. | NIST AI RMF; OpenAI docs. | High | Yes if AI enabled | Yes | Policy owner, attorney | Required even in limited beta mode. |
| Server-side only | Keep AI calls and API keys server-side; no client-exposed model keys. | OpenAI API key safety docs; Next.js data security guidance. | High | Yes | Yes | Engineer, security reviewer | Use least-privilege tool access. |
| Structured outputs | Use structured outputs where practical for Jumpseat Brief and moderation assistance. | OpenAI structured outputs docs. | High | Yes if AI enabled | Yes | Engineer | Helps validate/refuse unsafe categories. |
| Retrieved content is untrusted | Treat community content as prompt-injection capable and apply filters outside the model. | OWASP LLM Top 10; NIST AI RMF. | High | Yes | Yes | Engineer, security reviewer | Hidden prompts are not a sufficient boundary. |
| Human review for high-impact outcomes | AI cannot approve verification, issue final bans, auto-post, or decide appeals. | NIST AI RMF; OWASP LLM Top 10; product rules. | High | Yes | Yes | Policy owner, engineer | AI may assist queue triage only. |
| Sensitive output limits | AI must not reveal private data, exact crew hotels, passenger info, live operations-sensitive info, or airport security procedures. | TSA SSI; FTC privacy; OWASP LLM sensitive disclosure risk. | High | Yes | Yes | Engineer, policy owner | Add user feedback/report button for bad AI output. |
| Logging and evaluation | Log model, feature, safety flags, refusal state, and user feedback without retaining unnecessary sensitive prompts. | OWASP logging; NIST AI RMF. | High | Yes if AI enabled | Yes | Engineer, security reviewer | Retention period requires review. |

## 12. User Content and Licensing Requirements

User content rules must preserve user ownership while giving Deadhead Club enough rights to operate, moderate, search, save, display, and summarize permitted content.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ownership | State that users own their submitted content subject to platform rights and policy enforcement. | Standard user-generated-content platform practice; FTC clarity principles. | Medium | Yes | Yes | Attorney | Counsel should draft exact language. |
| Platform license | Obtain limited license to host, display, search, moderate, process, and, where disclosed, summarize content for product features. | UGC platform practice; AI disclosure needs. | Medium | Yes | Yes | Attorney | AI summarization should be explicit if enabled. |
| Deletion behavior | Explain what happens to posts/comments after deletion, moderation removal, account deletion, quotes, saves, reports, and audit records. | FTC/NIST privacy guidance. | High | Yes | Yes | Attorney, engineer | Keep audit records minimal and access-controlled. |
| Anonymous content handling | Anonymous public posts remain linked to internal account for enforcement. | Product identity principle; Blind anonymous model. | High | Yes | Yes | Policy owner | User-facing language must not promise absolute anonymity. |
| Moderation/reporting rights | Reserve right to remove, restrict, preserve evidence, and report/escalate safety/security issues. | Trust and Safety plan; incident response needs. | High | Yes | Yes | Attorney, policy owner | Avoid overbroad claims beyond reviewed terms. |
| Product improvement use | Decide whether user content may be used to improve AI/search/safety features, and disclose any such use. | NIST AI RMF; OpenAI data-processing considerations; privacy guidance. | Medium | Yes if used | Yes | Attorney, policy owner | Default recommendation: no training use without explicit review. |

## 13. Vendor / Sponsored Deals Requirements

NonRev Deals should be useful, controlled, and clearly labeled. Display ads are not the primary early revenue model, and V1 should not include full marketplace payments or unmoderated vendor self-service.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sponsored labels | Clearly label sponsored placements, affiliate links, featured listings, and paid relationships near the claim or CTA. | FTC endorsement, native advertising, and dot-com disclosure guidance. | High | If monetized deals live | Yes before monetized deals | Attorney, founder | Labels must be hard to miss. |
| Offer accuracy | Require vendor review and removal rights for outdated, misleading, or unsafe offers. | FTC advertising guidance. | High | If deals live | Yes | Founder, policy owner | Admin-reviewed deals only in V1. |
| Vendor approval | Approve vendors before listing; no unmoderated vendor posting. | Product monetization plan; FTC spam/misleading-ad risk. | High | If deals live | Yes | Founder | Track sponsorship status and verification status. |
| Affiliate disclosure | Disclose affiliate revenue where links may compensate Deadhead Club. | FTC endorsement/dot-com disclosure guidance. | High | If affiliates live | Yes | Attorney, founder | Do not bury disclosure only in terms. |
| Marketplace deferral | Defer full marketplace payments and disputes until later. | Monetization plan; risk around scams and payments. | High | Yes | Yes | Founder | Stripe/payment policies can be reviewed later. |

## 14. Beta Participation Requirements

Private beta terms should make clear that the product is controlled, unfinished, invite-only, and safety-tested.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Beta status | Tell users features may change, break, or be removed. | FTC clear-disclosure principles; beta operating plan. | High | Yes | No | Attorney, founder | Do not overpromise feature availability. |
| Invite-only access | State that access can be limited, revoked, or paused. | Private beta plan. | High | Yes | No | Founder, attorney | Supports safety and community density. |
| Verification expectations | Explain private beta may require aviation-worker verification and manual review. | Verification sources and beta plan. | High | Yes | Yes | Attorney, policy owner | No sensitive uploads on public waitlist. |
| Confidentiality expectations | Decide whether beta content is confidential; if yes, counsel must draft realistic language. | Beta-risk review. | Medium | Optional | No | Attorney | Do not rely on confidentiality to protect unsafe content. |
| Feedback consent | Tell users feedback may be used to improve the product. | FTC clarity; product discovery norms. | Medium | Yes | No | Founder, attorney | Avoid using private content outside disclosed purposes. |
| Safety escalation | Provide a report/escalation path for threats, aviation/security-sensitive content, and privacy incidents. | TSA SSI; NIST CSF; Trust and Safety plan. | High | Yes | Yes | Policy owner, security reviewer | Must be monitored during beta. |

## 15. Incident Response Requirements

Incident response must cover both conventional security/privacy incidents and aviation/community safety incidents.

| Checklist item | Recommended approach for Deadhead Club | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Incident contacts | Assign owner and backup for privacy/security, content safety, verification artifact, and aviation/security-sensitive incidents. | NIST CSF; FTC security guidance. | High | Yes | Yes | Founder, security reviewer | Private beta can use founder plus backup reviewer. |
| Security/privacy incidents | Define intake, triage, containment, evidence preservation, user notification decision path, and postmortem. | FTC Start with Security; NIST CSF; OWASP logging. | High | Yes | Yes | Security reviewer, attorney | Notification obligations require legal review. |
| Aviation-sensitive content | Hide content pending review when it may expose SSI-like procedures, passenger private info, exact hotels, or live operations. | TSA SSI; Trust and Safety plan. | High | Yes | Yes | Policy owner | Keep minimal evidence in admin logs. |
| Verification artifact mishandling | Define response if an upload is public, over-retained, accessed improperly, or sent to AI by mistake. | FTC security guidance; OWASP file upload/logging. | High | Yes | Yes | Security reviewer, attorney | This is a beta blocker before uploads. |
| Account compromise | Define password reset, session revocation, trust-state review, and sensitive-action audit. | FTC security; OWASP ASVS. | High | Yes | Yes | Engineer, security reviewer | Admin accounts need stronger controls. |
| Response timing | Set private beta targets: emergency same day, high severity within 24 hours, routine reports within 24 hours during active beta. | Private beta operating plan; NIST CSF. | Medium | Yes | Yes | Founder, policy owner | Public launch may need stronger staffing. |

## 16. Open Legal / Policy Questions

- Trademark counsel path and budget.
- Entity ownership and contracting owner.
- Domain ownership and account custody.
- Whether to use a privacy-policy generator only as a draft input or attorney-drafted policy from the start.
- Exact verification artifact retention period.
- Whether manual badge uploads are acceptable in private beta.
- Whether former aviation workers or aspiring aviation workers are allowed in beta, and at what access level.
- Whether crash pad discussion belongs in V1 beta or Phase 2.
- Whether anonymous company-specific discussion needs additional safeguards, room rules, or employer-name limits.
- Whether beta content should be confidential and whether that is enforceable or useful.
- Whether user content can be used for AI summarization beyond the original room/board context.

## 17. Policy Gates by Milestone

| Milestone gate | Required policy decisions before proceeding | Research/source basis | Confidence level | Required before private beta | Required before public launch | Owner/reviewer | Notes or open questions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Landing page | Working-name caveat, no-affiliation disclaimer, privacy-light data collection statement, no sensitive document collection. | FTC disclosure guidance; USPTO guidance; privacy minimization. | High | Yes | Yes | Founder, attorney | Waitlist tool choice also needs privacy review. |
| Waitlist | Field minimization, consent to contact, no uploads, referral/source handling, deletion request contact. | FTC/NIST privacy guidance. | High | Yes | Yes | Founder, attorney | Do not collect badge uploads. |
| Private beta | Beta terms, privacy notice, community rules, verification consent, moderation runbook, incident response, AI notice if enabled. | Sources above across privacy, TSA, NIST, OWASP, OpenAI. | High | Yes | Yes | Attorney, policy owner, security reviewer | Required before inviting real users. |
| Public launch | Full ToS, full Privacy Policy, Community Guidelines, appeal process, deletion/export process, incident response, trademark/name decision. | FTC, USPTO, NIST, OWASP. | High | No | Yes | Attorney | Public launch blocked without name decision. |
| Monetization | Vendor/sponsored deals policy, affiliate disclosure, offer review, removal rights. | FTC endorsement/native advertising/dot-com disclosure guidance. | High | If monetized in beta | Yes before monetization | Attorney, founder | No full marketplace payments in V1. |
| AI launch | AI use notice, safety rules, no high-impact AI decisions, structured-output/safety logging requirements. | NIST AI RMF; OWASP LLM Top 10; OpenAI docs. | High | Yes if AI enabled | Yes | Engineer, policy owner | Demo-only mode can reduce risk. |
| Vendor deals launch | Vendor approval, sponsored labels, admin review, no self-serve posting, no misleading offers. | FTC advertising guidance. | High | If deals live | Yes | Founder, attorney | Vendor marketplace is later-stage. |

## 18. Decision Matrix

| Decision | Recommendation | Reason | Owner/reviewer |
| --- | --- | --- | --- |
| Use "Deadhead Club" publicly | Require counsel before public launch | USPTO/confusion/common-law risks remain unresolved. | Attorney |
| Invite private beta users | Accept only after beta policy minimum exists | Product validation needs real users, but safety and consent gates must be ready. | Founder, attorney |
| Public waitlist | Accept with minimal fields and no sensitive uploads | Useful no-code validation with manageable privacy risk. | Founder, attorney |
| Manual badge/document uploads | Defer unless private upload controls and retention/deletion process are ready | Verification artifacts are sensitive and mishandling is high risk. | Security reviewer, attorney |
| Work email verification | Accept with explicit employer-email-log caveat | Practical V1 verification path but not fully private from employer systems. | Attorney, policy owner |
| Employment/payroll API verification | Defer | Consent, privacy, vendor, cost, and integration complexity exceed V1 need. | Founder, attorney |
| Anonymous posting | Accept with internal accountability and moderation gates | Core differentiator, but must not be consequence-free. | Policy owner |
| Jumpseat Brief in private beta | Require safety review; consider demo/limited mode first | AI output risk around security, live ops, hotels, and private data. | Engineer, policy owner |
| Sponsored deals | Defer monetized placements until disclosure policy is ready | FTC disclosure and offer-accuracy risks. | Founder, attorney |
| Crash pad listings | Defer full listings; allow moderated discussion only if policy is ready | Housing scams, safety, disputes, and payments are too much for V1. | Founder, policy owner |

## 19. Recommended Next Tasks

1. Run a review-only consistency pass across all docs to align policy gates, beta readiness, build tickets, and milestone sequencing. Use Plan/Goals.
2. Create a no-code waitlist validation packet: landing page copy, waitlist form schema, interview script, ambassador outreach templates, and privacy-safe data handling checklist. Use Plan/Goals.
3. Create a counsel/security review packet summarizing open legal, privacy, verification, trademark, AI, and incident-response questions. Use Plan/Goals.
