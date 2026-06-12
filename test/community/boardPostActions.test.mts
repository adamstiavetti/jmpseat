import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readCreateOpenBaseboardPostMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_open_baseboard_post.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T15 create-open-baseboard-post wrapper migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const actionSource = existsSync(
  new URL("../../src/lib/community/boardPostActions.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostActions.ts", import.meta.url),
      "utf8",
    )
  : "";

const actionStateSource = existsSync(
  new URL("../../src/lib/community/boardPostActionState.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostActionState.ts", import.meta.url),
      "utf8",
    )
  : "";

const dfwBaseboardRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/baseboard/page.tsx", import.meta.url),
  "utf8",
);
const docsSource = [
  "../../docs/ops/fbmvp-t15-minimal-post-composer.md",
  "../../docs/BUILD_TICKETS.md",
  "../../docs/DATA_MODEL.md",
  "../../docs/ops/05b-first-base-mvp-planning.md",
]
  .map((docPath) => readFileSync(new URL(docPath, import.meta.url), "utf8"))
  .join("\n\n");

test("T15 migration adds a narrow base-code wrapper around create_board_post", () => {
  const sql = readCreateOpenBaseboardPostMigration();

  assert.match(sql, /create or replace function public\.create_open_baseboard_post\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_title text/i);
  assert.match(sql, /p_body text/i);
  assert.match(sql, /p_content_type text default 'note'/i);
  assert.match(sql, /p_category text default 'general'/i);
  assert.match(sql, /returns uuid/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
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
  assert.match(sql, /public\.create_board_post\(\s*v_board_id,\s*p_title,\s*p_body,\s*p_content_type,\s*p_category\s*\)/i);

  assert.doesNotMatch(sql, /create table public\./i);
  assert.doesNotMatch(sql, /alter table public\.board_posts/i);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\.board_posts/i);
  assert.doesNotMatch(sql, /profile_completed_at|from public\.beta_access|verification_requests|verification_evidence/i);
  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
});

