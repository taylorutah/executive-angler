import type { Article, CanonicalFly, River } from "@/types/entities";
import { normalizeText } from "@/lib/search/normalize";
import { expandTerm } from "@/lib/search/aliases";

/**
 * A field note ends on two rivers and two flies keyed on what the piece is
 * actually about, not on its tags. Tags are editorial labels; a tag of
 * "montana" says nothing about which two of thirty-one Montana rivers the
 * writer spent four hundred words on.
 *
 * Signal is taken in tiers, strongest first, and nothing is invented. When a
 * piece has no river signal at all — a rod-selection guide, a photography
 * essay — it ends on fewer than two, or on none. Padding the rail with
 * arbitrary rivers would be a fishing claim the database does not make.
 */

export const RELATED_COUNT = 2;

/** Title and standfirst carry more subject weight than a passing body mention. */
const LEDE_WEIGHT = 4;

interface Scored<T> {
  item: T;
  score: number;
}

/** Stored bodies are HTML. Strip tags before matching so markup can't mask a name. */
export function articleSubjectText(article: Article): {
  lede: string;
  body: string;
} {
  const lede = normalizeText(
    [article.title, article.subtitle, article.excerpt].filter(Boolean).join(" "),
  );
  const body = normalizeText(stripTags(article.content ?? ""));
  return { lede, body };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/**
 * Count whole-word occurrences of `needle` in an already-normalized haystack.
 * `hasWord` answers presence; a rail has to rank, so mentions are counted.
 */
export function countMentions(haystack: string, needle: string): number {
  if (!needle || !haystack) return 0;
  let count = 0;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) break;
    const before = at === 0 ? " " : haystack[at - 1];
    const afterAt = at + needle.length;
    const after = afterAt >= haystack.length ? " " : haystack[afterAt];
    if (before === " " && after === " ") count++;
    from = at + needle.length;
  }
  return count;
}

function nameScore(lede: string, body: string, name: string): number {
  const needle = normalizeText(name);
  if (!needle) return 0;
  return countMentions(lede, needle) * LEDE_WEIGHT + countMentions(body, needle);
}

/**
 * Sort is stable, so equal scores keep catalogue order — which the db layer
 * already returns by `rank`. Ties therefore resolve to the better-known
 * pattern rather than to whatever the query happened to hand back.
 */
function takeTop<T>(scored: Scored<T>[], limit: number): T[] {
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

/** De-duplicate by id, keeping first-seen order, and stop at `limit`. */
function fill<T extends { id: string }>(
  chosen: T[],
  candidates: T[],
  limit: number,
): T[] {
  const seen = new Set(chosen.map((c) => c.id));
  const out = [...chosen];
  for (const c of candidates) {
    if (out.length >= limit) break;
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

/**
 * Two rivers for the end of a field note.
 *
 * 1. `relatedRiverIds` — an editor said so explicitly.
 * 2. River names the piece actually uses, ranked by mention count.
 * 3. Rivers in the destinations the piece is filed against.
 */
export function deriveSubjectRivers(
  article: Article,
  rivers: River[],
  limit = RELATED_COUNT,
): River[] {
  const byId = new Map(rivers.map((r) => [r.id, r]));
  const explicit = (article.relatedRiverIds ?? [])
    .map((id) => byId.get(id))
    .filter((r): r is River => !!r);

  let chosen = fill([], explicit, limit);
  if (chosen.length >= limit) return chosen;

  const { lede, body } = articleSubjectText(article);
  const mentioned = takeTop(
    rivers.map((r) => ({ item: r, score: nameScore(lede, body, r.name) })),
    limit,
  );
  chosen = fill(chosen, mentioned, limit);
  if (chosen.length >= limit) return chosen;

  const destIds = new Set(article.relatedDestinationIds ?? []);
  if (destIds.size > 0) {
    const inPlace = rivers
      .filter((r) => destIds.has(r.destinationId))
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    chosen = fill(chosen, inPlace, limit);
  }
  return chosen;
}

/**
 * Two flies for the end of a field note.
 *
 * 1. Pattern names the piece actually names, ranked by mention count.
 * 2. Patterns that imitate an insect the piece names.
 * 3. Patterns in a category the piece declares in its title or standfirst.
 *
 * Every tier reads the article's own words. Nothing falls back to "featured".
 */
export function deriveSubjectFlies(
  article: Article,
  flies: CanonicalFly[],
  limit = RELATED_COUNT,
): CanonicalFly[] {
  const { lede, body } = articleSubjectText(article);

  const named = takeTop(
    flies.map((f) => ({ item: f, score: nameScore(lede, body, f.name) })),
    limit,
  );
  let chosen = fill([], named, limit);
  if (chosen.length >= limit) return chosen;

  const imitating = takeTop(
    flies.map((f) => ({
      item: f,
      score: (f.imitates ?? []).reduce(
        (sum, insect) =>
          sum +
          expandTerm(insect).reduce(
            (s, term) => s + nameScore(lede, body, term),
            0,
          ),
        0,
      ),
    })),
    limit,
  );
  chosen = fill(chosen, imitating, limit);
  if (chosen.length >= limit) return chosen;

  // Category is only trusted from the lede. "nymph" and "dry" turn up in
  // passing in almost any body, and a photography essay should not end on an
  // Adams just because it used the word "dry" once.
  const inCategory = takeTop(
    flies.map((f) => ({
      item: f,
      score: countMentions(lede, f.category),
    })),
    limit,
  );
  return fill(chosen, inCategory, limit);
}
