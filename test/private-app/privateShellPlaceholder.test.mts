import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  OPERATOR_PRIVATE_APP_ACCESS_MESSAGE,
  PRIVATE_SHELL_CHILD_ROUTE_RECORD,
  PRIVATE_SHELL_MESSAGE,
  PRIVATE_SHELL_NAV_ITEMS,
  PRIVATE_SHELL_ROUTE,
  getPrivateShellChildRoute,
} from "../../src/lib/privateApp/privateShellPlaceholder.ts";

test("private shell route stays anchored to /app", () => {
  assert.equal(PRIVATE_SHELL_ROUTE, "/app");
});

test("private shell message stays honest about locked beta access", () => {
  assert.equal(PRIVATE_SHELL_MESSAGE.eyebrow, "jmpseat Private Beta");
  assert.equal(PRIVATE_SHELL_MESSAGE.title, "Access is not open yet.");
  assert.match(
    PRIVATE_SHELL_MESSAGE.description,
    /reserved for verified airline-worker beta access/i,
  );
  assert.match(
    PRIVATE_SHELL_MESSAGE.detail,
    /account login and profile setup exist now/i,
  );
});

test("operator internal access message stays separate from airline-email verification and community claims", () => {
  assert.equal(OPERATOR_PRIVATE_APP_ACCESS_MESSAGE.eyebrow, "jmpseat Internal Access");
  assert.match(
    OPERATOR_PRIVATE_APP_ACCESS_MESSAGE.description,
    /explicit operator\/internal access/i,
  );
  assert.match(
    OPERATOR_PRIVATE_APP_ACCESS_MESSAGE.detail,
    /does not mark this account as airline-email verified/i,
  );
  assert.match(
    OPERATOR_PRIVATE_APP_ACCESS_MESSAGE.disclaimer,
    /does not grant beta to normal users or issue role, base, or restricted-board claims/i,
  );
});

test("private shell exposes only disabled placeholder nav items", () => {
  assert.deepEqual(
    PRIVATE_SHELL_NAV_ITEMS.map((item) => item.label),
    [
      "Home Base",
      "Baseboard",
      "Layovers",
      "Lounges",
      "Profile",
      "Verification",
      "Admin",
    ],
  );

  for (const item of PRIVATE_SHELL_NAV_ITEMS) {
    assert.equal(item.disabled, true);
    assert.ok(item.description.length > 0);
  }
});

test("private child routes are defined as locked placeholders only", () => {
  assert.deepEqual(Object.keys(PRIVATE_SHELL_CHILD_ROUTE_RECORD), [
    "home",
    "base",
    "layovers",
    "rooms",
    "profile",
    "verification",
    "admin",
  ]);

  const layovers = getPrivateShellChildRoute("layovers");

  assert.equal(layovers?.path, "/app/layovers");
  assert.equal(layovers?.navLabel, "Layovers");
  assert.match(layovers?.title ?? "", /not available yet/i);
  assert.match(layovers?.detail ?? "", /beta approval and worker verification still come later/i);
  assert.match(layovers?.message.disclaimer ?? "", /not a real security boundary/i);
});

test("unknown private child routes are not treated as placeholders", () => {
  assert.equal(getPrivateShellChildRoute("unknown"), null);
});

test("private placeholder route config stays isolated under /app", () => {
  assert.ok(PRIVATE_SHELL_NAV_ITEMS.every((item) => item.path.startsWith("/app")));
  assert.ok(
    Object.values(PRIVATE_SHELL_CHILD_ROUTE_RECORD).every((route) => route.path.startsWith("/app")),
  );
  assert.ok(PRIVATE_SHELL_NAV_ITEMS.every((item) => !/waitlist|join the private beta/i.test(item.label)));
  assert.ok(
    PRIVATE_SHELL_NAV_ITEMS.every(
      (item) => !/post|comment|save|search|pay|deal|login/i.test(item.label),
    ),
  );
});

test("public and private route source files stay separated", () => {
  const publicRouteSource = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
  const privateRootSource = readFileSync(new URL("../../app/app/page.tsx", import.meta.url), "utf8");
  const privateChildSource = readFileSync(
    new URL("../../app/app/[section]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(publicRouteSource, /Join the private beta waitlist\./);
  assert.doesNotMatch(publicRouteSource, /PrivateShellPlaceholder/);
  assert.match(privateRootSource, /HomeHubShell/);
  assert.match(privateRootSource, /getCurrentUserHomeBase/);
  assert.match(privateRootSource, /access_source/);
  assert.match(privateRootSource, /operator_private_app_access/);
  assert.match(privateRootSource, /getPrivateAccessSource\(gate\) === "operator_internal"/);
  assert.doesNotMatch(privateRootSource, /operator_uuid|operator_email/i);
  assert.doesNotMatch(privateRootSource, /Join the private beta waitlist\./);
  assert.doesNotMatch(privateChildSource, /Join the private beta waitlist\./);
  assert.doesNotMatch(privateRootSource, /fetch\(|axios|prisma|api\//);
  assert.doesNotMatch(privateRootSource, /setUserHomeBaseByCode|insert\(|update\(|delete\(/);
  assert.doesNotMatch(privateChildSource, /fetch\(|axios|supabase|prisma|api\//);
  assert.doesNotMatch(privateRootSource, /\bPost\b|\bComment\b|\bSave\b/);
  assert.doesNotMatch(privateChildSource, /\bPost\b|\bComment\b|\bSave\b|\bSearch\b/);
});
