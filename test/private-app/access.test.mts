import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getPrivateAppGateResult,
} from "../../src/lib/privateApp/access.ts";
import {
  DEFAULT_JMPSEAT_LAUNCH_MODE,
  JMPSEAT_LAUNCH_MODES,
  doesLaunchModeRequireAirlineEmail,
  doesLaunchModeRequireBeta,
  normalizeJmpseatLaunchMode,
} from "../../src/lib/privateApp/launchMode.ts";

const VERIFIED_AIRLINE_EMAIL = {
  status: "verified" as const,
  airlineEmailVerified: true,
  domain: "airline.test",
  airline: "Test Air",
  verifiedAt: "2026-06-06T12:00:00.000Z",
  source: "work_email" as const,
  messageKey: "airline_email_verified",
};

const NOT_VERIFIED_AIRLINE_EMAIL = {
  status: "not_verified" as const,
  airlineEmailVerified: false,
  domain: null,
  airline: null,
  verifiedAt: null,
  source: "unknown" as const,
  messageKey: "airline_email_not_verified",
};

function createContext(overrides: Partial<Parameters<typeof getPrivateAppGateResult>[0]["context"]> = {}) {
  return {
    authConfigured: true,
    user: { id: "user-1" },
    hasCompletedProfile: true,
    launchMode: "private_testing" as const,
    betaActive: true,
    operatorPrivateAppAccess: false,
    airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
    profileLoadError: null,
    betaLoadError: null,
    airlineEmailLoadError: null,
    ...overrides,
  };
}

function expectNormalAllow() {
  return { kind: "allow", accessSource: "normal_gate" as const };
}

function expectOperatorAllow() {
  return { kind: "allow", accessSource: "operator_internal" as const };
}

function expectBlockedRedirect(path: string) {
  return { kind: "redirect", path, accessSource: "blocked" as const };
}

test("launch mode helper defaults safely and keeps canonical mode names explicit", () => {
  assert.equal(DEFAULT_JMPSEAT_LAUNCH_MODE, "private_testing");
  assert.deepEqual(JMPSEAT_LAUNCH_MODES, [
    "private_testing",
    "first_base_launch",
    "broader_launch",
    "internal_test",
  ]);
  assert.equal(normalizeJmpseatLaunchMode(undefined), "private_testing");
  assert.equal(normalizeJmpseatLaunchMode(" first_base_launch "), "first_base_launch");
  assert.equal(normalizeJmpseatLaunchMode("public_launch"), "private_testing");
  assert.equal(doesLaunchModeRequireBeta("private_testing"), true);
  assert.equal(doesLaunchModeRequireBeta("internal_test"), true);
  assert.equal(doesLaunchModeRequireBeta("first_base_launch"), false);
  assert.equal(doesLaunchModeRequireBeta("broader_launch"), false);
  assert.equal(doesLaunchModeRequireAirlineEmail("broader_launch"), true);
});

test("shared private-app gate sends signed-out users to login", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-root",
      nextPath: "/app",
      context: createContext({ user: null }),
    }),
    expectBlockedRedirect("/login?next=%2Fapp"),
  );
});

test("shared private-app gate sends incomplete profiles to /app/profile", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({ hasCompletedProfile: false, betaActive: true }),
    }),
    expectBlockedRedirect("/app/profile"),
  );
});

test("verification remedy route still requires login and profile completion", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "verification",
      nextPath: "/app/verification",
      context: createContext({ user: null }),
    }),
    expectBlockedRedirect("/login?next=%2Fapp%2Fverification"),
  );

  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "verification",
      nextPath: "/app/verification",
      context: createContext({ hasCompletedProfile: false }),
    }),
    expectBlockedRedirect("/app/profile"),
  );
});

test("verification remedy route is reachable before airline-email access is approved", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "verification",
      nextPath: "/app/verification",
      context: createContext({
        betaActive: false,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectNormalAllow(),
  );

  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        betaActive: false,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app/access-hold"),
  );
});

test("shared private-app gate sends non-active beta users to /app/access-hold", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({ betaActive: false }),
    }),
    expectBlockedRedirect("/app/access-hold"),
  );
});

test("private testing requires active beta and verified airline-email access", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "private_testing",
        betaActive: true,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app/access-hold"),
  );

  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "private_testing",
        betaActive: false,
        airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app/access-hold"),
  );
});

test("first-base launch allows verified launched-population users without manual beta grants", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "first_base_launch",
        betaActive: false,
        airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectNormalAllow(),
  );
});

