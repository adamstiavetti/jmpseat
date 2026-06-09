import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readHomeBaseBoardFollowsMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_home_base_board_follows.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T06 home-base/board-follow migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

function readHomeBaseRpcGrantHardeningMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_harden_home_base_rpc_execute_grants.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T06 home-base RPC execute-grant hardening migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("T06 migration creates home-base preferences and board follows with conservative RLS", () => {
  const sql = readHomeBaseBoardFollowsMigration();

  assert.match(sql, /create table public\.user_home_base_preferences/i);
  assert.match(sql, /user_id uuid primary key references auth\.users\s*\(id\) on delete cascade/i);
  assert.match(sql, /base_id uuid not null references public\.bases\s*\(id\)/i);
  assert.match(sql, /selected_at timestamptz not null default now\(\)/i);
  assert.match(sql, /updated_at timestamptz not null default now\(\)/i);

  assert.match(sql, /create table public\.board_follows/i);
  assert.match(sql, /id uuid primary key default gen_random_uuid\(\)/i);
  assert.match(sql, /user_id uuid not null references auth\.users\s*\(id\) on delete cascade/i);
  assert.match(sql, /board_id uuid not null references public\.boards\s*\(id\) on delete cascade/i);
  assert.match(sql, /source text not null default 'manual'/i);
  assert.match(sql, /notification_level text not null default 'default'/i);
  assert.match(sql, /is_favorite boolean not null default false/i);
  assert.match(sql, /followed_at timestamptz not null default now\(\)/i);
  assert.match(sql, /unique\s*\(user_id,\s*board_id\)/i);

  assert.match(sql, /source in \('manual', 'home_base', 'onboarding', 'system'\)/i);
  assert.match(sql, /notification_level in \('default', 'muted', 'important'\)/i);

  assert.match(sql, /alter table public\.user_home_base_preferences enable row level security/i);
  assert.match(sql, /alter table public\.board_follows enable row level security/i);
  assert.match(sql, /create policy "users can read their own home base preference"/i);
  assert.match(sql, /create policy "users can read their own board follows"/i);
  assert.match(sql, /using\s*\(\s*auth\.uid\(\)\s*=\s*user_id\s*\)/i);

  assert.doesNotMatch(sql, /to anon/i);
  assert.doesNotMatch(sql, /using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(sql, /with check\s*\(\s*true\s*\)/i);
});

test("T06 set-home-base RPC uses authenticated user state and auto-follows the base board", () => {
  const sql = readHomeBaseBoardFollowsMigration();

  assert.match(sql, /create or replace function public\.set_user_home_base\(p_base_code text\)/i);
  assert.match(sql, /create or replace function public\.get_current_user_home_base\(\)/i);
  assert.match(sql, /create or replace function public\.list_current_user_board_follows\(\)/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /bases\.code = upper\(trim\(p_base_code\)\)/i);
  assert.match(sql, /bases\.status = 'active'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /boards\.status = 'active'/i);
  assert.match(sql, /insert into public\.user_home_base_preferences/i);
  assert.match(sql, /on conflict \(user_id\) do update/i);
  assert.match(sql, /insert into public\.board_follows/i);
  assert.match(sql, /'home_base'/i);
  assert.match(sql, /on conflict \(user_id, board_id\) do update/i);

  assert.match(sql, /revoke all on function public\.set_user_home_base\(text\) from public/i);
  assert.match(sql, /revoke all on function public\.get_current_user_home_base\(\) from public/i);
  assert.match(sql, /revoke all on function public\.list_current_user_board_follows\(\) from public/i);
  assert.match(sql, /grant execute on function public\.set_user_home_base\(text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.get_current_user_home_base\(\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.list_current_user_board_follows\(\) to authenticated/i);
  assert.doesNotMatch(sql, /grant execute on function public\.set_user_home_base\(text\) to anon/i);
});

test("T06 RPC execute-grant hardening removes anon execution while preserving authenticated execution", () => {
  const t06Sql = readHomeBaseBoardFollowsMigration();
  const hardeningSql = readHomeBaseRpcGrantHardeningMigration();
  const grantLines = hardeningSql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(t06Sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(t06Sql, /if v_user_id is null/i);
  assert.match(t06Sql, /This is not authorization truth/i);
  assert.match(t06Sql, /Following a board does not grant restricted-board access/i);

  assert.match(hardeningSql, /revoke execute on function public\.set_user_home_base\(text\) from anon/i);
  assert.match(hardeningSql, /revoke execute on function public\.get_current_user_home_base\(\) from anon/i);
  assert.match(hardeningSql, /revoke execute on function public\.list_current_user_board_follows\(\) from anon/i);
  assert.match(hardeningSql, /revoke execute on function public\.set_user_home_base\(text\) from public/i);
  assert.match(hardeningSql, /revoke execute on function public\.get_current_user_home_base\(\) from public/i);
  assert.match(hardeningSql, /revoke execute on function public\.list_current_user_board_follows\(\) from public/i);
  assert.match(hardeningSql, /grant execute on function public\.set_user_home_base\(text\) to authenticated/i);
  assert.match(hardeningSql, /grant execute on function public\.get_current_user_home_base\(\) to authenticated/i);
  assert.match(hardeningSql, /grant execute on function public\.list_current_user_board_follows\(\) to authenticated/i);
  assert.match(hardeningSql, /grant execute on function public\.set_user_home_base\(text\) to service_role/i);
  assert.match(hardeningSql, /grant execute on function public\.get_current_user_home_base\(\) to service_role/i);
  assert.match(hardeningSql, /grant execute on function public\.list_current_user_board_follows\(\) to service_role/i);
  assert.match(hardeningSql, /auth\.uid\(\) internally/i);
  assert.match(hardeningSql, /anon execute is revoked for least privilege/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(hardeningSql, /using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(hardeningSql, /with check\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(hardeningSql, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
});

test("T06 does not turn profile text, follows, or restricted lounges into authorization truth", () => {
  const sql = readHomeBaseBoardFollowsMigration();

  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
  assert.doesNotMatch(sql, /profile_completed_at|beta_access|verification_claims|verification_requests/i);
  assert.doesNotMatch(sql, /access_grant|grant_app_access|app_access|private_app_access/i);
  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
  assert.doesNotMatch(sql, /create table public\.(posts|comments|post_comments)\b/i);
  assert.doesNotMatch(sql, /create table public\.(board_memberships|board_access_requests)\b/i);
  assert.doesNotMatch(sql, /create table public\.(saved_items|post_saves|reactions|post_reactions)\b/i);
  assert.doesNotMatch(sql, /create table public\.(reports|moderation_actions)\b/i);
  assert.doesNotMatch(sql, /search_vector|to_tsvector|create index .* using gin/i);
  assert.doesNotMatch(sql, /verified_lounge[\s\S]*(grant|authorize|allow)/i);
});

test("T06 server helper uses the set-home-base RPC instead of profile claims", () => {
  const source = readFileSync(
    new URL("../../src/lib/community/homeBase.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /import "server-only"/);
  assert.match(source, /setUserHomeBaseByCode/);
  assert.match(source, /\.rpc\("set_user_home_base"/);
  assert.match(source, /getCurrentUserHomeBase/);
  assert.match(source, /\.rpc\("get_current_user_home_base"/);
  assert.match(source, /listCurrentUserBoardFollows/);
  assert.match(source, /\.rpc\("list_current_user_board_follows"/);
  assert.doesNotMatch(source, /claimed_airline|claimed_role|claimed_base/i);
  assert.doesNotMatch(source, /\.from\("profiles"\)/);
  assert.doesNotMatch(source, /\.from\("board_follows"\)\.insert|\.from\("board_follows"\)\.upsert/i);
});

test("T06 docs define no Home Base as a valid initial rollout state", () => {
  const docs = [
    "../../docs/strategy/home-base-board-follow-decision.md",
    "../../docs/ops/fbmvp-t06-home-base-board-follows.md",
    "../../docs/ops/05b-first-base-mvp-planning.md",
    "../../docs/DATA_MODEL.md",
  ]
    .map((docPath) => readFileSync(new URL(docPath, import.meta.url), "utf8"))
    .join("\n\n");

  assert.match(docs, /no Home Base preference is created/i);
  assert.match(docs, /still allowed into the app/i);
  assert.match(docs, /exploratory\/default experience/i);
  assert.match(docs, /optional personalization/i);
  assert.doesNotMatch(docs, /Home Base is required/i);
  assert.doesNotMatch(docs, /users must set a Home Base/i);
  assert.doesNotMatch(docs, /required profile or onboarding state/i);
});
