"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, UserCheck, Clock } from "lucide-react";

type FollowStatus = "not_following" | "pending" | "following";

interface FollowButtonProps {
  targetUserId: string;
  compact?: boolean;
}

export function FollowButton({ targetUserId, compact = false }: FollowButtonProps) {
  const [status, setStatus] = useState<FollowStatus>("not_following");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        if (data.user.id === targetUserId) return; // Don't follow yourself

        // Check current follow status
        supabase
          .from("follows")
          .select("status")
          .eq("follower_id", data.user.id)
          .eq("following_id", targetUserId)
          .maybeSingle()
          .then(({ data: follow }) => {
            if (follow) {
              setStatus(
                follow.status === "accepted"
                  ? "following"
                  : follow.status === "pending"
                  ? "pending"
                  : "not_following"
              );
            }
          });
      }
    });
  }, [targetUserId]);

  // Don't show button for own profile or unauthenticated
  if (!userId || userId === targetUserId) return null;

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();

    if (status === "following" || status === "pending") {
      // Unfollow
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", userId!)
        .eq("following_id", targetUserId);
      setStatus("not_following");
    } else {
      // Follow — use "accepted" to match iOS convention
      await supabase.from("follows").insert({
        follower_id: userId,
        following_id: targetUserId,
        status: "accepted",
      });
      setStatus("following");
    }

    setLoading(false);
  }

  const config = {
    not_following: {
      icon: UserPlus,
      label: "Follow",
      className:
        "bg-[#E8923A] text-[#0D1117] hover:bg-[#F0A050]",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className:
        "bg-[#21262D] text-[#8B949E] hover:bg-[#DA3633] hover:text-[#F0F6FC]",
    },
    following: {
      icon: UserCheck,
      label: "Following",
      className:
        "bg-[#21262D] text-[#F0F6FC] hover:bg-[#DA3633] hover:text-[#F0F6FC]",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-lg font-semibold transition-colors duration-150 ${className} ${
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      } ${loading ? "opacity-50" : ""}`}
    >
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </button>
  );
}
