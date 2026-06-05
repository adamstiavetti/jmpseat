import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
  OPS_PROOF_RETENTION_CLEANUP_MAX_LIMIT,
  OPS_PROOF_RETENTION_CLEANUP_SECRET_ENV_KEY,
  OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER,
  getOpsProofRetentionCleanupSecret,
  handleOpsProofRetentionCleanupRequest,
  isAuthorizedOpsProofRetentionCleanupRequest,
  normalizeOpsProofRetentionCleanupLimit,
} from "../../src/lib/ops/proofRetentionCleanupRoute.ts";

test("proof retention cleanup route constants stay bounded and server-only", () => {
  assert.equal(OPS_PROOF_RETENTION_CLEANUP_SECRET_ENV_KEY, "OPS_CLEANUP_SECRET");
  assert.equal(OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER, "x-jmpseat-ops-secret");
  assert.equal(OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT, 10);
  assert.equal(OPS_PROOF_RETENTION_CLEANUP_MAX_LIMIT, 50);
});

test("proof retention cleanup route reads the operator secret from server-only env", () => {
  assert.equal(getOpsProofRetentionCleanupSecret({}), "");
  assert.equal(
    getOpsProofRetentionCleanupSecret({ OPS_CLEANUP_SECRET: "  secret-value  " }),
    "secret-value",
  );
});

test("proof retention cleanup route authorization fails closed without the configured secret", () => {
  const request = new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
    method: "POST",
  });

  assert.equal(
    isAuthorizedOpsProofRetentionCleanupRequest({
      request,
      source: {},
    }),
    false,
  );
});

test("proof retention cleanup route authorizes only matching secret headers", () => {
  const source = {
    OPS_CLEANUP_SECRET: "expected-secret",
  };
  const goodRequest = new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
    method: "POST",
    headers: {
      [OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER]: "expected-secret",
    },
  });
  const badRequest = new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
    method: "POST",
    headers: {
      [OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER]: "wrong-secret",
    },
  });

  assert.equal(
    isAuthorizedOpsProofRetentionCleanupRequest({
      request: goodRequest,
      source,
    }),
    true,
  );
  assert.equal(
    isAuthorizedOpsProofRetentionCleanupRequest({
      request: badRequest,
      source,
    }),
    false,
  );
});

test("proof retention cleanup route batch limit defaults and caps safely", () => {
  assert.equal(
    normalizeOpsProofRetentionCleanupLimit(null),
    OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
  );
  assert.equal(
    normalizeOpsProofRetentionCleanupLimit(""),
    OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
  );
  assert.equal(
    normalizeOpsProofRetentionCleanupLimit("abc"),
    OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
  );
  assert.equal(normalizeOpsProofRetentionCleanupLimit("3"), 3);
  assert.equal(
    normalizeOpsProofRetentionCleanupLimit("999"),
    OPS_PROOF_RETENTION_CLEANUP_MAX_LIMIT,
  );
});

test("proof retention cleanup route denies non-POST methods", async () => {
  const response = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
      method: "GET",
    }),
    {
      source: {
        OPS_CLEANUP_SECRET: "expected-secret",
      },
    },
  );

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Method not allowed.",
  });
});

test("proof retention cleanup route fails closed when the secret env is missing", async () => {
  let cleanupCalled = false;

  const response = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
      method: "POST",
    }),
    {
      source: {},
      runCleanup: async () => {
        cleanupCalled = true;
        return {
          scannedCount: 0,
          deletedCount: 0,
          missingCount: 0,
          failedCount: 0,
          skippedCount: 0,
        };
      },
    },
  );

  assert.equal(response.status, 503);
  assert.equal(cleanupCalled, false);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Cleanup trigger is not configured.",
  });
});

test("proof retention cleanup route denies requests with missing or wrong headers", async () => {
  const source = {
    OPS_CLEANUP_SECRET: "expected-secret",
  };
  const missingHeaderResponse = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
      method: "POST",
    }),
    {
      source,
    },
  );
  const wrongHeaderResponse = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
      method: "POST",
      headers: {
        [OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER]: "wrong-secret",
      },
    }),
    {
      source,
    },
  );

  assert.equal(missingHeaderResponse.status, 401);
  assert.equal(wrongHeaderResponse.status, 401);
  assert.deepEqual(await missingHeaderResponse.json(), {
    ok: false,
    error: "Unauthorized.",
  });
  assert.deepEqual(await wrongHeaderResponse.json(), {
    ok: false,
    error: "Unauthorized.",
  });
});

