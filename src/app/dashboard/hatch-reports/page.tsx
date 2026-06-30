import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HatchReportsClient from "./HatchReportsClient";

export const metadata: Metadata = {
  title: "Hatch Reports",
  description: "Real-time and historical hatch reports from your fishing data.",
};

export default async function HatchReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/hatch-reports");

  // Fetch user sessions with catches for hatch matching
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, water_temp_f")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, fly_pattern_id, fly_name, variant_id, fly_size, time_caught, quantities")
    .eq("user_id", user.id);

  const { data: flies } = await supabase
    .from("flies")
    .select("id, name, type")
    .eq("user_id", user.id);

  const flyMap = Object.fromEntries((flies || []).map(f => [f.id, { name: f.name, type: f.type }]));

  // Fetch rivers with hatch charts for matching
  const { data: rivers } = await supabase
    .from("rivers")
    .select("id, slug, name, hatch_chart")
    .not("hatch_chart", "is", null);

  return (
    <HatchReportsClient
      sessions={sessions || []}
      catches={(catches || []).map(c => ({
        ...c,
        flyName: c.fly_name || (c.fly_pattern_id ? flyMap[c.fly_pattern_id]?.name || null : null),
        flyType: c.fly_pattern_id ? flyMap[c.fly_pattern_id]?.type || null : null,
      }))}
      rivers={(rivers || []).map(r => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        hatchChart: r.hatch_chart || [],
      }))}
    />
  );
}
