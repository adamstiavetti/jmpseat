import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const routeUrl = new URL("../../app/app/hubs/dfw/layover/page.tsx", import.meta.url);
const configUrl = new URL("../../src/lib/privateApp/dfwLayover.ts", import.meta.url);
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

const layoverShellSource = sourceForFunction("DfwLayoverShell");
const combinedLayoverSource = [routeSource, configSource, layoverShellSource].join("\n");

test("T27C DFW Layover route exists and is protected by the DFW Hub access gate", () => {
  assert.ok(existsSync(routeUrl), "DFW Layover route should exist");
  assert.match(routeSource, /dynamic = "force-dynamic"/);
  assert.match(routeSource, /requireDfwHubRouteAccess/);
  assert.match(routeSource, /\/app\/hubs\/dfw\/layover/);
  assert.match(routeSource, /section: "dfw-layover"/);
  assert.match(routeSource, /await requireDfwHubRouteAccess[\s\S]*<DfwLayoverShell/s);
  assert.doesNotMatch(routeSource, /getCurrentAppAccessContext|client-side|useEffect/);
  assert.doesNotMatch(routeSource, /\.insert\(|\.update\(|\.delete\(|create[A-Z]|report[A-Z]/);
});

test("T27C DFW Layover uses typed static utility content with safe links", () => {
  assert.ok(existsSync(configUrl), "DFW Layover static config should exist");
  assert.match(configSource, /dfwLayoverStartHere/);
  assert.match(configSource, /dfwLayoverEssentialCards/);
  assert.match(configSource, /dfwLayoverUsefulNextLinks/);
  assert.match(configSource, /dfwLayoverSafetyBoundary/);
  assert.match(configSource, /Confirm duty\/rest timing through official\/employer sources/);
  assert.match(configSource, /Keep transportation plans simple and reversible/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/food-coffee-breaks/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/dfw-layover-local/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/terminal-ground-logistics/);
  assert.match(configSource, /\/app\/hubs\/dfw\/today/);
  assert.match(configSource, /\/app\/hubs\/dfw\/base/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels/);
});

test("T27C DFW Layover shell renders read-only layover guidance and avoids unsafe scope", () => {
  assert.match(shellSource, /DfwLayoverShell/);
  assert.match(shellSource, /DFW Layover/);
  assert.match(shellSource, /A practical layover guide for verified aviation workers passing through DFW\./);
  assert.match(shellSource, /Start here/);
  assert.match(shellSource, /Layover essentials/);
  assert.match(shellSource, /Useful next/);
  assert.match(combinedLayoverSource, /DFW Layover avoids exact crew hotel exposure/);
  assert.match(combinedLayoverSource, /official\/employer sources/);
  assert.match(combinedLayoverSource, /This private beta baseline avoids live location and exact crew hotel exposure/i);
  assert.match(shellSource, /Back to DFW Hub/);
  assert.match(shellSource, /BottomNavVisual active="Hubs"/);

  for (const forbidden of [
    "live flight loads",
    "live operational status",
    "checkpoint-sensitive",
    "public nearby crew tracking",
    "crew live location",
    "exact real-time crew movement",
    "AI-generated operational advice",
    "NonRev Deals",
    "Baseboard",
    "Request a Channel workflow",
    "dating",
    "swiping",
  ]) {
    assert.doesNotMatch(combinedLayoverSource, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(combinedLayoverSource, /fetch\(|createClient|createBrowserClient|OpenAI|ai\/|\.rpc\(|\.from\(/);
  assert.doesNotMatch(combinedLayoverSource, /comment form|reply form|report controls|moderation controls|name="title"|name="body"/i);
});
