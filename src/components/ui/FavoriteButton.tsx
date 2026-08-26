"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

interface FavoriteButtonProps {
  entityType: string;
  entityId: string;
}

export default function FavoriteButton({ entityType, entityId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    const supabase = createClient();
    supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [isLoading, user, entityType, entityId]);

  async function toggleFavorite() {
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (isFavorite) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId);
      setIsFavorite(false);
    } else {
      await supabase.from("user_favorites").insert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
      });
      setIsFavorite(true);
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      className={`ea-focus-ring ${FOCUS_VISIBLE} rounded-instrument p-2.5 transition-all motion-reduce:transition-none ${
        isFavorite
          ? "bg-[var(--action)]/10 text-[var(--action)] hover:bg-[var(--action)]/20"
          : "bg-[var(--surface-raised)]/80 text-[var(--text-body)] hover:text-[var(--action)] hover:bg-[var(--surface-raised)]"
      } shadow-sm backdrop-blur-sm`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
    >
      <Heart
        className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
        aria-hidden
      />
    </button>
  );
}
