export const SECURITY_EVENT_TYPES = [
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
] as const;

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];

export type SecurityEventMetadata = Record<string, unknown>;
export type RecordSecurityEventInput = {
  userId?: string | null;
  eventType: SecurityEventType;
  route?: string | null;
  result?: string | null;
  metadata?: SecurityEventMetadata | null;
};

export type SecurityEventInsert = {
  user_id: string | null;
  event_type: SecurityEventType;
  route: string | null;
  result: string | null;
  metadata: Record<string, unknown>;
};

const REDACTED_METADATA_KEYS = new Set([
  "password",
  "email",
  "invited_email",
  "badge_id",
  "employee_id",
  "proof_type",
  "work_email",
  "raw_work_email",
  "email_local_part",
  "local_part",
  "badge_number",
  "badge_numbers",
  "barcode",
  "barcode_content",
  "qr_code",
  "qr_content",
  "ocr_text",
  "proof_text",
  "raw_proof_text",
  "storage_path",
  "passenger_data",
  "customer_data",
  "trip_data",
  "schedule_data",
  "crew_hotel_information",
  "proof_file_contents",
  "secret_key",
  "access_token",
  "refresh_token",
  "api_key",
]);

const REDACTED_METADATA_KEY_PATTERNS = [
  /^employee_id$/,
  /^badge_(id|number|numbers)$/,
  /^barcode(_content)?$/,
  /^qr(_code|_content)?$/,
  /^ocr_text$/,
  /^proof(_file_contents|_text|_type)?$/,
  /^raw_(work_email|proof_text|ocr_text)$/,
  /^storage_path$/,
  /^passenger(_data)?$/,
  /^customer(_data)?$/,
  /^trip(_data)?$/,
  /^schedule(_data)?$/,
  /^crew_hotel(_information)?$/,
  /password/,
  /secret(_key)?$/,
  /access_token$/,
  /refresh_token$/,
  /api_key$/,
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function shouldRedactMetadataKey(key: string) {
  const normalizedKey = key.trim().toLowerCase();

  if (REDACTED_METADATA_KEYS.has(normalizedKey)) {
    return true;
  }

  return REDACTED_METADATA_KEY_PATTERNS.some((pattern) =>
    pattern.test(normalizedKey),
  );
}

function sanitizeValue(value: unknown): unknown {
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
      .map((entry) => sanitizeValue(entry))
      .filter((entry) => entry != null);
  }

  if (isPlainObject(value)) {
    return sanitizeSecurityEventMetadata(value);
  }

  return String(value);
}

export function getEmailDomain(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  const atIndex = normalized.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return null;
  }

  return normalized.slice(atIndex + 1);
}

export function sanitizeSecurityEventMetadata(
  metadata: SecurityEventMetadata | null | undefined,
) {
  const sanitizedEntries = Object.entries(metadata ?? {}).flatMap(([key, value]) => {
    if (shouldRedactMetadataKey(key) || value == null) {
      return [];
    }

    const sanitizedValue = sanitizeValue(value);

    if (sanitizedValue == null) {
      return [];
    }

    return [[key, sanitizedValue] as const];
  });

  return Object.fromEntries(sanitizedEntries);
}

type VerificationRequestEventType =
  | "verification_request.submitted"
  | "verification_request.unsupported_domain"
  | "verification_request.invalid_work_email"
  | "verification_request.duplicate_active";

type VerificationReviewEventType =
  | "verification_review.approved"
  | "verification_review.rejected"
  | "verification_review.needs_resubmission"
  | "verification_review.unauthorized_attempt"
  | "verification_review.self_review_blocked";

export function getVerificationRequestEventType(input: {
  submissionKind:
    | "create_request"
    | "invalid_email"
    | "unsupported_domain"
    | "duplicate_request";
}): VerificationRequestEventType {
  switch (input.submissionKind) {
    case "create_request":
      return "verification_request.submitted";
    case "invalid_email":
      return "verification_request.invalid_work_email";
    case "unsupported_domain":
      return "verification_request.unsupported_domain";
    case "duplicate_request":
      return "verification_request.duplicate_active";
  }
}

export function getVerificationReviewEventType(input: {
  action?: "approve" | "reject" | "request_resubmission";
  outcome?: "unauthorized" | "self_review_blocked";
}): VerificationReviewEventType {
  if (input.outcome === "unauthorized") {
    return "verification_review.unauthorized_attempt";
  }

  if (input.outcome === "self_review_blocked") {
    return "verification_review.self_review_blocked";
  }

  switch (input.action) {
    case "approve":
      return "verification_review.approved";
    case "reject":
      return "verification_review.rejected";
    case "request_resubmission":
      return "verification_review.needs_resubmission";
    default:
      return "verification_review.unauthorized_attempt";
  }
}

export function getPrivateAccessEventType(
  gate:
    | { kind: "allow" }
    | {
        kind: "redirect";
        path: string;
      },
): SecurityEventType {
  if (gate.kind === "allow") {
    return "private_access.allowed";
  }

  if (gate.path.startsWith("/login")) {
    return "private_access.redirect_login";
  }

  if (gate.path.includes("error=")) {
    return "private_access.storage_not_ready";
  }

  if (gate.path.startsWith("/app/profile")) {
    return "private_access.redirect_profile";
  }

  return "private_access.redirect_access_hold";
}

export async function recordSecurityEventWithInsert(
  input: RecordSecurityEventInput,
  options: {
    enabled: boolean;
    insert: (payload: SecurityEventInsert) => Promise<{ error: Error | { message?: string } | null } | undefined>;
  },
) {
  if (!options.enabled) {
    return { recorded: false, skipped: true } as const;
  }

  const payload: SecurityEventInsert = {
    user_id: input.userId ?? null,
    event_type: input.eventType,
    route: input.route ?? null,
    result: input.result ?? null,
    metadata: sanitizeSecurityEventMetadata(input.metadata),
  };

  try {
    const result = await options.insert(payload);

    if (result?.error) {
      return { recorded: false, skipped: false } as const;
    }

    return { recorded: true, skipped: false } as const;
  } catch {
    return { recorded: false, skipped: false } as const;
  }
}
