const REDACTED_PROOF_VERIFICATION_METHOD = "redacted_badge_or_proof" as const;
const REDACTED_PROOF_EVIDENCE_TYPE = "redacted_badge_or_proof" as const;

export const VERIFICATION_PROOFS_BUCKET = "verification-proofs";
export const VERIFICATION_PROOF_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
] as const;
export const VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const VERIFICATION_PROOF_RETENTION_DAYS = 30;

export const ACTIVE_PROOF_REQUEST_STATUSES = [
  "submitted",
  "pending_review",
  "needs_resubmission",
] as const;

type AllowedProofMimeType = (typeof VERIFICATION_PROOF_ALLOWED_MIME_TYPES)[number];

type RedactedProofFileLike = {
  name: string;
  size: number;
  type: string;
  arrayBuffer?: () => Promise<ArrayBuffer>;
};

export const PROOF_REVIEW_ROUTING_CONTEXT_SOURCES = [
  "self_declared",
  "profile_claimed_airline",
] as const;

type ProofReviewRoutingContextSource =
  (typeof PROOF_REVIEW_ROUTING_CONTEXT_SOURCES)[number];

type VerificationRequestFlowRequest = {
  id: string;
  method: string | null | undefined;
  status: string;
};

const REAL_IMAGE_UPLOAD_MESSAGE = "Upload a real PNG or JPEG image.";

export type RedactedProofValidationResult =
  | {
      kind: "invalid";
      message: string;
    }
  | {
      kind: "valid";
      fileSizeBytes: number;
      mimeType: AllowedProofMimeType;
      originalExtension: "jpg" | "jpeg" | "png";
      storageExtension: "jpg" | "png";
    };

function normalizeExtension(name: string | null | undefined) {
  const trimmed = name?.trim().toLowerCase() ?? "";
  const dotIndex = trimmed.lastIndexOf(".");

  if (dotIndex <= 0 || dotIndex >= trimmed.length - 1) {
    return null;
  }

  return trimmed.slice(dotIndex + 1);
}

function normalizeMimeType(type: string | null | undefined) {
  const normalized = type?.trim().toLowerCase() ?? "";

  return VERIFICATION_PROOF_ALLOWED_MIME_TYPES.find(
    (candidate) => candidate === normalized,
  ) ?? null;
}

function getExpectedMimeTypeForExtension(extension: string | null) {
  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  return null;
}

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  if (offset < 0 || offset + length > bytes.byteLength) {
    return "";
  }

  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint32BE(bytes: Uint8Array, offset: number) {
  if (offset + 4 > bytes.byteLength) {
    return null;
  }

  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  ) >>> 0;
}

function readUint16BE(bytes: Uint8Array, offset: number) {
  if (offset + 2 > bytes.byteLength) {
    return null;
  }

  return (((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0)) >>> 0;
}

function isStructurallyValidPng(bytes: Uint8Array) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  if (
    bytes.byteLength < 45 ||
    !signature.every((value, index) => bytes[index] === value)
  ) {
    return false;
  }

  let offset = signature.length;
  let sawIhdr = false;
  let sawIdat = false;
  let sawIend = false;

  while (offset + 12 <= bytes.byteLength) {
    const length = readUint32BE(bytes, offset);
    const type = readAscii(bytes, offset + 4, 4);

    if (length == null || !/^[A-Za-z]{4}$/.test(type)) {
      return false;
    }

    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + length;
    const crcEnd = chunkEnd + 4;

    if (chunkEnd > bytes.byteLength || crcEnd > bytes.byteLength) {
      return false;
    }

    if (!sawIhdr && type !== "IHDR") {
      return false;
    }

    if (type === "IHDR") {
      if (sawIhdr || length !== 13) {
        return false;
      }

      const width = readUint32BE(bytes, chunkStart);
      const height = readUint32BE(bytes, chunkStart + 4);
      const bitDepth = bytes[chunkStart + 8];
      const colorType = bytes[chunkStart + 9];
      const compression = bytes[chunkStart + 10];
      const filter = bytes[chunkStart + 11];
      const interlace = bytes[chunkStart + 12];

      if (
        !width ||
        !height ||
        ![1, 2, 4, 8, 16].includes(bitDepth ?? 0) ||
        ![0, 2, 3, 4, 6].includes(colorType ?? -1) ||
        compression !== 0 ||
        filter !== 0 ||
        ![0, 1].includes(interlace ?? -1)
      ) {
        return false;
      }

      sawIhdr = true;
    } else if (type === "IDAT") {
      if (!sawIhdr || sawIend || length === 0) {
        return false;
      }

      sawIdat = true;
    } else if (type === "IEND") {
      if (!sawIhdr || !sawIdat || length !== 0) {
        return false;
      }

      sawIend = true;
      return crcEnd === bytes.byteLength;
    }

    offset = crcEnd;
  }

  return sawIend;
}

