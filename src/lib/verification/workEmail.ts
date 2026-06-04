const WORK_EMAIL_VERIFICATION_METHOD = "work_email" as const;
const WORK_EMAIL_EVIDENCE_TYPE = "work_email" as const;

export const APPROVED_EMAIL_DOMAIN_STATUSES = [
  "active",
  "disabled",
] as const;

export type ApprovedEmailDomainStatus = (typeof APPROVED_EMAIL_DOMAIN_STATUSES)[number];

export type ApprovedEmailDomainRecord = {
  domain?: string | null;
  airline?: string | null;
  status?: string | null;
};

type SupportedDomainResult = {
  kind: "supported_domain";
  normalizedEmail: string;
  domain: string;
  airlineClaimValue: string | null;
  matchedDomain: {
    domain: string;
    airline: string | null;
    status: "active";
  };
};

type UnsupportedDomainResult = {
  kind: "unsupported_domain";
  normalizedEmail: string;
  domain: string;
};

type InvalidEmailResult = {
  kind: "invalid_email";
};

export type WorkEmailVerificationSupport =
  | SupportedDomainResult
  | UnsupportedDomainResult
  | InvalidEmailResult;

export function normalizeWorkEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function isWorkEmailShapeValid(email: string | null | undefined) {
  const normalized = normalizeWorkEmail(email);

  if (!normalized) {
    return false;
  }

  const atIndex = normalized.lastIndexOf("@");
  const dotIndex = normalized.lastIndexOf(".");

  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < normalized.length - 1;
}

export function extractWorkEmailDomain(email: string | null | undefined) {
  if (!isWorkEmailShapeValid(email)) {
    return null;
  }

  return normalizeWorkEmail(email)?.split("@")[1] ?? null;
}

export function normalizeApprovedEmailDomainStatus(
  status: string | null | undefined,
): ApprovedEmailDomainStatus | null {
  const normalized = status?.trim().toLowerCase();

  return (
    APPROVED_EMAIL_DOMAIN_STATUSES.find((candidate) => candidate === normalized) ?? null
  );
}

export function isApprovedEmailDomainActive(status: ApprovedEmailDomainStatus) {
  return status === "active";
}

export function matchApprovedEmailDomain(
  domain: string | null | undefined,
  records: ApprovedEmailDomainRecord[],
) {
  const normalizedDomain = domain?.trim().toLowerCase() ?? "";

  if (!normalizedDomain) {
    return null;
  }

  for (const record of records) {
    const recordDomain = record.domain?.trim().toLowerCase() ?? "";
    const recordStatus = normalizeApprovedEmailDomainStatus(record.status);

    if (
      recordDomain === normalizedDomain &&
      recordStatus &&
      isApprovedEmailDomainActive(recordStatus)
    ) {
      return {
        domain: recordDomain,
        airline: record.airline?.trim() || null,
        status: "active" as const,
      };
    }
  }

  return null;
}

export function getWorkEmailVerificationSupport({
  workEmail,
  approvedDomains,
}: {
  workEmail: string | null | undefined;
  approvedDomains: ApprovedEmailDomainRecord[];
}): WorkEmailVerificationSupport {
  const normalizedEmail = normalizeWorkEmail(workEmail);
  const domain = extractWorkEmailDomain(normalizedEmail);

  if (!normalizedEmail || !domain) {
    return { kind: "invalid_email" };
  }

  const matchedDomain = matchApprovedEmailDomain(domain, approvedDomains);

  if (!matchedDomain) {
    return {
      kind: "unsupported_domain",
      normalizedEmail,
      domain,
    };
  }

  return {
    kind: "supported_domain",
    normalizedEmail,
    domain,
    airlineClaimValue: matchedDomain.airline,
    matchedDomain,
  };
}

export function buildWorkEmailEvidenceMetadata({
  workEmail,
  loginEmail,
  matchedDomain,
}: {
  workEmail: string | null | undefined;
  loginEmail?: string | null | undefined;
  matchedDomain: {
    domain: string;
    airline: string | null;
    status: "active";
  } | null;
}) {
  const emailDomain = extractWorkEmailDomain(workEmail);
  const normalizedLoginEmail = normalizeWorkEmail(loginEmail);
  const normalizedWorkEmail = normalizeWorkEmail(workEmail);

  return {
    email_domain: emailDomain,
    airline: matchedDomain?.airline ?? null,
    login_email_separate:
      Boolean(normalizedLoginEmail) &&
      Boolean(normalizedWorkEmail) &&
      normalizedLoginEmail !== normalizedWorkEmail,
    supported_domain: Boolean(matchedDomain),
    verification_method: WORK_EMAIL_VERIFICATION_METHOD,
  };
}

export function buildWorkEmailVerificationDraft({
  userId,
  workEmail,
  loginEmail,
  approvedDomains,
  nowIso = new Date().toISOString(),
}: {
  userId: string;
  workEmail: string | null | undefined;
  loginEmail?: string | null | undefined;
  approvedDomains: ApprovedEmailDomainRecord[];
  nowIso?: string;
}) {
  const support = getWorkEmailVerificationSupport({
    workEmail,
    approvedDomains,
  });

  const matchedDomain =
    support.kind === "supported_domain" ? support.matchedDomain : null;

  const requestedClaimTypes =
    support.kind === "supported_domain" && support.airlineClaimValue
      ? ["airline_worker", "airline"]
      : ["airline_worker"];

  return {
    request: {
      user_id: userId,
      status: "submitted" as const,
      requested_claim_types: requestedClaimTypes,
      method: WORK_EMAIL_VERIFICATION_METHOD,
      submitted_at: nowIso,
    },
    evidence: {
      user_id: userId,
      evidence_type: WORK_EMAIL_EVIDENCE_TYPE,
      status: "submitted" as const,
      uploaded_at: nowIso,
      redaction_acknowledged: false,
      storage_bucket: null,
      storage_path: null,
      metadata: buildWorkEmailEvidenceMetadata({
        workEmail,
        loginEmail,
        matchedDomain,
      }),
    },
  };
}
