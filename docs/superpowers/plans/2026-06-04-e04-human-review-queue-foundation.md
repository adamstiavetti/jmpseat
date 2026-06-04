# E04 Human Review Queue Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the bounded reviewer authorization, queue, and review-action foundation for worker verification requests without building a broad admin system.

**Architecture:** Add a local-only Supabase migration for reviewer scopes and reviewer RLS policies, keep the review decision logic in pure verification helpers, then expose a narrow reviewer-only route backed by server actions and safe metadata reads.

**Tech Stack:** Next.js App Router, server actions, Supabase SSR client, Supabase Postgres with RLS, Node test runner, TypeScript.

---

### Task 1: Lock the review contract with failing tests

**Files:**
- Create: `test/verification/review.test.mts`

- [ ] Write failing tests for reviewer scope constants, scope filtering, unauthorized review blocking, self-review prevention, bounded claim issuance, and migration content.
- [ ] Run the focused review test and confirm it fails for the right reason.

### Task 2: Add reviewer schema and RLS foundation

**Files:**
- Create: `supabase/migrations/20260604165541_create_verification_reviewer_scopes.sql`

- [ ] Add the reviewer scope table and indexes.
- [ ] Enable RLS and add reviewer policies for queue reads, request updates, claim inserts, and review-action inserts.
- [ ] Do not run remote `db push`.

### Task 3: Add pure review helpers

**Files:**
- Create: `src/lib/verification/review.ts`

- [ ] Implement reviewer-scope helpers.
- [ ] Implement queue filtering by scope.
- [ ] Implement bounded review planning with no-self-review guard and work-email-only claim issuance rules.

### Task 4: Add server-side reviewer read and action helpers

**Files:**
- Create: `src/lib/verification/reviewServer.ts`
- Create: `src/lib/verification/reviewActions.ts`

- [ ] Implement current-reviewer queue reads.
- [ ] Implement the bounded review action server action.
- [ ] Keep the route and actions free of upload, Storage, and employer-system lookup behavior.

### Task 5: Add minimal reviewer-only routes and docs

**Files:**
- Create: `app/app/admin/verification/page.tsx`
- Create: `app/app/admin/verification/review.module.css`
- Create: `app/app/access-restricted/page.tsx`
- Create: `docs/epochs/epoch-04-human-review-queue-foundation-implementation.md`
- Modify: `docs/epochs/epoch-04-worker-verification-foundation-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] Add a narrow reviewer-only queue surface.
- [ ] Add a bounded access-restricted surface for non-reviewers.
- [ ] Document the reviewer model, supported actions, claim issuance boundary, and deferred work.

### Task 6: Run validation and commit

**Files:**
- Modify: existing changed files only

- [ ] Run the full required verification/auth/profile/beta/private/security test suite.
- [ ] Run `npm run lint`, `npm run typecheck`, and `npm run build`.
- [ ] Commit the bounded E04-T07 slice.
