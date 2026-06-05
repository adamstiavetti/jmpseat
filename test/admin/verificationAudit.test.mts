import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
} from "../../src/lib/admin/access.ts";
import {
  AUDIT_INSPECTION_SCOPES,
  sanitizeAuditMetadata,
  normalizeAuditLimit,
  normalizeAuditOffset,
  normalizeSelectedAuditRequestId,
  isSelectedAuditRequestIdValid,
  canReadAuditEvents,
  canReadVerificationRequests,
} from "../../src/lib/admin/verificationAuditShared.ts";

test("audit-inspection navigation is available for either audit or verification-request operator scope", () => {
  const noScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });
  const requestScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.read_verification_requests"],
  });
  const auditScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.read_audit"],
  });

  assert.equal(
    noScopeNavigation.find((item) => item.path === ADMIN_ROUTES.auditInspection)?.status,
    "disabled",
  );
  assert.equal(
    requestScopeNavigation.find((item) => item.path === ADMIN_ROUTES.auditInspection)?.status,
    "available",
  );
  assert.equal(
    auditScopeNavigation.find((item) => item.path === ADMIN_ROUTES.auditInspection)?.status,
    "available",
  );
});

test("audit-inspection shared helpers keep scopes separate and enforce pagination bounds", () => {
  assert.deepEqual(AUDIT_INSPECTION_SCOPES, [
    "operator.read_audit",
    "operator.read_verification_requests",
  ]);
  assert.equal(canReadVerificationRequests(["operator.read_verification_requests"]), true);
  assert.equal(canReadVerificationRequests(["operator.read_audit"]), false);
  assert.equal(canReadAuditEvents(["operator.read_audit"]), true);
  assert.equal(canReadAuditEvents(["operator.read_verification_requests"]), false);
  assert.equal(normalizeAuditLimit("1"), 1);
  assert.equal(normalizeAuditLimit("500"), 50);
  assert.equal(normalizeAuditLimit("not-a-number"), 25);
  assert.equal(normalizeAuditOffset("-10"), 0);
  assert.equal(normalizeAuditOffset("20"), 20);
  assert.equal(isSelectedAuditRequestIdValid(null), true);
  assert.equal(isSelectedAuditRequestIdValid(""), true);
  assert.equal(isSelectedAuditRequestIdValid("not-a-uuid"), false);
  assert.equal(
    normalizeSelectedAuditRequestId("  8B3F2D30-F4F1-4D02-A56B-8AD94D327851  "),
    "8b3f2d30-f4f1-4d02-a56b-8ad94d327851",
  );
  assert.equal(normalizeSelectedAuditRequestId("not-a-uuid"), null);
});

test("audit metadata sanitizer removes proof paths, URLs, tokens, and raw proof keys", () => {
  assert.deepEqual(
    sanitizeAuditMetadata({
      request_id: "request-1",
      storage_path: "private/path.png",
      signed_url: "https://signed.example",
      public_url: "https://public.example",
      token: "secret",
      proof_text: "visible proof text",
      proof_file_contents: "raw proof bytes",
      proof_content: "raw proof content",
      proof_contents: "raw proof contents",
      proof_body: "raw proof body",
      proof_data: "raw proof data",
      raw_proof: "raw proof",
      raw_proof_text: "badge content",
      raw_proof_contents: "raw proof contents",
      extracted_text: "extracted proof text",
      nested: {
        proof_filename: "badge.png",
        proof_text: "nested proof text",
        proof_file_contents: "nested proof file contents",
        path: "nested/private/path.png",
        magic_link: "https://magic.example",
        session: "session-value",
        safe_count: 2,
      },
      array_values: [
        {
          original_filename: "badge-front.png",
          safe_label: "front",
        },
        {
          nested: {
            access_token: "token-value",
            proof_content: "array proof content",
            raw_proof_contents: "array raw proof contents",
            extracted_text: "array extracted text",
            safe_label: "inside-array",
          },
        },
      ],
    }),
    {
      request_id: "request-1",
      nested: {
        safe_count: 2,
      },
      array_values: [
        {
          safe_label: "front",
        },
        {
          nested: {
            safe_label: "inside-array",
          },
        },
      ],
    },
  );
});

