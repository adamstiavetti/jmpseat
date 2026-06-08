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
  resolveProofReviewRoutingContext,
  validateRedactedProofUpload,
  PROOF_REVIEW_ROUTING_CONTEXT_SOURCES,
  VERIFICATION_PROOF_ALLOWED_MIME_TYPES,
  VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES,
  VERIFICATION_PROOFS_BUCKET,
} from "../../src/lib/verification/proofUpload.ts";

const REAL_PNG_BYTES = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

const REAL_JPEG_BYTES = Uint8Array.from([
  0xff, 0xd8,
  0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
  0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48,
  0x00, 0x00,
  0xff, 0xdb, 0x00, 0x43, 0x00,
  ...Array(64).fill(0x08),
  0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00,
  0x01, 0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x00,
  0x03, 0x11, 0x00,
  0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02,
  0x11, 0x03, 0x11, 0x00, 0x3f, 0x00, 0x00,
  0xff, 0xd9,
]);

function proofFile(input: {
  name: string;
  type: string;
  bytes: Uint8Array;
}) {
  return {
    name: input.name,
    size: input.bytes.byteLength,
    type: input.type,
    arrayBuffer: async () =>
      input.bytes.buffer.slice(
        input.bytes.byteOffset,
        input.bytes.byteOffset + input.bytes.byteLength,
      ),
  };
}

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
  assert.deepEqual(PROOF_REVIEW_ROUTING_CONTEXT_SOURCES, [
    "self_declared",
    "profile_claimed_airline",
  ]);
});

