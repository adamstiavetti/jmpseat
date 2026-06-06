import type { AirlineEmailAccessState } from "../verification/airlineEmailAccess";
import type { JmpseatLaunchMode } from "./launchMode";

const PRIVATE_APP_ROUTES = {
  login: "/login",
  app: "/app",
  profile: "/app/profile",
  verification: "/app/verification",
  accessHold: "/app/access-hold",
} as const;

type PrivateRouteKind =
  | "private-root"
  | "private-child"
  | "profile"
  | "verification"
  | "access-hold";

type PrivateRouteContext = {
  authConfigured: boolean;
  user: { id: string } | null;
  hasCompletedProfile: boolean;
  launchMode: JmpseatLaunchMode;
  betaActive: boolean;
  operatorPrivateAppAccess: boolean;
  airlineEmailAccessState: AirlineEmailAccessState;
  profileLoadError: string | null;
  betaLoadError: string | null;
  airlineEmailLoadError: string | null;
};

type PrivateAppGateResult =
  | { kind: "allow"; accessSource: "normal_gate" | "operator_internal" }
  | { kind: "redirect"; path: string; accessSource: "blocked" };

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

function doesLaunchModeRequireBeta(mode: JmpseatLaunchMode) {
  return mode === "private_testing" || mode === "internal_test";
}

function doesLaunchModeRequireAirlineEmail(mode: JmpseatLaunchMode) {
  void mode;
  return true;
}

function getAccessHoldError(context: PrivateRouteContext) {
  if (doesLaunchModeRequireBeta(context.launchMode) && context.betaLoadError) {
    return context.betaLoadError;
  }

  return context.airlineEmailLoadError;
}

function hasBetaAccessForLaunchMode(context: PrivateRouteContext) {
  return !doesLaunchModeRequireBeta(context.launchMode) || context.betaActive;
}

function hasAirlineEmailAccessForLaunchMode(context: PrivateRouteContext) {
  return (
    !doesLaunchModeRequireAirlineEmail(context.launchMode) ||
    context.airlineEmailAccessState.airlineEmailVerified
  );
}

function hasOperatorPrivateAppAccessForLaunchMode(context: PrivateRouteContext) {
  return (
    context.operatorPrivateAppAccess &&
    (context.launchMode === "private_testing" || context.launchMode === "internal_test")
  );
}

function shouldHoldForAccess(context: PrivateRouteContext) {
  if (hasOperatorPrivateAppAccessForLaunchMode(context)) {
    return false;
  }

  return (
    (doesLaunchModeRequireBeta(context.launchMode) &&
      (Boolean(context.betaLoadError) || !hasBetaAccessForLaunchMode(context))) ||
    Boolean(context.airlineEmailLoadError) ||
    !hasAirlineEmailAccessForLaunchMode(context)
  );
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
    return { kind: "allow", accessSource: "normal_gate" };
  }

  if (!context.user) {
    return {
      kind: "redirect",
      path: buildPath(PRIVATE_APP_ROUTES.login, { next: nextPath }),
      accessSource: "blocked",
    };
  }

  if (routeKind === "profile") {
    return { kind: "allow", accessSource: "normal_gate" };
  }

  if (context.profileLoadError) {
    return {
      kind: "redirect",
      path: buildPath(PRIVATE_APP_ROUTES.profile, { error: context.profileLoadError }),
      accessSource: "blocked",
    };
  }

  if (!context.hasCompletedProfile) {
    return { kind: "redirect", path: PRIVATE_APP_ROUTES.profile, accessSource: "blocked" };
  }

  if (routeKind === "verification") {
    return { kind: "allow", accessSource: "normal_gate" };
  }

  if (routeKind === "access-hold") {
    if (!shouldHoldForAccess(context)) {
      return { kind: "redirect", path: PRIVATE_APP_ROUTES.app, accessSource: "blocked" };
    }

    return { kind: "allow", accessSource: "normal_gate" };
  }

  if (doesLaunchModeRequireBeta(context.launchMode) && context.betaLoadError) {
    return {
      kind: "redirect",
      path: buildPath(PRIVATE_APP_ROUTES.accessHold, {
        error: getAccessHoldError(context),
      }),
      accessSource: "blocked",
    };
  }

  if (!hasBetaAccessForLaunchMode(context)) {
    if (hasOperatorPrivateAppAccessForLaunchMode(context)) {
      return { kind: "allow", accessSource: "operator_internal" };
    }

    return { kind: "redirect", path: PRIVATE_APP_ROUTES.accessHold, accessSource: "blocked" };
  }

  if (context.airlineEmailLoadError) {
    return {
      kind: "redirect",
      path: buildPath(PRIVATE_APP_ROUTES.accessHold, {
        error: context.airlineEmailLoadError,
      }),
      accessSource: "blocked",
    };
  }

  if (!hasAirlineEmailAccessForLaunchMode(context)) {
    if (hasOperatorPrivateAppAccessForLaunchMode(context)) {
      return { kind: "allow", accessSource: "operator_internal" };
    }

    return { kind: "redirect", path: PRIVATE_APP_ROUTES.accessHold, accessSource: "blocked" };
  }

  return { kind: "allow", accessSource: "normal_gate" };
}

export type { PrivateRouteKind, PrivateRouteContext, PrivateAppGateResult };

export function getPrivateAccessSource(gate: PrivateAppGateResult) {
  return gate.accessSource;
}

export function getPrivateRouteAuditResult(
  gate: PrivateAppGateResult,
  context: PrivateRouteContext,
) {
  if (gate.kind === "allow") {
    return context.betaLoadError || context.profileLoadError || context.airlineEmailLoadError
      ? "storage_not_ready"
      : "allowed";
  }

  if (gate.path.startsWith(PRIVATE_APP_ROUTES.login)) {
    return "redirect_login";
  }

  if (gate.path.startsWith(PRIVATE_APP_ROUTES.profile)) {
    return context.profileLoadError ? "storage_not_ready" : "redirect_profile";
  }

  if (gate.path.startsWith(PRIVATE_APP_ROUTES.accessHold)) {
    return context.betaLoadError || context.airlineEmailLoadError
      ? "storage_not_ready"
      : "redirect_access_hold";
  }

  return "redirect";
}
