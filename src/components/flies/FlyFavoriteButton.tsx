"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, Loader2 } from "lucide-react";

interface FlyFavoriteButtonProps {
  canonicalFlyId: string;
  compact?: boolean;
}

export default function FlyFavoriteButton({
  canonicalFlyId,
  compact = false,
}: FlyFavoriteButtonProps) {
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

        if (!user) {
          if (!cancelled) setChecking(false);
          return;
        }
        if (!cancelled) setIsAuthenticated(true);

        // Multi-variant: 2+ rows possible per (user, canonical_fly). Use limit
        // and treat "any row is_favorite=true" as favorite. Wrap in try/catch/
        // finally so a thrown error doesn't leave the spinner running forever.
        const { data } = await supabase
          .from("user_fly_box")
          .select("is_favorite")
          .eq("user_id", user.id)
          .eq("canonical_fly_id", canonicalFlyId)
          .limit(10);

        const anyFavorited = (data ?? []).some(
          (r) => (r as { is_favorite?: boolean }).is_favorite === true,
        );
        if (!cancelled) setIsFavorite(anyFavorited);
      } catch (e) {
        console.warn("[FlyFavoriteButton] status check failed:", e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    checkStatus();
    return () => {
      cancelled = true;
    };
  }, [canonicalFlyId]);

  async function handleToggle() {
    if (!isAuthenticated) {
      window.location.href = "/login?redirect=/flies";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/fishing/fly-favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonicalFlyId,
          favorite: !isFavorite,
        }),
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);
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
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#21262D] bg-[#161B22] text-[#6E7681] ${
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
          : "border-[#21262D] bg-[#161B22] text-[#6E7681] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5"
      } ${compact ? "p-2" : "px-4 py-2.5 text-sm font-medium"} ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-all duration-200 ${
            isFavorite ? "fill-red-400" : ""
          }`}
        />
      )}
      {!compact && (isFavorite ? "Favorited" : "Favorite")}
    </button>
  );
}
