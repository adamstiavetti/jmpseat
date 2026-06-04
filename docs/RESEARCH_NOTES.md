# Research Notes

Date accessed: May 28, 2026.

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

These notes summarize public web research used to refine the planning docs. Sources are summarized in original language; long copyrighted passages are intentionally not copied.

## Research Synthesis Artifacts

### Discovery Research Report 001

- URL: `docs/DISCOVERY_RESEARCH_REPORT_001.md`
- Source type: internal synthesis / desk research report
- Date recorded: May 28, 2026
- Supports: Organizes founder/assistant-provided Discovery Research Pass 1 findings using the existing public source base in this file. It supports continuing validation around Base Boards, Layover Boards, verified anonymous Crew Rooms, and community-generated aviation knowledge, while preserving V1 exclusions around schedule import, non-rev load requests, nearby crew tracking, dating/swiping, exact hotel exposure, public location tracking, and badge uploads on public waitlists.
- Product-plan impact: Updated `PROBLEM_SOLUTION_VALIDATION_MATRIX.md` to mark relevant assumptions as desk-researched only, not user-validated or beta-validated. Preserved the FA expert interview as pending.
- Limitations: This is a synthesis of existing research and user-provided findings, not fresh web research, not customer interviews, not expert-reviewed evidence, and not beta behavior. It should not be used to claim validation is complete.

## Competitor and Market Sources

### Flight Crew View App - App Store

- URL: https://apps.apple.com/us/app/flight-crew-view/id999316238
- Source type: app-store listing
- Supports: Flight Crew View positions around schedule download/storage, FLICA support, crew assistant, legality calculations, hotel/airport info, crew chat, friend tracking, discounts, and subscriptions.
- Product-plan impact: reinforced that jmpseat should not try to beat schedule/roster utility in V1 and should avoid airline portal/login dependency. App reviews also informed the risk note around company security policies and third-party schedule access.

### Flight Crew View Support - Delta schedule import

- URL: https://help.flightcrewview.com/support/solutions/articles/16000192984-delta-schedule-import-info-troubleshooting-
- Source type: authoritative product support
- Supports: Some schedule-import behavior can be device-calendar based rather than direct airline login, depending on airline/workflow.
- Product-plan impact: refined V1 exclusion language to avoid both portal login and schedule scraping while leaving optional roster/calendar integrations for a later trust-established phase.

### StaffTraveler - What is StaffTraveler?

- URL: https://support.stafftraveler.com/en/help/what-is-stafftraveler
- Source type: authoritative product support
- Supports: StaffTraveler is positioned as a worldwide community for non-rev travelers, flight-load requests, airline employee hotel/car deals, and city tips.
- Product-plan impact: confirmed jmpseat should not build flight-load request infrastructure in V1 and should treat deals/tips as supporting utility.

### StaffTraveler - How do I prove that I work(ed) for an airline?

- URL: https://support.stafftraveler.com/help/how-to-prove-that-i-work-for-an-airline
- Source type: authoritative product support
- Supports: Airline-worker proof can include uniform selfie, non-rev system screenshot, corporate email, or company ID if allowed.
- Product-plan impact: informed V1 verification options: work email and manual badge/document review, with retention and redaction guidance.

### CrewLounge CONNECT

- URL: https://connect.crewlounge.aero/
- Source type: authoritative product marketing
- Supports: CrewLounge CONNECT is roster/calendar-first, with roster export, sharing, privacy controls, layover meetups, restaurants/discounts, hotel room and pickup utilities.
- Product-plan impact: validated that jmpseat should not clone a roster/calendar-first app in V1 and should defer integrations.

### CrewLounge CONNECT App Store

- URL: https://apps.apple.com/us/app/connect-crewlounge-aero/id1294765316
- Source type: app-store listing
- Supports: Feature set includes calendar export, roster sharing, crew chat, carpool/nearby crew, outstation meetups, hotel room list sharing, destination briefing, and subscription-like app economics.
- Product-plan impact: strengthened V1 exclusions around public nearby crew tracking, dating/meetup vibe, hotel exposure, and roster integrations.

### CrewVIP

- URL: https://crew-vip.com/
- Source type: authoritative product marketing
- Supports: CrewVIP emphasizes crew discounts, location-based offers, CrewConnect, AI layover planner, maps, and business partner visibility.
- Product-plan impact: refined monetization: NonRev Deals should be useful but not the primary wedge; sponsored deals need labels and review.

### YoFly Crew

- URL: https://www.yoflycrew.com/
- Source type: product marketing
- Supports: Newer crew app pattern around verified crew access, layover alerts, crew chat rooms, anonymous venting, crash pads, and marketplace features.
- Product-plan impact: validated demand for crew-only community and crash pad/deal concepts, while reinforcing V1 risk boundaries against live alerts and public nearby tracking.

### CrewRoom

