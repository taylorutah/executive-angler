export const SEARCH_TYPES = [
  "river",
  "fly",
  "hatch",
  "destination",
  "article",
  "species",
  "lodge",
  "guide",
  "fly-shop",
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

/** Fixed group order on the results page and in Cmd+K. */
export const GROUP_ORDER: SearchType[] = [
  "river",
  "fly",
  "hatch",
  "destination",
  "article",
  "species",
  "lodge",
  "guide",
  "fly-shop",
];

export const GROUP_CAP = 5;

export interface SearchDocument {
  type: SearchType;
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  imageUrl?: string;
  /** Space-separated extra match text (hatches, tags, imitates, etc.). */
  keywords?: string;
  featured?: boolean;
  /** USGS site id — client may fetch live CFS for visible river rows only. */
  usgsGaugeId?: string | null;
  flowType?: string;
  /** Hatch-only: months this insect shows up. */
  months?: string[];
  riverCount?: number;
  readingTimeMinutes?: number;
  category?: string;
  sizes?: string;
}

export interface ScoredDocument {
  doc: SearchDocument;
  score: number;
  coverage: number;
}

export interface RankedGroup {
  type: SearchType;
  items: ScoredDocument[];
  total: number;
}

export interface RankedSearch {
  groups: RankedGroup[];
  total: number;
  /** Populated when the query scores nothing. */
  suggestion?: SearchDocument;
}
