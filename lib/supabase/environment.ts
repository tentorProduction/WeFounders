/**
 * Single source of truth for "is the Supabase backend available?".
 * Works in both server and client modules — NEXT_PUBLIC_* values are inlined
 * at build time for the browser bundle.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