- URL: https://www.crewroom.io/
- Source type: product marketing
- Supports: Crew-exclusive layover intel, restaurants, hotels, crashpads, chat rooms, local contacts, and hand verification claims.
- Product-plan impact: reinforced Layover Boards and Base Boards as important, but sharpened the rule against public exact crew hotel exposure.

### Creweaze - Google Play

- URL: https://play.google.com/store/apps/details?hl=en_US&id=co.owlapps.creweaze
- Source type: app-store listing
- Supports: Crew-only layover community with vetted members, trusted recommendations, discounts, location data collection, and deletion request availability.
- Product-plan impact: informed privacy notes around location data and validated crew-only layover recommendation demand.

### Air Crew Meet

- URL: https://www.aircrewmeet.com/
- Source type: product marketing
- Supports: Aviation social app with verified professionals, layover connections, private chat, profile swiping, crew filters, meetups, and career hub.
- Product-plan impact: reinforced decision to avoid dating/swiping behavior while preserving career utility through Ready Room.

### Rendezvous App - App Store

- URL: https://apps.apple.com/ca/app/rendezvous-fly-land-connect/id6747298377
- Source type: app-store listing
- Supports: Aircrew layover matching, privacy-oriented schedule/contact handling, no company portals/logins, uploaded bid/trade awards, and smart notifications.
- Product-plan impact: supported the distinction between useful private matching and risky public location/schedule tracking; V1 excludes tracking and schedule imports.

### Blind FAQ

- URL: https://us.teamblind.com/faq
- Source type: authoritative product FAQ
- Supports: Work email verification for verified professionals, anonymous participation, employer email-log caveat, company-name visibility, and anti-confidential-information stance.
- Product-plan impact: refined identity principle to "Verified privately. Anonymous publicly. Accountable internally." Added work-email caveat and confidential-document rules.

### Blind Community Guidelines

- URL: https://www.teamblind.com/community-guidelines/
- Source type: authoritative policy
- Supports: Anonymous worker communities need explicit rules against business secrets, harassment, abuse, and harmful interactions.
- Product-plan impact: informed Trust and Safety banned categories, moderation workflows, and internal accountability.

## Verification Sources

### SheerID Employment FAQ

- URL: https://verify.sheerid.com/employment-faq/?pid=5ee238c1ea26521a9e0a9455
- Source type: vendor support/FAQ
- Supports: Employment eligibility verification may collect personal information and may request official documentation showing name, company, and current affiliation.
- Product-plan impact: supported later-stage vendor verification as possible, but not required for V1 due to integration, coverage, cost, and privacy complexity.

### SheerID API Walkthrough

- URL: https://developer.sheerid.com/tutorials/apis/api-walkthrough
- Source type: vendor developer documentation
- Supports: SheerID offers API-based verification flows with initiation, submission, possible instant verification, document upload, and verification detail retrieval.
- Product-plan impact: added Tier 5 employment/API verification as later-stage only.

### Truework 101

- URL: https://help.truework.com/hc/en-us/articles/4403451702935-Truework-101
- Source type: vendor support
- Supports: Truework provides employment/income verification through automated network, third-party providers, manual outreach, and API-oriented workflows.
- Product-plan impact: treated employment verification APIs as later-stage infrastructure, not a V1 dependency.

### Truework - Can I verify income and employment for myself?

- URL: https://help.truework.com/hc/en-us/articles/4478052462359-Can-I-verify-income-and-employment-for-myself
- Source type: vendor support
- Supports: Truework generally requires authorized third-party initiation and signed authorization for sensitive employment/income data.
- Product-plan impact: reinforced consent and complexity concerns for Tier 5 verification.

### Argyle API

- URL: https://argyle.com/tools/api/
- Source type: vendor marketing/developer
- Supports: Argyle offers payroll/employment data connectivity APIs and structured reports.
- Product-plan impact: added Argyle to later-stage verification exploration, not V1.

### Argyle Consumer FAQ

- URL: https://www.argyle.com/consumers/faq
- Source type: vendor consumer FAQ
- Supports: Argyle connects authorized service providers to employer/payroll systems to retrieve income and employment data from source systems.
- Product-plan impact: reinforced that payroll connectivity has consent and privacy implications unsuitable as a V1 dependency.

### Atomic Verify

- URL: https://atomic.financial/verify/
- Source type: vendor marketing
- Supports: Atomic offers employment and income verification through payroll connectivity.
- Product-plan impact: added Atomic to later-stage verification options, not initial MVP.

## Aviation Safety and Privacy Sources

### TSA Sensitive Security Information

- URL: https://www.tsa.gov/for-industry/sensitive-security-information
- Source type: government/regulatory
- Supports: Sensitive Security Information is information that would be detrimental to transportation security if publicly released.
- Product-plan impact: supported strict bans on airport security procedures and live operations-sensitive information.

### TSA Security Screening FAQ

- URL: https://www.tsa.gov/travel/frequently-asked-questions
- Source type: government/regulatory
- Supports: TSA permits some public activity like filming only when it does not interfere or reveal sensitive information.
- Product-plan impact: reinforced the product line between general airport tips and security-sensitive procedural content.

