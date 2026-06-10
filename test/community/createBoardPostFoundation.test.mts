import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readCreateBoardPostMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_board_post_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T13 create-board-post RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("T13 migration adds a server-controlled create-board-post RPC and eligibility helper only", () => {
  const sql = readCreateBoardPostMigration();

  assert.match(sql, /create or replace function public\.current_user_can_create_open_board_post\(\)/i);
  assert.match(sql, /create or replace function public\.create_board_post\(/i);
  assert.match(sql, /p_board_id uuid/i);
  assert.match(sql, /p_title text/i);
  assert.match(sql, /p_body text/i);
  assert.match(sql, /p_content_type text default 'note'/i);
  assert.match(sql, /p_category text default 'general'/i);
  assert.match(sql, /returns uuid/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);

  assert.doesNotMatch(sql, /create table public\./i);
  assert.doesNotMatch(sql, /alter table public\.board_posts/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant insert on table public\.board_posts/i);
});

test("T13 create-board-post RPC requires DB-level contribution eligibility", () => {
  const sql = readCreateBoardPostMigration();
  const claimBranch = sql.slice(sql.indexOf("from public.verification_claims"));

  assert.match(sql, /public\.current_user_can_create_open_board_post\(\)/i);
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
  assert.match(sql, /verified work-email/i);
  assert.match(sql, /Contribution eligibility required/i);

  assert.match(claimBranch, /verification_claims\.request_id is not null/i);
  assert.match(claimBranch, /verification_requests\.id = verification_claims\.request_id/i);
  assert.match(claimBranch, /verification_requests\.method = 'work_email'/i);
  assert.match(claimBranch, /verification_evidence\.request_id = verification_claims\.request_id/i);
  assert.match(claimBranch, /verification_evidence\.evidence_type = 'work_email'/i);
  assert.match(claimBranch, /verification_evidence\.metadata->>'support_result' = 'supported_domain'/i);
  assert.match(claimBranch, /verification_evidence\.metadata->>'verification_method' = 'work_email'/i);
  assert.match(claimBranch, /inner join public\.approved_email_domains/i);
  assert.match(claimBranch, /approved_email_domains\.status = 'active'/i);
  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
});

test("T13 create-board-post RPC uses auth.uid and validates active open verified Baseboards", () => {
  const sql = readCreateBoardPostMigration();

  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /from public\.boards/i);
  assert.match(sql, /inner join public\.board_types/i);
  assert.match(sql, /boards\.id = p_board_id/i);
  assert.match(sql, /boards\.status = 'active'/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /board_types\.is_active = true/i);
  assert.match(sql, /Active open verified base board not found/i);

  assert.doesNotMatch(sql, /boards\.visibility = 'restricted'/i);
  assert.doesNotMatch(sql, /lounge_memberships[\s\S]*(insert|grant|allow|authorize)/i);
  assert.doesNotMatch(sql, /board_follows[\s\S]*(insert|grant|allow|authorize)/i);
  assert.doesNotMatch(sql, /user_home_base_preferences[\s\S]*(insert|grant|allow|authorize)/i);
  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
});

test("T13 create-board-post RPC trims and bounds title and body", () => {
  const sql = readCreateBoardPostMigration();

  assert.match(sql, /v_title text := trim\(coalesce\(p_title, ''\)\)/i);
  assert.match(sql, /v_body text := trim\(coalesce\(p_body, ''\)\)/i);
  assert.match(sql, /char_length\(v_title\) = 0/i);
  assert.match(sql, /char_length\(v_body\) = 0/i);
  assert.match(sql, /char_length\(v_title\) > 120/i);
  assert.match(sql, /char_length\(v_body\) > 4000/i);
  assert.match(sql, /Post title is required/i);
  assert.match(sql, /Post body is required/i);
  assert.match(sql, /Post title is too long/i);
  assert.match(sql, /Post body is too long/i);
});

