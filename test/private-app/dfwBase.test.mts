import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const routeUrl = new URL("../../app/app/hubs/dfw/base/page.tsx", import.meta.url);
const configUrl = new URL("../../src/lib/privateApp/dfwBase.ts", import.meta.url);
const shellUrl = new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url);

const routeSource = existsSync(routeUrl) ? readFileSync(routeUrl, "utf8") : "";
const configSource = existsSync(configUrl) ? readFileSync(configUrl, "utf8") : "";
const shellSource = readFileSync(shellUrl, "utf8");

function sourceForFunction(name: string) {
  const start = shellSource.indexOf(`function ${name}`);
  if (start < 0) {
    return "";
  }

  const nextExport = shellSource.indexOf("\nexport function", start + 1);
  const nextFunction = shellSource.indexOf("\nfunction ", start + 1);
  const candidates = [nextExport, nextFunction].filter((index) => index > start);
  const end = candidates.length > 0 ? Math.min(...candidates) : shellSource.length;

  return shellSource.slice(start, end);
}

const baseShellSource = sourceForFunction("DfwBaseShell");
const combinedBaseSource = [routeSource, configSource, baseShellSource].join("\n");

test("T27B DFW Base route exists and is protected by the DFW Hub access gate", () => {
  assert.ok(existsSync(routeUrl), "DFW Base route should exist");
  assert.match(routeSource, /dynamic = "force-dynamic"/);
  assert.match(routeSource, /requireDfwHubRouteAccess/);
  assert.match(routeSource, /\/app\/hubs\/dfw\/base/);
  assert.match(routeSource, /section: "dfw-base"/);
  assert.match(routeSource, /await requireDfwHubRouteAccess[\s\S]*<DfwBaseShell/s);
  assert.doesNotMatch(routeSource, /getCurrentAppAccessContext|client-side|useEffect/);
  assert.doesNotMatch(routeSource, /\.insert\(|\.update\(|\.delete\(|create[A-Z]|report[A-Z]/);
});

test("T27B DFW Base uses typed static utility content with safe channel links", () => {
  assert.ok(existsSync(configUrl), "DFW Base static config should exist");
  assert.match(configSource, /dfwBaseStartHere/);
  assert.match(configSource, /dfwBaseEssentialCards/);
  assert.match(configSource, /dfwBaseUsefulNextLinks/);
  assert.match(configSource, /dfwBaseSafetyBoundary/);
  assert.match(configSource, /Know your commute\/parking plan/);
  assert.match(configSource, /Confirm terminal\/ground logistics through official\/employer sources/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/commuting-parking/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/terminal-ground-logistics/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/food-coffee-breaks/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/new-to-dfw/);
  assert.match(configSource, /\/app\/hubs\/dfw\/today/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels/);
});

test("T27B DFW Base shell renders read-only base guidance and avoids live integrations", () => {
  assert.match(shellSource, /DfwBaseShell/);
  assert.match(shellSource, /DFW Base/);
  assert.match(shellSource, /A practical base guide for verified DFW aviation workers\./);
  assert.match(shellSource, /Start here/);
  assert.match(shellSource, /Base essentials/);
  assert.match(shellSource, /Useful next/);
  assert.match(combinedBaseSource, /DFW Base avoids live operations and security-sensitive details/);
  assert.match(combinedBaseSource, /official\/employer sources/);
  assert.match(combinedBaseSource, /Layover guidance remains a separate MVP pillar/i);
  assert.match(shellSource, /Back to DFW Hub/);
  assert.match(shellSource, /BottomNavVisual active="Hubs"/);

  for (const forbidden of [
    "live flight loads",
    "live operational status",
    "checkpoint-sensitive",
    "crew live location",
    "exact real-time crew movement",
    "AI-generated operational advice",
    "NonRev Deals",
    "Baseboard",
    "Request a Channel workflow",
  ]) {
    assert.doesNotMatch(combinedBaseSource, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(combinedBaseSource, /fetch\(|createClient|createBrowserClient|OpenAI|ai\/|\.rpc\(|\.from\(/);
  assert.doesNotMatch(combinedBaseSource, /comment form|reply form|report controls|moderation controls|name="title"|name="body"/i);
});
