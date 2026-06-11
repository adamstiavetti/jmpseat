import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const appRootSource = readFileSync(
  new URL("../../app/app/page.tsx", import.meta.url),
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
const homeBaseActionsSource = readFileSync(
  new URL("../../src/lib/community/homeBaseActions.ts", import.meta.url),
  "utf8",
);
const dfwHubRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/page.tsx", import.meta.url),
  "utf8",
);
const dfwHubAccessSource = readFileSync(
  new URL("../../src/lib/privateApp/dfwHubAccess.ts", import.meta.url),
  "utf8",
);
const dfwSectionRoutes = [
  {
    label: "DFW Baseboard",
    route: "/app/hubs/dfw/baseboard",
    section: "dfw-baseboard",
    source: readFileSync(
      new URL("../../app/app/hubs/dfw/baseboard/page.tsx", import.meta.url),
      "utf8",
    ),
  },
  {
    label: "DFW Layovers",
    route: "/app/hubs/dfw/layovers",
    section: "dfw-layovers",
    source: readFileSync(
      new URL("../../app/app/hubs/dfw/layovers/page.tsx", import.meta.url),
      "utf8",
    ),
  },
  {
    label: "DFW Lounges",
    route: "/app/hubs/dfw/lounges",
    section: "dfw-lounges",
    source: readFileSync(
      new URL("../../app/app/hubs/dfw/lounges/page.tsx", import.meta.url),
      "utf8",
    ),
  },
  {
    label: "DFW Crew Picks",
    route: "/app/hubs/dfw/crew-picks",
    section: "dfw-crew-picks",
    source: readFileSync(
      new URL("../../app/app/hubs/dfw/crew-picks/page.tsx", import.meta.url),
      "utf8",
    ),
  },
] as const;
const dfwBaseboardRouteSource = dfwSectionRoutes[0].source;
const dfwBaseboardDetailRouteSource = existsSync(
  new URL("../../app/app/hubs/dfw/baseboard/[postId]/page.tsx", import.meta.url),
)
  ? readFileSync(
      new URL("../../app/app/hubs/dfw/baseboard/[postId]/page.tsx", import.meta.url),
      "utf8",
    )
  : "";
const t08DocsSource = readFileSync(
  new URL("../../docs/ops/fbmvp-t08-home-hub-shell.md", import.meta.url),
  "utf8",
);
const boardPostReadsSource = existsSync(
  new URL("../../src/lib/community/boardPostReads.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostReads.ts", import.meta.url),
      "utf8",
    )
  : "";
const boardPostActionsSource = existsSync(
  new URL("../../src/lib/community/boardPostActions.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostActions.ts", import.meta.url),
      "utf8",
    )
  : "";

const combinedSource = [
  appRootSource,
  shellSource,
  shellStyles,
  dfwHubRouteSource,
  dfwHubAccessSource,
  ...dfwSectionRoutes.map((route) => route.source),
  t08DocsSource,
].join("\n");
const implementationSource = [
  appRootSource,
  shellSource,
  shellStyles,
  homeBaseActionsSource,
  dfwHubRouteSource,
  dfwHubAccessSource,
  ...dfwSectionRoutes.map((route) => route.source),
].join("\n");

test("home dashboard shell uses the canonical utility hierarchy", () => {
  assert.match(shellSource, /Search jmpseat/);
  assert.match(shellSource, /Home Base/);
  assert.match(shellSource, /Crew Picks/);
  assert.match(shellSource, /Following/);
  assert.match(shellSource, /Your Lounges/);
  assert.match(shellSource, /Saved/);
  assert.match(shellSource, /utility dashboard/i);
  assert.doesNotMatch(shellSource, /generic social feed/i);
});

test("DFW Hub read-only shell uses product-facing taxonomy labels", () => {
  assert.match(shellSource, /DFW Hub/);
  assert.match(shellSource, /DFW Today/);
  assert.match(shellSource, /Base/);
  assert.match(shellSource, /Layover/);
  assert.match(shellSource, /Channels/);
  assert.match(shellSource, /Recent Useful Threads/);
  assert.match(shellSource, /weather, traffic, public airport advisories, app notes/);
  assert.match(shellSource, /No live weather or traffic integration is active yet/);
  assert.match(shellSource, /Essentials/);
  assert.match(shellSource, /Recommendations/);
  assert.match(shellSource, /Getting Around/);
  assert.doesNotMatch(shellSource, /Base Board/);
  assert.doesNotMatch(shellSource, /Verified Lounge/);
  assert.doesNotMatch(shellSource, /Layover Guide/);
});

