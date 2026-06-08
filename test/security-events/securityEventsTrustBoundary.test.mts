import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

function readTrustBoundaryMigration() {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).find((name) =>
        name.endsWith("_harden_security_events_trust_boundary.sql"),
      )
    : null;

  assert.ok(migrationName, "expected security-events trust-boundary migration");

  return readFileSync(new URL(`../../supabase/migrations/${migrationName}`, import.meta.url), "utf8");
}

test("security-events trust-boundary migration removes direct authenticated inserts", () => {
  const sql = readTrustBoundaryMigration();

  assert.match(sql, /alter table public\.security_events\s+add column if not exists event_producer/i);
  assert.match(sql, /update public\.security_events\s+set event_producer = 'legacy_unverified'/i);
  assert.match(sql, /alter table public\.security_events\s+alter column event_producer set default 'trusted_server'/i);
  assert.match(
    sql,
    /drop policy if exists "authenticated users can insert bounded security events for themselves"/i,
  );
  assert.match(sql, /revoke insert on table public\.security_events from authenticated/i);
  assert.match(sql, /revoke insert on table public\.security_events from anon/i);
  assert.doesNotMatch(
    sql,
    /create policy[\s\S]*on public\.security_events[\s\S]*for insert[\s\S]*to authenticated/i,
  );
});

test("security-events trust-boundary migration prevents privileged client-forged audit rows from operator views", () => {
  const sql = readTrustBoundaryMigration();

  assert.match(sql, /add column if not exists event_producer text/i);
  assert.match(sql, /alter column event_producer set not null/i);
  assert.match(
    sql,
    /constraint security_events_event_producer_check check\s*\(\s*event_producer in \(\s*'trusted_server',\s*'legacy_unverified'\s*\)\s*\)/i,
  );
  assert.match(
    sql,
    /create index if not exists security_events_trusted_created_at_idx[\s\S]*where event_producer = 'trusted_server'/i,
  );
  assert.match(sql, /create or replace function public\.list_security_events_for_operator/i);
  assert.match(
    sql,
    /from public\.security_events[\s\S]*where event_producer = 'trusted_server'[\s\S]*and \(v_event_type is null or event_type = v_event_type\)/i,
  );
  assert.doesNotMatch(sql, /where\s+event_producer = 'legacy_unverified'/i);
});

test("security event server recorder uses trusted service-role insertion when configured", () => {
  const source = readFileSync(
    new URL("../../src/lib/securityEvents/server.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /async function insertTrustedSecurityEvent/);
  assert.match(source, /isStorageAdminConfigured\(\)/);
  assert.match(source, /createStorageAdminClient\(\)/);
  assert.match(source, /from\("security_events"\)\.insert\(payload\)/);
  assert.match(source, /insert: insertTrustedSecurityEvent/);
  assert.doesNotMatch(source, /function insertSecurityEvent/);
});
