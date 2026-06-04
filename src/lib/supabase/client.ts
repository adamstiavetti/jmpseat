import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseBrowserEnv } from "./config";

export function createClient() {
  const env = requireSupabaseBrowserEnv();

  return createBrowserClient(env.url, env.publishableKey);
}
