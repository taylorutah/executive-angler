import type { HatchEntry, HatchMonth } from "@/types/entities";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MonthName = (typeof MONTHS)[number];

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function monthKey(raw: string): MonthName | null {
  const t = raw.trim();
  const full = MONTHS.find((m) => m.toLowerCase() === t.toLowerCase());
  if (full) return full;
  const idx = SHORT.findIndex((s) => s.toLowerCase() === t.toLowerCase());
  return idx >= 0 ? MONTHS[idx] : null;
}

export function currentMonth(now: Date = new Date()): MonthName {
  return now.toLocaleString("en-US", { month: "long", timeZone: "America/Denver" }) as MonthName;
}

export type WindowSource = "in-window" | "next-listed" | "charted-only" | "none";

export interface PlanWindow {
  /** The month the brief is written for, or null when the river carries no calendar at all. */
  month: MonthName | null;
  /** Best months as stored, normalised and calendar-ordered. */
  listedMonths: MonthName[];
  /** Hatches charted for `month`. Empty when the river has no hatch chart for it. */
  hatches: HatchEntry[];
  source: WindowSource;
  /** The month the reader is standing in, for the editorial line. */
  today: MonthName;
}

/**
 * Derive the trip window from stored data only: `bestMonths` decides when to go,
 * `hatchChart` decides what is on the water. Nothing here invents a month.
 */
export function deriveWindow(
  bestMonths: string[] | undefined,
  hatchChart: HatchMonth[] | undefined,
  now: Date = new Date(),
): PlanWindow {
  const today = currentMonth(now);
  const listedMonths = MONTHS.filter((m) =>
    (bestMonths ?? []).some((raw) => monthKey(raw) === m),
  );

  const chart = new Map<MonthName, HatchEntry[]>();
  for (const entry of hatchChart ?? []) {
    const key = monthKey(entry.month ?? "");
    if (key) chart.set(key, entry.hatches ?? []);
  }

  const hatchesFor = (month: MonthName | null) => (month ? (chart.get(month) ?? []) : []);

  if (listedMonths.includes(today)) {
    return { month: today, listedMonths, hatches: hatchesFor(today), source: "in-window", today };
  }

  if (listedMonths.length > 0) {
    const startIndex = MONTHS.indexOf(today);
    const next =
      MONTHS.slice(startIndex + 1)
        .concat(MONTHS.slice(0, startIndex + 1))
        .find((m) => listedMonths.includes(m)) ?? listedMonths[0];
    return { month: next, listedMonths, hatches: hatchesFor(next), source: "next-listed", today };
  }

  const chartedNow = chart.has(today) ? today : null;
  const firstCharted = MONTHS.find((m) => chart.has(m)) ?? null;
  const month = chartedNow ?? firstCharted;
  if (month) {
    return { month, listedMonths, hatches: hatchesFor(month), source: "charted-only", today };
  }

  return { month: null, listedMonths, hatches: [], source: "none", today };
}

/** One sentence, assembled only from stored months. Never asserts conditions. */
export function windowSentence(win: PlanWindow, riverName: string): string {
  const listed = win.listedMonths.join(", ");
  switch (win.source) {
    case "in-window":
      return `The months we list for the ${riverName} are ${listed}. You are inside that window now, so this brief is written for ${win.month}.`;
    case "next-listed":
      return `The months we list for the ${riverName} are ${listed}. ${win.today} is outside that window, so this brief is written for ${win.month}, the next month we list.`;
    case "charted-only":
      return `We do not publish a best-month window for the ${riverName}. This brief follows the hatch chart, written for ${win.month}.`;
    default:
      return `We have neither a best-month window nor a hatch chart for the ${riverName} yet. Access and regulations below are what we hold.`;
  }
}

export interface PlanFly {
  insect: string;
  size?: string;
  timeOfDay?: string;
  intensity?: HatchEntry["intensity"];
  patterns: string[];
}

/** Split stored hatch rows into insect + the patterns named for it. No pattern is added. */
export function fliesForWindow(hatches: HatchEntry[], limit = 5): PlanFly[] {
  const out: PlanFly[] = [];
  const order = { heavy: 0, moderate: 1, sparse: 2 } as const;
  const sorted = [...hatches].sort(
    (a, b) => (order[a.intensity ?? "moderate"] ?? 1) - (order[b.intensity ?? "moderate"] ?? 1),
  );
  for (const h of sorted) {
    if (!h.insect && !h.pattern) continue;
    out.push({
      insect: h.insect ?? "",
      size: h.size,
      timeOfDay: h.timeOfDay,
      intensity: h.intensity,
      patterns: (h.pattern ?? "")
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Generic gear, true of any trout river. Deliberately not river-specific:
 * anything specific to a water has to come out of the database.
 */
export const PACK_LIST = [
  "A current state fishing licence",
  "Waders and boots you have already leak-tested",
  "Net, nippers, forceps",
  "Floatant and desiccant",
  "Tippet in the sizes the chart asks for",
  "Water, sun cover, polarised glasses",
] as const;
