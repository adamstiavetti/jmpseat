const PRIVATE_APP_ROUTES = {
  login: "/login",
  app: "/app",
  profile: "/app/profile",
  accessHold: "/app/access-hold",
} as const;

type PrivateRouteKind =
  | "private-root"
  | "private-child"
  | "profile"
  | "access-hold";

type PrivateRouteContext = {
  authConfigured: boolean;
  user: { id: string } | null;
  hasCompletedProfile: boolean;
  betaActive: boolean;
  profileLoadError: string | null;
  betaLoadError: string | null;
};

type PrivateAppGateResult =
  | { kind: "allow" }
  | { kind: "redirect"; path: string };

function buildPath(path: string, params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function getPrivateAppGateResult({
  routeKind,
  nextPath,
  context,
}: {
  routeKind: PrivateRouteKind;
  nextPath: string;
  context: PrivateRouteContext;
}): PrivateAppGateResult {
  if (!context.authConfigured) {
    return { kind: "allow" };
  }

  if (!context.user) {
    return {
      kind: "redirect",
      path: buildPath(PRIVATE_APP_ROUTES.login, { next: nextPath }),
    };
  }

  if (routeKind === "profile") {
    return { kind: "allow" };
  }

  if (context.profileLoadError) {
    return {
      kind: "redirect",
      path: buildPath(PRIVATE_APP_ROUTES.profile, { error: context.profileLoadError }),
    };
  }

  if (!context.hasCompletedProfile) {
    return { kind: "redirect", path: PRIVATE_APP_ROUTES.profile };
  }

  if (routeKind === "access-hold") {
    if (context.betaActive) {
      return { kind: "redirect", path: PRIVATE_APP_ROUTES.app };
    }

    return { kind: "allow" };
  }

  if (context.betaLoadError) {
    return {
      kind: "redirect",
      path: buildPath(PRIVATE_APP_ROUTES.accessHold, { error: context.betaLoadError }),
    };
  }

  if (!context.betaActive) {
    return { kind: "redirect", path: PRIVATE_APP_ROUTES.accessHold };
  }

  return { kind: "allow" };
}

export type { PrivateRouteKind, PrivateRouteContext, PrivateAppGateResult };
