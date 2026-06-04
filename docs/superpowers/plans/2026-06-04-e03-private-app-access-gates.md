# Epoch 03 Private App Access Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden private-route access so `/app` and known private child routes consistently enforce the same auth, profile, and beta-access gates.

**Architecture:** Add one shared private-app gate resolver that consumes the existing auth/profile/beta context and returns either `allow` or a redirect target for a specific route kind. Use that helper across `/app`, `/app/[section]`, `/app/profile`, and `/app/access-hold`, while preserving unknown-section 404 behavior by validating the slug before access resolution.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase SSR/Auth, Node test runner.

---

### Task 1: Add failing gate-resolver tests

**Files:**
- Create: `test/private-app/access.test.mts`

- [ ] **Step 1: Write failing tests for private route gate resolution**
- [ ] **Step 2: Run the tests to verify they fail for missing shared gate logic**
- [ ] **Step 3: Write the minimal shared gate resolver**
- [ ] **Step 4: Run the focused tests to verify they pass**

### Task 2: Apply the shared gate to root and child private routes

**Files:**
- Create: `src/lib/privateApp/access.ts`
- Modify: `app/app/page.tsx`
- Modify: `app/app/[section]/page.tsx`

- [ ] **Step 1: Extend tests for known-child gating and unknown-child 404 preservation**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Implement shared route gating for `/app` and known child routes**
- [ ] **Step 4: Run focused tests to verify they pass**

### Task 3: Apply the same gate rules to `/app/profile` and `/app/access-hold`

**Files:**
- Modify: `app/app/profile/page.tsx`
- Modify: `app/app/access-hold/page.tsx`
- Modify: `src/lib/betaAccess/server.ts` if a small integration point is needed

- [ ] **Step 1: Extend tests for profile and access-hold special-case behavior**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Implement the shared special-case handling**
- [ ] **Step 4: Run focused tests to verify they pass**

### Task 4: Update docs, validate, and commit

**Files:**
- Create: `docs/epochs/epoch-03-private-app-access-gates-implementation.md`
- Modify: `docs/epochs/epoch-03-auth-account-beta-access-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] **Step 1: Record final gate order, special routes, unknown-route behavior, and safety boundaries**
- [ ] **Step 2: Run the required validation commands**
- [ ] **Step 3: Commit the bounded E03-T06 slice**
