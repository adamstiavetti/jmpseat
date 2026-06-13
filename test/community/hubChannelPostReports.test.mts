import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readHubChannelReportMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_hub_channel_post_reporting_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T26E-A Hub Channel post reporting RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const actionSource = existsSync(
  new URL("../../src/lib/community/hubChannelActions.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/hubChannelActions.ts", import.meta.url),
      "utf8",
    )
  : "";
const actionStateSource = existsSync(
  new URL("../../src/lib/community/hubChannelPostActionState.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/hubChannelPostActionState.ts", import.meta.url),
      "utf8",
    )
  : "";
const detailRouteSource = existsSync(
  new URL("../../app/app/hubs/dfw/channels/[channelSlug]/[postId]/page.tsx", import.meta.url),
)
  ? readFileSync(
      new URL("../../app/app/hubs/dfw/channels/[channelSlug]/[postId]/page.tsx", import.meta.url),
      "utf8",
    )
  : "";
const shellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);
const docsSource = [
  "../../docs/ops/fbmvp-t26e-a-channel-post-reporting-moderation-foundation.md",
  "../../docs/BUILD_TICKETS.md",
  "../../docs/DATA_MODEL.md",
  "../../docs/ops/05b-first-base-mvp-planning.md",
  "../../docs/ops/hub-pivot-plan.md",
  "../../docs/ops/fbmvp-remaining-functional-backlog.md",
]
  .map((docPath) =>
    existsSync(new URL(docPath, import.meta.url))
      ? readFileSync(new URL(docPath, import.meta.url), "utf8")
      : "",
  )
  .join("\n\n");

test("T26E-A migration reuses board_post_reports for Hub Channel reports", () => {
  const sql = readHubChannelReportMigration();

  assert.match(sql, /create or replace function public\.report_open_hub_channel_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_channel_slug text/i);
  assert.match(sql, /p_post_id uuid/i);
  assert.match(sql, /p_reason text/i);
  assert.match(sql, /p_details text default null/i);
  assert.match(sql, /returns table\s*\(\s*report_id uuid,\s*result_status text\s*\)/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.doesNotMatch(sql, /create table public\.board_post_reports/i);
  assert.doesNotMatch(sql, /create policy/i);
});

test("T26E-A report RPC is authenticated, eligible, channel-scoped, and duplicate safe", () => {
  const sql = readHubChannelReportMigration();
  const returnsBlock =
    sql.match(
      /create or replace function public\.report_open_hub_channel_post[\s\S]*?returns table\s*\(([\s\S]*?)\)\s*language plpgsql/i,
    )?.[1] ?? "";

  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /public\.current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /v_reason not in \('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other'\)/i);
  assert.match(sql, /char_length\(v_details\) > 1000/i);
  assert.match(sql, /parent_board_types\.key = 'base_board'/i);
  assert.match(sql, /child_board_types\.key = 'hub_channel'/i);
  assert.match(sql, /child_boards\.visibility = 'open_verified'/i);
  assert.match(sql, /child_boards\.discoverability = 'visible'/i);
  assert.match(sql, /board_posts\.board_id = v_channel_board_id/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /board_post_reports\.reporter_user_id = v_user_id/i);
  assert.match(sql, /board_post_reports\.status in \('open', 'reviewing'\)/i);
  assert.match(sql, /'already_reported'/i);
  assert.match(sql, /'reported'/i);
  assert.match(sql, /insert into public\.board_post_reports/i);
  assert.match(sql, /reporter_user_id[\s\S]*v_user_id/i);
  assert.doesNotMatch(
    returnsBlock,
    /author_user_id|reporter_user_id|email|verification|storage|signed_url/i,
  );
});