test("T15 wrapper RPC grants execute only to authenticated and service_role", () => {
  const sql = readCreateOpenBaseboardPostMigration();
  const grantLines = sql
    .split("\n")
    .filter((line) => /^\s*grant\s+execute\s+on\s+function/i.test(line))
    .join("\n");

  assert.match(sql, /revoke all on function public\.create_open_baseboard_post\(text, text, text, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.create_open_baseboard_post\(text, text, text, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.create_open_baseboard_post\(text, text, text, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.create_open_baseboard_post\(text, text, text, text, text\) to service_role/i);
  assert.doesNotMatch(grantLines, /to anon/i);
  assert.doesNotMatch(grantLines, /to public/i);
});

test("T15 wrapper does not expose sensitive fields or out-of-scope surfaces", () => {
  const sql = readCreateOpenBaseboardPostMigration();

  assert.doesNotMatch(sql, /returns table|author_user_id|auth\.users|raw_user_meta_data/i);
  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|private path|proof upload/i);
  assert.doesNotMatch(sql, /create table public\.(comments|post_comments|saved_items|post_saves|reactions|post_reactions)\b/i);
  assert.doesNotMatch(sql, /search_vector|to_tsvector|crew picks ranking|seeded layover|members_only|operator_only/i);
});

test("T15 server action gates DFW Baseboard before calling the wrapper RPC", () => {
  assert.match(actionSource, /"use server"/);
  assert.match(actionSource, /createDfwBaseboardPostAction/);
  assert.match(actionSource, /getCurrentAppAccessContext/);
  assert.match(actionSource, /getPrivateAppGateResult/);
  assert.match(actionSource, /routeKind: "private-child"/);
  assert.match(actionSource, /DFW_BASEBOARD_ROUTE/);
  assert.match(actionSource, /recordSecurityEvent/);
  assert.match(actionSource, /action: "create_dfw_baseboard_post"/);
  assert.match(actionSource, /redirect\(gate\.path\)/);
  assert.match(actionSource, /create_open_baseboard_post/);
  assert.match(actionSource, /p_base_code: "DFW"/);
  assert.match(actionSource, /p_content_type: "note"/);
  assert.match(actionSource, /p_category: "general"/);
  assert.match(actionSource, /revalidatePath\(DFW_BASEBOARD_ROUTE\)/);
  assert.match(actionSource, /redirect\(buildDfwBaseboardPostRedirect\(DFW_BASEBOARD_POST_CREATED_STATUS\)\)/);

  assert.match(
    actionSource,
    /getPrivateAppGateResult[\s\S]*if \(gate\.kind === "redirect"\)[\s\S]*create_open_baseboard_post/s,
  );
  assert.doesNotMatch(actionSource, /create_board_post|service_role|storage_path|signed_url/i);
  assert.doesNotMatch(actionSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("T15 server action validates title and body before RPC", () => {
  assert.match(actionSource, /String\(formData\.get\("title"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /String\(formData\.get\("body"\) \?\? ""\)\.trim\(\)/);
  assert.match(actionSource, /title\.length === 0/);
  assert.match(actionSource, /title\.length > 120/);
  assert.match(actionSource, /body\.length === 0/);
  assert.match(actionSource, /body\.length > 4000/);
  assert.match(actionSource, /DFW_BASEBOARD_POST_INVALID_STATUS/);
  assert.match(actionSource, /DFW_BASEBOARD_POST_FAILED_STATUS/);
});

test("T15 post action state exposes safe redirect statuses", () => {
  assert.match(actionStateSource, /DFW_BASEBOARD_POST_STATUS_PARAM = "post"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_POST_CREATED_STATUS = "dfw_baseboard_post_created"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_POST_INVALID_STATUS = "dfw_baseboard_post_invalid"/);
  assert.match(actionStateSource, /DFW_BASEBOARD_POST_FAILED_STATUS = "dfw_baseboard_post_failed"/);
  assert.doesNotMatch(actionStateSource, /eligib|verification|sql|auth/i);
});

test("DFW Baseboard route wires the server action and status after the route gate", () => {
  assert.match(dfwBaseboardRouteSource, /searchParams/);
  assert.match(dfwBaseboardRouteSource, /createDfwBaseboardPostAction/);
  assert.match(dfwBaseboardRouteSource, /DFW_BASEBOARD_POST_STATUS_PARAM/);
  assert.match(dfwBaseboardRouteSource, /await requireDfwHubRouteAccess[\s\S]*await listDfwBaseboardPosts/s);
  assert.match(dfwBaseboardRouteSource, /createBaseboardPostAction=\{createDfwBaseboardPostAction\}/);
  assert.match(dfwBaseboardRouteSource, /baseboardPostStatus=\{postStatus\}/);
  assert.doesNotMatch(dfwBaseboardRouteSource, /create_board_post|\.insert\(|\.update\(|\.delete\(/);
});

test("T15 docs describe the composer foundation and runtime-applied boundary", () => {
  const t15Docs = readFileSync(
    new URL("../../docs/ops/fbmvp-t15-minimal-post-composer.md", import.meta.url),
    "utf8",
  );

  assert.match(docsSource, /FBMVP-T15/i);
  assert.match(docsSource, /Minimal Post Composer/i);
  assert.match(docsSource, /DFW Baseboard/i);
  assert.match(docsSource, /title\/body|title and body/i);
  assert.match(docsSource, /server action/i);
  assert.match(docsSource, /create_open_baseboard_post/i);
  assert.match(docsSource, /create_board_post/i);
  assert.match(docsSource, /DB-level contribution eligibility|contribution eligibility/i);
  assert.match(docsSource, /T15 is runtime-applied/i);
  assert.match(docsSource, /20260610182000 create_open_baseboard_post/i);
  assert.match(docsSource, /fbmvp-t15-minimal-post-composer-runtime-pass/i);
  assert.match(docsSource, /targeted SQL execution only|targeted runtime apply|targeted apply only/i);
  assert.match(docsSource, /broad supabase db push remains unsafe/i);
  assert.match(docsSource, /no user\/community content was created/i);
  assert.match(docsSource, /Baseboards should no longer be treated as open mixed discussion boards/i);
  assert.match(docsSource, /user-facing DFW Hub shell presents DFW Today, Base, Layover, Channels/i);
  assert.match(docsSource, /comments/i);
  assert.match(docsSource, /saves/i);
  assert.match(docsSource, /reactions/i);
  assert.match(docsSource, /search/i);
  assert.match(docsSource, /moderation queue/i);
  assert.match(docsSource, /lounge|restricted/i);
  assert.match(docsSource, /Layovers seeded content|seeded Layovers/i);
  assert.match(docsSource, /Crew Picks ranking/i);
  assert.match(docsSource, /proof-upload|proof upload/i);
  assert.doesNotMatch(docsSource, /runtime-pending|runtime pending/i);
  assert.doesNotMatch(t15Docs, /hub_channel|list_open_hub_channels|DFW Channels overview/i);
});