test("proof upload validation requires acknowledgement, JPEG/PNG, and a 5 MB cap", async () => {
  assert.deepEqual(
    await validateRedactedProofUpload({
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
    await validateRedactedProofUpload({
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
    await validateRedactedProofUpload({
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
    await validateRedactedProofUpload({
      file: proofFile({
        name: "proof.jpeg",
        type: "image/jpeg",
        bytes: REAL_JPEG_BYTES,
      }),
      redactionAcknowledged: true,
    }),
    {
      kind: "valid",
      fileSizeBytes: REAL_JPEG_BYTES.byteLength,
      mimeType: "image/jpeg",
      originalExtension: "jpeg",
      storageExtension: "jpg",
    },
  );
});

test("proof upload validation accepts real PNG and JPEG bytes only", async () => {
  assert.deepEqual(
    await validateRedactedProofUpload({
      file: proofFile({
        name: "redacted-proof.png",
        type: "image/png",
        bytes: REAL_PNG_BYTES,
      }),
      redactionAcknowledged: true,
    }),
    {
      kind: "valid",
      fileSizeBytes: REAL_PNG_BYTES.byteLength,
      mimeType: "image/png",
      originalExtension: "png",
      storageExtension: "png",
    },
  );

  assert.deepEqual(
    await validateRedactedProofUpload({
      file: proofFile({
        name: "redacted-proof.jpg",
        type: "image/jpeg",
        bytes: REAL_JPEG_BYTES,
      }),
      redactionAcknowledged: true,
    }),
    {
      kind: "valid",
      fileSizeBytes: REAL_JPEG_BYTES.byteLength,
      mimeType: "image/jpeg",
      originalExtension: "jpg",
      storageExtension: "jpg",
    },
  );
});

test("proof upload validation rejects browser-metadata forgeries and mismatches", async () => {
  const invalidImageMessage = "Upload a real PNG or JPEG image.";
  const htmlBytes = new TextEncoder().encode("<script>alert('not an image')</script>");
  const svgBytes = new TextEncoder().encode("<svg xmlns=\"http://www.w3.org/2000/svg\"><script /></svg>");
  const pdfBytes = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n");
  const zipBytes = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  const randomBytes = Uint8Array.from([0x01, 0x02, 0x03, 0x04, 0x05]);

  for (const file of [
    proofFile({ name: "fake.png", type: "image/png", bytes: htmlBytes }),
    proofFile({ name: "fake.jpg", type: "image/jpeg", bytes: htmlBytes }),
    proofFile({ name: "fake.png", type: "image/png", bytes: svgBytes }),
    proofFile({ name: "fake.png", type: "image/png", bytes: pdfBytes }),
    proofFile({ name: "fake.jpg", type: "image/jpeg", bytes: pdfBytes }),
    proofFile({ name: "fake.png", type: "image/png", bytes: zipBytes }),
    proofFile({ name: "fake.jpg", type: "image/jpeg", bytes: randomBytes }),
    proofFile({ name: "fake.jpg", type: "image/jpeg", bytes: REAL_PNG_BYTES }),
    proofFile({ name: "fake.png", type: "image/png", bytes: REAL_JPEG_BYTES }),
    proofFile({ name: "truncated.png", type: "image/png", bytes: REAL_PNG_BYTES.slice(0, 20) }),
    proofFile({ name: "truncated.jpg", type: "image/jpeg", bytes: REAL_JPEG_BYTES.slice(0, 20) }),
  ]) {
    assert.deepEqual(
      await validateRedactedProofUpload({
        file,
        redactionAcknowledged: true,
      }),
      {
        kind: "invalid",
        message: invalidImageMessage,
      },
    );
  }
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
    requestedAirline: "American Airlines",
    routingContextSource: "profile_claimed_airline",
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
      requested_airline: "American Airlines",
      routing_context_source: "profile_claimed_airline",
    },
  });
  assert.equal("claim" in draft, false);
});

test("proof review routing context requires an airline label and marks it as unverified routing-only context", () => {
  assert.deepEqual(
    resolveProofReviewRoutingContext({
      requestedAirline: "",
      profileClaimedAirline: "American Airlines",
    }),
    {
      kind: "invalid",
      message:
        "Provide the airline name reviewers should use for routing. This is self-declared review context only and not a verified claim.",
    },
  );

  assert.deepEqual(
    resolveProofReviewRoutingContext({
      requestedAirline: "American Airlines",
      profileClaimedAirline: "American Airlines",
    }),
    {
      kind: "valid",
      requestedAirline: "American Airlines",
      routingContextSource: "profile_claimed_airline",
    },
  );

  assert.deepEqual(
    resolveProofReviewRoutingContext({
      requestedAirline: "Delta Air Lines",
      profileClaimedAirline: "American Airlines",
    }),
    {
      kind: "valid",
      requestedAirline: "Delta Air Lines",
      routingContextSource: "self_declared",
    },
  );
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

test("proof routing-context persistence migration updates the RPC to store routing metadata safely", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260604220401_persist_proof_routing_context_metadata.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /create or replace function public\.create_redacted_proof_verification_submission/i);
  assert.match(sql, /p_requested_airline text/i);
  assert.match(sql, /p_routing_context_source text/i);
  assert.match(sql, /v_requested_airline text := nullif\(regexp_replace/i);
  assert.match(sql, /v_routing_context_source text := lower\(trim/i);
  assert.match(sql, /v_routing_context_source not in \('profile_claimed_airline', 'self_declared'\)/i);
  assert.match(sql, /'requested_airline', v_requested_airline/i);
  assert.match(sql, /'routing_context_source', v_routing_context_source/i);
  assert.match(sql, /array\['airline_worker'\]::text\[\]/i);
  assert.match(sql, /'redacted_badge_or_proof'/i);
  assert.match(sql, /auth\.uid\(\)/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public/i);
  assert.match(sql, /grant execute on function public\.create_redacted_proof_verification_submission/i);
  assert.doesNotMatch(sql, /storage_path'.*metadata|filename|ocr_text|proof_text|employee_id|badge_number|barcode|qr_content|raw_work_email|email_local_part/i);
});

test("proof upload action uses bounded server validation, private storage, rollback cleanup, and no service-role client", () => {
  const source = readFileSync(
    new URL("../../src/lib/verification/actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /submitRedactedProofVerificationAction/);
  assert.match(source, /await validateRedactedProofUpload/);
  assert.match(source, /VERIFICATION_PROOFS_BUCKET/);
  assert.match(source, /storage[\s\S]*?from\(VERIFICATION_PROOFS_BUCKET\)[\s\S]*?\.upload/);
  assert.match(source, /contentType: validation\.mimeType/);
  assert.match(source, /create_redacted_proof_verification_submission/);
  assert.match(source, /cleanupUploadedVerificationProof/);
  assert.match(source, /requested_airline/);
  assert.match(source, /resolveProofReviewRoutingContext/);
  assert.match(source, /p_requested_airline: draft\.evidence\.metadata\.requested_airline/);
  assert.match(source, /p_routing_context_source: draft\.evidence\.metadata\.routing_context_source/);
  assert.match(source, /verification_evidence\.uploaded/);
  assert.doesNotMatch(source, /service_role|SUPABASE_SERVICE_ROLE_KEY|signed url|download button|openai|ai pre-check/i);
  assert.doesNotMatch(source, /contentType:\s*proofFile\.type/);
  assert.doesNotMatch(source, /aa\.com|american airlines/i);
});

test("proof upload metadata builder never stores filenames, storage paths, or proof contents in metadata", () => {
  assert.deepEqual(
    buildRedactedProofEvidenceMetadata({
      fileSizeBytes: 1024,
      mimeType: "image/png",
      originalExtension: "png",
      requestedAirline: "American Airlines",
      routingContextSource: "self_declared",
    }),
    {
      file_size_bytes: 1024,
      mime_type: "image/png",
      original_extension: "png",
      upload_client: "web",
      redaction_acknowledged: true,
      evidence_method: "redacted_badge_or_proof",
      requested_airline: "American Airlines",
      routing_context_source: "self_declared",
    },
  );
});
