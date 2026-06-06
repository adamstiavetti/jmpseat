export type AirlineEmailAccessStatus =
  | "pending"
  | "verified"
  | "expired"
  | "revoked"
  | "unsupported_domain"
  | "not_verified"
  | "not_ready";

export type AirlineEmailAccessSource =
  | "work_email"
  | "legacy_claim_work_email"
  | "unknown";

export type AirlineEmailAccessState = {
  status: AirlineEmailAccessStatus;
  airlineEmailVerified: boolean;
  domain: string | null;
  airline: string | null;
  verifiedAt: string | null;
  source: AirlineEmailAccessSource;
  messageKey: string;
};

export type AirlineEmailAccessRequest = {
  id: string;
  method: string | null | undefined;
  status: string | null | undefined;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  expires_at?: string | null;
};

export type AirlineEmailAccessEvidence = {
  request_id: string | null | undefined;
  evidence_type: string | null | undefined;
  status: string | null | undefined;
  uploaded_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AirlineEmailAccessClaim = {
  request_id?: string | null;
  claim_type: string | null | undefined;
  claim_value: string | null | undefined;
  status: string | null | undefined;
  verification_method?: string | null;
  approved_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
};

type AirlineEmailAccessProfile = {
  claimed_airline?: string | null;
  claimed_role?: string | null;
  claimed_base?: string | null;
};

export type GetCurrentAirlineEmailAccessStateInput = {
  approvedDomains: AirlineEmailApprovedDomainRecord[];
  requests: AirlineEmailAccessRequest[];
  evidence: AirlineEmailAccessEvidence[];
  claims: AirlineEmailAccessClaim[];
  profile?: AirlineEmailAccessProfile | null;
  betaActive?: boolean;
  loginEmail?: string | null;
  loadError?: string | null;
  nowIso?: string;
};

type AirlineEmailApprovedDomainRecord = {
  domain?: string | null;
  airline?: string | null;
  status?: string | null;
};

type AirlineEmailAccessCandidate = {
  status: Extract<
    AirlineEmailAccessStatus,
    "pending" | "verified" | "expired" | "revoked" | "unsupported_domain"
  >;
  domain: string | null;
  airline: string | null;
  verifiedAt: string | null;
  source: AirlineEmailAccessSource;
  timestamp: string | null;
  timestampMs: number | null;
  sourceWeight: number;
  stableKey: string;
};

const MESSAGE_KEYS: Record<AirlineEmailAccessStatus, string> = {
  pending: "airline_email_pending",
  verified: "airline_email_verified",
  expired: "airline_email_expired",
  revoked: "airline_email_revoked",
  unsupported_domain: "airline_email_unsupported_domain",
  not_verified: "airline_email_not_verified",
  not_ready: "airline_email_access_not_ready",
};

function buildState({
  status,
  domain = null,
  airline = null,
  verifiedAt = null,
  source = "unknown",
}: {
  status: AirlineEmailAccessStatus;
  domain?: string | null;
  airline?: string | null;
  verifiedAt?: string | null;
  source?: AirlineEmailAccessSource;
}): AirlineEmailAccessState {
  return {
    status,
    airlineEmailVerified: status === "verified",
    domain,
    airline,
    verifiedAt,
    source,
    messageKey: MESSAGE_KEYS[status],
  };
}

function getMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : null;
}

function getEvidenceDomain(evidence: AirlineEmailAccessEvidence) {
  return getMetadataString(evidence.metadata, "email_domain")?.toLowerCase() ?? null;
}

function getSupportResult(evidence: AirlineEmailAccessEvidence) {
  return getMetadataString(evidence.metadata, "support_result");
}

function getVerificationMethodFromEvidence(evidence: AirlineEmailAccessEvidence) {
  return getMetadataString(evidence.metadata, "verification_method");
}

function findActiveDomain(
  domain: string | null,
  approvedDomains: AirlineEmailApprovedDomainRecord[],
) {
  const normalizedDomain = domain?.trim().toLowerCase() ?? "";

  if (!normalizedDomain) {
    return null;
  }

  for (const record of approvedDomains) {
    const recordDomain = record.domain?.trim().toLowerCase() ?? "";
    const recordStatus = record.status?.trim().toLowerCase() ?? "";

    if (recordDomain === normalizedDomain && recordStatus === "active") {
      return {
        domain: recordDomain,
        airline: record.airline?.trim() || null,
      };
    }
  }

  return null;
}

