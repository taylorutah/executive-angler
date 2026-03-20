"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MessageBubble } from "@/components/social/MessageBubble";
import type { DMMessage } from "@/types/fishing-log";

interface ThreadDetailClientProps {
  threadId: string;
  currentUserId: string;
  otherName: string;
  otherAvatar: string | null;
  initialMessages: DMMessage[];
}

export function ThreadDetailClient({
  threadId,
  currentUserId,
  otherName,
  otherAvatar,
  initialMessages,
}: ThreadDetailClientProps) {
  const [messages, setMessages] = useState<DMMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom on mount and new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm-mobile-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const msg = payload.new as DMMessage;
          if (msg.deleted_at) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto-mark as read
          if (msg.sender_id !== currentUserId) {
            supabase
              .from("dm_messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", msg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, currentUserId]);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, body: trimmed }),
      });

      if (res.ok) {
        setBody("");
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("[MESSAGE SEND ERROR]", err);
      }
    } catch (err) {
      console.error("[MESSAGE SEND ERROR]", err);
    }

    setSending(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#21262D] bg-[#161B22] safe-area-top">
        <Link
          href="/messages"
          className="p-1 text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {otherAvatar ? (
          <Image
            src={otherAvatar}
            alt={otherName}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs text-[#8B949E] font-medium">
            {otherName[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-semibold text-[#F0F6FC]">
          {otherName}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[#484F58] py-12">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.sender_id === currentUserId;
          const prev = messages[i - 1];
          const showAvatar =
            !isOwn && (!prev || prev.sender_id !== msg.sender_id);
          return (
            <MessageBubble
              key={msg.id}
              body={msg.body}
              timestamp={msg.created_at}
              senderName={isOwn ? null : otherName}
              senderAvatar={isOwn ? null : otherAvatar}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#21262D] bg-[#161B22] safe-area-bottom">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A] transition-colors"
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="p-2 rounded-lg bg-[#E8923A] text-white hover:bg-[#d4832e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
