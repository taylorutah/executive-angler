import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThreadDetailClient } from "./ThreadDetailClient";

export const metadata: Metadata = {
  title: "Conversation | Executive Angler",
  description: "Direct message conversation.",
};

interface PageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ThreadDetailPage({ params }: PageProps) {
  const { threadId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/messages/${threadId}`);

  const uid = user.id;

  // Fetch the thread
  const { data: thread } = await supabase
    .from("dm_threads")
    .select("id, participant_a, participant_b, last_message_at, created_at")
    .eq("id", threadId)
    .single();

  if (!thread) redirect("/messages");

  // Verify user is a participant
  if (thread.participant_a !== uid && thread.participant_b !== uid) {
    redirect("/messages");
  }

  const otherId =
    thread.participant_a === uid ? thread.participant_b : thread.participant_a;

  // Fetch other user's profile
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("user_id, display_name, username, avatar_url")
    .eq("user_id", otherId)
    .single();

  const otherName =
    otherProfile?.display_name || otherProfile?.username || "Angler";
  const otherAvatar = otherProfile?.avatar_url || null;

  // Fetch messages
  const { data: messages } = await supabase
    .from("dm_messages")
    .select(
      "id, thread_id, sender_id, body, read_at, created_at, deleted_at"
    )
    .eq("thread_id", threadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  // Mark unread messages as read
  const unreadIds = (messages || [])
    .filter((m) => m.sender_id !== uid && !m.read_at)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await supabase
      .from("dm_messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  return (
    <main className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-2xl h-[100dvh] flex flex-col">
        <ThreadDetailClient
          threadId={threadId}
          currentUserId={uid}
          otherName={otherName}
          otherAvatar={otherAvatar}
          initialMessages={messages || []}
        />
      </div>
    </main>
  );
}
