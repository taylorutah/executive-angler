import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics — Executive Angler",
  description: "Your fishing trends, species breakdown, and performance over time.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/analytics");

  // Fetch all sessions
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, weather, water_temp_f, water_clarity, notes, section")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  // Fetch all catches
  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, length_inches, fly_pattern_id, fly_size, time_caught, quantities")
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
        flyPatternName: c.fly_pattern_id ? flyMap[c.fly_pattern_id] || null : null,
      }))}
    />
  );
}
