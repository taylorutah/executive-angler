import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";

export const metadata = { title: "My Account | Executive Angler" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  // Journal stats
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, river_name, date, total_fish, location")
    .eq("user_id", user.id);

  const { data: catches } = await supabase
    .from("catches")
    .select("id, species, length_inches, quantities")
    .eq("user_id", user.id);

  const { data: flies } = await supabase
    .from("fly_patterns")
    .select("id")
    .eq("user_id", user.id);

  const totalSessions = sessions?.length || 0;
  const totalFish = catches?.reduce((sum, c) => sum + (c.quantities || 1), 0) || 0;

  const rivers = [...new Set(sessions?.map((s) => s.river_name).filter(Boolean))];
  const totalRivers = rivers.length;

  const bestSession = sessions?.reduce((best, s) => {
    return (s.total_fish || 0) > (best?.total_fish || 0) ? s : best;
  }, null as (typeof sessions)[0] | null);

  const lengths = catches
    ?.map((c) => parseFloat(c.length_inches || "0"))
    .filter((l) => l > 0) || [];
  const biggestFish = lengths.length > 0 ? Math.max(...lengths) : null;

  return (
    <AccountClient
      user={{ id: user.id, email: user.email || "", displayName: user.user_metadata?.display_name || "" }}
      stats={{ totalSessions, totalFish, totalRivers, totalFlies: flies?.length || 0, biggestFish, bestSession: bestSession ? { river_name: bestSession.river_name || "", date: bestSession.date || "", total_fish: bestSession.total_fish || 0, location: bestSession.location } : null }}
    />
  );
}
