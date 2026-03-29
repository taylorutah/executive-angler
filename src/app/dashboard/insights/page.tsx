import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import InsightsClient from "./InsightsClient";

export const metadata: Metadata = {
  title: "AI Insights — Executive Angler",
  description: "AI-powered analysis of your fishing patterns and personalized recommendations.",
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/insights");

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161B22] rounded-2xl border border-[#21262D] p-8 text-center">
          <Lock className="h-12 w-12 text-[#E8923A] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#F0F6FC] mb-2">Pro Feature</h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            AI Insights analyzes your fishing history to find patterns,
            recommend optimal conditions, and help you catch more fish.
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

  // Fetch all user data for analysis
  const [sessionsRes, catchesRes, fliesRes] = await Promise.all([
    supabase
      .from("fishing_sessions")
      .select("id, date, river_name, total_fish, weather, water_temp_f, water_clarity, section, weather_temp_f, weather_condition, weather_wind_mph, weather_humidity")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("catches")
      .select("id, session_id, species, length_inches, fly_pattern_id, fly_size, fly_position, time_caught, quantities")
      .eq("user_id", user.id),
    supabase
      .from("fly_patterns")
      .select("id, name, type")
      .eq("user_id", user.id),
  ]);

  const flyMap = Object.fromEntries((fliesRes.data || []).map(f => [f.id, { name: f.name, type: f.type }]));

  return (
    <InsightsClient
      sessions={sessionsRes.data || []}
      catches={(catchesRes.data || []).map(c => ({
        ...c,
        flyName: c.fly_pattern_id ? flyMap[c.fly_pattern_id]?.name || null : null,
        flyType: c.fly_pattern_id ? flyMap[c.fly_pattern_id]?.type || null : null,
      }))}
    />
  );
}
