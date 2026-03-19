import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DMThread } from "@/types/fishing-log";
import { MessagesClient } from "./MessagesClient";

export const metadata: Metadata = {
  title: "Messages | Executive Angler",
  description: "Direct messages with fellow anglers.",
};

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/messages");

  const uid = user.id;

  // Fetch threads where user is either participant
  const { data: threadsRaw } = await supabase
    .from("dm_threads")
    .select("id, participant_a, participant_b, last_message_at, created_at")
    .or(`participant_a.eq.${uid},participant_b.eq.${uid}`)
    .order("last_message_at", { ascending: false });

  const threads: DMThread[] = threadsRaw || [];

  // Collect other-user IDs for profile lookup
  const otherUserIds = threads.map((t) =>
    t.participant_a === uid ? t.participant_b : t.participant_a
  );

  // Fetch profiles for the other participants
  let profileMap: Record<
    string,
    { user_id: string; display_name: string | null; username: string | null; avatar_url: string | null }
  > = {};

  if (otherUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .in("user_id", otherUserIds);

    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p]));
    }
  }

  // Fetch last message body for each thread
  let lastMessages: Record<string, string> = {};
  if (threads.length > 0) {
    const threadIds = threads.map((t) => t.id);
    // Get the most recent non-deleted message per thread
    // We fetch all latest messages and pick per thread
    const { data: msgs } = await supabase
      .from("dm_messages")
      .select("thread_id, body, created_at")
      .in("thread_id", threadIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (msgs) {
      const seen = new Set<string>();
      for (const m of msgs) {
        if (!seen.has(m.thread_id)) {
          lastMessages[m.thread_id] = m.body;
          seen.add(m.thread_id);
        }
      }
    }
  }

  // Fetch unread counts
  let unreadCounts: Record<string, number> = {};
  if (threads.length > 0) {
    const threadIds = threads.map((t) => t.id);
    const { data: unreads } = await supabase
      .from("dm_messages")
      .select("thread_id")
      .in("thread_id", threadIds)
      .neq("sender_id", uid)
      .is("read_at", null)
      .is("deleted_at", null);

    if (unreads) {
      unreadCounts = unreads.reduce<Record<string, number>>((acc, m) => {
        acc[m.thread_id] = (acc[m.thread_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  // Enrich threads
  const enrichedThreads: DMThread[] = threads.map((t) => {
    const otherId = t.participant_a === uid ? t.participant_b : t.participant_a;
    return {
      ...t,
      other_profile: profileMap[otherId] || {
        user_id: otherId,
        display_name: null,
        username: null,
        avatar_url: null,
      },
      last_message_body: lastMessages[t.id] || undefined,
      unread_count: unreadCounts[t.id] || 0,
    };
  });

  return (
    <main className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <MessagesClient threads={enrichedThreads} currentUserId={uid} />
      </div>
    </main>
  );
}
