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
const t08DocsSource = readFileSync(
  new URL("../../docs/ops/fbmvp-t08-home-hub-shell.md", import.meta.url),
  "utf8",
);

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
  assert.match(shellSource, /Baseboard/);
  assert.match(shellSource, /Layovers/);
  assert.match(shellSource, /Lounges/);
  assert.match(shellSource, /Crew Picks/);
  assert.doesNotMatch(shellSource, /Base Board/);
  assert.doesNotMatch(shellSource, /Verified Lounge/);
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

test("DFW Hub cards link to read-only section route shells", () => {
  for (const route of dfwSectionRoutes) {
    assert.match(shellSource, new RegExp(`href: "${route.route.replaceAll("/", "\\/")}"`));
    assert.match(shellSource, new RegExp(route.label));
  }

  assert.match(shellSource, /DFW Baseboard/);
  assert.match(shellSource, /DFW Layovers/);
  assert.match(shellSource, /DFW Lounges/);
  assert.match(shellSource, /DFW Crew Picks/);
  assert.match(shellSource, /Coming later/);
  assert.match(shellSource, /read-only placeholder/);
});

test("DFW section shells keep lounge access and Layovers safety boundaries explicit", () => {
  assert.match(shellSource, /No exact crew hotel locations/);
  assert.match(shellSource, /No live crew tracking/);
  assert.match(shellSource, /No security-sensitive or operationally sensitive information/);
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
