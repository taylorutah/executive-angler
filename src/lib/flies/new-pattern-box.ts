/**
 * New Pattern placement — pick a box for a freshly created private fly
 * without inventing "My Fly Box" when the user already has named boxes.
 *
 * Used by POST /api/fishing/flies (auto-config path). Keep this module
 * side-effect free so the picker can be unit-tested without a DB.
 */

export type FlyBoxPickRow = {
  id: string;
  is_default: boolean;
  created_at: string;
};

/**
 * Box pick order:
 *   1. is_default=true (any one)
 *   2. oldest existing box (created_at asc)
 *   3. null — caller creates "My Fly Box" only when the list is empty
 */
export function pickTargetFlyBoxId(boxes: FlyBoxPickRow[]): string | null {
  if (boxes.length === 0) return null;
  const defaultBox = boxes.find((b) => b.is_default);
  if (defaultBox) return defaultBox.id;
  const oldest = [...boxes].sort((a, b) =>
    a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
  );
  return oldest[0]?.id ?? null;
}

/** First cleaned hook size: strip #, split on comma, take first non-empty. */
export function firstHookSize(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const text = String(raw);
  const first = text
    .split(",")
    .map((part) => part.trim().replace(/^#+/, "").trim())
    .find((part) => part.length > 0);
  return first || undefined;
}

export function autoConfigCountsFromSource(source: unknown): {
  tied_count: number;
  bought_count: number;
} {
  const s = typeof source === "string" ? source.toLowerCase() : "";
  if (s === "bought") return { tied_count: 0, bought_count: 1 };
  return { tied_count: 0, bought_count: 0 };
}

/** Row shape written to fly_box_entries_v3 after auto-config insert. */
export function newPatternBoxEntry(
  boxId: string,
  configurationId: string,
  userId: string,
): {
  box_id: string;
  configuration_id: string;
  user_id: string;
  sort_order: number;
} {
  return {
    box_id: boxId,
    configuration_id: configurationId,
    user_id: userId,
    sort_order: 0,
  };
}
