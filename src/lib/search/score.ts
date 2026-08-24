import type { SearchDocument, SearchType } from "./types";
import { ALIAS_PHRASES, expandTerm } from "./aliases";
import { hasWord, normalizeText, tokenize } from "./normalize";

const WEIGHT = {
  exactTitle: 120,
  titlePrefix: 70,
  titleWord: 40,
  titleContains: 18,
  subtitleWord: 12,
  subtitleContains: 6,
  keywordWord: 18,
  keywordContains: 6,
  typeTerm: 14,
} as const;

export const CORPUS_COMMON_THRESHOLD = 0.3;
const COMMON_TERM_SCALE = 0.12;

const STOPWORDS = new Set(["the", "a", "an", "of", "to", "for", "and", "in", "on", "at"]);

const TYPE_TERMS: Record<string, SearchType> = {
  river: "river",
  rivers: "river",
  fly: "fly",
  flies: "fly",
  pattern: "fly",
  patterns: "fly",
  hatch: "hatch",
  hatches: "hatch",
  insect: "hatch",
  destination: "destination",
  destinations: "destination",
  article: "article",
  articles: "article",
  species: "species",
  lodge: "lodge",
  lodges: "lodge",
  guide: "guide",
  guides: "guide",
  shop: "fly-shop",
  shops: "fly-shop",
};

export interface ScoreContext {
  titleNorms: string[];
  /** Lazily populated term → fraction of titles containing that term. */
  termFreq: Map<string, number>;
  /** Same query is scored against every doc in a pass — analyze once. */
  analyzedQuery?: string;
  analyzed?: AnalyzedQuery;
}

export function buildScoreContext(docs: SearchDocument[]): ScoreContext {
  return { titleNorms: docs.map((d) => normalizeText(d.title)), termFreq: new Map() };
}

function analyzedFor(query: string, ctx: ScoreContext): AnalyzedQuery {
  if (ctx.analyzed && ctx.analyzedQuery === query) return ctx.analyzed;
  const analyzed = analyzeQuery(query);
  ctx.analyzedQuery = query;
  ctx.analyzed = analyzed;
  return analyzed;
}

function termFrequency(term: string, ctx: ScoreContext): number {
  const cache = ctx.termFreq ?? (ctx.termFreq = new Map());
  const cached = cache.get(term);
  if (cached !== undefined) return cached;
  const titleNorms = ctx.titleNorms;
  if (titleNorms.length === 0) {
    cache.set(term, 0);
    return 0;
  }
  let hit = 0;
  for (const t of titleNorms) {
    if (hasWord(t, term) || t.includes(term)) hit++;
  }
  const freq = hit / titleNorms.length;
  cache.set(term, freq);
  return freq;
}

function bestPhraseMatch(phrases: string[], haystack: string): number {
  let best = 0;
  for (const p of phrases) {
    if (!p) continue;
    if (haystack === p) best = Math.max(best, WEIGHT.exactTitle);
    else if (haystack.startsWith(p + " ") || haystack.startsWith(p))
      best = Math.max(best, WEIGHT.titlePrefix);
    else if (hasWord(haystack, p)) best = Math.max(best, WEIGHT.titleWord);
    else if (haystack.includes(p)) best = Math.max(best, WEIGHT.titleContains);
  }
  return best;
}

function matchVariants(
  variants: string[],
  title: string,
  subtitle: string,
  keywords: string,
): number {
  let termScore = bestPhraseMatch(variants, title);
  for (const v of variants) {
    if (hasWord(subtitle, v)) termScore = Math.max(termScore, WEIGHT.subtitleWord);
    else if (subtitle.includes(v)) termScore = Math.max(termScore, WEIGHT.subtitleContains);
    if (hasWord(keywords, v)) termScore = Math.max(termScore, WEIGHT.keywordWord);
    else if (keywords.includes(v)) termScore = Math.max(termScore, WEIGHT.keywordContains);
  }
  return termScore;
}

export interface AnalyzedQuery {
  /** Each entry is the original token plus alias expansions. */
  content: string[][];
  typeFilters: SearchType[];
}

