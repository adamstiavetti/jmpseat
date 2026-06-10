import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readBoardPostReadMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_board_post_read_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T14 board-post read RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const helperSource = existsSync(
  new URL("../../src/lib/community/boardPostReads.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostReads.ts", import.meta.url),
      "utf8",
    )
  : "";

test("T14 migration adds a narrow open Baseboard post read RPC and eligibility helper", () => {
  const sql = readBoardPostReadMigration();

  assert.match(sql, /create or replace function public\.current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /create or replace function public\.list_open_baseboard_posts\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_limit integer default 20/i);
  assert.match(sql, /returns table/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);

  assert.doesNotMatch(sql, /create table public\./i);
  assert.doesNotMatch(sql, /alter table public\.board_posts/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\.board_posts/i);
});

test("T14 read eligibility is not auth-only and preserves private beta boundaries", () => {
  const sql = readBoardPostReadMigration();

  assert.match(sql, /current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /profile_completed_at is not null/i);
  assert.match(sql, /from public\.profiles/i);
  assert.match(sql, /from public\.beta_access/i);
  assert.match(sql, /status = 'active'/i);
  assert.match(sql, /public\.is_operator_with_scope\('operator\.internal_private_app_access'\)/i);
  assert.match(sql, /from public\.verification_requests/i);
  assert.match(sql, /(from|join) public\.verification_evidence/i);
  assert.match(sql, /(from|join) public\.approved_email_domains/i);
  assert.match(sql, /method = 'work_email'/i);
  assert.match(sql, /evidence_type = 'work_email'/i);
  assert.match(sql, /support_result/i);
  assert.match(sql, /Read eligibility required/i);
  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
});

test("T14 read RPC targets active base by code and active open verified Baseboard posts", () => {
  const sql = readBoardPostReadMigration();

  assert.match(sql, /upper\(trim\(p_base_code\)\)/i);
  assert.match(sql, /from public\.bases/i);
  assert.match(sql, /bases\.code = v_base_code/i);
  assert.match(sql, /bases\.status = 'active'/i);
  assert.match(sql, /from public\.boards/i);
  assert.match(sql, /inner join public\.board_types/i);
  assert.match(sql, /boards\.base_id = v_base_id/i);
  assert.match(sql, /boards\.status = 'active'/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /board_types\.is_active = true/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /order by\s+board_posts\.is_pinned desc,\s+board_posts\.created_at desc/is);
  assert.doesNotMatch(sql, /boards\.visibility = 'restricted'/i);
  assert.doesNotMatch(sql, /members_only|operator_only/i);
});

test("T14 read RPC clamps limit and returns safe fields only", () => {
  const sql = readBoardPostReadMigration();
  const returnSignature = sql.slice(
    sql.indexOf("returns table"),
    sql.indexOf("language plpgsql", sql.indexOf("returns table")),
  );

  assert.match(sql, /least\(greatest\(coalesce\(p_limit, 20\), 1\), 50\)/i);
  assert.match(returnSignature, /\bid uuid\b/i);
  assert.match(returnSignature, /\btitle text\b/i);
  assert.match(returnSignature, /\bbody text\b/i);
  assert.match(returnSignature, /\bcontent_type text\b/i);
  assert.match(returnSignature, /\bcategory text\b/i);
  assert.match(returnSignature, /\bis_pinned boolean\b/i);
  assert.match(returnSignature, /\bcreated_at timestamptz\b/i);
  assert.match(returnSignature, /\bupdated_at timestamptz\b/i);
  assert.match(returnSignature, /\bauthor_label text\b/i);
  assert.match(sql, /coalesce\(nullif\(trim\(profiles\.handle\), ''\), 'jmpseat member'\)/i);

  assert.doesNotMatch(returnSignature, /author_user_id|user_id|email|claimed_|verification|evidence|proof|storage|signed/i);
  assert.doesNotMatch(sql, /auth\.users|raw_user_meta_data|claimed_airline|claimed_role|claimed_base/i);
  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
});

