import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import HatchReportsClient from "./HatchReportsClient";

export const metadata: Metadata = {
  title: "Hatch Reports — Executive Angler",
  description: "Real-time and historical hatch reports from your fishing data.",
};

export default async function HatchReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/hatch-reports");

  const isPremium = await checkPremium(supabase, user.id, user.email);
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161B22] rounded-2xl border border-[#21262D] p-8 text-center">
          <Lock className="h-12 w-12 text-[#E8923A] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#F0F6FC] mb-2">Pro Feature</h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            Hatch Reports combine community data with your personal catch history
            to show what&apos;s hatching and what flies are working right now.
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

  // Fetch user sessions with catches for hatch matching
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, water_temp_f")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, fly_pattern_id, fly_size, time_caught, quantities")
    .eq("user_id", user.id);

  const { data: flies } = await supabase
    .from("fly_patterns")
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
        flyName: c.fly_pattern_id ? flyMap[c.fly_pattern_id]?.name || null : null,
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