### 49 U.S.C. 40119

- URL: https://uscode.house.gov/view.xhtml?req=%28title%3A49+section%3A40119+edition%3Aprelim%29
- Source type: government/regulatory
- Supports: U.S. law recognizes protection of sensitive security information and privacy-sensitive transportation information.
- Product-plan impact: reinforced safety categories and emergency escalation for security-sensitive disclosures.

### AP News - Federal officials review airline passenger personal information handling

- URL: https://apnews.com/article/85b29aa871fce3202c8f3cb9c4f12df2
- Source type: news/reporting
- Supports: U.S. DOT attention on how airlines handle and share passenger personal information.
- Product-plan impact: reinforced strict ban on passenger private information and careful handling of aviation privacy.

### eHotelier - Airline crew security: how safe is your hotel?

- URL: https://insights.ehotelier.com/insights/2014/04/16/airline-crew-security-how-safe-is-your-hotel/
- Source type: secondary industry analysis
- Supports: Crew hotel safety involves privacy, access control, and protection against intrusion or risk to crew.
- Product-plan impact: supported the rule against public exact crew hotel exposure.

## AI and Technical Architecture Sources

### OpenAI - Best Practices for API Key Safety

- URL: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- Source type: authoritative vendor documentation
- Supports: API keys should not be deployed client-side; requests should route through a backend server.
- Product-plan impact: reinforced server-side AI calls only.

### OpenAI - Structured model outputs

- URL: https://platform.openai.com/docs/guides/structured-outputs
- Source type: authoritative vendor documentation
- Supports: Structured Outputs help model responses follow a JSON schema and make refusals programmatically detectable.
- Product-plan impact: added structured output requirement for Jumpseat Brief and moderation/safety helpers where practical.

### OpenAI - Moderation endpoint help

- URL: https://help.openai.com/en/articles/4936833
- Source type: authoritative vendor documentation
- Supports: OpenAI provides a moderation endpoint for API users.
- Product-plan impact: informed Safety Filter and Moderation Assistant concepts, while preserving human final review.

### Supabase Auth Docs

- URL: https://supabase.com/docs/guides/auth/
- Source type: authoritative vendor documentation
- Supports: Supabase Auth supports authentication, authorization, JWTs, password, OAuth, OTP, SSO, and integration with RLS.
- Product-plan impact: supported Supabase Auth or equivalent as recommended MVP auth.

### Supabase Row Level Security Docs

- URL: https://supabase.com/docs/guides/database/postgres/row-level-security
- Source type: authoritative vendor documentation
- Supports: RLS provides granular database authorization and should be enabled on exposed tables.
- Product-plan impact: added explicit RLS plus server-side authorization recommendation.

### Supabase Storage Bucket Docs

- URL: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Source type: authoritative vendor documentation
- Supports: Private buckets use access control and can be accessed through JWT-authorized downloads or signed URLs.
- Product-plan impact: supported private storage and short-lived signed URLs for verification artifacts.

### Supabase Full Text Search Docs

- URL: https://supabase.com/docs/guides/database/full-text-search
- Source type: authoritative vendor documentation
- Supports: Postgres includes built-in full-text search functions and ranking.
- Product-plan impact: reinforced Postgres full-text search first before dedicated/vector search.

### Next.js App Router Docs

- URL: https://nextjs.org/docs/app
- Source type: authoritative framework documentation
- Supports: Next.js App Router provides app structure, routing, layouts, server/client components, and modern React web app patterns.
- Product-plan impact: supported Next.js / React as MVP frontend direction.

### Vercel Next.js Docs

- URL: https://vercel.com/docs/concepts/next.js/overview
- Source type: authoritative vendor documentation
- Supports: Vercel supports zero-configuration deployment for Next.js and adds scalability/performance capabilities.
- Product-plan impact: supported Vercel plus managed Postgres/Supabase deployment recommendation.

## Legal and Policy Requirements Sources

These sources were used for `docs/LEGAL_POLICY_REQUIREMENTS.md`. Date accessed: May 28, 2026.

### USPTO - Trademark basics

- URL: https://www.uspto.gov/trademarks/basics
- Source type: government
- Supports: Trademarks identify source of goods or services, and federal trademark rights require review of mark use and registration requirements.
- Policy impact: reinforced that "jmpseat" must remain a working name pending legal/trademark clearance and that public launch needs a documented clearance decision.
- Limitations: general public guidance, not a clearance search or legal opinion.

### USPTO - Likelihood of confusion

- URL: https://www.uspto.gov/trademarks/search/likelihood-confusion
- Source type: government
- Supports: Trademark conflicts can arise when marks are similar and goods/services are related enough to create consumer confusion.
- Policy impact: informed counsel questions about software, online social networking, aviation, travel, recruiting, marketplace, apparel, merch, domain, social handle, and common-law conflicts.
- Limitations: does not determine whether jmpseat is available or registrable.

