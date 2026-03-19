import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsClient } from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications | Executive Angler",
  description: "Your notifications and activity updates.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/notifications");

  // Initial server-side fetch of notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      `
      id, recipient_id, actor_id, type, session_id, message, read, created_at,
      actor_profile:profiles!notifications_actor_id_profiles_fkey(
        display_name, username, avatar_url
      )
    `
    )
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const mapped = (notifications || []).map((n) => ({
    ...n,
    actor_profile: Array.isArray(n.actor_profile)
      ? n.actor_profile[0] ?? null
      : n.actor_profile ?? null,
  }));

  return (
    <main className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <NotificationsClient
          initialNotifications={mapped}
          userId={user.id}
        />
      </div>
    </main>
  );
}
