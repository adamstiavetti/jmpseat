import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  WORK_EMAIL_CONFIRMATION_CODE_LENGTH,
  WORK_EMAIL_CONFIRMATION_CODE_TTL_MINUTES,
  WORK_EMAIL_CONFIRMATION_EMAIL_SUBJECT,
  WORK_EMAIL_CONFIRMATION_PENDING_COOKIE,
  WORK_EMAIL_CONFIRMATION_PENDING_COOKIE_MAX_AGE_SECONDS,
  buildWorkEmailConfirmationEmail,
  buildWorkEmailConfirmationUrl,
  decodePendingWorkEmailConfirmation,
  encodePendingWorkEmailConfirmation,
  generateWorkEmailConfirmationCode,
  generateWorkEmailConfirmationToken,
  getWorkEmailConfirmationAppUrlConfig,
  getWorkEmailConfirmationDomain,
  getWorkEmailConfirmationEmailConfig,
  getWorkEmailHash,
  hashWorkEmailConfirmationCode,
  hashWorkEmailConfirmationSecret,
  isWorkEmailConfirmationSelectorValid,
  isWorkEmailConfirmationTokenValid,
} from "../../src/lib/verification/workEmailConfirmation.ts";

test("work-email confirmation tokens store only hashes and expiry metadata", () => {
  const token = generateWorkEmailConfirmationToken({
    now: new Date("2026-06-06T12:00:00.000Z"),
  });

  assert.match(token.token, /^[A-Za-z0-9_-]+$/);
  assert.equal(token.tokenHash, hashWorkEmailConfirmationSecret(token.token));
  assert.notEqual(token.tokenHash, token.token);
  assert.equal(token.expiresAt, "2026-06-07T12:00:00.000Z");
});

test("work-email confirmation codes use short-lived six-digit hashed secrets", () => {
  const code = generateWorkEmailConfirmationCode({
    now: new Date("2026-06-06T12:00:00.000Z"),
  });

  assert.equal(WORK_EMAIL_CONFIRMATION_CODE_LENGTH, 6);
  assert.equal(WORK_EMAIL_CONFIRMATION_CODE_TTL_MINUTES, 15);
  assert.match(code.code, /^[0-9]{6}$/);
  assert.match(code.codeNonce, /^[A-Za-z0-9_-]{16,}$/);
  assert.equal(
    code.codeHash,
    hashWorkEmailConfirmationCode({
      code: code.code,
      codeNonce: code.codeNonce,
    }),
  );
  assert.notEqual(code.codeHash, hashWorkEmailConfirmationSecret(code.code));
  assert.notEqual(code.codeHash, code.code);
  assert.equal(code.expiresAt, "2026-06-06T12:15:00.000Z");
});

test("work-email confirmation code hashes are row-specific to avoid duplicate-code collisions", () => {
  const code = "314159";
  const firstHash = hashWorkEmailConfirmationCode({
    code,
    codeNonce: "first-row-specific-nonce",
  });
  const secondHash = hashWorkEmailConfirmationCode({
    code,
    codeNonce: "second-row-specific-nonce",
  });

  assert.notEqual(firstHash, secondHash);
  assert.notEqual(firstHash, hashWorkEmailConfirmationSecret(code));
  assert.notEqual(secondHash, hashWorkEmailConfirmationSecret(code));
});

test("work-email confirmation link points to the app confirmation route", () => {
  const url = buildWorkEmailConfirmationUrl({
    appUrl: "https://preview.jmpseat.app/",
    selector: "00000000-0000-4000-8000-000000000001",
    token: "plain-token",
  });

  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://preview.jmpseat.app");
  assert.equal(parsed.pathname, "/app/verification/confirm");
  assert.equal(parsed.searchParams.get("selector"), "00000000-0000-4000-8000-000000000001");
  assert.equal(parsed.searchParams.get("token"), "plain-token");
});

