import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readBoardPostDetailMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_open_baseboard_post_detail_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T17 open Baseboard post detail RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const boardPostReadsSource = readFileSync(
  new URL("../../src/lib/community/boardPostReads.ts", import.meta.url),
  "utf8",
);
const dfwBaseboardRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/baseboard/page.tsx", import.meta.url),
  "utf8",
);
const dfwBaseboardDetailRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/baseboard/[postId]/page.tsx", import.meta.url),
  "utf8",
);
const shellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);
const shellStyles = readFileSync(
  new URL("../../src/components/privateApp/homeHubShell.module.css", import.meta.url),
  "utf8",
);
const docsSource = [
  "../../docs/ops/fbmvp-t17-dfw-baseboard-post-detail.md",
  "../../docs/BUILD_TICKETS.md",
  "../../docs/DATA_MODEL.md",
  "../../docs/ops/05b-first-base-mvp-planning.md",
]
  .map((docPath) =>
    existsSync(new URL(docPath, import.meta.url))
      ? readFileSync(new URL(docPath, import.meta.url), "utf8")
      : "",
  )
  .join("\n\n");

test("T17 migration adds a narrow safe detail read RPC", () => {
  const sql = readBoardPostDetailMigration();

  assert.match(sql, /create or replace function public\.get_open_baseboard_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_post_id uuid/i);
  assert.match(sql, /returns table/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /public\.current_user_can_read_open_board_posts\(\)/i);
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
  assert.match(sql, /board_posts\.id = p_post_id/i);
  assert.match(sql, /board_posts\.board_id = v_board_id/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /limit 1/i);
});

test("T17 detail RPC returns safe fields only and safe author labels", () => {
  const sql = readBoardPostDetailMigration();
  const returnSignature = sql.slice(
    sql.indexOf("returns table"),
    sql.indexOf("language plpgsql", sql.indexOf("returns table")),
  );

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

  assert.doesNotMatch(returnSignature, /author_user_id|user_id|email|claimed_|verification|evidence|reporter|proof|storage|signed/i);
  assert.doesNotMatch(sql, /auth\.users|raw_user_meta_data|claimed_airline|claimed_role|claimed_base/i);
  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|private path|proof upload/i);
});

