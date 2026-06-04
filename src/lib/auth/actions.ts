"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_ROUTES, resolvePostAuthPath, sanitizeNextPath } from "./routes";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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

function toMessage(error: { message?: string } | null) {
  if (!error?.message) {
    return "Something went wrong. Please try again.";
  }

  return error.message;
}

async function getAuthOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? "http://localhost:3000";
}

export async function signInAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = sanitizeNextPath(getString(formData, "next"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        error: toMessage(error),
        next,
      }),
    );
  }

  redirect(resolvePostAuthPath(next));
}

export async function signUpAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.signup, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const origin = await getAuthOrigin();
  const emailRedirectTo = new URL(AUTH_ROUTES.callback, origin).toString();

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    redirect(
      buildRedirect(AUTH_ROUTES.signup, {
        error: toMessage(error),
      }),
    );
  }

  redirect(
    buildRedirect(AUTH_ROUTES.signup, {
      message:
        "Check your email to confirm your account. Account creation does not equal beta approval or worker verification.",
    }),
  );
}

export async function requestPasswordResetAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const email = getString(formData, "email");
  const origin = await getAuthOrigin();
  const redirectTo = new URL(
    `${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.resetPassword)}&mode=update`,
    origin,
  ).toString();

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        error: toMessage(error),
      }),
    );
  }

  redirect(
    buildRedirect(AUTH_ROUTES.resetPassword, {
      message: "Check your email for a password reset link.",
    }),
  );
}

export async function updatePasswordAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const password = getString(formData, "password");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(
      buildRedirect(AUTH_ROUTES.resetPassword, {
        mode: "update",
        error: toMessage(error),
      }),
    );
  }

  redirect(
    buildRedirect(AUTH_ROUTES.login, {
      message: "Your password has been updated. Please sign in.",
    }),
  );
}

export async function signOutAction() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(AUTH_ROUTES.login);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(AUTH_ROUTES.login);
}
