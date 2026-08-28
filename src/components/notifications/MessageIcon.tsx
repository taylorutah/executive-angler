"use client";

import Link from "next/link";
import { MessageSquare } from "@/icons";
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
      className="relative flex items-center justify-center p-2 rounded-md text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--paper-deep)] transition-colors duration-150 ease-standard"
      aria-label="Messages"
    >
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--state-negative)] px-1 text-[12px] font-semibold text-white leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
