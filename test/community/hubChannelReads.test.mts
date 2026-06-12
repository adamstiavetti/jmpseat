import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readHubChannelReadMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_hub_channel_list_read_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T26A hub channel list read RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const helperSource = readFileSync(
  new URL("../../src/lib/community/hubChannels.ts", import.meta.url),
  "utf8",
);
const routeSource = readFileSync(
  new URL("../../app/app/hubs/dfw/channels/page.tsx", import.meta.url),
  "utf8",
);
const shellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);

function sourceForHelperFunction(name: string) {
  const start = helperSource.indexOf(`export async function ${name}`);
  assert.ok(start >= 0, `${name} should exist`);

  const nextExport = helperSource.indexOf("\nexport async function", start + 1);
  return helperSource.slice(start, nextExport > start ? nextExport : helperSource.length);
}

test("T26A migration adds a narrow open Hub Channels list RPC", () => {
  const sql = readHubChannelReadMigration();

  assert.match(sql, /create or replace function public\.list_open_hub_channels\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /returns table/i);
  assert.match(sql, /slug text/i);
  assert.match(sql, /name text/i);
  assert.match(sql, /short_name text/i);
  assert.match(sql, /description text/i);
  assert.match(sql, /sort_order integer/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /Read eligibility required/i);
});

test("T26A read RPC resolves active base, parent board, and active visible hub channels", () => {
  const sql = readHubChannelReadMigration();

  assert.match(sql, /upper\(trim\(p_base_code\)\)/i);
  assert.match(sql, /v_parent_slug text := lower\(v_base_code\)/i);
  assert.match(sql, /from public\.bases/i);
  assert.match(sql, /bases\.code = v_base_code/i);
  assert.match(sql, /bases\.status = 'active'/i);
  assert.match(sql, /boards\.slug = v_parent_slug/i);
  assert.match(sql, /boards\.status = 'active'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /child_boards\.parent_board_id = v_parent_board_id/i);
  assert.match(sql, /child_boards\.status = 'active'/i);
  assert.match(sql, /child_boards\.visibility = 'open_verified'/i);
  assert.match(sql, /child_boards\.discoverability = 'visible'/i);
  assert.match(sql, /child_board_types\.key = 'hub_channel'/i);
  assert.match(sql, /order by child_boards\.sort_order, child_boards\.name/i);
});

test("T26A read RPC returns safe metadata only and adds no policies or writes", () => {
  const sql = readHubChannelReadMigration();
  const returnSignature = sql.slice(
    sql.indexOf("returns table"),
    sql.indexOf("language plpgsql", sql.indexOf("returns table")),
  );

  assert.doesNotMatch(returnSignature, /\bid uuid\b|board_id|base_id|parent_board_id|user_id|author_id|reporter|moderation|verification|storage|signed/i);
  assert.doesNotMatch(sql, /create table public\.(channels|hub_channels|board_channels)/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\./i);
  assert.doesNotMatch(sql, /insert into public\.(board_posts|board_post_comments|board_post_reports)/i);
  assert.doesNotMatch(sql, /create or replace function public\.(list_open_hub_channel_posts|create_open_hub_channel_post|get_open_hub_channel_post)/i);
  assert.doesNotMatch(sql, /board_posts\.category/i);
});

test("T26A read RPC exposes execute only to authenticated and service_role", () => {
  const sql = readHubChannelReadMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.list_open_hub_channels\(text\) from public/i);
  assert.match(sql, /revoke execute on function public\.list_open_hub_channels\(text\) from anon/i);
  assert.match(sql, /grant execute on function public\.list_open_hub_channels\(text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.list_open_hub_channels\(text\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T26A helper reads DFW channel metadata through the safe RPC only", () => {
  const metadataHelperSource = sourceForHelperFunction("listDfwHubChannels");

  assert.match(helperSource, /import "server-only"/);
  assert.match(metadataHelperSource, /createClient/);
  assert.match(metadataHelperSource, /list_open_hub_channels/);
  assert.match(metadataHelperSource, /p_base_code: "DFW"/);
  assert.match(helperSource, /HubChannelListItem/);
  assert.match(metadataHelperSource, /channels: \[\]/);
  assert.match(metadataHelperSource, /error: null/);

  assert.doesNotMatch(metadataHelperSource, /from\("boards"\)|from\("board_posts"\)|createBrowserClient/);
  assert.doesNotMatch(metadataHelperSource, /id:|boardId|baseId|parentBoardId|userId|author|reporter|verification|storagePath|signedUrl/i);
  assert.doesNotMatch(metadataHelperSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T26A DFW Channels route is private gated and renders the overview only", () => {
  assert.match(routeSource, /dynamic = "force-dynamic"/);
  assert.match(routeSource, /requireDfwHubRouteAccess/);
  assert.match(routeSource, /route: DFW_CHANNELS_ROUTE/);
  assert.match(routeSource, /section: "dfw-channels"/);
  assert.match(routeSource, /await requireDfwHubRouteAccess[\s\S]*await listDfwHubChannels/s);
  assert.match(routeSource, /DfwChannelsOverviewShell/);
  assert.match(routeSource, /channelsUnavailable/);

  assert.doesNotMatch(routeSource, /listDfwBaseboardPosts|createDfwBaseboardPostAction|reportDfwBaseboardPostAction/);
  assert.doesNotMatch(routeSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T26A Channels overview copy avoids posting and retired labels", () => {
  assert.match(shellSource, /DfwChannelsOverviewShell/);
  assert.match(shellSource, /DFW Channels/);
  assert.match(shellSource, /focused spaces for verified aviation workers/);
  assert.match(shellSource, /Request a Channel/);
  assert.match(shellSource, /Need a focused place for another aviation-worker topic\? Request a Channel\./);
  assert.match(shellSource, /channelsUnavailable/);

  const channelsStart = shellSource.indexOf("export function DfwChannelsOverviewShell");
  const channelsEnd = shellSource.indexOf("export function DfwHubSectionReadOnlyShell");
  const channelsSource = shellSource.slice(channelsStart, channelsEnd);

  assert.doesNotMatch(channelsSource, /Start a Thread|Post to DFW Channels|Publish post|fake activity|thread count|activity count/i);
  for (const retiredLabel of [
    "Baseboard",
    "Base Board",
    "Layover Boards",
    "Verified Rooms",
    "Ask Your Base",
    "Browse Rooms",
    "Intel",
    "Brief",
    "Subboards",
    "Routes",
    "Groups",
    "Communities",
    "Layover Guide",
    "Deadhead Club",
  ]) {
    assert.doesNotMatch(channelsSource, new RegExp(retiredLabel));
  }
});

test("T26A Channels overview rows link to selected channel routes for T26B", () => {
  const channelsStart = shellSource.indexOf("export function DfwChannelsOverviewShell");
  const channelsEnd = shellSource.indexOf("export function DfwChannelThreadListShell");
  const channelsSource = shellSource.slice(channelsStart, channelsEnd);

  assert.match(channelsSource, /getDfwHubChannelHref\(channel\.slug\)/);
  assert.match(channelsSource, /href=\{getDfwHubChannelHref\(channel\.slug\)\}/);
});
