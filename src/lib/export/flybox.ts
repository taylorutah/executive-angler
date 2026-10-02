/**
 * Fly-box inventory export — shared query + row builder for CSV and PDF.
 *
 * Reads live v3 membership (`fly_box_entries_v3` + configurations + flies).
 * Does not use listVariantsInBox (stale hardcoded box_quantity).
 */
import { summarizeVersion } from "@/components/flies-v3/summarize-version";
import { DEFAULT_TIER_DEFINITIONS } from "@/lib/flies/tier-definitions";
import { slugify } from "@/lib/utils";
import type { SlotOverrides } from "@/types/flies";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export const FLYBOX_CSV_HEADERS = [
  "Box",
  "Tier",
  "Fly",
  "Version",
  "Size",
  "Tied",
  "Bought",
  "Total",
  "Target",
  "Need",
] as const;

export type FlyboxExportBox = {
  id: string;
  name: string;
  tier: string;
  description: string | null;
  sort_order: number;
};

export type FlyboxExportRow = {
  boxId: string;
  boxName: string;
  tier: string;
  flyName: string;
  version: string;
  size: string;
  tied: number;
  bought: number;
  total: number;
  target: number;
  need: number;
  sortOrder: number;
};

export type FlyboxExportData = {
  boxes: FlyboxExportBox[];
  rows: FlyboxExportRow[];
  exportedAll: boolean;
};

export type FlyboxSelection =
  | { kind: "all" }
  | { kind: "ids"; ids: string[] }
  | { kind: "empty" };

export function parseFlyboxSelection(searchParams: URLSearchParams): FlyboxSelection {
  if (searchParams.get("all") === "1") return { kind: "all" };
  const raw = searchParams.get("ids");
  if (raw == null) return { kind: "empty" };
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return { kind: "empty" };
  return { kind: "ids", ids };
}

export function inventoryCounts(
  tied: number | null | undefined,
  bought: number | null | undefined,
  target: number | null | undefined,
): { tied: number; bought: number; total: number; target: number; need: number } {
  const t = tied ?? 0;
  const b = bought ?? 0;
  const tgt = target ?? 0;
  const total = t + b;
  return { tied: t, bought: b, total, target: tgt, need: Math.max(0, tgt - total) };
}

