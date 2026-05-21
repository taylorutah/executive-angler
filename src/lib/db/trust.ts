import { cache } from "react";
import { createStaticClient } from "@/lib/supabase/static";

export const TRUST_WINDOW_DAYS = 7;

/**
 * Returns user_ids of accounts younger than TRUST_WINDOW_DAYS.
 *
 * These accounts are kept out of cross-user surfaces (presence feed, public
 * profile lists) and have stricter social caps (DM blocked, follows ≤ 5/day).
 * The window is short — a real user who confirms email and logs a session
 * within a week graduates automatically.
 *
 * Cached per request via React cache(). Safe to call many times.
 */
export const getUntrustedUserIds = cache(async (): Promise<string[]> => {
  const supabase = createStaticClient();
  const cutoff = new Date(Date.now() - TRUST_WINDOW_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .gte("created_at", cutoff);

  if (error) {
    console.error("[getUntrustedUserIds] Supabase error:", error);
    return [];
  }
  return (data ?? []).map((r) => r.user_id as string);
});

/**
 * True if a user account is older than the trust window.
 * Use for inline guards (DM send, kudos, follow rate cap).
 */
export function isTrusted(createdAtIso: string | null | undefined): boolean {
  if (!createdAtIso) return false;
  const ageMs = Date.now() - new Date(createdAtIso).getTime();
  return ageMs >= TRUST_WINDOW_DAYS * 86_400_000;
}
