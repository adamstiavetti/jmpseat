import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  hashBetaInviteCode,
  generateBetaInviteCodeRecords,
  normalizeBetaInviteCodeInput,
} from "../../src/lib/betaAccess/inviteCodeShared.ts";
import {
  redeemBetaInviteCodeWithDependencies,
} from "../../src/lib/betaAccess/inviteCodeCore.ts";

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

function getInviteMigrationSql() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_add_beta_invite_code_foundation.sql"),
      )
    : [];

  assert.equal(migrationNames.length, 1, "expected one beta invite-code migration");

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("beta invite code generation uses grouped non-personal plaintext and stores separate hashes", () => {
  const records = generateBetaInviteCodeRecords(12);
  const plaintextCodes = new Set(records.map((record) => record.plaintextCode));
  const hashes = new Set(records.map((record) => record.codeHash));

  assert.equal(records.length, 12);
  assert.equal(plaintextCodes.size, 12);
  assert.equal(hashes.size, 12);

  for (const record of records) {
    assert.match(record.plaintextCode, /^[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}$/);
    assert.match(record.codeHash, /^[a-f0-9]{64}$/);
    assert.notEqual(record.codeHash, record.plaintextCode);
  }
});

test("beta invite code normalization accepts spaces/hyphens but rejects ambiguous inventory probes", () => {
  assert.equal(
    normalizeBetaInviteCodeInput("abcd efgh jklm npqr"),
    "ABCD-EFGH-JKLM-NPQR",
  );
  assert.equal(
    normalizeBetaInviteCodeInput("abcd-efgh-jklm-npqr"),
    "ABCD-EFGH-JKLM-NPQR",
  );
  assert.equal(normalizeBetaInviteCodeInput("ABCD-EFGH-JKLM-NPQ1"), null);
  assert.equal(normalizeBetaInviteCodeInput("ABCD-EFGH-JKLM"), null);
});

test("valid verified user redemption hashes the code before calling storage", async () => {
  const calls: string[] = [];
  const failures: Array<unknown> = [];

  const result = await redeemBetaInviteCodeWithDependencies("ABCD-EFGH-JKLM-NPQR", {
    userId: "user-1",
    betaActive: false,
    airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
    storageReady: true,
    redeemCodeHash: async (codeHash) => {
      calls.push(codeHash);
      return { ok: true, code: "beta_invite_redeemed" };
    },
    recordFailure: async (failure) => {
      failures.push(failure);
    },
  });

  assert.deepEqual(result, {
    ok: true,
    code: "redeemed",
    message: "Beta invite code redeemed. App access will open after the access checks refresh.",
  });
  assert.deepEqual(calls, [hashBetaInviteCode("ABCD-EFGH-JKLM-NPQR")]);
  assert.equal(failures.length, 0);
});

test("redemption requires authenticated user and verified airline-email eligibility", async () => {
  const calls: string[] = [];
  const failures: Array<unknown> = [];
  const redeemCodeHash = async (codeHash: string) => {
    calls.push(codeHash);
    return { ok: true, code: "beta_invite_redeemed" };
  };
  const recordFailure = async (failure: unknown) => {
    failures.push(failure);
  };

  assert.equal(
    (
      await redeemBetaInviteCodeWithDependencies("ABCD-EFGH-JKLM-NPQR", {
        userId: null,
        betaActive: false,
        airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
        storageReady: true,
        redeemCodeHash,
        recordFailure,
      })
    ).code,
    "authenticated_user_required",
  );

  assert.equal(
    (
      await redeemBetaInviteCodeWithDependencies("ABCD-EFGH-JKLM-NPQR", {
        userId: "user-1",
        betaActive: false,
        airlineEmailAccessState: NOT_VERIFIED_AIRLINE_EMAIL,
        storageReady: true,
        redeemCodeHash,
        recordFailure,
      })
    ).code,
    "airline_email_required",
  );

  assert.equal(calls.length, 0);
  assert.equal(failures.length, 2);
});

test("redemption fails safely for active beta, not-ready storage, invalid, and unavailable codes", async () => {
  const calls: string[] = [];
  const failures: Array<unknown> = [];
  const base = {
    userId: "user-1",
    airlineEmailAccessState: VERIFIED_AIRLINE_EMAIL,
    recordFailure: async (failure: unknown) => {
      failures.push(failure);
    },
  };

  assert.equal(
    (
      await redeemBetaInviteCodeWithDependencies("ABCD-EFGH-JKLM-NPQR", {
        ...base,
        betaActive: true,
        storageReady: true,
        redeemCodeHash: async (codeHash) => {
          calls.push(codeHash);
          return null;
        },
      })
    ).code,
    "already_has_beta_access",
  );

  assert.equal(
    (
      await redeemBetaInviteCodeWithDependencies("ABCD-EFGH-JKLM-NPQR", {
        ...base,
        betaActive: false,
        storageReady: false,
        redeemCodeHash: async (codeHash) => {
          calls.push(codeHash);
          return null;
        },
      })
    ).code,
    "not_ready",
  );

  assert.equal(
    (
      await redeemBetaInviteCodeWithDependencies("bad-code", {
        ...base,
        betaActive: false,
        storageReady: true,
        redeemCodeHash: async (codeHash) => {
          calls.push(codeHash);
          return null;
        },
      })
    ).code,
    "invalid_or_unavailable_code",
  );

  assert.equal(
    (
      await redeemBetaInviteCodeWithDependencies("ABCD-EFGH-JKLM-NPQR", {
        ...base,
        betaActive: false,
        storageReady: true,
        redeemCodeHash: async (codeHash) => {
          calls.push(codeHash);
          return { ok: false, code: "invalid_or_unavailable_code" };
        },
      })
    ).code,
    "invalid_or_unavailable_code",
  );

  assert.equal(calls.length, 1, "only the unavailable valid code reaches storage");
  assert.equal(failures.length, 3);
});

