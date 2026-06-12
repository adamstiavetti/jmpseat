import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readHubChannelPostReadMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_hub_channel_post_list_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T26B hub channel post-list RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const helperSource = readFileSync(
  new URL("../../src/lib/community/hubChannels.ts", import.meta.url),
  "utf8",
);
const overviewRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/channels/page.tsx", import.meta.url),
  "utf8",
);
const selectedChannelRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/channels/[channelSlug]/page.tsx", import.meta.url),
  "utf8",
);
const shellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);
const composerFormSource = readFileSync(
  new URL("../../src/components/privateApp/DfwChannelPostComposerForm.tsx", import.meta.url),
  "utf8",
);

function sourceForExportedFunction(name: string) {
  const start = shellSource.indexOf(`export function ${name}`);
  assert.ok(start >= 0, `${name} should exist`);

  const nextExport = shellSource.indexOf("\nexport function", start + 1);
  return shellSource.slice(start, nextExport > start ? nextExport : shellSource.length);
}

test("T26B migration adds a narrow selected Hub Channel post-list RPC", () => {
  const sql = readHubChannelPostReadMigration();

  assert.match(sql, /create or replace function public\.list_open_hub_channel_posts\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_channel_slug text/i);
  assert.match(sql, /p_limit integer default 20/i);
  assert.match(sql, /returns table/i);
  assert.match(sql, /\bid uuid\b/i);
  assert.match(sql, /title text/i);
  assert.match(sql, /body text/i);
  assert.match(sql, /content_type text/i);
  assert.match(sql, /category text/i);
  assert.match(sql, /is_pinned boolean/i);
  assert.match(sql, /created_at timestamptz/i);
  assert.match(sql, /updated_at timestamptz/i);
  assert.match(sql, /author_label text/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /Read eligibility required/i);
});

test("T26B RPC resolves active visible hub channel and uses board_id for membership", () => {
  const sql = readHubChannelPostReadMigration();

  assert.match(sql, /upper\(trim\(p_base_code\)\)/i);
  assert.match(sql, /lower\(trim\(p_channel_slug\)\)/i);
  assert.match(sql, /v_parent_slug text := lower\(v_base_code\)/i);
  assert.match(sql, /from public\.bases/i);
  assert.match(sql, /bases\.code = v_base_code/i);
  assert.match(sql, /bases\.status = 'active'/i);
  assert.match(sql, /parent_boards\.slug = v_parent_slug/i);
  assert.match(sql, /parent_board_types\.key = 'base_board'/i);
  assert.match(sql, /child_boards\.parent_board_id = v_parent_board_id/i);
  assert.match(sql, /child_boards\.slug = v_channel_slug/i);
  assert.match(sql, /child_boards\.status = 'active'/i);
  assert.match(sql, /child_boards\.visibility = 'open_verified'/i);
  assert.match(sql, /child_boards\.discoverability = 'visible'/i);
  assert.match(sql, /child_board_types\.key = 'hub_channel'/i);
  assert.match(sql, /board_posts\.board_id = v_channel_board_id/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /board_posts\.is_pinned desc/i);
  assert.match(sql, /board_posts\.created_at desc/i);
  assert.match(sql, /least\(greatest\(coalesce\(p_limit, 20\), 1\), 50\)/i);
  assert.doesNotMatch(sql, /board_posts\.category\s*=\s*v_channel|category.*channel membership/i);
});

test("T26B RPC returns safe fields only and adds no policies or writes", () => {
  const sql = readHubChannelPostReadMigration();
  const returnSignature = sql.slice(
    sql.indexOf("returns table"),
    sql.indexOf("language plpgsql", sql.indexOf("returns table")),
  );

  assert.doesNotMatch(returnSignature, /board_id|base_id|parent_board_id|user_id|author_user_id|reporter|moderation|verification|storage|signed|email/i);
  assert.doesNotMatch(sql, /create table public\.(channels|hub_channels|board_channels)/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\./i);
  assert.doesNotMatch(sql, /insert into public\.(board_posts|board_post_comments|board_post_reports)/i);
  assert.doesNotMatch(sql, /create or replace function public\.(create_open_hub_channel_post|get_open_hub_channel_post|report_open_hub_channel|moderate_open_hub_channel)/i);
});

