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
} from "@/icons";
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

function getNotificationIconBg(): string {
  return "bg-[var(--accent-soft)] text-[var(--accent)]";
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
      return "/feed";
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
          resolved === "accepted" ? "text-[var(--success)]" : "text-[var(--text-2)]"
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
        className="ea-btn ea-btn-primary ea-btn-sm"
      >
        Accept
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAction("decline");
        }}
        disabled={acting}
        className="ea-btn ea-btn-secondary ea-btn-sm"
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
          <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] sm:text-3xl">Notifications</h1>
          <p className="text-sm text-[var(--text-2)] mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="ea-btn ea-btn-ghost ea-btn-sm"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="ea-card p-12 text-center">
          <Bell className="h-12 w-12 text-[var(--text-3)] mx-auto mb-3" />
          <p className="text-[var(--text-2)] text-sm">No notifications yet</p>
          <p className="text-[var(--text-3)] text-xs mt-1">
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
                <h2 className="ea-overline mb-2 px-1">
                  {groupLabel}
                </h2>
                <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3.5 transition-colors duration-150 ease-standard border-l-2 ${
                        n.read
                          ? "border-l-transparent hover:bg-[var(--paper-deep)]"
                          : "border-l-[var(--accent)] bg-[var(--accent-soft)]"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`h-9 w-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 ${getNotificationIconBg()}`}
                      >
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Actor avatar */}
                      <div className="h-9 w-9 rounded-[var(--radius-card)] overflow-hidden bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                        {n.actor_profile?.avatar_url ? (
                          <Image
                            src={n.actor_profile.avatar_url}
                            alt=""
                            width={36}
                            height={36}
                            className="ea-photo object-cover w-full h-full"
                          />
                        ) : (
                          <span className="font-display text-xs font-semibold text-[var(--accent)]">
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
                          <p className="text-sm text-[var(--text-1)] leading-snug">
                            {getNotificationText(n)}
                          </p>
                          <p className="text-xs text-[var(--text-3)] mt-0.5">
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
                            className="p-1 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150 ease-standard"
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
