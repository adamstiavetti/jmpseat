export const REVIEWER_SCOPE_TYPES = [
  "global",
  "airline",
  "role",
  "base",
] as const;

export const REVIEWER_SCOPE_STATUSES = [
  "active",
  "paused",
  "revoked",
] as const;

export const REVIEW_ACTIONS = [
  "approve",
  "reject",
  "request_resubmission",
] as const;

const REVIEWABLE_REQUEST_STATUSES = ["submitted", "pending_review"] as const;

export type ReviewerScopeType = (typeof REVIEWER_SCOPE_TYPES)[number];
export type ReviewerScopeStatus = (typeof REVIEWER_SCOPE_STATUSES)[number];
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export type ReviewerScope = {
  scope_type: string;
  scope_value: string | null;
  status: string;
};

export type ReviewQueueEntry = {
  request: {
    id: string;
    user_id: string;
  };
  evidence: Array<{
    metadata: Record<string, unknown>;
  }>;
};

type ReviewRequest = {
  id: string;
  user_id: string;
  method: string;
  status: string;
  requested_claim_types: string[] | null;
};

type ReviewEvidence = {
  evidence_type: string;
  metadata: Record<string, unknown>;
};

type ClaimInsert = {
  user_id: string;
  request_id: string;
  claim_type: string;
  claim_value: string | null;
  status: "approved";
  verification_method: string;
  approved_by: string;
  approved_at: string;
  expires_at: string;
  reason: string | null;
};

export function hasActiveReviewerScope(scopes: ReviewerScope[]) {
  return scopes.some((scope) => scope.status === "active");
}

function isGlobalReviewer(scope: ReviewerScope) {
  return scope.status === "active" && scope.scope_type === "global";
}

function normalizeScopeValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

function entrySupportsScope(entry: ReviewQueueEntry, scope: ReviewerScope) {
  if (scope.status !== "active") {
    return false;
  }

  if (scope.scope_type === "global") {
    return true;
  }

  const normalizedScopeValue = normalizeScopeValue(scope.scope_value);

  if (!normalizedScopeValue) {
    return false;
  }

  const metadataValues = entry.evidence.flatMap((evidence) => {
    if (scope.scope_type === "airline") {
      const airline = evidence.metadata.airline;
      return typeof airline === "string" ? [airline] : [];
    }

    if (scope.scope_type === "role") {
      const role = evidence.metadata.role;
      return typeof role === "string" ? [role] : [];
    }

    if (scope.scope_type === "base") {
      const base = evidence.metadata.base;
      return typeof base === "string" ? [base] : [];
    }

    return [];
  });

  return metadataValues.some(
    (value) => normalizeScopeValue(value) === normalizedScopeValue,
  );
}

export function filterReviewQueueByScopes<T extends ReviewQueueEntry>({
  queue,
  scopes,
}: {
  queue: T[];
  scopes: ReviewerScope[];
}) {
  const activeScopes = scopes.filter((scope) => scope.status === "active");

  if (activeScopes.some(isGlobalReviewer)) {
    return queue;
  }

  return queue.filter((entry) =>
    activeScopes.some((scope) => entrySupportsScope(entry, scope)),
  );
}

function addDays(nowIso: string, days: number) {
  const date = new Date(nowIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function buildApprovedClaims({
  reviewerId,
  request,
  evidence,
  nowIso,
}: {
  reviewerId: string;
  request: ReviewRequest;
  evidence: ReviewEvidence[];
  nowIso: string;
}) {
  if (request.method !== "work_email") {
    return [] as ClaimInsert[];
  }

  const workEmailEvidence = evidence.find(
    (entry) =>
      entry.evidence_type === "work_email" &&
      entry.metadata.support_result === "supported_domain" &&
      entry.metadata.verification_method === "work_email",
  );

  if (!workEmailEvidence) {
    return [] as ClaimInsert[];
  }

  const requestedClaimTypes = request.requested_claim_types ?? [];
  const claims: ClaimInsert[] = [];

  if (requestedClaimTypes.includes("airline_worker")) {
    claims.push({
      user_id: request.user_id,
      request_id: request.id,
      claim_type: "airline_worker",
      claim_value: null,
      status: "approved",
      verification_method: "work_email",
      approved_by: reviewerId,
      approved_at: nowIso,
      expires_at: addDays(nowIso, 365),
      reason: null,
    });
  }

  if (
    requestedClaimTypes.includes("airline") &&
    typeof workEmailEvidence.metadata.airline === "string" &&
    workEmailEvidence.metadata.airline.trim()
  ) {
    claims.push({
      user_id: request.user_id,
      request_id: request.id,
      claim_type: "airline",
      claim_value: workEmailEvidence.metadata.airline.trim(),
      status: "approved",
      verification_method: "work_email",
      approved_by: reviewerId,
      approved_at: nowIso,
      expires_at: addDays(nowIso, 180),
      reason: null,
    });
  }

  return claims;
}

export function planVerificationReviewDecision({
  reviewerId,
  reviewerScopes,
  request,
  evidence,
  action,
  nowIso = new Date().toISOString(),
}: {
  reviewerId: string;
  reviewerScopes: ReviewerScope[];
  request: ReviewRequest;
  evidence: ReviewEvidence[];
  action: ReviewAction;
  nowIso?: string;
}) {
  if (!hasActiveReviewerScope(reviewerScopes)) {
    return {
      kind: "unauthorized" as const,
      message: "You are not authorized to review verification requests.",
    };
  }

  if (request.user_id === reviewerId) {
    return {
      kind: "self_review_blocked" as const,
      message: "Reviewers cannot approve or reject their own verification requests.",
    };
  }

  if (!REVIEWABLE_REQUEST_STATUSES.some((status) => status === request.status)) {
    return {
      kind: "not_reviewable" as const,
      message: "This verification request is not currently in a reviewable state.",
    };
  }

  const claimsToInsert =
    action === "approve"
      ? buildApprovedClaims({
          reviewerId,
          request,
          evidence,
          nowIso,
        })
      : [];

  if (action === "approve" && claimsToInsert.length === 0) {
    return {
      kind: "unsupported_evidence" as const,
      message:
        "This verification request does not contain enough approved evidence metadata to issue any supported claims.",
    };
  }

  const nextStatus =
    action === "approve"
      ? "approved"
      : action === "reject"
        ? "rejected"
        : "needs_resubmission";

  return {
    kind: "apply_review" as const,
    requestUpdate: {
      status: nextStatus,
      reviewed_by: reviewerId,
      reviewed_at: nowIso,
    },
    reviewActionInsert: {
      action,
      reviewer_id: reviewerId,
      notes: null,
    },
    claimsToInsert,
  };
}
