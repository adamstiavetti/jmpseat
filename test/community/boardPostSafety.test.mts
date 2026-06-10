import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readBoardPostSafetyMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_board_post_safety_foundation.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T16 board-post-safety migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const safetyActionSource = existsSync(
  new URL("../../src/lib/community/boardPostSafetyActions.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostSafetyActions.ts", import.meta.url),
      "utf8",
    )
  : "";

const safetyActionStateSource = existsSync(
  new URL("../../src/lib/community/boardPostSafetyActionState.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostSafetyActionState.ts", import.meta.url),
      "utf8",
    )
  : "";

const dfwBaseboardRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/baseboard/page.tsx", import.meta.url),
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
const boardPostReadsSource = readFileSync(
  new URL("../../src/lib/community/boardPostReads.ts", import.meta.url),
  "utf8",
);
const boardPostReadMigrationSource = readFileSync(
  new URL(
    "../../supabase/migrations/20260610162000_create_board_post_read_rpc.sql",
    import.meta.url,
  ),
  "utf8",
);
const nonBaseboardRoutes = [
  "../../app/app/hubs/dfw/layovers/page.tsx",
  "../../app/app/hubs/dfw/lounges/page.tsx",
  "../../app/app/hubs/dfw/crew-picks/page.tsx",
].map((sourcePath) => readFileSync(new URL(sourcePath, import.meta.url), "utf8"));

