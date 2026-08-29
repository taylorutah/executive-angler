/**
 * Shared hover-panel helpers. Formatters only — they do not invent facts.
 */

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Collapse stored month names into "Apr–Jun, Sep–Oct". Drops unparseable tokens. */
export function formatBestMonthsLine(months: string[]): string {
  const idxs = [
    ...new Set(
      (months ?? [])
        .map((m) => MONTH_INDEX[m.trim().toLowerCase()])
        .filter((n): n is number => n !== undefined),
    ),
  ].sort((a, b) => a - b);
  if (idxs.length === 0) return "";

  const ranges: [number, number][] = [];
  let start = idxs[0];
  let prev = idxs[0];
  for (let i = 1; i < idxs.length; i++) {
    if (idxs[i] === prev + 1) {
      prev = idxs[i];
      continue;
    }
    ranges.push([start, prev]);
    start = idxs[i];
    prev = idxs[i];
  }
  ranges.push([start, prev]);

  return ranges
    .map(([a, b]) => (a === b ? MONTH_ABBR[a] : `${MONTH_ABBR[a]}–${MONTH_ABBR[b]}`))
    .join(", ");
}

/** First 2–3 sentences of stored prose, clamped at a word boundary. */
export function excerptBrief(description: string, maxChars = 280): string {
  const text = (description ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const sentences =
    text.match(/[^.!?]+[.!?]+(?:\s|$)/g)?.map((s) => s.trim()) ?? (text ? [text] : []);
  let out = "";
  for (let i = 0; i < sentences.length && i < 3; i++) {
    const next = out ? `${out} ${sentences[i]}` : sentences[i];
    if (next.length > maxChars) {
      if (!out) {
        const cut = next.slice(0, maxChars);
        const space = cut.lastIndexOf(" ");
        return `${(space > 80 ? cut.slice(0, space) : cut).replace(/[.,;:]+$/, "")}…`;
      }
      break;
    }
    out = next;
  }
  return out;
}

/** Title-case a stored token. Does not invent a value. */
export function titleCaseToken(value: string): string | undefined {
  const raw = (value ?? "").trim();
  if (!raw) return undefined;
  return raw
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export type HoverChip = { label: string; value: string };

export type HoverPanelData = {
  chips: HoverChip[];
  brief?: string;
  footer?: string;
};