test("T14 read RPC exposes execute only to authenticated and service_role", () => {
  const sql = readBoardPostReadMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.current_user_can_read_open_board_posts\(\) from public/i);
  assert.match(sql, /revoke execute on function public\.current_user_can_read_open_board_posts\(\) from anon/i);
  assert.match(sql, /grant execute on function public\.current_user_can_read_open_board_posts\(\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.current_user_can_read_open_board_posts\(\) to service_role/i);
  assert.match(sql, /revoke all on function public\.list_open_baseboard_posts\(text, integer\) from public/i);
  assert.match(sql, /revoke execute on function public\.list_open_baseboard_posts\(text, integer\) from anon/i);
  assert.match(sql, /grant execute on function public\.list_open_baseboard_posts\(text, integer\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.list_open_baseboard_posts\(text, integer\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T14 server helper reads DFW posts through the RPC and exposes a safe UI model", () => {
  assert.match(helperSource, /import "server-only"/);
  assert.match(helperSource, /createClient/);
  assert.match(helperSource, /list_open_baseboard_posts/);
  assert.match(helperSource, /p_base_code: "DFW"/);
  assert.match(helperSource, /p_limit/);
  assert.match(helperSource, /authorLabel/);
  assert.match(helperSource, /"jmpseat member"/);
  assert.match(helperSource, /posts: \[\]/);
  assert.match(helperSource, /error: null/);
  assert.match(helperSource, /error/);

  assert.doesNotMatch(helperSource, /createBrowserClient|from\("board_posts"\)|create_board_post/);
  assert.doesNotMatch(helperSource, /author_user_id|email|claimedAirline|claimedRole|claimedBase|verification|evidence|proof|storagePath|signedUrl/i);
});

test("T14 keeps comments, reactions, saves, search, lounge posting, AI, proof uploads, and seed content out of scope", () => {
  const sql = readBoardPostReadMigration();
  const combined = `${sql}\n${helperSource}`;

  assert.doesNotMatch(combined, /create table public\.(comments|post_comments|comment_threads)\b/i);
  assert.doesNotMatch(combined, /create table public\.(saved_items|post_saves|reactions|post_reactions)\b/i);
  assert.doesNotMatch(combined, /search_vector|to_tsvector|create index .* using gin|search backend/i);
  assert.doesNotMatch(combined, /request_lounge_access|review_lounge_access_request|add_lounge_request_comment/i);
  assert.doesNotMatch(combined, /crew picks ranking|crew lead panel|lounge_admin_grants[\s\S]*(insert|update|grant)/i);
  assert.doesNotMatch(combined, /ai_|embedding|autopublish|auto-publish/i);
  assert.doesNotMatch(combined, /is_admin_seeded[\s\S]*true|seeded layover runtime content/i);
  assert.doesNotMatch(combined, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
});

test("T14 docs describe the runtime-applied read foundation and runtime pass", () => {
  const docs = [
    "../../docs/ops/fbmvp-t14-board-post-read-foundation.md",
    "../../docs/ops/fbmvp-t14-board-post-read-runtime-pass.md",
    "../../docs/BUILD_TICKETS.md",
    "../../docs/DATA_MODEL.md",
    "../../docs/ops/05b-first-base-mvp-planning.md",
  ]
    .map((docPath) => readFileSync(new URL(docPath, import.meta.url), "utf8"))
    .join("\n\n");

  assert.match(docs, /FBMVP-T14/i);
  assert.match(docs, /Board Post Read Foundation/i);
  assert.match(docs, /read-only DFW Baseboard/i);
  assert.match(docs, /runtime-applied/i);
  assert.match(docs, /fbmvp-t14-board-post-read-runtime-pass/i);
  assert.match(docs, /list_open_baseboard_posts/i);
  assert.match(docs, /current_user_can_read_open_board_posts/i);
  assert.match(docs, /handle only|profiles\.handle/i);
  assert.match(docs, /jmpseat member/i);
  assert.match(docs, /no composer|composer/i);
  assert.match(docs, /comments/i);
  assert.match(docs, /saves/i);
  assert.match(docs, /reactions/i);
  assert.match(docs, /search/i);
  assert.match(docs, /lounge|restricted/i);
  assert.match(docs, /proof-upload|proof upload/i);
  assert.match(docs, /broad supabase db push remains unsafe/i);
  assert.match(docs, /targeted runtime/i);
});