### USPTO - Search trademark database

- URL: https://www.uspto.gov/trademarks/search
- Source type: government
- Supports: USPTO provides search tools for reviewing federal trademark records.
- Policy impact: added requirement for a counsel-reviewed USPTO search before public launch under the name.
- Limitations: federal database search is not a full common-law, domain, app-store, or market clearance.

### FTC - Start with Security: A Guide for Business

- URL: https://www.ftc.gov/business-guidance/resources/start-security-guide-business
- Source type: government
- Supports: Businesses should build security into products, limit access, require secure authentication, store sensitive information securely, and plan for incidents.
- Policy impact: informed privacy, access-control, upload, incident-response, and sensitive verification artifact requirements.
- Limitations: general security guidance, not aviation-specific or legal advice.

### FTC - Protecting Personal Information: A Guide for Business

- URL: https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business
- Source type: government
- Supports: Businesses should know what personal information they have, scale down collection, protect needed information, properly dispose of unneeded information, and plan for incidents.
- Policy impact: supported data minimization, purpose limitation, retention/deletion, verification artifact deletion, and manual deletion/export processes.
- Limitations: broad guidance; specific legal obligations depend on facts and jurisdictions.

### FTC - Data Security

- URL: https://www.ftc.gov/business-guidance/privacy-security/data-security
- Source type: government
- Supports: FTC business guidance covers protecting personal information and data-security practices.
- Policy impact: reinforced private handling of sensitive identity, verification artifacts, admin access, and incident response.
- Limitations: general federal consumer-protection guidance, not a complete compliance checklist.

### FTC - Endorsements, Influencers, and Reviews

- URL: https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews
- Source type: government
- Supports: Material connections and endorsements should be disclosed clearly.
- Policy impact: informed sponsored deal, affiliate, ambassador, and vendor-listing disclosure recommendations.
- Limitations: does not draft platform-specific sponsored-content terms.

### FTC - Native Advertising: A Guide for Businesses

- URL: https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses
- Source type: government
- Supports: Advertising that resembles surrounding content should be clearly identified so users understand it is advertising.
- Policy impact: supported clear labels for sponsored NonRev Deals and featured vendor placements.
- Limitations: specific implementation requires attorney and product review.

### FTC - Dot Com Disclosures

- URL: https://www.ftc.gov/business-guidance/resources/dot-com-disclosures-information-about-online-advertising
- Source type: government
- Supports: Online advertising disclosures should be clear, conspicuous, and placed close to relevant claims.
- Policy impact: informed recommendation that sponsored/affiliate labels should not be buried only in terms or footers.
- Limitations: guidance must be applied to the eventual UI and offer flows.

### TSA - Sensitive Security Information

- URL: https://www.tsa.gov/for-industry/sensitive-security-information
- Source type: government/regulatory
- Supports: Sensitive Security Information is information that would be detrimental to transportation security if publicly released.
- Policy impact: supported banned content rules for airport security procedures and emergency escalation for aviation/security-sensitive disclosures.
- Limitations: not a full moderation taxonomy and not tailored to worker community apps.

### eCFR - 49 CFR Part 1520, Protection of Sensitive Security Information

- URL: https://www.ecfr.gov/current/title-49/subtitle-B/chapter-XII/subchapter-C/part-1520
- Source type: government/regulatory
- Supports: Federal rules define and protect certain transportation security information.
- Policy impact: reinforced conservative takedown and escalation for airport security procedure disclosures.
- Limitations: legal applicability and interpretation require qualified counsel.

### NIST Privacy Framework

- URL: https://www.nist.gov/privacy-framework
- Source type: government/standards
- Supports: Privacy risk management framework covering identifying, governing, controlling, communicating, and protecting privacy risks.
- Policy impact: informed data minimization, purpose limitation, retention/deletion, user request, and privacy governance requirements.
- Limitations: voluntary framework, not a legal determination.

### NIST AI Risk Management Framework

- URL: https://www.nist.gov/itl/ai-risk-management-framework
- Source type: government/standards
- Supports: AI risk management should be governed, mapped, measured, and managed, with attention to trustworthy AI characteristics.
- Policy impact: informed AI use disclosure, human review for high-impact outcomes, AI logging/evaluation, and limitations on AI authority.
- Limitations: voluntary framework; implementation details remain product-specific.

### NIST Cybersecurity Framework

- URL: https://www.nist.gov/cyberframework
- Source type: government/standards
- Supports: Cybersecurity risk management functions include govern, identify, protect, detect, respond, and recover.
- Policy impact: informed incident response, owner assignment, evidence preservation, response timing, and post-incident review requirements.
- Limitations: voluntary framework and not a substitute for a company incident response plan.

### OWASP Logging Cheat Sheet

