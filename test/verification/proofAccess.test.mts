import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  MAX_PROOF_VIEW_SIGNED_URL_TTL_SECONDS,
  PROOF_VIEW_SIGNED_URL_TTL_SECONDS,
  resolveProofViewAccess,
} from "../../src/lib/verification/proofAccessCore.ts";

test("proof access TTL stays short-lived and bounded", () => {
  assert.equal(PROOF_VIEW_SIGNED_URL_TTL_SECONDS, 60);
  assert.equal(MAX_PROOF_VIEW_SIGNED_URL_TTL_SECONDS, 300);
  assert.ok(
    PROOF_VIEW_SIGNED_URL_TTL_SECONDS <= MAX_PROOF_VIEW_SIGNED_URL_TTL_SECONDS,
  );
});

test("proof access requires an authenticated reviewer", () => {
  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: null,
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "unauthenticated",
      message: "Sign in again before trying to view verification proof.",
    },
  );
});

test("proof access blocks reviewers without an active scope", () => {
  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: false,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "scope_missing",
      message: "You are not authorized to view this verification proof.",
    },
  );
});

test("proof access blocks self-review and mismatched request relationships", () => {
  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "user-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "self_review_blocked",
      message: "Reviewers cannot view proof for their own verification request.",
    },
  );

  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-other",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "request_evidence_mismatch",
      message:
        "The verification proof could not be matched to the selected request.",
    },
  );
});

test("proof access only allows reviewable proof evidence in the private proof bucket", () => {
  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "approved",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "request_not_reviewable",
      message: "This verification proof is no longer available for review.",
    },
  );

  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "work_email",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "unsupported_evidence_type",
      message: "Only redacted proof uploads can be viewed in this reviewer flow.",
    },
  );

  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "other-bucket",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "bucket_mismatch",
      message: "This verification proof is not stored in the private proof bucket.",
    },
  );
});

test("proof access fails closed when storage path or reviewer authorization is missing", () => {
  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: null,
      },
      canReviewRequest: true,
    }),
    {
      kind: "denied",
      reasonCode: "storage_path_missing",
      message: "This verification proof is not available for viewing right now.",
    },
  );

  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "submitted",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: false,
    }),
    {
      kind: "denied",
      reasonCode: "request_access_denied",
      message: "You are not authorized to view this verification proof.",
    },
  );
});

test("proof access returns a bounded signed-url plan when the reviewer is authorized", () => {
  assert.deepEqual(
    resolveProofViewAccess({
      reviewerId: "reviewer-1",
      reviewerAuthorized: true,
      request: {
        id: "req-1",
        user_id: "user-1",
        status: "pending_review",
      },
      evidence: {
        id: "evidence-1",
        request_id: "req-1",
        evidence_type: "redacted_badge_or_proof",
        storage_bucket: "verification-proofs",
        storage_path: "user-1/req-1/evidence-1.png",
      },
      canReviewRequest: true,
    }),
    {
      kind: "allowed",
      requestId: "req-1",
      evidenceId: "evidence-1",
      bucket: "verification-proofs",
      storagePath: "user-1/req-1/evidence-1.png",
      ttlSeconds: 60,
    },
  );
});

test("proof access implementation stays server-only and uses service-role signed URLs", () => {
  assert.equal(
    existsSync(new URL("../../src/lib/supabase/storageAdmin.ts", import.meta.url)),
    true,
  );

  const source = readFileSync(
    new URL("../../src/lib/verification/proofAccess.ts", import.meta.url),
    "utf8",
  );
  const storageAdminSource = readFileSync(
    new URL("../../src/lib/supabase/storageAdmin.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /import "server-only"/i);
  assert.match(storageAdminSource, /import "server-only"/i);
  assert.match(source, /createSignedUrl/i);
  assert.match(storageAdminSource, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(storageAdminSource, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /approve|verification_claim\.issued/i);
});
