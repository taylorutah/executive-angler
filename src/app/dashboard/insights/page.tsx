import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InsightsClient from "./InsightsClient";

export const metadata: Metadata = {
  title: "Insights",
  description: "Personal insights into your fishing patterns: best flies, peak conditions, and where you fish best.",
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/insights");

  // Fetch all user data for analysis
  const [sessionsRes, catchesRes] = await Promise.all([
    supabase
      .from("fishing_sessions")
      .select("id, date, river_name, total_fish, weather, water_temp_f, water_clarity, section, weather_temp_f, weather_condition, weather_wind_mph, weather_humidity")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("catches")
      .select("id, session_id, species, length_inches, fly_pattern_id, canonical_fly_id, fly_name, fly_size, fly_position, time_caught, quantities")
      .eq("user_id", user.id),
  ]);

  const catches = catchesRes.data || [];

  // Phase A schema: hydrate fly identity via FK lookup on the unified `flies`
  // table. No user_id column (use submitted_by_user_id) and no `type` column
  // (use `category`). The prior `.eq("user_id", user.id).select("type")` query
  // silently failed and dropped all fly-derived insights from the page.
  const referencedFlyIds = Array.from(
    new Set(
      catches
        .flatMap((c) => [c.fly_pattern_id, c.canonical_fly_id])
        .filter((v): v is string => !!v)
    )
  );
  const fliesRes = referencedFlyIds.length > 0
    ? await supabase.from("flies").select("id, name, category").in("id", referencedFlyIds)
    : { data: [] as { id: string; name: string; category: string | null }[] };
  const flyMap = Object.fromEntries(
    (fliesRes.data || []).map((f) => [f.id, { name: f.name, type: f.category }])
  );

  return (
    <InsightsClient
      sessions={sessionsRes.data || []}
      catches={catches.map((c) => {
        const liveFly =
          (c.fly_pattern_id && flyMap[c.fly_pattern_id]) ||
          (c.canonical_fly_id && flyMap[c.canonical_fly_id]) ||
          null;
        return {
          ...c,
          flyName: liveFly?.name || c.fly_name || null,
          flyType: liveFly?.type || null,
        };
      })}
    />
  );
}
