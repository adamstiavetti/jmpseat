# Research Notes

Date accessed: May 28, 2026.

Working name note: "Deadhead Club" is a working product name pending legal and trademark clearance. This document does not claim legal or trademark clearance.

These notes summarize public web research used to refine the planning docs. Sources are summarized in original language; long copyrighted passages are intentionally not copied.

## Competitor and Market Sources

### Flight Crew View App - App Store

- URL: https://apps.apple.com/us/app/flight-crew-view/id999316238
- Source type: app-store listing
- Supports: Flight Crew View positions around schedule download/storage, FLICA support, crew assistant, legality calculations, hotel/airport info, crew chat, friend tracking, discounts, and subscriptions.
- Product-plan impact: reinforced that Deadhead Club should not try to beat schedule/roster utility in V1 and should avoid airline portal/login dependency. App reviews also informed the risk note around company security policies and third-party schedule access.

### Flight Crew View Support - Delta schedule import

- URL: https://help.flightcrewview.com/support/solutions/articles/16000192984-delta-schedule-import-info-troubleshooting-
- Source type: authoritative product support
- Supports: Some schedule-import behavior can be device-calendar based rather than direct airline login, depending on airline/workflow.
- Product-plan impact: refined V1 exclusion language to avoid both portal login and schedule scraping while leaving optional roster/calendar integrations for a later trust-established phase.

### StaffTraveler - What is StaffTraveler?

- URL: https://support.stafftraveler.com/en/help/what-is-stafftraveler
- Source type: authoritative product support
- Supports: StaffTraveler is positioned as a worldwide community for non-rev travelers, flight-load requests, airline employee hotel/car deals, and city tips.
- Product-plan impact: confirmed Deadhead Club should not build flight-load request infrastructure in V1 and should treat deals/tips as supporting utility.

### StaffTraveler - How do I prove that I work(ed) for an airline?

- URL: https://support.stafftraveler.com/help/how-to-prove-that-i-work-for-an-airline
- Source type: authoritative product support
- Supports: Airline-worker proof can include uniform selfie, non-rev system screenshot, corporate email, or company ID if allowed.
- Product-plan impact: informed V1 verification options: work email and manual badge/document review, with retention and redaction guidance.

### CrewLounge CONNECT

- URL: https://connect.crewlounge.aero/
- Source type: authoritative product marketing
- Supports: CrewLounge CONNECT is roster/calendar-first, with roster export, sharing, privacy controls, layover meetups, restaurants/discounts, hotel room and pickup utilities.
- Product-plan impact: validated that Deadhead Club should not clone a roster/calendar-first app in V1 and should defer integrations.

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
