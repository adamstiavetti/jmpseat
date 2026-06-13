import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readHubChannelModerationMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_hub_channel_post_reporting_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T26E-A Hub Channel reporting/moderation RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const adminReportsSource = existsSync(
  new URL("../../src/lib/admin/communityModerationReports.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/admin/communityModerationReports.ts", import.meta.url),
      "utf8",
    )
  : "";
const adminActionsSource = existsSync(
  new URL("../../src/lib/admin/communityModerationActions.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/admin/communityModerationActions.ts", import.meta.url),
      "utf8",
    )
  : "";
const adminPageSource = readFileSync(
  new URL("../../app/app/admin/community-moderation/page.tsx", import.meta.url),
  "utf8",
);

test("T26E-A migration adds operator-only Hub Channel report review RPC", () => {
  const sql = readHubChannelModerationMigration();
  const returnsBlock =
    sql.match(
      /create or replace function public\.list_open_hub_channel_post_reports[\s\S]*?returns table\s*\(([\s\S]*?)\)\s*language plpgsql/i,
    )?.[1] ?? "";

  assert.match(sql, /create or replace function public\.list_open_hub_channel_post_reports\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_limit integer default 50/i);
  assert.match(sql, /returns table/i);
  assert.match(sql, /channel_slug text/i);
  assert.match(sql, /channel_name text/i);
  assert.match(sql, /report_id uuid/i);
  assert.match(sql, /post_id uuid/i);
  assert.match(sql, /post_title text/i);
  assert.match(sql, /post_body_preview text/i);
  assert.match(sql, /post_author_label text/i);
  assert.match(sql, /reason text/i);
  assert.match(sql, /details text/i);
  assert.match(sql, /report_status text/i);
  assert.match(sql, /reported_at timestamptz/i);
  assert.match(sql, /public\.is_operator_with_scope\('operator\.community_moderation'\)/i);
  assert.match(sql, /child_board_types\.key = 'hub_channel'/i);
  assert.match(sql, /board_post_reports\.status in \('open', 'reviewing'\)/i);
  assert.doesNotMatch(
    returnsBlock,
    /reporter_user_id|author_user_id|email|verification|storage|signed_url/i,
  );
});

test("T26E-A migration adds operator-only Hub Channel hide/remove RPC", () => {
  const sql = readHubChannelModerationMigration();

  assert.match(sql, /create or replace function public\.moderate_open_hub_channel_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_channel_slug text/i);
  assert.match(sql, /p_post_id uuid/i);
  assert.match(sql, /p_action text/i);
  assert.match(sql, /p_reason text/i);
  assert.match(sql, /public\.is_operator_with_scope\('operator\.community_moderation'\)/i);
  assert.match(sql, /v_action not in \('hide', 'remove'\)/i);
  assert.match(sql, /board_posts\.board_id = v_channel_board_id/i);
  assert.match(sql, /status = case when v_action = 'hide' then 'hidden' else 'removed' end/i);
  assert.match(sql, /removed_by = v_user_id/i);
  assert.match(sql, /update public\.board_post_reports/i);
  assert.match(sql, /status = 'resolved'/i);
  assert.match(sql, /resolution_note = v_reason/i);
  assert.doesNotMatch(sql, /\bban\b|\bsuspend\b|ai[_ -]?moderation|account sanction/i);
});

test("T26E-A moderation RPC grants execute only to authenticated and service_role", () => {
  const sql = readHubChannelModerationMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  for (const signature of [
    "list_open_hub_channel_post_reports\\(text, integer\\)",
    "moderate_open_hub_channel_post\\(text, text, uuid, text, text\\)",
  ]) {
    assert.match(sql, new RegExp(`revoke all on function public\\.${signature} from public`, "i"));
    assert.match(sql, new RegExp(`revoke execute on function public\\.${signature} from anon`, "i"));
    assert.match(sql, new RegExp(`grant execute on function public\\.${signature} to authenticated`, "i"));
    assert.match(sql, new RegExp(`grant execute on function public\\.${signature} to service_role`, "i"));
  }

  assert.doesNotMatch(grantLines, /to anon|to public/i);
});

test("T26E-A server-only admin helper loads safe Channel report review fields", () => {
  assert.match(adminReportsSource, /import "server-only"/);
  assert.match(adminReportsSource, /getDfwHubChannelModerationReports/);
  assert.match(adminReportsSource, /list_open_hub_channel_post_reports/);
  assert.match(adminReportsSource, /channelSlug/);
  assert.match(adminReportsSource, /channelName/);
  assert.match(adminReportsSource, /authorLabel/);
  assert.doesNotMatch(adminReportsSource, /reporter_user_id|reporterEmail|author_user_id|authorUserId|email|verification|storage|signed/i);
});

test("T26E-A admin action is server-only, operator-scoped, and channel-aware", () => {
  assert.match(adminActionsSource, /moderateDfwHubChannelPostAction/);
  assert.match(adminActionsSource, /getCurrentOperatorAccess/);
  assert.match(adminActionsSource, /COMMUNITY_MODERATION_SCOPE/);
  assert.match(adminActionsSource, /isUuid/);
  assert.match(adminActionsSource, /channelSlug/);
  assert.match(adminActionsSource, /moderate_open_hub_channel_post/);
  assert.match(adminActionsSource, /p_channel_slug: channelSlug/);
  assert.match(adminActionsSource, /action !== "hide" && action !== "remove"/);
  assert.match(adminActionsSource, /reason\.length === 0/);
  assert.match(adminActionsSource, /community_moderation_completed/);
  assert.doesNotMatch(adminActionsSource, /\.insert\(|\.update\(|\.delete\(|service_role|reporter_user_id|author_user_id|ban|suspend/i);
});

test("T26E-A admin page lists Channel reports without reporter identity", () => {
  assert.match(adminPageSource, /getDfwHubChannelModerationReports/);
  assert.match(adminPageSource, /moderateDfwHubChannelPostAction/);
  assert.match(adminPageSource, /Open DFW Channel reports/);
  assert.match(adminPageSource, /report\.channelName/);
  assert.match(adminPageSource, /report\.channelSlug/);
  assert.match(adminPageSource, /name="channelSlug"/);
  assert.match(adminPageSource, /value=\{report\.channelSlug\}/);
  assert.match(adminPageSource, /Reporter identity is not shown/);
  assert.doesNotMatch(adminPageSource, /reporter_user_id|reporter email|author_user_id|ban|suspend|AI moderation|public drama/i);
});
