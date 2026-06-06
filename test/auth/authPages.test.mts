import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("auth pages and callback route exist", () => {
  const login = readFileSync(
    new URL("../../app/login/page.tsx", import.meta.url),
    "utf8",
  );
  const signup = readFileSync(
    new URL("../../app/signup/page.tsx", import.meta.url),
    "utf8",
  );
  const reset = readFileSync(
    new URL("../../app/reset-password/page.tsx", import.meta.url),
    "utf8",
  );
  const callback = readFileSync(
    new URL("../../app/auth/callback/route.ts", import.meta.url),
    "utf8",
  );
  const confirm = readFileSync(
    new URL("../../app/auth/confirm/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(login, /login/i);
  assert.match(login, /airline employee email verification is required/i);
  assert.match(login, /closed beta/i);
  assert.match(login, /invite code/i);
  assert.doesNotMatch(login, /publicly open|open to everyone|invite code alone grants access/i);
  assert.match(signup, /signup/i);
  assert.match(signup, /login email can be separate from your airline employee email/i);
  assert.match(signup, /airline employee email verification is required/i);
  assert.match(signup, /closed beta/i);
  assert.match(signup, /invite code/i);
  assert.doesNotMatch(signup, /publicly open|open to everyone|invite code alone grants access/i);
  assert.match(reset, /reset/i);
  assert.match(callback, /exchangeCodeForSession|redirect/i);
  assert.match(callback, /That authentication link is missing the expected callback code/i);
  assert.match(callback, /token_hash/i);
  assert.match(callback, /AUTH_ROUTES\.confirm/i);
  assert.doesNotMatch(callback, /request\.nextUrl\.clone\(\)/i);
  assert.match(confirm, /verifyOtp/i);
  assert.match(confirm, /token_hash/i);
  assert.match(confirm, /EmailOtpType/i);
  assert.match(confirm, /invalid or expired/i);
  assert.doesNotMatch(confirm, /metadata:\s*{[^}]*token_hash/is);
});

test("auth actions keep signup and password reset routed through bounded auth callbacks", () => {
  const actions = readFileSync(
    new URL("../../src/lib/auth/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(actions, /new URL\(AUTH_ROUTES\.callback,\s*origin\)/);
  assert.match(
    actions,
    /AUTH_ROUTES\.callback\}\?next=\$\{encodeURIComponent\(AUTH_ROUTES\.resetPassword\)\}&mode=update/,
  );
  assert.doesNotMatch(actions, /localhost:3000\/auth\/callback/);
});
