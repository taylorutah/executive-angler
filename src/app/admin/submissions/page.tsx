import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import SubmissionsQueueClient from "./SubmissionsQueueClient";

export const metadata = { title: "Submissions Review — Admin — Executive Angler" };

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const { data: submissions } = await supabase
    .from("community_submissions")
    .select("id, entity_type, status, name, short_description, hero_image_url, source, created_at, submitted_at, updated_at, user_id, version, profiles(username, display_name)")
    .in("status", ["submitted", "in_review", "needs_info"])
    .order("submitted_at", { ascending: true });

  // Also get recent approved/rejected for context
  const { data: recent } = await supabase
    .from("community_submissions")
    .select("id, entity_type, status, name, submitted_at, reviewed_at, user_id, profiles(username, display_name)")
    .in("status", ["approved", "rejected"])
    .order("reviewed_at", { ascending: false })
    .limit(10);

  return (
    <SubmissionsQueueClient
      pending={submissions || []}
      recent={recent || []}
    />
  );
}
