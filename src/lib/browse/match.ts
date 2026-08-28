import type { FilterDimension, FilterMatch } from "@/types/list-config";

export type FilterValue = string | number;

/**
 * Shared browse matching. Exact is the historical EntityListView behavior.
 * Contains / range / flag are how Lane L filters actually answer questions.
 */
export function itemMatchesFilters(
  filterVals: Record<string, FilterValue> | undefined,
  activeFilters: Record<string, string>,
  dimensions: FilterDimension[],
): boolean {
  const entries = Object.entries(activeFilters).filter(([, v]) => v);
  if (entries.length === 0) return true;
  if (!filterVals) return false;

  const byKey = new Map(dimensions.map((d) => [d.key, d]));
  for (const [key, activeVal] of entries) {
    const match: FilterMatch = byKey.get(key)?.match ?? "exact";
    if (!valueMatches(match, filterVals[key], activeVal)) return false;
  }
  return true;
}

export function valueMatches(
  match: FilterMatch,
  itemVal: FilterValue | undefined,
  activeVal: string,
): boolean {
  if (itemVal === undefined || itemVal === "") return false;
  const raw = String(itemVal);

  if (match === "exact") return raw === activeVal;
  if (match === "flag") return raw === "1" || raw === "true";
  if (match === "contains") {
    const tokens = tokenize(raw);
    return tokens.has(activeVal.trim().toLowerCase());
  }
  if (match === "range") {
    const bounds = parseRange(activeVal);
    if (!bounds) return false;
    return parseSizes(raw).some((n) => n >= bounds.min && n <= bounds.max);
  }
  return raw === activeVal;
}

export function tokenize(value: string): Set<string> {
  return new Set(
    value
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Parse "14-16", "14–16", or "14" into inclusive bounds. */
export function parseRange(value: string): { min: number; max: number } | null {
  const cleaned = value.replace(/[#\s]/g, "").replace("–", "-");
  const parts = cleaned.split("-").filter(Boolean);
  if (parts.length === 1) {
    const n = Number(parts[0]);
    return Number.isFinite(n) ? { min: n, max: n } : null;
  }
  if (parts.length >= 2) {
    const min = Number(parts[0]);
    const max = Number(parts[1]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return min <= max ? { min, max } : { min: max, max: min };
  }
  return null;
}

/**
 * Hook sizes as stored on flies ("18", "#16", "14-16") or a comma list.
 * Smaller number = larger hook; we still treat them as numeric bounds.
 */
export function parseSizes(value: string): number[] {
  const out: number[] = [];
  for (const chunk of value.split(/[,/]/)) {
    const bounds = parseRange(chunk);
    if (!bounds) continue;
    if (bounds.min === bounds.max) {
      out.push(bounds.min);
    } else {
      const lo = Math.min(bounds.min, bounds.max);
      const hi = Math.max(bounds.min, bounds.max);
      for (let n = lo; n <= hi; n++) out.push(n);
    }
  }
  return out;
}

/**
 * Edit distance ≤ 1 check (insert/delete/substitute one character). Linear
 * time, no DP. Used for typo-tolerant search ("wolly" matches "woolly").
 *
 * Verbatim copy of EntityListView's private helper so the articles browser
 * searches identically. EntityListView keeps its own copy — shared browse
 * components are frozen to token-level changes this phase.
 */
export function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length === b.length) {
      i++;
      j++;
    } else {
      j++;
    }
  }
  return true;
}

/** Typo-tolerant haystack match — same rule as EntityListView search. */
export function haystackMatchesQuery(haystack: string, queryWords: string[]): boolean {
  // Tokenize haystack once for fuzzy comparisons.
  const tokens = haystack.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  for (const q of queryWords) {
    if (haystack.includes(q)) continue;
    if (q.length >= 4 && tokens.some((t) => withinOneEdit(t, q))) continue;
    return false;
  }
  return true;
}
