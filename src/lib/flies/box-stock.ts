/**
 * Pure stock-math helpers for the Flies hub. Lives outside src/lib/db so
 * client components ("use client") can import without dragging in the
 * server-only Supabase + next/headers dependency chain.
 */
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";

/**
 * Pre-variant-migration stub: a user_fly_box row that points at a canonical
 * fly but has no size / bead / variant_label of its own. These rows can't link
 * a catch to a specific variant and show as bare pattern names with no chip,
 * so the Fly Box UI filters them out.
 */
export function isStubEntry(
  e: Pick<FlyBoxEntry, "variant_label" | "hook_size" | "bead_weight_mm" | "bead_material">,
): boolean {
  if (e.variant_label && e.variant_label.trim().length > 0) return false;
  if (e.hook_size && e.hook_size.trim().length > 0) return false;
  if (typeof e.bead_weight_mm === "number") return false;
  if (e.bead_material && e.bead_material !== "none") return false;
  return true;
}

/** Per-entry stocked total: prefers quantity_by_size sum, falls back to tied_count. */
export function entryStocked(
  e: Pick<FlyBoxEntry, "tied_count" | "quantity_by_size">,
): number {
  if (e.quantity_by_size) {
    let sum = 0;
    for (const v of Object.values(e.quantity_by_size)) {
      if (typeof v === "number") sum += v;
    }
    return sum;
  }
  return typeof e.tied_count === "number" ? e.tied_count : 0;
}

/** Per-entry deficit: how many more of this variant the user wants to tie. */
export function entryDeficit(
  e: Pick<FlyBoxEntry, "target_count" | "tied_count" | "quantity_by_size">,
): number {
  const target = typeof e.target_count === "number" ? e.target_count : 0;
  const stocked = entryStocked(e);
  return Math.max(target - stocked, 0);
}

/** Aggregate stock health for a box. Used on the box card and Boxes table. */
export function computeBoxStockHealth(entries: FlyBoxEntry[]): {
  stocked: number;
  target: number;
  deficit: number;
  lowStockCount: number;
} {
  let stocked = 0;
  let target = 0;
  let deficit = 0;
  let lowStockCount = 0;
  for (const e of entries) {
    const s = entryStocked(e);
    const t = typeof e.target_count === "number" ? e.target_count : 0;
    stocked += s;
    target += t;
    if (t > 0 && s < t) {
      deficit += t - s;
      lowStockCount += 1;
    }
  }
  return { stocked, target, deficit, lowStockCount };
}
