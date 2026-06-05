import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  OPERATOR_SCOPE_VALUES,
  buildAdminNavigation,
  getGrantedOperatorScopes,
  hasAnyOperatorScope,
  hasOperatorScope,
  isOperatorGrantActive,
} from "../../src/lib/admin/access.ts";

test("operator scope list stays aligned with E05-T01", () => {
  assert.deepEqual(OPERATOR_SCOPE_VALUES, [
    "operator.read_audit",
    "operator.manage_approved_domains",
    "operator.manage_reviewer_scopes",
    "operator.read_verification_requests",
    "operator.monitor_proof_cleanup",
    "operator.run_proof_cleanup",
    "operator.manage_operator_access",
  ]);
});

test("no operator access exists by default", () => {
  assert.equal(
    hasOperatorScope({
      scopes: [],
      scope: "operator.read_audit",
    }),
    false,
  );
});

test("active explicit grants are required for operator scopes", () => {
  assert.deepEqual(
    getGrantedOperatorScopes({
      scopes: ["operator.read_audit"],
      status: "active",
      revokedAt: null,
    }),
    ["operator.read_audit"],
  );

  assert.equal(
    hasOperatorScope({
      scopes: ["operator.read_audit"],
      scope: "operator.read_audit",
    }),
    true,
  );
});

test("revoked grants do not count", () => {
  assert.equal(
    isOperatorGrantActive({
      status: "revoked",
      revokedAt: "2026-06-05T12:00:00.000Z",
    }),
    false,
  );

  assert.deepEqual(
    getGrantedOperatorScopes({
      scopes: ["operator.read_audit"],
      status: "revoked",
      revokedAt: "2026-06-05T12:00:00.000Z",
    }),
    [],
  );
});

test("wrong scope does not count", () => {
  assert.equal(
    hasOperatorScope({
      scopes: ["operator.read_audit"],
      scope: "operator.manage_approved_domains",
    }),
    false,
  );
});

test("reviewer scope, beta access, profile text, and verification claims do not imply operator access", () => {
  const unrelatedState = {
    scopes: [],
    reviewerScopes: [{ scope_type: "global", scope_value: null, status: "active" }],
    betaStatus: "active",
    claimedAirline: "Test Air",
    verificationClaims: [{ claim_type: "airline_worker" }],
  } as const;

  assert.equal(
    hasOperatorScope({
      scopes: unrelatedState.scopes,
      scope: "operator.read_audit",
    }),
    false,
  );
});

test("proof cleanup availability can be satisfied by either monitoring or run scope", () => {
  assert.equal(
    hasAnyOperatorScope({
      scopes: ["operator.monitor_proof_cleanup"],
      requiredScopes: [
        "operator.monitor_proof_cleanup",
        "operator.run_proof_cleanup",
      ],
    }),
    true,
  );

  assert.equal(
    hasAnyOperatorScope({
      scopes: ["operator.run_proof_cleanup"],
      requiredScopes: [
        "operator.monitor_proof_cleanup",
        "operator.run_proof_cleanup",
      ],
    }),
    true,
  );
});

test("admin nav operator sections remain unavailable without explicit grants", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });

  const operatorItems = navigation.filter(
    (item) => item.key !== "verification_review",
  );

  assert.ok(operatorItems.every((item) => item.status === "disabled"));
});

test("admin nav operator sections remain disabled until their routes are implemented", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [
      "operator.manage_approved_domains",
      "operator.manage_reviewer_scopes",
      "operator.read_audit",
      "operator.monitor_proof_cleanup",
      "operator.run_proof_cleanup",
    ],
  });

  for (const key of [
    "approved_domains",
    "reviewer_scopes",
    "audit_inspection",
    "proof_cleanup",
  ] as const) {
    const item = navigation.find((entry) => entry.key === key);

    assert.equal(item?.status, "disabled");
    assert.equal(item?.availabilityLabel, "Authorized, not built yet");
    assert.match(item?.reason ?? "", /not implemented yet/i);
  }
});

test("operator grants migration creates bounded grants, helper functions, and self-escalation protections", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605113000_create_operator_grants_foundation.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /create table public\.operator_grants/i);
  assert.match(sql, /one_active_grant_per_user_idx|unique index operator_grants_one_active_grant_per_user_idx/i);
  assert.match(sql, /alter table public\.operator_grants enable row level security/i);
  assert.match(sql, /create or replace function public\.current_user_operator_scopes/i);
  assert.match(sql, /create or replace function public\.is_operator_with_scope/i);
  assert.match(sql, /create or replace function public\.grant_operator_access/i);
  assert.match(sql, /create or replace function public\.revoke_operator_access/i);
  assert.match(sql, /create or replace function public\.bootstrap_operator_access/i);
  assert.match(sql, /Operators cannot grant themselves operator access\./i);
  assert.match(sql, /Operators cannot revoke their own operator access in this slice\./i);
  assert.match(sql, /Requested operator scopes are invalid\./i);
  assert.match(sql, /operator_access\.unauthorized_attempt/i);
  assert.match(sql, /'ok', false/i);
  assert.match(sql, /'code', 'missing_manage_operator_access_scope'/i);
  assert.match(sql, /'code', 'self_grant_blocked'/i);
  assert.match(sql, /'code', 'self_revoke_blocked'/i);
  assert.match(sql, /'code', 'invalid_requested_scopes'/i);
  assert.match(sql, /'code', 'operator_access_granted'/i);
  assert.match(sql, /'code', 'operator_access_revoked'/i);
  assert.match(sql, /lock table public\.operator_grants in exclusive mode/i);
  assert.match(sql, /grant execute on function public\.bootstrap_operator_access\(uuid, text\[\], text\) to service_role/i);
  assert.doesNotMatch(sql, /grant execute on function public\.bootstrap_operator_access\(uuid, text\[\], text\) to authenticated/i);
});

test("operator grant/revoke expected denials return after auditing instead of raising and rolling back", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605113000_create_operator_grants_foundation.sql", import.meta.url),
    "utf8",
  );
  const grantFunction = sql.slice(
    sql.indexOf("create or replace function public.grant_operator_access"),
    sql.indexOf("create or replace function public.revoke_operator_access"),
  );
  const revokeFunction = sql.slice(
    sql.indexOf("create or replace function public.revoke_operator_access"),
    sql.indexOf("create or replace function public.bootstrap_operator_access"),
  );
  const auditedExpectedDenialCodes = [
    "missing_manage_operator_access_scope",
    "self_grant_blocked",
    "invalid_requested_scopes",
    "target_already_active",
    "self_revoke_blocked",
    "target_not_active",
  ];

  for (const code of auditedExpectedDenialCodes) {
    assert.match(`${grantFunction}\n${revokeFunction}`, new RegExp(`'code', '${code}'`));
    assert.match(
      `${grantFunction}\n${revokeFunction}`,
      new RegExp(`'reason_code', '${code}'[\\s\\S]*?return jsonb_build_object\\(`),
    );
  }

  assert.doesNotMatch(grantFunction, /raise exception/i);
  assert.doesNotMatch(revokeFunction, /raise exception/i);
});
