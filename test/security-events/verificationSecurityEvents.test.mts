import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getVerificationRequestEventType,
  getVerificationReviewEventType,
  sanitizeSecurityEventMetadata,
} from "../../src/lib/securityEvents/securityEvents.ts";

test("verification security event sanitizer strips unsafe verification metadata keys", () => {
  assert.deepEqual(
    sanitizeSecurityEventMetadata({
      verification_request_id: "req-1",
      verification_claim_id: "claim-1",
      claim_type: "airline",
      claim_value: "Test Air",
      email_domain: "airline.test",
      support_result: "supported_domain",
      work_email: "crew.member@airline.test",
      local_part: "crew.member",
      employee_id: "12345",
      badge_number: "98765",
      barcode: "barcode",
      qr_content: "qr-content",
      ocr_text: "full extracted text",
      proof_text: "badge text",
      storage_path: "user/request/evidence.png",
      filename: "badge.png",
      passenger_data: "passenger",
      trip_data: "trip",
      crew_hotel_information: "hotel",
      secret_key: "secret",
    }),
    {
      verification_request_id: "req-1",
      verification_claim_id: "claim-1",
      claim_type: "airline",
      claim_value: "Test Air",
      email_domain: "airline.test",
      support_result: "supported_domain",
    },
  );
});

test("verification request event mapping stays bounded to supported request outcomes", () => {
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "invalid_email" }),
    "verification_request.invalid_work_email",
  );
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "unsupported_domain" }),
    "verification_request.unsupported_domain",
  );
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "duplicate_request" }),
    "verification_request.duplicate_active",
  );
  assert.equal(
    getVerificationRequestEventType({ submissionKind: "create_request" }),
    "verification_request.submitted",
  );
});

test("verification review event mapping stays bounded to supported review outcomes", () => {
  assert.equal(
    getVerificationReviewEventType({ outcome: "unauthorized" }),
    "verification_review.unauthorized_attempt",
  );
  assert.equal(
    getVerificationReviewEventType({ outcome: "self_review_blocked" }),
    "verification_review.self_review_blocked",
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
});

test("verification request and review actions record bounded security events without upload or employer-system behavior", () => {
  const requestActionSource = readFileSync(
    new URL("../../src/lib/verification/actions.ts", import.meta.url),
    "utf8",
  );
  const reviewActionSource = readFileSync(
    new URL("../../src/lib/verification/reviewActions.ts", import.meta.url),
    "utf8",
  );

  assert.match(requestActionSource, /getVerificationRequestEventType/);
  assert.match(requestActionSource, /submissionKind: submission\.kind/);
  assert.match(requestActionSource, /verification_evidence\.created/);
  assert.match(requestActionSource, /verification_evidence\.uploaded/);

  assert.match(reviewActionSource, /getVerificationReviewEventType/);
  assert.match(reviewActionSource, /outcome: plan\.kind/);
  assert.match(reviewActionSource, /action: action as "approve" \| "reject" \| "request_resubmission"/);
  assert.match(reviewActionSource, /verification_claim\.issued/);

  assert.doesNotMatch(
    requestActionSource,
    /type="file"|supabase storage|employer system lookup|ai pre-check/i,
  );
  assert.doesNotMatch(
    reviewActionSource,
    /type="file"|supabase storage|employer system lookup|ai pre-check/i,
  );
});

test("verification security-events migration extends the event-type constraint for bounded verification lifecycle events", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260604173625_extend_security_events_for_verification.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /drop constraint if exists security_events_event_type_check/i);
  assert.match(sql, /verification_request\.submitted/i);
  assert.match(sql, /verification_request\.unsupported_domain/i);
  assert.match(sql, /verification_request\.invalid_work_email/i);
  assert.match(sql, /verification_request\.duplicate_active/i);
  assert.match(sql, /verification_evidence\.created/i);
  assert.match(sql, /verification_review\.approved/i);
  assert.match(sql, /verification_review\.rejected/i);
  assert.match(sql, /verification_review\.needs_resubmission/i);
  assert.match(sql, /verification_review\.unauthorized_attempt/i);
  assert.match(sql, /verification_review\.self_review_blocked/i);
  assert.match(sql, /verification_claim\.issued/i);
});

test("proof-upload migration extends the event-type constraint for bounded upload events", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260604210259_create_verification_proofs_bucket.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /drop constraint if exists security_events_event_type_check/i);
  assert.match(sql, /verification_evidence\.uploaded/i);
});

test("proof-view migration extends the event-type constraint for bounded proof-view audit events", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260604231332_extend_security_events_for_proof_viewing.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /drop constraint if exists security_events_event_type_check/i);
  assert.match(sql, /verification_evidence\.view_requested/i);
  assert.match(sql, /verification_evidence\.view_granted/i);
  assert.match(sql, /verification_evidence\.view_denied/i);
});

test("proof-deletion migration extends the event-type constraint for bounded deletion audit events", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605003656_extend_security_events_for_proof_deletion.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /drop constraint if exists security_events_event_type_check/i);
  assert.match(sql, /verification_evidence\.deletion_scheduled/i);
  assert.match(sql, /verification_evidence\.deleted/i);
  assert.match(sql, /verification_evidence\.deletion_failed/i);
});

test("operator grants migration extends the event-type constraint for bounded operator audit events", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605113000_create_operator_grants_foundation.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /drop constraint if exists security_events_event_type_check/i);
  assert.match(sql, /operator_access\.granted/i);
  assert.match(sql, /operator_access\.revoked/i);
  assert.match(sql, /operator_access\.unauthorized_attempt/i);
});

test("proof retention implementation records deletion audit events without logging paths or proof data", () => {
  const source = readFileSync(
    new URL("../../src/lib/verification/proofRetentionCore.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /verification_evidence\.deletion_scheduled/);
  assert.match(source, /verification_evidence\.deleted/);
  assert.match(source, /verification_evidence\.deletion_failed/);
  assert.doesNotMatch(source, /signed_url|public_url|filename|employee_id|badge_number|barcode|qr_content|ocr_text|proof_text|employer system lookup|ai pre-check/i);
});

test("proof access implementation records bounded proof-view audit events without logging URLs or storage paths", () => {
  const source = readFileSync(
    new URL("../../src/lib/verification/proofAccess.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /verification_evidence\.view_requested/);
  assert.match(source, /verification_evidence\.view_granted/);
  assert.match(source, /verification_evidence\.view_denied/);
  assert.doesNotMatch(source, /employer system lookup|ai pre-check/i);
});