export function escapeCsv(val: string): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function formatTierLabel(tier: string): string {
  const known = DEFAULT_TIER_DEFINITIONS.find((t) => t.key === tier);
  if (known) return known.label;
  if (!tier) return "";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function flyboxExportFilename(
  boxes: Pick<FlyboxExportBox, "name">[],
  ext: "csv" | "pdf",
): string {
  if (boxes.length === 1) {
    const slug = slugify(boxes[0].name) || "box";
    return `executive-angler-flybox-${slug}.${ext}`;
  }
  return `executive-angler-flybox.${ext}`;
}

export function selectionSubtitle(
  exportedAll: boolean,
  boxes: Pick<FlyboxExportBox, "name">[],
): string {
  if (exportedAll) return "All boxes";
  return boxes.map((b) => b.name).join(", ");
}

export function summarizeExport(rows: FlyboxExportRow[]): {
  versions: number;
  tied: number;
  bought: number;
  need: number;
} {
  return rows.reduce(
    (acc, r) => {
      acc.versions += 1;
      acc.tied += r.tied;
      acc.bought += r.bought;
      acc.need += r.need;
      return acc;
    },
    { versions: 0, tied: 0, bought: 0, need: 0 },
  );
}

export function buildFlyboxCsv(rows: FlyboxExportRow[]): string {
  const lines = [
    FLYBOX_CSV_HEADERS.map((h) => escapeCsv(h)).join(","),
    ...rows.map((r) =>
      [
        r.boxName,
        formatTierLabel(r.tier),
        r.flyName,
        r.version,
        r.size,
        String(r.tied),
        String(r.bought),
        String(r.total),
        String(r.target),
        String(r.need),
      ]
        .map(escapeCsv)
        .join(","),
    ),
  ];
  return "\uFEFF" + lines.join("\n");
}

export function assembleFlyboxRows(
  boxes: FlyboxExportBox[],
  entries: Array<{
    boxId: string;
    sortOrder: number;
    flyName: string;
    nickname: string | null;
    size: string | null;
    slotOverrides: SlotOverrides | null;
    tied: number | null;
    bought: number | null;
    target: number | null;
  }>,
): FlyboxExportRow[] {
  const boxById = new Map(boxes.map((b) => [b.id, b]));
  const boxIndex = new Map(boxes.map((b, i) => [b.id, i]));
  const rows: FlyboxExportRow[] = [];

  for (const entry of entries) {
    const box = boxById.get(entry.boxId);
    if (!box) continue;
    const counts = inventoryCounts(entry.tied, entry.bought, entry.target);
    rows.push({
      boxId: box.id,
      boxName: box.name,
      tier: box.tier,
      flyName: entry.flyName,
      version: summarizeVersion({
        nickname: entry.nickname,
        size: entry.size,
        slot_overrides: entry.slotOverrides ?? {},
      }),
      size: entry.size ?? "",
      ...counts,
      sortOrder: entry.sortOrder,
    });
  }

  rows.sort((a, b) => {
    const ai = boxIndex.get(a.boxId) ?? 0;
    const bi = boxIndex.get(b.boxId) ?? 0;
    if (ai !== bi) return ai - bi;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.flyName.localeCompare(b.flyName);
  });

  return rows;
}

function firstEmbed<T>(value: unknown): T | null {
  if (value == null) return null;
  return (Array.isArray(value) ? value[0] : value) as T;
}

export async function loadFlyboxExport(
  supabase: SupabaseServer,
  userId: string,
  selection: Exclude<FlyboxSelection, { kind: "empty" }>,
): Promise<{ ok: true; data: FlyboxExportData } | { ok: false; error: string }> {
  const { data: rawBoxes, error: boxesError } = await supabase
    .from("fly_boxes")
    .select("id, name, tier, description, sort_order")
    .eq("user_id", userId)
    .order("tier")
    .order("sort_order")
    .order("created_at");

  if (boxesError) throw boxesError;

  const owned = (rawBoxes ?? []) as FlyboxExportBox[];
  const selected =
    selection.kind === "all"
      ? owned
      : owned.filter((b) => selection.ids.includes(b.id));

  if (selected.length === 0) {
    return { ok: false, error: "No boxes selected" };
  }

  const selectedBoxIds = selected.map((b) => b.id);

  const { data: rawEntries, error: entriesError } = await supabase
    .from("fly_box_entries_v3")
    .select(`
      id, sort_order, added_at, box_id,
      configuration:user_fly_configurations!fly_box_entries_v3_configuration_id_fkey(
        id, nickname, size, slot_overrides,
        tied_count, bought_count, target_count,
        is_favorite, is_tie_next,
        fly:flies(id, slug, name, category, hero_image_url)
      )
    `)
    .eq("user_id", userId)
    .in("box_id", selectedBoxIds)
    .order("sort_order")
    .order("added_at");

  if (entriesError) throw entriesError;

  const entries: Parameters<typeof assembleFlyboxRows>[1] = [];
  for (const row of rawEntries ?? []) {
    const rec = row as {
      box_id?: string;
      sort_order?: number;
      configuration?: unknown;
    };
    const cfg = firstEmbed<{
      nickname?: string | null;
      size?: string | null;
      slot_overrides?: SlotOverrides | null;
      tied_count?: number | null;
      bought_count?: number | null;
      target_count?: number | null;
      fly?: unknown;
    }>(rec.configuration);
    if (!cfg) continue;
    const fly = firstEmbed<{ name?: string | null }>(cfg.fly);
    if (!fly?.name || !rec.box_id) continue;
    entries.push({
      boxId: rec.box_id,
      sortOrder: rec.sort_order ?? 0,
      flyName: fly.name,
      nickname: cfg.nickname ?? null,
      size: cfg.size ?? null,
      slotOverrides: cfg.slot_overrides ?? {},
      tied: cfg.tied_count ?? null,
      bought: cfg.bought_count ?? null,
      target: cfg.target_count ?? null,
    });
  }

  return {
    ok: true,
    data: {
      boxes: selected,
      rows: assembleFlyboxRows(selected, entries),
      exportedAll: selection.kind === "all",
    },
  };
}
