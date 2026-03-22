"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Plus,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MessageBubble } from "@/components/social/MessageBubble";
import type { DMThread, DMMessage } from "@/types/fishing-log";

// ─── Helpers ──────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - d) / 60_000);
  if (diffMin < 1) return "Now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── New Message Modal ────────────────────────────────

function NewMessageModal({
  currentUserId,
  onSelect,
  onClose,
}: {
  currentUserId: string;
  onSelect: (userId: string, displayName: string, avatarUrl: string | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { user_id: string; display_name: string | null; username: string | null; avatar_url: string | null }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq("user_id", currentUserId)
        .limit(10);
      setResults(data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, currentUserId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#161B22] border border-[#21262D] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
          <h3 className="text-sm font-semibold text-[#F0F6FC]">New Message</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#21262D]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E7681]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anglers by name..."
              className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] transition-colors"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#A8B2BD]" />
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="text-center text-sm text-[#6E7681] py-8">
              No anglers found
            </p>
          )}
          {!searching &&
            results.map((r) => (
              <button
                key={r.user_id}
                onClick={() =>
                  onSelect(
                    r.user_id,
                    r.display_name || r.username || "Angler",
                    r.avatar_url
                  )
                }
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1F2937] transition-colors text-left"
              >
                {r.avatar_url ? (
                  <Image
                    src={r.avatar_url}
                    alt={r.display_name || "Angler"}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#1F2937] border border-[#21262D] flex items-center justify-center text-xs text-[#A8B2BD] font-medium">
                    {(r.display_name || r.username || "?")[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#F0F6FC]">
                    {r.display_name || r.username || "Angler"}
                  </p>
                  {r.username && (
                    <p className="text-xs text-[#A8B2BD]">@{r.username}</p>
                  )}
                </div>
              </button>
            ))}
          {!searching && query.length < 2 && (
            <p className="text-center text-sm text-[#6E7681] py-8">
              Type at least 2 characters to search
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Conversation Panel ───────────────────────────────

function ConversationPanel({
  threadId,
  currentUserId,
  otherName,
  otherAvatar,
  onBack,
}: {
  threadId: string;
  currentUserId: string;
  otherName: string;
  otherAvatar: string | null;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load messages
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("dm_messages")
        .select(
          "id, thread_id, sender_id, body, read_at, created_at, deleted_at"
        )
        .eq("thread_id", threadId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        setMessages(data || []);
        setLoading(false);
      }

      // Mark unread messages as read
      if (data && data.length > 0) {
        const unread = data.filter(
          (m) => m.sender_id !== currentUserId && !m.read_at
        );
        if (unread.length > 0) {
          const unreadIds = unread.map((m) => m.id);
          await supabase
            .from("dm_messages")
            .update({ read_at: new Date().toISOString() })
            .in("id", unreadIds);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [threadId, currentUserId]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm-thread-${threadId}`)
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
          // Auto-mark as read if from other user
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
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#21262D] bg-[#161B22]">
        <button
          onClick={onBack}
          className="lg:hidden p-1 text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {otherAvatar ? (
          <Image
            src={otherAvatar}
            alt={otherName}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs text-[#A8B2BD] font-medium">
            {otherName[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-semibold text-[#F0F6FC]">
          {otherName}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[#A8B2BD]" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-[#6E7681] py-12">
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
      <div className="px-4 py-3 border-t border-[#21262D] bg-[#161B22]">
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
            className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] transition-colors"
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="p-2 rounded-lg bg-[#E8923A] text-white hover:bg-[#d4832e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main MessagesClient ──────────────────────────────

interface MessagesClientProps {
  threads: DMThread[];
  currentUserId: string;
}

export function MessagesClient({
  threads: initialThreads,
  currentUserId,
}: MessagesClientProps) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedThread, setSelectedThread] = useState<DMThread | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const router = useRouter();

  // Realtime: listen for new messages across all threads to update previews
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dm-inbox")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => {
          const msg = payload.new as DMMessage;
          setThreads((prev) => {
            const idx = prev.findIndex((t) => t.id === msg.thread_id);
            if (idx === -1) {
              // New thread we don't know about yet, refresh
              router.refresh();
              return prev;
            }
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              last_message_at: msg.created_at,
              last_message_body: msg.body,
              unread_count:
                msg.sender_id !== currentUserId &&
                selectedThread?.id !== msg.thread_id
                  ? (updated[idx].unread_count || 0) + 1
                  : updated[idx].unread_count || 0,
            };
            // Re-sort by last_message_at desc
            updated.sort(
              (a, b) =>
                new Date(b.last_message_at).getTime() -
                new Date(a.last_message_at).getTime()
            );
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedThread?.id, router]);

  // When selecting a thread, clear its unread count
  function handleSelectThread(thread: DMThread) {
    setSelectedThread(thread);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === thread.id ? { ...t, unread_count: 0 } : t
      )
    );
  }

  // Handle new message: find or create thread, then open it
  async function handleNewMessage(
    targetUserId: string,
    displayName: string,
    avatarUrl: string | null
  ) {
    setShowNewMessage(false);
    const supabase = createClient();

    // Check if thread already exists
    const existing = threads.find(
      (t) =>
        (t.participant_a === currentUserId && t.participant_b === targetUserId) ||
        (t.participant_a === targetUserId && t.participant_b === currentUserId)
    );

    if (existing) {
      handleSelectThread(existing);
      return;
    }

    // Create new thread
    const { data: newThread, error } = await supabase
      .from("dm_threads")
      .insert({
        participant_a: currentUserId,
        participant_b: targetUserId,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !newThread) return;

    const enriched: DMThread = {
      ...newThread,
      other_profile: {
        user_id: targetUserId,
        display_name: displayName,
        username: null,
        avatar_url: avatarUrl,
      },
      unread_count: 0,
    };

    setThreads((prev) => [enriched, ...prev]);
    setSelectedThread(enriched);
  }

  const otherName = (thread: DMThread) =>
    thread.other_profile?.display_name ||
    thread.other_profile?.username ||
    "Angler";
  const otherAvatar = (thread: DMThread) =>
    thread.other_profile?.avatar_url || null;

  return (
    <>
      {showNewMessage && (
        <NewMessageModal
          currentUserId={currentUserId}
          onSelect={handleNewMessage}
          onClose={() => setShowNewMessage(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
        {/* Thread List — hidden on mobile when conversation is open */}
        <div
          className={`w-full lg:w-80 lg:border-r border-[#21262D] flex-shrink-0 flex flex-col ${
            selectedThread ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* List Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
            <h1 className="text-lg font-bold text-[#F0F6FC]">Messages</h1>
            <button
              onClick={() => setShowNewMessage(true)}
              className="p-2 rounded-lg bg-[#E8923A] text-white hover:bg-[#d4832e] transition-colors"
              title="New message"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Thread Items */}
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MessageCircle className="h-10 w-10 text-[#21262D] mb-3" />
                <p className="text-sm text-[#A8B2BD] mb-1">No messages yet</p>
                <p className="text-xs text-[#6E7681]">
                  Start a conversation with a fellow angler
                </p>
              </div>
            )}
            {threads.map((thread) => {
              const name = otherName(thread);
              const avatar = otherAvatar(thread);
              const isActive = selectedThread?.id === thread.id;
              const hasUnread = (thread.unread_count || 0) > 0;

              return (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#21262D]/50 ${
                    isActive
                      ? "bg-[#1F2937]"
                      : "hover:bg-[#0D1117]/50"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-[#21262D] flex items-center justify-center text-sm text-[#A8B2BD] font-medium">
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#E8923A] rounded-full border-2 border-[#161B22]" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm truncate ${
                          hasUnread
                            ? "font-semibold text-[#F0F6FC]"
                            : "font-medium text-[#C9D1D9]"
                        }`}
                      >
                        {name}
                      </span>
                      <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#6E7681] flex-shrink-0 ml-2">
                        {timeAgo(thread.last_message_at)}
                      </span>
                    </div>
                    {thread.last_message_body && (
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          hasUnread ? "text-[#C9D1D9]" : "text-[#6E7681]"
                        }`}
                      >
                        {thread.last_message_body}
                      </p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {hasUnread && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E8923A] text-white text-[10px] font-['IBM_Plex_Mono'] font-bold flex items-center justify-center">
                      {thread.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Panel */}
        <div
          className={`flex-1 flex flex-col ${
            selectedThread ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedThread ? (
            <ConversationPanel
              key={selectedThread.id}
              threadId={selectedThread.id}
              currentUserId={currentUserId}
              otherName={otherName(selectedThread)}
              otherAvatar={otherAvatar(selectedThread)}
              onBack={() => setSelectedThread(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <MessageCircle className="h-12 w-12 text-[#21262D] mb-3" />
              <p className="text-sm text-[#A8B2BD]">
                Select a conversation or start a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
