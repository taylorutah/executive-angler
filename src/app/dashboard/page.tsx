import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import { RIVER_AWARDS } from "@/types/awards";
import { checkPremium, isFoundersFreeWindow, FOUNDERS_FREE_END } from "@/lib/admin";
import { listMyConfigurationsWithFly, listMyPatternsHub } from "@/lib/db/fly-model";
import { summarizeVersion } from "@/components/flies-v3/summarize-version";
import { listMyFavoriteSections, listMyRiverSectionPrefs } from "@/lib/db/favorite-sections";
import type { MyFliesItem } from "@/components/dashboard/MyFliesWidget";
import type { FavoriteSectionDTO, YourRiverDTO } from "@/components/dashboard/RiverSectionsGrid";
import type { GaugeChoice } from "@/components/dashboard/RiverSectionCard";

// Never cache — always fetch fresh data
export const dynamic = "force-dynamic";
import type { RiverStats } from "@/types/awards";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized fly fishing dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  // Fetch user profile (including premium status)
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, home_location, is_premium")
    .eq("user_id", user.id)
    .single();

  // Full 3-tier premium check (permanent-pro email → profiles.is_premium →
  // active subscription). The banner logic reads this — using profile.is_premium
  // alone misses permanent-pro emails whose profile flag isn't set.
  const isPremium = await checkPremium(supabase, user.id, user.email);

  // Fetch user own sessions (last 5)
  const { data: mySessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, notes, broadcast_presence")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  // Privacy overhaul: dashboard is owner-only. Following/explore/suggested feeds
  // are removed — community activity is no longer surfaced here. The "My Flies"
  // widget below replaces them with the user's own Tie Next + Favorites.

  // Post-Phase-C: Tie Next + Favorites widget reads from the new
  // user_fly_configurations table. Each row joins to its `flies` row.
  const [tieNextConfigurations, favoriteConfigurations, patternsHub] = await Promise.all([
    listMyConfigurationsWithFly({ tieNextOnly: true }),
    listMyConfigurationsWithFly({ favoritesOnly: true }),
    listMyPatternsHub(),
  ]);

  const tieNextItems: MyFliesItem[] = tieNextConfigurations
    .filter((c) => c.tie_next_status === "wanted" || c.tie_next_status === "at_vise")
    .map<MyFliesItem>((c) => ({
      key: `cfg-${c.id}`,
      name: c.fly.name,
      imageUrl: c.fly.hero_image_url ?? null,
      size: c.size ?? null,
      category: c.fly.category ?? null,
      status: c.tie_next_status as MyFliesItem["status"],
      subtitle: summarizeVersion(c),
      href: `/flies/${c.fly.slug}`,
    }));

  const favoriteItems: MyFliesItem[] = favoriteConfigurations.map<MyFliesItem>((c) => ({
    key: `fav-${c.id}`,
    name: c.fly.name,
    imageUrl: c.fly.hero_image_url ?? null,
    size: c.size ?? null,
    category: c.fly.category ?? null,
    subtitle: summarizeVersion(c),
    href: `/flies/${c.fly.slug}`,
  }));

  // Fly Box count — number of distinct flies the user has a version of.
  const flyCount = patternsHub.length;

  // Gear count
  const { count: gearCount } = await supabase
    .from("gear_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch all rivers with their JSONB gauge configs — used by both the
  // section picker (Pin section modal) and the "Your Rivers" tab so we can
  // expose a gauge selector on each river card.
  const { data: allRiversRaw } = await supabase
    .from("rivers")
    .select("id, name, slug, usgs_gauge_id");

  function parseGauges(raw: unknown): GaugeChoice[] {
    if (!raw) return [];
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t.startsWith("[")) return [];
      try { return JSON.parse(t) as GaugeChoice[]; } catch { return []; }
    }
    if (Array.isArray(raw)) return raw as GaugeChoice[];
    return [];
  }

  const riverSlugMap: Record<string, string> = {};
  const riverList: Array<{ name: string; slug: string }> = [];
  const riversById = new Map<string, { name: string; slug: string; gauges: GaugeChoice[] }>();
  (allRiversRaw || []).forEach((r: { id: string; name: string; slug: string; usgs_gauge_id: unknown }) => {
    const gauges = parseGauges(r.usgs_gauge_id);
    riverSlugMap[r.id] = r.slug;
    riverList.push({ name: r.name, slug: r.slug });
    riversById.set(r.id, { name: r.name, slug: r.slug, gauges });
  });

  const riversForPicker = Array.from(riversById.entries())
    .map(([id, r]) => ({ id, name: r.name, slug: r.slug, gauges: r.gauges }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Resolve a session river_name (e.g., "Middle Provo") to a canonical river slug.
  // Strips section qualifiers and matches by remaining core tokens.
  const SECTION_TOKENS = new Set([
    "upper", "middle", "lower", "north", "south", "east", "west",
    "fork", "branch", "river", "creek", "stream", "the",
  ]);
  const coreTokens = (s: string) =>
    s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t && !SECTION_TOKENS.has(t));
  function resolveRiverSlug(riverName: string | undefined, riverId: string | undefined): string | undefined {
    if (riverId && riverSlugMap[riverId]) return riverSlugMap[riverId];
    if (!riverName) return undefined;
    const lowerName = riverName.toLowerCase();
    const exact = riverList.find((r) => r.name.toLowerCase() === lowerName);
    if (exact) return exact.slug;
    const sessionCore = coreTokens(riverName);
    if (sessionCore.length === 0) return undefined;
    const match = riverList.find((r) => {
      const rc = coreTokens(r.name);
      return rc.length > 0 && sessionCore.every((t) => rc.includes(t));
    });
    return match?.slug;
  }

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
    const biggestFish = Math.round(rCatches.reduce((max, c) => Math.max(max, parseFloat(String(c.length_inches || 0))), 0) * 10) / 10;
    const flyCountMap = new Map<string, number>();
    rCatches.forEach((c) => { if (c.fly_name) flyCountMap.set(c.fly_name, (flyCountMap.get(c.fly_name) || 0) + 1); });
    const favFly = Array.from(flyCountMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    const totalFishR = rSessions.reduce((sum, s) => sum + (s.total_fish || 0), 0);
    const bestSession = rSessions.reduce((max, s) => Math.max(max, s.total_fish || 0), 0);

    const resolvedRiverId = rSessions[0]?.river_id ?? undefined;
    const stats: RiverStats = {
      river_name: river,
      river_id: resolvedRiverId,
      river_slug: resolveRiverSlug(river, resolvedRiverId),
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
  const biggestFish = Math.round(allCatchesList.reduce((max, c) => Math.max(max, parseFloat(String(c.length_inches || 0))), 0) * 10) / 10;
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

  // Favorite river sections (Zone A — Favorites tab)
  const favoriteSections = await listMyFavoriteSections();
  const favoriteSectionsDTO: FavoriteSectionDTO[] = favoriteSections.map((fs) => ({
    id: fs.id,
    river_id: fs.river_id,
    river_name: fs.river_name,
    river_slug: fs.river_slug,
    usgs_site_id: fs.usgs_site_id,
    section_name: fs.section_name,
    gauge_name: fs.gauge_name,
  }));

  // "Your Rivers" — rivers the user has fished, mapped to their gauge list
  // with the user's remembered gauge choice (or best section-name match).
  const sectionPrefs = await listMyRiverSectionPrefs();
  const prefBySection = new Map(sectionPrefs.map((p) => [p.river_id, p.usgs_site_id]));

  const SECTION_TOKENS_YR = new Set([
    "upper","middle","lower","north","south","east","west",
    "fork","branch","river","creek","stream","the",
  ]);
  function coreTokensYR(s: string): string[] {
    return s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t && !SECTION_TOKENS_YR.has(t));
  }

  // Build "Your Rivers" — last 6 distinct (river, gauge section) the user has fished.
  // Iterate by recency (last_session desc), dedupe by (river_id + default_site_id).
  const yourRiversByRecency = [...riverStatsArr].sort((a, b) =>
    (b.last_session || "").localeCompare(a.last_session || "")
  );
  const yourRiversDTO: YourRiverDTO[] = [];
  const seenRiverSection = new Set<string>();
  for (const rs of yourRiversByRecency) {
    const riverId = rs.river_id;
    if (!riverId) continue;
    const river = riversById.get(riverId);
    if (!river || river.gauges.length === 0) continue;

    const preferred = prefBySection.get(riverId);
    let defaultSiteId: string | undefined = preferred;
    if (!defaultSiteId) {
      const nameTokens = coreTokensYR(rs.river_name);
      const matched = river.gauges.find((g) => {
        const sectionTokens = coreTokensYR(g.section);
        return sectionTokens.length > 0 && sectionTokens.every((t) => nameTokens.includes(t));
      });
      defaultSiteId = matched?.site_id ?? river.gauges[0].site_id;
    }

    const dedupeKey = `${riverId}::${defaultSiteId}`;
    if (seenRiverSection.has(dedupeKey)) continue;
    seenRiverSection.add(dedupeKey);

    yourRiversDTO.push({
      river_id: riverId,
      river_name: river.name,
      river_slug: river.slug,
      gauges: river.gauges,
      default_site_id: defaultSiteId,
    });

    if (yourRiversDTO.length >= 6) break;
  }

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profile}
      mySessions={mySessions || []}
      tieNextItems={tieNextItems}
      favoriteItems={favoriteItems}
      flyCount={flyCount ?? 0}
      gearCount={gearCount ?? 0}
      riverStats={riverStatsArr}
      isPremium={isPremium}
      foundersWindow={isFoundersFreeWindow()}
      foundersFreeEndIso={FOUNDERS_FREE_END.toISOString()}
      favoriteSections={favoriteSectionsDTO}
      yourRivers={yourRiversDTO}
      riversForPicker={riversForPicker}
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
