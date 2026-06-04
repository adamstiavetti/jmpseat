export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  callback: "/auth/callback",
  resetPassword: "/reset-password",
  app: "/app",
  profile: "/app/profile",
  accessHold: "/app/access-hold",
  accessRestricted: "/app/access-restricted",
} as const;

export function resolvePostAuthPath(next?: string | null) {
  return sanitizeNextPath(next) ?? AUTH_ROUTES.app;
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
