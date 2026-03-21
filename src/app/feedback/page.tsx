import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FeedbackClient from "./FeedbackClient";

export const metadata: Metadata = {
  title: "Feature Requests & Feedback — Executive Angler",
  description: "Help shape Executive Angler. Submit ideas, report bugs, and vote on what gets built next.",
};

export default async function FeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/feedback");

  // Fetch user's existing feedback
  const { data: myFeedback } = await supabase
    .from("community_submissions")
    .select("id, name, short_description, status, entity_data, created_at, admin_feedback")
    .eq("user_id", user.id)
    .eq("entity_type", "feedback")
    .order("created_at", { ascending: false });

  return <FeedbackClient userId={user.id} userEmail={user.email || ""} existing={myFeedback || []} />;
}
