import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  OPERATOR_GRANT_IMPLEMENTATION_STATUS,
} from "../../src/lib/admin/access.ts";

test("admin routes stay bounded to the admin shell", () => {
  assert.deepEqual(ADMIN_ROUTES, {
    home: "/app/admin",
    verification: "/app/admin/verification",
    operatorAccess: "/app/admin/operator-access",
    waitlist: "/app/admin/waitlist",
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

test("admin landing copy distinguishes operator grants from implemented-tool availability", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /implementedOperatorToolVisible/);
  assert.match(source, /Matching implemented operator tools appear in navigation/i);
  assert.match(source, /currently map only to future operator tools that are not built yet/i);
  assert.doesNotMatch(source, /Implemented operator tools appear in the navigation, and future tools remain unavailable until their routes are built\./);
});

test("admin shell nav keeps unimplemented operator sections disabled even with matching explicit grants", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [
      "operator.manage_approved_domains",
      "operator.manage_reviewer_scopes",
    ],
  });

  const approvedDomains = navigation.find(
    (item) => item.key === "approved_domains",
  );
  const reviewerScopes = navigation.find(
    (item) => item.key === "reviewer_scopes",
  );
  const operatorAccess = navigation.find(
    (item) => item.key === "operator_access",
  );
  const waitlist = navigation.find((item) => item.key === "waitlist");
  const auditInspection = navigation.find(
    (item) => item.key === "audit_inspection",
  );

  assert.equal(approvedDomains?.status, "available");
  assert.equal(approvedDomains?.availabilityLabel, "Available now");
  assert.match(approvedDomains?.reason ?? "", /operator\.manage_approved_domains/i);
  assert.equal(reviewerScopes?.status, "available");
  assert.equal(reviewerScopes?.availabilityLabel, "Available now");
  assert.match(reviewerScopes?.reason ?? "", /operator\.manage_reviewer_scopes/i);
  assert.equal(operatorAccess?.status, "disabled");
  assert.equal(waitlist?.status, "disabled");
  assert.equal(auditInspection?.status, "disabled");
});

test("admin shell nav links only to implemented operator routes for scoped operators", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: true,
    operatorScopes: [
      "operator.manage_operator_access",
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
  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.operatorAccess)?.status,
    "available",
  );
  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.waitlist)?.status,
    "available",
  );
  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.approvedDomains)?.status,
    "available",
  );
  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.reviewerScopes)?.status,
    "available",
  );
  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.auditInspection)?.status,
    "available",
  );

  const proofCleanupItem = navigation.find(
    (entry) => entry.path === ADMIN_ROUTES.proofCleanup,
  );

  assert.equal(proofCleanupItem?.status, "available");
  assert.equal(proofCleanupItem?.availabilityLabel, "Available now");
  assert.match(proofCleanupItem?.reason ?? "", /operator\.monitor_proof_cleanup/i);
});

test("admin shell nav keeps waitlist metrics available to read-audit operators without requiring contact scope", () => {
  const unscopedNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.internal_private_app_access"],
  });
  const scopedNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.read_audit"],
  });

  assert.equal(
    unscopedNavigation.find((item) => item.path === ADMIN_ROUTES.waitlist)?.status,
    "disabled",
  );
  assert.match(
    unscopedNavigation.find((item) => item.path === ADMIN_ROUTES.waitlist)?.reason ??
      "",
    /operator\.read_audit/i,
  );
  assert.equal(
    scopedNavigation.find((item) => item.path === ADMIN_ROUTES.waitlist)?.status,
    "available",
  );
});

test("/app/admin/waitlist enforces operator access and avoids raw waitlist identifiers", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/waitlist/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getPrivateAppGateResult/);
  assert.match(source, /hasOperatorScope/);
  assert.match(source, /WAITLIST_ADMIN_SCOPE/);
  assert.match(source, /WAITLIST_CONTACT_SCOPE/);
  assert.match(source, /canViewWaitlistContacts/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.match(source, /getWaitlistDashboardForOperator/);
  assert.match(source, /AdminShell/);
  assert.match(source, /signup\.maskedEmail/);
  assert.match(source, /Contact details and full per-submission survey context require/i);
  assert.doesNotMatch(source, /survey_token|normalized_email|waitlist_signups|row_id|uuid/i);
  assert.doesNotMatch(source, /proof upload|badge upload|document upload/i);
});

test("admin shell nav lets run-cleanup scope open proof cleanup controls", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.run_proof_cleanup"],
  });
  const proofCleanupItem = navigation.find(
    (entry) => entry.path === ADMIN_ROUTES.proofCleanup,
  );

  assert.equal(proofCleanupItem?.status, "available");
  assert.equal(proofCleanupItem?.availabilityLabel, "Available now");
  assert.match(proofCleanupItem?.reason ?? "", /operator\.run_proof_cleanup/i);
});

test("admin shell nav keeps operator grant management restricted to manage-operator-access scope", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.internal_private_app_access"],
  });
  const operatorAccessItem = navigation.find(
    (entry) => entry.path === ADMIN_ROUTES.operatorAccess,
  );

  assert.equal(operatorAccessItem?.status, "disabled");
  assert.match(
    operatorAccessItem?.reason ?? "",
    /operator\.manage_operator_access/i,
  );
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