test("audit-inspection route enforces private gate and operator scope before loading data", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/audit/page.tsx", import.meta.url),
    "utf8",
  );
  const gateIndex = source.indexOf("const gate = getPrivateAppGateResult(");
  const fallbackIndex = source.indexOf("if (!env.enabled) {");
  const loadErrorIndex = source.indexOf("if (operatorContext.loadError) {");
  const missingScopeIndex = source.indexOf("!hasAnyOperatorScope");
  const dataLoadIndex = source.indexOf("const auditResult = await getVerificationAuditForOperator");

  assert.match(source, /AdminShell/);
  assert.match(source, /AUDIT_INSPECTION_SCOPES/);
  assert.match(source, /getVerificationAuditForOperator/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.ok(gateIndex >= 0);
  assert.ok(fallbackIndex >= 0);
  assert.ok(loadErrorIndex >= 0);
  assert.ok(missingScopeIndex >= 0);
  assert.ok(dataLoadIndex >= 0);
  assert.ok(gateIndex < fallbackIndex);
  assert.ok(loadErrorIndex < missingScopeIndex);
  assert.ok(missingScopeIndex < dataLoadIndex);
  assert.doesNotMatch(source, /viewVerificationProofAction|signed_url|storage_path/i);
});

test("audit-inspection server module uses scoped RPCs and does not expose service-role behavior", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/verificationAudit.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /current_user_operator_scopes/);
  assert.match(source, /list_verification_requests_for_operator/);
  assert.match(source, /get_verification_request_audit_detail/);
  assert.match(source, /list_security_events_for_operator/);
  assert.match(source, /operator_audit\.unauthorized_attempt/);
  assert.match(source, /VERIFICATION_AUDIT_NOT_READY_MESSAGE/);
  assert.match(source, /kind: "not_ready"/);
  assert.doesNotMatch(source, /createStorageAdminClient|SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /\.from\("verification_requests"\)|\.from\("security_events"\)/);
  assert.doesNotMatch(source, /signed_url|public_url|storage_path/i);
});

test("audit-inspection server module rejects malformed selected request ids before UUID RPC", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/verificationAudit.ts", import.meta.url),
    "utf8",
  );
  const invalidBranchIndex = source.indexOf("code: \"invalid_request_id\"");
  const normalizeIndex = source.indexOf("normalizeSelectedAuditRequestId(input?.selectedRequestId)");
  const detailRpcIndex = source.indexOf("\"get_verification_request_audit_detail\"");
  const notReadyAfterInvalidIndex = source.indexOf(
    "code: \"verification_audit_not_ready\"",
    invalidBranchIndex,
  );

  assert.ok(invalidBranchIndex >= 0);
  assert.ok(normalizeIndex >= 0);
  assert.ok(detailRpcIndex >= 0);
  assert.ok(invalidBranchIndex < detailRpcIndex);
  assert.ok(normalizeIndex < detailRpcIndex);
  assert.match(source, /message: "Invalid request id\."/);
  assert.match(source, /selectedRequestError/);
  assert.match(source, /requests,\s*selectedRequest,\s*selectedRequestError,\s*events/s);
  assert.ok(notReadyAfterInvalidIndex > detailRpcIndex);
  assert.doesNotMatch(source, /target_request_id: input\.selectedRequestId/);
});

