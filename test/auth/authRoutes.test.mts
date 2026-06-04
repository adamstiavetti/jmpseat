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
    profile: "/app/profile",
    accessHold: "/app/access-hold",
    accessRestricted: "/app/access-restricted",
  });
});

test("post-auth path defaults safely to /app in E03-T03", () => {
  assert.equal(resolvePostAuthPath(), "/app");
});