const docsSource = [
  "../../docs/ops/fbmvp-t16-board-post-safety-foundation.md",
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

test("T16 migration creates a private board post report table", () => {
  const sql = readBoardPostSafetyMigration();

  assert.match(sql, /create table public\.board_post_reports/i);
  assert.match(sql, /id uuid primary key default gen_random_uuid\(\)/i);
  assert.match(sql, /post_id uuid not null references public\.board_posts \(id\)/i);
  assert.match(sql, /reporter_user_id uuid not null references auth\.users \(id\)/i);
  assert.match(sql, /reason text not null/i);
  assert.match(sql, /details text/i);
  assert.match(sql, /status text not null default 'open'/i);
  assert.match(sql, /reviewed_at timestamptz/i);
  assert.match(sql, /reviewed_by uuid references auth\.users \(id\)/i);
  assert.match(sql, /resolution_note text/i);
  assert.match(sql, /board_post_reports_reason_check[\s\S]*'spam'[\s\S]*'harassment'[\s\S]*'unsafe_info'[\s\S]*'privacy'[\s\S]*'off_topic'[\s\S]*'other'/i);
  assert.match(sql, /board_post_reports_status_check[\s\S]*'open'[\s\S]*'reviewing'[\s\S]*'resolved'[\s\S]*'dismissed'/i);
  assert.match(sql, /board_post_reports_details_length_check[\s\S]*char_length\(details\) <= 1000/i);
  assert.match(sql, /board_post_reports_resolution_note_length_check[\s\S]*char_length\(resolution_note\) <= 1000/i);
  assert.match(sql, /one_open_report_per_reporter_post/i);
  assert.match(sql, /alter table public\.board_post_reports enable row level security/i);
  assert.match(sql, /revoke all on table public\.board_post_reports from anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on table public\.board_post_reports to service_role/i);

  assert.doesNotMatch(sql, /create policy[\s\S]*on public\.board_post_reports[\s\S]*to anon/i);
  assert.doesNotMatch(sql, /using\s*\(\s*true\s*\)|with check\s*\(\s*true\s*\)/i);
});

test("T16 report RPC is gated, base-scoped, and only reports published board-visible posts", () => {
  const sql = readBoardPostSafetyMigration();

  assert.match(sql, /create or replace function public\.report_open_baseboard_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_post_id uuid/i);
  assert.match(sql, /p_reason text/i);
  assert.match(sql, /p_details text default null/i);
  assert.match(sql, /returns uuid/i);
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
  assert.match(sql, /from public\.board_posts/i);
  assert.match(sql, /board_posts\.id = p_post_id/i);
  assert.match(sql, /board_posts\.board_id = v_board_id/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /v_reason not in \('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other'\)/i);
  assert.match(sql, /char_length\(v_details\) > 1000/i);
  assert.match(sql, /reporter_user_id[\s\S]*v_user_id/i);
  assert.match(sql, /return v_report_id/i);
  assert.match(sql, /revoke all on function public\.report_open_baseboard_post\(text, uuid, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.report_open_baseboard_post\(text, uuid, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.report_open_baseboard_post\(text, uuid, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.report_open_baseboard_post\(text, uuid, text, text\) to service_role/i);

  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base|verification_evidence|storage_path|signed_url/i);
});

test("T16 moderation RPC is explicitly operator-scoped and only hides or removes", () => {
  const sql = readBoardPostSafetyMigration();

  assert.match(sql, /'operator\.community_moderation'/i);
  assert.match(sql, /create or replace function public\.moderate_open_baseboard_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_post_id uuid/i);
  assert.match(sql, /p_action text/i);
  assert.match(sql, /p_reason text/i);
  assert.match(sql, /returns uuid/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /public\.is_operator_with_scope\('operator\.community_moderation'\)/i);
  assert.match(sql, /v_action not in \('hide', 'remove'\)/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /board_posts\.board_id = v_board_id/i);
  assert.match(sql, /update public\.board_posts/i);
  assert.match(sql, /status = case when v_action = 'hide' then 'hidden' else 'removed' end/i);
  assert.match(sql, /removed_at = now\(\)/i);
  assert.match(sql, /removed_by = v_user_id/i);
  assert.match(sql, /removal_reason = v_reason/i);
  assert.match(sql, /return p_post_id/i);
  assert.match(sql, /revoke all on function public\.moderate_open_baseboard_post\(text, uuid, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.moderate_open_baseboard_post\(text, uuid, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.moderate_open_baseboard_post\(text, uuid, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.moderate_open_baseboard_post\(text, uuid, text, text\) to service_role/i);

  assert.doesNotMatch(sql, /ban|suspend|ai[_ -]?moderation|account sanction/i);
});

test("T16 adds no direct board_posts write policies and current reads hide moderated posts", () => {
  const sql = readBoardPostSafetyMigration();

  assert.doesNotMatch(sql, /create policy[\s\S]*on public\.board_posts[\s\S]*for (insert|update|delete)/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\.board_posts to (anon|authenticated|public)/i);
  assert.match(boardPostReadMigrationSource, /board_posts\.status = 'published'/i);
  assert.match(boardPostReadMigrationSource, /board_posts\.visibility = 'board'/i);
  assert.match(boardPostReadsSource, /list_open_baseboard_posts/i);
});

test("T16 report server action gates DFW Baseboard before the report RPC", () => {
  assert.match(safetyActionSource, /"use server"/);
  assert.match(safetyActionSource, /reportDfwBaseboardPostAction/);
  assert.match(safetyActionSource, /getCurrentAppAccessContext/);
  assert.match(safetyActionSource, /getPrivateAppGateResult/);
  assert.match(safetyActionSource, /routeKind: "private-child"/);
  assert.match(safetyActionSource, /recordSecurityEvent/);
  assert.match(safetyActionSource, /action: "report_dfw_baseboard_post"/);
  assert.match(safetyActionSource, /redirect\(gate\.path\)/);
  assert.match(safetyActionSource, /report_open_baseboard_post/);
  assert.match(safetyActionSource, /p_base_code: "DFW"/);
  assert.match(safetyActionSource, /p_post_id: postId/);
  assert.match(safetyActionSource, /p_reason: reason/);
  assert.match(safetyActionSource, /p_details: details/);
  assert.match(safetyActionSource, /revalidatePath\(DFW_BASEBOARD_ROUTE\)/);
  assert.match(safetyActionSource, /DFW_BASEBOARD_REPORT_REPORTED_STATUS/);
  assert.match(safetyActionSource, /DFW_BASEBOARD_REPORT_INVALID_STATUS/);
  assert.match(safetyActionSource, /DFW_BASEBOARD_REPORT_FAILED_STATUS/);
  assert.match(
    safetyActionSource,
    /getPrivateAppGateResult[\s\S]*if \(gate\.kind === "redirect"\)[\s\S]*report_open_baseboard_post/s,
  );

  assert.doesNotMatch(safetyActionSource, /moderate_open_baseboard_post|service_role|\.insert\(|\.update\(|\.delete\(/);
  assert.doesNotMatch(safetyActionSource, /verification|eligibility|reporter_user_id|author_user_id|signed_url|storage_path/i);
});

test("T16 report action state exposes only safe redirect statuses", () => {
  assert.match(safetyActionStateSource, /DFW_BASEBOARD_REPORT_STATUS_PARAM = "report"/);
  assert.match(safetyActionStateSource, /DFW_BASEBOARD_REPORT_REPORTED_STATUS = "dfw_baseboard_post_reported"/);
  assert.match(safetyActionStateSource, /DFW_BASEBOARD_REPORT_INVALID_STATUS = "dfw_baseboard_report_invalid"/);
  assert.match(safetyActionStateSource, /DFW_BASEBOARD_REPORT_FAILED_STATUS = "dfw_baseboard_report_failed"/);
  assert.doesNotMatch(safetyActionStateSource, /eligib|verification|sql|auth|reporter/i);
});

test("DFW Baseboard route wires report status and action only after the private gate", () => {
  assert.match(dfwBaseboardRouteSource, /dynamic = "force-dynamic"/);
  assert.match(dfwBaseboardRouteSource, /requireDfwHubRouteAccess/);
  assert.match(dfwBaseboardRouteSource, /await requireDfwHubRouteAccess[\s\S]*await listDfwBaseboardPosts/s);
  assert.match(dfwBaseboardRouteSource, /reportDfwBaseboardPostAction/);
  assert.match(dfwBaseboardRouteSource, /DFW_BASEBOARD_REPORT_STATUS_PARAM/);
  assert.match(dfwBaseboardRouteSource, /baseboardReportStatus=\{reportStatus\}/);
  assert.match(dfwBaseboardRouteSource, /reportBaseboardPostAction=\{reportDfwBaseboardPostAction\}/);
  assert.doesNotMatch(dfwBaseboardRouteSource, /moderate_open_baseboard_post|\.insert\(|\.update\(|\.delete\(/);
});

test("DFW Baseboard UI renders compact report affordance only on post cards", () => {
  assert.match(shellSource, /reportBaseboardPostAction\?:/);
  assert.match(shellSource, /baseboardReportStatus\?:/);
  assert.match(shellSource, /reportAction/);
  assert.match(shellSource, /Report this post/);
  assert.match(shellSource, /name="postId"/);
  assert.match(shellSource, /name="reason"/);
  assert.match(shellSource, /name="details"/);
  assert.match(shellSource, /value=\{post\.id\}/);
  assert.match(shellSource, /spam/i);
  assert.match(shellSource, /harassment/i);
  assert.match(shellSource, /unsafe information/i);
  assert.match(shellSource, /privacy/i);
  assert.match(shellSource, /off topic/i);
  assert.match(shellSource, /Thanks — the post was reported for review\./);
  assert.match(shellSource, /Choose a report reason before submitting\./);
  assert.match(shellSource, /jmpseat could not submit that report right now\. Try again in a moment\./);
  assert.match(shellStyles, /reportForm/);
  assert.match(shellStyles, /reportSubmit/);

  for (const source of nonBaseboardRoutes) {
    assert.doesNotMatch(source, /reportDfwBaseboardPostAction|reportBaseboardPostAction|Report this post/);
  }
});

test("T16 keeps client/UI paths free of out-of-scope writes and surfaces", () => {
  const combined = `${dfwBaseboardRouteSource}\n${shellSource}\n${shellStyles}\n${safetyActionSource}`;

  assert.doesNotMatch(combined, /createBrowserClient|service_role|\.insert\(|\.update\(|\.delete\(/);
  assert.doesNotMatch(combined, /comment form|reply form|save button|reaction button|search backend|post detail|crew picks ranking/i);
  assert.doesNotMatch(combined, /lounge posting|members_only|operator_only|seeded layover|proof upload|storage_path|signed_url/i);
  assert.doesNotMatch(combined, /reporter_user_id|author_user_id|email|claimedAirline|claimedRole|claimedBase|verification evidence/i);
});

test("T16 docs describe local runtime-pending safety scope and exclusions", () => {
  assert.match(docsSource, /FBMVP-T16/i);
  assert.match(docsSource, /Board Post Safety Foundation/i);
  assert.match(docsSource, /runtime-pending|runtime pending/i);
  assert.match(docsSource, /DFW Baseboard reporting/i);
  assert.match(docsSource, /operator-scoped hide\/remove RPC/i);
  assert.match(docsSource, /server actions\/RPCs only|server action/i);
  assert.match(docsSource, /zero direct board_posts write policies/i);
  assert.match(docsSource, /does not expose reporter identity broadly/i);
  assert.match(docsSource, /Hidden\/removed posts are excluded|hidden\/removed posts are excluded/i);
  assert.match(docsSource, /T14 reads only published/i);
  assert.match(docsSource, /broad supabase db push remains unsafe/i);
  assert.match(docsSource, /targeted runtime preflight\/apply|targeted preflight\/apply/i);
  assert.match(docsSource, /post detail/i);
  assert.match(docsSource, /comments/i);
  assert.match(docsSource, /saves/i);
  assert.match(docsSource, /reactions/i);
  assert.match(docsSource, /search/i);
  assert.match(docsSource, /moderation queue UI/i);
  assert.match(docsSource, /AI moderation/i);
  assert.match(docsSource, /bans/i);
  assert.match(docsSource, /lounge|restricted/i);
  assert.match(docsSource, /Layovers seeded content|seeded Layovers/i);
  assert.match(docsSource, /Crew Picks ranking/i);
  assert.match(docsSource, /public sharing/i);
  assert.match(docsSource, /media/i);
  assert.match(docsSource, /proof-upload|proof upload/i);
});
