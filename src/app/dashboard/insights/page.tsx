import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import ProGate from "@/components/ui/ProGate";
import InsightsClient from "./InsightsClient";

export const metadata: Metadata = {
  title: "Insights",
  description: "Personal insights into your fishing patterns: best flies, peak conditions, and where you fish best.",
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/insights");

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return (
      <ProGate
        feature="Insights"
        pitch="Surface patterns from your own sessions — best flies, peak conditions, where you fish best."
      />
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
      .select("id, session_id, species, length_inches, fly_pattern_id, fly_name, variant_id, fly_size, fly_position, time_caught, quantities")
      .eq("user_id", user.id),
    supabase
      .from("flies")
      .select("id, name, type")
      .eq("user_id", user.id),
  ]);

  const flyMap = Object.fromEntries((fliesRes.data || []).map(f => [f.id, { name: f.name, type: f.type }]));

  return (
    <InsightsClient
      sessions={sessionsRes.data || []}
      catches={(catchesRes.data || []).map(c => ({
        ...c,
        flyName: c.fly_name || (c.fly_pattern_id ? flyMap[c.fly_pattern_id]?.name || null : null),
        flyType: c.fly_pattern_id ? flyMap[c.fly_pattern_id]?.type || null : null,
      }))}
    />
  );
}
