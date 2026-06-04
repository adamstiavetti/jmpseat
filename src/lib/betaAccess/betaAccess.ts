const APP_ROUTES = {
  app: "/app",
  profile: "/app/profile",
  accessHold: "/app/access-hold",
} as const;

export const BETA_ACCESS_STATUSES = [
  "none",
  "waitlisted",
  "invited",
  "active",
  "denied",
  "revoked",
  "paused",
] as const;

export const BETA_ACCESS_DB_STATUSES = BETA_ACCESS_STATUSES.filter(
  (status) => status !== "none",
);

export type BetaAccessStatus = (typeof BETA_ACCESS_STATUSES)[number];

export type BetaAccessRecord = {
  status?: string | null;
  source?: string | null;
  invited_email?: string | null;
  reason?: string | null;
  approved_at?: string | null;
  revoked_at?: string | null;
};

export const BETA_ACCESS_ACTIVE_MESSAGE =
  "Beta access is active. Private app entry still lands in the current placeholder shell until later epochs add real member features.";

export const BETA_ACCESS_STORAGE_NOT_READY_MESSAGE =
  "Beta access storage is not ready yet. Apply the beta_access migration to this Supabase project before using invite-only beta gating.";

export function normalizeBetaAccessStatus(
  status: string | null | undefined,
): BetaAccessStatus {
  const normalized = status?.trim().toLowerCase();

  return (
    BETA_ACCESS_STATUSES.find((candidate) => candidate === normalized) ?? "none"
  );
}

export function getBetaAccessState(
  record: BetaAccessRecord | null | undefined,
): BetaAccessStatus {
  return normalizeBetaAccessStatus(record?.status);
}

export function isBetaAccessActive(status: BetaAccessStatus) {
  return status === "active";
}

export function getPrivateAppPathForState({
  hasCompletedProfile,
  betaStatus,
  next,
}: {
  hasCompletedProfile: boolean;
  betaStatus: BetaAccessStatus;
  next?: string | null;
}) {
  if (!hasCompletedProfile) {
    return APP_ROUTES.profile;
  }

  if (!isBetaAccessActive(betaStatus)) {
    return APP_ROUTES.accessHold;
  }

  return sanitizeNextPath(next) ?? APP_ROUTES.app;
}

function sanitizeNextPath(next?: string | null) {
  if (!next) {
    return null;
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}