/**
 * Tokenize, consume multi-word aliases, drop stopwords, split type-name tokens.
 */
export function analyzeQuery(query: string): AnalyzedQuery {
  const tokens = tokenize(query);
  const used = new Array(tokens.length).fill(false);
  const content: string[][] = [];
  const typeFilters: SearchType[] = [];

  // Greedy longest-phrase alias match.
  for (let i = 0; i < tokens.length; i++) {
    if (used[i]) continue;
    let matched = false;
    for (const phrase of ALIAS_PHRASES) {
      const parts = phrase.split(" ").filter(Boolean);
      if (parts.length < 2) continue;
      if (i + parts.length > tokens.length) continue;
      if (parts.every((p, k) => !used[i + k] && tokens[i + k] === p)) {
        content.push(expandTerm(phrase));
        for (let k = 0; k < parts.length; k++) used[i + k] = true;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const tok = tokens[i];
    used[i] = true;
    if (STOPWORDS.has(tok)) continue;
    const type = TYPE_TERMS[tok];
    if (type) {
      typeFilters.push(type);
      continue;
    }
    content.push(expandTerm(tok));
  }

  // If the query is only type names ("rivers", "hatches"), treat them as content.
  if (content.length === 0 && typeFilters.length > 0) {
    for (const t of tokenize(query)) {
      if (STOPWORDS.has(t)) continue;
      content.push(expandTerm(t));
    }
  }

  return { content, typeFilters };
}

/**
 * Strict AND: every content term. Relaxed: every term when there are 2,
 * or at least two-thirds when there are 3+.
 */
function passesAndGate(termCount: number, matched: number, relaxed: boolean): boolean {
  if (termCount < 2) return true;
  if (matched === termCount) return true;
  if (!relaxed || termCount === 2) return false;
  return matched * 3 >= termCount * 2;
}

export function scoreDocument(
  query: string,
  doc: SearchDocument,
  ctx: ScoreContext,
  opts?: { relaxed?: boolean },
): { score: number; coverage: number } {
  const analyzed = analyzedFor(query, ctx);
  const title = normalizeText(doc.title);
  const subtitle = normalizeText(doc.subtitle ?? "");
  const keywords = normalizeText(doc.keywords ?? "");
  const queryNorm = normalizeText(query);

  if (analyzed.content.length === 0 && analyzed.typeFilters.length === 0) {
    return { score: 0, coverage: 0 };
  }

  let matchedTerms = 0;
  let raw = 0;

  for (const variants of analyzed.content) {
    const termScore = matchVariants(variants, title, subtitle, keywords);
    if (termScore > 0) matchedTerms += 1;
    const freq = Math.max(...variants.map((v) => termFrequency(v, ctx)));
    const scale = freq > CORPUS_COMMON_THRESHOLD ? COMMON_TERM_SCALE : 1;
    raw += termScore * scale;
  }

  const coverage =
    analyzed.content.length === 0 ? 1 : matchedTerms / analyzed.content.length;

  // Multi-term queries must cover every content term (strict), or ≥⅔ of 3+ (relaxed).
  if (!passesAndGate(analyzed.content.length, matchedTerms, opts?.relaxed === true)) {
    return { score: 0, coverage };
  }
  if (coverage === 0) return { score: 0, coverage: 0 };

  if (analyzed.typeFilters.includes(doc.type)) {
    raw += WEIGHT.typeTerm;
  }

  if (queryNorm && title === queryNorm) {
    raw += WEIGHT.exactTitle;
  } else if (title.startsWith(queryNorm) && queryNorm.length > 2) {
    raw += WEIGHT.titlePrefix * 0.5;
  }

  const lengthNorm = 1 / Math.log2(4 + title.split(" ").length);
  const featuredBoost = doc.featured ? 1.08 : 1;
  const score = raw * coverage * coverage * lengthNorm * featuredBoost;

  return { score, coverage };
}

/**
 * Tuned so "green river" on Green River is well above, and glued nonsense is not.
 */
export const RELEVANCE_FLOOR = 2.5;
