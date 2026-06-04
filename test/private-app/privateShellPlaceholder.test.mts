import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
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
  assert.equal(PRIVATE_SHELL_MESSAGE.eyebrow, "Skybyrd Private Beta");
  assert.equal(PRIVATE_SHELL_MESSAGE.title, "Access is not open yet.");
  assert.match(
    PRIVATE_SHELL_MESSAGE.description,
    /reserved for verified airline-worker beta access/i,
  );
  assert.match(
    PRIVATE_SHELL_MESSAGE.detail,
    /verification and login are coming in a later epoch/i,
  );
});

test("private shell exposes only disabled placeholder nav items", () => {
  assert.deepEqual(
    PRIVATE_SHELL_NAV_ITEMS.map((item) => item.label),
    [
      "Home Base",
      "Base Boards",
      "Layover Boards",
      "Verified Rooms",
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
  assert.equal(layovers?.navLabel, "Layover Boards");
  assert.match(layovers?.title ?? "", /not available yet/i);
  assert.match(layovers?.detail ?? "", /login and verification come later/i);
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
  assert.match(privateRootSource, /PrivateShellPlaceholder/);
  assert.doesNotMatch(privateRootSource, /Join the private beta waitlist\./);
  assert.doesNotMatch(privateChildSource, /Join the private beta waitlist\./);
  assert.doesNotMatch(privateRootSource, /fetch\(|axios|supabase|prisma|api\//);
  assert.doesNotMatch(privateChildSource, /fetch\(|axios|supabase|prisma|api\//);
  assert.doesNotMatch(privateRootSource, /\bPost\b|\bComment\b|\bSave\b|\bSearch\b/);
  assert.doesNotMatch(privateChildSource, /\bPost\b|\bComment\b|\bSave\b|\bSearch\b/);
});
