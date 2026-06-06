import type { User } from "@supabase/supabase-js";

import { filterOperatorScopes } from "../admin/access";
import { AUTH_ROUTES, sanitizeNextPath } from "../auth/routes";
import { getPrivateAppGateResult } from "../privateApp/access";
import { getJmpseatLaunchMode, type JmpseatLaunchMode } from "../privateApp/launchMode";
import { getProfileCompletionState, type AppProfileRecord } from "../profile/profile";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  getCurrentAirlineEmailAccessState,
  type AirlineEmailAccessState,
} from "../verification/airlineEmailAccess";
import {
  BETA_ACCESS_STORAGE_NOT_READY_MESSAGE,
  getBetaAccessState,
  isBetaAccessActive,
  type BetaAccessRecord,
  type BetaAccessStatus,
} from "./betaAccess";

const AIRLINE_EMAIL_ACCESS_STORAGE_NOT_READY_MESSAGE =
  "Airline-email verification storage is not ready yet. Apply the verification foundation migration before using airline-email app access gates.";

type QueryProfileRow = {
  handle: string | null;
  display_name: string | null;
  claimed_airline: string | null;
  claimed_role: string | null;
  claimed_base: string | null;
  profile_completed_at: string | null;
};

type QueryBetaAccessRow = {
  status: string | null;
  source: string | null;
  invited_email: string | null;
  reason: string | null;
  approved_at: string | null;
  revoked_at: string | null;
  invite_code_id: string | null;
};

type QueryApprovedEmailDomainRow = {
  domain: string | null;
  airline: string | null;
  status: string | null;
};

type QueryVerificationRequestRow = {
  id: string;
  method: string | null;
  status: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
};

type QueryVerificationEvidenceRow = {
  request_id: string | null;
  evidence_type: string | null;
  status: string | null;
  uploaded_at: string | null;
  metadata: Record<string, unknown> | null;
};

type QueryVerificationClaimRow = {
  request_id: string | null;
  claim_type: string | null;
  claim_value: string | null;
  status: string | null;
  verification_method: string | null;
  approved_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};

export type CurrentAppAccessContext = {
  authConfigured: boolean;
  user: User | null;
  profile: AppProfileRecord | null;
  betaAccess: BetaAccessRecord | null;
  hasCompletedProfile: boolean;
  launchMode: JmpseatLaunchMode;
  betaStatus: BetaAccessStatus;
  betaActive: boolean;
  operatorPrivateAppAccess: boolean;
  airlineEmailAccessState: AirlineEmailAccessState;
  profileLoadError: string | null;
  betaLoadError: string | null;
  airlineEmailLoadError: string | null;
};

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

export function getBetaAccessStorageErrorMessage() {
  return BETA_ACCESS_STORAGE_NOT_READY_MESSAGE;
}

function getAirlineEmailAccessStorageErrorMessage() {
  return AIRLINE_EMAIL_ACCESS_STORAGE_NOT_READY_MESSAGE;
}

function getUnavailableAirlineEmailAccessState() {
  return getCurrentAirlineEmailAccessState({
    approvedDomains: [],
    requests: [],
    evidence: [],
    claims: [],
    loadError: getAirlineEmailAccessStorageErrorMessage(),
  });
}

