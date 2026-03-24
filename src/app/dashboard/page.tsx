import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import { RIVER_AWARDS } from "@/types/awards";

// Never cache — always fetch fresh data
export const dynamic = "force-dynamic";
import type { RiverStats } from "@/types/awards";

export const metadata: Metadata = {
  title: "Dashboard — Executive Angler",
  description: "Your personalized fly fishing dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  // Fetch user favorites (rivers, destinations, etc.)
  const { data: favorites } = await supabase
    .from("user_favorites")
    .select("entity_type, entity_id")
    .eq("user_id", user.id);

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, home_location")
    .eq("user_id", user.id)
    .single();

  // Fetch user own sessions (last 5)
  const { data: mySessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, notes, privacy")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch river details for favorited rivers
  const favRiverIds = (favorites || [])
    .filter((f) => f.entity_type === "river")
    .map((f) => f.entity_id);

  const { data: favRivers } = favRiverIds.length > 0
    ? await supabase
        .from("rivers")
        .select("id, name, slug, hero_image_url, primary_species")
        .in("id", favRiverIds)
    : { data: [] };

  // Fetch destination details for favorited destinations
  const favDestIds = (favorites || [])
    .filter((f) => f.entity_type === "destination")
    .map((f) => f.entity_id);

  const { data: favDests } = favDestIds.length > 0
    ? await supabase
        .from("destinations")
        .select("id, name, slug, hero_image_url")
        .in("id", favDestIds)
    : { data: [] };

  // Following feed — public sessions from people you follow (last 10)
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .eq("status", "active");

  const followingIds = (follows || []).map((f) => f.following_id);

  // Suggested anglers — active users the current user doesn't follow (exclude self)
  const excludeIds = [...followingIds, user.id];
  const { data: suggestedAnglers } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_url, is_private")
    .not("user_id", "in", `(${excludeIds.join(",")})`)
    .not("username", "is", null)
    .or("is_private.is.null,is_private.eq.false")
    .limit(5);

  const { data: followingFeed } = followingIds.length > 0
    ? await supabase
        .from("fishing_sessions")
        .select("id, date, river_name, total_fish, notes, privacy, user_id, profiles(username, avatar_url)")
        .in("user_id", followingIds)
        .eq("privacy", "public")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  // Community explore feed — latest public sessions from anyone
  const { data: exploreFeed } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, notes, privacy, user_id, profiles(username, avatar_url, display_name)")
    .eq("privacy", "public")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  // River activity intel for favorited rivers (recent catch stats)
  const riverIntel: Record<string, { lastDate: string | null; sessions30d: number; topFly: string | null }> = {};
  if (favRiverIds.length > 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const { data: riverSessions } = await supabase
      .from("fishing_sessions")
      .select("river_id, date, id")
      .in("river_id", favRiverIds)
      .eq("privacy", "public")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    favRiverIds.forEach((rid) => {
      const rs = (riverSessions || []).filter((s) => s.river_id === rid);
      const recent = rs.filter((s) => s.date >= thirtyDaysAgo);
      riverIntel[rid] = {
        lastDate: rs[0]?.date ?? null,
        sessions30d: recent.length,
        topFly: null,
      };
    });
  }

  // Fly Box count
  const { count: flyCount } = await supabase
    .from("fly_patterns")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Gear count
  const { count: gearCount } = await supabase
    .from("gear_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // River slug lookup — maps river_id → slug for "Your Rivers" links
  const { data: allRiverSlugs } = await supabase
    .from("rivers")
    .select("id, slug");
  const riverSlugMap: Record<string, string> = {};
  (allRiverSlugs || []).forEach((r: { id: string; slug: string }) => {
    riverSlugMap[r.id] = r.slug;
  });

  // River stats (per-river metrics: sessions, fish, avg, best, species, awards)
  const { data: allSessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, river_id, total_fish")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: allCatches } = await supabase
    .from("catches")
    .select("session_id, species, fly_name, length_inches")
    .eq("user_id", user.id);

  // Build river stats map
  const riverStatsMap = new Map<string, (typeof allSessions extends (infer T)[] | null ? T : never)[]>();
  (allSessions || []).forEach((s) => {
    const key = s.river_name || "Unknown";
    if (!riverStatsMap.has(key)) riverStatsMap.set(key, []);
    riverStatsMap.get(key)!.push(s);
  });

  const riverStatsArr: RiverStats[] = [];
  for (const [river, rSessions] of riverStatsMap.entries()) {
    const sessionIds = rSessions.map((s) => s.id);
    const rCatches = (allCatches || []).filter((c) => sessionIds.includes(c.session_id));
    const speciesSet = new Set<string>();
    rCatches.forEach((c) => { if (c.species) speciesSet.add(c.species); });
    const biggestFish = rCatches.reduce((max, c) => Math.max(max, c.length_inches || 0), 0);
    const flyCountMap = new Map<string, number>();
    rCatches.forEach((c) => { if (c.fly_name) flyCountMap.set(c.fly_name, (flyCountMap.get(c.fly_name) || 0) + 1); });
    const favFly = Array.from(flyCountMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    const totalFishR = rSessions.reduce((sum, s) => sum + (s.total_fish || 0), 0);
    const bestSession = rSessions.reduce((max, s) => Math.max(max, s.total_fish || 0), 0);

    const stats: RiverStats = {
      river_name: river,
      river_id: rSessions[0]?.river_id ?? undefined,
      total_sessions: rSessions.length,
      total_fish: totalFishR,
      biggest_fish: biggestFish > 0 ? biggestFish : undefined,
      favorite_fly: favFly,
      first_session: rSessions[rSessions.length - 1]?.date ?? "",
      last_session: rSessions[0]?.date ?? "",
      species_caught: Array.from(speciesSet),
      avg_fish_per_session: rSessions.length > 0 ? totalFishR / rSessions.length : 0,
      best_session_fish_count: bestSession,
      awards: [],
    };

    // Check awards
    for (const award of RIVER_AWARDS) {
      if (award.check(stats)) {
        stats.awards.push({
          id: `${river}-${award.key}`,
          user_id: user.id,
          award_type: award.type,
          award_key: award.key,
          river_name: river,
          awarded_at: new Date().toISOString(),
          metadata: {
            badge_icon: award.icon,
            badge_color: award.color,
            display_name: award.display_name,
            description: award.description,
          },
        });
      }
    }

    riverStatsArr.push(stats);
  }

  // Sort by total sessions descending
  riverStatsArr.sort((a, b) => b.total_sessions - a.total_sessions);

  // Compute enhanced stats matching iOS dashboard
  const allSessionsList = allSessions || [];
  const allCatchesList = allCatches || [];
  const totalSessions = allSessionsList.length;
  const totalFishAll = allSessionsList.reduce((sum, s) => sum + (s.total_fish || 0), 0);
  const biggestFish = allCatchesList.reduce((max, c) => Math.max(max, c.length_inches || 0), 0);
  const avgFishPerSession = totalSessions > 0 ? Math.round((totalFishAll / totalSessions) * 10) / 10 : 0;
  const speciesSet = new Set<string>();
  allCatchesList.forEach((c) => { if (c.species) speciesSet.add(c.species); });
  const speciesCount = speciesSet.size;

  // Favorite river (most sessions)
  let favoriteRiver = "—";
  if (riverStatsArr.length > 0) {
    favoriteRiver = riverStatsArr[0].river_name;
  }

  // This month stats
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthSessions = allSessionsList.filter((s) => s.date >= monthStart).length;
  const monthFish = allSessionsList.filter((s) => s.date >= monthStart).reduce((sum, s) => sum + (s.total_fish || 0), 0);

  // Weekly streak (consecutive weeks with at least one session)
  let weeklyStreak = 0;
  if (allSessionsList.length > 0) {
    const getWeekKey = (d: string) => {
      const date = new Date(d + "T12:00:00");
      const jan1 = new Date(date.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
      return `${date.getFullYear()}-W${weekNum}`;
    };
    const weeksWithSessions = new Set(allSessionsList.map((s) => getWeekKey(s.date)));
    const currentDate = new Date();
    let checkDate = new Date(currentDate);
    while (true) {
      const wk = getWeekKey(checkDate.toISOString().split("T")[0]);
      if (weeksWithSessions.has(wk)) {
        weeklyStreak++;
        checkDate.setDate(checkDate.getDate() - 7);
      } else {
        break;
      }
    }
  }

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profile}
      mySessions={mySessions || []}
      favRivers={favRivers || []}
      favDests={favDests || []}
      followingFeed={(followingFeed || []) as any}
      suggestedAnglers={suggestedAnglers || []}
      exploreFeed={(exploreFeed || []) as any}
      riverIntel={riverIntel}
      totalFavorites={(favorites || []).length}
      flyCount={flyCount ?? 0}
      gearCount={gearCount ?? 0}
      riverStats={riverStatsArr}
      riverSlugMap={riverSlugMap}
      enhancedStats={{
        totalSessions,
        totalFish: totalFishAll,
        biggestFish,
        avgFishPerSession,
        speciesCount,
        favoriteRiver,
        monthSessions,
        monthFish,
        weeklyStreak,
      }}
    />
  );
}
