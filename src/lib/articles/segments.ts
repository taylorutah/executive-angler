/**
 * Split a stored article body into segments at top-level `<h2>` boundaries so
 * a pull quote or a stat block can sit between them.
 *
 * The alternative — rendering those components inside the body wrapper — does
 * not work: the `.article-body` element rules for `blockquote` and `aside` are
 * unlayered, so they beat any utility class the components carry. Interruptions
 * sit in `.article-interrupt` (the prose column, no callout chrome).
 * Breaking the wrapper leaves the stored HTML entirely untouched.
 */
export function splitBodyAtHeadings(
  html: string,
  breakBefore: number[],
): string[] {
  const positions: number[] = [];
  const pattern = /<h2[\s>]/gi;
  for (let m = pattern.exec(html); m; m = pattern.exec(html)) {
    positions.push(m.index);
  }

  const cuts = [...new Set(breakBefore)]
    .map((i) => positions[i])
    .filter((p): p is number => p !== undefined && p > 0)
    .sort((a, b) => a - b);

  const segments: string[] = [];
  let from = 0;
  for (const cut of cuts) {
    segments.push(html.slice(from, cut));
    from = cut;
  }
  segments.push(html.slice(from));
  return segments.filter((s) => s.trim().length > 0);
}
