"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  CheckCheck,
  UserPlus,
  Heart,
  MessageCircle,
  AtSign,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification, NotificationType } from "@/types/fishing-log";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - d) / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const notifDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (notifDate.getTime() === today.getTime()) return "Today";
  if (notifDate.getTime() === yesterday.getTime()) return "Yesterday";

  const diffDays = Math.floor(
    (today.getTime() - notifDate.getTime()) / 86400000
  );
  if (diffDays < 7) return "This Week";
  if (diffDays < 30) return "This Month";
  return "Earlier";
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "follow_request":
    case "follow_accepted":
      return <UserPlus className="h-4 w-4" />;
    case "kudos":
      return <Heart className="h-4 w-4" />;
    case "comment":
      return <MessageCircle className="h-4 w-4" />;
    case "mention":
      return <AtSign className="h-4 w-4" />;
  }
}

function getNotificationIconBg(type: NotificationType): string {
  switch (type) {
    case "follow_request":
    case "follow_accepted":
      return "bg-[#E8923A]/15 text-[#E8923A]";
    case "kudos":
      return "bg-[#DA3633]/15 text-[#DA3633]";
    case "comment":
      return "bg-[#0BA5C7]/15 text-[#0BA5C7]";
    case "mention":
      return "bg-purple-500/15 text-purple-400";
  }
}

function getNotificationText(n: AppNotification): string {
  const actorName =
    n.actor_profile?.display_name ||
    (n.actor_profile?.username ? `@${n.actor_profile.username}` : "Someone");
  switch (n.type) {
    case "follow_request":
      return `${actorName} wants to follow you`;
    case "follow_accepted":
      return `${actorName} accepted your follow request`;
    case "kudos":
      return `${actorName} gave kudos to your session`;
    case "comment":
      return `${actorName} commented on your session`;
    case "mention":
      return `${actorName} mentioned you`;
    default:
      return n.message || "New notification";
  }
}

function getNotificationHref(n: AppNotification): string {
  switch (n.type) {
    case "follow_request":
      return "#";
    case "follow_accepted":
      return n.actor_profile?.username
        ? `/anglers/${n.actor_profile.username}`
        : "#";
    case "kudos":
    case "comment":
    case "mention":
      return n.session_id ? `/journal/${n.session_id}` : "#";
    default:
      return "#";
  }
}

function FollowRequestActions({
  notification,
  onAction,
}: {
  notification: AppNotification;
  onAction: () => void;
}) {
  const [acting, setActing] = useState(false);
  const [resolved, setResolved] = useState<"accepted" | "declined" | null>(
    null
  );

  async function handleAction(action: "accept" | "decline") {
    if (!notification.actor_id) return;
    setActing(true);
    try {
      const res = await fetch(`/api/follows/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: notification.actor_id }),
      });
      if (res.ok) {
        setResolved(action === "accept" ? "accepted" : "declined");
        onAction();
      }
    } catch {
      // ignore
    }
    setActing(false);
  }

  if (resolved) {
    return (
      <span
        className={`text-xs font-medium ${
          resolved === "accepted" ? "text-green-500" : "text-[#8B949E]"
        }`}
      >
        {resolved === "accepted" ? "Accepted" : "Declined"}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAction("accept");
        }}
        disabled={acting}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E8923A] text-white hover:bg-[#d17d28] transition-colors disabled:opacity-50"
      >
        Accept
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAction("decline");
        }}
        disabled={acting}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#21262D] text-[#8B949E] hover:bg-[#DA3633] hover:text-white transition-colors disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  );
}

interface Props {
  initialNotifications: AppNotification[];
  userId: string;
}

export function NotificationsClient({ initialNotifications, userId }: Props) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("recipient_id", userId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", userId)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("notifications-page-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        async () => {
          // Refetch to get joined profile data
          const { data } = await supabase
            .from("notifications")
            .select(
              `
              id, recipient_id, actor_id, type, session_id, message, read, created_at,
              actor_profile:profiles!notifications_actor_id_profiles_fkey(
                display_name, username, avatar_url
              )
            `
            )
            .eq("recipient_id", userId)
            .order("created_at", { ascending: false })
            .limit(100);

          if (data) {
            setNotifications(
              data.map((n) => ({
                ...n,
                actor_profile: Array.isArray(n.actor_profile)
                  ? n.actor_profile[0] ?? null
                  : n.actor_profile ?? null,
              }))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Group by date
  const grouped = notifications.reduce<
    Record<string, AppNotification[]>
  >((acc, n) => {
    const label = getDateGroupLabel(n.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {});

  const groupOrder = [
    "Today",
    "Yesterday",
    "This Week",
    "This Month",
    "Earlier",
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F6FC]">Notifications</h1>
          <p className="text-sm text-[#8B949E] mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#0BA5C7] hover:text-[#F0F6FC] hover:bg-[#1F2937] rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-12 text-center">
          <Bell className="h-12 w-12 text-[#484F58] mx-auto mb-3" />
          <p className="text-[#8B949E] text-sm">No notifications yet</p>
          <p className="text-[#484F58] text-xs mt-1">
            When someone follows you, gives kudos, or comments on your sessions,
            you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupOrder.map((groupLabel) => {
            const items = grouped[groupLabel];
            if (!items || items.length === 0) return null;
            return (
              <div key={groupLabel}>
                <h2 className="text-xs font-semibold text-[#484F58] uppercase tracking-wider mb-2 px-1">
                  {groupLabel}
                </h2>
                <div className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden divide-y divide-[#21262D]">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3.5 transition-colors border-l-2 ${
                        n.read
                          ? "border-l-transparent hover:bg-[#1F2937]"
                          : "border-l-[#0BA5C7] bg-[#0BA5C7]/5 hover:bg-[#0BA5C7]/10"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconBg(
                          n.type
                        )}`}
                      >
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Actor avatar */}
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-[#21262D] flex items-center justify-center flex-shrink-0">
                        {n.actor_profile?.avatar_url ? (
                          <Image
                            src={n.actor_profile.avatar_url}
                            alt=""
                            width={36}
                            height={36}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#8B949E]">
                            {(
                              n.actor_profile?.display_name ||
                              n.actor_profile?.username ||
                              "A"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={getNotificationHref(n)}
                          onClick={() => {
                            if (!n.read) markAsRead(n.id);
                          }}
                          className="block"
                        >
                          <p className="text-sm text-[#F0F6FC] leading-snug">
                            {getNotificationText(n)}
                          </p>
                          <p className="text-xs text-[#484F58] mt-0.5">
                            {timeAgo(n.created_at)}
                          </p>
                        </Link>

                        {/* Follow request actions */}
                        {n.type === "follow_request" && !n.read && (
                          <div className="mt-2">
                            <FollowRequestActions
                              notification={n}
                              onAction={() => markAsRead(n.id)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Read/unread indicator + mark as read */}
                      <div className="flex-shrink-0 flex items-start pt-1">
                        {!n.read ? (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="p-1 text-[#0BA5C7] hover:text-[#F0F6FC] transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <div className="p-1">
                            <div className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
