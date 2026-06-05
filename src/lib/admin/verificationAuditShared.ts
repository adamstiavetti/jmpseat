import type { OperatorScope } from "./access";

export const AUDIT_INSPECTION_SCOPES = [
  "operator.read_audit",
  "operator.read_verification_requests",
] as const satisfies readonly OperatorScope[];

export const DEFAULT_AUDIT_LIMIT = 25;
export const MAX_AUDIT_LIMIT = 50;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type VerificationAuditRequestRecord = {
  id: string;
  userId: string;
  status: string;
  method: string;
  requestedClaimTypes: string[];
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
  claimCount: number;
  reviewActionCount: number;
};

export type VerificationAuditEvidenceRecord = {
  id: string;
  evidenceType: string;
  status: string;
  uploadedAt: string | null;
  deleteAfter: string | null;
  deletedAt: string | null;
  redactionAcknowledged: boolean;
  proofPresent: boolean;
  metadata: Record<string, unknown>;
};

export type VerificationAuditClaimRecord = {
  id: string;
  claimType: string;
  claimValue: string | null;
  status: string;
  verificationMethod: string | null;
  confidenceLevel: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type VerificationAuditReviewActionRecord = {
  id: string;
  reviewerId: string;
  action: string;
  createdAt: string;
  claimId: string | null;
  notesPresent: boolean;
};

export type VerificationAuditEventRecord = {
  id: string;
  eventType: string;
  userId: string | null;
  route: string | null;
  result: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type VerificationAuditDetailRecord = VerificationAuditRequestRecord & {
  evidence: VerificationAuditEvidenceRecord[];
  claims: VerificationAuditClaimRecord[];
  reviewActions: VerificationAuditReviewActionRecord[];
};

const REDACTED_AUDIT_METADATA_KEYS = new Set([
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
  "raw_proof_text",
  "raw_proof",
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
  "proof_file_contents",
]);

const REDACTED_AUDIT_METADATA_PATTERNS = [
  /password/i,
  /(^|_)token$/i,
  /access_token$/i,
  /refresh_token$/i,
  /api_key$/i,
  /secret(_key)?$/i,
  /service_role$/i,
  /service_role_key$/i,
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

function shouldRedactAuditMetadataKey(key: string) {
  const normalized = key.trim().toLowerCase();

  return (
    REDACTED_AUDIT_METADATA_KEYS.has(normalized) ||
    REDACTED_AUDIT_METADATA_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

function sanitizeAuditMetadataValue(value: unknown): unknown {
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
      .map((entry) => sanitizeAuditMetadataValue(entry))
      .filter((entry) => entry != null);
  }

  if (isPlainObject(value)) {
    return sanitizeAuditMetadata(value);
  }

  return String(value);
}

export function sanitizeAuditMetadata(
  metadata: Record<string, unknown> | null | undefined,
) {
  const entries = Object.entries(metadata ?? {}).flatMap(([key, value]) => {
    if (value == null || shouldRedactAuditMetadataKey(key)) {
      return [];
    }

    const sanitized = sanitizeAuditMetadataValue(value);

    if (sanitized == null) {
      return [];
    }

    return [[key, sanitized] as const];
  });

  return Object.fromEntries(entries);
}

export function normalizeAuditLimit(value: string | number | null | undefined) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_AUDIT_LIMIT;
  }

  return Math.min(Math.max(parsed, 1), MAX_AUDIT_LIMIT);
}

export function normalizeAuditOffset(value: string | number | null | undefined) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(parsed, 0);
}

export function normalizeSelectedAuditRequestId(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return null;
  }

  return UUID_PATTERN.test(normalized) ? normalized : null;
}

export function isSelectedAuditRequestIdValid(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return !normalized || UUID_PATTERN.test(normalized);
}

export function canReadVerificationRequests(scopes: readonly string[] | null | undefined) {
  return (scopes ?? []).includes("operator.read_verification_requests");
}

export function canReadAuditEvents(scopes: readonly string[] | null | undefined) {
  return (scopes ?? []).includes("operator.read_audit");
}
