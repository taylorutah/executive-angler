import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FeedbackClient from "./FeedbackClient";

export const metadata: Metadata = {
  title: "Feature Requests & Feedback",
  description: "Help shape Executive Angler. Submit ideas, report bugs, and vote on what gets built next.",
};

export default async function FeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="py-14 sm:py-16">
        <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
          <p className="ea-overline">Ideas & feedback</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
            Tell us what to build next
          </h1>
          <p className="mt-4 text-[var(--text-16)] leading-relaxed text-[var(--text-2)]">
            Sign in to send an idea or a bug. The water stays public. Your notes do not.
          </p>
          <Link href="/login?redirect=/feedback" className="ea-btn ea-btn-primary mt-8">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const { data: myFeedback } = await supabase
    .from("community_submissions")
    .select("id, name, short_description, status, entity_data, created_at, admin_feedback")
    .eq("user_id", user.id)
    .eq("entity_type", "feedback")
    .order("created_at", { ascending: false });

  return <FeedbackClient userId={user.id} userEmail={user.email || ""} existing={myFeedback || []} />;
}
