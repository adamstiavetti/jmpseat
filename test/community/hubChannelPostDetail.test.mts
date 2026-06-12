import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readHubChannelPostDetailMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_hub_channel_post_detail_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T26C hub channel post-detail RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

function readOptionalSource(relativePath: string) {
  const url = new URL(relativePath, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
}

const helperSource = readFileSync(
  new URL("../../src/lib/community/hubChannels.ts", import.meta.url),
  "utf8",
);
const uuidSource = readOptionalSource("../../src/lib/community/uuid.ts");
const selectedChannelRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/channels/[channelSlug]/page.tsx", import.meta.url),
  "utf8",
);
const selectedChannelPostDetailRouteSource = readOptionalSource(
  "../../app/app/hubs/dfw/channels/[channelSlug]/[postId]/page.tsx",
);
const shellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);
const docsSource = [
  "../../docs/ops/fbmvp-t26c-channel-post-detail-read-foundation.md",
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

const smokePostId = "7f93f9a9-3dd1-4718-979a-2acc8194a999";
const expectedUuidPatternSource =
  "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";
const malformedUuidPatternSource =
  "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$";
const expectedUuidPattern = new RegExp(expectedUuidPatternSource, "i");

function sourceForExportedFunction(name: string) {
  const start = shellSource.indexOf(`export function ${name}`);
  assert.ok(start >= 0, `${name} should exist`);

  const nextExport = shellSource.indexOf("\nexport function", start + 1);
  return shellSource.slice(start, nextExport > start ? nextExport : shellSource.length);
}

function sourceForHelperFunction(name: string) {
  const start = helperSource.indexOf(`export async function ${name}`);
  assert.ok(start >= 0, `${name} should exist`);

  const nextExport = helperSource.indexOf("\nexport async function", start + 1);
  return helperSource.slice(start, nextExport > start ? nextExport : helperSource.length);
}

test("T26C migration adds a narrow selected Hub Channel post-detail RPC", () => {
  const sql = readHubChannelPostDetailMigration();

  assert.match(sql, /create or replace function public\.get_open_hub_channel_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_channel_slug text/i);
  assert.match(sql, /p_post_id uuid/i);
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
  assert.match(sql, /channel_slug text/i);
  assert.match(sql, /channel_name text/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /Read eligibility required/i);
});

test("T26C detail RPC resolves active visible hub channel and uses board_id for membership", () => {
  const sql = readHubChannelPostDetailMigration();

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
  assert.match(sql, /board_posts\.id = p_post_id/i);
  assert.match(sql, /board_posts\.board_id = v_channel_board_id/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /limit 1/i);
  assert.doesNotMatch(sql, /board_posts\.category\s*=\s*v_channel|category.*channel membership/i);
});

test("T26C detail RPC returns safe fields only and adds no policies or writes", () => {
  const sql = readHubChannelPostDetailMigration();
  const returnSignature = sql.slice(
    sql.indexOf("returns table"),
    sql.indexOf("language plpgsql", sql.indexOf("returns table")),
  );

  assert.doesNotMatch(returnSignature, /board_id|base_id|parent_board_id|user_id|author_user_id|reporter|moderation|verification|storage|signed|email|comment|report/i);
  assert.doesNotMatch(sql, /create table public\.(channels|hub_channels|board_channels)/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\./i);
  assert.doesNotMatch(sql, /insert into public\.(board_posts|board_post_comments|board_post_reports)/i);
  assert.doesNotMatch(sql, /create or replace function public\.(create_open_hub_channel_post|report_open_hub_channel|moderate_open_hub_channel)/i);
  assert.doesNotMatch(sql, /from public\.board_post_comments|from public\.board_post_reports/i);
});

test("T26C detail RPC exposes execute only to authenticated and service_role", () => {
  const sql = readHubChannelPostDetailMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.get_open_hub_channel_post\(text, text, uuid\) from public/i);
  assert.match(sql, /revoke execute on function public\.get_open_hub_channel_post\(text, text, uuid\) from anon/i);
  assert.match(sql, /grant execute on function public\.get_open_hub_channel_post\(text, text, uuid\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.get_open_hub_channel_post\(text, text, uuid\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T26C helper reads one selected-channel post through the safe RPC only", () => {
  const detailHelperSource = sourceForHelperFunction("getDfwHubChannelPost");

  assert.match(helperSource, /import "server-only"/);
  assert.match(helperSource, /HubChannelPostDetail/);
  assert.match(detailHelperSource, /createClient/);
  assert.match(detailHelperSource, /get_open_hub_channel_post/);
  assert.match(detailHelperSource, /p_base_code: "DFW"/);
  assert.match(detailHelperSource, /p_channel_slug: normalizedChannelSlug/);
  assert.match(detailHelperSource, /p_post_id: normalizedPostId/);
  assert.match(detailHelperSource, /isUuid\(normalizedPostId\)/);
  assert.match(detailHelperSource, /post: null/);
  assert.match(detailHelperSource, /error: null/);
  assert.match(helperSource, /authorLabel/);
  assert.match(helperSource, /channelSlug/);
  assert.match(helperSource, /channelName/);

  assert.doesNotMatch(detailHelperSource, /from\("boards"\)|from\("board_posts"\)|createBrowserClient/);
  assert.doesNotMatch(detailHelperSource, /boardId|baseId|parentBoardId|userId|authorUserId|reporter|verification|storagePath|signedUrl/i);
  assert.doesNotMatch(detailHelperSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T26C detail helper accepts the real smoke post UUID before calling the RPC", () => {
  const detailHelperSource = sourceForHelperFunction("getDfwHubChannelPost");

  assert.equal(expectedUuidPattern.test(smokePostId), true);
  assert.equal(expectedUuidPattern.test("not-a-uuid"), false);
  assert.equal(expectedUuidPattern.test("7f93f9a9-3dd1-4718-zzzz-2acc8194a999"), false);
  assert.match(detailHelperSource, /isUuid\(normalizedPostId\)/);
  assert.match(helperSource, /import \{ isUuid \} from "\.\/uuid"/);
  assert.match(detailHelperSource, /get_open_hub_channel_post/);
  assert.ok(
    uuidSource.includes(expectedUuidPatternSource),
    "detail helper should use a five-group UUID pattern that accepts the smoke post id",
  );
  assert.ok(
    !uuidSource.includes(malformedUuidPatternSource),
    "detail helper should not use the malformed four-hyphen UUID pattern from failed smoke",
  );
});

test("T26C selected-channel post detail route is private gated before reading", () => {
  assert.ok(
    selectedChannelPostDetailRouteSource.length > 0,
    "selected-channel post detail route should exist",
  );
  assert.match(selectedChannelPostDetailRouteSource, /dynamic = "force-dynamic"/);
  assert.match(selectedChannelPostDetailRouteSource, /requireDfwHubRouteAccess/);
  assert.match(selectedChannelPostDetailRouteSource, /section: "dfw-channel-post"/);
  assert.match(
    selectedChannelPostDetailRouteSource,
    /await requireDfwHubRouteAccess[\s\S]*await Promise\.all\(\[\s*listDfwHubChannels\(\),\s*getDfwHubChannelPost/s,
  );
  assert.match(selectedChannelPostDetailRouteSource, /DfwChannelPostDetailShell/);
  assert.match(selectedChannelPostDetailRouteSource, /postUnavailable/);

  assert.doesNotMatch(selectedChannelPostDetailRouteSource, /createDfwBaseboardPostAction|reportDfwBaseboardPostAction|createDfwBaseboardCommentAction/);
  assert.doesNotMatch(selectedChannelPostDetailRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T26C selected-channel post detail shell is read-only Hub/Channels copy", () => {
  const detailShellSource = sourceForExportedFunction("DfwChannelPostDetailShell");

  assert.match(detailShellSource, /DFW Hub Channel thread/);
  assert.match(detailShellSource, /Back to Channel Threads/);
  assert.match(detailShellSource, /That DFW Channel thread is unavailable\./);
  assert.match(detailShellSource, /post\.title/);
  assert.match(detailShellSource, /post\.body/);
  assert.match(detailShellSource, /post\.authorLabel/);
  assert.match(detailShellSource, /post\.contentType/);
  assert.match(detailShellSource, /post\.category/);
  assert.match(detailShellSource, /post\.isPinned/);
  assert.match(detailShellSource, /post\.channelName/);
  assert.match(detailShellSource, /Updated/);

  assert.doesNotMatch(detailShellSource, /Start a Thread|Publish post|composer|textarea|comment form|reply form|Report this post|moderation controls|fake activity|thread count|activity count/i);
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
    assert.doesNotMatch(detailShellSource, new RegExp(retiredLabel));
  }
});

test("T26C selected-channel thread-list rows link to post detail routes", () => {
  const selectedChannelShellSource = sourceForExportedFunction("DfwChannelThreadListShell");

  assert.match(selectedChannelRouteSource, /DfwChannelThreadListShell/);
  assert.match(selectedChannelShellSource, /getDfwHubChannelPostHref\(channel\.slug, post\.id\)/);
  assert.match(selectedChannelShellSource, /href=\{getDfwHubChannelPostHref\(channel\.slug, post\.id\)\}/);
  assert.match(selectedChannelShellSource, /postTitleLink/);
});

test("T26C docs record detail scope, runtime apply, and post-fix happy-path smoke", () => {
  assert.match(docsSource, /FBMVP-T26C/i);
  assert.match(docsSource, /Channel Post Detail Read Foundation/i);
  assert.match(docsSource, /get_open_hub_channel_post/i);
  assert.match(docsSource, /\/app\/hubs\/dfw\/channels\/\[channelSlug\]\/\[postId\]/);
  assert.match(docsSource, /board_posts\.board_id/);
  assert.match(docsSource, /board_posts\.category/);
  assert.match(docsSource, /runtime apply is recorded|runtime apply is complete|T26C is runtime-applied/i);
  assert.match(docsSource, /20260612024544 create_hub_channel_post_detail_rpc/i);
  assert.match(docsSource, /post-fix browser smoke/i);
  assert.match(docsSource, /selected-channel detail route now renders|detail route renders the new valid UUID post|T26C regression:\s*\n\s*- passed/i);
  assert.match(docsSource, /does not add[\s\S]*composer/i);
  assert.match(docsSource, /does not add[\s\S]*comments/i);
  assert.match(docsSource, /does not add[\s\S]*reports/i);
  assert.match(docsSource, /DFW Today\/Base\/Layover|DFW Today, Base, Layover/i);
  assert.doesNotMatch(docsSource, /T26C happy-path browser smoke remains pending|happy-path post rendering remains pending/i);
});
