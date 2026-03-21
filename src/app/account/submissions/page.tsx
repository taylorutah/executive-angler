import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MySubmissionsClient from "./MySubmissionsClient";

export const metadata: Metadata = {
  title: "My Submissions — Executive Angler",
  description: "Manage your community contributions.",
};

export default async function MySubmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/submissions");

  const { data: submissions } = await supabase
    .from("community_submissions")
    .select("id, entity_type, status, name, short_description, hero_image_url, source, created_at, submitted_at, updated_at, rejection_reason, admin_feedback, version")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { data: stats } = await supabase
    .from("contributor_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <MySubmissionsClient
      submissions={submissions || []}
      stats={stats || { submissions_total: 0, submissions_approved: 0, submissions_rejected: 0, trust_level: "new" }}
    />
  );
}
