import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getPrivateAppGateResult,
} from "../../src/lib/privateApp/access.ts";

function createContext(overrides: Partial<Parameters<typeof getPrivateAppGateResult>[0]["context"]> = {}) {
  return {
    authConfigured: true,
    user: { id: "user-1" },
    hasCompletedProfile: true,
    betaActive: true,
    profileLoadError: null,
    betaLoadError: null,
    ...overrides,
  };
}

test("shared private-app gate sends signed-out users to login", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-root",
      nextPath: "/app",
      context: createContext({ user: null }),
    }),
    { kind: "redirect", path: "/login?next=%2Fapp" },
  );
});

test("shared private-app gate sends incomplete profiles to /app/profile", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({ hasCompletedProfile: false, betaActive: true }),
    }),
    { kind: "redirect", path: "/app/profile" },
  );
});

test("shared private-app gate sends non-active beta users to /app/access-hold", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({ betaActive: false }),
    }),
    { kind: "redirect", path: "/app/access-hold" },
  );
});

test("shared private-app gate allows active-beta users into known private routes", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext(),
    }),
    { kind: "allow" },
  );
});

test("profile route stays available to signed-in users even if beta is not active", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "profile",
      nextPath: "/app/profile",
      context: createContext({ betaActive: false }),
    }),
    { kind: "allow" },
  );
});

test("access-hold redirects active beta users back to /app", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "access-hold",
      nextPath: "/app/access-hold",
      context: createContext({ betaActive: true }),
    }),
    { kind: "redirect", path: "/app" },
  );
});

test("missing beta migration does not silently grant child-route access", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({ betaLoadError: "Beta storage missing", betaActive: false }),
    }),
    { kind: "redirect", path: "/app/access-hold?error=Beta+storage+missing" },
  );
});

test("private child route resolves access before rendering placeholders", () => {
  const source = readFileSync(
    new URL("../../app/app/[section]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getPrivateAppGateResult|resolve/i);
  assert.match(source, /redirect\(/i);
});

test("known child route list stays limited to placeholder routes", () => {
  const source = readFileSync(
    new URL("../../src/lib/privateApp/privateShellPlaceholder.ts", import.meta.url),
    "utf8",
  );

  for (const slug of ["home", "base", "layovers", "rooms", "profile", "verification", "admin"]) {
    assert.match(source, new RegExp(`"${slug}"`));
  }
});
