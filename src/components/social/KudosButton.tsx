"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSessionOwnerId(supabase: any, sessionId: string): Promise<string | null> {
  const { data } = await supabase
    .from("fishing_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .maybeSingle();
  return data?.user_id ?? null;
}

interface KudosButtonProps {
  sessionId: string;
  initialCount: number;
  initialLiked?: boolean;
  compact?: boolean;
  sessionOwnerId?: string;
}

export function KudosButton({
  sessionId,
  initialCount,
  initialLiked = false,
  compact = false,
  sessionOwnerId,
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

      // Create notification for session owner (if not self)
      const ownerId = sessionOwnerId || await getSessionOwnerId(supabase, sessionId);
      if (ownerId && ownerId !== userId) {
        await supabase.from("notifications").insert({
          recipient_id: ownerId,
          actor_id: userId,
          type: "kudos",
          session_id: sessionId,
          message: null,
        });

        // Trigger email notification (fire and forget)
        fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "like",
            recipientId: ownerId,
            actorId: userId,
            sessionId,
          }),
        }).catch(() => {});
      }
    }

    setLoading(false);
  }

  if (!userId) {
    // Not logged in — show static count only
    return (
      <div className="flex items-center gap-1 text-[#6E7681]">
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
          : "text-[#6E7681] hover:text-[#DA3633]"
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