test("T26B RPC exposes execute only to authenticated and service_role", () => {
  const sql = readHubChannelPostReadMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.list_open_hub_channel_posts\(text, text, integer\) from public/i);
  assert.match(sql, /revoke execute on function public\.list_open_hub_channel_posts\(text, text, integer\) from anon/i);
  assert.match(sql, /grant execute on function public\.list_open_hub_channel_posts\(text, text, integer\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.list_open_hub_channel_posts\(text, text, integer\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T26B helper calls only the selected-channel post-list RPC for thread lists", () => {
  assert.match(helperSource, /import "server-only"/);
  assert.match(helperSource, /listDfwHubChannelPosts/);
  assert.match(helperSource, /list_open_hub_channel_posts/);
  assert.match(helperSource, /p_base_code: "DFW"/);
  assert.match(helperSource, /p_channel_slug: normalizedChannelSlug/);
  assert.match(helperSource, /p_limit: limit/);
  assert.match(helperSource, /HubChannelPostListItem/);
  assert.match(helperSource, /authorLabel/);
  assert.match(helperSource, /posts: \[\]/);
  assert.match(helperSource, /error: null/);

  assert.doesNotMatch(helperSource, /from\("boards"\)|from\("board_posts"\)|createBrowserClient/);
  assert.doesNotMatch(helperSource, /boardId|baseId|parentBoardId|userId|authorUserId|reporter|verification|storagePath|signedUrl/i);
  assert.doesNotMatch(helperSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T26B selected channel route is private gated before channel metadata and post reads", () => {
  assert.match(selectedChannelRouteSource, /dynamic = "force-dynamic"/);
  assert.match(selectedChannelRouteSource, /requireDfwHubRouteAccess/);
  assert.match(selectedChannelRouteSource, /section: "dfw-channel"/);
  assert.match(selectedChannelRouteSource, /await requireDfwHubRouteAccess[\s\S]*await listDfwHubChannels/s);
  assert.match(selectedChannelRouteSource, /listDfwHubChannelPosts/);
  assert.match(selectedChannelRouteSource, /DfwChannelThreadListShell/);
  assert.match(selectedChannelRouteSource, /postsUnavailable/);
  assert.match(selectedChannelRouteSource, /channelsUnavailable/);

  assert.doesNotMatch(selectedChannelRouteSource, /createDfwBaseboardPostAction|reportDfwBaseboardPostAction|createDfwBaseboardCommentAction/);
  assert.doesNotMatch(selectedChannelRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T26B selected channel shell renders thread list without moderation or out-of-scope controls", () => {
  const selectedChannelShellSource = sourceForExportedFunction("DfwChannelThreadListShell");

  assert.match(selectedChannelShellSource, /DFW Hub Channel/);
  assert.match(selectedChannelShellSource, /Back to DFW Channels/);
  assert.match(selectedChannelShellSource, /Channel Threads/);
  assert.match(selectedChannelShellSource, /Published threads for this DFW Channel/);
  assert.match(selectedChannelShellSource, /DfwChannelPostComposerForm/);
  assert.match(composerFormSource, /Start a Thread/);
  assert.match(composerFormSource, /Post to this DFW Channel/);
  assert.match(selectedChannelShellSource, /No threads in this Channel yet/);
  assert.match(selectedChannelShellSource, /Threads for this DFW Channel are unavailable right now/);
  assert.match(selectedChannelShellSource, /post\.authorLabel/);
  assert.match(selectedChannelShellSource, /formatPostMetaValue\(post\.contentType\)/);
  assert.match(selectedChannelShellSource, /formatPostMetaValue\(post\.category\)/);

  assert.doesNotMatch(selectedChannelShellSource, /comment form|reply form|Report this post|moderation controls|Request a Channel workflow|fake activity|thread count|activity count/i);
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
    assert.doesNotMatch(selectedChannelShellSource, new RegExp(retiredLabel));
  }
});

test("T26B overview channel rows link to selected channel routes", () => {
  const channelsOverviewShellSource = sourceForExportedFunction("DfwChannelsOverviewShell");

  assert.match(channelsOverviewShellSource, /getDfwHubChannelHref\(channel\.slug\)/);
  assert.match(channelsOverviewShellSource, /href=\{getDfwHubChannelHref\(channel\.slug\)\}/);
  assert.match(overviewRouteSource, /DfwChannelsOverviewShell/);
});
