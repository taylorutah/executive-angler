"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/types/fishing-log";

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("notifications")
      .select(
        `
        id, recipient_id, actor_id, type, session_id, message, read, created_at,
        actor_profile:profiles!notifications_actor_id_fkey(
          display_name, username, avatar_url
        )
      `
      )
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      const mapped: AppNotification[] = data.map((n) => ({
        ...n,
        actor_profile: Array.isArray(n.actor_profile)
          ? n.actor_profile[0] ?? null
          : n.actor_profile ?? null,
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => !n.read).length);
    }
    setLoading(false);
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          // Refetch to get joined profile data
          fetchNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("recipient_id", userId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", userId)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
