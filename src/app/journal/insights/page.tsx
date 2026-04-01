import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import Link from "next/link";
import { Lock } from "lucide-react";
import InsightsPageClient from "./InsightsPageClient";

export const metadata: Metadata = {
  title: "Journal Insights — Executive Angler",
  description:
    "Rule-based analysis of your fishing patterns — fly effectiveness, timing, weather correlations, and more.",
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
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161B22] rounded-2xl border border-[#21262D] p-8 text-center">
          <Lock className="h-12 w-12 text-[#E8923A] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#F0F6FC] mb-2">Premium Feature</h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            Journal Insights analyzes your fishing history to surface patterns in
            fly effectiveness, timing, weather, and more — all from your real
            data.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-[#E8923A] text-white font-semibold rounded-xl px-6 py-3 hover:bg-[#d4822e] transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return <InsightsPageClient isPremium={isPremium} />;
}
