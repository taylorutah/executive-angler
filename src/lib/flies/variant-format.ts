import type { BeadMaterial, FlyBoxEntry } from "@/lib/db/fly-patterns";

const MATERIAL_SHORT: Record<BeadMaterial, string> = {
  tungsten: "T",
  brass: "B",
  glass: "G",
  none: "—",
};

const MATERIAL_LONG: Record<BeadMaterial, string> = {
  tungsten: "Tungsten",
  brass: "Brass",
  glass: "Glass",
  none: "No bead",
};

/** Compact one-line variant label, e.g. "#14 · 3.0T". */
export function formatVariantChip(v: Pick<FlyBoxEntry, "hook_size" | "bead_weight_mm" | "bead_material">): string {
  const parts: string[] = [];
  if (v.hook_size) parts.push(v.hook_size.startsWith("#") ? v.hook_size : `#${v.hook_size}`);
  const beadParts: string[] = [];
  if (typeof v.bead_weight_mm === "number") beadParts.push(`${v.bead_weight_mm.toFixed(1)}`);
  if (v.bead_material && v.bead_material !== "none") {
    beadParts.push(MATERIAL_SHORT[v.bead_material]);
  }
  if (beadParts.length) parts.push(beadParts.join(""));
  return parts.length ? parts.join(" · ") : "Variant";
}

/** Long-form label for sheets and headings: "#14 · 3.0mm Tungsten". */
export function formatVariantLabel(
  v: Pick<FlyBoxEntry, "hook_size" | "bead_weight_mm" | "bead_material" | "variant_label">
): string {
  if (v.variant_label && v.variant_label.trim().length > 0) return v.variant_label.trim();
  const parts: string[] = [];
  if (v.hook_size) parts.push(v.hook_size.startsWith("#") ? v.hook_size : `#${v.hook_size}`);
  if (typeof v.bead_weight_mm === "number") {
    const mat = v.bead_material && v.bead_material !== "none" ? MATERIAL_LONG[v.bead_material] : "";
    parts.push(mat ? `${v.bead_weight_mm.toFixed(1)}mm ${mat}`.trim() : `${v.bead_weight_mm.toFixed(1)}mm`);
  } else if (v.bead_material) {
    parts.push(MATERIAL_LONG[v.bead_material]);
  }
  return parts.length ? parts.join(" · ") : "Variant";
}

export const BEAD_WEIGHT_OPTIONS = [1.5, 2.0, 2.5, 2.8, 3.0, 3.3, 3.8, 4.0] as const;
export const BEAD_MATERIALS: readonly BeadMaterial[] = ["tungsten", "brass", "glass", "none"] as const;
