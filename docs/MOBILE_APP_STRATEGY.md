# Mobile App Strategy

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## 1. Purpose

- jmpseat will launch web-first but should be designed as one product with multiple clients.
- The future clients are web and native mobile.
- The mobile app should not become a bolt-on rewrite after the web MVP is already established.

## 2. Strategic Decision

- Build the web MVP first.
- Keep the web app responsive and mobile-friendly.
- Do not build the native app yet.
- Design auth, data, authorization, verification, moderation, content, and notification architecture so a future mobile app can reuse the same backend and product rules.

## 3. Client Model

- Public marketing website.
- Private web app.
- Future native mobile app.
- Shared backend/data layer.
- Shared product rules and authorization model.

## 4. Architecture Principles

- Product rules must not live only in web UI components.
- Authorization cannot be client-only.
- Backend/data contracts should be usable by both web and future mobile.
- Avoid web-only assumptions in auth, verification, profile, beta access, boards, rooms, posts, saves, reports, moderation, and admin features.
- Next.js-specific UI is acceptable for web delivery, but domain, data, and security rules should be shared or backend-enforced.

## 5. Auth Implications

- Epoch 03 auth decisions must account for future mobile auth.
- Account, profile, and beta-access state must be shared across clients.
- Verification state must remain separate from login/auth state.
- Private access gates must be enforced server-side and database-side, not only through web route guards.
- Future mobile deep links, redirects, session persistence, password reset, and email verification flows should be considered before auth architecture is locked.

## 6. Data and API Implications

- Future high-growth product data should be accessed through stable, documented contracts.
- Avoid unbounded web-only queries.
- Plan pagination, filtering, indexing, and authorization once for both web and mobile.
- Avoid tying core data access to one specific UI route.

## 7. Mobile-Specific Future Concerns

- Push notifications.
- Deep links.
- App store release process.
- Offline/read caching if needed later.
- Mobile session storage.
- Mobile-safe reporting and moderation flows.
- Media upload constraints if uploads are ever added.

## 8. Recommended Future Mobile Stack

- Expo / React Native is the likely default candidate for native mobile later.
- Final client-stack selection should be made in a future implementation decision, not assumed permanently now.
- Do not add Expo or React Native dependencies now.
- Do not restructure into a monorepo yet unless mobile implementation actually begins.

## 9. Future Repo Structure Option

Possible later structure only, not required today:

```text
apps/
  web/
  mobile/
packages/
  shared/
  ui/
  config/
```

This is a future option for code organization if multi-client implementation starts. It is not a requirement for the current web-first MVP phase.

## 10. Implementation Gate

Any future ticket touching auth, account/profile, beta access, verification, boards, rooms, posts, comments, saves, reports, moderation, search, notifications, storage, admin, or AI must state whether the work is:

- web-only
- mobile-ready
- shared-core

If a ticket is `shared-core` or `mobile-ready`, it must describe how the logic, data access, and authorization rules can be reused by a future mobile app.
