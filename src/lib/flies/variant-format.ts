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

type SlotMap = Record<string, Record<string, string | undefined> | undefined>;

/**
 * Resolve hook size / bead weight / bead material with personalizations
 * preferred over legacy columns. New writes go to personalizations only;
 * legacy columns remain populated as a back-compat mirror so older rows that
 * never touched the new flow still render correctly.
 */
function resolveVariantFields(
  v: Pick<FlyBoxEntry, "hook_size" | "bead_weight_mm" | "bead_material"> & {
    personalizations?: SlotMap | null;
  },
): {
  hookSize: string | null;
  beadWeight: number | null;
  beadMaterial: BeadMaterial | null;
} {
  const p = v.personalizations ?? {};
  const hookFromP = p.hook?.size ?? null;
  const beadWeightFromP = p.bead?.weight ? Number(p.bead.weight) : NaN;
  const beadMatFromP = p.bead?.materialType as BeadMaterial | undefined;

  const hookSize = hookFromP ?? v.hook_size ?? null;
  const beadWeight = Number.isFinite(beadWeightFromP)
    ? beadWeightFromP
    : typeof v.bead_weight_mm === "number"
      ? v.bead_weight_mm
      : null;
  const beadMaterial = (beadMatFromP ?? v.bead_material ?? null) as
    | BeadMaterial
    | null;
  return { hookSize, beadWeight, beadMaterial };
}

/** Compact one-line variant label, e.g. "#14 · 3.0T". */
export function formatVariantChip(
  v: Pick<FlyBoxEntry, "hook_size" | "bead_weight_mm" | "bead_material"> & {
    personalizations?: SlotMap | null;
  },
): string {
  const { hookSize, beadWeight, beadMaterial } = resolveVariantFields(v);
  const parts: string[] = [];
  if (hookSize)
    parts.push(hookSize.startsWith("#") ? hookSize : `#${hookSize}`);
  const beadParts: string[] = [];
  if (typeof beadWeight === "number") beadParts.push(`${beadWeight.toFixed(1)}`);
  if (beadMaterial && beadMaterial !== "none") {
    beadParts.push(MATERIAL_SHORT[beadMaterial]);
  }
  if (beadParts.length) parts.push(beadParts.join(""));
  return parts.length ? parts.join(" · ") : "Variant";
}

/** Long-form label for sheets and headings: "#14 · 3.0mm Tungsten". */
export function formatVariantLabel(
  v: Pick<
    FlyBoxEntry,
    "hook_size" | "bead_weight_mm" | "bead_material" | "variant_label"
  > & { personalizations?: SlotMap | null },
): string {
  if (v.variant_label && v.variant_label.trim().length > 0)
    return v.variant_label.trim();
  const { hookSize, beadWeight, beadMaterial } = resolveVariantFields(v);
  const parts: string[] = [];
  if (hookSize)
    parts.push(hookSize.startsWith("#") ? hookSize : `#${hookSize}`);
  if (typeof beadWeight === "number") {
    const mat =
      beadMaterial && beadMaterial !== "none" ? MATERIAL_LONG[beadMaterial] : "";
    parts.push(
      mat ? `${beadWeight.toFixed(1)}mm ${mat}`.trim() : `${beadWeight.toFixed(1)}mm`,
    );
  } else if (beadMaterial) {
    parts.push(MATERIAL_LONG[beadMaterial]);
  }
  return parts.length ? parts.join(" · ") : "Variant";
}

export const BEAD_WEIGHT_OPTIONS = [1.5, 2.0, 2.5, 2.8, 3.0, 3.3, 3.8, 4.0] as const;
export const BEAD_MATERIALS: readonly BeadMaterial[] = [
  "tungsten",
  "brass",
  "glass",
  "none",
] as const;
