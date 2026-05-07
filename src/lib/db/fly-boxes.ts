/**
 * Query module for fly boxes (named, tiered containers for fly box entries)
 * and the many-to-many membership table. Schema in supabase/migrations/20260508_fly_boxes.sql.
 *
 * The user's article on the tier system:
 * https://www.executiveangler.com/articles/fly-box-tier-system
 *
 * Tiers (matching the article):
 *   kill    — chest-worn, 12-20 highest-confidence flies
 *   support — pack/vest, variations and situational patterns
 *   archive — truck/garage, modular inventory inserts
 *   custom  — anything else (trip-specific, regional, themed)
 */
import { createClient } from "@/lib/supabase/server";
import type { FlyBoxEntry } from "./fly-patterns";
import { entryStocked } from "@/lib/flies/box-stock";

export { entryStocked, entryDeficit, computeBoxStockHealth } from "@/lib/flies/box-stock";

export type FlyBoxTier = "kill" | "support" | "archive" | "custom";

export interface FlyBox {
  id: string;
  user_id: string;
  name: string;
  tier: FlyBoxTier;
  description?: string | null;
  icon?: string | null;
  cover_image_url?: string | null;
  sort_order: number;
  is_default: boolean;
  total_capacity?: number | null;
  created_at: string;
  updated_at: string;
}

export interface FlyBoxWithStats extends FlyBox {
  fly_count: number;
  total_quantity: number;
  total_target: number;
  low_stock_count: number;
}

/** All boxes for a user, with fly counts. Ordered by tier (kill → custom) then sort_order. */
export async function getMyBoxes(userId: string): Promise<FlyBoxWithStats[]> {
  const supabase = await createClient();
  const { data: boxes, error } = await supabase
    .from("fly_boxes")
    .select("*")
    .eq("user_id", userId)
    .order("tier", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[getMyBoxes] error:", error);
    return [];
  }
  if (!boxes || boxes.length === 0) return [];

  // Aggregate counts per box from fly_box_membership.
  const boxIds = boxes.map((b) => b.id);
  const { data: memberships } = await supabase
    .from("fly_box_membership")
    .select("box_id, user_fly_box:user_fly_box_id (id, quantity_by_size, tied_count, target_count)")
    .in("box_id", boxIds);

  type BoxStats = {
    fly_count: number;
    total_quantity: number;
    total_target: number;
    low_stock_count: number;
  };
  const empty = (): BoxStats => ({
    fly_count: 0,
    total_quantity: 0,
    total_target: 0,
    low_stock_count: 0,
  });
  const countByBox = new Map<string, BoxStats>();
  for (const m of memberships ?? []) {
    const stats = countByBox.get(m.box_id) ?? empty();
    stats.fly_count += 1;
    const ufbField = (m as unknown as { user_fly_box?: unknown }).user_fly_box;
    const ufb = (Array.isArray(ufbField) ? ufbField[0] : ufbField) as
      | {
          quantity_by_size?: Record<string, number> | null;
          tied_count?: number | null;
          target_count?: number | null;
        }
      | undefined;
    const stocked = entryStocked({
      quantity_by_size: ufb?.quantity_by_size ?? undefined,
      tied_count: ufb?.tied_count ?? undefined,
    });
    const target = typeof ufb?.target_count === "number" ? ufb.target_count : 0;
    stats.total_quantity += stocked;
    stats.total_target += target;
    if (target > 0 && stocked < target) stats.low_stock_count += 1;
    countByBox.set(m.box_id, stats);
  }

  return boxes.map((b) => {
    const s = countByBox.get(b.id) ?? empty();
    return {
      ...(b as FlyBox),
      fly_count: s.fly_count,
      total_quantity: s.total_quantity,
      total_target: s.total_target,
      low_stock_count: s.low_stock_count,
    };
  });
}

/** Single box by id (must belong to user via RLS). */
export async function getBoxById(boxId: string): Promise<FlyBox | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_boxes")
    .select("*")
    .eq("id", boxId)
    .maybeSingle();
  if (error) {
    console.error("[getBoxById] error:", error);
    return null;
  }
  return (data as FlyBox | null) ?? null;
}

/** All fly box entries that belong to the given box (via membership join). */
export async function getEntriesInBox(boxId: string): Promise<FlyBoxEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_box_membership")
    .select(
      `
      user_fly_box:user_fly_box_id (
        id,
        canonical_fly_id,
        fly_pattern_id,
        preferred_sizes,
        personal_notes,
        custom_image_url,
        custom_name,
        personalizations,
        is_favorite,
        is_tie_next,
        tie_next_status,
        tie_next_target_qty,
        tie_next_notes,
        times_used,
        quantity_by_size,
        last_loss_at,
        added_at,
        variant_label,
        is_primary,
        variant_sort_order,
        tied_count,
        bead_weight_mm,
        bead_material,
        hook_size,
        target_count,
        canonical_fly:canonical_flies (
          id, slug, name, category, tagline, sizes, colors, bead_options,
          hook_styles, hero_image_url, materials_list
        )
      )
    `,
    )
    .eq("box_id", boxId)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[getEntriesInBox] error:", error);
    return [];
  }
  const entries: FlyBoxEntry[] = [];
  for (const row of data ?? []) {
    const ufbField = (row as unknown as { user_fly_box?: unknown }).user_fly_box;
    const ufb = Array.isArray(ufbField) ? ufbField[0] : ufbField;
    if (ufb) entries.push(ufb as unknown as FlyBoxEntry);
  }
  return entries;
}

/** All boxes that contain a given user_fly_box entry. */
export async function getBoxesContainingEntry(userFlyBoxId: string): Promise<FlyBox[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_box_membership")
    .select("box:box_id (id, user_id, name, tier, description, icon, cover_image_url, sort_order, is_default, total_capacity, created_at, updated_at)")
    .eq("user_fly_box_id", userFlyBoxId);
  if (error) {
    console.error("[getBoxesContainingEntry] error:", error);
    return [];
  }
  const boxes: FlyBox[] = [];
  for (const row of data ?? []) {
    const boxField = (row as unknown as { box?: unknown }).box;
    const box = Array.isArray(boxField) ? boxField[0] : boxField;
    if (box) boxes.push(box as FlyBox);
  }
  return boxes;
}
