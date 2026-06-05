import type { OperatorScope } from "./access";

export const PROOF_CLEANUP_MONITORING_SCOPE =
  "operator.monitor_proof_cleanup" as const satisfies OperatorScope;

export const DEFAULT_PROOF_CLEANUP_MONITORING_LIMIT = 25;
export const MAX_PROOF_CLEANUP_MONITORING_LIMIT = 50;

export type ProofCleanupMonitoringSummary = {
  scheduledCount: number;
  dueCount: number;
  overdueCount: number;
  deletedCount: number;
  failedEventCount: number;
  recentFailureCount: number;
  lastCleanupEventAt: string | null;
  lastFailureAt: string | null;
};

export type ProofCleanupFailureRecord = {
  eventId: string;
  verificationEvidenceId: string | null;
  verificationRequestId: string | null;
  evidenceStatus: string | null;
  deleteAfter: string | null;
  deletedAt: string | null;
  reasonCode: string | null;
  result: string | null;
  failedAt: string;
};

export type ProofCleanupEventRecord = {
  id: string;
  eventType: string;
  userId: string | null;
  route: string | null;
  result: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

const REDACTED_PROOF_CLEANUP_METADATA_KEYS = new Set([
  "password",
  "email",
  "work_email",
  "raw_work_email",
  "email_local_part",
  "local_part",
  "badge_id",
  "badge_number",
  "badge_numbers",
  "employee_id",
  "barcode",
  "barcode_content",
  "qr_code",
  "qr_content",
  "ocr_text",
  "extracted_text",
  "proof_text",
  "proof_content",
  "proof_contents",
  "proof_body",
  "proof_data",
  "proof_file_contents",
  "raw_proof",
  "raw_proof_text",
  "raw_proof_contents",
  "filename",
  "file_name",
  "original_filename",
  "proof_filename",
  "storage_path",
  "storage_bucket",
  "signed_url",
  "public_url",
  "proof_view_url",
  "token",
  "access_token",
  "refresh_token",
  "api_key",
  "secret",
  "secret_key",
  "service_role",
  "service_role_key",
  "magic_link",
  "session",
  "authorization",
  "cookie",
  "path",
  "url",
]);

const REDACTED_PROOF_CLEANUP_METADATA_PATTERNS = [
  /password/i,
  /(^|_)token$/i,
  /access_token$/i,
  /refresh_token$/i,
  /api_key$/i,
  /secret(_key)?$/i,
  /service_role(_key)?$/i,
  /^magic_link$/i,
  /^session$/i,
  /^authorization$/i,
  /^cookie$/i,
  /(^|_)signed_url$/i,
  /(^|_)public_url$/i,
  /(^|_)url$/i,
  /(^|_)proof_view_url$/i,
  /^storage_(path|bucket)$/i,
  /(^|_)path$/i,
  /(^|_)file_?name$/i,
  /^proof_(filename|text|content|contents|file_contents|body|data)$/i,
  /^raw_(work_email|proof|proof_text|proof_contents|ocr_text)$/i,
  /^extracted_text$/i,
  /^employee_id$/i,
  /^badge_(id|number|numbers)$/i,
  /^barcode(_content)?$/i,
  /^qr(_code|_content)?$/i,
  /^ocr_text$/i,
  /^email(_local_part)?$/i,
  /^work_email$/i,
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function shouldRedactProofCleanupMetadataKey(key: string) {
  const normalized = key.trim().toLowerCase();

  return (
    REDACTED_PROOF_CLEANUP_METADATA_KEYS.has(normalized) ||
    REDACTED_PROOF_CLEANUP_METADATA_PATTERNS.some((pattern) =>
      pattern.test(normalized),
    )
  );
}

function sanitizeProofCleanupMetadataValue(value: unknown): unknown {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeProofCleanupMetadataValue(entry))
      .filter((entry) => entry != null);
  }

  if (isPlainObject(value)) {
    return sanitizeProofCleanupMetadata(value);
  }

  return String(value);
}

export function sanitizeProofCleanupMetadata(
  metadata: Record<string, unknown> | null | undefined,
) {
  const entries = Object.entries(metadata ?? {}).flatMap(([key, value]) => {
    if (value == null || shouldRedactProofCleanupMetadataKey(key)) {
      return [];
    }

    const sanitized = sanitizeProofCleanupMetadataValue(value);

    if (sanitized == null) {
      return [];
    }

    return [[key, sanitized] as const];
  });

  return Object.fromEntries(entries);
}

export function normalizeProofCleanupMonitoringLimit(
  value: string | number | null | undefined,
) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_PROOF_CLEANUP_MONITORING_LIMIT;
  }

  return Math.min(Math.max(parsed, 1), MAX_PROOF_CLEANUP_MONITORING_LIMIT);
}

export function normalizeProofCleanupMonitoringOffset(
  value: string | number | null | undefined,
) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(parsed, 0);
}
