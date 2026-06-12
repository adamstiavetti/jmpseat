import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const routeUrl = new URL("../../app/app/hubs/dfw/today/page.tsx", import.meta.url);
const configUrl = new URL("../../src/lib/privateApp/dfwToday.ts", import.meta.url);
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

const todayShellSource = sourceForFunction("DfwTodayShell");
const combinedTodaySource = [routeSource, configSource, todayShellSource].join("\n");

test("T27A DFW Today route exists and is protected by the DFW Hub access gate", () => {
  assert.ok(existsSync(routeUrl), "DFW Today route should exist");
  assert.match(routeSource, /dynamic = "force-dynamic"/);
  assert.match(routeSource, /requireDfwHubRouteAccess/);
  assert.match(routeSource, /\/app\/hubs\/dfw\/today/);
  assert.match(routeSource, /section: "dfw-today"/);
  assert.match(routeSource, /await requireDfwHubRouteAccess[\s\S]*<DfwTodayShell/s);
  assert.doesNotMatch(routeSource, /getCurrentAppAccessContext|client-side|useEffect/);
  assert.doesNotMatch(routeSource, /\.insert\(|\.update\(|\.delete\(|create[A-Z]|report[A-Z]/);
});

test("T27A DFW Today uses typed static utility content with safe channel links", () => {
  assert.ok(existsSync(configUrl), "DFW Today static config should exist");
  assert.match(configSource, /dfwTodayQuickChecks/);
  assert.match(configSource, /dfwTodayUtilityCards/);
  assert.match(configSource, /dfwTodaySafetyBoundary/);
  assert.match(configSource, /Check your parking\/commute plan/);
  assert.match(configSource, /Confirm terminal\/ground logistics with official sources/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/commuting-parking/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/terminal-ground-logistics/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/food-coffee-breaks/);
  assert.match(configSource, /\/app\/hubs\/dfw\/channels\/dfw-q-and-a/);
});

test("T27A DFW Today shell renders read-only utility copy and avoids live integrations", () => {
  assert.match(shellSource, /DfwTodayShell/);
  assert.match(shellSource, /DFW Today/);
  assert.match(shellSource, /A quick, verified-worker utility snapshot for DFW\./);
  assert.match(shellSource, /Quick checks/);
  assert.match(shellSource, /Useful today/);
  assert.match(shellSource, /Private beta baseline/);
  assert.match(combinedTodaySource, /DFW Today avoids live operational data and security-sensitive details/);
  assert.match(combinedTodaySource, /official\/employer sources/);
  assert.match(combinedTodaySource, /future curated updates can be added later/i);
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
    assert.doesNotMatch(combinedTodaySource, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(combinedTodaySource, /fetch\(|createClient|createBrowserClient|OpenAI|ai\/|\.rpc\(|\.from\(/);
  assert.doesNotMatch(combinedTodaySource, /comment form|reply form|report controls|moderation controls|name="title"|name="body"/i);
});
