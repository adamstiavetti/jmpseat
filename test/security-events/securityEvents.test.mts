import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  SECURITY_EVENT_TYPES,
  getPrivateAccessEventType,
  getVerificationRequestEventType,
  getVerificationReviewEventType,
  recordSecurityEventWithInsert,
  sanitizeSecurityEventMetadata,
} from "../../src/lib/securityEvents/securityEvents.ts";

test("security event taxonomy stays aligned with the bounded verification audit surface", () => {
  assert.deepEqual(SECURITY_EVENT_TYPES, [
    "auth.sign_in_attempt",
    "auth.sign_in_success",
    "auth.sign_in_failed",
    "auth.sign_up_attempt",
    "auth.sign_up_success",
    "auth.sign_up_failed",
    "auth.password_reset_requested",
    "auth.password_reset_request_failed",
    "auth.callback_resolved",
    "private_access.redirect_login",
    "private_access.redirect_profile",
    "private_access.redirect_access_hold",
    "private_access.allowed",
    "private_access.storage_not_ready",
    "profile.upsert_attempt",
    "profile.upsert_success",
    "profile.upsert_failed",
    "beta_access.checked",
    "verification_request.submitted",
    "verification_request.unsupported_domain",
    "verification_request.invalid_work_email",
    "verification_request.duplicate_active",
    "verification_evidence.created",
    "verification_review.approved",
    "verification_review.rejected",
    "verification_review.needs_resubmission",
    "verification_review.unauthorized_attempt",
    "verification_review.self_review_blocked",
    "verification_claim.issued",
  ]);
});

test("security event metadata strips sensitive or noisy values", () => {
  assert.deepEqual(
    sanitizeSecurityEventMetadata({
      email: "crew.member@example.com",
      email_domain: "example.com",
      password: "secret",
      invited_email: "invite@example.com",
      badge_id: "12345",
      employee_id: "67890",
      proof_type: "badge",
      work_email: "crew.member@airline.test",
      raw_work_email: "crew.member@airline.test",
      email_local_part: "crew.member",
      badge_number: "999",
      barcode_content: "abc123",
      qr_code: "qrcode",
      ocr_text: "full extracted proof text",
      raw_proof_text: "raw badge text",
      storage_path: "user/request/evidence.png",
      passenger_data: "passenger",
      trip_data: "trip screenshot",
      crew_hotel_information: "hotel",
      secret_key: "secret",
      access_token: "token",
      route: "/app",
      result: "redirect_login",
      next_path: "/app/home",
      nullish: null,
    }),
    {
      email_domain: "example.com",
      route: "/app",
      result: "redirect_login",
      next_path: "/app/home",
    },
  );
});

test("verification request and review events map to bounded event types", () => {
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "create_request" }),
    "verification_request.submitted",
  );
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "unsupported_domain" }),
    "verification_request.unsupported_domain",
  );
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "invalid_email" }),
    "verification_request.invalid_work_email",
  );
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "duplicate_request" }),
    "verification_request.duplicate_active",
  );

  assert.equal(
    getVerificationReviewEventType({ action: "approve" }),
    "verification_review.approved",
  );
  assert.equal(
    getVerificationReviewEventType({ action: "reject" }),
    "verification_review.rejected",
  );
  assert.equal(
    getVerificationReviewEventType({ action: "request_resubmission" }),
    "verification_review.needs_resubmission",
  );
  assert.equal(
    getVerificationReviewEventType({ outcome: "unauthorized" }),
    "verification_review.unauthorized_attempt",
  );
  assert.equal(
    getVerificationReviewEventType({ outcome: "self_review_blocked" }),
    "verification_review.self_review_blocked",
  );
});

test("private gate results map to bounded security event types", () => {
  assert.equal(
    getPrivateAccessEventType({ kind: "redirect", path: "/login?next=%2Fapp" }),
    "private_access.redirect_login",
  );
  assert.equal(
    getPrivateAccessEventType({ kind: "redirect", path: "/app/profile" }),
    "private_access.redirect_profile",
  );
  assert.equal(
    getPrivateAccessEventType({ kind: "redirect", path: "/app/access-hold?error=missing" }),
    "private_access.storage_not_ready",
  );
  assert.equal(
    getPrivateAccessEventType({ kind: "allow" }),
    "private_access.allowed",
  );
});

test("security event recorder fails soft when Supabase auth is not configured", async () => {
  const calls: Array<unknown> = [];

  const result = await recordSecurityEventWithInsert(
    {
      eventType: "auth.sign_in_attempt",
      route: "/login",
      result: "attempt",
      metadata: {
        email_domain: "example.com",
      },
    },
    {
      enabled: false,
      insert: async (payload) => {
        calls.push(payload);
        return { error: null };
      },
    },
  );

  assert.deepEqual(result, { recorded: false, skipped: true });
  assert.equal(calls.length, 0);
});

test("security event recorder sanitizes metadata and swallows insert failures", async () => {
  const payloads: Array<Record<string, unknown>> = [];

  const result = await recordSecurityEventWithInsert(
    {
      userId: "user-1",
      eventType: "profile.upsert_failed",
      route: "/app/profile",
      result: "failed",
      metadata: {
        email: "crew.member@example.com",
        email_domain: "example.com",
        profile_field: "handle",
      },
    },
    {
      enabled: true,
      insert: async (payload) => {
        payloads.push(payload as Record<string, unknown>);
        return { error: new Error("relation security_events does not exist") };
      },
    },
  );

  assert.deepEqual(result, { recorded: false, skipped: false });
  assert.equal(payloads.length, 1);
  assert.deepEqual(payloads[0], {
    user_id: "user-1",
    event_type: "profile.upsert_failed",
    route: "/app/profile",
    result: "failed",
    metadata: {
      email_domain: "example.com",
      profile_field: "handle",
    },
  });
});

test("security events migration exists with audit-oriented indexes and private RLS", () => {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) => name.endsWith("_create_security_events.sql"))
    : [];

  assert.ok(migrationNames.length > 0, "expected a create_security_events migration");

  const migrationPath = path.join(migrationsDir.pathname, migrationNames[0] ?? "");
  const sql = readFileSync(migrationPath, "utf8");

  assert.match(sql, /create table public\.security_events/i);
  assert.match(sql, /event_type text not null/i);
  assert.match(sql, /metadata jsonb not null default '\{\}'::jsonb/i);
  assert.match(sql, /create index .*security_events_user_id/i);
  assert.match(sql, /create index .*security_events_event_type/i);
  assert.match(sql, /create index .*security_events_created_at/i);
  assert.match(sql, /alter table public\.security_events enable row level security/i);
  assert.doesNotMatch(sql, /users can read their own security events|public read|for select using \(true\)/i);
});

test("security event implementation stays server-only", () => {
  assert.equal(
    existsSync(new URL("../../src/lib/securityEvents/client.ts", import.meta.url)),
    false,
  );

  const serverSource = readFileSync(
    new URL("../../src/lib/securityEvents/server.ts", import.meta.url),
    "utf8",
  );

  assert.match(serverSource, /"server-only"|import "server-only"/i);
});
