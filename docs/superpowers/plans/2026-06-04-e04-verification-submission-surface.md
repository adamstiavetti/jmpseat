# E04 Verification Submission Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real authenticated `/app/verification` status/submission surface that reads only the current user’s verification state and explains the work-email and redacted-proof paths without implementing upload, review, or claim issuance.

**Architecture:** Replace the generic verification placeholder route with a dedicated page that uses the existing private-child gate and security-event logging pattern. Add a small verification server/helper layer to read user-owned requests, claims, and evidence rows, plus a pure view-model helper for page state so the copy and status behavior stay testable.

**Tech Stack:** Next.js App Router, TypeScript, existing Supabase server client, Node test runner, existing auth/private-app/verification domain modules

---

### Task 1: Add failing verification-surface tests

**Files:**
- Create: `test/verification/verificationSurface.test.mts`
- Modify: `src/lib/verification/server.ts`
- Modify: `src/lib/verification/surface.ts`
- Modify: `app/app/verification/page.tsx`

- [ ] **Step 1: Write the failing test**

Cover:
- `/app/verification` copy boundaries
- separation from auth/profile/beta
- work-email privacy and approved-domain language
- redacted-proof redaction requirements
- no `type="file"` input or Storage/upload behavior
- no automatic claim issuance language
- no employer-system lookup
- status-summary helper behavior for no-request, pending, and approved states

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/verification/verificationSurface.test.mts`
Expected: FAIL because the verification surface helper/page files do not exist yet

### Task 2: Implement minimal verification status/helper layer

**Files:**
- Create: `src/lib/verification/surface.ts`
- Create: `src/lib/verification/server.ts`
- Test: `test/verification/verificationSurface.test.mts`

- [ ] **Step 1: Write minimal implementation**

Add:
- pure verification status-summary helpers
- user-owned verification read helpers using the existing Supabase server client
- approved-domain-count check only for bounded work-email availability messaging
- no writes, no review actions, no claim issuance

- [ ] **Step 2: Run focused tests**

Run: `node --test test/verification/verificationSurface.test.mts`
Expected: PASS

### Task 3: Implement the dedicated `/app/verification` page

**Files:**
- Create: `app/app/verification/page.tsx`
- Create: `app/app/verification/verification.module.css`
- Modify: `src/lib/privateApp/privateShellPlaceholder.ts` only if text needs to stop lying about verification still being placeholder-only

- [ ] **Step 1: Add the dedicated route**

Implement:
- existing private-child gate behavior
- existing route access event logging
- verification status summary
- work-email method explanation and deferred submission state
- redacted-proof “coming next” copy with required redaction guidance
- privacy and no-employer-system-lookup copy

- [ ] **Step 2: Run focused verification-surface tests**

Run: `node --test test/verification/verificationSurface.test.mts`
Expected: PASS

### Task 4: Document and validate

**Files:**
- Create: `docs/epochs/epoch-04-verification-submission-surface-implementation.md`
- Modify: `docs/epochs/epoch-04-worker-verification-foundation-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] **Step 1: Write the implementation note**

Document:
- what `/app/verification` now does
- what it does not do
- that work-email request creation is deferred
- that redacted proof upload is disabled/deferred
- how privacy/redaction/no-employer-system-lookup rules are preserved
- what remains for `E04-T06`, `E04-T07`, `E04-T08`, and `E04-T10`

- [ ] **Step 2: Run validation**

Run:
- `node --test test/verification/verificationSurface.test.mts`
- `node --test test/verification/workEmail.test.mts`
- `node --test test/verification/verification.test.mts`
- `node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts`
- `node --test test/profile/profile.test.mts`
- `node --test test/beta-access/betaAccess.test.mts`
- `node --test test/private-app/privateShellPlaceholder.test.mts test/private-app/access.test.mts`
- `node --test test/security-events/securityEvents.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

- [ ] **Step 3: Commit**

Run:
`git add app/app/verification/ src/lib/verification/ test/verification/ docs/`

Commit:
`git commit -m "feat: add verification submission surface foundation"`
