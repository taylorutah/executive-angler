"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
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
      className={`ea-focus-ring ${FOCUS_VISIBLE} rounded-[var(--radius-md)] p-2 transition-colors motion-reduce:transition-none ${
        isFavorite
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--accent)] hover:border-[var(--border-strong)]"
      }`}
      aria-label={isFavorite ? "Remove from saved" : "Keep this"}
      aria-pressed={isFavorite}
    >
      <Icon
        name="hook"
        className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
        filled={isFavorite}
      />
    </button>
  );
}
