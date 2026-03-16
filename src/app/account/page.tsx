import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";

export const metadata = { title: "My Account | Executive Angler" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ redirect?: string; welcome?: string }> }) {
  const params = await searchParams;
  const welcome = params.welcome;

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

  const { data: favs } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("angler_profiles")
    .select("feed_display, display_name, avatar_url, home_location")
    .eq("user_id", user.id)
    .single();

  // Fetch from profiles table (iOS-compatible) for username, bio, is_private
  const { data: profilesRow } = await supabase
    .from("profiles")
    .select("username, display_name, bio, is_private")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch user awards
  const { data: awards } = await supabase
    .from("user_awards")
    .select("award_key, river_name, awarded_at, metadata")
    .eq("user_id", user.id)
    .order("awarded_at", { ascending: false });

  const totalSessions = sessions?.length || 0;
  // Sum total_fish from sessions (includes drift-mode sessions with count-only data)
  const totalFish = sessions?.reduce((sum, s) => sum + (s.total_fish || 0), 0) || 0;

  const rivers = [...new Set(sessions?.map((s) => s.river_name).filter(Boolean))];
  const totalRivers = rivers.length;

  const bestSession = sessions?.reduce((best, s) => {
    return (s.total_fish || 0) > (best?.total_fish || 0) ? s : best;
  }, null as (typeof sessions)[0] | null);

  const lengths = catches
    ?.map((c) => parseFloat(c.length_inches || "0"))
    .filter((l) => l > 0) || [];
  const biggestFish = lengths.length > 0 ? Math.round(Math.max(...lengths) * 10) / 10 : null;

  return (
    <AccountClient
      user={{
        id: user.id,
        email: user.email || "",
        displayName: profilesRow?.display_name || profile?.display_name || user.user_metadata?.display_name || "",
        avatarUrl: profile?.avatar_url || "",
        username: profilesRow?.username || undefined,
        bio: profilesRow?.bio || undefined,
        homeLocation: profile?.home_location || undefined,
        isPrivate: profilesRow?.is_private ?? false,
      }}
      feedDisplay={(profile?.feed_display as "collage" | "map") || "collage"}
      stats={{
        totalSessions,
        totalFish,
        totalRivers,
        totalFlies: flies?.length || 0,
        totalFavorites: favs?.length || 0,
        biggestFish,
        bestSession: bestSession
          ? { river_name: bestSession.river_name || "", date: bestSession.date || "", total_fish: bestSession.total_fish || 0, location: bestSession.location }
          : null,
      }}
      awards={awards ?? []}
      welcome={welcome === "1"}
    />
  );
}
