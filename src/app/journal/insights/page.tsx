import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import ProGate from "@/components/ui/ProGate";
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

  const isPremium = await checkPremium(supabase, user.id, user.email);

  if (!isPremium) {
    return (
      <ProGate
        feature="Journal Insights"
        pitch="Surface patterns from your own sessions — fly effectiveness, timing, weather. Built only from your data."
      />
    );
  }

  return <InsightsPageClient isPremium={isPremium} />;
}
