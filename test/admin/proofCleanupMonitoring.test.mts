import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
} from "../../src/lib/admin/access.ts";
import {
  PROOF_CLEANUP_MONITORING_SCOPE,
  sanitizeProofCleanupMetadata,
  normalizeProofCleanupMonitoringLimit,
  normalizeProofCleanupMonitoringOffset,
} from "../../src/lib/admin/proofCleanupMonitoringShared.ts";

test("proof cleanup monitoring navigation requires the monitoring scope only", () => {
  const noScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });
  const monitorScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.monitor_proof_cleanup"],
  });
  const runScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.run_proof_cleanup"],
  });

  assert.equal(PROOF_CLEANUP_MONITORING_SCOPE, "operator.monitor_proof_cleanup");
  assert.equal(
    noScopeNavigation.find((item) => item.path === ADMIN_ROUTES.proofCleanup)?.status,
    "disabled",
  );
  assert.equal(
    monitorScopeNavigation.find((item) => item.path === ADMIN_ROUTES.proofCleanup)?.status,
    "available",
  );
  assert.equal(
    runScopeNavigation.find((item) => item.path === ADMIN_ROUTES.proofCleanup)?.status,
    "disabled",
  );
});

test("proof cleanup monitoring helpers enforce bounds and recursively redact unsafe metadata", () => {
  assert.equal(normalizeProofCleanupMonitoringLimit("1"), 1);
  assert.equal(normalizeProofCleanupMonitoringLimit("500"), 50);
  assert.equal(normalizeProofCleanupMonitoringLimit("not-a-number"), 25);
  assert.equal(normalizeProofCleanupMonitoringOffset("-5"), 0);
  assert.equal(normalizeProofCleanupMonitoringOffset("10"), 10);
  assert.deepEqual(
    sanitizeProofCleanupMetadata({
      verification_evidence_id: "evidence-1",
      storage_path: "private/path.png",
      storage_bucket: "verification-proofs",
      signed_url: "https://signed.example",
      proof_file_contents: "raw proof bytes",
      proof_text: "raw proof text",
      filename: "badge.png",
      token: "secret-token",
      nested: {
        raw_proof_contents: "nested raw proof",
        public_url: "https://public.example",
        safe_count: 2,
      },
      array_values: [
        {
          proof_content: "array raw proof",
          safe_label: "retention",
        },
      ],
    }),
    {
      verification_evidence_id: "evidence-1",
      nested: {
        safe_count: 2,
      },
      array_values: [
        {
          safe_label: "retention",
        },
      ],
    },
  );
});

test("proof cleanup monitoring page gates before loading data and stays read-only", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/proof-cleanup/page.tsx", import.meta.url),
    "utf8",
  );
  const gateIndex = source.indexOf("const gate = getPrivateAppGateResult(");
  const loadErrorIndex = source.indexOf("if (operatorContext.loadError) {");
  const missingScopeIndex = source.indexOf("!hasOperatorScope");
  const dataLoadIndex = source.indexOf("const cleanupResult = await getProofCleanupMonitoringForOperator");

  assert.match(source, /AdminShell/);
  assert.match(source, /PROOF_CLEANUP_MONITORING_SCOPE/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.ok(gateIndex >= 0);
  assert.ok(loadErrorIndex >= 0);
  assert.ok(missingScopeIndex >= 0);
  assert.ok(dataLoadIndex >= 0);
  assert.ok(gateIndex < loadErrorIndex);
  assert.ok(loadErrorIndex < missingScopeIndex);
  assert.ok(missingScopeIndex < dataLoadIndex);
  assert.doesNotMatch(source, /viewVerificationProofAction|createSignedUrl|signed_url|storage_path/i);
  assert.doesNotMatch(source, /handleOpsProofRetentionCleanupRequest|cleanupExpiredVerificationProofs|runCleanup/i);
  assert.doesNotMatch(source, /<button/i);
});

test("proof cleanup monitoring server module uses scoped RPCs without service-role behavior", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/proofCleanupMonitoring.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /current_user_operator_scopes/);
  assert.match(source, /get_proof_cleanup_monitoring_summary/);
  assert.match(source, /list_proof_cleanup_failures_for_operator/);
  assert.match(source, /list_proof_cleanup_events_for_operator/);
  assert.match(source, /proof_cleanup\.monitor_unauthorized_attempt/);
  assert.match(source, /PROOF_CLEANUP_MONITORING_NOT_READY_MESSAGE/);
  assert.doesNotMatch(source, /createStorageAdminClient|SUPABASE_SERVICE_ROLE_KEY|service_role/i);
  assert.doesNotMatch(source, /\.from\("verification_evidence"\)|\.from\("security_events"\)/);
  assert.doesNotMatch(source, /signed_url|public_url|storage_path/i);
});

test("proof cleanup monitoring migration creates bounded summary-only operator RPCs", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_proof_cleanup_monitoring.sql"),
  );

  assert.ok(migrationName, "expected proof cleanup monitoring migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );

  assert.match(sql, /create or replace function public\.get_proof_cleanup_monitoring_summary/i);
  assert.match(sql, /create or replace function public\.list_proof_cleanup_failures_for_operator/i);
  assert.match(sql, /create or replace function public\.list_proof_cleanup_events_for_operator/i);
  assert.match(sql, /operator\.monitor_proof_cleanup/i);
  assert.match(sql, /proof_cleanup\.monitor_viewed/i);
  assert.match(sql, /proof_cleanup\.monitor_unauthorized_attempt/i);
  assert.match(sql, /least\(greatest\(coalesce\(requested_limit, 25\), 1\), 50\)/i);
  assert.match(sql, /verification_evidence\.deletion_failed/i);
  assert.match(sql, /verification_evidence\.deletion_scheduled/i);
  assert.match(sql, /verification_evidence\.deleted/i);
  assert.match(sql, /public\.sanitize_operator_audit_metadata\(event_row\.metadata\)/i);
  assert.doesNotMatch(sql, /'storage_path'|'storage_bucket'|'signed_url'|'public_url'|'filename'|'proof_file_contents'|'proof_text'/i);
  assert.doesNotMatch(sql, /storage\.objects|createSignedUrl|signed url/i);
  assert.doesNotMatch(sql, /update public\.verification_evidence|delete from public\.verification_evidence/i);
});

test("proof cleanup monitoring docs record read-only boundaries and runtime-pending state", () => {
  const source = readFileSync(
    new URL("../../docs/epochs/e05-proof-cleanup-monitoring.md", import.meta.url),
    "utf8",
  );

  assert.match(source, /operator\.monitor_proof_cleanup/);
  assert.match(source, /read-only/i);
  assert.match(source, /no manual cleanup/i);
  assert.match(source, /runtime validation.*pending/i);
  assert.match(source, /raw proof files/i);
  assert.match(source, /signed URLs/i);
});
