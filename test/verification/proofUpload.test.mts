import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ACTIVE_PROOF_REQUEST_STATUSES,
  buildRedactedProofEvidenceMetadata,
  buildRedactedProofVerificationDraft,
  buildVerificationProofStoragePath,
  getActiveRedactedProofRequest,
  isSafeVerificationProofStoragePath,
  validateRedactedProofUpload,
  VERIFICATION_PROOF_ALLOWED_MIME_TYPES,
  VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES,
  VERIFICATION_PROOFS_BUCKET,
} from "../../src/lib/verification/proofUpload.ts";

test("proof upload constants stay bounded to a private JPEG/PNG-only first slice", () => {
  assert.equal(VERIFICATION_PROOFS_BUCKET, "verification-proofs");
  assert.deepEqual(VERIFICATION_PROOF_ALLOWED_MIME_TYPES, [
    "image/jpeg",
    "image/png",
  ]);
  assert.equal(VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES, 5 * 1024 * 1024);
  assert.deepEqual(ACTIVE_PROOF_REQUEST_STATUSES, [
    "submitted",
    "pending_review",
    "needs_resubmission",
  ]);
});

test("proof upload validation requires acknowledgement, JPEG/PNG, and a 5 MB cap", () => {
  assert.deepEqual(
    validateRedactedProofUpload({
      file: { name: "proof.png", size: 10, type: "image/png" },
      redactionAcknowledged: false,
    }),
    {
      kind: "invalid",
      message:
        "Confirm that you redacted employee IDs, badge numbers, barcodes, QR codes, badge backsides, and security-sensitive details before uploading.",
    },
  );

  assert.deepEqual(
    validateRedactedProofUpload({
      file: { name: "proof.pdf", size: 10, type: "application/pdf" },
      redactionAcknowledged: true,
    }),
    {
      kind: "invalid",
      message:
        "Only JPEG or PNG proof uploads are supported right now. PDF, video, and HEIC remain out of scope for this first upload slice.",
    },
  );

  assert.deepEqual(
    validateRedactedProofUpload({
      file: {
        name: "proof.png",
        size: VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES + 1,
        type: "image/png",
      },
      redactionAcknowledged: true,
    }),
    {
      kind: "invalid",
      message: "Proof uploads must stay at or below 5 MB.",
    },
  );

  assert.deepEqual(
    validateRedactedProofUpload({
      file: { name: "proof.jpeg", size: 512, type: "image/jpeg" },
      redactionAcknowledged: true,
    }),
    {
      kind: "valid",
      fileSizeBytes: 512,
      mimeType: "image/jpeg",
      originalExtension: "jpeg",
      storageExtension: "jpg",
    },
  );
});

test("proof storage paths use UUID-only segments and never user filenames or airline labels", () => {
  const path = buildVerificationProofStoragePath({
    userId: "11111111-1111-1111-1111-111111111111",
    requestId: "22222222-2222-2222-2222-222222222222",
    evidenceId: "33333333-3333-3333-3333-333333333333",
    extension: "png",
  });

  assert.equal(
    path,
    "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.png",
  );
  assert.equal(isSafeVerificationProofStoragePath(path), true);
  assert.equal(isSafeVerificationProofStoragePath("user@example.com/request/file.png"), false);
  assert.doesNotMatch(path, /american airlines|aa\.com|badge|employee|proof\.png/i);
});

