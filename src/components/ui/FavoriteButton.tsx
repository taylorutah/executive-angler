"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface FavoriteButtonProps {
  entityType: string;
  entityId: string;
}

export default function FavoriteButton({ entityType, entityId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkFavorite();
  }, [entityType, entityId]);

  async function checkFavorite() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .single();

    setIsFavorite(!!data);
  }

  async function toggleFavorite() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setLoading(true);

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
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2.5 rounded-full transition-all ${
        isFavorite
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white"
      } shadow-sm backdrop-blur-sm`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
      />
    </button>
  );
}