test("pending work-email confirmation cookie encodes and validates token handoff", () => {
  const pending = {
    selector: "00000000-0000-4000-8000-000000000001",
    token: "abcdefghijklmnopqrstuvwxyzABCDEF0123456789_-",
  };
  const encoded = encodePendingWorkEmailConfirmation(pending);

  assert.equal(WORK_EMAIL_CONFIRMATION_PENDING_COOKIE, "jmpseat_work_email_confirmation");
  assert.equal(WORK_EMAIL_CONFIRMATION_PENDING_COOKIE_MAX_AGE_SECONDS, 600);
  assert.deepEqual(decodePendingWorkEmailConfirmation(encoded), pending);
  assert.equal(decodePendingWorkEmailConfirmation("not-json"), null);
  assert.equal(isWorkEmailConfirmationSelectorValid(pending.selector), true);
  assert.equal(isWorkEmailConfirmationSelectorValid("not-a-uuid"), false);
  assert.equal(isWorkEmailConfirmationTokenValid(pending.token), true);
  assert.equal(isWorkEmailConfirmationTokenValid("short-token"), false);
  assert.notEqual(encoded, pending.token);
});

test("auth sign-in metadata cannot receive a work-email confirmation token through next", () => {
  const source = readFileSync(
    new URL("../../src/lib/auth/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /next_path: next/);
  assert.doesNotMatch(source, /verification\/confirm\?selector|verification\/confirm.*token/);
});

test("work-email confirmation email copy stays scoped to email control", () => {
  const email = buildWorkEmailConfirmationEmail({
    confirmationCode: "123456",
  });
  const combined = `${email.subject}\n${email.text}\n${email.html}`;

  assert.equal(email.subject, WORK_EMAIL_CONFIRMATION_EMAIL_SUBJECT);
  assert.match(combined, /Enter this six-digit code in jmpseat to continue app access setup/i);
  assert.match(combined, /123456/);
  assert.match(combined, /verifies control of this email address only/i);
  assert.match(combined, /does not verify role, base, seniority, or employer endorsement/i);
  assert.match(combined, /independent and not sponsored by any airline/i);
  assert.doesNotMatch(combined, /app\/verification\/confirm|selector=|token=|href=/i);
  assert.doesNotMatch(combined, /proof upload|badge upload|document upload|official airline verification|beta invite/i);
});

test("work-email confirmation config reads env names without browser exposure", () => {
  assert.deepEqual(
    getWorkEmailConfirmationEmailConfig({
      RESEND_API_KEY: "key",
      RESEND_FROM_EMAIL: "no-reply@jmpseat.com",
    }),
    {
      apiKey: "key",
      fromEmail: "no-reply@jmpseat.com",
    },
  );
  assert.equal(getWorkEmailConfirmationEmailConfig({ RESEND_API_KEY: "key" }), null);
  assert.deepEqual(
    getWorkEmailConfirmationAppUrlConfig({
      NEXT_PUBLIC_APP_URL: "https://preview.jmpseat.app/some-path",
    }),
    { ok: true, appUrl: "https://preview.jmpseat.app" },
  );
  assert.equal(getWorkEmailConfirmationAppUrlConfig({}).ok, false);
});

test("work-email hashes and domain extraction avoid raw local-part storage", () => {
  const hash = getWorkEmailHash(" Crew.Member@Airline.TEST ");

  assert.equal(getWorkEmailConfirmationDomain(" Crew.Member@Airline.TEST "), "airline.test");
  assert.equal(hash, hashWorkEmailConfirmationSecret("crew.member@airline.test"));
  assert.notEqual(hash, "crew.member@airline.test");
  assert.equal(getWorkEmailHash(" "), null);
});

test("work-email confirmation migration creates hashed lifecycle and confirmation RPC", () => {
  const baseSql = readFileSync(
    new URL("../../supabase/migrations/20260606160833_add_work_email_confirmation_flow.sql", import.meta.url),
    "utf8",
  );
  const codeSql = readFileSync(
    new URL("../../supabase/migrations/20260606233000_add_work_email_confirmation_code_flow.sql", import.meta.url),
    "utf8",
  );

  assert.match(baseSql, /create table public\.work_email_confirmation_tokens/i);
  assert.match(baseSql, /email_hash text not null/i);
  assert.match(baseSql, /token_hash text not null unique/i);
  assert.match(baseSql, /status in \('active', 'used', 'expired', 'revoked'\)/i);
  assert.match(baseSql, /create or replace function public\.confirm_work_email_confirmation_token_for_user/i);
  assert.match(codeSql, /add column code_nonce text/i);
  assert.match(codeSql, /add column failed_attempts integer not null default 0/i);
  assert.match(codeSql, /create or replace function public\.confirm_work_email_confirmation_code_for_user/i);
  assert.match(codeSql, /requested_code text/i);
  assert.match(codeSql, /extensions\.digest\(confirmation\.code_nonce \|\| ':' \|\| v_requested_code, 'sha256'\)/i);
  assert.match(codeSql, /and code_nonce is not null/i);
  assert.match(codeSql, /failed_attempts = confirmation\.failed_attempts \+ 1/i);
  assert.match(codeSql, /confirmation_source', 'work_email_confirmation_code'/i);
  assert.match(codeSql, /status = 'revoked'/i);
  assert.match(
    codeSql,
    /revoke execute on function public\.create_work_email_confirmation_token_for_user\(uuid, text, text, text, timestamptz\) from public/i,
  );
  assert.match(
    codeSql,
    /revoke execute on function public\.create_work_email_confirmation_token_for_user\(uuid, text, text, text, timestamptz\) from authenticated/i,
  );
  assert.match(codeSql, /Legacy link-token verifier creation is not normal-user callable/i);
  assert.doesNotMatch(codeSql, /create or replace function public\.create_work_email_confirmation_code_for_user/i);
  assert.doesNotMatch(codeSql, /requested_token_hash|requested_code_nonce/i);
  assert.doesNotMatch(codeSql, /grant execute on function public\.create_work_email_confirmation_code_for_user/i);
  assert.doesNotMatch(
    codeSql,
    /grant execute on function public\.create_work_email_confirmation_token_for_user\(uuid, text, text, text, timestamptz\) to authenticated/i,
  );
  assert.doesNotMatch(codeSql, /insert into public\.verification_claims/i);
  assert.doesNotMatch(codeSql, /claim_type\s*=\s*'role'|claim_type\s*=\s*'base'|grant beta/i);
});

test("work-email confirmation actions send and verify codes after approved-domain request tracking", () => {
  const source = readFileSync(
    new URL("../../src/lib/verification/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /sendConfirmationCodeForWorkEmailRequest/);
  assert.match(source, /createWorkEmailConfirmationCodeForUser/);
  assert.match(source, /createStorageAdminClient/);
  assert.match(source, /code_nonce: codeNonce/);
  assert.match(source, /token_hash: codeHash/);
  assert.match(source, /confirm_work_email_confirmation_code_for_user/);
  assert.match(source, /requested_code: verificationCode/);
  assert.match(source, /sendWorkEmailConfirmationEmail/);
  assert.match(source, /work_email_verification\.email_sent/);
  assert.match(source, /work_email_verification\.email_send_failed/);
  assert.match(source, /Verification code sent/);
  assert.match(source, /verifyWorkEmailConfirmationCodeAction/);
  assert.doesNotMatch(source, /create_work_email_confirmation_code_for_user/);
  assert.doesNotMatch(source, /requested_token_hash|requested_code_nonce/);
  assert.doesNotMatch(source, /requested_code_hash: hashWorkEmailConfirmationSecret\(verificationCode\)/);
  assert.doesNotMatch(source, /console\.log|console\.error|raw_work_email|confirmationUrl/);
});

test("work-email confirmation route hashes tokens and keeps app gates unchanged", () => {
  const source = readFileSync(
    new URL("../../app/app/verification/confirm/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /WORK_EMAIL_CONFIRMATION_PENDING_COOKIE/);
  assert.match(source, /httpOnly:\s*true/);
  assert.match(source, /sameSite:\s*"lax"/);
  assert.match(source, /maxAge:\s*WORK_EMAIL_CONFIRMATION_PENDING_COOKIE_MAX_AGE_SECONDS/);
  assert.match(source, /maxAge:\s*0/);
  assert.match(source, /next:\s*AUTH_ROUTES\.verificationConfirm/);
  assert.doesNotMatch(source, /next:\s*buildRedirect\([^)]*selector|next:\s*buildRedirect\([^)]*token/s);
  assert.doesNotMatch(source, /next_path.*selector|next_path.*token/s);
  assert.match(source, /hashWorkEmailConfirmationSecret\(input\.token\)/);
  assert.match(source, /confirm_work_email_confirmation_token_for_user/);
  assert.doesNotMatch(source, /create_work_email_confirmation_token_for_user/);
  assert.match(source, /work_email_verification\.confirmed/);
  assert.match(source, /work_email_verification\.confirm_failed/);
  assert.match(source, /getCurrentAppAccessContext/);
  assert.match(source, /getPrivateAppGateResult/);
  assert.match(source, /gate\.kind === "allow" \? AUTH_ROUTES\.app : gate\.path/);
  assert.doesNotMatch(source, /beta_access|grant beta|role claim|base claim|proof_file/i);
});