test("T13 create-board-post RPC constrains content type and category allowlists", () => {
  const sql = readCreateBoardPostMigration();

  assert.match(sql, /v_content_type text := lower\(trim\(coalesce\(nullif\(p_content_type, ''\), 'note'\)\)\)/i);
  assert.match(sql, /v_category text := lower\(trim\(coalesce\(nullif\(p_category, ''\), 'general'\)\)\)/i);
  assert.match(sql, /v_content_type not in \('note', 'question', 'recommendation', 'guide'\)/i);
  assert.match(sql, /v_category not in \([\s\S]*'general'[\s\S]*'food'[\s\S]*'coffee'[\s\S]*'transportation'[\s\S]*'fitness'[\s\S]*'things_to_do'[\s\S]*'crew_tips'[\s\S]*'safety'[\s\S]*'base_q_and_a'[\s\S]*'operations_note'/i);
});

test("T13 create-board-post RPC forces safe post fields on insert", () => {
  const sql = readCreateBoardPostMigration();

  assert.match(sql, /insert into public\.board_posts/i);
  assert.match(sql, /author_user_id[\s\S]*v_user_id/i);
  assert.match(sql, /status[\s\S]*'published'/i);
  assert.match(sql, /visibility[\s\S]*'board'/i);
  assert.match(sql, /is_admin_seeded[\s\S]*false/i);
  assert.match(sql, /is_pinned[\s\S]*false/i);
  assert.match(sql, /returning id into v_post_id/i);

  assert.doesNotMatch(sql, /p_author_user_id|p_status|p_visibility|p_is_admin_seeded|p_is_pinned/i);
  assert.doesNotMatch(sql, /removed_at|removed_by|removal_reason|operator_only|members_only/i);
});

test("T13 create-board-post RPC exposes execute only to authenticated and service_role", () => {
  const sql = readCreateBoardPostMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.create_board_post\(uuid, text, text, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.create_board_post\(uuid, text, text, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.create_board_post\(uuid, text, text, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.create_board_post\(uuid, text, text, text, text\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T13 keeps comments, reactions, saves, search, lounge posting, AI, proof uploads, and seed content out of scope", () => {
  const sql = readCreateBoardPostMigration();

  assert.doesNotMatch(sql, /create table public\.(comments|post_comments|comment_threads)\b/i);
  assert.doesNotMatch(sql, /create table public\.(saved_items|post_saves|reactions|post_reactions)\b/i);
  assert.doesNotMatch(sql, /search_vector|to_tsvector|create index .* using gin/i);
  assert.doesNotMatch(sql, /request_lounge_access|review_lounge_access_request|add_lounge_request_comment/i);
  assert.doesNotMatch(sql, /crew lead panel|lounge_admin_grants[\s\S]*(insert|update|grant)/i);
  assert.doesNotMatch(sql, /ai_|embedding|autopublish|auto-publish/i);
  assert.doesNotMatch(sql, /is_admin_seeded[\s\S]*true|seeded layover runtime content/i);
  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
});

test("T13 docs describe the server-controlled create-post foundation and runtime pass", () => {
  const docs = [
    "../../docs/ops/fbmvp-t13-create-post-foundation.md",
    "../../docs/BUILD_TICKETS.md",
    "../../docs/DATA_MODEL.md",
    "../../docs/ops/05b-first-base-mvp-planning.md",
    "../../docs/ops/fbmvp-t12-shared-post-thread-foundation.md",
    "../../docs/strategy/hub-board-taxonomy.md",
  ]
    .map((docPath) => readFileSync(new URL(docPath, import.meta.url), "utf8"))
    .join("\n\n");

  assert.match(docs, /FBMVP-T13/i);
  assert.match(docs, /server-controlled create-post foundation/i);
  assert.match(docs, /DB-level contribution eligibility|contribution eligibility/i);
  assert.match(docs, /auth alone is not enough/i);
  assert.match(docs, /completed profile/i);
  assert.match(docs, /active beta access|operator internal private-app access/i);
  assert.match(docs, /verified work-email|verified approved work email/i);
  assert.match(docs, /active open verified/i);
  assert.match(docs, /DFW Baseboard/i);
  assert.match(docs, /No lounge\/restricted posting|no lounge\/restricted posting|restricted lounge posting/i);
  assert.match(docs, /Home Base.*do not grant|Home Base\/follows\/self-declared/i);
  assert.match(docs, /self-declared/i);
  assert.match(docs, /moderation\/reporting is required|moderation and reporting/i);
  assert.match(docs, /runtime-applied/i);
  assert.match(docs, /fbmvp-t13-create-post-runtime-pass/i);
  assert.match(docs, /no user\/community content was created/i);
  assert.match(docs, /posting UI/i);
  assert.match(docs, /comments/i);
  assert.match(docs, /saves|reactions/i);
  assert.match(docs, /search backend/i);
  assert.match(docs, /AI/i);
  assert.match(docs, /seed content|seeded layover/i);

  assert.doesNotMatch(docs, /T13.*deployed/i);
});
