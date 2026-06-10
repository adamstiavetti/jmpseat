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
const dfwHubRouteSource = readFileSync(
  new URL("../../app/app/hubs/dfw/page.tsx", import.meta.url),
  "utf8",
);
const t08DocsSource = readFileSync(
  new URL("../../docs/ops/fbmvp-t08-home-hub-shell.md", import.meta.url),
  "utf8",
);

const combinedSource = [
  appRootSource,
  shellSource,
  shellStyles,
  dfwHubRouteSource,
  t08DocsSource,
].join("\n");
const implementationSource = [
  appRootSource,
  shellSource,
  shellStyles,
  dfwHubRouteSource,
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
  assert.doesNotMatch(shellSource, /Your Home Base is DFW/i);
  assert.doesNotMatch(shellSource, /DFW is your Home Base/i);
});

test("home shell reads optional Home Base without making it an access gate", () => {
  assert.match(appRootSource, /getCurrentUserHomeBase/);
  assert.match(appRootSource, /homeBaseResult\.homeBase/);
  assert.doesNotMatch(appRootSource, /redirect\(.*homeBase/i);
  assert.doesNotMatch(appRootSource, /claimed_base|claimed_airline|claimed_role/);
  assert.match(shellSource, /homeBaseCode\?: string/);
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

test("T08 does not add backend mutation scope or restricted access semantics", () => {
  assert.doesNotMatch(combinedSource, /create table|alter table|create policy|using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(combinedSource, /\.insert\(|\.update\(|\.delete\(|setUserHomeBaseByCode/);
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
    migrationFiles.some((file) => /t08|home_hub|dashboard|hub_shell/i.test(file)),
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
});
