import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabaseBrowserEnv } from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  const env = requireSupabaseBrowserEnv();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies directly.
          // Proxy is responsible for refresh persistence during normal navigation.
        }
      },
    },
  });
}
