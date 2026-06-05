import type { ProofRetentionCleanupSummary } from "../verification/proofRetentionCore.ts";

export const OPS_PROOF_RETENTION_CLEANUP_ROUTE =
  "/api/ops/proof-retention-cleanup";
export const OPS_PROOF_RETENTION_CLEANUP_CRON_ROUTE =
  "/api/ops/proof-retention-cleanup/cron";
export const OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER =
  "x-jmpseat-ops-secret";
export const OPS_PROOF_RETENTION_CLEANUP_SECRET_ENV_KEY =
  "OPS_CLEANUP_SECRET";
export const OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT = 10;
export const OPS_PROOF_RETENTION_CLEANUP_MAX_LIMIT = 50;

type EnvSource = Record<string, string | undefined>;

type CleanupRunner = (input: {
  limit?: number;
}) => Promise<ProofRetentionCleanupSummary>;

async function getDefaultCleanupRunner(): Promise<CleanupRunner> {
  const proofRetentionModule = await import("../verification/proofRetention");
  return proofRetentionModule.cleanupExpiredVerificationProofsForOps;
}

async function getStorageAdminReadiness(source: EnvSource) {
  const storageAdminModule = await import("../supabase/storageAdmin");
  return storageAdminModule.isStorageAdminConfigured(source);
}

function jsonResponse(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(headers ?? {}),
    },
  });
}

export function getOpsProofRetentionCleanupSecret(
  source: EnvSource = process.env,
) {
  return source[OPS_PROOF_RETENTION_CLEANUP_SECRET_ENV_KEY]?.trim() ?? "";
}

export function normalizeOpsProofRetentionCleanupLimit(
  value: string | null | undefined,
) {
  if (!value) {
    return OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return OPS_PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT;
  }

  return Math.min(
    Math.max(1, Math.trunc(parsed)),
    OPS_PROOF_RETENTION_CLEANUP_MAX_LIMIT,
  );
}

export function isAuthorizedOpsProofRetentionCleanupRequest(input: {
  request: Request;
  source?: EnvSource;
}) {
  const expectedSecret = getOpsProofRetentionCleanupSecret(input.source);

  if (!expectedSecret) {
    return false;
  }

  const actualSecret =
    input.request.headers.get(OPS_PROOF_RETENTION_CLEANUP_SECRET_HEADER)?.trim() ??
    "";

  return actualSecret.length > 0 && actualSecret === expectedSecret;
}

export function isAuthorizedOpsProofRetentionCleanupCronRequest(input: {
  request: Request;
  source?: EnvSource;
}) {
  const expectedSecret = getOpsProofRetentionCleanupSecret(input.source);

  if (!expectedSecret) {
    return false;
  }

  const authorization = input.request.headers.get("authorization")?.trim() ?? "";
  const [scheme, ...rest] = authorization.split(/\s+/);
  const actualSecret = rest.join(" ").trim();

  return (
    scheme?.toLowerCase() === "bearer" &&
    actualSecret.length > 0 &&
    actualSecret === expectedSecret
  );
}

async function runAuthorizedOpsProofRetentionCleanup(
  request: Request,
  options: {
    source?: EnvSource;
    runCleanup?: CleanupRunner;
    isStorageAdminReady?: (source?: EnvSource) => boolean;
  },
) {
  const source = options.source ?? process.env;

  try {
    const storageAdminReady =
      options.isStorageAdminReady?.(source) ??
      (await getStorageAdminReadiness(source));

    if (!storageAdminReady) {
      return jsonResponse(
        {
          ok: false,
          error: "Cleanup trigger is unavailable.",
        },
        503,
      );
    }

    const url = new URL(request.url);
    const limit = normalizeOpsProofRetentionCleanupLimit(
      url.searchParams.get("limit"),
    );
    const runCleanup = options.runCleanup ?? (await getDefaultCleanupRunner());
    const summary = await runCleanup({ limit });

    return jsonResponse(
      {
        ok: summary.failedCount === 0,
        limit,
        scannedCount: summary.scannedCount,
        deletedCount: summary.deletedCount,
        missingCount: summary.missingCount,
        failedCount: summary.failedCount,
        skippedCount: summary.skippedCount,
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "Cleanup run could not start.",
      },
      500,
    );
  }
}

export async function handleOpsProofRetentionCleanupRequest(
  request: Request,
  options: {
    source?: EnvSource;
    runCleanup?: CleanupRunner;
    isStorageAdminReady?: (source?: EnvSource) => boolean;
  } = {},
) {
  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed.",
      },
      405,
      {
        allow: "POST",
      },
    );
  }

  const source = options.source ?? process.env;
  const configuredSecret = getOpsProofRetentionCleanupSecret(source);

  if (!configuredSecret) {
    return jsonResponse(
      {
        ok: false,
        error: "Cleanup trigger is not configured.",
      },
      503,
    );
  }

  if (!isAuthorizedOpsProofRetentionCleanupRequest({ request, source })) {
    return jsonResponse(
      {
        ok: false,
        error: "Unauthorized.",
      },
      401,
    );
  }

  return runAuthorizedOpsProofRetentionCleanup(request, {
    ...options,
    source,
  });
}

export async function handleOpsProofRetentionCleanupCronRequest(
  request: Request,
  options: {
    source?: EnvSource;
    runCleanup?: CleanupRunner;
    isStorageAdminReady?: (source?: EnvSource) => boolean;
  } = {},
) {
  if (request.method !== "GET") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed.",
      },
      405,
      {
        allow: "GET",
      },
    );
  }

  const source = options.source ?? process.env;
  const configuredSecret = getOpsProofRetentionCleanupSecret(source);

  if (!configuredSecret) {
    return jsonResponse(
      {
        ok: false,
        error: "Cleanup trigger is not configured.",
      },
      503,
    );
  }

  if (!isAuthorizedOpsProofRetentionCleanupCronRequest({ request, source })) {
    return jsonResponse(
      {
        ok: false,
        error: "Unauthorized.",
      },
      401,
    );
  }

  return runAuthorizedOpsProofRetentionCleanup(request, {
    ...options,
    source,
  });
}
