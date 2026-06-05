const VERIFICATION_PROOFS_BUCKET = "verification-proofs";

const REVIEWABLE_PROOF_REQUEST_STATUSES = ["submitted", "pending_review"] as const;
const PROOF_EVIDENCE_TYPE = "redacted_badge_or_proof";

export const PROOF_VIEW_SIGNED_URL_TTL_SECONDS = 60;
export const MAX_PROOF_VIEW_SIGNED_URL_TTL_SECONDS = 300;

export type ProofViewReasonCode =
  | "unauthenticated"
  | "scope_missing"
  | "request_missing"
  | "evidence_missing"
  | "request_evidence_mismatch"
  | "self_review_blocked"
  | "request_not_reviewable"
  | "unsupported_evidence_type"
  | "bucket_mismatch"
  | "storage_path_missing"
  | "proof_deleted"
  | "request_access_denied"
  | "signed_url_unavailable";

type ProofAccessRequest = {
  id: string;
  user_id: string;
  status: string;
};

type ProofAccessEvidence = {
  id: string;
  request_id: string;
  evidence_type: string;
  storage_bucket: string | null;
  storage_path: string | null;
  deleted_at?: string | null;
};

type ResolveProofViewAccessInput = {
  reviewerId: string | null;
  reviewerAuthorized: boolean;
  request: ProofAccessRequest | null;
  evidence: ProofAccessEvidence | null;
  canReviewRequest: boolean;
};

type DeniedProofViewAccess = {
  kind: "denied";
  reasonCode: ProofViewReasonCode;
  message: string;
};

type AllowedProofViewAccess = {
  kind: "allowed";
  requestId: string;
  evidenceId: string;
  bucket: typeof VERIFICATION_PROOFS_BUCKET;
  storagePath: string;
  ttlSeconds: typeof PROOF_VIEW_SIGNED_URL_TTL_SECONDS;
};

export type ProofViewAccessResult =
  | DeniedProofViewAccess
  | AllowedProofViewAccess;

export function normalizeProofViewAuditUuid(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    normalized,
  )
    ? normalized
    : null;
}

function isReviewableProofRequestStatus(status: string) {
  return REVIEWABLE_PROOF_REQUEST_STATUSES.some(
    (candidate) => candidate === status,
  );
}

export function resolveProofViewAccess(
  input: ResolveProofViewAccessInput,
): ProofViewAccessResult {
  if (!input.reviewerId) {
    return {
      kind: "denied",
      reasonCode: "unauthenticated",
      message: "Sign in again before trying to view verification proof.",
    };
  }

  if (!input.reviewerAuthorized) {
    return {
      kind: "denied",
      reasonCode: "scope_missing",
      message: "You are not authorized to view this verification proof.",
    };
  }

  if (!input.evidence) {
    return {
      kind: "denied",
      reasonCode: "evidence_missing",
      message: "The verification proof could not be found.",
    };
  }

  if (!input.request) {
    return {
      kind: "denied",
      reasonCode: "request_missing",
      message: "The verification request could not be found.",
    };
  }

  if (input.evidence.request_id !== input.request.id) {
    return {
      kind: "denied",
      reasonCode: "request_evidence_mismatch",
      message:
        "The verification proof could not be matched to the selected request.",
    };
  }

  if (input.request.user_id === input.reviewerId) {
    return {
      kind: "denied",
      reasonCode: "self_review_blocked",
      message: "Reviewers cannot view proof for their own verification request.",
    };
  }

  if (!isReviewableProofRequestStatus(input.request.status)) {
    return {
      kind: "denied",
      reasonCode: "request_not_reviewable",
      message: "This verification proof is no longer available for review.",
    };
  }

  if (input.evidence.evidence_type !== PROOF_EVIDENCE_TYPE) {
    return {
      kind: "denied",
      reasonCode: "unsupported_evidence_type",
      message: "Only redacted proof uploads can be viewed in this reviewer flow.",
    };
  }

  if (input.evidence.storage_bucket !== VERIFICATION_PROOFS_BUCKET) {
    return {
      kind: "denied",
      reasonCode: "bucket_mismatch",
      message: "This verification proof is not stored in the private proof bucket.",
    };
  }

  if (input.evidence.deleted_at) {
    return {
      kind: "denied",
      reasonCode: "proof_deleted",
      message: "This verification proof has been deleted and is no longer available.",
    };
  }

  if (!input.evidence.storage_path) {
    return {
      kind: "denied",
      reasonCode: "storage_path_missing",
      message: "This verification proof is not available for viewing right now.",
    };
  }

  if (!input.canReviewRequest) {
    return {
      kind: "denied",
      reasonCode: "request_access_denied",
      message: "You are not authorized to view this verification proof.",
    };
  }

  return {
    kind: "allowed",
    requestId: input.request.id,
    evidenceId: input.evidence.id,
    bucket: VERIFICATION_PROOFS_BUCKET,
    storagePath: input.evidence.storage_path,
    ttlSeconds: PROOF_VIEW_SIGNED_URL_TTL_SECONDS,
  };
}
