import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  filterOperatorScopes,
  hasOperatorScope,
} from "../../src/lib/admin/access.ts";

test("community moderation operator scope is recognized without granting normal users access", () => {
  assert.deepEqual(
    filterOperatorScopes(["operator.community_moderation", "operator.fake"]),
    ["operator.community_moderation"],
  );
  assert.equal(
    hasOperatorScope({
      scopes: ["operator.community_moderation"],
      scope: "operator.community_moderation",
    }),
    true,
  );
  assert.equal(
    hasOperatorScope({
      scopes: [],
      scope: "operator.community_moderation",
    }),
    false,
  );
});

test("admin navigation exposes community moderation only to explicit moderation operators", () => {
  const noScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });
  const privateOnlyNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.internal_private_app_access"],
  });
  const moderationNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.community_moderation"],
  });

  assert.equal(ADMIN_ROUTES.communityModeration, "/app/admin/community-moderation");
  assert.equal(
    noScopeNavigation.find((item) => item.path === ADMIN_ROUTES.communityModeration)
      ?.status,
    "disabled",
  );
  assert.equal(
    privateOnlyNavigation.find(
      (item) => item.path === ADMIN_ROUTES.communityModeration,
    )?.status,
    "disabled",
  );
  assert.equal(
    moderationNavigation.find(
      (item) => item.path === ADMIN_ROUTES.communityModeration,
    )?.status,
    "available",
  );
});

test("community moderation route is operator gated before report reads", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/community-moderation/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /export const dynamic = "force-dynamic"/);
  assert.match(source, /getPrivateAppGateResult/);
  assert.match(source, /getCurrentOperatorAccess/);
  assert.match(source, /COMMUNITY_MODERATION_SCOPE/);
  assert.match(source, /hasOperatorScope[\s\S]*getDfwBaseboardModerationReports/s);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.doesNotMatch(
    source,
    /reporter_user_id|reporter_email|author_user_id|claimed_airline|claimed_role|claimed_base|signed_url|storage_path/i,
  );
});
