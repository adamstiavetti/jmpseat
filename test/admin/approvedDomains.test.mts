import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

import {
  APPROVED_DOMAIN_PERSONAL_EMAIL_DOMAINS,
  isApprovedDomainFormatValid,
  isPersonalApprovedDomain,
  normalizeApprovedDomain,
  normalizeApprovedDomainLabel,
} from "../../src/lib/admin/approvedDomainsShared.ts";
import { ADMIN_ROUTES, buildAdminNavigation } from "../../src/lib/admin/access.ts";

test("approved-domain helpers normalize casing and trim operator input safely", () => {
  assert.equal(normalizeApprovedDomain(" Crew.Airline.TEST "), "crew.airline.test");
  assert.equal(normalizeApprovedDomain(""), null);
  assert.equal(normalizeApprovedDomainLabel("  Test Air  "), "Test Air");
  assert.equal(normalizeApprovedDomainLabel(" "), null);
});

test("approved-domain format validation rejects protocols, paths, local-parts, and malformed domains", () => {
  assert.equal(isApprovedDomainFormatValid("airline.test"), true);
  assert.equal(isApprovedDomainFormatValid("runtime-proof-airline.test"), true);
  assert.equal(isApprovedDomainFormatValid("runtime-proof-airline.example"), true);
  assert.equal(isApprovedDomainFormatValid("runtime-proof-airline.invalid"), true);
  assert.equal(
    normalizeApprovedDomain(" RUNTIME-Proof-Airline.TEST "),
    "runtime-proof-airline.test",
  );
  assert.equal(isApprovedDomainFormatValid("https://airline.test"), false);
  assert.equal(isApprovedDomainFormatValid("airline.test/path"), false);
  assert.equal(isApprovedDomainFormatValid("crew.member@airline.test"), false);
  assert.equal(isApprovedDomainFormatValid("crew_airline.test"), false);
  assert.equal(isApprovedDomainFormatValid("crew airline.test"), false);
  assert.equal(isApprovedDomainFormatValid("-airline.test"), false);
  assert.equal(isApprovedDomainFormatValid("airline-.test"), false);
  assert.equal(isApprovedDomainFormatValid("localhost"), false);
});

test("approved-domain helper blocks known personal-email providers without hard-coding airline domains", () => {
  assert.ok(APPROVED_DOMAIN_PERSONAL_EMAIL_DOMAINS.includes("gmail.com"));
  assert.equal(isPersonalApprovedDomain("gmail.com"), true);
  assert.equal(isPersonalApprovedDomain("airline.test"), false);
});

test("approved-domains route becomes available only for the matching operator scope", () => {
  const unauthorizedNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });
  const authorizedNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.manage_approved_domains"],
  });

  assert.equal(
    unauthorizedNavigation.find((item) => item.path === ADMIN_ROUTES.approvedDomains)?.status,
    "disabled",
  );

  const approvedDomainsItem = authorizedNavigation.find(
    (item) => item.path === ADMIN_ROUTES.approvedDomains,
  );

  assert.equal(approvedDomainsItem?.status, "available");
  assert.equal(approvedDomainsItem?.availabilityLabel, "Available now");
  assert.match(approvedDomainsItem?.reason ?? "", /operator\.manage_approved_domains/i);
});

test("implemented operator tools are linkable while scopes stay tool-specific", () => {
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
});