test("proof draft stores safe metadata only and does not issue claims automatically", () => {
  const draft = buildRedactedProofVerificationDraft({
    userId: "11111111-1111-1111-1111-111111111111",
    requestId: "22222222-2222-2222-2222-222222222222",
    evidenceId: "33333333-3333-3333-3333-333333333333",
    storagePath:
      "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.png",
    fileSizeBytes: 4096,
    mimeType: "image/png",
    originalExtension: "png",
    nowIso: "2026-06-04T21:15:00.000Z",
  });

  assert.deepEqual(draft.request, {
    id: "22222222-2222-2222-2222-222222222222",
    user_id: "11111111-1111-1111-1111-111111111111",
    status: "submitted",
    requested_claim_types: ["airline_worker"],
    method: "redacted_badge_or_proof",
    submitted_at: "2026-06-04T21:15:00.000Z",
  });

  assert.deepEqual(draft.evidence, {
    id: "33333333-3333-3333-3333-333333333333",
    request_id: "22222222-2222-2222-2222-222222222222",
    user_id: "11111111-1111-1111-1111-111111111111",
    evidence_type: "redacted_badge_or_proof",
    storage_bucket: "verification-proofs",
    storage_path:
      "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.png",
    redaction_acknowledged: true,
    status: "submitted",
    uploaded_at: "2026-06-04T21:15:00.000Z",
    delete_after: "2026-07-04T21:15:00.000Z",
    metadata: {
      file_size_bytes: 4096,
      mime_type: "image/png",
      original_extension: "png",
      upload_client: "web",
      redaction_acknowledged: true,
      evidence_method: "redacted_badge_or_proof",
    },
  });
  assert.equal("claim" in draft, false);
});

test("proof upload helper can detect an active proof request for duplicate prevention", () => {
  assert.deepEqual(
    getActiveRedactedProofRequest([
      { id: "req-1", method: "work_email", status: "submitted" },
      { id: "req-2", method: "redacted_badge_or_proof", status: "pending_review" },
    ]),
    {
      id: "req-2",
      method: "redacted_badge_or_proof",
      status: "pending_review",
    },
  );
});

test("proof upload migration creates a private bucket, bounded storage policies, and transactional metadata RPC", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260604210259_create_verification_proofs_bucket.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /insert into storage\.buckets/i);
  assert.match(sql, /'verification-proofs'/i);
  assert.match(sql, /values\s*\(\s*'verification-proofs',\s*'verification-proofs',\s*false,/i);
  assert.match(sql, /5242880/i);
  assert.match(sql, /image\/jpeg/i);
  assert.match(sql, /image\/png/i);
  assert.match(sql, /for insert/i);
  assert.match(sql, /for delete/i);
  assert.match(sql, /to authenticated/i);
  assert.match(sql, /not exists\s*\(\s*select 1\s*from public\.verification_evidence/i);
  assert.match(sql, /verification_evidence\.storage_path = name/i);
  assert.match(sql, /create or replace function public\.create_redacted_proof_verification_submission/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public/i);
  assert.match(sql, /auth\.uid\(\)/i);
  assert.match(sql, /array\['airline_worker'\]::text\[\]/i);
  assert.match(sql, /'verification_evidence\.uploaded'/i);
  assert.doesNotMatch(sql, /for select|public url|signed url|download button|openai|ai pre-check|employer system lookup/i);
});

test("proof upload action uses bounded server validation, private storage, rollback cleanup, and no service-role client", () => {
  const source = readFileSync(
    new URL("../../src/lib/verification/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /submitRedactedProofVerificationAction/);
  assert.match(source, /validateRedactedProofUpload/);
  assert.match(source, /VERIFICATION_PROOFS_BUCKET/);
  assert.match(source, /storage[\s\S]*?from\(VERIFICATION_PROOFS_BUCKET\)[\s\S]*?\.upload/);
  assert.match(source, /create_redacted_proof_verification_submission/);
  assert.match(source, /cleanupUploadedVerificationProof/);
  assert.match(source, /verification_evidence\.uploaded/);
  assert.doesNotMatch(source, /service_role|SUPABASE_SERVICE_ROLE_KEY|signed url|download button|openai|ai pre-check/i);
  assert.doesNotMatch(source, /aa\.com|american airlines/i);
});

test("proof upload metadata builder never stores filenames, storage paths, or proof contents in metadata", () => {
  assert.deepEqual(
    buildRedactedProofEvidenceMetadata({
      fileSizeBytes: 1024,
      mimeType: "image/png",
      originalExtension: "png",
    }),
    {
      file_size_bytes: 1024,
      mime_type: "image/png",
      original_extension: "png",
      upload_client: "web",
      redaction_acknowledged: true,
      evidence_method: "redacted_badge_or_proof",
    },
  );
});
