"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

export function MessageIcon() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const { unreadCount } = useUnreadMessages(userId);

  if (!userId) return null;

  return (
    <Link
      href="/messages"
      className="relative flex items-center justify-center p-2 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1F2937] transition-colors"
      aria-label="Messages"
    >
      <MessageSquare className="h-4.5 w-4.5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DA3633] px-1 text-[10px] font-bold text-white leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
