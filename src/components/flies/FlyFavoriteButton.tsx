"use client";
/**
 * FlyFavoriteButton — toggles the favorite flag on a user's fly version.
 *
 * Post-fly-model-reset: any "fly is favorited" reduces to "user has at
 * least one configuration of this fly with is_favorite=true". Toggle
 * creates a default configuration if none exists, or flips the flag on
 * the first config.
 */
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, Loader2 } from "@/icons";

interface FlyFavoriteButtonProps {
  /** The fly's id in the `flies` table. */
  canonicalFlyId?: string;
  /** Back-compat alias; some callers pass flyPatternId — treated as fly id. */
  flyPatternId?: string;
  compact?: boolean;
}

export default function FlyFavoriteButton({
  canonicalFlyId,
  flyPatternId,
  compact = false,
}: FlyFavoriteButtonProps) {
  const flyId = canonicalFlyId ?? flyPatternId ?? null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkStatus() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (!cancelled) setChecking(false); return; }
        if (!cancelled) setIsAuthenticated(true);

        if (flyId) {
          const { data } = await supabase
            .from("user_fly_configurations")
            .select("is_favorite")
            .eq("user_id", user.id)
            .eq("fly_id", flyId)
            .limit(10);
          const anyFavorited = (data ?? []).some(
            (r) => (r as { is_favorite?: boolean }).is_favorite === true,
          );
          if (!cancelled) setIsFavorite(anyFavorited);
        }
      } catch (e) {
        console.warn("[FlyFavoriteButton] status check failed:", e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    checkStatus();
    return () => { cancelled = true; };
  }, [flyId]);

  async function handleToggle() {
    if (!isAuthenticated) {
      window.location.href = "/login?redirect=/flies";
      return;
    }
    if (!flyId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find an existing config (any) for this fly.
      const { data: existing } = await supabase
        .from("user_fly_configurations")
        .select("id, is_favorite")
        .eq("user_id", user.id)
        .eq("fly_id", flyId)
        .limit(1)
        .maybeSingle();

      const nextValue = !isFavorite;

      if (existing?.id) {
        const res = await fetch("/api/fishing/fly-configurations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, is_favorite: nextValue }),
        });
        if (res.ok) setIsFavorite(nextValue);
      } else if (nextValue) {
        // Create a default configuration favoring this fly.
        const res = await fetch("/api/fishing/fly-configurations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fly_id: flyId, is_favorite: true }),
        });
        if (res.ok) setIsFavorite(true);
      } else {
        // Unfavoriting and no config exists — nothing to do.
        setIsFavorite(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] text-[var(--text-meta)] ${
          compact ? "p-2" : "px-4 py-2.5 text-sm font-medium"
        }`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border transition-all duration-200 ${
        isFavorite
          ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-[var(--border-rule)] bg-[var(--surface-raised)] text-[var(--text-meta)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5"
      } ${compact ? "p-2" : "px-4 py-2.5 text-sm font-medium"} ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 transition-all duration-200 ${isFavorite ? "fill-red-400" : ""}`} />
      )}
      {!compact && (isFavorite ? "Favorited" : "Favorite")}
    </button>
  );
}
