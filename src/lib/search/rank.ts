import type {
  MatchQuality,
  RankedGroup,
  RankedSearch,
  SearchDocument,
  SearchType,
} from "./types";
import { GROUP_CAP, GROUP_ORDER } from "./types";
import { buildScoreContext, RELEVANCE_FLOOR, scoreDocument } from "./score";
import { suggestDocument } from "./suggest";
import { tokenize } from "./normalize";

export { GROUP_CAP, GROUP_ORDER, RELEVANCE_FLOOR };

function scorePool(
  query: string,
  pool: SearchDocument[],
  ctx: ReturnType<typeof buildScoreContext>,
  matchQuality: MatchQuality,
) {
  const relaxed = matchQuality === "closest";
  return pool
    .map((doc) => {
      const { score, coverage } = scoreDocument(query, doc, ctx, { relaxed });
      return { doc, score, coverage, matchQuality };
    })
    .filter((s) => s.score >= RELEVANCE_FLOOR)
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
}

export function rankSearch(
  query: string,
  docs: SearchDocument[],
  opts?: { type?: SearchType | "all"; cap?: number },
): RankedSearch {
  const typeFilter = opts?.type && opts.type !== "all" ? opts.type : undefined;
  const cap = opts?.cap ?? GROUP_CAP;
  const terms = tokenize(query);

  if (terms.length === 0) {
    return { groups: [], total: 0 };
  }

  const pool = typeFilter ? docs.filter((d) => d.type === typeFilter) : docs;
  const ctx = buildScoreContext(pool);

  let matchQuality: MatchQuality = "exact";
  let scored = scorePool(query, pool, ctx, "exact");
  if (scored.length === 0) {
    scored = scorePool(query, pool, ctx, "closest");
    matchQuality = "closest";
  }

  if (scored.length === 0) {
    return {
      groups: [],
      total: 0,
      suggestion: suggestDocument(query, docs),
    };
  }

  const byType = new Map<SearchType, typeof scored>();
  for (const row of scored) {
    const list = byType.get(row.doc.type) ?? [];
    list.push(row);
    byType.set(row.doc.type, list);
  }

  const groups: RankedGroup[] = [];
  for (const type of GROUP_ORDER) {
    const items = byType.get(type);
    if (!items || items.length === 0) continue;
    groups.push({
      type,
      items: items.slice(0, cap),
      total: items.length,
    });
  }

  return { groups, total: scored.length, matchQuality };
}

export function flattenRanked(ranked: RankedSearch): SearchDocument[] {
  return ranked.groups.flatMap((g) => g.items.map((i) => i.doc));
}
