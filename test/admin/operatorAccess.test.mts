import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

import {
  OPERATOR_SCOPE_VALUES,
  buildAdminNavigation,
  getGrantedOperatorScopes,
  hasAnyOperatorScope,
  hasOperatorScope,
  isOperatorGrantActive,
} from "../../src/lib/admin/access.ts";
import { findAuthUserIdByEmailAcrossPages } from "../../src/lib/admin/operatorGrantLookup.ts";

test("operator scope list stays aligned with E05-T01", () => {
  assert.deepEqual(OPERATOR_SCOPE_VALUES, [
    "operator.internal_private_app_access",
    "operator.read_audit",
    "operator.manage_approved_domains",
    "operator.manage_reviewer_scopes",
    "operator.read_verification_requests",
    "operator.monitor_proof_cleanup",
    "operator.run_proof_cleanup",
    "operator.manage_operator_access",
    "operator.manage_beta_invites",
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

test("proof cleanup monitoring availability requires monitoring scope, not run scope", () => {
  assert.equal(
    hasAnyOperatorScope({
      scopes: ["operator.monitor_proof_cleanup"],
      requiredScopes: ["operator.monitor_proof_cleanup"],
    }),
    true,
  );

  assert.equal(
    hasAnyOperatorScope({
      scopes: ["operator.run_proof_cleanup"],
      requiredScopes: ["operator.monitor_proof_cleanup"],
    }),
    false,
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

test("admin nav only enables implemented operator sections for matching scopes", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [
      "operator.manage_operator_access",
      "operator.manage_approved_domains",
      "operator.manage_reviewer_scopes",
      "operator.read_audit",
      "operator.monitor_proof_cleanup",
      "operator.run_proof_cleanup",
    ],
  });

  const approvedDomains = navigation.find(
    (entry) => entry.key === "approved_domains",
  );
  const operatorAccess = navigation.find(
    (entry) => entry.key === "operator_access",
  );
  const reviewerScopes = navigation.find(
    (entry) => entry.key === "reviewer_scopes",
  );
  const auditInspection = navigation.find(
    (entry) => entry.key === "audit_inspection",
  );

  assert.equal(operatorAccess?.status, "available");
  assert.equal(operatorAccess?.availabilityLabel, "Available now");
  assert.match(operatorAccess?.reason ?? "", /operator\.manage_operator_access/i);
  assert.equal(approvedDomains?.status, "available");
  assert.equal(approvedDomains?.availabilityLabel, "Available now");
  assert.equal(reviewerScopes?.status, "available");
  assert.equal(reviewerScopes?.availabilityLabel, "Available now");
  assert.equal(auditInspection?.status, "available");
  assert.equal(auditInspection?.availabilityLabel, "Available now");

  const proofCleanup = navigation.find((entry) => entry.key === "proof_cleanup");

  assert.equal(proofCleanup?.status, "available");
  assert.equal(proofCleanup?.availabilityLabel, "Available now");
  assert.match(proofCleanup?.reason ?? "", /operator\.monitor_proof_cleanup/i);
});

test("internal private-app access scope does not unlock operator management tools by itself", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.internal_private_app_access"],
  });
  const operatorAccess = navigation.find(
    (entry) => entry.key === "operator_access",
  );

  assert.equal(operatorAccess?.status, "disabled");
  assert.match(operatorAccess?.reason ?? "", /operator\.manage_operator_access/i);
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

test("operator internal private-app scope migration extends allowed scopes without widening bootstrap access", () => {
  const migrationName = readdirSync(
    new URL("../../supabase/migrations/", import.meta.url),
  ).find((name) => name.endsWith("_add_operator_internal_private_app_access_scope.sql"));

  assert.ok(migrationName, "expected operator internal private-app scope migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );

  assert.match(sql, /create or replace function public\.operator_scope_values\(\)/i);
  assert.match(sql, /'operator\.internal_private_app_access'/i);
  assert.doesNotMatch(
    sql,
    /grant execute on function public\.bootstrap_operator_access\(uuid, text\[\], text\) to authenticated/i,
  );
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

test("operator grant audit redaction migration removes target identifiers from grant and revoke event metadata", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_redact_operator_grant_audit_metadata.sql"),
  );

  assert.ok(migrationName, "expected operator grant audit metadata redaction migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );
  const grantFunction = sql.slice(
    sql.indexOf("create or replace function public.grant_operator_access"),
    sql.indexOf("create or replace function public.revoke_operator_access"),
  );
  const revokeFunction = sql.slice(
    sql.indexOf("create or replace function public.revoke_operator_access"),
    sql.indexOf("revoke all on function public.grant_operator_access"),
  );

  assert.match(grantFunction, /operator_access\.granted/i);
  assert.match(revokeFunction, /operator_access\.revoked/i);
  assert.match(grantFunction, /target_user_found', true/i);
  assert.match(grantFunction, /target_already_had_active_grant', true/i);
  assert.match(grantFunction, /grant_created', true/i);
  assert.match(revokeFunction, /target_user_found', true/i);
  assert.match(revokeFunction, /grant_revoked', true/i);
  assert.match(`${grantFunction}\n${revokeFunction}`, /operator_access_flow', 'grant_management'/i);
  assert.doesNotMatch(
    `${grantFunction}\n${revokeFunction}`,
    /'target_user_id'\s*,|'targetUserId'\s*,|'actor_user_id'\s*,|'actorUserId'\s*,|'user_id'\s*,\s*target_user_id/i,
  );
  assert.doesNotMatch(
    `${grantFunction}\n${revokeFunction}`,
    /beta_access|verification_claims|airline_email_verified|restricted_board|role_claim|base_claim/i,
  );
});

test("operator grant management source stays server-only, resolves target email privately, and grants only internal access scope", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/operatorGrants.ts", import.meta.url),
    "utf8",
  );
  const pageSource = readFileSync(
    new URL("../../app/app/admin/operator-access/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /import "server-only"/);
  assert.match(source, /operator\.manage_operator_access/);
  assert.match(source, /operator\.internal_private_app_access/);
  assert.match(source, /grant_operator_access/);
  assert.match(source, /auth\.admin\.listUsers/);
  assert.doesNotMatch(source, /page <= 10|page < 10/);
  assert.match(source, /recordSecurityEvent/);
  assert.doesNotMatch(
    source,
    /beta_access|verification_claims|airline_email_verified|restricted_board|role_claim|base_claim/i,
  );
  assert.doesNotMatch(source, /console\.(log|error|warn)/);
  assert.match(pageSource, /type="email"/);
  assert.match(pageSource, /grantOperatorInternalAccessAction/);
  assert.doesNotMatch(pageSource, /target_user_id|auth user uuid|reviewer user id/i);
});

test("operator grant management page keeps copy separate from airline verification and beta grants", () => {
  const pageSource = readFileSync(
    new URL("../../app/app/admin/operator-access/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(pageSource, /existing operators with operator\.manage_operator_access/i);
  assert.match(pageSource, /does not mark internal accounts as airline-email verified/i);
  assert.match(pageSource, /does not grant beta access/i);
  assert.match(pageSource, /access_source/);
  assert.match(pageSource, /operator_private_app_access/);
  assert.doesNotMatch(pageSource, /@jmpseat\.com|operator_uuid|operator_email/i);
});

test("target lookup can find a valid auth user on a page beyond the old 2000-user cap", async () => {
  const pagesVisited: number[] = [];
  const targetEmail = "founder@example.com";
  const targetUserId = "target-user-id";

  const found = await findAuthUserIdByEmailAcrossPages({
    targetEmail,
    listUsersPage: async ({ page, perPage }) => {
      pagesVisited.push(page);

      if (page <= 10) {
        return {
          data: {
            users: Array.from({ length: perPage }, (_, index) => ({
              id: `early-${page}-${index}`,
              email: `early-${page}-${index}@example.com`,
            })),
          },
          error: null,
        };
      }

      if (page === 11) {
        return {
          data: {
            users: [
              {
                id: targetUserId,
                email: targetEmail,
              },
            ],
          },
          error: null,
        };
      }

      return {
        data: { users: [] },
        error: null,
      };
    },
  });

  assert.equal(found, targetUserId);
  assert.deepEqual(pagesVisited, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

test("target lookup continues until exhaustion before returning not found", async () => {
  const pagesVisited: number[] = [];

  const found = await findAuthUserIdByEmailAcrossPages({
    targetEmail: "missing@example.com",
    listUsersPage: async ({ page, perPage }) => {
      pagesVisited.push(page);

      if (page <= 3) {
        return {
          data: {
            users: Array.from({ length: perPage }, (_, index) => ({
              id: `full-${page}-${index}`,
              email: `full-${page}-${index}@example.com`,
            })),
          },
          error: null,
        };
      }

      return {
        data: {
          users: [
            {
              id: "tail-user",
              email: "tail@example.com",
            },
          ],
        },
        error: null,
      };
    },
  });

  assert.equal(found, null);
  assert.deepEqual(pagesVisited, [1, 2, 3, 4]);
});

test("target lookup stops on an empty page without inventing a target-not-found early", async () => {
  const pagesVisited: number[] = [];

  const found = await findAuthUserIdByEmailAcrossPages({
    targetEmail: "missing@example.com",
    listUsersPage: async ({ page, perPage }) => {
      pagesVisited.push(page);

      if (page === 1) {
        return {
          data: {
            users: Array.from({ length: perPage }, (_, index) => ({
              id: `full-${index}`,
              email: `full-${index}@example.com`,
            })),
          },
          error: null,
        };
      }

      return {
        data: { users: [] },
        error: null,
      };
    },
  });

  assert.equal(found, null);
  assert.deepEqual(pagesVisited, [1, 2]);
});
