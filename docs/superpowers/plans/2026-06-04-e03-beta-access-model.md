# Epoch 03 Beta Access Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the invite-only beta-access data model and routing layer that sits between profile completion and private-app entry.

**Architecture:** Add a dedicated `beta_access` migration plus focused beta-status domain helpers and a server-side app-access resolver that combines auth, profile completion, and beta status. Introduce a dedicated `/app/access-hold` surface and update `/app` and `/auth/callback` to route complete-profile users into beta hold unless their beta status is explicitly active.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase SSR/Auth, Postgres SQL migration, Node test runner.

---

### Task 1: Add failing beta-access domain tests

**Files:**
- Create: `test/beta-access/betaAccess.test.mts`
- Modify: `test/auth/authRoutes.test.mts` if route resolution helpers move

- [ ] **Step 1: Write the failing tests for beta status interpretation and route resolution**
- [ ] **Step 2: Run the tests to verify they fail for missing beta-access code**
- [ ] **Step 3: Write the minimal beta-access domain helpers**
- [ ] **Step 4: Run the focused tests to verify they pass**

### Task 2: Add the beta-access migration and server-side load helpers

**Files:**
- Create: `supabase/migrations/<timestamp>_create_beta_access.sql`
- Create: `src/lib/betaAccess/betaAccess.ts`
- Create: `src/lib/betaAccess/server.ts`

- [ ] **Step 1: Extend tests for migration content and storage-not-ready behavior**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Implement the migration, status helpers, and server-side access resolver**
- [ ] **Step 4: Run the focused tests to verify they pass**

### Task 3: Add `/app/access-hold` and wire `/app` plus callback routing

**Files:**
- Create: `app/app/access-hold/page.tsx`
- Modify: `app/app/page.tsx`
- Modify: `app/auth/callback/route.ts`
- Modify: `src/lib/profile/server.ts` only if a small integration point is needed

- [ ] **Step 1: Extend tests for access-hold copy and no-verification boundaries**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Implement the access-hold surface and beta-aware redirects**
- [ ] **Step 4: Run focused tests to verify they pass**

### Task 4: Update docs, validate, and commit

**Files:**
- Create: `docs/epochs/epoch-03-beta-access-model-implementation.md`
- Modify: `docs/epochs/epoch-03-auth-account-beta-access-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] **Step 1: Record the beta-access model, manual grant path, and scope boundaries**
- [ ] **Step 2: Run the required validation commands**
- [ ] **Step 3: Commit the bounded E03-T05 slice**
