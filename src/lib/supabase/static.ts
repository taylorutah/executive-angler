import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for public read-only queries.
 * Does NOT use cookies() so it's compatible with static generation and ISR.
 * Only suitable for reading public content tables (RLS: select using (true)).
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
