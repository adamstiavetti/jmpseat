import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTH_ROUTES,
  resolveAuthenticatedAppPath,
  resolvePostAuthPath,
} from "../../src/lib/auth/routes.ts";

test("auth routes stay aligned with E03-T02", () => {
  assert.deepEqual(AUTH_ROUTES, {
    login: "/login",
    signup: "/signup",
    callback: "/auth/callback",
    resetPassword: "/reset-password",
    app: "/app",
    profile: "/app/profile",
    verification: "/app/verification",
    verificationConfirm: "/app/verification/confirm",
    accessHold: "/app/access-hold",
    accessRestricted: "/app/access-restricted",
  });
});

test("post-auth path defaults safely to /app in E03-T03", () => {
  assert.equal(resolvePostAuthPath(), "/app");
});

test("profile-aware auth resolution sends incomplete users to /app/profile", () => {
  assert.equal(
    resolveAuthenticatedAppPath({
      hasCompletedProfile: false,
      next: "/app",
    }),
    "/app/profile",
  );

  assert.equal(
    resolveAuthenticatedAppPath({
      hasCompletedProfile: true,
      next: "/app/home",
    }),
    "/app/home",
  );
});
