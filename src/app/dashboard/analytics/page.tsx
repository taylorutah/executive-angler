import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Your fishing trends, species breakdown, and performance over time.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/analytics");

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161B22] rounded-2xl border border-[#21262D] p-8 text-center">
          <Lock className="h-12 w-12 text-[#E8923A] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#F0F6FC] mb-2">Pro Feature</h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            Analytics shows your fishing trends, species breakdowns,
            and performance over time.
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

  // Fetch all sessions
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, weather, water_temp_f, water_clarity, notes, section")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  // Fetch all catches
  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, length_inches, fly_pattern_id, fly_name, variant_id, fly_size, time_caught, quantities")
    .eq("user_id", user.id);

  // Fetch fly patterns for name lookup
  const { data: flies } = await supabase
    .from("fly_patterns")
    .select("id, name")
    .eq("user_id", user.id);

  const flyMap = Object.fromEntries((flies || []).map(f => [f.id, f.name]));

  return (
    <AnalyticsClient
      sessions={sessions || []}
      catches={(catches || []).map(c => ({
        ...c,
        flyPatternName: c.fly_name || (c.fly_pattern_id ? flyMap[c.fly_pattern_id] || null : null),
      }))}
    />
  );
}
