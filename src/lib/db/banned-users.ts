import { cache } from "react";
import { createStaticClient } from "@/lib/supabase/static";

/**
 * Returns the user_ids of all banned accounts.
 *
 * Banned users' sessions, photos, reviews, follows, and public profile pages
 * are hidden from every public surface. Admin routes bypass this filter.
 *
 * Request-deduped via React cache(). Safe to call many times per request.
 */
export const getBannedUserIds = cache(async (): Promise<string[]> => {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("is_banned", true);

  if (error) {
    console.error("[getBannedUserIds] Supabase error:", error);
    return [];
  }

  return (data ?? []).map((row) => row.user_id as string);
});

/**
 * Formats a banned-user id list for use inside a PostgREST `.in.()` or
 * `.not.in.()` filter. Returns null if the list is empty — callers should
 * short-circuit and skip the filter entirely when null is returned
 * (PostgREST rejects empty `.in.()` expressions).
 */
export function bannedUserIdsForFilter(ids: string[]): string | null {
  if (ids.length === 0) return null;
  return `(${ids.join(",")})`;
}