test("beta invite migration creates hash-only single-use tables and service-only redemption", () => {
  const sql = getInviteMigrationSql();

  assert.match(sql, /create table public\.beta_invite_batches/i);
  assert.match(sql, /create table public\.beta_invite_codes/i);
  assert.match(sql, /code_hash text not null unique/i);
  assert.match(sql, /max_redemptions integer not null default 1/i);
  assert.match(sql, /redeemed_count integer not null default 0/i);
  assert.match(sql, /status in \('active', 'redeemed', 'revoked', 'expired'\)/i);
  assert.match(sql, /alter table public\.beta_invite_batches enable row level security/i);
  assert.match(sql, /alter table public\.beta_invite_codes enable row level security/i);
  assert.match(sql, /add column invite_code_id uuid references public\.beta_invite_codes/i);
  assert.match(sql, /create or replace function public\.redeem_beta_invite_code_for_service/i);
  assert.match(sql, /revoke execute on function public\.redeem_beta_invite_code_for_service/i);
  assert.match(sql, /grant execute on function public\.redeem_beta_invite_code_for_service.*service_role/is);
  assert.doesNotMatch(sql, /plaintext_code|plain_text_code|raw_code_value/i);
  assert.doesNotMatch(sql, /grant execute on function public\.redeem_beta_invite_code_for_service.*authenticated/is);
});

test("beta invite migration lets redeemed rows survive auth user deletion", () => {
  const sql = getInviteMigrationSql();

  assert.match(
    sql,
    /redeemed_by_user_id uuid references auth\.users \(id\) on delete set null/i,
  );
  assert.match(sql, /status = 'redeemed'\s+and redeemed_count >= 1\s+and redeemed_at is not null/i);
  assert.doesNotMatch(
    sql,
    /status = 'redeemed'[\s\S]*?redeemed_by_user_id is not null[\s\S]*?\)\s*or/i,
  );
  assert.match(
    sql,
    /status <> 'redeemed'\s+and redeemed_count = 0\s+and redeemed_by_user_id is null\s+and redeemed_at is null/i,
  );
  assert.match(sql, /redeemed_count integer not null default 0/i);
  assert.match(sql, /redeemed_at timestamptz/i);
});

test("beta invite migration blocks redeemed, revoked, expired, and paused batch codes", () => {
  const sql = getInviteMigrationSql();

  assert.match(sql, /code_row\.status = 'active'/i);
  assert.match(sql, /code_row\.redeemed_count = 0/i);
  assert.match(sql, /batch_row\.status = 'active'/i);
  assert.match(sql, /code_row\.expires_at is null or code_row\.expires_at > v_now/i);
  assert.match(sql, /batch_row\.expires_at is null or batch_row\.expires_at > v_now/i);
});

test("operator generation foundation is service-only and requires manage beta invites scope", () => {
  const sql = getInviteMigrationSql();
  const accessSource = readFileSync(
    new URL("../../src/lib/admin/access.ts", import.meta.url),
    "utf8",
  );
  const serverSource = readFileSync(
    new URL("../../src/lib/betaAccess/inviteCodes.ts", import.meta.url),
    "utf8",
  );

  assert.match(sql, /operator\.manage_beta_invites/i);
  assert.match(accessSource, /operator\.manage_beta_invites/i);
  assert.match(serverSource, /requireOperatorScope\(BETA_INVITE_OPERATOR_SCOPE\)/);
  assert.match(sql, /create_beta_invite_batch_for_service/i);
  assert.match(sql, /grant execute on function public\.create_beta_invite_batch_for_service.*service_role/is);
  assert.doesNotMatch(sql, /grant execute on function public\.create_beta_invite_batch_for_service.*authenticated/is);
});

test("access-hold shows invite redemption only after airline-email verification and does not reintroduce proof upload", () => {
  const source = readFileSync(
    new URL("../../app/app/access-hold/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /redeemBetaInviteCodeAction/);
  assert.match(source, /doesLaunchModeRequireBeta\(context\.launchMode\)/);
  assert.match(source, /!context\.betaActive/);
  assert.match(source, /airlineEmailAccessState\.airlineEmailVerified/);
  assert.match(source, /Invite codes control private-testing capacity only/i);
  assert.match(source, /do not replace airline-email verification/i);
  assert.match(source, /first-base or broader launch/i);
  assert.match(source, /does\s+not\s+require\s+a\s+beta\s+invite\s+code/i);
  assert.doesNotMatch(
    source,
    /type="file"|accept=|storage_path|signed_url|proof_file|badge_file/i,
  );
});

test("beta invite implementation does not issue role or base claims or change launch-mode beta bypass", () => {
  const inviteSource = readFileSync(
    new URL("../../src/lib/betaAccess/inviteCodes.ts", import.meta.url),
    "utf8",
  );
  const accessSource = readFileSync(
    new URL("../../src/lib/privateApp/access.ts", import.meta.url),
    "utf8",
  );

  assert.match(accessSource, /mode === "private_testing" \|\| mode === "internal_test"/);
  assert.doesNotMatch(accessSource, /invite/i);
  assert.doesNotMatch(
    inviteSource,
    /verification_claims|claim_type|insert\([^)]*role|insert\([^)]*base/i,
  );
});
