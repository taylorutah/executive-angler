"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSessionOwnerId(supabase: any, sessionId: string): Promise<string | null> {
  const { data } = await supabase
    .from("fishing_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .maybeSingle();
  return data?.user_id ?? null;
}

interface Comment {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentsSectionProps {
  sessionId: string;
  initialCount: number;
  sessionOwnerId?: string;
}

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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CommentCount({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-[#6E7681]">
      <MessageCircle className="h-4 w-4" />
      {count > 0 && (
        <span className="font-['IBM_Plex_Mono'] text-xs">{count}</span>
      )}
    </div>
  );
}

export function CommentsSection({ sessionId, initialCount, sessionOwnerId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(initialCount);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  async function loadComments() {
    if (comments.length > 0) return; // Already loaded
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("session_comments")
      .select(`
        id, session_id, user_id, body, created_at,
        profile:profiles!session_comments_user_id_fkey(
          display_name, username, avatar_url
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (data) {
      setComments(
        data.map((c) => ({
          ...c,
          profile: Array.isArray(c.profile) ? c.profile[0] ?? null : c.profile ?? null,
        }))
      );
    }
    setLoading(false);
  }

  async function handleToggle() {
    if (!expanded) {
      await loadComments();
    }
    setExpanded(!expanded);
  }

  async function postComment() {
    if (!userId || !newComment.trim() || posting) return;
    setPosting(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("session_comments")
      .insert({ session_id: sessionId, user_id: userId, body: newComment.trim() })
      .select(`
        id, session_id, user_id, body, created_at,
        profile:profiles!session_comments_user_id_fkey(
          display_name, username, avatar_url
        )
      `)
      .single();

    if (data) {
      const comment = {
        ...data,
        profile: Array.isArray(data.profile) ? data.profile[0] ?? null : data.profile ?? null,
      };
      setComments((prev) => [...prev, comment]);
      setCommentCount((c) => c + 1);
      setNewComment("");

      // Create notification for session owner (if not self)
      const ownerId = sessionOwnerId || await getSessionOwnerId(supabase, sessionId);
      if (ownerId && ownerId !== userId) {
        await supabase.from("notifications").insert({
          recipient_id: ownerId,
          actor_id: userId,
          type: "comment",
          session_id: sessionId,
          message: null,
        });

        // Trigger email notification (fire and forget)
        fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "comment",
            recipientId: ownerId,
            actorId: userId,
            sessionId,
          }),
        }).catch(() => {});
      }
    }
    setPosting(false);
  }

  async function deleteComment(commentId: string) {
    const supabase = createClient();
    await supabase.from("session_comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((c) => Math.max(0, c - 1));
  }

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-[#6E7681] hover:text-[#A8B2BD] transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount > 0 && (
          <span className="font-['IBM_Plex_Mono'] text-xs">{commentCount}</span>
        )}
      </button>

      {/* Expanded comments */}
      {expanded && (
        <div className="mt-3 border-t border-[#21262D] pt-3 space-y-3">
          {loading && (
            <div className="text-xs text-[#6E7681]">Loading comments...</div>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              {/* Avatar */}
              <div className="h-6 w-6 rounded-full overflow-hidden bg-[#21262D] flex items-center justify-center flex-shrink-0 mt-0.5">
                {comment.profile?.avatar_url ? (
                  <Image
                    src={comment.profile.avatar_url}
                    alt=""
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-[#A8B2BD]">
                    {(comment.profile?.display_name || "A").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Comment body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#F0F6FC]">
                    {comment.profile?.display_name || comment.profile?.username || "Angler"}
                  </span>
                  <span className="text-[10px] text-[#6E7681]">
                    {timeAgo(comment.created_at)}
                  </span>
                  {comment.user_id === userId && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#6E7681] hover:text-[#DA3633] transition-all ml-auto"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#A8B2BD] leading-relaxed">{comment.body}</p>
              </div>
            </div>
          ))}

          {/* New comment input */}
          {userId && (
            <div className="flex gap-2 mt-2">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-1.5 text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] transition-colors"
                maxLength={500}
              />
              <button
                onClick={postComment}
                disabled={!newComment.trim() || posting}
                className="text-[#E8923A] disabled:text-[#6E7681] hover:text-[#F0F6FC] transition-colors p-1"
                aria-label="Post comment"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
