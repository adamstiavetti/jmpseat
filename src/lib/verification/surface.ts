import type {
  VerificationClaimStatus,
  VerificationEvidenceStatus,
  VerificationMethod,
  VerificationRequestStatus,
} from "./verification";

export type VerificationSurfaceRequest = {
  status: VerificationRequestStatus | string;
};

export type VerificationSurfaceClaim = {
  status: VerificationClaimStatus | string;
};

export type VerificationSurfaceEvidence = {
  status: VerificationEvidenceStatus | string;
};

export type VerificationSurfaceSummary =
  | {
      state: "no_request";
      title: string;
      description: string;
    }
  | {
      state: "pending";
      title: string;
      description: string;
    }
  | {
      state: "needs_resubmission";
      title: string;
      description: string;
    }
  | {
      state: "approved";
      title: string;
      description: string;
    };

export type WorkEmailSurfaceState =
  | {
      kind: "unsupported";
      title: string;
      description: string;
    }
  | {
      kind: "deferred";
      title: string;
      description: string;
    };

export function getVerificationSurfaceSummary({
  requests,
  claims,
}: {
  requests: VerificationSurfaceRequest[];
  claims: VerificationSurfaceClaim[];
  evidence: VerificationSurfaceEvidence[];
}): VerificationSurfaceSummary {
  const requestStatuses = requests.map((request) => request.status);
  const claimStatuses = claims.map((claim) => claim.status);

  if (requestStatuses.includes("needs_resubmission")) {
    return {
      state: "needs_resubmission",
      title: "Verification needs resubmission",
      description:
        "A reviewer or verification rule flagged your current submission as incomplete or unsafe, so you should expect to resubmit a safer verification method later.",
    };
  }

  if (claimStatuses.includes("approved")) {
    return {
      state: "approved",
      title: "Verification claim is approved",
      description:
        "At least one verification claim has been approved. Airline, role, and base claims may still remain separate or arrive later.",
    };
  }

  if (requestStatuses.length > 0) {
    return {
      state: "pending",
      title: "Verification is in progress",
      description:
        "A verification request exists, but no approved claim has been issued yet.",
    };
  }

  return {
    state: "no_request",
    title: "No verification request yet",
    description:
      "Your account can exist without worker verification. When verification opens for your path, this page will show request status and approved claims here.",
  };
}

export function getWorkEmailSurfaceState({
  approvedDomainCount,
}: {
  approvedDomainCount: number;
}): WorkEmailSurfaceState {
  if (approvedDomainCount <= 0) {
    return {
      kind: "unsupported",
      title: "No supported work-email domains are currently available",
      description:
        "Work-email verification is supported only where an approved airline-controlled domain has been configured. This beta does not expose any supported domains for self-serve verification yet.",
    };
  }

  return {
    kind: "deferred",
    title: "Work-email verification is a supported path",
    description:
      "Approved domains can support a later work-email verification flow, but this ticket keeps self-serve request creation deferred until the request/evidence submission flow is wired more fully.",
  };
}

export function formatVerificationMethodLabel(method: VerificationMethod | string | null | undefined) {
  if (method === "work_email") {
    return "Work email";
  }

  if (method === "redacted_badge_or_proof") {
    return "Redacted badge or proof";
  }

  return "Unknown method";
}

export function formatClaimDisplayValue({
  claimType,
  claimValue,
}: {
  claimType: string;
  claimValue: string | null;
}) {
  if (claimType === "airline_worker") {
    return "Airline worker";
  }

  if (claimValue) {
    return `${claimType}: ${claimValue}`;
  }

  return claimType;
}