test("T17 detail RPC grants execute only to authenticated and service_role", () => {
  const sql = readBoardPostDetailMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.get_open_baseboard_post\(text, uuid\) from public/i);
  assert.match(sql, /revoke execute on function public\.get_open_baseboard_post\(text, uuid\) from anon/i);
  assert.match(sql, /grant execute on function public\.get_open_baseboard_post\(text, uuid\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.get_open_baseboard_post\(text, uuid\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T17 migration adds no write policies or out-of-scope objects", () => {
  const sql = readBoardPostDetailMigration();
  const executableSql = sql
    .split("\n")
    .filter((line) => !/^\s*comment on function/i.test(line))
    .join("\n");

  assert.doesNotMatch(sql, /create table public\./i);
  assert.doesNotMatch(sql, /alter table public\.board_posts/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\.board_posts/i);
  assert.doesNotMatch(executableSql, /create table public\.(comments|post_comments|post_saves|saved_items|post_reactions|reactions)\b/i);
  assert.doesNotMatch(executableSql, /search_vector|to_tsvector|moderation queue|public sharing|seeded layover|crew picks ranking|proof upload/i);
});

test("T17 server helper reads DFW detail through the safe RPC", () => {
  assert.match(boardPostReadsSource, /import "server-only"/);
  assert.match(boardPostReadsSource, /getDfwBaseboardPost/);
  assert.match(boardPostReadsSource, /get_open_baseboard_post/);
  assert.match(boardPostReadsSource, /p_base_code: "DFW"/);
  assert.match(boardPostReadsSource, /p_post_id: normalizedPostId/);
  assert.match(boardPostReadsSource, /isUuid\(normalizedPostId\)/);
  assert.match(boardPostReadsSource, /post: null/);
  assert.match(boardPostReadsSource, /authorLabel/);
  assert.match(boardPostReadsSource, /"jmpseat member"/);

  assert.doesNotMatch(boardPostReadsSource, /createBrowserClient|from\("board_posts"\)|service_role/);
  assert.doesNotMatch(boardPostReadsSource, /author_user_id|email|claimedAirline|claimedRole|claimedBase|verification evidence|reporter_user_id|storage_path|signed_url/i);
});

test("T17 detail route gates before reading and remains render-only", () => {
  assert.match(dfwBaseboardDetailRouteSource, /dynamic = "force-dynamic"/);
  assert.match(dfwBaseboardDetailRouteSource, /requireDfwHubRouteAccess/);
  assert.match(dfwBaseboardDetailRouteSource, /section: "dfw-baseboard"/);
  assert.match(
    dfwBaseboardDetailRouteSource,
    /await requireDfwHubRouteAccess[\s\S]*await getDfwBaseboardPost/s,
  );
  assert.match(dfwBaseboardDetailRouteSource, /DfwBaseboardPostDetailShell/);
  assert.match(dfwBaseboardDetailRouteSource, /reportDfwBaseboardPostAction/);
  assert.match(dfwBaseboardDetailRouteSource, /DFW_BASEBOARD_REPORT_STATUS_PARAM/);

  assert.doesNotMatch(dfwBaseboardDetailRouteSource, /create_open_baseboard_post|report_open_baseboard_post|moderate_open_baseboard_post|create_board_post/);
  assert.doesNotMatch(dfwBaseboardDetailRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T17 list cards link to private detail routes without public sharing", () => {
  assert.match(shellSource, /getDfwBaseboardPostHref/);
  assert.match(shellSource, /\/app\/hubs\/dfw\/baseboard\/\$\{encodeURIComponent\(postId\)\}/);
  assert.match(shellSource, /href=\{getDfwBaseboardPostHref\(post\.id\)\}/);
  assert.match(shellSource, /postTitleLink/);
  assert.match(shellStyles, /postTitleLink/);
  assert.match(dfwBaseboardRouteSource, /DfwHubSectionReadOnlyShell/);

  assert.doesNotMatch(shellSource, /share button|copy link|externalUrl|publicUrl/i);
});

test("T17 detail UI renders safe read-only post detail with report affordance", () => {
  assert.match(shellSource, /DfwBaseboardPostDetailShell/);
  assert.match(shellSource, /Back to DFW Baseboard/);
  assert.match(shellSource, /That DFW Baseboard post is unavailable\./);
  assert.match(shellSource, /post\.title/);
  assert.match(shellSource, /post\.body/);
  assert.match(shellSource, /post\.authorLabel/);
  assert.match(shellSource, /post\.contentType/);
  assert.match(shellSource, /post\.category/);
  assert.match(shellSource, /post\.isPinned/);
  assert.match(shellSource, /DfwBaseboardReportForm/);
  assert.match(shellSource, /Report this post/);
  assert.match(shellSource, /Thanks — the post was reported for review\./);
  assert.match(shellSource, /Choose a report reason before submitting\./);
  assert.match(shellSource, /jmpseat could not submit that report right now\. Try again in a moment\./);
  assert.match(shellStyles, /postDetailSurface/);
  assert.match(shellStyles, /postDetailCard/);
  assert.match(shellStyles, /postDetailBody/);

  assert.doesNotMatch(shellSource, /comment form|reply form|save button|reaction button|search backend|moderation queue UI/i);
  assert.doesNotMatch(shellSource, /lounge posting form|seeded layover card|crew picks ranking|proof upload field|public sharing button/i);
});

test("T17 docs describe local runtime-pending detail scope", () => {
  assert.match(docsSource, /FBMVP-T17/i);
  assert.match(docsSource, /DFW Baseboard Post Detail/i);
  assert.match(docsSource, /runtime-pending|runtime pending/i);
  assert.match(docsSource, /get_open_baseboard_post/i);
  assert.match(docsSource, /private route gate/i);
  assert.match(docsSource, /safe DB read RPC|safe read RPC/i);
  assert.match(docsSource, /report affordance/i);
  assert.match(docsSource, /safe fields only/i);
  assert.match(docsSource, /hidden\/removed posts are excluded/i);
  assert.match(docsSource, /status = 'published'[\s\S]*visibility = 'board'|published \/ board/i);
  assert.match(docsSource, /broad supabase db push remains unsafe/i);
  assert.match(docsSource, /targeted runtime preflight\/apply|targeted preflight\/apply/i);
  assert.match(docsSource, /comments/i);
  assert.match(docsSource, /replies/i);
  assert.match(docsSource, /saves/i);
  assert.match(docsSource, /reactions/i);
  assert.match(docsSource, /search/i);
  assert.match(docsSource, /moderation queue UI/i);
  assert.match(docsSource, /public sharing/i);
  assert.match(docsSource, /lounge|restricted/i);
  assert.match(docsSource, /Layovers/i);
  assert.match(docsSource, /Crew Picks/i);
  assert.match(docsSource, /proof-upload|proof upload/i);
});
