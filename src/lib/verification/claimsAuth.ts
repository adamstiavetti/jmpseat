export type ClaimRequirement =
  | { claimType: "airline_worker" }
  | { claimType: "airline"; claimValue: string }
  | { claimType: "role"; claimValue: string }
  | { claimType: "base"; claimValue: string };

export type VerificationAuthorizationClaim = {
  claim_type: string;
  claim_value: string | null;
  status: string;
  expires_at?: string | null;
  revoked_at?: string | null;
};

export type ClaimAuthorizationResult = {
  allowed: boolean;
  matchedRequirements: ClaimRequirement[];
  missingRequirements: ClaimRequirement[];
  denyReasons: string[];
};

function normalizeClaimValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

function isClaimExpired(claim: VerificationAuthorizationClaim, nowIso: string) {
  if (!claim.expires_at) {
    return false;
  }

  return new Date(claim.expires_at).getTime() <= new Date(nowIso).getTime();
}

function isClaimRevoked(claim: VerificationAuthorizationClaim) {
  return Boolean(claim.revoked_at);
}

function isActiveApprovedClaim(
  claim: VerificationAuthorizationClaim,
  nowIso: string,
) {
  return (
    claim.status === "approved" &&
    !isClaimExpired(claim, nowIso) &&
    !isClaimRevoked(claim)
  );
}

function doesClaimSatisfyRequirement(
  claim: VerificationAuthorizationClaim,
  requirement: ClaimRequirement,
  nowIso: string,
) {
  if (!isActiveApprovedClaim(claim, nowIso)) {
    return false;
  }

  if (claim.claim_type !== requirement.claimType) {
    return false;
  }

  if (!("claimValue" in requirement)) {
    return true;
  }

  return (
    normalizeClaimValue(claim.claim_value) ===
    normalizeClaimValue(requirement.claimValue)
  );
}

function getRequirementDenyReason(requirement: ClaimRequirement) {
  if (!("claimValue" in requirement)) {
    return `Missing approved active ${requirement.claimType} claim.`;
  }

  return `Missing approved active ${requirement.claimType} claim for ${requirement.claimValue}.`;
}

export function evaluateClaimAuthorization({
  requirements,
  claims,
  nowIso = new Date().toISOString(),
}: {
  requirements: ClaimRequirement[];
  claims: VerificationAuthorizationClaim[];
  nowIso?: string;
}): ClaimAuthorizationResult {
  const matchedRequirements: ClaimRequirement[] = [];
  const missingRequirements: ClaimRequirement[] = [];
  const denyReasons: string[] = [];

  for (const requirement of requirements) {
    const matched = claims.some((claim) =>
      doesClaimSatisfyRequirement(claim, requirement, nowIso),
    );

    if (matched) {
      matchedRequirements.push(requirement);
      continue;
    }

    missingRequirements.push(requirement);
    denyReasons.push(getRequirementDenyReason(requirement));
  }

  return {
    allowed: missingRequirements.length === 0,
    matchedRequirements,
    missingRequirements,
    denyReasons,
  };
}

export function buildBroadVerifiedWorkerRequirements(): ClaimRequirement[] {
  return [{ claimType: "airline_worker" }];
}

export function buildAirlineRoomRequirements(
  airline: string,
): ClaimRequirement[] {
  return [
    { claimType: "airline_worker" },
    { claimType: "airline", claimValue: airline },
  ];
}

export function buildBaseAreaRequirements(base: string): ClaimRequirement[] {
  return [
    { claimType: "airline_worker" },
    { claimType: "base", claimValue: base },
  ];
}

export function buildRoleAreaRequirements(role: string): ClaimRequirement[] {
  return [
    { claimType: "airline_worker" },
    { claimType: "role", claimValue: role },
  ];
}
