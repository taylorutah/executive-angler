/**
 * Favorite river sections (dashboard) — list / add / remove / reorder + the
 * per-river "which gauge" preference used by the Your Rivers tab.
 *
 * Sections are identified by (river_id, usgs_site_id). The site_id lives
 * inside rivers.usgs_gauge_id JSONB; this module returns the joined gauge
 * metadata so callers can render section names without re-parsing.
 */
import { createClient } from "@/lib/supabase/server";

export interface GaugeEntry {
  site_id: string;
  name: string;
  section: string;
}

export interface FavoriteSection {
  id: string;
  river_id: string;
  river_name: string;
  river_slug: string;
  usgs_site_id: string;
  section_name: string;
  gauge_name: string;
  position: number;
}

export interface RiverSectionPref {
  river_id: string;
  usgs_site_id: string;
}

function parseGauges(raw: unknown): GaugeEntry[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as GaugeEntry[];
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed.startsWith("[")) return [];
    try {
      return JSON.parse(trimmed) as GaugeEntry[];
    } catch {
      return [];
    }
  }
  return [];
}

/** All favorite sections for the current user, ordered by position. */
export async function listMyFavoriteSections(): Promise<FavoriteSection[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("user_favorite_sections")
    .select("id, river_id, usgs_site_id, position")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !rows || rows.length === 0) return [];

  const riverIds = Array.from(new Set(rows.map((r) => r.river_id)));
  const { data: rivers } = await supabase
    .from("rivers")
    .select("id, name, slug, usgs_gauge_id")
    .in("id", riverIds);

  const riverMap = new Map<string, { name: string; slug: string; gauges: GaugeEntry[] }>();
  (rivers || []).forEach((r: { id: string; name: string; slug: string; usgs_gauge_id: unknown }) => {
    riverMap.set(r.id, {
      name: r.name,
      slug: r.slug,
      gauges: parseGauges(r.usgs_gauge_id),
    });
  });

  const result: FavoriteSection[] = [];
  for (const row of rows) {
    const river = riverMap.get(row.river_id);
    if (!river) continue;
    const gauge = river.gauges.find((g) => g.site_id === row.usgs_site_id);
    if (!gauge) continue;
    result.push({
      id: row.id,
      river_id: row.river_id,
      river_name: river.name,
      river_slug: river.slug,
      usgs_site_id: row.usgs_site_id,
      section_name: gauge.section,
      gauge_name: gauge.name,
      position: row.position,
    });
  }
  return result;
}

/**
 * Rivers the user asked to keep (heart / Learn "Keep this list") that are not
 * already a pinned section. `/favorites` permanently redirects to
 * `/rivers/mine`, so this list is the only surface those rows have.
 * Today still reads `listMyFavoriteSections` only — no gauge, no flow.
 */
export async function listMyFavoritedRiversMissingSections(): Promise<FavoriteSection[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: favs, error: favError } = await supabase
    .from("user_favorites")
    .select("entity_id")
    .eq("user_id", user.id)
    .eq("entity_type", "river");
  if (favError || !favs?.length) return [];

  const { data: sectionRows } = await supabase
    .from("user_favorite_sections")
    .select("river_id")
    .eq("user_id", user.id);
  const covered = new Set((sectionRows ?? []).map((r) => r.river_id));
  const missingIds = [...new Set(favs.map((f) => f.entity_id).filter((id) => !covered.has(id)))];
  if (missingIds.length === 0) return [];

  const { data: rivers } = await supabase
    .from("rivers")
    .select("id, name, slug")
    .in("id", missingIds);
  if (!rivers?.length) return [];

  return rivers.map((r) => ({
    id: `favorite:${r.id}`,
    river_id: r.id,
    river_name: r.name,
    river_slug: r.slug,
    usgs_site_id: "",
    section_name: "",
    gauge_name: "",
    position: Number.MAX_SAFE_INTEGER,
  }));
}

/** Insert a favorite section at the end of the user's list. */
export async function addFavoriteSection(
  riverId: string,
  usgsSiteId: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: maxRow } = await supabase
    .from("user_favorite_sections")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (maxRow?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("user_favorite_sections")
    .insert({
      user_id: user.id,
      river_id: riverId,
      usgs_site_id: usgsSiteId,
      position: nextPosition,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("user_favorite_sections")
        .select("id")
        .eq("user_id", user.id)
        .eq("river_id", riverId)
        .eq("usgs_site_id", usgsSiteId)
        .maybeSingle();
      if (existing?.id) return { id: existing.id };
    }
    return { error: error.message };
  }
  return { id: data.id };
}

export async function removeFavoriteSection(
  id: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_favorite_sections")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  return { ok: true };
}

/** Apply a new ordering. `orderedIds` is the new sequence of row ids. */
export async function reorderFavoriteSections(
  orderedIds: string[]
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates = orderedIds.map((id, position) =>
    supabase
      .from("user_favorite_sections")
      .update({ position })
      .eq("id", id)
      .eq("user_id", user.id)
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) return { error: firstError.error.message };
  return { ok: true };
}

/** All "Your Rivers" gauge preferences for the current user. */
export async function listMyRiverSectionPrefs(): Promise<RiverSectionPref[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_river_section_pref")
    .select("river_id, usgs_site_id")
    .eq("user_id", user.id);
  return (data ?? []) as RiverSectionPref[];
}

export async function upsertRiverSectionPref(
  riverId: string,
  usgsSiteId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_river_section_pref")
    .upsert({
      user_id: user.id,
      river_id: riverId,
      usgs_site_id: usgsSiteId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,river_id" });
  if (error) return { error: error.message };
  return { ok: true };
}
