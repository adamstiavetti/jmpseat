import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const pageUrl = new URL(
  "../../app/app/admin/design/dfw-hub-wireframes/page.tsx",
  import.meta.url,
);
const stylesUrl = new URL(
  "../../app/app/admin/design/dfw-hub-wireframes/dfwHubWireframes.module.css",
  import.meta.url,
);

function readPageSource() {
  return readFileSync(pageUrl, "utf8");
}

test("DFW Hub wireframe prototype route exists as a force-dynamic admin route", () => {
  assert.equal(existsSync(pageUrl), true);
  assert.equal(existsSync(stylesUrl), true);

  const source = readPageSource();

  assert.match(source, /export const dynamic = "force-dynamic"/);
  assert.match(source, /\/app\/admin\/design\/dfw-hub-wireframes/);
});

test("DFW Hub wireframe prototype uses admin-shell authorization before rendering", () => {
  const source = readPageSource();

  assert.match(source, /getCurrentAppAccessContext/);
  assert.match(source, /getPrivateAppGateResult/);
  assert.match(source, /if \(gate\.kind === "redirect"\)\s*{\s*redirect\(gate\.path\);/s);
  assert.match(source, /getCurrentVerificationReviewerAuthorizationContext/);
  assert.match(source, /getCurrentOperatorAccess/);
  assert.match(
    source,
    /if \(!reviewerContext\.reviewerAuthorized && !operatorContext\.operatorGranted\)/,
  );
  assert.match(source, /missing_admin_authorization/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
});

test("DFW Hub wireframe prototype is static and avoids live community content access", () => {
  const source = readPageSource();

  assert.match(source, /const prototypeScreens/);
  assert.match(source, /const channels/);
  assert.match(source, /const sampleThreads/);
  assert.doesNotMatch(source, /from ["'].*src\/lib\/community/i);
  assert.doesNotMatch(source, /from ["'].*community\//i);
  assert.doesNotMatch(source, /\.rpc\(/i);
  assert.doesNotMatch(source, /list_open_|get_open_|create_open_|report_open_|moderate_open_/i);
  assert.doesNotMatch(source, /board_posts|board_post_comments|board_post_reports|board_post_comment_reports/i);
  assert.doesNotMatch(source, /author_user_id|reporter_user_id|reporter identity|signed_url|storage_path/i);
});

test("DFW Hub wireframe prototype includes approved labels and avoids retired product labels", () => {
  const source = readPageSource();

  for (const label of [
    "DFW Hub",
    "DFW Channels",
    "Food & Coffee",
    "Request a Channel",
    "Start a Thread",
    "Recent Useful Threads",
  ]) {
    assert.match(source, new RegExp(label.replace(/[&]/g, "\\$&")));
  }

  for (const forbidden of [
    "Baseboard",
    "Base Board",
    "Layover Boards",
    "Verified Rooms",
    "Ask Your Base",
    "Browse Rooms",
    "Intel",
    "Brief",
    "Subboards",
    "Groups",
    "Communities",
    "Layover Guide",
  ]) {
    assert.doesNotMatch(source, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(source, /["'`]Routes["'`]/i);
});

test("DFW Hub wireframe prototype avoids nested phone chrome and mixed report states", () => {
  const source = readPageSource();

  assert.doesNotMatch(source, /9:41/);
  assert.doesNotMatch(source, /LTE 100/);
  assert.doesNotMatch(source, /statusBar/);
  assert.doesNotMatch(source, /the report preview is ready for review/);
  assert.match(source, /Browse sections/);
  assert.match(source, /More thread actions/);
});
