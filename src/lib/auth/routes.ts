export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  callback: "/auth/callback",
  resetPassword: "/reset-password",
  app: "/app",
  profile: "/app/profile",
  verification: "/app/verification",
  accessHold: "/app/access-hold",
  accessRestricted: "/app/access-restricted",
} as const;

export function resolvePostAuthPath(next?: string | null) {
  return sanitizeNextPath(next) ?? AUTH_ROUTES.app;
}

export function resolveAuthenticatedAppPath({
  next,
  hasCompletedProfile,
}: {
  next?: string | null;
  hasCompletedProfile: boolean;
}) {
  if (!hasCompletedProfile) {
    return AUTH_ROUTES.profile;
  }

  return resolvePostAuthPath(next);
}

export function sanitizeNextPath(next?: string | null) {
  if (!next) {
    return null;
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}
