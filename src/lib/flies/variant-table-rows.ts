import type { SlotOverrides } from "@/types/flies";
import type { PublicVariantRow } from "@/lib/flies/variant-rows";

export type VariantTableConfig = {
  id: string;
  size: string | null;
  slot_overrides?: SlotOverrides | null;
  tied_count?: number | null;
  bought_count?: number | null;
  target_count?: number | null;
};

export type VariantTableRow = PublicVariantRow & {
  configurationId: string | null;
  stock: number | null;
  tied: number | null;
  bought: number | null;
  target: number | null;
};

function stockOf(c: VariantTableConfig): number {
  return (c.tied_count ?? 0) + (c.bought_count ?? 0);
}

function formatConfigSize(raw: string | null | undefined): string {
  const size = raw?.trim() ?? "";
  if (!size) return "—";
  return size.startsWith("#") ? size : `#${size}`;
}

/** Bead cell from a user config: size_mm, color, material. */
export function beadLabelFromOverrides(
  overrides: SlotOverrides | null | undefined,
): string {
  const bead = overrides?.bead;
  if (!bead) return "—";
  const parts: string[] = [];
  if (typeof bead.size_mm === "number") parts.push(`${bead.size_mm}mm`);
  if (typeof bead.color === "string" && bead.color.trim()) {
    parts.push(bead.color.trim());
  }
  const material =
    typeof bead.material === "string" ? bead.material.trim() : "";
  if (material && material.toLowerCase() !== "none") parts.push(material);
  return parts.join(" ") || "—";
}

/** Body cell from a user config: body.color, or empty. */
export function bodyLabelFromOverrides(
  overrides: SlotOverrides | null | undefined,
): string {
  const color = overrides?.body?.color;
  if (typeof color === "string" && color.trim()) return color.trim();
  return "—";
}

/**
 * Catalog size rows stay Add-only. Each user config is its own row after them.
 * Do not match configs onto public rows by size — one color must not hide Add.
 */
export function mergeRows(
  publicRows: PublicVariantRow[],
  configs: VariantTableConfig[],
): VariantTableRow[] {
  const rows: VariantTableRow[] = publicRows.map((row) => ({
    ...row,
    configurationId: null,
    stock: null,
    tied: null,
    bought: null,
    target: null,
  }));

  for (const c of configs) {
    rows.push({
      key: `mine-${c.id}`,
      size: formatConfigSize(c.size),
      bead: beadLabelFromOverrides(c.slot_overrides),
      body: bodyLabelFromOverrides(c.slot_overrides),
      configurationId: c.id,
      stock: stockOf(c),
      tied: c.tied_count ?? 0,
      bought: c.bought_count ?? 0,
      target: c.target_count ?? null,
    });
  }
  return rows;
}
