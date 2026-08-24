import type { SearchDocument } from "./types";
import { normalizeText } from "./normalize";

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

/** Closest title in the index, or undefined if nothing is reasonably close. */
export function suggestDocument(
  query: string,
  docs: SearchDocument[],
): SearchDocument | undefined {
  const q = normalizeText(query);
  if (q.length < 3) return undefined;
  let best: SearchDocument | undefined;
  let bestDist = Infinity;
  for (const doc of docs) {
    const t = normalizeText(doc.title);
    const d = Math.min(
      levenshtein(q, t),
      t.length >= 4 ? levenshtein(q.slice(0, t.length), t) : Infinity,
    );
    if (d < bestDist) {
      bestDist = d;
      best = doc;
    }
  }
  if (!best) return undefined;
  const max = Math.max(3, Math.floor(q.length * 0.6));
  if (bestDist > max) return undefined;
  return best;
}
