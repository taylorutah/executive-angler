"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

export function MessageIcon() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { unreadCount } = useUnreadMessages(userId);

  if (!userId) return null;

  return (
    <Link
      href="/messages"
      className="relative flex items-center justify-center p-2 rounded-lg text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors"
      aria-label="Messages"
    >
      <MessageSquare className="h-4.5 w-4.5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--state-negative)] px-1 text-[10px] font-bold text-white leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
