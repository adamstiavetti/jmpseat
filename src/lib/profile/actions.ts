"use server";

import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../auth/routes";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  getProfileSaveErrorMessage,
  getProfileCompletionState,
  normalizeProfileInput,
} from "./profile";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function buildRedirect(path: string, params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export async function saveProfileAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.profile, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        next: AUTH_ROUTES.profile,
      }),
    );
  }

  const profile = normalizeProfileInput({
    handle: getString(formData, "handle"),
    display_name: getString(formData, "display_name"),
    claimed_airline: getString(formData, "claimed_airline"),
    claimed_role: getString(formData, "claimed_role"),
    claimed_base: getString(formData, "claimed_base"),
  });

  const completion = getProfileCompletionState(profile);

  if (!completion.isComplete) {
    redirect(
      buildRedirect(AUTH_ROUTES.profile, {
        error: "Complete all required profile fields before continuing.",
      }),
    );
  }

  const timestamp = new Date().toISOString();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      handle: profile.handle,
      display_name: profile.display_name,
      claimed_airline: profile.claimed_airline,
      claimed_role: profile.claimed_role,
      claimed_base: profile.claimed_base,
      profile_completed_at: timestamp,
      updated_at: timestamp,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    redirect(
      buildRedirect(AUTH_ROUTES.profile, {
        error: getProfileSaveErrorMessage(error),
      }),
    );
  }

  redirect(
    buildRedirect(AUTH_ROUTES.app, {
      message:
        "Profile saved. Self-declared profile completion does not equal beta approval or worker verification.",
    }),
  );
}
