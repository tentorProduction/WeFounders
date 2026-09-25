import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server-side Supabase access.
 *
 * Two entry points:
 *  • getServerSupabase() — the default. Cookie-bound, so it honours the
 *    caller's session and Row-Level Security. Throws a loud, actionable error
 *    when the project is not configured, because a missing backend is a
 *    deployment mistake rather than a runtime condition.
 *  • createClient() — kept as an alias so existing call sites stay valid.
 */

const MISSING_CONFIG =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example), then restart the dev server.";

export async function getServerSupabase(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) throw new Error(MISSING_CONFIG);

  // Built per request on purpose: the cookie adapter must read the current
  // request's cookie jar, and Next.js reuses module scope across requests.
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore: middleware and
          // route handlers refresh the session instead.
        }
      },
    },
  });
}

/** Alias retained for existing call sites. */
export async function createClient(): Promise<SupabaseClient> {
  return getServerSupabase();
}
