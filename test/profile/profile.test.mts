import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  getProfileSaveErrorMessage,
  getProfileCompletionState,
  normalizeHandle,
} from "../../src/lib/profile/profile.ts";

test("normalizeHandle trims, lowercases, and drops a leading at-sign", () => {
  assert.equal(normalizeHandle("  @SkyByrdCrew  "), "skybyrdcrew");
  assert.equal(normalizeHandle("  DEN.Crew  "), "dencrew");
  assert.equal(normalizeHandle(""), null);
});

test("profile completion requires all self-declared foundation fields", () => {
  assert.equal(
    getProfileCompletionState({
      handle: "jumpseatden",
      display_name: "Alex Lane",
      claimed_airline: "United",
      claimed_role: "Flight Attendant",
      claimed_base: "DEN",
    }).isComplete,
    true,
  );

  assert.equal(
    getProfileCompletionState({
      handle: "jumpseatden",
      display_name: "Alex Lane",
      claimed_airline: "United",
      claimed_role: "",
      claimed_base: "DEN",
    }).isComplete,
    false,
  );
});

test("duplicate handle conflicts map to a friendly user-facing message", () => {
  assert.equal(
    getProfileSaveErrorMessage({
      code: "23505",
      message: 'duplicate key value violates unique constraint "profiles_handle_key"',
    }),
    "That handle is already taken. Try another one.",
  );
});

test("dedicated profile onboarding page exists and keeps verification separate", () => {
  const source = readFileSync(
    new URL("../../app/app/profile/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /Complete your profile/i);
  assert.match(source, /minimal onboarding/i);
  assert.match(source, /self-declared/i);
  assert.match(source, /not verified claims yet/i);
  assert.match(source, /does not grant beta access/i);
  assert.match(source, /airline\s+employee\s+email\s+verification\s+remains\s+separate/i);
  assert.match(source, /does not\s+verify\s+airline-worker status/i);
  assert.doesNotMatch(source, /badge upload|storage|reviewer|worker verification request/i);
});

test("profiles migration exists with private per-user access controls", () => {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) => name.endsWith("_create_profiles.sql"))
    : [];

  assert.ok(migrationNames.length > 0, "expected a create_profiles migration");

  const migrationPath = path.join(migrationsDir.pathname, migrationNames[0] ?? "");
  const sql = readFileSync(migrationPath, "utf8");

  assert.match(sql, /create table public\.profiles/i);
  assert.match(sql, /profile_completed_at timestamptz/i);
  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /users can read their own profile/i);
  assert.match(sql, /users can update their own profile/i);
  assert.match(sql, /create or replace function public\.set_profiles_updated_at/i);
  assert.match(sql, /before update on public\.profiles/i);
});