- URL: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- Source type: standards
- Supports: Applications should log security-relevant events in a structured way while avoiding sensitive data overexposure.
- Policy impact: informed audit logging for moderation, verification reviews, sensitive artifact access, appeals, and emergency escalations.
- Limitations: technical guidance, not legal or policy language.

### OWASP File Upload Cheat Sheet

- URL: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- Source type: standards
- Supports: File uploads should use allowed extensions, type validation, filename controls, size limits, storage controls, and malware scanning where appropriate.
- Policy impact: informed verification artifact upload requirements and the blocker around accepting manual badge uploads before safe handling exists.
- Limitations: technical security reference; specific architecture decisions remain future implementation work.

### OWASP Top 10 for Large Language Model Applications

- URL: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- Source type: standards
- Supports: LLM applications face risks including prompt injection, sensitive information disclosure, excessive agency, and insecure output handling.
- Policy impact: informed AI policy requirements: retrieved content is untrusted, hidden prompts are not enough, and AI cannot approve verification or final bans.
- Limitations: security-risk taxonomy, not product-specific legal advice.

### OWASP Application Security Verification Standard

- URL: https://owasp.org/www-project-application-security-verification-standard/
- Source type: standards
- Supports: ASVS provides application security verification requirements and levels.
- Policy impact: reinforced security-review and authorization baseline for future implementation milestones.
- Limitations: not a legal compliance standard by itself.

### OpenAI - Best Practices for API Key Safety

- URL: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- Source type: official docs
- Supports: API keys should not be exposed client-side and should be routed through server-side code.
- Policy impact: supported server-side-only AI requirement.
- Limitations: vendor guidance, not a full AI governance policy.

### OpenAI - Structured Outputs

- URL: https://platform.openai.com/docs/guides/structured-outputs
- Source type: official docs
- Supports: Structured outputs can make model responses follow developer-supplied schemas and support more predictable validation.
- Policy impact: supported structured outputs for Jumpseat Brief and moderation-assist use cases where practical.
- Limitations: structured outputs reduce but do not eliminate safety and policy risk.

### OpenAI - Moderation endpoint help

- URL: https://help.openai.com/en/articles/4936833
- Source type: official docs
- Supports: OpenAI provides moderation capabilities for API users.
- Policy impact: informed AI Safety Filter and moderation-assistant planning while preserving human final review.
- Limitations: moderation tooling is assistive and does not replace jmpseat policy enforcement.

### Supabase - Row Level Security

- URL: https://supabase.com/docs/guides/database/postgres/row-level-security
- Source type: official docs
- Supports: Row Level Security enables granular database authorization and should be enabled for exposed tables.
- Policy impact: reinforced policy requirement that sensitive data needs RLS plus server-side authorization in future implementation.
- Limitations: implementation guidance, not a legal policy source.

### Supabase - Storage access control

- URL: https://supabase.com/docs/guides/storage/security/access-control
- Source type: official docs
- Supports: Storage access can be controlled with authorization rules and private access patterns.
- Policy impact: informed private verification artifact storage, signed/admin-limited access, and no public file paths.
- Limitations: final storage design depends on implementation.

### Next.js - Data Security

- URL: https://nextjs.org/docs/app/guides/data-security
- Source type: official docs
- Supports: Framework guidance distinguishes server-side data handling from client exposure risks.
- Policy impact: supported server-side authorization and AI-key privacy requirements.
- Limitations: framework-specific technical guidance.

### Vercel - Security

- URL: https://vercel.com/docs/security
- Source type: official docs
- Supports: Deployment platforms provide security features and shared-responsibility controls.
- Policy impact: informed future launch review around environment variables, deployment security, and platform controls.
- Limitations: platform documentation only; does not secure application logic.

### GitHub Docs - Security hardening for GitHub Actions

- URL: https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions
- Source type: official docs
- Supports: CI workflows should use secure token permissions, secret handling, and dependency controls.
- Policy impact: reinforced future CI/security gates before deployment.
- Limitations: applies when GitHub Actions are created; no CI files exist in this documentation-only repo.

### California Attorney General - California Consumer Privacy Act

- URL: https://oag.ca.gov/privacy/ccpa
- Source type: government
- Supports: California provides consumer privacy rights and business obligations under qualifying circumstances.
- Policy impact: informed deletion/export and state-privacy-rights review items without asserting applicability.
- Limitations: applicability depends on thresholds, data use, entity details, and legal review.

### California Privacy Protection Agency

- URL: https://cppa.ca.gov/
- Source type: government
- Supports: California privacy regulator provides resources about state privacy rights and rules.
- Policy impact: reinforced that privacy-policy drafting must include state-law review rather than generic wording.
- Limitations: not all requirements apply to all businesses.

### StaffTraveler - How do I prove that I work(ed) for an airline?

- URL: https://support.stafftraveler.com/help/how-to-prove-that-i-work-for-an-airline
- Source type: competitor page
- Supports: Airline-worker proof can involve corporate email, ID, screenshots, or other evidence depending on circumstances.
- Policy impact: informed verification consent requirements and redaction/private handling recommendations.
- Limitations: competitor support guidance, not legal advice or a universal standard.