export async function getCurrentAppAccessContext(): Promise<CurrentAppAccessContext> {
  const env = getSupabaseBrowserEnv();
  const launchMode = getJmpseatLaunchMode();

  if (!env.enabled) {
    return {
      authConfigured: false,
      user: null,
      profile: null,
      betaAccess: null,
      hasCompletedProfile: false,
      launchMode,
      betaStatus: "none",
      betaActive: false,
      operatorPrivateAppAccess: false,
      airlineEmailAccessState: getUnavailableAirlineEmailAccessState(),
      profileLoadError: null,
      betaLoadError: null,
      airlineEmailLoadError: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authConfigured: true,
      user: null,
      profile: null,
      betaAccess: null,
      hasCompletedProfile: false,
      launchMode,
      betaStatus: "none",
      betaActive: false,
      operatorPrivateAppAccess: false,
      airlineEmailAccessState: getUnavailableAirlineEmailAccessState(),
      profileLoadError: userError?.message ?? null,
      betaLoadError: null,
      airlineEmailLoadError: null,
    };
  }

  const [
    profileResult,
    betaResult,
    approvedDomainsResult,
    verificationRequestsResult,
    verificationEvidenceResult,
    verificationClaimsResult,
    operatorScopesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "handle, display_name, claimed_airline, claimed_role, claimed_base, profile_completed_at",
      )
      .eq("id", user.id)
      .maybeSingle<QueryProfileRow>(),
    supabase
      .from("beta_access")
      .select("status, source, invited_email, reason, approved_at, revoked_at, invite_code_id")
      .eq("user_id", user.id)
      .maybeSingle<QueryBetaAccessRow>(),
    supabase
      .from("approved_email_domains")
      .select("domain, airline, status")
      .eq("status", "active")
      .returns<QueryApprovedEmailDomainRow[]>(),
    supabase
      .from("verification_requests")
      .select("id, method, status, submitted_at, reviewed_at, expires_at")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .returns<QueryVerificationRequestRow[]>(),
    supabase
      .from("verification_evidence")
      .select("request_id, evidence_type, status, uploaded_at, metadata")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false })
      .returns<QueryVerificationEvidenceRow[]>(),
    supabase
      .from("verification_claims")
      .select("request_id, claim_type, claim_value, status, verification_method, approved_at, expires_at, revoked_at")
      .eq("user_id", user.id)
      .order("approved_at", { ascending: false })
      .returns<QueryVerificationClaimRow[]>(),
    supabase.rpc("current_user_operator_scopes"),
  ]);

  const operatorScopes = filterOperatorScopes(
    Array.isArray(operatorScopesResult.data) ? operatorScopesResult.data : [],
  );

  const profileCompletion = getProfileCompletionState(profileResult.data);
  const betaStatus = betaResult.error ? "none" : getBetaAccessState(betaResult.data);
  const airlineEmailLoadError =
    approvedDomainsResult.error ||
    verificationRequestsResult.error ||
    verificationEvidenceResult.error ||
    verificationClaimsResult.error
      ? getAirlineEmailAccessStorageErrorMessage()
      : null;
  const airlineEmailAccessState = getCurrentAirlineEmailAccessState({
    approvedDomains: approvedDomainsResult.data ?? [],
    requests: verificationRequestsResult.data ?? [],
    evidence: verificationEvidenceResult.data ?? [],
    claims: verificationClaimsResult.data ?? [],
    profile: profileResult.data,
    loginEmail: user.email ?? null,
    betaActive: isBetaAccessActive(betaStatus),
    loadError: airlineEmailLoadError,
  });

  return {
    authConfigured: true,
    user,
    profile: profileResult.data ?? null,
    betaAccess: betaResult.data ?? null,
    hasCompletedProfile: profileResult.error ? false : profileCompletion.isComplete,
    launchMode,
    betaStatus,
    betaActive: isBetaAccessActive(betaStatus),
    operatorPrivateAppAccess: operatorScopes.length > 0,
    airlineEmailAccessState,
    profileLoadError: profileResult.error
      ? "Profile storage is not ready yet. Apply the profiles migration to this Supabase project before using account profiles."
      : null,
    betaLoadError: betaResult.error ? getBetaAccessStorageErrorMessage() : null,
    airlineEmailLoadError,
  };
}

export function getAppEntryRedirect(
  context: CurrentAppAccessContext,
  nextPath: string,
) {
  const gate = getPrivateAppGateResult({
    routeKind: "private-root",
    nextPath,
    context,
  });

  return gate.kind === "redirect" ? gate.path : null;
}

export async function resolveCurrentUserAppPath(next?: string | null) {
  const context = await getCurrentAppAccessContext();

  if (!context.user) {
    return buildPath(AUTH_ROUTES.login, {
      next: next ?? AUTH_ROUTES.app,
    });
  }

  await recordSecurityEvent({
    userId: context.user.id,
    eventType: "beta_access.checked",
    route: AUTH_ROUTES.app,
    result: context.betaStatus,
    metadata: {
      has_completed_profile: context.hasCompletedProfile,
      next_path: next ?? AUTH_ROUTES.app,
    },
  });

  if (context.profileLoadError) {
    return buildPath(AUTH_ROUTES.profile, { error: context.profileLoadError });
  }

  const gate = getPrivateAppGateResult({
    routeKind: "private-root",
    nextPath: next ?? AUTH_ROUTES.app,
    context,
  });

  if (gate.kind === "redirect") {
    return gate.path;
  }

  return sanitizeNextPath(next) ?? AUTH_ROUTES.app;
}