test("broader launch still requires airline-email verification while bypassing beta", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "broader_launch",
        betaActive: false,
        airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectNormalAllow(),
  );

  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "broader_launch",
        betaActive: true,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app/access-hold"),
  );
});

test("internal test mode stays private-testing strict", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "internal_test",
        betaActive: false,
        airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app/access-hold"),
  );
});

test("explicit operator access can enter the private app during private testing without airline-email or beta approval", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "private_testing",
        betaActive: false,
        operatorPrivateAppAccess: true,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectOperatorAllow(),
  );

  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "internal_test",
        betaActive: false,
        operatorPrivateAppAccess: true,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectOperatorAllow(),
  );
});

test("operator private-app access does not change normal first-base or broader-launch airline-email gates", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "first_base_launch",
        betaActive: false,
        operatorPrivateAppAccess: true,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app/access-hold"),
  );
});

test("airline-email access storage failures fail closed without leaking internals", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({
        launchMode: "first_base_launch",
        betaActive: false,
        airlineEmailAccessState: {
          ...NOT_VERIFIED_AIRLINE_EMAIL,
          status: "not_ready",
          messageKey: "airline_email_access_not_ready",
        },
        airlineEmailLoadError:
          "Airline-email verification storage is not ready yet. Apply the verification foundation migration before using airline-email app access gates.",
      }),
    }),
    {
      kind: "redirect",
      path: "/app/access-hold?error=Airline-email+verification+storage+is+not+ready+yet.+Apply+the+verification+foundation+migration+before+using+airline-email+app+access+gates.",
      accessSource: "blocked",
    },
  );
});

test("shared private-app gate allows active-beta users into known private routes", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext(),
    }),
    expectNormalAllow(),
  );
});

test("profile route stays available to signed-in users even if beta is not active", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "profile",
      nextPath: "/app/profile",
      context: createContext({ betaActive: false }),
    }),
    expectNormalAllow(),
  );
});

test("access-hold redirects active beta users back to /app", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "access-hold",
      nextPath: "/app/access-hold",
      context: createContext({ betaActive: true }),
    }),
    expectBlockedRedirect("/app"),
  );
});

test("access-hold redirects operator private-app access back to /app without implying airline-email verification", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "access-hold",
      nextPath: "/app/access-hold",
      context: createContext({
        betaActive: false,
        operatorPrivateAppAccess: true,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app"),
  );
});

test("access-hold remains available for active beta users who still need airline-email access", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "access-hold",
      nextPath: "/app/access-hold",
      context: createContext({
        betaActive: true,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectNormalAllow(),
  );
});

test("access-hold redirects first-base launch users only after airline-email access passes", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "access-hold",
      nextPath: "/app/access-hold",
      context: createContext({
        launchMode: "first_base_launch",
        betaActive: false,
        airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
      }),
    }),
    expectBlockedRedirect("/app"),
  );
});

test("missing beta migration does not silently grant child-route access", () => {
  assert.deepEqual(
    getPrivateAppGateResult({
      routeKind: "private-child",
      nextPath: "/app/home",
      context: createContext({ betaLoadError: "Beta storage missing", betaActive: false }),
    }),
    expectBlockedRedirect("/app/access-hold?error=Beta+storage+missing"),
  );
});

test("private child route resolves access before rendering placeholders", () => {
  const source = readFileSync(
    new URL("../../app/app/[section]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getPrivateAppGateResult|resolve/i);
  assert.match(source, /access_source/);
  assert.match(source, /operator_private_app_access/);
  assert.doesNotMatch(source, /operator_uuid|operator_email|current_user_operator_scopes.*metadata/i);
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

test("private app gate does not accept object deletion or proof-file parameters", () => {
  const source = readFileSync(
    new URL("../../src/lib/privateApp/access.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /storage_bucket|storage_path|signedUrl|publicUrl|proofFile|evidenceId|objectKey/i);
});

test("server access context derives airline-email state without loading proof storage fields", () => {
  const source = readFileSync(
    new URL("../../src/lib/betaAccess/server.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /getCurrentAirlineEmailAccessState/);
  assert.match(source, /JMPSEAT_LAUNCH_MODE|getJmpseatLaunchMode/);
  assert.match(source, /current_user_operator_scopes/);
  assert.match(source, /operatorPrivateAppAccess/);
  assert.match(source, /request_id, evidence_type, status, uploaded_at, metadata/);
  assert.doesNotMatch(source, /storage_bucket|storage_path|signedUrl|publicUrl|proofFile|objectKey|SUPABASE_SERVICE_ROLE/i);
});