function isExpired(expiresAt: string | null | undefined, nowIso: string) {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= new Date(nowIso).getTime();
}

function getTimestampMs(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function getStatusWeight(
  status: AirlineEmailAccessCandidate["status"],
) {
  switch (status) {
    case "revoked":
      return 4;
    case "expired":
      return 3;
    case "verified":
      return 2;
    case "pending":
      return 1;
    case "unsupported_domain":
      return 0;
  }
}

function compareCandidates(
  left: AirlineEmailAccessCandidate,
  right: AirlineEmailAccessCandidate,
) {
  if (left.timestampMs != null || right.timestampMs != null) {
    if (left.timestampMs == null) {
      return 1;
    }

    if (right.timestampMs == null) {
      return -1;
    }

    if (left.timestampMs !== right.timestampMs) {
      return right.timestampMs - left.timestampMs;
    }
  }

  const weightDifference = getStatusWeight(right.status) - getStatusWeight(left.status);
  if (weightDifference !== 0) {
    return weightDifference;
  }

  if (left.sourceWeight !== right.sourceWeight) {
    return right.sourceWeight - left.sourceWeight;
  }

  return left.stableKey.localeCompare(right.stableKey);
}

function sortCandidates(
  candidates: AirlineEmailAccessCandidate[],
) {
  return [...candidates].sort(compareCandidates);
}

function buildCandidate({
  status,
  domain,
  airline,
  verifiedAt = null,
  source,
  timestamp,
  stableKey,
}: {
  status: AirlineEmailAccessCandidate["status"];
  domain: string | null;
  airline: string | null;
  verifiedAt?: string | null;
  source: AirlineEmailAccessSource;
  timestamp: string | null;
  stableKey: string;
}): AirlineEmailAccessCandidate {
  return {
    status,
    domain,
    airline,
    verifiedAt,
    source,
    timestamp,
    timestampMs: getTimestampMs(timestamp),
    sourceWeight: source === "legacy_claim_work_email" ? 1 : 0,
    stableKey,
  };
}

function candidateToState(candidate: AirlineEmailAccessCandidate) {
  return buildState({
    status: candidate.status,
    domain: candidate.domain,
    airline: candidate.airline,
    verifiedAt: candidate.verifiedAt,
    source: candidate.source,
  });
}

function isWorkEmailEvidence(evidence: AirlineEmailAccessEvidence) {
  return (
    evidence.evidence_type === "work_email" &&
    getVerificationMethodFromEvidence(evidence) !== "redacted_badge_or_proof"
  );
}

function getSupportedWorkEmailEvidence({
  evidence,
  approvedDomains,
}: {
  evidence: AirlineEmailAccessEvidence[];
  approvedDomains: AirlineEmailApprovedDomainRecord[];
}) {
  for (const item of sortWorkEmailEvidence(evidence)) {
    if (!isWorkEmailEvidence(item)) {
      continue;
    }

    if (getSupportResult(item) !== "supported_domain") {
      continue;
    }

    const domain = getEvidenceDomain(item);
    const matchedDomain = findActiveDomain(domain, approvedDomains);

    if (matchedDomain) {
      return { evidence: item, domain: matchedDomain };
    }
  }

  return null;
}

function getUnsupportedWorkEmailEvidence({
  evidence,
  approvedDomains,
}: {
  evidence: AirlineEmailAccessEvidence[];
  approvedDomains: AirlineEmailApprovedDomainRecord[];
}) {
  for (const item of sortWorkEmailEvidence(evidence)) {
    if (!isWorkEmailEvidence(item)) {
      continue;
    }

    const domain = getEvidenceDomain(item);
    const supportResult = getSupportResult(item);

    if (supportResult === "unsupported_domain") {
      return { evidence: item, domain };
    }

    if (
      supportResult === "supported_domain" &&
      domain &&
      !findActiveDomain(domain, approvedDomains)
    ) {
      return { evidence: item, domain };
    }
  }

  return null;
}

function getEvidenceTimestamp(item: AirlineEmailAccessEvidence) {
  return item.uploaded_at ?? null;
}

function sortWorkEmailEvidence(evidence: AirlineEmailAccessEvidence[]) {
  return [...evidence].sort((left, right) => {
    const rightTimestamp = getTimestampMs(getEvidenceTimestamp(right));
    const leftTimestamp = getTimestampMs(getEvidenceTimestamp(left));

    if (leftTimestamp != null || rightTimestamp != null) {
      if (leftTimestamp == null) {
        return 1;
      }

      if (rightTimestamp == null) {
        return -1;
      }

      if (leftTimestamp !== rightTimestamp) {
        return rightTimestamp - leftTimestamp;
      }
    }

    const leftDomain = getEvidenceDomain(left) ?? "";
    const rightDomain = getEvidenceDomain(right) ?? "";
    if (leftDomain !== rightDomain) {
      return leftDomain.localeCompare(rightDomain);
    }

    const leftRequestId = left.request_id ?? "";
    const rightRequestId = right.request_id ?? "";
    if (leftRequestId !== rightRequestId) {
      return leftRequestId.localeCompare(rightRequestId);
    }

    return (left.status ?? "").localeCompare(right.status ?? "");
  });
}

function getEvidenceForRequest(
  evidence: AirlineEmailAccessEvidence[],
  requestId: string | null | undefined,
) {
  if (!requestId) {
    return [];
  }

  return evidence.filter((item) => item.request_id === requestId);
}

function hasWorkEmailRequestProvenance({
  claim,
  requests,
}: {
  claim: AirlineEmailAccessClaim;
  requests: AirlineEmailAccessRequest[];
}) {
  if (claim.verification_method === "work_email") {
    return true;
  }

  return requests.some(
    (request) => request.id === claim.request_id && request.method === "work_email",
  );
}

function getWorkEmailClaimCandidates({
  approvedDomains,
  claims,
  evidence,
  requests,
  nowIso,
}: {
  approvedDomains: AirlineEmailApprovedDomainRecord[];
  claims: AirlineEmailAccessClaim[];
  evidence: AirlineEmailAccessEvidence[];
  requests: AirlineEmailAccessRequest[];
  nowIso: string;
}) {
  const candidates: AirlineEmailAccessCandidate[] = [];

  for (const claim of claims) {
    if (claim.claim_type !== "airline_worker") {
      continue;
    }

    if (!hasWorkEmailRequestProvenance({ claim, requests })) {
      continue;
    }

    const linkedEvidence = getEvidenceForRequest(evidence, claim.request_id);
    const supported = getSupportedWorkEmailEvidence({
      evidence: linkedEvidence,
      approvedDomains,
    });

    if (!supported) {
      continue;
    }

    const stableKey = [
      "claim",
      claim.request_id ?? "",
      claim.status ?? "",
      supported.domain.domain ?? "",
      claim.approved_at ?? "",
      claim.expires_at ?? "",
      claim.revoked_at ?? "",
    ].join("|");

    if (claim.revoked_at || claim.status === "revoked") {
      candidates.push(
        buildCandidate({
          status: "revoked",
          domain: supported.domain.domain,
          airline: supported.domain.airline,
          source: "legacy_claim_work_email",
          timestamp: claim.revoked_at ?? claim.approved_at ?? null,
          stableKey,
        }),
      );
      continue;
    }

    if (isExpired(claim.expires_at, nowIso) || claim.status === "expired") {
      candidates.push(
        buildCandidate({
          status: "expired",
          domain: supported.domain.domain,
          airline: supported.domain.airline,
          source: "legacy_claim_work_email",
          timestamp: claim.expires_at ?? claim.approved_at ?? null,
          stableKey,
        }),
      );
      continue;
    }

    if (claim.status === "approved") {
      candidates.push(
        buildCandidate({
          status: "verified",
          domain: supported.domain.domain,
          airline: supported.domain.airline,
          verifiedAt: claim.approved_at ?? null,
          source: "legacy_claim_work_email",
          timestamp: claim.approved_at ?? null,
          stableKey,
        }),
      );
    }
  }

  return sortCandidates(candidates);
}

function getWorkEmailRequestCandidates({
  approvedDomains,
  evidence,
  requests,
  nowIso,
}: {
  approvedDomains: AirlineEmailApprovedDomainRecord[];
  evidence: AirlineEmailAccessEvidence[];
  requests: AirlineEmailAccessRequest[];
  nowIso: string;
}) {
  const candidates: AirlineEmailAccessCandidate[] = [];

  for (const request of requests) {
    if (request.method !== "work_email") {
      continue;
    }

    const linkedEvidence = getEvidenceForRequest(evidence, request.id);
    const supported = getSupportedWorkEmailEvidence({
      evidence: linkedEvidence,
      approvedDomains,
    });

    if (!supported) {
      continue;
    }

    const stableKey = [
      "request",
      request.id,
      request.status ?? "",
      supported.domain.domain ?? "",
      request.reviewed_at ?? "",
      request.submitted_at ?? "",
      request.expires_at ?? "",
    ].join("|");

    if (request.status === "revoked") {
      candidates.push(
        buildCandidate({
          status: "revoked",
          domain: supported.domain.domain,
          airline: supported.domain.airline,
          source: "work_email",
          timestamp: request.reviewed_at ?? request.submitted_at ?? null,
          stableKey,
        }),
      );
      continue;
    }

    if (request.status === "expired" || isExpired(request.expires_at, nowIso)) {
      candidates.push(
        buildCandidate({
          status: "expired",
          domain: supported.domain.domain,
          airline: supported.domain.airline,
          source: "work_email",
          timestamp: request.expires_at ?? request.reviewed_at ?? request.submitted_at ?? null,
          stableKey,
        }),
      );
      continue;
    }

    if (request.status === "approved") {
      candidates.push(
        buildCandidate({
          status: "verified",
          domain: supported.domain.domain,
          airline: supported.domain.airline,
          verifiedAt: request.reviewed_at ?? request.submitted_at ?? null,
          source: "work_email",
          timestamp: request.reviewed_at ?? request.submitted_at ?? null,
          stableKey,
        }),
      );
      continue;
    }

    if (
      request.status === "submitted" ||
      request.status === "pending_review" ||
      request.status === "needs_resubmission"
    ) {
      candidates.push(
        buildCandidate({
          status: "pending",
          domain: supported.domain.domain,
          airline: supported.domain.airline,
          source: "work_email",
          timestamp: request.submitted_at ?? null,
          stableKey,
        }),
      );
    }
  }

  return sortCandidates(candidates);
}

function buildWorkEmailAccessCandidates({
  approvedDomains,
  claims,
  evidence,
  requests,
  nowIso,
}: {
  approvedDomains: AirlineEmailApprovedDomainRecord[];
  claims: AirlineEmailAccessClaim[];
  evidence: AirlineEmailAccessEvidence[];
  requests: AirlineEmailAccessRequest[];
  nowIso: string;
}) {
  return sortCandidates([
    ...getWorkEmailClaimCandidates({
      approvedDomains,
      claims,
      evidence,
      requests,
      nowIso,
    }),
    ...getWorkEmailRequestCandidates({
      approvedDomains,
      evidence,
      requests,
      nowIso,
    }),
  ]);
}

function isSameVerificationContext(
  left: AirlineEmailAccessCandidate,
  right: AirlineEmailAccessCandidate,
) {
  return left.domain != null && left.domain === right.domain;
}

function getCurrentCandidate(
  candidates: AirlineEmailAccessCandidate[],
) {
  const verified = candidates.find((candidate) => candidate.status === "verified") ?? null;

  if (verified) {
    const blocker = candidates.find(
      (candidate) =>
        (candidate.status === "revoked" || candidate.status === "expired") &&
        isSameVerificationContext(candidate, verified) &&
        compareCandidates(candidate, verified) < 0,
    );

    return blocker ?? verified;
  }

  return candidates[0] ?? null;
}

export function getCurrentAirlineEmailAccessState({
  approvedDomains,
  requests,
  evidence,
  claims,
  loadError,
  nowIso = new Date().toISOString(),
}: GetCurrentAirlineEmailAccessStateInput): AirlineEmailAccessState {
  if (loadError) {
    return buildState({ status: "not_ready" });
  }

  const candidates = buildWorkEmailAccessCandidates({
    approvedDomains,
    claims,
    evidence,
    requests,
    nowIso,
  });

  const currentCandidate = getCurrentCandidate(candidates);

  if (currentCandidate) {
    return candidateToState(currentCandidate);
  }

  const unsupported = getUnsupportedWorkEmailEvidence({
    evidence,
    approvedDomains,
  });

  if (unsupported) {
    return buildState({
      status: "unsupported_domain",
      domain: unsupported.domain,
      source: "work_email",
    });
  }

  return buildState({ status: "not_verified" });
}
