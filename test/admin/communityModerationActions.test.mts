import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("community moderation action is server-only and calls existing hide/remove RPC", () => {
  const actionSource = readFileSync(
    new URL("../../src/lib/admin/communityModerationActions.ts", import.meta.url),
    "utf8",
  );

  assert.match(actionSource, /"use server"/);
  assert.match(actionSource, /getCurrentOperatorAccess/);
  assert.match(actionSource, /COMMUNITY_MODERATION_SCOPE/);
  assert.match(actionSource, /moderate_open_baseboard_post/);
  assert.match(actionSource, /p_base_code:\s*"DFW"/);
  assert.match(actionSource, /revalidatePath\(ADMIN_ROUTES\.communityModeration\)/);
  assert.match(actionSource, /redirect\(/);
  assert.doesNotMatch(
    actionSource,
    /\.insert\(|\.update\(|\.delete\(|create_board_post|report_open_baseboard_post|service_role/i,
  );
});

test("community moderation action validates UUID, action, and reason before RPC", () => {
  const actionSource = readFileSync(
    new URL("../../src/lib/admin/communityModerationActions.ts", import.meta.url),
    "utf8",
  );

  assert.match(actionSource, /isUuid/);
  assert.match(actionSource, /action !== "hide" && action !== "remove"/);
  assert.match(actionSource, /reason\.length === 0/);
  assert.match(actionSource, /reason\.length > 1000/);
  assert.match(actionSource, /community_moderation_invalid/);
  assert.match(actionSource, /community_moderation_failed/);
  assert.match(actionSource, /community_moderation_completed/);
});

test("community moderation page renders report cards and scoped hide/remove forms only", () => {
  const pageSource = readFileSync(
    new URL("../../app/app/admin/community-moderation/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(pageSource, /AdminShell/);
  assert.match(pageSource, /getDfwBaseboardModerationReports/);
  assert.match(pageSource, /moderateDfwBaseboardPostAction/);
  assert.match(pageSource, /name="moderationAction"/);
  assert.match(pageSource, /value="hide"/);
  assert.match(pageSource, /value="remove"/);
  assert.match(pageSource, /name="reason"/);
  assert.match(pageSource, /postBodyPreview/);
  assert.doesNotMatch(
    pageSource,
    /comment moderation|reply moderation|ban|suspend|appeal|AI moderation|public sharing|reporter_user_id|reporter email|author_user_id/i,
  );
});

test("T18 docs preserve moderation scope and out-of-scope boundaries", () => {
  const docsSource = readFileSync(
    new URL(
      "../../docs/ops/fbmvp-t18-dfw-baseboard-moderation-review.md",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(docsSource, /runtime-pending/i);
  assert.match(docsSource, /operator\.community_moderation/i);
  assert.match(docsSource, /hide\/remove/i);
  assert.match(docsSource, /zero direct `board_posts` write policies/i);
  assert.match(docsSource, /reporter identity/i);
  assert.match(docsSource, /broad Supabase `db push` remains unsafe/i);
  assert.match(docsSource, /comments\/replies milestone should wait/i);
  assert.match(docsSource, /comments/i);
  assert.match(docsSource, /saves/i);
  assert.match(docsSource, /search/i);
  assert.match(docsSource, /Crew Picks/i);
  assert.match(docsSource, /proof-upload/i);
});
