import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const migrationName = readdirSync(
  new URL("../../supabase/migrations", import.meta.url),
).find((name) => /create_board_post_report_review_rpc\.sql$/.test(name));

const migrationSql = migrationName
  ? readFileSync(
      new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
      "utf8",
    )
  : "";

test("T18 migration creates only the safe DFW Baseboard report review RPC", () => {
  assert.ok(migrationName, "expected create_board_post_report_review_rpc migration");
  assert.match(
    migrationSql,
    /create or replace function public\.list_open_baseboard_post_reports\(\s*p_base_code text,\s*p_limit integer default 50\s*\)/i,
  );
  assert.doesNotMatch(migrationSql, /create table public\./i);
  assert.doesNotMatch(migrationSql, /alter table public\.board_posts/i);
  assert.doesNotMatch(migrationSql, /create policy[\s\S]*on public\.board_posts/i);
});

test("report review RPC is operator-only, locked down, and scoped to active open Baseboard reports", () => {
  assert.match(migrationSql, /security definer/i);
  assert.match(migrationSql, /set search_path = public, pg_temp/i);
  assert.match(migrationSql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(migrationSql, /if v_user_id is null then/i);
  assert.match(
    migrationSql,
    /public\.is_operator_with_scope\('operator\.community_moderation'\)/i,
  );
  assert.match(migrationSql, /from public\.bases[\s\S]*bases\.code = v_base_code/i);
  assert.match(migrationSql, /boards\.visibility = 'open_verified'/i);
  assert.match(migrationSql, /board_types\.key = 'base_board'/i);
  assert.match(migrationSql, /board_post_reports\.status in \('open', 'reviewing'\)/i);
  assert.match(migrationSql, /board_posts\.board_id = v_board_id/i);
  assert.match(migrationSql, /least\(greatest\(coalesce\(p_limit, 50\), 1\), 100\)/i);
});

test("report review RPC returns safe operator-review fields only", () => {
  const returnsBlock =
    migrationSql.match(/returns table\s*\(([\s\S]*?)\)\s*language plpgsql/i)?.[1] ??
    "";

  assert.match(returnsBlock, /report_id uuid/i);
  assert.match(returnsBlock, /post_id uuid/i);
  assert.match(returnsBlock, /post_title text/i);
  assert.match(returnsBlock, /post_body_preview text/i);
  assert.match(returnsBlock, /post_author_label text/i);
  assert.match(returnsBlock, /reason text/i);
  assert.match(returnsBlock, /details text/i);
  assert.match(returnsBlock, /report_status text/i);
  assert.match(returnsBlock, /reported_at timestamptz/i);
  assert.match(migrationSql, /profiles\.handle/i);
  assert.match(migrationSql, /'jmpseat member'/i);
  assert.doesNotMatch(
    returnsBlock,
    /reporter_user_id|reporter_email|author_user_id|email|claimed|verification|evidence|proof|storage|signed|private/i,
  );
  assert.doesNotMatch(
    migrationSql,
    /verification_evidence|verification_requests|verification_claims|storage\.|signed_url|private_path/i,
  );
});

test("report review RPC grants execute only to authenticated and service role", () => {
  assert.match(
    migrationSql,
    /revoke all on function public\.list_open_baseboard_post_reports\(text, integer\) from public/i,
  );
  assert.match(
    migrationSql,
    /revoke execute on function public\.list_open_baseboard_post_reports\(text, integer\) from anon/i,
  );
  assert.match(
    migrationSql,
    /grant execute on function public\.list_open_baseboard_post_reports\(text, integer\) to authenticated/i,
  );
  assert.match(
    migrationSql,
    /grant execute on function public\.list_open_baseboard_post_reports\(text, integer\) to service_role/i,
  );
});

test("server-only moderation report helper returns safe fields from the RPC", () => {
  const helperSource = readFileSync(
    new URL("../../src/lib/admin/communityModerationReports.ts", import.meta.url),
    "utf8",
  );

  assert.match(helperSource, /import "server-only"/);
  assert.match(helperSource, /list_open_baseboard_post_reports/);
  assert.match(helperSource, /p_base_code:\s*"DFW"/);
  assert.match(helperSource, /postBodyPreview/);
  assert.match(helperSource, /authorLabel/);
  assert.doesNotMatch(
    helperSource,
    /reporter_user_id|reporterEmail|author_user_id|authorUserId|claimed|verification|evidence|proof|storage|signed|private/i,
  );
});
