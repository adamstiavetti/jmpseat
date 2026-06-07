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
  const accountCodeInput = readFileSync(
    new URL("../../src/components/auth/AccountCodeInput.tsx", import.meta.url),
    "utf8",
  );
  const accountConfirmation = readFileSync(
    new URL("../../src/lib/auth/accountConfirmation.ts", import.meta.url),
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
  assert.match(signup, /six-digit code/i);
  assert.match(signup, /finish creating your jmpseat account/i);
  assert.match(signup, /verify your airline employee email separately after signup/i);
  assert.match(signup, /Verify your email address/i);
  assert.match(signup, /A verification code has been sent to/i);
  assert.match(signup, /maskedPendingSignupEmail/i);
  assert.match(signup, /Resend code/i);
  assert.match(signup, /Change email/i);
  assert.match(accountConfirmation, /ACCOUNT_CONFIRMATION_CODE_LENGTH = 6/);
  assert.match(accountCodeInput, /Array\(ACCOUNT_CONFIRMATION_CODE_LENGTH\)\.fill\(""\)/);
  assert.match(accountCodeInput, /applyAccountCodeInput/);
  assert.match(accountCodeInput, /codeName = "account_code"/);
  assert.match(accountCodeInput, /name=\{codeName\}/);
  assert.match(accountCodeInput, /autoComplete=\{index === 0 \? "one-time-code" : "off"\}/);
  assert.match(accountCodeInput, /onPaste=\{handlePaste\}/);
  assert.match(accountCodeInput, /handleKeyDown/);
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

test("account signup code confirmation stays Supabase-native and separate from access grants", () => {
  const actions = readFileSync(
    new URL("../../src/lib/auth/actions.ts", import.meta.url),
    "utf8",
  );
  const signup = readFileSync(
    new URL("../../app/signup/page.tsx", import.meta.url),
    "utf8",
  );
  const accountCodeInput = readFileSync(
    new URL("../../src/components/auth/AccountCodeInput.tsx", import.meta.url),
    "utf8",
  );
  const accountConfirmation = readFileSync(
    new URL("../../src/lib/auth/accountConfirmation.ts", import.meta.url),
    "utf8",
  );
  const pendingSignup = readFileSync(
    new URL("../../src/lib/auth/pendingSignup.ts", import.meta.url),
    "utf8",
  );

  assert.match(actions, /confirmAccountCodeAction/);
  assert.match(pendingSignup, /PENDING_SIGNUP_EMAIL_COOKIE/);
  assert.match(pendingSignup, /httpOnly:\s*true/);
  assert.match(pendingSignup, /sameSite:\s*"lax"/);
  assert.match(pendingSignup, /maxAge:\s*PENDING_SIGNUP_EMAIL_MAX_AGE_SECONDS/);
  assert.match(actions, /setPendingSignupEmail\(email\)/);
  assert.match(pendingSignup, /getPendingSignupEmail/);
  assert.match(pendingSignup, /maskAccountEmail/);
  assert.match(actions, /accountEmail = pendingEmail \|\| email/);
  assert.match(accountConfirmation, /ACCOUNT_CONFIRMATION_CODE_PATTERN/);
  assert.match(actions, /ACCOUNT_CONFIRMATION_CODE_PATTERN\.test\(confirmationCode\)/);
  assert.match(actions, /auth\.verifyOtp\(\{\s*email:\s*accountEmail,\s*token:\s*confirmationCode,\s*type:\s*"email"/s);
  assert.match(actions, /auth\.resend\(\{\s*type:\s*"signup",\s*email,/s);
  assert.match(actions, /resendAccountCodeAction/);
  assert.match(actions, /changeSignupEmailAction/);
  assert.match(actions, /clearPendingSignupEmail\(\)/);
  assert.match(actions, /resolveCurrentUserAppPath\(AUTH_ROUTES\.app\)/);
  assert.match(actions, /That account confirmation code is invalid or expired/i);
  assert.match(actions, /mode:\s*"confirm"/);
  assert.doesNotMatch(actions, /metadata:\s*{[^}]*confirmationCode/is);
  assert.doesNotMatch(actions, /metadata:\s*{[^}]*account_code/is);
  assert.doesNotMatch(actions, /console\.(log|error)\([^)]*confirmationCode/is);
  assert.doesNotMatch(actions, /airline_email_verified|beta_access|grant beta|role claim|base claim|proof_file/i);
  assert.match(signup, /pendingSignupEmail \? null :/);
  assert.match(signup, /Your pending signup session expired/i);
  assert.match(signup, /disabled=\{!pendingSignupEmail\}/);
  assert.match(accountCodeInput, /codeName = "account_code"/);
  assert.match(accountCodeInput, /name=\{codeName\}/);
  assert.doesNotMatch(signup, /placeholder="000000"/);
  assert.match(accountCodeInput, /aria-label=\{`Digit \$\{index \+ 1\} of \$\{ACCOUNT_CONFIRMATION_CODE_LENGTH\}`\}/);
  assert.match(accountCodeInput, /if \(!incomingDigits\) \{\s*nextDigits\[startIndex\] = "";/s);
  assert.match(accountCodeInput, /incomingDigits\.split\(""\)\.forEach/);
  assert.match(accountCodeInput, /event\.clipboardData\.getData\("text"\)/);
  assert.match(accountCodeInput, /const code = digits\.join\(""\)/);
  assert.doesNotMatch(signup, /proof upload|badge upload|document upload/i);
});
