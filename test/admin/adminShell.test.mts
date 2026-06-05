import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  OPERATOR_SCOPE_VALUES,
  OPERATOR_GRANT_IMPLEMENTATION_STATUS,
} from "../../src/lib/admin/access.ts";

test("admin routes stay bounded to the admin shell", () => {
  assert.deepEqual(ADMIN_ROUTES, {
    home: "/app/admin",
    verification: "/app/admin/verification",
    approvedDomains: "/app/admin/approved-domains",
    reviewerScopes: "/app/admin/reviewer-scopes",
    auditInspection: "/app/admin/audit",
    proofCleanup: "/app/admin/proof-cleanup",
  });
  assert.equal(OPERATOR_GRANT_IMPLEMENTATION_STATUS, "implemented");
});

test("normal active beta users do not get active privileged admin tools by default", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });

  assert.equal(
    navigation.some((item) => item.status === "available"),
    false,
  );

  const verificationItem = navigation.find(
    (item) => item.path === ADMIN_ROUTES.verification,
  );

  assert.equal(verificationItem?.status, "disabled");
  assert.match(verificationItem?.reason ?? "", /reviewer scope/i);
});

test("reviewer-authorized users only gain the existing verification review section", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: true,
    operatorScopes: [],
  });

  assert.deepEqual(
    navigation
      .filter((item) => item.status === "available")
      .map((item) => item.path),
    [ADMIN_ROUTES.verification],
  );

  const operatorItems = navigation.filter(
    (item) => item.path !== ADMIN_ROUTES.verification,
  );

  assert.ok(operatorItems.every((item) => item.status === "disabled"));
  assert.ok(
    operatorItems.every((item) => /requires operator\./i.test(item.reason)),
  );
});

test("/app/admin landing uses explicit operator grants for operator nav and avoids privileged data reads", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getCurrentVerificationReviewerAuthorizationContext/);
  assert.match(source, /getCurrentOperatorAccess/);
  assert.match(source, /buildAdminNavigation/);
  assert.match(source, /metadata-free/i);
  assert.doesNotMatch(source, /getCurrentVerificationReviewContext/);
  assert.doesNotMatch(source, /approved_email_domains/);
  assert.doesNotMatch(source, /signed_url|public_url|storage_path/i);
});

test("admin shell nav keeps unimplemented operator sections disabled even with matching explicit grants", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [OPERATOR_SCOPE_VALUES[1]],
  });

  const approvedDomains = navigation.find(
    (item) => item.key === "approved_domains",
  );
  const auditInspection = navigation.find(
    (item) => item.key === "audit_inspection",
  );

  assert.equal(approvedDomains?.status, "disabled");
  assert.equal(
    approvedDomains?.availabilityLabel,
    "Authorized, not built yet",
  );
  assert.match(approvedDomains?.reason ?? "", /not implemented yet/i);
  assert.equal(auditInspection?.status, "disabled");
});

test("admin shell nav does not link to unimplemented operator routes for scoped operators", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: true,
    operatorScopes: [
      "operator.manage_approved_domains",
      "operator.manage_reviewer_scopes",
      "operator.read_audit",
      "operator.monitor_proof_cleanup",
      "operator.run_proof_cleanup",
    ],
  });

  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.verification)?.status,
    "available",
  );

  for (const path of [
    ADMIN_ROUTES.approvedDomains,
    ADMIN_ROUTES.reviewerScopes,
    ADMIN_ROUTES.auditInspection,
    ADMIN_ROUTES.proofCleanup,
  ]) {
    const item = navigation.find((entry) => entry.path === path);

    assert.equal(item?.status, "disabled");
    assert.equal(item?.availabilityLabel, "Authorized, not built yet");
    assert.match(item?.reason ?? "", /later Epoch 05 ticket/i);
  }
});

test("/app/admin\\/verification keeps reviewer-only queue behavior inside the shared shell", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/verification/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getCurrentVerificationReviewContext/);
  assert.match(source, /if \(!reviewContext\.reviewerAuthorized\)/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.match(source, /viewVerificationProofAction/);
  assert.match(source, /submitVerificationReviewAction/);
  assert.match(source, /AdminShell/);
  assert.match(source, /getCurrentOperatorAccess/);
  assert.match(source, /operatorScopes: operatorContext\.scopes/);
});

test("admin shell implementation does not hard-code email-based authorization", () => {
  const accessSource = readFileSync(
    new URL("../../src/lib/admin/access.ts", import.meta.url),
    "utf8",
  );
  const pageSource = readFileSync(
    new URL("../../app/app/admin/page.tsx", import.meta.url),
    "utf8",
  );
  const verificationPageSource = readFileSync(
    new URL("../../app/app/admin/verification/page.tsx", import.meta.url),
    "utf8",
  );
  const bootstrapSource = readFileSync(
    new URL("../../src/lib/admin/operatorBootstrapRoute.ts", import.meta.url),
    "utf8",
  );
  const combined = `${accessSource}\n${pageSource}\n${verificationPageSource}\n${bootstrapSource}`;

  assert.doesNotMatch(combined, /@gmail\.com|@jmpseat\.com/i);
  assert.doesNotMatch(combined, /split\(["']@["']\)|endsWith\(["'][^"']+["']\)/);
  assert.doesNotMatch(combined, /hard-coded founder|hard-coded admin/i);
  assert.doesNotMatch(combined, /claimed_airline|verification_claims/i);
});