test("approved-domains page enforces operator scope server-side and uses the shared admin shell", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/approved-domains/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /AdminShell/);
  assert.match(source, /getCurrentOperatorAccess/);
  assert.match(source, /hasOperatorScope/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.match(source, /getApprovedDomainsForOperator/);
  assert.match(source, /createApprovedEmailDomainAction/);
  assert.match(source, /updateApprovedEmailDomainAction/);
  assert.match(source, /disableApprovedEmailDomainAction/);
  assert.match(source, /const appContext = await getCurrentAppAccessContext\(\);/);
  assert.match(source, /const gate = getPrivateAppGateResult\(/);
  assert.match(source, /if \(gate\.kind === "redirect"\)\s*{\s*redirect\(gate\.path\);/s);
  assert.match(source, /if \(!env\.enabled\)/);
  assert.match(source, /if \(operatorContext\.loadError\)\s*{\s*return \(/s);
  assert.doesNotMatch(source, /\.from\("approved_email_domains"\)/);
});

test("approved-domains page runs the private-app gate before the auth-config fallback", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/approved-domains/page.tsx", import.meta.url),
    "utf8",
  );

  const gateIndex = source.indexOf("const gate = getPrivateAppGateResult(");
  const fallbackIndex = source.indexOf("if (!env.enabled) {");
  const authCardIndex = source.indexOf("<AuthCard");

  assert.ok(gateIndex >= 0);
  assert.ok(fallbackIndex >= 0);
  assert.ok(authCardIndex >= 0);
  assert.ok(gateIndex < fallbackIndex);
  assert.match(source, /hasSupabaseSessionCookie/);
  assert.match(source, /redirect\(`\$\{AUTH_ROUTES\.login\}\?next=/);
});

test("approved-domains page renders not-ready setup UI when operator access cannot load", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/approved-domains/page.tsx", import.meta.url),
    "utf8",
  );
  const loadErrorIndex = source.indexOf("if (operatorContext.loadError) {");
  const unauthorizedBranchIndex = source.indexOf("if (\n    !hasOperatorScope(");
  const unauthorizedRedirectIndex = source.indexOf("redirect(AUTH_ROUTES.accessRestricted);");
  const listIndex = source.indexOf("const approvedDomainsResult = await getApprovedDomainsForOperator(searchQuery);");
  const loadErrorBlock = source.slice(loadErrorIndex, unauthorizedBranchIndex);

  assert.ok(loadErrorIndex >= 0);
  assert.ok(unauthorizedBranchIndex >= 0);
  assert.ok(unauthorizedRedirectIndex >= 0);
  assert.ok(listIndex >= 0);
  assert.ok(loadErrorIndex < unauthorizedBranchIndex);
  assert.ok(unauthorizedBranchIndex < unauthorizedRedirectIndex);
  assert.ok(loadErrorIndex < listIndex);
  assert.match(loadErrorBlock, /Approved-domain operator tooling is not ready yet\./);
  assert.match(loadErrorBlock, /no privileged domain data was loaded/i);
  assert.doesNotMatch(loadErrorBlock, /unauthorized_attempt|accessRestricted/);
});

test("approved-domains page still redirects true missing-scope access to the restricted route", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/approved-domains/page.tsx", import.meta.url),
    "utf8",
  );
  const unauthorizedBlock = source.slice(
    source.indexOf("if (\n    !hasOperatorScope("),
    source.indexOf("const approvedDomainsResult = await getApprovedDomainsForOperator(searchQuery);"),
  );

  assert.match(unauthorizedBlock, /approved_email_domain\.unauthorized_attempt/);
  assert.match(unauthorizedBlock, /redirect\(AUTH_ROUTES\.accessRestricted\)/);
});

test("approved-domains server module uses session-backed RPCs and not client-side or service-role table writes", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/approvedDomains.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /rpc\(\s*"list_approved_email_domains_for_operator"/);
  assert.match(source, /rpc\(\s*"create_approved_email_domain"/);
  assert.match(source, /rpc\(\s*"update_approved_email_domain"/);
  assert.match(source, /rpc\(\s*"disable_approved_email_domain"/);
  assert.match(source, /current_user_operator_scopes/);
  assert.doesNotMatch(source, /createStorageAdminClient|SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /\.from\("approved_email_domains"\)/);
});

test("approved-domains server module distinguishes operator-scope setup failures from true unauthorized access", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/approvedDomains.ts", import.meta.url),
    "utf8",
  );
  const scopesErrorBlock = source.slice(
    source.indexOf("if (scopesResult.error) {"),
    source.indexOf("if (\n    !hasOperatorScope"),
  );

  assert.match(source, /APPROVED_DOMAIN_NOT_READY_MESSAGE/);
  assert.match(source, /if \(scopesResult\.error\)\s*{\s*return\s*{\s*kind: "not_ready"/s);
  assert.match(source, /if \(access\.kind === "not_ready"\)/);
  assert.match(source, /if \(access\.kind === "unauthorized"\)\s*{\s*await recordApprovedDomainUnauthorizedRouteAttempt/s);
  assert.doesNotMatch(scopesErrorBlock, /unauthorized_attempt|recordApprovedDomainUnauthorizedRouteAttempt/);
});

test("approved-domains migration adds audited operator RPCs without destructive delete behavior", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605184500_add_operator_managed_approved_email_domains.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /create or replace function public\.list_approved_email_domains_for_operator/i);
  assert.match(sql, /create or replace function public\.create_approved_email_domain/i);
  assert.match(sql, /create or replace function public\.update_approved_email_domain/i);
  assert.match(sql, /create or replace function public\.disable_approved_email_domain/i);
  assert.match(sql, /approved_email_domain\.created/i);
  assert.match(sql, /approved_email_domain\.updated/i);
  assert.match(sql, /approved_email_domain\.disabled/i);
  assert.match(sql, /approved_email_domain\.unauthorized_attempt/i);
  assert.match(sql, /status = 'disabled'/i);
  assert.match(sql, /operator\.manage_approved_domains/i);
  assert.match(sql, /exception\s+when unique_violation/i);
  assert.match(sql, /get stacked diagnostics v_constraint_name = constraint_name;/i);
  assert.match(sql, /approved_email_domains_domain_key/i);
  assert.match(sql, /'code', 'domain_already_exists'/i);
  assert.doesNotMatch(sql, /delete from public\.approved_email_domains/i);
});

test("approved-domains corrective migration aligns SQL validation with reserved test TLD support", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_fix_approved_domain_test_tld_validation.sql"),
  );

  assert.ok(migrationName, "expected corrective approved-domain validation migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );

  assert.match(sql, /create or replace function public\.approved_email_domain_format_valid/i);
  assert.match(sql, /normalize_approved_email_domain\(raw_domain\) ~ /i);
  assert.ok(
    sql.includes("(?:\\.[a-z0-9]"),
    "SQL regex should match a literal dot between domain labels",
  );
  assert.equal(
    sql.includes("(?:\\\\.[a-z0-9]"),
    false,
    "SQL regex should not require a literal backslash before the dot",
  );
});

test("approved-domains RPC contract returns structured validation failures for expected invalid input", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605184500_add_operator_managed_approved_email_domains.sql", import.meta.url),
    "utf8",
  );
  const createFunction = sql.slice(
    sql.indexOf("create or replace function public.create_approved_email_domain"),
    sql.indexOf("create or replace function public.update_approved_email_domain"),
  );
  const updateFunction = sql.slice(
    sql.indexOf("create or replace function public.update_approved_email_domain"),
    sql.indexOf("create or replace function public.disable_approved_email_domain"),
  );
  const source = readFileSync(
    new URL("../../src/lib/admin/approvedDomains.ts", import.meta.url),
    "utf8",
  );

  assert.match(createFunction, /requested_domain text/i);
  assert.match(createFunction, /requested_status text default 'active'/i);
  assert.match(createFunction, /if not public\.approved_email_domain_format_valid\(requested_domain\) then/i);
  assert.match(createFunction, /'ok', false[\s\S]*'code', 'invalid_domain_format'/i);
  assert.match(createFunction, /if public\.is_personal_approved_email_domain\(v_domain\) then/i);
  assert.match(createFunction, /'ok', false[\s\S]*'code', 'personal_email_domain_blocked'/i);
  assert.match(createFunction, /if v_status not in \('active', 'disabled'\) then/i);
  assert.match(createFunction, /'ok', false[\s\S]*'code', 'invalid_status'/i);
  assert.match(updateFunction, /target_domain_id uuid/i);
  assert.match(updateFunction, /requested_domain text/i);
  assert.match(updateFunction, /'ok', false[\s\S]*'code', 'invalid_domain_format'/i);
  assert.match(updateFunction, /'ok', false[\s\S]*'code', 'personal_email_domain_blocked'/i);
  assert.match(updateFunction, /'ok', false[\s\S]*'code', 'invalid_status'/i);
  assert.match(source, /requested_domain: values\.domain/);
  assert.match(source, /requested_status: values\.status \?\? APPROVED_EMAIL_DOMAIN_STATUSES\[0\]/);
  assert.match(source, /target_domain_id: values\.domainId/);
  assert.doesNotMatch(source, /\bp_domain\b|\bp_status\b|\bp_domain_id\b/);
});

test("approved-domains migration handles duplicate-domain races inside create and update RPCs", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605184500_add_operator_managed_approved_email_domains.sql", import.meta.url),
    "utf8",
  );
  const createFunction = sql.slice(
    sql.indexOf("create or replace function public.create_approved_email_domain"),
    sql.indexOf("create or replace function public.update_approved_email_domain"),
  );
  const updateFunction = sql.slice(
    sql.indexOf("create or replace function public.update_approved_email_domain"),
    sql.indexOf("create or replace function public.disable_approved_email_domain"),
  );

  assert.match(createFunction, /exception\s+when unique_violation/i);
  assert.match(createFunction, /'code', 'domain_already_exists'/i);
  assert.match(updateFunction, /exception\s+when unique_violation/i);
  assert.match(updateFunction, /'code', 'domain_already_exists'/i);
});

test("approved-domains update path emits disabled audit when the resulting update performs a disable transition", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605184500_add_operator_managed_approved_email_domains.sql", import.meta.url),
    "utf8",
  );
  const updateFunction = sql.slice(
    sql.indexOf("create or replace function public.update_approved_email_domain"),
    sql.indexOf("create or replace function public.disable_approved_email_domain"),
  );

  assert.match(updateFunction, /v_event_type := case/i);
  assert.match(updateFunction, /when v_status = 'disabled' and v_existing_status <> 'disabled'/i);
  assert.match(updateFunction, /then 'approved_email_domain\.disabled'/i);
  assert.match(updateFunction, /else 'approved_email_domain\.updated'/i);
  assert.match(updateFunction, /'code', v_code/i);
});

test("dedicated disable RPC still records the disabled audit event", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605184500_add_operator_managed_approved_email_domains.sql", import.meta.url),
    "utf8",
  );
  const disableFunction = sql.slice(
    sql.indexOf("create or replace function public.disable_approved_email_domain"),
  );

  assert.match(disableFunction, /'approved_email_domain\.disabled'/i);
  assert.match(disableFunction, /'code', 'approved_email_domain_disabled'/i);
});

test("approved-domains route constant stays aligned with the admin navigation", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/approvedDomains.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /export const APPROVED_DOMAIN_ROUTE = ADMIN_ROUTES\.approvedDomains;/);
});