test("audit-inspection page renders malformed request id as detail-level state", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/audit/page.tsx", import.meta.url),
    "utf8",
  );
  const requestListIndex = source.indexOf("auditResult.requests.map");
  const detailErrorIndex = source.indexOf("auditResult.selectedRequestError");
  const eventListIndex = source.indexOf("auditResult.events.map");

  assert.ok(requestListIndex >= 0);
  assert.ok(detailErrorIndex >= 0);
  assert.ok(eventListIndex >= 0);
  assert.ok(requestListIndex < detailErrorIndex);
  assert.ok(detailErrorIndex < eventListIndex);
  assert.match(source, /auditResult\.selectedRequestError\.message/);
  assert.doesNotMatch(source, /selectedRequestId.*unauthorized_attempt/);
});

test("audit-inspection migration recursively sanitizes metadata for direct RPC callers", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_verification_audit_inspection.sql"),
  );

  assert.ok(migrationName, "expected audit-inspection migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );
  const sanitizer = sql.slice(
    sql.indexOf("create or replace function public.sanitize_operator_audit_metadata"),
    sql.indexOf("create or replace function public.list_verification_requests_for_operator"),
  );

  assert.match(sql, /create or replace function public\.operator_audit_metadata_key_sensitive/i);
  assert.match(sanitizer, /jsonb_typeof\(coalesce\(input_metadata, '\{\}'::jsonb\)\)/i);
  assert.match(sanitizer, /when 'object' then/i);
  assert.match(sanitizer, /jsonb_each\(coalesce\(input_metadata, '\{\}'::jsonb\)\)/i);
  assert.match(sanitizer, /public\.sanitize_operator_audit_metadata\(value\)/i);
  assert.match(sanitizer, /when 'array' then/i);
  assert.match(sanitizer, /jsonb_array_elements\(input_metadata\)/i);
  assert.match(sanitizer, /with ordinality as array_entry\(value, ordinality\)/i);
  assert.match(sql, /proof_filename|original_filename|storage_path|storage_bucket/i);
  assert.match(
    sql,
    /proof_text|proof_content|proof_contents|proof_file_contents|proof_body|proof_data/i,
  );
  assert.match(sql, /raw_proof|raw_proof_text|raw_proof_contents|extracted_text|ocr_text/i);
  assert.match(sql, /signed_url|public_url|\(\^\|_\)url\$|magic_link|session|authorization|cookie/i);
  assert.match(sql, /service_role|service_role_key|access_token|refresh_token/i);
  assert.doesNotMatch(
    sanitizer,
    /select jsonb_object_agg\(key, value\)[\s\S]*where key !~\*/i,
  );
});

test("audit-inspection migration creates bounded metadata-only operator RPCs", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_verification_audit_inspection.sql"),
  );

  assert.ok(migrationName, "expected audit-inspection migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );

  assert.match(sql, /create or replace function public\.list_verification_requests_for_operator/i);
  assert.match(sql, /create or replace function public\.get_verification_request_audit_detail/i);
  assert.match(sql, /create or replace function public\.list_security_events_for_operator/i);
  assert.match(sql, /operator\.read_verification_requests/i);
  assert.match(sql, /operator\.read_audit/i);
  assert.match(sql, /operator_audit\.viewed/i);
  assert.match(sql, /operator_audit\.unauthorized_attempt/i);
  assert.match(sql, /least\(greatest\(coalesce\(requested_limit, 25\), 1\), 50\)/i);
  assert.match(sql, /'proof_present',/i);
  assert.doesNotMatch(sql, /'storage_path'|storage_path,|'signed_url'|'public_url'/i);
  assert.doesNotMatch(sql, /create policy .*security_events.*select/i);
});

test("audit-inspection migration preserves existing reviewer queue and claim issuance behavior", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_verification_audit_inspection.sql"),
  );

  assert.ok(migrationName, "expected audit-inspection migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(sql, /create or replace function public\.can_review_verification_request/i);
  assert.doesNotMatch(sql, /insert into public\.verification_claims|update public\.verification_requests/i);
  assert.doesNotMatch(sql, /storage\.objects|createSignedUrl|signed url/i);
});