### Blind FAQ

- URL: https://us.teamblind.com/faq
- Source type: competitor page
- Supports: Blind uses work email verification for professional communities and notes employer email logging caveats.
- Policy impact: informed work-email verification caveat and anonymous-but-accountable identity model.
- Limitations: competitor policy, not necessarily suitable unchanged for aviation workers.

### Blind Community Guidelines

- URL: https://www.teamblind.com/community-guidelines/
- Source type: competitor page
- Supports: Anonymous professional communities need rules against harassment, confidential information, and harmful conduct.
- Policy impact: informed community guidelines, anonymous discussion boundaries, and moderation expectations.
- Limitations: not aviation-specific and not a legal authority.

### SheerID Employment FAQ

- URL: https://verify.sheerid.com/employment-faq/?pid=5ee238c1ea26521a9e0a9455
- Source type: vendor docs
- Supports: Employment verification may request personal information and documentation showing current affiliation.
- Policy impact: informed Tier 5 later-stage verification and consent requirements.
- Limitations: vendor-specific process and marketing/support content.

### Truework 101

- URL: https://help.truework.com/hc/en-us/articles/4403451702935-Truework-101
- Source type: vendor docs
- Supports: Employment/income verification can involve automated networks, third-party providers, manual outreach, and authorization workflows.
- Policy impact: reinforced that employment/payroll verification APIs should not be a V1 dependency.
- Limitations: vendor-specific and employment/income oriented, not airline-community verification.

### Argyle Consumer FAQ

- URL: https://www.argyle.com/consumers/faq
- Source type: vendor docs
- Supports: Payroll/employment data connectivity involves user authorization to access source systems.
- Policy impact: informed privacy and consent concerns around advanced verification APIs.
- Limitations: vendor-specific and broader than aviation-worker affiliation.

### Atomic Verify

- URL: https://atomic.financial/verify/
- Source type: vendor docs
- Supports: Atomic markets employment and income verification through payroll connectivity.
- Policy impact: supported deferring payroll/API verification to a later stage with vendor-risk review.
- Limitations: vendor marketing, not a legal standard.

### Stripe Subscriptions Docs

- URL: https://docs.stripe.com/billing/subscriptions/overview
- Source type: authoritative vendor documentation
- Supports: Stripe provides subscription billing primitives.
- Product-plan impact: kept payments as later-stage Stripe work, not V1.

## Best-Practice and Coding-Standards Sources

### OWASP Top 10

- URL: https://owasp.org/Top10/2021/
- Source type: authoritative security standard
- Supports: OWASP Top 10 is a standard awareness document for developers and web application security, with risks including broken access control, cryptographic failures, injection, insecure design, security misconfiguration, authentication failures, and logging/monitoring failures.
- Product-plan impact: added OWASP Top 10 as a release-gate baseline and highlighted broken access control as especially important for verification, anonymity, rooms, and admin workflows.

### OWASP Application Security Verification Standard

- URL: https://owasp.org/www-project-application-security-verification-standard/
- Source type: authoritative security standard
- Supports: ASVS provides testable security requirements and secure development guidance for web applications.
- Product-plan impact: added ASVS-informed implementation and release-gate requirements to TECHNICAL_ARCHITECTURE and BUILD_TICKETS.

### OWASP Authentication Cheat Sheet

- URL: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Source type: authoritative security guidance
- Supports: Authentication systems should use safe error handling, logging and monitoring, and abuse-aware design.
- Product-plan impact: refined auth planning around generic errors, rate-limit-aware behavior, account-state enforcement, and admin MFA readiness.

### OWASP File Upload Cheat Sheet

- URL: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- Source type: authoritative security guidance
- Supports: File upload handling should include extension allowlists, content-type validation, file signature validation, safe filenames, storage controls, permissions, and upload/download limits.
- Product-plan impact: strengthened verification artifact requirements: private storage, type/size/signature validation, renamed files, safe preview/download behavior, and malware scanning evaluation.

### OWASP Logging Cheat Sheet

- URL: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- Source type: authoritative security guidance
- Supports: Applications should log security events such as input validation failures, authentication failures, authorization failures, session failures, application errors, higher-risk functionality, and administrative actions.
- Product-plan impact: added SecurityEvent entity and required logging for auth failures, authorization denials, verification artifact access, moderation actions, upload rejections, and AI safety refusals.

### OWASP Top 10 for Large Language Model Applications

- URL: https://owasp.org/www-project-top-10-for-large-language-model-applications
- Source type: authoritative AI security guidance
- Supports: LLM applications face risks such as prompt injection, sensitive information disclosure, supply chain vulnerabilities, data/model poisoning, improper output handling, excessive agency, system prompt leakage, vector/embedding weaknesses, misinformation, and unbounded consumption.
- Product-plan impact: expanded AI requirements around prompt-injection testing, treating retrieved content as untrusted, least-privilege AI tools, deterministic checks outside the model, and not relying on hidden prompts.

