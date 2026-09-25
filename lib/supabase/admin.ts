import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server only.
 *
 * This key bypasses Row-Level Security, so it is used exclusively for the few
 * privileged paths that no user session may perform:
 *   • writing the promotions ledger and flipping a startup to featured after a
 *     payment gateway callback has been verified (TRD §4),
 *   • creating Storage buckets and upload URLs for verified founders.
 *
 * Never import this module from a Client Component, and never name the key
 * NEXT_PUBLIC_*.
 */

let admin: SupabaseClient | undefined;

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createAdminClient(): SupabaseClient {
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase service role is not configured. Set NEXT_PUBLIC_SUPABASE_URL " +
        "and SUPABASE_SERVICE_ROLE_KEY in .env (server-only)."
    );
  }

  admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return admin;
}
