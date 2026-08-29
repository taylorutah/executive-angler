export type ViewMode = "grid" | "compact" | "list" | "magazine";

export type FilterMatch = "exact" | "contains" | "range" | "flag";

export interface FilterDimension {
  key: string;
  label: string;
  options: FilterOption[];
  /** Default exact — historical EntityListView behavior. */
  match?: FilterMatch;
  /** chips when short; select when the option list is long. hidden = match-only. */
  ui?: "chips" | "select" | "hidden";
  /** Hide unless the page says the viewer is signed in. */
  when?: "always" | "authenticated";
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface CardData {
  href: string;
  imageUrl?: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  meta?: string;
  /** Article cards: minutes, shown on the category overline. */
  readingTimeMinutes?: number;
  /** Lead token on a magazine meta line (state, then live CFS, then meta). */
  kicker?: string;
  /** Also-kept grouping key (state, country, category). */
  group?: string;
  badges?: string[];
  featured?: boolean;
  /**
   * Desktop hover panel (rivers listing). Same crossfade as ArticleCard.
   * Absent on other entity cards. Live CFS is filled client-side.
   */
  hoverPanel?: {
    chips: { label: string; value: string }[];
    brief?: string;
    bestMonths?: string;
  };
  /** Extra text shown in list view */
  description?: string;
  /** Icon-only cards (guides, fly shops) */
  iconOnly?: boolean;
  /** Use object-contain instead of object-cover (for illustrations like fish species) */
  imageContain?: boolean;
  /** Scale the image to fill frame — useful for product photos with baked-in padding */
  imageZoom?: number;
  /** Tags/chips shown below description */
  tags?: string[];
  /** Secondary line (e.g., daily rate, price) */
  accent?: string;
  /**
   * Optional inline action for the card. Serializable so it survives the
   * server→client boundary of EntityListView. Currently only "add-to-fly-box"
   * is supported; cards render a compact AddToFlyBoxButton overlay.
   */
  actionSlot?: {
    kind: "add-to-fly-box";
    canonicalFlyId: string;
    flyName: string;
  };
  _filterValues?: Record<string, string | number>;
  _sortDistance?: number;
}

export interface EntityListConfig {
  filters: FilterDimension[];
  sortOptions: SortOption[];
  defaultSort: string;
  defaultView: ViewMode;
  /** Restrict which view modes are available (defaults to all if not set) */
  availableViews?: ViewMode[];
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** When set, results paginate with a Load more control. */
  pageSize?: number;
}
