import type { User } from "@supabase/supabase-js";

import { AUTH_ROUTES } from "../auth/routes";
import { getProfileCompletionState, type AppProfileRecord } from "../profile/profile";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  BETA_ACCESS_STORAGE_NOT_READY_MESSAGE,
  getBetaAccessState,
  getPrivateAppPathForState,
  isBetaAccessActive,
  type BetaAccessRecord,
  type BetaAccessStatus,
} from "./betaAccess";

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
};

export type CurrentAppAccessContext = {
  authConfigured: boolean;
  user: User | null;
  profile: AppProfileRecord | null;
  betaAccess: BetaAccessRecord | null;
  hasCompletedProfile: boolean;
  betaStatus: BetaAccessStatus;
  betaActive: boolean;
  profileLoadError: string | null;
  betaLoadError: string | null;
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

export async function getCurrentAppAccessContext(): Promise<CurrentAppAccessContext> {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      authConfigured: false,
      user: null,
      profile: null,
      betaAccess: null,
      hasCompletedProfile: false,
      betaStatus: "none",
      betaActive: false,
      profileLoadError: null,
      betaLoadError: null,
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
      betaStatus: "none",
      betaActive: false,
      profileLoadError: userError?.message ?? null,
      betaLoadError: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "handle, display_name, claimed_airline, claimed_role, claimed_base, profile_completed_at",
    )
    .eq("id", user.id)
    .maybeSingle<QueryProfileRow>();

  const profileCompletion = getProfileCompletionState(profile);

  const { data: betaAccess, error: betaError } = await supabase
    .from("beta_access")
    .select("status, source, invited_email, reason, approved_at, revoked_at")
    .eq("user_id", user.id)
    .maybeSingle<QueryBetaAccessRow>();

  const betaStatus = betaError ? "none" : getBetaAccessState(betaAccess);

  return {
    authConfigured: true,
    user,
    profile: profile ?? null,
    betaAccess: betaAccess ?? null,
    hasCompletedProfile: profileError ? false : profileCompletion.isComplete,
    betaStatus,
    betaActive: isBetaAccessActive(betaStatus),
    profileLoadError: profileError
      ? "Profile storage is not ready yet. Apply the profiles migration to this Supabase project before using account profiles."
      : null,
    betaLoadError: betaError ? getBetaAccessStorageErrorMessage() : null,
  };
}

export function getAppEntryRedirect(
  context: CurrentAppAccessContext,
  nextPath: string,
) {
  if (!context.authConfigured) {
    return null;
  }

  if (!context.user) {
    return buildPath(AUTH_ROUTES.login, { next: nextPath });
  }

  if (context.profileLoadError) {
    return buildPath(AUTH_ROUTES.profile, { error: context.profileLoadError });
  }

  if (!context.hasCompletedProfile) {
    return AUTH_ROUTES.profile;
  }

  if (context.betaLoadError) {
    return buildPath(AUTH_ROUTES.accessHold, { error: context.betaLoadError });
  }

  if (!context.betaActive) {
    return AUTH_ROUTES.accessHold;
  }

  return null;
}

export async function resolveCurrentUserAppPath(next?: string | null) {
  const context = await getCurrentAppAccessContext();

  if (!context.user) {
    return buildPath(AUTH_ROUTES.login, {
      next: next ?? AUTH_ROUTES.app,
    });
  }

  if (context.profileLoadError) {
    return buildPath(AUTH_ROUTES.profile, { error: context.profileLoadError });
  }

  if (context.betaLoadError && context.hasCompletedProfile) {
    return buildPath(AUTH_ROUTES.accessHold, { error: context.betaLoadError });
  }

  return getPrivateAppPathForState({
    next,
    hasCompletedProfile: context.hasCompletedProfile,
    betaStatus: context.betaStatus,
  });
}