### NIST Privacy Framework

- URL: https://www.nist.gov/privacy-framework
- Source type: government/privacy framework
- Supports: The NIST Privacy Framework helps organizations identify and manage privacy risk while building products and services.
- Product-plan impact: reinforced privacy-by-design requirements: data minimization, purpose limitation, retention limits, deletion workflows, and sensitive-access auditability.

### NIST AI Risk Management Framework

- URL: https://www.nist.gov/itl/ai-risk-management-framework
- Source type: government/AI risk framework
- Supports: NIST AI RMF provides a framework to manage AI risks to individuals, organizations, and society.
- Product-plan impact: strengthened human review boundaries for AI-assisted moderation and verification-related workflows.

### W3C WCAG 2.2

- URL: https://www.w3.org/TR/WCAG22/
- Source type: authoritative accessibility standard
- Supports: WCAG 2.2 includes requirements for focus visibility, status messages, target size, accessible authentication, and broader accessibility conformance.
- Product-plan impact: added WCAG 2.2 AA as the accessibility target for auth, verification, posting, reporting, search, and admin workflows.

### MDN Web Security

- URL: https://developer.mozilla.org/en-US/docs/Web/Security
- Source type: authoritative web platform documentation
- Supports: Developers should use platform security features such as Content Security Policy and Permissions Policy and code carefully to mitigate XSS and data injection.
- Product-plan impact: added security-header planning, untrusted user-generated content handling, and output-encoding requirements.

### MDN CSRF Prevention

- URL: https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSRF_prevention
- Source type: authoritative web platform documentation
- Supports: CSRF defenses require more than assumptions about cookies; defense in depth can include request design, custom headers, tokens, and same-site controls depending on architecture.
- Product-plan impact: informed server-side route/action security requirements and future release checks for mutating endpoints.

### Next.js Data Security Guide

- URL: https://nextjs.org/docs/15/app/guides/data-security
- Source type: authoritative framework documentation
- Supports: Next.js guidance distinguishes server/client data handling and reinforces secure handling of data across Server Components and application boundaries.
- Product-plan impact: added server-only module requirements, no client-only authorization, and strict handling of privileged data access.

### Next.js Security Blog

- URL: https://nextjs.org/blog/security-nextjs-server-components-actions
- Source type: authoritative framework guidance
- Supports: Next.js environment variables are server-only by default unless prefixed for public exposure; server/client boundaries and Server Actions need explicit security thinking.
- Product-plan impact: added guidance to avoid exposing secrets and to protect all route handlers/server actions with server-side authorization.

### Supabase Secure Data Docs

- URL: https://supabase.com/docs/guides/database/secure-data
- Source type: authoritative vendor documentation
- Supports: Supabase recommends RLS for exposed tables and warns that secret/service role keys are never safe to expose because they bypass RLS.
- Product-plan impact: strengthened RLS requirements, service-role isolation, and server-side authorization language.

### Supabase Production Checklist

- URL: https://supabase.com/docs/guides/platform/going-into-prod/
- Source type: authoritative vendor documentation
- Supports: Supabase production readiness includes security review, RLS on tables, and attacker-minded abuse review.
- Product-plan impact: added beta release gates and abuse-case review.

### Supabase Auth Rate Limits

- URL: https://supabase.com/docs/guides/auth/rate-limits
- Source type: authoritative vendor documentation
- Supports: Supabase Auth enforces and exposes configurable rate limits to protect auth endpoints from abuse.
- Product-plan impact: added rate-limit-aware auth behavior and abuse controls to technical planning.

### Supabase Storage Access Control

- URL: https://supabase.com/docs/guides/storage/security/access-control
- Source type: authoritative vendor documentation
- Supports: Supabase Storage works with RLS policies and requires explicit access policies for bucket operations.
- Product-plan impact: reinforced private storage and storage RLS requirements for verification artifacts.

### GitHub Actions Secure Use Reference

- URL: https://docs.github.com/en/enterprise-cloud@latest/actions/reference/security/secure-use
- Source type: authoritative vendor documentation
- Supports: GitHub Actions should use least privilege, careful secret handling, code scanning, and dependency review.
- Product-plan impact: added CI and workflow security requirements, including least-privilege workflow permissions and secret scanning.

### npm audit Docs

- URL: https://docs.npmjs.com/cli/v11/commands/npm-audit/
- Source type: authoritative package-manager documentation
- Supports: npm audit checks dependency trees for known vulnerabilities.
- Product-plan impact: added dependency audit to CI and release gates.

### Twelve-Factor App

- URL: https://12factor.net/
- Source type: methodology reference
- Supports: Configuration should live outside code, backing services should be treated as attached resources, and apps should be portable across environments.
- Product-plan impact: added 12-factor style environment/config guidance and separation of production/preview/development secrets.

## Three.js Airside Journey V2 Planning Sources