function isJpegStartOfFrameMarker(marker: number) {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function isStructurallyValidJpeg(bytes: Uint8Array) {
  if (
    bytes.byteLength < 20 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes[bytes.byteLength - 2] !== 0xff ||
    bytes[bytes.byteLength - 1] !== 0xd9
  ) {
    return false;
  }

  let offset = 2;
  let sawStartOfFrame = false;
  let sawStartOfScan = false;

  while (offset < bytes.byteLength - 2) {
    while (bytes[offset] === 0xff) {
      offset += 1;
    }

    const marker = bytes[offset];
    offset += 1;

    if (marker == null || marker === 0x00 || marker === 0xff) {
      return false;
    }

    if (marker === 0xd9) {
      return sawStartOfFrame && sawStartOfScan && offset === bytes.byteLength;
    }

    if (marker >= 0xd0 && marker <= 0xd7) {
      continue;
    }

    const segmentLength = readUint16BE(bytes, offset);

    if (segmentLength == null || segmentLength < 2) {
      return false;
    }

    const segmentDataStart = offset + 2;
    const nextSegmentOffset = offset + segmentLength;

    if (nextSegmentOffset > bytes.byteLength) {
      return false;
    }

    if (isJpegStartOfFrameMarker(marker)) {
      const precision = bytes[segmentDataStart];
      const height = readUint16BE(bytes, segmentDataStart + 1);
      const width = readUint16BE(bytes, segmentDataStart + 3);

      if (
        segmentLength < 8 ||
        ![8, 12, 16].includes(precision ?? 0) ||
        !height ||
        !width
      ) {
        return false;
      }

      sawStartOfFrame = true;
    }

    if (marker === 0xda) {
      sawStartOfScan = true;
      return sawStartOfFrame && bytes.byteLength > nextSegmentOffset + 2;
    }

    offset = nextSegmentOffset;
  }

  return false;
}

function detectProofImageMimeType(bytes: Uint8Array): AllowedProofMimeType | null {
  if (isStructurallyValidPng(bytes)) {
    return "image/png";
  }

  if (isStructurallyValidJpeg(bytes)) {
    return "image/jpeg";
  }

  return null;
}

function normalizeRequestedAirline(value: string | null | undefined) {
  const normalized = value?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function addDays(nowIso: string, days: number) {
  const date = new Date(nowIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function getActiveRedactedProofRequest(
  requests: VerificationRequestFlowRequest[],
) {
  return requests.find(
    (request) =>
      request.method === REDACTED_PROOF_VERIFICATION_METHOD &&
      ACTIVE_PROOF_REQUEST_STATUSES.some((status) => status === request.status),
  );
}

export async function validateRedactedProofUpload(input: {
  file: RedactedProofFileLike | null;
  redactionAcknowledged: boolean;
}): Promise<RedactedProofValidationResult> {
  if (!input.redactionAcknowledged) {
    return {
      kind: "invalid",
      message:
        "Confirm that you redacted employee IDs, badge numbers, barcodes, QR codes, badge backsides, and security-sensitive details before uploading.",
    };
  }

  if (!input.file || input.file.size <= 0) {
    return {
      kind: "invalid",
      message: "Choose a JPEG or PNG proof image before submitting.",
    };
  }

  const mimeType = normalizeMimeType(input.file.type);

  if (!mimeType) {
    return {
      kind: "invalid",
      message:
        "Only JPEG or PNG proof uploads are supported right now. PDF, video, and HEIC remain out of scope for this first upload slice.",
    };
  }

  if (input.file.size > VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES) {
    return {
      kind: "invalid",
      message: "Proof uploads must stay at or below 5 MB.",
    };
  }

  const originalExtension = normalizeExtension(input.file.name);
  const extensionMimeType = getExpectedMimeTypeForExtension(originalExtension);

  if (!extensionMimeType || extensionMimeType !== mimeType) {
    return {
      kind: "invalid",
      message: REAL_IMAGE_UPLOAD_MESSAGE,
    };
  }

  if (!input.file.arrayBuffer) {
    return {
      kind: "invalid",
      message: REAL_IMAGE_UPLOAD_MESSAGE,
    };
  }

  let bytes: Uint8Array;

  try {
    bytes = new Uint8Array(await input.file.arrayBuffer());
  } catch {
    return {
      kind: "invalid",
      message: REAL_IMAGE_UPLOAD_MESSAGE,
    };
  }

  const detectedMimeType = detectProofImageMimeType(bytes);

  if (detectedMimeType !== mimeType) {
    return {
      kind: "invalid",
      message: REAL_IMAGE_UPLOAD_MESSAGE,
    };
  }

  return {
    kind: "valid",
    fileSizeBytes: input.file.size,
    mimeType: detectedMimeType,
    originalExtension: originalExtension as "jpg" | "jpeg" | "png",
    storageExtension: detectedMimeType === "image/jpeg" ? "jpg" : "png",
  };
}

export function buildVerificationProofStoragePath({
  userId,
  requestId,
  evidenceId,
  extension,
}: {
  userId: string;
  requestId: string;
  evidenceId: string;
  extension: "jpg" | "png";
}) {
  return `${userId}/${requestId}/${evidenceId}.${extension}`;
}

export function isSafeVerificationProofStoragePath(path: string) {
  const parts = path.split("/");

  if (parts.length !== 3) {
    return false;
  }

  const [userId, requestId, filename] = parts;
  const filenameParts = filename.split(".");

  if (filenameParts.length !== 2) {
    return false;
  }

  const [evidenceId, extension] = filenameParts;

  return (
    isUuidLike(userId) &&
    isUuidLike(requestId) &&
    isUuidLike(evidenceId) &&
    (extension === "jpg" || extension === "png")
  );
}

export function buildRedactedProofEvidenceMetadata(input: {
  fileSizeBytes: number;
  mimeType: AllowedProofMimeType;
  originalExtension: "jpg" | "jpeg" | "png";
  requestedAirline: string;
  routingContextSource: ProofReviewRoutingContextSource;
  uploadClient?: "web";
}) {
  return {
    file_size_bytes: input.fileSizeBytes,
    mime_type: input.mimeType,
    original_extension: input.originalExtension,
    upload_client: input.uploadClient ?? "web",
    redaction_acknowledged: true,
    evidence_method: REDACTED_PROOF_VERIFICATION_METHOD,
    requested_airline: input.requestedAirline,
    routing_context_source: input.routingContextSource,
  };
}

export function resolveProofReviewRoutingContext(input: {
  requestedAirline: string | null | undefined;
  profileClaimedAirline: string | null | undefined;
}) {
  const requestedAirline = normalizeRequestedAirline(input.requestedAirline);

  if (!requestedAirline) {
    return {
      kind: "invalid" as const,
      message:
        "Provide the airline name reviewers should use for routing. This is self-declared review context only and not a verified claim.",
    };
  }

  const profileClaimedAirline = normalizeRequestedAirline(input.profileClaimedAirline);
  const routingContextSource: ProofReviewRoutingContextSource =
    profileClaimedAirline &&
    requestedAirline.localeCompare(profileClaimedAirline, undefined, {
      sensitivity: "accent",
    }) === 0
      ? "profile_claimed_airline"
      : "self_declared";

  return {
    kind: "valid" as const,
    requestedAirline,
    routingContextSource,
  };
}

export function buildRedactedProofVerificationDraft(input: {
  userId: string;
  requestId: string;
  evidenceId: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: AllowedProofMimeType;
  originalExtension: "jpg" | "jpeg" | "png";
  requestedAirline: string;
  routingContextSource: ProofReviewRoutingContextSource;
  nowIso?: string;
}) {
  const nowIso = input.nowIso ?? new Date().toISOString();

  return {
    request: {
      id: input.requestId,
      user_id: input.userId,
      status: "submitted" as const,
      requested_claim_types: ["airline_worker"],
      method: REDACTED_PROOF_VERIFICATION_METHOD,
      submitted_at: nowIso,
    },
    evidence: {
      id: input.evidenceId,
      request_id: input.requestId,
      user_id: input.userId,
      evidence_type: REDACTED_PROOF_EVIDENCE_TYPE,
      storage_bucket: VERIFICATION_PROOFS_BUCKET,
      storage_path: input.storagePath,
      redaction_acknowledged: true,
      status: "submitted" as const,
      uploaded_at: nowIso,
      delete_after: addDays(nowIso, VERIFICATION_PROOF_RETENTION_DAYS),
      metadata: buildRedactedProofEvidenceMetadata({
        fileSizeBytes: input.fileSizeBytes,
        mimeType: input.mimeType,
        originalExtension: input.originalExtension,
        requestedAirline: input.requestedAirline,
        routingContextSource: input.routingContextSource,
      }),
    },
  };
}
