/** Calendar months used by the place seasonal chart. Data-only — no hatch claims. */
export const CALENDAR_MONTHS = [
  { short: "Jan", full: "January" },
  { short: "Feb", full: "February" },
  { short: "Mar", full: "March" },
  { short: "Apr", full: "April" },
  { short: "May", full: "May" },
  { short: "Jun", full: "June" },
  { short: "Jul", full: "July" },
  { short: "Aug", full: "August" },
  { short: "Sep", full: "September" },
  { short: "Oct", full: "October" },
  { short: "Nov", full: "November" },
  { short: "Dec", full: "December" },
] as const;

function monthKey(value: string): string {
  return value.trim().toLowerCase();
}

export function isBestMonth(
  month: { short: string; full: string },
  bestMonths: string[],
): boolean {
  const set = new Set((bestMonths ?? []).map(monthKey));
  return set.has(monthKey(month.full)) || set.has(monthKey(month.short));
}

/** Render dest.bestMonths as a phrase. Does not invent months. */
export function formatBestMonthsLabel(bestMonths: string[]): string {
  const months = (bestMonths ?? []).map((m) => m.trim()).filter(Boolean);
  if (months.length === 0) return "";
  if (months.length === 1) return months[0];
  if (months.length === 2) return `${months[0]} and ${months[1]}`;
  return `${months[0]} through ${months[months.length - 1]}`;
}

/**
 * Lift a pull quote from existing essay text. Returns null rather than
 * inventing a sentence.
 */
export function pullQuoteFromEssay(description: string): string | null {
  const sentences =
    description
      .replace(/\s+/g, " ")
      .match(/[^.!?]+[.!?]/g)
      ?.map((s) => s.trim())
      .filter((s) => s.length >= 70 && s.length <= 220) ?? [];
  if (sentences.length === 0) return null;
  return sentences[1] ?? sentences[0] ?? null;
}
