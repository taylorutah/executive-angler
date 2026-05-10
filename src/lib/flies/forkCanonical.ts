/**
 * Shared fork helper — turn a canonical fly into a personal pattern (or
 * find the user's existing fork) and return the pattern id.
 *
 * Used by:
 *   - InYourBoxStrip "Open full editor" (forks from active variant's personalizations)
 *   - PatternHeaderActions "Tie your own version" (forks fresh, no personalizations)
 *   - PromoteToPatternPrompt (banner + inline)
 */
import { createClient } from "@/lib/supabase/client";
import type { Personalizations } from "@/lib/flies/resolveFlyForViewer";

export type ForkOutcome =
  | { kind: "ok"; patternId: string; isNewFork: boolean }
  | { kind: "needs_login"; redirectTo: string }
  | { kind: "error"; message: string };

/**
 * Find an existing user fork of this canonical, or create one. Does NOT
 * navigate — caller is responsible for routing on success.
 */
export async function findOrForkPersonalPattern(opts: {
  canonicalFlyId: string;
  personalizations?: Personalizations;
  /** Path to send user to after login if anonymous. */
  loginRedirectTo: string;
}): Promise<ForkOutcome> {
  const { canonicalFlyId, personalizations = {}, loginRedirectTo } = opts;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        kind: "needs_login",
        redirectTo: `/login?redirect=${encodeURIComponent(loginRedirectTo)}`,
      };
    }

    // Look for an existing fork first — avoid creating duplicates if the
    // user clicks twice or has already forked from elsewhere.
    const { data: existing } = await supabase
      .from("fly_patterns")
      .select("id")
      .eq("user_id", user.id)
      .eq("parent_canonical_id", canonicalFlyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      return { kind: "ok", patternId: existing.id, isNewFork: false };
    }

    const res = await fetch("/api/fishing/flies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "personalization",
        canonical_fly_id: canonicalFlyId,
        personalizations,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        kind: "error",
        message: data.error || "Couldn't fork. Try again.",
      };
    }
    const { pattern_id } = (await res.json()) as { pattern_id?: string };
    if (!pattern_id) {
      return {
        kind: "error",
        message: "Fork succeeded but no pattern id returned.",
      };
    }
    return { kind: "ok", patternId: pattern_id, isNewFork: true };
  } catch (e) {
    console.error("[findOrForkPersonalPattern]", e);
    return { kind: "error", message: "Network error" };
  }
}