test("proof retention cleanup route returns a safe 503 when storage admin is unavailable", async () => {
  let cleanupCalled = false;

  const response = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
      method: "POST",
      headers: {
        [OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER]: "expected-secret",
      },
    }),
    {
      source: {
        OPS_CLEANUP_SECRET: "expected-secret",
      },
      isStorageAdminReady: () => false,
      runCleanup: async () => {
        cleanupCalled = true;
        return {
          scannedCount: 0,
          deletedCount: 0,
          missingCount: 0,
          failedCount: 0,
          skippedCount: 0,
        };
      },
    },
  );

  assert.equal(response.status, 503);
  assert.equal(cleanupCalled, false);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Cleanup trigger is unavailable.",
  });
});

test("proof retention cleanup route invokes cleanup with the default safe limit", async () => {
  const seenLimits: number[] = [];

  const response = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
      method: "POST",
      headers: {
        [OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER]: "expected-secret",
      },
    }),
    {
      source: {
        OPS_CLEANUP_SECRET: "expected-secret",
      },
      isStorageAdminReady: () => true,
      runCleanup: async ({ limit }) => {
        seenLimits.push(limit ?? -1);
        return {
          scannedCount: 3,
          deletedCount: 2,
          missingCount: 0,
          failedCount: 0,
          skippedCount: 1,
        };
      },
    },
  );

  assert.deepEqual(seenLimits, [OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT]);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    limit: OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
    scannedCount: 3,
    deletedCount: 2,
    missingCount: 0,
    failedCount: 0,
    skippedCount: 1,
  });
});

test("proof retention cleanup route enforces the max batch limit and keeps the response sanitized", async () => {
  const response = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup?limit=999", {
      method: "POST",
      headers: {
        [OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER]: "expected-secret",
      },
    }),
    {
      source: {
        OPS_CLEANUP_SECRET: "expected-secret",
      },
      isStorageAdminReady: () => true,
      runCleanup: async ({ limit }) => {
        assert.equal(limit, OPS_PROOF_RETENTION_CLEANUP_MAX_LIMIT);
        return {
          scannedCount: 5,
          deletedCount: 3,
          missingCount: 1,
          failedCount: 1,
          skippedCount: 0,
        };
      },
    },
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.deepEqual(payload, {
    ok: false,
    limit: OPS_PROOF_RETENTION_CLEANUP_MAX_LIMIT,
    scannedCount: 5,
    deletedCount: 3,
    missingCount: 1,
    failedCount: 1,
    skippedCount: 0,
  });
  assert.doesNotMatch(
    JSON.stringify(payload),
    /storage_path|signed_url|public_url|filename|proof_text|ocr_text|employee_id|badge_number|barcode|qr|OPS_CLEANUP_SECRET|expected-secret/i,
  );
});

test("proof retention cleanup route returns a safe 500 when the cleanup run cannot start", async () => {
  const response = await handleOpsProofRetentionCleanupRequest(
    new Request("http://localhost:3000/api/ops/proof-retention-cleanup", {
      method: "POST",
      headers: {
        [OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER]: "expected-secret",
      },
    }),
    {
      source: {
        OPS_CLEANUP_SECRET: "expected-secret",
      },
      isStorageAdminReady: () => true,
      runCleanup: async () => {
        throw new Error("service role missing");
      },
    },
  );

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Cleanup run could not start.",
  });
});

test("proof retention cleanup route source stays bounded to a protected ops route only", () => {
  const routeSource = readFileSync(
    new URL("../../app/api/ops/proof-retention-cleanup/route.ts", import.meta.url),
    "utf8",
  );
  const helperSource = readFileSync(
    new URL("../../src/lib/ops/proofRetentionCleanupRoute.ts", import.meta.url),
    "utf8",
  );

  assert.match(routeSource, /export async function GET/);
  assert.match(routeSource, /export async function POST/);
  assert.match(helperSource, /OPS_CLEANUP_SECRET/);
  assert.match(helperSource, /x-jmpseat-ops-secret/);
  assert.match(helperSource, /cleanupExpiredVerificationProofs/);
  assert.doesNotMatch(
    `${routeSource}\n${helperSource}`,
    /type="file"|View proof|download button|signed url|public url|employer system lookup|openai|ai\/ocr|automatic approval/i,
  );
});
