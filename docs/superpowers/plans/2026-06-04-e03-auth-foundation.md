# E03 Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the bounded Epoch 03 auth foundation for the web MVP using Supabase SSR without implementing profile tables, beta approval, worker verification, uploads, storage, AI, or product features beyond auth surfaces.

**Architecture:** Add Supabase SSR dependencies, environment-contract helpers, browser/server client utilities, and a root `proxy.ts` for cookie/session refresh. Implement minimal auth routes and server actions, keeping `/app` gating limited to a signed-out redirect only if it can be enforced without inventing later account/profile/beta state.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `@supabase/supabase-js`, `@supabase/ssr`, Node test runner

---

### Task 1: Auth Foundation Test Coverage

**Files:**
- Create: `test/auth/supabaseConfig.test.mts`
- Create: `test/auth/authRoutes.test.mts`
- Modify: `package.json`

- [ ] **Step 1: Write failing env-contract tests**

```typescript
import test from "node:test";
import assert from "node:assert/strict";

import {
  SUPABASE_ENV_KEYS,
  getSupabaseBrowserEnv,
} from "../../src/lib/supabase/config.ts";

test("supabase env keys stay aligned with public browser-safe contract", () => {
  assert.deepEqual(SUPABASE_ENV_KEYS, [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ]);
});

test("missing env values return a disabled auth config instead of crashing", () => {
  const env = getSupabaseBrowserEnv({});

  assert.equal(env.enabled, false);
  assert.equal(env.url, "");
  assert.equal(env.publishableKey, "");
});
```

- [ ] **Step 2: Write failing route-contract tests**

```typescript
import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTH_ROUTES,
  resolvePostAuthPath,
} from "../../src/lib/auth/routes.ts";

test("auth routes stay aligned with E03-T02", () => {
  assert.deepEqual(AUTH_ROUTES, {
    login: "/login",
    signup: "/signup",
    callback: "/auth/callback",
    resetPassword: "/reset-password",
    app: "/app",
  });
});

test("post-auth path defaults safely to /app in E03-T03", () => {
  assert.equal(resolvePostAuthPath(), "/app");
});
```

- [ ] **Step 3: Run the new tests to verify they fail**

Run:

```bash
node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts
```

Expected: failures because auth config and route helpers do not exist yet.

### Task 2: Supabase Config And Utility Layer

**Files:**
- Create: `src/lib/supabase/config.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `src/lib/auth/routes.ts`
- Modify: `.env.example`

- [ ] **Step 1: Implement minimal env-contract helper**

```typescript
export const SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function getSupabaseBrowserEnv(
  source: Record<string, string | undefined> = process.env,
) {
  const url = source.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  return {
    enabled: Boolean(url && publishableKey),
    url,
    publishableKey,
  };
}
```

- [ ] **Step 2: Implement minimal auth route constants**

```typescript
export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  callback: "/auth/callback",
  resetPassword: "/reset-password",
  app: "/app",
} as const;

export function resolvePostAuthPath() {
  return AUTH_ROUTES.app;
}
```

- [ ] **Step 3: Add Supabase browser/server/proxy helpers using SSR package**

Implement clients with `createBrowserClient` and `createServerClient`, and a proxy helper that refreshes auth cookies without introducing app-specific authorization logic.

- [ ] **Step 4: Update `.env.example`**

Add:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 5: Re-run focused auth tests**

Run:

```bash
node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts
```

Expected: PASS

### Task 3: Proxy And Auth Route Surfaces

**Files:**
- Create: `proxy.ts`
- Create: `app/login/page.tsx`
- Create: `app/signup/page.tsx`
- Create: `app/reset-password/page.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `src/components/auth/AuthCard.tsx`
- Create: `src/components/auth/auth.module.css`
- Create: `src/lib/auth/actions.ts`

- [ ] **Step 1: Add a failing route-behavior test**

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("auth pages and callback route exist", () => {
  const login = readFileSync(new URL("../../app/login/page.tsx", import.meta.url), "utf8");
  const signup = readFileSync(new URL("../../app/signup/page.tsx", import.meta.url), "utf8");
  const reset = readFileSync(new URL("../../app/reset-password/page.tsx", import.meta.url), "utf8");
  const callback = readFileSync(new URL("../../app/auth/callback/route.ts", import.meta.url), "utf8");

  assert.match(login, /login/i);
  assert.match(signup, /signup/i);
  assert.match(reset, /reset/i);
  assert.match(callback, /GET|createServerClient|exchangeCodeForSession/i);
});
```

- [ ] **Step 2: Run the route-behavior test to verify it fails**

Run:

```bash
node --test test/auth/authPages.test.mts
```

Expected: FAIL because files do not exist yet.

- [ ] **Step 3: Implement minimal auth UI pages and actions**

Implement:

- login form with email/password
- signup form with explicit copy that account creation does not equal beta approval or worker verification
- reset-password request form
- shared auth card styling
- server actions for sign in, sign up, sign out, and password-reset request

- [ ] **Step 4: Implement callback route**

Use Supabase SSR server client to exchange code for session and redirect safely to `/app` for this bounded E03-T03 slice.

- [ ] **Step 5: Implement root `proxy.ts`**

Use Next.js 16 `proxy.ts` convention and keep logic scoped to cookie/session refresh plus safe signed-out redirect support for `/app` only if it does not require later-state assumptions.

- [ ] **Step 6: Re-run focused route test**

Run:

```bash
node --test test/auth/authPages.test.mts
```

Expected: PASS

### Task 4: `/app` Compatibility And Documentation

**Files:**
- Modify: `app/app/page.tsx`
- Modify: `app/app/[section]/page.tsx`
- Modify: `test/private-app/privateShellPlaceholder.test.mts`
- Modify: `docs/epochs/epoch-03-auth-account-beta-access-tickets.md`
- Create: `docs/epochs/epoch-03-auth-foundation-implementation.md`

- [ ] **Step 1: Add failing test for bounded `/app` auth behavior**

Extend private-shell tests to allow minimal auth references while still rejecting fake beta/profile/community behavior.

- [ ] **Step 2: Implement only bounded `/app` auth-aware behavior if safe**

If feasible with SSR session checks only:

- signed-out `/app` redirects to `/login`

Do not invent profile or beta gating.

- [ ] **Step 3: Document temporary auth behavior**

In implementation notes, record:

- packages added
- env vars required
- routes created
- callback behavior
- what remains temporary until E03-T04 through E03-T07
- confirmation that verification, uploads, storage, AI, and beta approval were not implemented

- [ ] **Step 4: Update E03-T03 ticket status**

Mark E03-T03 complete or implemented as appropriate and link the implementation note.

### Task 5: Full Validation And Commit

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install required packages**

Run:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Run focused existing and new tests**

Run:

```bash
node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts test/private-app/privateShellPlaceholder.test.mts
```

- [ ] **Step 3: Run project validation**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add epoch 03 auth foundation"
```