test("T26E-A report RPC grants execute only to authenticated and service_role", () => {
  const sql = readHubChannelReportMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.report_open_hub_channel_post\(text, text, uuid, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.report_open_hub_channel_post\(text, text, uuid, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.report_open_hub_channel_post\(text, text, uuid, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.report_open_hub_channel_post\(text, text, uuid, text, text\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon|to public/i);
});

test("T26E-A channel report action gates before RPC and redirects safely to detail", () => {
  assert.match(actionSource, /reportDfwHubChannelPostAction/);
  assert.match(actionSource, /getCurrentAppAccessContext/);
  assert.match(actionSource, /getPrivateAppGateResult/);
  assert.match(actionSource, /routeKind: "private-child"/);
  assert.match(actionSource, /action: "report_dfw_hub_channel_post"/);
  assert.match(actionSource, /report_open_hub_channel_post/);
  assert.match(actionSource, /p_base_code: "DFW"/);
  assert.match(actionSource, /p_channel_slug: normalizedChannelSlug/);
  assert.match(actionSource, /p_post_id: postId/);
  assert.match(actionSource, /REPORT_REASONS/);
  assert.match(actionSource, /details\.length > 1000/);
  assert.match(actionSource, /isUuid\(postId\)/);
  assert.match(actionSource, /revalidatePath\(detailRoute\)/);
  assert.match(actionSource, /DFW_HUB_CHANNEL_REPORT_REPORTED_STATUS/);
  assert.match(actionSource, /DFW_HUB_CHANNEL_REPORT_DUPLICATE_STATUS/);
  assert.match(actionSource, /DFW_HUB_CHANNEL_REPORT_INVALID_STATUS/);
  assert.match(actionSource, /DFW_HUB_CHANNEL_REPORT_FAILED_STATUS/);
  assert.doesNotMatch(actionSource, /\.insert\(|\.update\(|\.delete\(|service_role|reporter_user_id|author_user_id|signed_url|storage_path/i);
});

test("T26E-A report action state exposes only safe query statuses", () => {
  assert.match(actionStateSource, /DFW_HUB_CHANNEL_REPORT_STATUS_PARAM = "report"/);
  assert.match(actionStateSource, /DFW_HUB_CHANNEL_REPORT_REPORTED_STATUS = "dfw_channel_post_reported"/);
  assert.match(
    actionStateSource,
    /DFW_HUB_CHANNEL_REPORT_DUPLICATE_STATUS =\s*"dfw_channel_post_already_reported"/,
  );
  assert.match(actionStateSource, /DFW_HUB_CHANNEL_REPORT_INVALID_STATUS = "dfw_channel_report_invalid"/);
  assert.match(actionStateSource, /DFW_HUB_CHANNEL_REPORT_FAILED_STATUS = "dfw_channel_report_failed"/);
  assert.doesNotMatch(actionStateSource, /reporter|author|sql|rls|verification/i);
});

test("T26E-A selected-channel detail route wires report status after private gate", () => {
  assert.match(detailRouteSource, /requireDfwHubRouteAccess/);
  assert.match(detailRouteSource, /await requireDfwHubRouteAccess[\s\S]*await Promise\.all/s);
  assert.match(detailRouteSource, /searchParams/);
  assert.match(detailRouteSource, /reportDfwHubChannelPostAction/);
  assert.match(detailRouteSource, /DFW_HUB_CHANNEL_REPORT_STATUS_PARAM/);
  assert.match(detailRouteSource, /reportAction=\{reportDfwHubChannelPostAction\}/);
  assert.match(detailRouteSource, /reportStatus=\{reportStatus\}/);
  assert.doesNotMatch(detailRouteSource, /report_open_hub_channel_post|moderate_open_hub_channel_post|\.insert\(|\.update\(|\.delete\(/);
});

test("T26E-A selected-channel detail UI adds report affordance without counts or comments", () => {
  const detailShellStart = shellSource.indexOf("export function DfwChannelPostDetailShell");
  assert.ok(detailShellStart >= 0, "DfwChannelPostDetailShell should exist");
  const detailShellSource = shellSource.slice(detailShellStart);

  assert.match(shellSource, /Report this post/);
  assert.match(shellSource, /name="channelSlug"/);
  assert.match(shellSource, /name="postId"/);
  assert.match(shellSource, /name="reason"/);
  assert.match(shellSource, /name="details"/);
  assert.match(shellSource, /Thanks — this report was sent for review\./);
  assert.match(shellSource, /You already reported this post\./);
  assert.match(shellSource, /Choose a report reason before submitting\./);
  assert.doesNotMatch(detailShellSource, /reportCount|reportsCount|reports\.length|reporter|reporter identity|comment form|reply form|moderation controls UI/i);
});

test("T26E-A docs record reporting foundation scope and runtime pending state", () => {
  assert.match(docsSource, /FBMVP-T26E-A/i);
  assert.match(docsSource, /Channel Post Reporting/i);
  assert.match(docsSource, /board_post_reports/i);
  assert.match(docsSource, /report_open_hub_channel_post/i);
  assert.match(docsSource, /no public reporter identity/i);
  assert.match(docsSource, /no public report counts/i);
  assert.match(docsSource, /comments are not implemented/i);
  assert.match(docsSource, /AI final moderation decisions are not implemented/i);
  assert.match(docsSource, /account bans are not implemented/i);
  assert.match(docsSource, /runtime apply is pending/i);
  assert.match(docsSource, /browser smoke pending/i);
});