test("skip-for-now state does not fake-assign DFW as Home Base", () => {
  assert.match(shellSource, /DFW Hub is live first/);
  assert.match(shellSource, /Start with DFW/);
  assert.match(shellSource, /No Home Base/);
  assert.match(shellSource, /Skip for now keeps Home Base unset/i);
  assert.match(shellSource, /startWithDfwAction/);
  assert.match(shellSource, /<form action=\{startWithDfwAction\}/);
  assert.match(shellSource, /const hasHomeBase = Boolean\(normalizedHomeBase\)/);
  assert.match(shellSource, /\{hasHomeBase \? \(/);
  assert.doesNotMatch(shellSource, /Your Home Base is DFW/i);
  assert.doesNotMatch(shellSource, /DFW is your Home Base/i);
});

test("home shell reads optional Home Base without making it an access gate", () => {
  assert.match(appRootSource, /getCurrentUserHomeBase/);
  assert.match(appRootSource, /homeBaseResult\.homeBase/);
  assert.match(appRootSource, /startWithDfwHomeBaseAction/);
  assert.doesNotMatch(appRootSource, /redirect\(.*homeBase/i);
  assert.doesNotMatch(appRootSource, /claimed_base|claimed_airline|claimed_role/);
  assert.match(shellSource, /homeBaseCode\?: string/);
});

test("Start with DFW action uses the private gate and T06 Home Base helper", () => {
  assert.match(homeBaseActionsSource, /"use server"/);
  assert.match(homeBaseActionsSource, /getCurrentAppAccessContext/);
  assert.match(homeBaseActionsSource, /getPrivateAppGateResult/);
  assert.match(homeBaseActionsSource, /routeKind: "private-root"/);
  assert.match(homeBaseActionsSource, /recordSecurityEvent/);
  assert.match(homeBaseActionsSource, /setUserHomeBaseByCode\("DFW"\)/);
  assert.match(homeBaseActionsSource, /result\.error \|\| !result\.result/);
  assert.match(homeBaseActionsSource, /revalidatePath\(AUTH_ROUTES\.app\)/);
  assert.match(homeBaseActionsSource, /redirect\(buildAppRedirect\(START_WITH_DFW_SUCCESS_STATUS\)\)/);
  assert.match(homeBaseActionsSource, /redirect\(buildAppRedirect\(START_WITH_DFW_FAILED_STATUS\)\)/);
  assert.doesNotMatch(homeBaseActionsSource, /claimed_base|claimed_airline|claimed_role/i);
  assert.doesNotMatch(homeBaseActionsSource, /lounge_memberships|lounge_access_requests/i);
});

test("DFW Hub route remains behind the private app gate and audit path", () => {
  assert.match(appRootSource, /dynamic = "force-dynamic"/);
  assert.match(dfwHubRouteSource, /dynamic = "force-dynamic"/);
  assert.match(dfwHubRouteSource, /getCurrentAppAccessContext/);
  assert.match(dfwHubRouteSource, /getPrivateAppGateResult/);
  assert.match(dfwHubRouteSource, /recordSecurityEvent/);
  assert.match(dfwHubRouteSource, /route_kind: "private-child"/);
  assert.match(dfwHubRouteSource, /\/app\/hubs\/dfw/);
});

test("DFW Hub section routes exist and remain behind the private gate and audit helper", () => {
  assert.match(dfwHubAccessSource, /getCurrentAppAccessContext/);
  assert.match(dfwHubAccessSource, /getPrivateAppGateResult/);
  assert.match(dfwHubAccessSource, /routeKind: "private-child"/);
  assert.match(dfwHubAccessSource, /recordSecurityEvent/);
  assert.match(dfwHubAccessSource, /route_kind: "private-child"/);
  assert.match(dfwHubAccessSource, /redirect\(gate\.path\)/);

  for (const route of dfwSectionRoutes) {
    assert.match(route.source, /dynamic = "force-dynamic"/);
    assert.match(route.source, /requireDfwHubRouteAccess/);
    assert.match(route.source, new RegExp(route.route.replaceAll("/", "\\/")));
    assert.match(route.source, new RegExp(`section: "${route.section}"`));
    assert.match(route.source, /DfwHubSectionReadOnlyShell/);
  }
});

test("DFW Baseboard route fetches read-only posts only after the private gate", () => {
  assert.match(dfwBaseboardRouteSource, /requireDfwHubRouteAccess/);
  assert.match(dfwBaseboardRouteSource, /await requireDfwHubRouteAccess[\s\S]*await listDfwBaseboardPosts/s);
  assert.match(dfwBaseboardRouteSource, /listDfwBaseboardPosts/);
  assert.match(dfwBaseboardRouteSource, /createDfwBaseboardPostAction/);
  assert.match(dfwBaseboardRouteSource, /baseboardPosts/);
  assert.match(dfwBaseboardRouteSource, /baseboardPostsUnavailable/);
  assert.match(dfwBaseboardRouteSource, /createBaseboardPostAction=\{createDfwBaseboardPostAction\}/);
  assert.match(dfwBaseboardRouteSource, /DfwHubSectionReadOnlyShell/);
  assert.match(dfwBaseboardRouteSource, /section=\{dfwHubSectionShells\.baseboard\}/);
  assert.match(dfwBaseboardRouteSource, /dynamic = "force-dynamic"/);

  assert.doesNotMatch(dfwBaseboardRouteSource, /create_board_post/);
  assert.doesNotMatch(dfwBaseboardRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("DFW Baseboard shell supports empty, populated, and minimal composer states", () => {
  assert.match(shellSource, /baseboardPosts\?:/);
  assert.match(shellSource, /baseboardPostsUnavailable\?: boolean/);
  assert.match(shellSource, /createBaseboardPostAction\?:/);
  assert.match(shellSource, /baseboardPostStatus\?:/);
  assert.match(shellSource, /No useful DFW threads yet\./);
  assert.match(
    shellSource,
    /Useful DFW threads will appear here when verified workers contribute and moderators or admins surface high-signal posts\./,
  );
  assert.match(shellSource, /Channel post foundation/);
  assert.match(shellSource, /Post to DFW Channels/);
  assert.match(shellSource, /name="title"/);
  assert.match(shellSource, /name="body"/);
  assert.match(shellSource, /type="submit"/);
  assert.match(shellSource, /Your DFW Hub post is live\./);
  assert.match(shellSource, /Add a title and body before posting/);
  assert.match(shellSource, /jmpseat could not publish that post right now/);
  assert.match(shellSource, /authorLabel/);
  assert.match(shellSource, /contentType/);
  assert.match(shellSource, /category/);
  assert.match(shellSource, /isPinned/);
  assert.match(shellSource, /DfwBaseboardPostsSection/);
  assert.match(shellSource, /section\.key === "baseboard"/);
  assert.match(shellSource, /createAction \?/);

  assert.doesNotMatch(shellSource, /Ask Baseboard coming later/);
  assert.doesNotMatch(shellSource, /Community posting is not live yet/);
  assert.doesNotMatch(shellSource, /create_board_post/);
  assert.doesNotMatch(shellSource, /name="category"|name="content_type"/);
});

test("DFW Baseboard post rendering stays safe and avoids out-of-scope surfaces", () => {
  const combined = `${dfwBaseboardRouteSource}\n${dfwBaseboardDetailRouteSource}\n${shellSource}\n${shellStyles}\n${boardPostReadsSource}\n${boardPostActionsSource}`;

  assert.doesNotMatch(combined, /author_user_id|email|claimedAirline|claimedRole|claimedBase|verification evidence|proof artifact|storage_path|signed_url/i);
  assert.doesNotMatch(combined, /comment form|reply form|save button|reaction button|search backend|crew picks ranking|public sharing button/i);
  assert.doesNotMatch(combined, /lounge_memberships|members_only|operator_only|seeded layover/i);
  assert.doesNotMatch(combined, /createBrowserClient|service_role|\.insert\(|\.update\(|\.delete\(/);
});

test("DFW Baseboard detail route is private gated and server-action scoped", () => {
  assert.match(dfwBaseboardDetailRouteSource, /dynamic = "force-dynamic"/);
  assert.match(dfwBaseboardDetailRouteSource, /requireDfwHubRouteAccess/);
  assert.match(dfwBaseboardDetailRouteSource, /await requireDfwHubRouteAccess[\s\S]*await getDfwBaseboardPost/s);
  assert.match(dfwBaseboardDetailRouteSource, /section: "dfw-baseboard"/);
  assert.match(dfwBaseboardDetailRouteSource, /DfwBaseboardPostDetailShell/);
  assert.match(dfwBaseboardDetailRouteSource, /reportDfwBaseboardPostAction/);
  assert.doesNotMatch(dfwBaseboardDetailRouteSource, /create_board_post|report_open_baseboard_post|moderate_open_baseboard_post/);
  assert.doesNotMatch(dfwBaseboardDetailRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("DFW Baseboard list cards link to private post detail", () => {
  assert.match(shellSource, /getDfwBaseboardPostHref/);
  assert.match(shellSource, /href=\{getDfwBaseboardPostHref\(post\.id\)\}/);
  assert.match(shellSource, /DfwBaseboardPostDetailShell/);
  assert.match(shellSource, /Back to DFW Channels/);
  assert.match(shellSource, /supports top-level comments and reporting/);
  assert.match(shellSource, /Nested replies, saves, reactions, search, and public sharing/);
  assert.match(shellSource, /Report this post/);
  assert.doesNotMatch(shellSource, /share button|copy link|public URL|external post/i);
});

test("Request a Channel is an in-section Channels action only", () => {
  const channelsIndex = shellSource.indexOf("DFW Channels");
  const requestIndex = shellSource.indexOf("Request a Channel");
  const recentThreadsIndex = shellSource.indexOf("Recent Useful Threads");

  assert.ok(channelsIndex >= 0, "Channels section should be present");
  assert.ok(requestIndex > channelsIndex, "Request a Channel should appear after Channels");
  assert.ok(
    recentThreadsIndex === -1 || requestIndex < recentThreadsIndex,
    "Request a Channel should be associated with Channels, not a later top-level section",
  );
  assert.match(shellSource, /Request a Channel/);
  assert.match(shellSource, /Reviewed request/);
  assert.match(shellSource, /Admin approval required/);
  assert.match(shellSource, /free user-created channels are not live/i);
  assert.doesNotMatch(shellSource, /createChannelAction/);
});

test("DFW Baseboard composer is not wired into non-Baseboard hub sections", () => {
  assert.match(shellSource, /section\.key === "baseboard"/);
  assert.match(shellSource, /createBaseboardPostAction/);

  for (const route of dfwSectionRoutes.slice(1)) {
    assert.doesNotMatch(route.source, /createDfwBaseboardPostAction|createBaseboardPostAction|Post to DFW Baseboard/);
  }
});

test("DFW Hub cards link to read-only section route shells", () => {
  for (const route of dfwSectionRoutes.filter((item) => item.section !== "dfw-lounges")) {
    assert.match(shellSource, new RegExp(`href: "${route.route.replaceAll("/", "\\/")}"`));
  }

  assert.match(shellSource, /DFW Today/);
  assert.match(shellSource, /DFW Base/);
  assert.match(shellSource, /DFW Layover/);
  assert.match(shellSource, /DFW Channels/);
  assert.match(shellSource, /Recent Useful Threads/);
  assert.match(shellSource, /DFW Lounges route/);
  assert.match(shellSource, /Coming later/);
  assert.match(shellSource, /read-only placeholder/);
});

test("DFW section shells keep lounge access and Layovers safety boundaries explicit", () => {
  assert.match(shellSource, /No exact crew hotel exposure/);
  assert.match(shellSource, /No live crew movement or location/);
  assert.match(shellSource, /No passenger private information/);
  assert.match(shellSource, /No airport or security-sensitive procedures/);
  assert.match(shellSource, /No company-confidential documents or policies/);
  assert.match(shellSource, /No dating or social meetup behavior/);
  assert.match(shellSource, /Home Base does not grant lounge access/);
  assert.match(shellSource, /Board follows do not grant lounge access/);
  assert.match(shellSource, /Self-declared profile fields do not grant lounge access/);
  assert.match(shellSource, /Lounge request and review flow is not live yet/);
  assert.match(shellSource, /No ranking is live/);
  assert.match(shellSource, /No AI surfacing is live/);
});

test("T08 does not add backend mutation scope or restricted access semantics", () => {
  assert.doesNotMatch(combinedSource, /create table|alter table|create policy|using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(combinedSource, /\.insert\(|\.update\(|\.delete\(/);
  assert.doesNotMatch(combinedSource, /request_lounge_access|review_lounge_access|lounge_access_requests/);
  assert.doesNotMatch(implementationSource, /proof upload|verification artifact|storage path/i);
  assert.doesNotMatch(implementationSource, /AI-assisted|auto-publish/i);
  assert.match(t08DocsSource, /read-only .*shell/i);
  assert.match(t08DocsSource, /does not add[\s\S]*dashboard mutations/i);
  assert.match(t08DocsSource, /No proof uploads/i);
});

test("T08 does not create a migration", () => {
  const migrationFiles = readdirSync(new URL("../../supabase/migrations", import.meta.url));

  assert.equal(
    migrationFiles.some((file) =>
      /t08|t09|t10|home_hub|dashboard|hub_shell|start_with_dfw|dfw_hub_section/i.test(file),
    ),
    false,
  );
});

test("T08 expected files exist", () => {
  assert.equal(
    existsSync(
      new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
    ),
    true,
  );
  assert.equal(
    existsSync(
      new URL("../../src/components/privateApp/homeHubShell.module.css", import.meta.url),
    ),
    true,
  );
  assert.equal(
    existsSync(new URL("../../app/app/hubs/dfw/page.tsx", import.meta.url)),
    true,
  );
  for (const route of [
    "../../app/app/hubs/dfw/baseboard/page.tsx",
    "../../app/app/hubs/dfw/layovers/page.tsx",
    "../../app/app/hubs/dfw/lounges/page.tsx",
    "../../app/app/hubs/dfw/crew-picks/page.tsx",
  ]) {
    assert.equal(existsSync(new URL(route, import.meta.url)), true);
  }
});
