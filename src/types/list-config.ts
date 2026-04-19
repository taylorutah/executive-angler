export type ViewMode = "grid" | "compact" | "list" | "magazine";

export interface FilterDimension {
  key: string;
  label: string;
  options: FilterOption[];
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
  badges?: string[];
  featured?: boolean;
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
}
