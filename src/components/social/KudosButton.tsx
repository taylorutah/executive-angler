"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart } from "lucide-react";

interface KudosButtonProps {
  sessionId: string;
  initialCount: number;
  initialLiked?: boolean;
  compact?: boolean;
}

export function KudosButton({
  sessionId,
  initialCount,
  initialLiked = false,
  compact = false,
}: KudosButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Check if already liked
        supabase
          .from("session_likes")
          .select("id")
          .eq("session_id", sessionId)
          .eq("user_id", data.user.id)
          .maybeSingle()
          .then(({ data: like }) => {
            if (like) setLiked(true);
          });
      }
    });
  }, [sessionId]);

  async function toggleKudos() {
    if (!userId || loading) return;
    setLoading(true);

    const supabase = createClient();

    if (liked) {
      await supabase
        .from("session_likes")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", userId);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase
        .from("session_likes")
        .insert({ session_id: sessionId, user_id: userId });
      setLiked(true);
      setCount((c) => c + 1);
    }

    setLoading(false);
  }

  if (!userId) {
    // Not logged in — show static count only
    return (
      <div className="flex items-center gap-1 text-[#484F58]">
        <Heart className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {count > 0 && (
          <span className={`font-['IBM_Plex_Mono'] ${compact ? "text-[10px]" : "text-xs"}`}>
            {count}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={toggleKudos}
      disabled={loading}
      className={`flex items-center gap-1 transition-colors duration-150 ${
        liked
          ? "text-[#DA3633]"
          : "text-[#484F58] hover:text-[#DA3633]"
      } ${loading ? "opacity-50" : ""}`}
      aria-label={liked ? "Remove kudos" : "Give kudos"}
    >
      <Heart
        className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
        fill={liked ? "currentColor" : "none"}
      />
      {count > 0 && (
        <span className={`font-['IBM_Plex_Mono'] ${compact ? "text-[10px]" : "text-xs"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