Accessed: May 28, 2026

### React Three Fiber Scaling Performance

- URL: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Source type: official documentation
- Supports: React Three Fiber performance planning should consider on-demand rendering, reuse of geometries/materials, instancing for repeated objects, level of detail, performance monitoring, and adaptive pixel ratio strategies.
- Product-plan impact: informed the Airside Journey V2 recommendation to lazy-load 3D, cap DPR, reuse resources, avoid heavy object counts, and keep mobile scenes small.
- Limitations: Framework guidance, not jmpseat-specific UX validation or device benchmark data.

### React Three Fiber Performance Pitfalls

- URL: https://r3f.docs.pmnd.rs/advanced/pitfalls
- Source type: official documentation
- Supports: Creating objects can be expensive; materials/geometries should be shared where practical; fast animation updates should avoid React state updates inside frame loops.
- Product-plan impact: informed V2 component guidance to use procedural geometry carefully, reuse materials/geometries, and avoid React state churn during animation.
- Limitations: Technical best practices only; does not define brand direction or conversion impact.

### Next.js Lazy Loading Guide

- URL: https://nextjs.org/docs/app/guides/lazy-loading
- Source type: official documentation
- Supports: Next.js supports dynamic imports and lazy loading for client components; browser-only work should be isolated appropriately.
- Product-plan impact: reinforced the recommendation to keep the 3D experience client-only, dynamically loaded, and separate from the HTML content path.
- Limitations: General Next.js guidance; Three.js-specific implementation still needs app-level testing.

### MDN WebGL Best Practices

- URL: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- Source type: authoritative web platform documentation
- Supports: WebGL applications need careful resource and performance management, especially for broad device compatibility.
- Product-plan impact: informed the mobile performance budget, fallback requirements, and no-multiple-heavy-canvases recommendation.
- Limitations: WebGL platform guidance, not React-specific or product-specific.

### Three.js Object Disposal Guide

- URL: https://threejs.org/manual/en/how-to-dispose-of-objects.html
- Source type: official documentation
- Supports: Three.js resources such as geometries, materials, textures, and render targets are not automatically released and may require explicit disposal.
- Product-plan impact: informed the recommendation to isolate V2 scene resources, avoid repeated mount/unmount churn, and preserve a clean rollback path.
- Limitations: Low-level resource guidance; exact disposal needs depend on implementation.

### Three.js Cleanup Manual

- URL: https://threejs.org/manual/en/cleanup.html
- Source type: official documentation
- Supports: Three.js apps can use significant memory, and cleanup patterns are needed when resources are loaded or replaced over time.
- Product-plan impact: reinforced the caution against multiple active chapter canvases and the need to keep V2 assets procedural and isolated.
- Limitations: Example-driven manual page, not a formal performance benchmark.

### MDN prefers-reduced-motion

- URL: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Source type: authoritative web platform documentation
- Supports: Web experiences should detect and respect users who request reduced motion.
- Product-plan impact: informed the Airside Journey V2 reduced-motion requirement and fallback plan.
- Limitations: CSS/media-query guidance only; implementation still needs browser testing.

### WCAG 2.2 Pause, Stop, Hide

- URL: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- Source type: authoritative accessibility standard guidance
- Supports: Moving, blinking, scrolling, or auto-updating content that starts automatically and runs alongside other content can distract users and may need a way to pause, stop, or hide unless essential.
- Product-plan impact: informed the motion-design guardrails, reduced-motion requirements, and recommendation to avoid persistent distracting animation.
- Limitations: Accessibility interpretation guidance, not a WebGL implementation recipe.

### Drei ScrollControls Documentation

- URL: https://drei.docs.pmnd.rs/controls/scroll-controls
- Source type: official documentation
- Supports: Drei provides scroll-related helpers for React Three Fiber scenes.
- Product-plan impact: informed the comparison of scroll-aware architecture options, while the recommendation remains to avoid scroll-jacking and preserve normal page scrolling.
- Limitations: Specific helper documentation; using it may add dependency and interaction complexity.

### Awwwards Three.js Collection

- URL: https://www.awwwards.com/awwwards/collections/three-js/
- Source type: design inspiration / secondary curation
- Supports: High-end marketing and portfolio sites use Three.js to create premium visual storytelling and immersive brand moments.
- Product-plan impact: informed the ambition level for Airside Journey V2 while reinforcing that visual inspiration must be constrained by conversion, accessibility, and safety.
- Limitations: Inspiration source only; awards examples may over-prioritize spectacle over accessibility or conversion.

### Awwwards WebGL Websites Collection

- URL: https://www.awwwards.com/websites/webgl/
- Source type: design inspiration / secondary curation
- Supports: WebGL can support distinctive full-page brand experiences and section-based storytelling.
- Product-plan impact: informed the recommendation that V2 should support the entire landing-page journey rather than remain a small hero background.
- Limitations: Inspiration source only; does not provide implementation or performance guarantees.
