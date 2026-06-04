import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  BETA_ACCESS_ACTIVE_MESSAGE,
  BETA_ACCESS_STATUSES,
  getBetaAccessState,
  getPrivateAppPathForState,
  isBetaAccessActive,
} from "../../src/lib/betaAccess/betaAccess.ts";

test("beta access statuses stay aligned with the E03-T05 state model", () => {
  assert.deepEqual(BETA_ACCESS_STATUSES, [
    "none",
    "waitlisted",
    "invited",
    "active",
    "denied",
    "revoked",
    "paused",
  ]);
});

test("only active beta access grants entry beyond the hold state", () => {
  assert.equal(isBetaAccessActive("active"), true);
  assert.equal(isBetaAccessActive("invited"), false);
  assert.equal(isBetaAccessActive("none"), false);
});

test("missing beta record resolves to the none state", () => {
  assert.equal(getBetaAccessState(null), "none");
  assert.equal(getBetaAccessState({ status: "waitlisted" }), "waitlisted");
});

test("private app route resolution keeps profile and beta access separate", () => {
  assert.equal(
    getPrivateAppPathForState({
      hasCompletedProfile: false,
      betaStatus: "active",
      next: "/app",
    }),
    "/app/profile",
  );

  assert.equal(
    getPrivateAppPathForState({
      hasCompletedProfile: true,
      betaStatus: "invited",
      next: "/app",
    }),
    "/app/access-hold",
  );

  assert.equal(
    getPrivateAppPathForState({
      hasCompletedProfile: true,
      betaStatus: "active",
      next: "/app/home",
    }),
    "/app/home",
  );
});

test("access-hold page exists and keeps beta access separate from verification", () => {
  const source = readFileSync(
    new URL("../../app/app/access-hold/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /beta access/i);
  assert.match(source, /profile is complete/i);
  assert.match(source, /separate from worker verification/i);
  assert.match(source, /notify you/i);
  assert.doesNotMatch(source, /type="file"|supabase storage|reviewer dashboard|verification request/i);
});

test("beta access migration exists with private read access and admin-safe write boundaries", () => {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) => name.endsWith("_create_beta_access.sql"))
    : [];

  assert.ok(migrationNames.length > 0, "expected a create_beta_access migration");

  const migrationPath = path.join(migrationsDir.pathname, migrationNames[0] ?? "");
  const sql = readFileSync(migrationPath, "utf8");

  assert.match(sql, /create table public\.beta_access/i);
  assert.match(sql, /status text not null/i);
  assert.match(sql, /check \(status in \('waitlisted', 'invited', 'active', 'denied', 'revoked', 'paused'\)\)/i);
  assert.match(sql, /create unique index .*beta_access_user_id/i);
  assert.match(sql, /create index .*beta_access_status/i);
  assert.match(sql, /alter table public\.beta_access enable row level security/i);
  assert.match(sql, /users can read their own beta access/i);
  assert.doesNotMatch(sql, /users can insert their own beta access|users can update their own beta access/i);
  assert.match(sql, /set_beta_access_updated_at/i);
});

test("beta access active message stays honest about the placeholder app shell", () => {
  assert.match(BETA_ACCESS_ACTIVE_MESSAGE, /placeholder/i);
});
