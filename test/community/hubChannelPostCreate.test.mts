import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readHubChannelPostCreateMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_hub_channel_post_create_rpc.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T26D hub channel post-create RPC migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

function readOptionalSource(relativePath: string) {
  const url = new URL(relativePath, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
}

const actionSource = readOptionalSource(
  "../../src/lib/community/hubChannelActions.ts",
);
const composerFormSource = readOptionalSource(
  "../../src/components/privateApp/DfwChannelPostComposerForm.tsx",
);
const uuidSource = readOptionalSource("../../src/lib/community/uuid.ts");
const selectedChannelRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/channels/[channelSlug]/page.tsx", import.meta.url),
  "utf8",
);
const shellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);
const docsSource = [
  "../../docs/ops/fbmvp-t26d-channel-composer-create-foundation.md",
  "../../docs/ops/fbmvp-t26d-channel-composer-create-foundation-runtime-apply.md",
  "../../docs/ops/fbmvp-t26d-channel-composer-browser-smoke.md",
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

test("T26D migration adds a narrow selected Hub Channel post-create RPC", () => {
  const sql = readHubChannelPostCreateMigration();

  assert.match(sql, /create or replace function public\.create_open_hub_channel_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_channel_slug text/i);
  assert.match(sql, /p_title text/i);
  assert.match(sql, /p_body text/i);
  assert.match(sql, /p_content_type text default null/i);
  assert.match(sql, /p_category text default null/i);
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
  assert.match(sql, /current_user_can_create_open_board_post\(\)/i);
  assert.match(sql, /Contribution eligibility required/i);
});

test("T26D create RPC resolves active visible member-postable hub channel by slug", () => {
  const sql = readHubChannelPostCreateMigration();

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
  assert.match(sql, /child_boards\.posting_mode = 'members_can_post'/i);
  assert.match(sql, /child_boards\.discoverability = 'visible'/i);
  assert.match(sql, /child_board_types\.key = 'hub_channel'/i);
  assert.match(sql, /insert into public\.board_posts/i);
  assert.match(sql, /board_id,\s*author_user_id,\s*title,\s*body,\s*content_type,\s*category,\s*status,\s*visibility,\s*is_admin_seeded,\s*is_pinned/is);
  assert.match(sql, /v_channel_board_id,\s*v_user_id,\s*v_title,\s*v_body,\s*v_content_type,\s*v_category,\s*'published',\s*'board',\s*false,\s*false/is);
  assert.doesNotMatch(sql, /board_posts\.category\s*=\s*v_channel|category.*channel membership/i);
});

test("T26D create RPC validates bounded post fields and returns safe fields only", () => {
  const sql = readHubChannelPostCreateMigration();
  const returnSignature = sql.slice(
    sql.indexOf("returns table"),
    sql.indexOf("language plpgsql", sql.indexOf("returns table")),
  );

  assert.match(sql, /char_length\(v_title\) = 0/i);
  assert.match(sql, /char_length\(v_title\) > 120/i);
  assert.match(sql, /char_length\(v_body\) = 0/i);
  assert.match(sql, /char_length\(v_body\) > 4000/i);
  assert.match(sql, /v_content_type not in \('note', 'question', 'recommendation', 'guide'\)/i);
  assert.match(sql, /v_category not in/i);
  assert.match(sql, /return query/i);
  assert.match(sql, /coalesce\(nullif\(trim\(profiles\.handle\), ''\), 'jmpseat member'\) as author_label/i);

  assert.doesNotMatch(returnSignature, /board_id|base_id|parent_board_id|user_id|author_user_id|reporter|moderation|verification|storage|signed|email|comment|report/i);
  assert.doesNotMatch(sql, /create table public\.(channels|hub_channels|board_channels)/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\./i);
  assert.doesNotMatch(sql, /insert into public\.(board_post_comments|board_post_reports)/i);
  assert.doesNotMatch(sql, /create or replace function public\.(report_open_hub_channel|moderate_open_hub_channel|create_open_hub_channel_comment)/i);
});

test("T26D create RPC exposes execute only to authenticated and service_role", () => {
  const sql = readHubChannelPostCreateMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.create_open_hub_channel_post\(text, text, text, text, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.create_open_hub_channel_post\(text, text, text, text, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.create_open_hub_channel_post\(text, text, text, text, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.create_open_hub_channel_post\(text, text, text, text, text, text\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T26D server action gates selected channel create before calling the RPC", () => {
  assert.match(actionSource, /"use server"/);
  assert.match(actionSource, /createDfwHubChannelPostAction/);
  assert.match(actionSource, /getCurrentAppAccessContext/);
  assert.match(actionSource, /getPrivateAppGateResult/);
  assert.match(actionSource, /routeKind: "private-child"/);
  assert.match(actionSource, /recordSecurityEvent/);
  assert.match(actionSource, /action: "create_dfw_hub_channel_post"/);
  assert.match(actionSource, /redirect\(gate\.path\)/);
  assert.match(actionSource, /create_open_hub_channel_post/);
  assert.match(actionSource, /p_base_code: "DFW"/);
  assert.match(actionSource, /p_channel_slug: normalizedChannelSlug/);
  assert.match(actionSource, /p_content_type: contentType/);
  assert.match(actionSource, /p_category: category/);
  assert.match(actionSource, /revalidatePath\(channelRoute\)/);
  assert.match(actionSource, /status: "created"/);
  assert.match(actionSource, /href: getDfwHubChannelPostHref\(normalizedChannelSlug, createdPost\.id\)/);

  assert.match(
    actionSource,
    /getPrivateAppGateResult[\s\S]*if \(gate\.kind === "redirect"\)[\s\S]*create_open_hub_channel_post/s,
  );
  assert.doesNotMatch(actionSource, /p_board_id|boardId|baseId|parentBoardId|authorUserId|reporter|verification|storagePath|signedUrl/i);
  assert.doesNotMatch(actionSource, /from\("board_posts"\)|\.insert\(|\.update\(|\.delete\(/);
});

test("T26D server action validates post input and returns safe failure state", () => {
  assert.match(actionSource, /String\(formData\.get\("title"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /String\(formData\.get\("body"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /title\.length === 0/);
  assert.match(actionSource, /title\.length > 120/);
  assert.match(actionSource, /body\.length === 0/);
  assert.match(actionSource, /body\.length > 4000/);
  assert.match(actionSource, /isAllowedHubChannelContentType\(contentType\)/);
  assert.match(actionSource, /isAllowedHubChannelCategory\(category\)/);
  assert.match(actionSource, /DFW_HUB_CHANNEL_POST_INVALID_STATUS/);
  assert.match(actionSource, /DFW_HUB_CHANNEL_POST_FAILED_STATUS/);
  assert.match(actionSource, /buildDfwHubChannelPostActionState\(DFW_HUB_CHANNEL_POST_INVALID_STATUS\)/);
  assert.match(actionSource, /buildDfwHubChannelPostActionState\(DFW_HUB_CHANNEL_POST_FAILED_STATUS\)/);
});

test("T26D server action accepts the real smoke post UUID before returning detail href", () => {
  assert.equal(expectedUuidPattern.test(smokePostId), true);
  assert.equal(expectedUuidPattern.test("not-a-uuid"), false);
  assert.equal(expectedUuidPattern.test("7f93f9a9-3dd1-4718-zzzz-2acc8194a999"), false);
  assert.match(actionSource, /isUuid\(createdPost\.id\)/);
  assert.match(actionSource, /import \{ isUuid \} from "\.\/uuid"/);
  assert.match(actionSource, /href: getDfwHubChannelPostHref\(normalizedChannelSlug, createdPost\.id\)/);
  assert.doesNotMatch(actionSource, /redirect\(getDfwHubChannelPostHref\(normalizedChannelSlug, createdPost\.id\)\)/);
  assert.match(actionSource, /DFW_HUB_CHANNEL_POST_FAILED_STATUS/);
  assert.ok(
    uuidSource.includes(expectedUuidPatternSource),
    "create action should use a five-group UUID pattern that accepts the smoke post id",
  );
  assert.ok(
    !uuidSource.includes(malformedUuidPatternSource),
    "create action should not use the malformed four-hyphen UUID pattern from failed smoke",
  );
});

test("T26D composer uses client-side success navigation after server action result", () => {
  assert.match(composerFormSource, /"use client"/);
  assert.match(composerFormSource, /useActionState/);
  assert.match(composerFormSource, /useRouter/);
  assert.match(composerFormSource, /router\.push\(state\.href\)/);
  assert.match(composerFormSource, /state\.status === "created"/);
  assert.match(composerFormSource, /DFW_HUB_CHANNEL_POST_INVALID_STATUS/);
  assert.match(composerFormSource, /DFW_HUB_CHANNEL_POST_FAILED_STATUS/);
  assert.match(composerFormSource, /Start a Thread/);
  assert.match(composerFormSource, /Post to this DFW Channel/);
  assert.match(composerFormSource, /Publish thread/);
  assert.doesNotMatch(composerFormSource, /boardId|baseId|parentBoardId|authorUserId|reporter|moderation|proof|storage|signed/i);
});

test("T26D selected-channel route wires composer action after private route gate", () => {
  assert.match(selectedChannelRouteSource, /searchParams/);
  assert.match(selectedChannelRouteSource, /createDfwHubChannelPostAction/);
  assert.match(selectedChannelRouteSource, /DFW_HUB_CHANNEL_POST_STATUS_PARAM/);
  assert.match(selectedChannelRouteSource, /await requireDfwHubRouteAccess[\s\S]*await listDfwHubChannels/s);
  assert.match(selectedChannelRouteSource, /createPostAction=\{createPostAction\}/);
  assert.match(selectedChannelRouteSource, /postStatus=\{postStatus\}/);

  assert.doesNotMatch(selectedChannelRouteSource, /createDfwBaseboardPostAction|reportDfwBaseboardPostAction|createDfwBaseboardCommentAction/);
  assert.doesNotMatch(selectedChannelRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T26D selected-channel shell renders composer without comments reports or fake counts", () => {
  const selectedChannelShellSource = sourceForExportedFunction("DfwChannelThreadListShell");

  assert.match(selectedChannelShellSource, /DfwChannelPostComposerForm/);
  assert.match(selectedChannelShellSource, /createPostAction/);
  assert.match(selectedChannelShellSource, /postStatus/);
  assert.match(selectedChannelShellSource, /No threads in this Channel yet/);
  assert.match(selectedChannelShellSource, /getDfwHubChannelPostHref\(channel\.slug, post\.id\)/);

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

test("T26D docs record runtime apply, failed smoke, and follow-up fix boundary", () => {
  assert.match(docsSource, /FBMVP-T26D/i);
  assert.match(docsSource, /Channel Composer \/ Create Post Foundation/i);
  assert.match(docsSource, /create_open_hub_channel_post/i);
  assert.match(docsSource, /\/app\/hubs\/dfw\/channels\/\[channelSlug\]/);
  assert.match(docsSource, /board_posts\.board_id/);
  assert.match(docsSource, /board_posts\.category/);
  assert.match(docsSource, /Runtime apply is complete|Runtime now has/i);
  assert.match(docsSource, /failed\/partial/i);
  assert.match(docsSource, /DFW Q&A smoke test thread/i);
  assert.match(docsSource, /7f93f9a9-3dd1-4718-979a-2acc8194a999/i);
  assert.match(docsSource, /T26C happy path failed|detail route did not render/i);
  assert.match(docsSource, /follow-up smoke|Follow-up browser smoke/i);
  assert.match(docsSource, /does not add[\s\S]*comments/i);
  assert.match(docsSource, /does not add[\s\S]*reports/i);
  assert.match(docsSource, /does not add[\s\S]*moderation/i);
  assert.match(docsSource, /DFW Today\/Base\/Layover|DFW Today, Base, Layover/i);
  assert.doesNotMatch(docsSource, /T26D browser smoke passed|T26C happy-path browser smoke passed/i);
});
