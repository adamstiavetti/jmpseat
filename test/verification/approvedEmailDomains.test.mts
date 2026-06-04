import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("approved email domain read-policy migration exists and grants select-only access to active domains", () => {
  const migrationPath = new URL(
    "../../supabase/migrations/20260604191118_allow_active_approved_email_domain_reads.sql",
    import.meta.url,
  );
  const sql = readFileSync(migrationPath, "utf8");

  assert.match(
    sql,
    /drop policy if exists "Authenticated users can read active approved email domains"\s+on public\.approved_email_domains;/i,
  );
  assert.match(
    sql,
    /create policy "Authenticated users can read active approved email domains"\s+on public\.approved_email_domains\s+for select\s+to authenticated\s+using\s*\(\s*status = 'active'\s*\);/i,
  );
  assert.doesNotMatch(
    sql,
    /for\s+(insert|update|delete)\s+to authenticated/i,
  );
  assert.doesNotMatch(sql, /\baa\.com\b/i);
  assert.doesNotMatch(sql, /service_role|service-role/i);
});

test("approved email domain read-policy fix is runtime-only and does not seed domains in app code", () => {
  const migrationSource = readFileSync(
    new URL(
      "../../supabase/migrations/20260604191118_allow_active_approved_email_domain_reads.sql",
      import.meta.url,
    ),
    "utf8",
  );
  const actionsSource = readFileSync(
    new URL("../../src/lib/verification/actions.ts", import.meta.url),
    "utf8",
  );
  const serverSource = readFileSync(
    new URL("../../src/lib/verification/server.ts", import.meta.url),
    "utf8",
  );
  const workEmailSource = readFileSync(
    new URL("../../src/lib/verification/workEmail.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(migrationSource, /insert into public\.approved_email_domains/i);
  assert.doesNotMatch(actionsSource, /\baa\.com\b/i);
  assert.doesNotMatch(serverSource, /\baa\.com\b/i);
  assert.doesNotMatch(workEmailSource, /\baa\.com\b/i);
  assert.doesNotMatch(actionsSource, /service_role|service-role/i);
  assert.doesNotMatch(serverSource, /service_role|service-role/i);
  assert.doesNotMatch(workEmailSource, /service_role|service-role/i);
});
