"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Check, CheckCheck, UserPlus, Heart, MessageCircle, AtSign } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import type { AppNotification, NotificationType } from "@/types/fishing-log";
import { createClient } from "@/lib/supabase/client";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - d) / 60_000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "follow_request":
    case "follow_accepted":
      return <UserPlus className="h-3.5 w-3.5" />;
    case "kudos":
      return <Heart className="h-3.5 w-3.5" />;
    case "comment":
      return <MessageCircle className="h-3.5 w-3.5" />;
    case "mention":
      return <AtSign className="h-3.5 w-3.5" />;
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
      return "/notifications";
    case "follow_accepted":
      return n.actor_profile?.username
        ? `/anglers/${n.actor_profile.username}`
        : "/notifications";
    case "kudos":
    case "comment":
    case "mention":
      return n.session_id ? `/journal/${n.session_id}` : "/notifications";
    default:
      return "/notifications";
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
        onAction();
      }
    } catch {
      // ignore
    }
    setActing(false);
  }

  return (
    <div className="flex gap-2 mt-1.5">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAction("accept");
        }}
        disabled={acting}
        className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-[#E8923A] text-white hover:bg-[#d17d28] transition-colors disabled:opacity-50"
      >
        Accept
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAction("decline");
        }}
        disabled={acting}
        className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-[#21262D] text-[#A8B2BD] hover:bg-[#DA3633] hover:text-white transition-colors disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  );
}

export function NotificationBell() {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch } =
    useNotifications(userId);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!userId) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center p-2 rounded-lg text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#1F2937] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DA3633] px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#161B22] border border-[#21262D] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
            <h3 className="text-sm font-semibold text-[#F0F6FC]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[10px] font-medium text-[#0BA5C7] hover:text-[#F0F6FC] transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 text-[#6E7681] mx-auto mb-2" />
                <p className="text-sm text-[#A8B2BD]">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <Link
                  key={n.id}
                  href={getNotificationHref(n)}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    setOpen(false);
                  }}
                  className={`flex gap-3 px-4 py-3 hover:bg-[#1F2937] transition-colors border-l-2 ${
                    n.read
                      ? "border-l-transparent"
                      : "border-l-[#0BA5C7] bg-[#0BA5C7]/5"
                  }`}
                >
                  {/* Actor avatar */}
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-[#21262D] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {n.actor_profile?.avatar_url ? (
                      <Image
                        src={n.actor_profile.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xs font-bold text-[#A8B2BD]">
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#A8B2BD]">
                        {getNotificationIcon(n.type)}
                      </span>
                      <p className="text-xs text-[#F0F6FC] leading-snug line-clamp-2">
                        {getNotificationText(n)}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#6E7681] mt-0.5">
                      {timeAgo(n.created_at)}
                    </p>

                    {/* Follow request actions */}
                    {n.type === "follow_request" && !n.read && (
                      <FollowRequestActions
                        notification={n}
                        onAction={() => {
                          markAsRead(n.id);
                          refetch();
                        }}
                      />
                    )}
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="flex-shrink-0 mt-2">
                      <div className="h-2 w-2 rounded-full bg-[#0BA5C7]" />
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[#21262D] px-4 py-2.5">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-[#0BA5C7] hover:text-[#F0F6FC] transition-colors"
              >
                See all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
