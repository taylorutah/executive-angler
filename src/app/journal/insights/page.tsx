import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InsightsPageClient from "./InsightsPageClient";

export const metadata: Metadata = {
  title: "Journal Insights",
  description: "Patterns from your own journal — fly effectiveness, timing, weather.",
};

export default async function JournalInsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/journal/insights");

  return <InsightsPageClient />;
}
