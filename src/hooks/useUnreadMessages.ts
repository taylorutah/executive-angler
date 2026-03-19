"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();

    const { count } = await supabase
      .from("dm_messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", userId)
      .is("read_at", null)
      .is("deleted_at", null);

    setUnreadCount(count ?? 0);
  }, [userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const channel = supabase
      .channel("messages-unread-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => {
          // Only increment if the message is for this user (not sent by them)
          if (payload.new && payload.new.sender_id !== userId) {
            fetchCount();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dm_messages",
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCount]);

  return { unreadCount };
}
