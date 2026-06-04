# Scalability and Architecture Requirements

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## 1. Purpose

- jmpseat may grow to tens of thousands of registered users.
- Architecture, database, storage, and codebase decisions must preserve a realistic path to that scale.
- The goal is scale-ready architecture, not enterprise overengineering.
- MVP implementation should stay simple enough to ship and learn quickly, but it should avoid shortcuts that would force major rewrites once private-app usage grows.

## 2. Scale Assumptions

Working assumptions:

- The public waitlist may collect thousands to tens of thousands of email addresses.
- Private beta should start small, but the production app should be designed for tens of thousands of registered users.
- Community content may grow across bases, layovers, rooms, posts, comments, saves, reports, and moderation queues.
- Read-heavy usage is likely, especially for browsing boards, searching layover/base info, and reading rooms.
- Write-heavy spikes may happen around launch, travel disruptions, viral sharing, or large base/community onboarding.

## 3. Core Architecture Principles

- Keep MVP architecture simple but clean.
- Prefer proven managed services over premature custom infrastructure.
- Avoid microservices unless required later.
- Keep clear boundaries between public marketing, auth/account, private app, community content, moderation/admin, and future AI.
- Maintain server/client separation.
- Avoid putting authorization only in client-side code.
- Avoid unbounded reads or "load everything" patterns.
- Design each feature with pagination, filtering, authorization, and indexing in mind.
- Use consistent error handling, logging, and observability hooks.

## 4. Data Model Requirements

- High-growth tables must be designed with indexes from the start.
- Tables should include `id`, `created_at`, `updated_at`, ownership fields, and status/moderation fields where relevant.
- Posts, comments, rooms, boards, saves, reports, notifications, and moderation queues must support pagination.
- Avoid hard deletes for user/community content where moderation/audit history matters; use soft-delete/status fields when appropriate.
- Separate auth identity, profile, beta access, verification state, role/base information, moderation state, and admin state.
- Do not treat auth provider metadata as the only source of truth for core app data.
- Plan for base/role/airline/board filtering.
- Plan for future search without requiring a full rewrite.

## 5. Authorization and Security Requirements

- Private app gates must be enforced server-side and database-side, not only in UI.
- If Supabase/Postgres is used, RLS must be planned before private user data or community content exists.
- Every table containing private/user/community data needs an explicit access strategy.
- Service-role/admin access must be isolated and never exposed to the browser.
- Verification state must be separate from login/auth state.
- Admin/moderator actions should be auditable.
- Sensitive aviation content boundaries must be preserved:
  - no passenger data
  - no crew tracking
  - no exact crew hotel disclosure
  - no trip screenshots
  - no employer-confidential information
  - no airport/security-sensitive operational information

## 6. Query and Performance Requirements

- No unbounded list queries.
- Use pagination for boards, posts, comments, rooms, search results, saves, reports, and admin queues.
- Use stable sort fields, usually `created_at` plus `id`.
- Index common filters before launch of each feature.
- Avoid expensive client-side filtering of large datasets.
- Avoid N+1 query patterns.
- Plan caching carefully for public/static content, but do not cache private data incorrectly.
- Document expected query patterns in feature docs before implementation.

## 7. Storage and Media Requirements

- User-uploaded files/media should not be stored directly in database rows.
- Use object storage for media if/when needed.
- Store metadata in the database.
- Plan file size/type restrictions before enabling uploads.
- Future media features need moderation and abuse controls.

## 8. Moderation and Trust Requirements

- Moderation cannot be bolted on after public community features ship.
- Content tables should support report status, review status, visibility state, and auditability.
- Admin/moderator tools should be planned before broad posting/commenting.
- Anonymous public identity must still be internally accountable.

## 9. Operational Readiness

- Add logging/observability gradually but intentionally.
- Track auth failures, access-denied events, waitlist submissions, verification attempts, content reports, moderation decisions, and admin actions where applicable.
- Plan backup/export needs before production data grows.
- Keep migrations reviewable and reversible where practical.
- Avoid schema changes that destroy production data without a migration plan.

## 10. Codebase Maintainability

- Avoid giant components and mixed concerns.
- Keep route-specific UI, domain logic, data access, validation, and policy/authorization logic separated.
- Shared domain types/schemas should live in predictable locations.
- Feature modules should be organized so app growth does not collapse into one tangled directory.
- Tests should cover domain rules and access boundaries, not only rendering.

## 11. What Not to Overbuild Yet

- Do not add Kubernetes.
- Do not add microservices.
- Do not add distributed queues/event buses unless needed.
- Do not add custom infrastructure before managed tools are exhausted.
- Do not prematurely build a complex feed algorithm.
- Do not build enterprise analytics before product usage exists.
- Do not optimize hypothetical bottlenecks before measuring.

## 12. Future Implementation Gate

Any future ticket touching auth, profiles, beta access, verification, boards, rooms, posts, comments, saves, reports, moderation, search, storage, admin, or AI must state:

- expected table/query growth
- access-control strategy
- pagination strategy
- indexing considerations
- moderation/audit impact
- whether the change creates new private or sensitive data
