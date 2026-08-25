/**
 * Which place pages the image gate walks.
 *
 * Read off the links on `/destinations` so the list maintains itself: a place
 * added to the database is checked on the next run without anyone editing the
 * script. Falls back to a hand-kept list when discovery finds nothing.
 */

/** Places worth checking when `/destinations` cannot be read. */
export const FALLBACK_PLACES = [
  "montana",
  "wyoming",
  "idaho",
  "colorado",
  "belize",
  "new-zealand",
] as const;

/** Keep `/destinations/montana`; drop the index, deep links, queries and hashes. */
export function placePathsFromHrefs(hrefs: readonly string[]): string[] {
  const paths = new Set<string>();
  for (const href of hrefs) {
    if (!href) continue;
    const clean = href.split("?")[0].split("#")[0].replace(/\/$/, "");
    if (/^\/destinations\/[^/]+$/.test(clean)) paths.add(clean);
  }
  return [...paths].sort();
}

export function fallbackPlacePaths(): string[] {
  return FALLBACK_PLACES.map((slug) => `/destinations/${slug}`);
}
