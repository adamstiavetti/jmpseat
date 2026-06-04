import type { User } from "@supabase/supabase-js";

import { AUTH_ROUTES, resolveAuthenticatedAppPath } from "../auth/routes";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  PROFILE_STORAGE_NOT_READY_MESSAGE,
  getProfileCompletionState,
  type AppProfileRecord,
  type ProfileCompletionState,
} from "./profile";

export type CurrentProfileContext = {
  authConfigured: boolean;
  user: User | null;
  profile: AppProfileRecord | null;
  completion: ProfileCompletionState;
  loadError: string | null;
};

type QueryProfileRow = {
  handle: string | null;
  display_name: string | null;
  claimed_airline: string | null;
  claimed_role: string | null;
  claimed_base: string | null;
  profile_completed_at: string | null;
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

export function getProfileStorageErrorMessage() {
  return PROFILE_STORAGE_NOT_READY_MESSAGE;
}

export async function getCurrentProfileContext(): Promise<CurrentProfileContext> {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      authConfigured: false,
      user: null,
      profile: null,
      completion: getProfileCompletionState(null),
      loadError: null,
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
      completion: getProfileCompletionState(null),
      loadError: userError?.message ?? null,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "handle, display_name, claimed_airline, claimed_role, claimed_base, profile_completed_at",
    )
    .eq("id", user.id)
    .maybeSingle<QueryProfileRow>();

  if (error) {
    return {
      authConfigured: true,
      user,
      profile: null,
      completion: getProfileCompletionState(null),
      loadError: getProfileStorageErrorMessage(),
    };
  }

  return {
    authConfigured: true,
    user,
    profile: data,
    completion: getProfileCompletionState(data),
    loadError: null,
  };
}

export function getAppEntryRedirect(
  context: CurrentProfileContext,
  nextPath: string,
) {
  if (!context.authConfigured) {
    return null;
  }

  if (!context.user) {
    return buildPath(AUTH_ROUTES.login, { next: nextPath });
  }

  if (context.loadError) {
    return buildPath(AUTH_ROUTES.profile, { error: context.loadError });
  }

  if (!context.completion.isComplete) {
    return AUTH_ROUTES.profile;
  }

  return null;
}

export async function resolveCurrentUserAppPath(next?: string | null) {
  const context = await getCurrentProfileContext();

  if (context.loadError) {
    return buildPath(AUTH_ROUTES.profile, { error: context.loadError });
  }

  return resolveAuthenticatedAppPath({
    next,
    hasCompletedProfile: context.completion.isComplete,
  });
}
