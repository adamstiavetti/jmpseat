import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseBrowserEnv } from "./config";

export const STORAGE_ADMIN_UNAVAILABLE_MESSAGE =
  "Controlled proof viewing is not available in this environment yet.";

export function getSupabaseServiceRoleKey(
  source: Record<string, string | undefined> = process.env,
) {
  return source.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
}

export function isStorageAdminConfigured(
  source: Record<string, string | undefined> = process.env,
) {
  const browserEnv = getSupabaseBrowserEnv(source);
  return browserEnv.enabled && Boolean(getSupabaseServiceRoleKey(source));
}

export function createStorageAdminClient(
  source: Record<string, string | undefined> = process.env,
) {
  const browserEnv = getSupabaseBrowserEnv(source);
  const serviceRoleKey = getSupabaseServiceRoleKey(source);

  if (!browserEnv.enabled || !serviceRoleKey) {
    throw new Error(STORAGE_ADMIN_UNAVAILABLE_MESSAGE);
  }

  return createClient(browserEnv.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
