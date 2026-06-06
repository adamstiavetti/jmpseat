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
    }
  | {
      state: "rejected";
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
      kind: "available";
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
      title: "Legacy verification needs follow-up",
      description:
        "A legacy request was marked incomplete or unsafe. Proof upload remains frozen for forward access, and future general eligibility should use confirmed approved airline employee email.",
    };
  }

  if (claimStatuses.includes("approved")) {
    return {
      state: "approved",
      title: "Historical verification claim is approved",
      description:
        "At least one historical verification claim has been approved. Future general app eligibility should still move through confirmed approved airline employee email, and restricted boards remain separate.",
    };
  }

  if (requestStatuses.includes("rejected")) {
    return {
      state: "rejected",
      title: "Legacy verification request was rejected",
      description:
        "A prior request was rejected. Forward access should use airline-email eligibility instead of treating proof review as the launch path.",
    };
  }

  if (requestStatuses.length > 0) {
    return {
      state: "pending",
      title: "Legacy verification request is in progress",
      description:
        "A verification request exists, but no approved claim has been issued yet. This status remains historical and does not replace the airline-email access model.",
    };
  }

  return {
    state: "no_request",
    title: "No airline-email access request yet",
    description:
      "Your account can exist without a legacy proof request. General app eligibility is moving toward confirmed approved airline employee email, not badge or proof upload.",
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
        "Airline-email verification is supported only where an approved airline-controlled domain has been configured. No configured domain is available for self-serve request tracking yet.",
    };
  }

  return {
    kind: "available",
    title: "Airline-email confirmation is available for supported domains",
    description:
      "Approved domains can receive a confirmation email here. Confirmation verifies control of the email address only and does not issue role, base, or restricted-board claims.",
  };
}

export function formatVerificationMethodLabel(method: VerificationMethod | string | null | undefined) {
  if (method === "work_email") {
    return "Airline employee email";
  }

  if (method === "redacted_badge_or_proof") {
    return "Legacy proof review";
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
