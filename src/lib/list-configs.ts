import type { EntityListConfig } from "@/types/list-config";
import { SPECIES_FILTER_OPTIONS } from "@/lib/browse/species-tokens";

export const destinationListConfig: EntityListConfig = {
  filters: [
    {
      key: "region",
      label: "Region",
      ui: "select",
      options: [
        { value: "northern-rockies", label: "Northern Rockies" },
        { value: "central-rockies", label: "Central Rockies" },
        { value: "pacific-northwest", label: "Pacific Northwest" },
        { value: "north-america", label: "North America (Other)" },
        { value: "south-america", label: "South America" },
        { value: "europe", label: "Europe" },
        { value: "asia-pacific", label: "Asia & Pacific" },
      ],
    },
    {
      key: "season",
      label: "Season",
      match: "contains",
      options: [
        { value: "spring", label: "Spring" },
        { value: "summer", label: "Summer" },
        { value: "fall", label: "Fall" },
        { value: "winter", label: "Winter" },
      ],
    },
    {
      key: "species",
      label: "Species",
      match: "contains",
      ui: "select",
      options: [...SPECIES_FILTER_OPTIONS],
    },
    {
      key: "tripLength",
      label: "Trip",
      options: [
        { value: "weekend", label: "Weekend" },
        { value: "week", label: "A week" },
        { value: "longer", label: "Longer trip" },
      ],
    },
  ],
  sortOptions: [
    { value: "featured", label: "Featured First" },
    { value: "name-asc", label: "Name A–Z" },
    { value: "name-desc", label: "Name Z–A" },
  ],
  defaultSort: "featured",
  defaultView: "grid",
  availableViews: ["grid", "compact", "list", "magazine"],
  searchPlaceholder: "Search destinations...",
  pageSize: 24,
};

// Maps grouped region filter values to actual region strings in the data
export const destinationRegionGroups: Record<string, string[]> = {
  "northern-rockies": ["Northern Rockies"],
  "central-rockies": ["Central Rockies"],
  "pacific-northwest": ["Pacific Northwest"],
  "north-america": [
    "Mid-Atlantic",
    "Great Lakes",
    "Ozarks",
    "Southeast",
    "Caribbean",
    "North Atlantic",
  ],
  "south-america": ["Patagonia", "Southern Patagonia", "Central America"],
  europe: [
    "British Isles",
    "Central Europe",
    "Western Europe",
    "Northwestern Russia",
  ],
  "asia-pacific": [
    "East Asia",
    "Central Pacific",
    "Central Asia",
    "Indian Ocean",
    "Oceania",
    "Russian Far East",
    "South Pacific",
  ],
};

export const riverListConfig: EntityListConfig = {
  filters: [
    {
      key: "state",
      label: "State",
      ui: "select",
      options: [], // filled from DESTINATION_STATE_MAP at the page
    },
    {
      key: "waterType",
      label: "Water",
      options: [
        { value: "freestone", label: "Freestone" },
        { value: "tailwater", label: "Tailwater" },
        { value: "spring creek", label: "Spring creek" },
        { value: "saltwater flat", label: "Saltwater flat" },
      ],
    },
    {
      key: "species",
      label: "Species",
      match: "contains",
      ui: "select",
      options: [...SPECIES_FILTER_OPTIONS],
    },
    {
      key: "difficulty",
      label: "Difficulty",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
      ],
    },
    {
      key: "flow",
      label: "Flow",
      options: [
        { value: "low", label: "Low" },
        { value: "normal", label: "Normal" },
        { value: "high", label: "High" },
        { value: "blown", label: "Blown" },
      ],
    },
    {
      key: "near",
      label: "Near me",
      match: "flag",
      ui: "hidden",
      options: [{ value: "1", label: "Near me" }],
    },
  ],
  sortOptions: [
    { value: "featured", label: "Featured First" },
    { value: "name-asc", label: "Name A–Z" },
    { value: "name-desc", label: "Name Z–A" },
    { value: "distance", label: "Nearest" },
  ],
  defaultSort: "featured",
  defaultView: "grid",
  availableViews: ["grid", "compact", "list", "magazine"],
  searchPlaceholder: "Search rivers...",
  pageSize: 24,
};

export const speciesListConfig: EntityListConfig = {
  filters: [
    {
      key: "family",
      label: "Family",
      options: [
        { value: "trout", label: "Trout" },
        { value: "salmon", label: "Salmon" },
        { value: "char", label: "Char" },
        { value: "saltwater", label: "Saltwater" },
        { value: "warmwater", label: "Warmwater" },
        { value: "pike", label: "Pike" },
        { value: "grayling", label: "Grayling" },
      ],
    },
  ],
  sortOptions: [
    { value: "name-asc", label: "Name A–Z" },
    { value: "name-desc", label: "Name Z–A" },
    { value: "featured", label: "Featured First" },
  ],
  defaultSort: "name-asc",
  defaultView: "grid",
  searchPlaceholder: "Search species...",
};

export const lodgeListConfig: EntityListConfig = {
  filters: [
    {
      key: "destination",
      label: "Destination",
      options: [], // populated dynamically
    },
    {
      key: "river",
      label: "River",
      options: [], // populated dynamically
    },
    {
      key: "price",
      label: "Price",
      options: [
        { value: "2", label: "$$" },
        { value: "3", label: "$$$" },
        { value: "4", label: "$$$$" },
        { value: "5", label: "$$$$$" },
      ],
    },
  ],
  sortOptions: [
    { value: "featured", label: "Featured First" },
    { value: "name-asc", label: "Name A–Z" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ],
  defaultSort: "featured",
  defaultView: "grid",
  searchPlaceholder: "Search lodges...",
};

export const guideListConfig: EntityListConfig = {
  filters: [
    {
      key: "destination",
      label: "Destination",
      options: [], // populated dynamically from data
    },
  ],
  sortOptions: [
    { value: "name-asc", label: "Name A–Z" },
    { value: "name-desc", label: "Name Z–A" },
    { value: "experience-desc", label: "Most Experienced" },
  ],
  defaultSort: "name-asc",
  defaultView: "grid",
  searchPlaceholder: "Search guides...",
};

export const flyShopListConfig: EntityListConfig = {
  filters: [
    {
      key: "destination",
      label: "Destination",
      options: [], // populated dynamically from data
    },
  ],
  sortOptions: [
    { value: "name-asc", label: "Name A–Z" },
    { value: "name-desc", label: "Name Z–A" },
  ],
  defaultSort: "name-asc",
  defaultView: "compact",
  availableViews: ["list", "compact"],
  searchPlaceholder: "Search fly shops...",
};

export const flyListConfig: EntityListConfig = {
  filters: [
    {
      key: "category",
      label: "Category",
      options: [
        { value: "dry", label: "Dry Fly" },
        { value: "nymph", label: "Nymph" },
        { value: "streamer", label: "Streamer" },
        { value: "emerger", label: "Emerger" },
        { value: "wet", label: "Wet Fly" },
        { value: "terrestrial", label: "Terrestrial" },
        { value: "egg", label: "Egg" },
        { value: "midge", label: "Midge" },
      ],
    },
    {
      key: "imitates",
      label: "Imitates",
      match: "contains",
      options: [
        { value: "mayfly", label: "Mayfly" },
        { value: "caddis", label: "Caddis" },
        { value: "midge", label: "Midge" },
        { value: "stonefly", label: "Stonefly" },
        { value: "terrestrial", label: "Terrestrial" },
        { value: "baitfish", label: "Baitfish" },
        { value: "attractor", label: "Attractor" },
        { value: "worm", label: "Worm / Egg" },
      ],
    },
    {
      key: "hatch",
      label: "Hatch",
      match: "contains",
      options: [
        { value: "mayfly", label: "Mayfly" },
        { value: "caddis", label: "Caddis" },
        { value: "midge", label: "Midge" },
        { value: "stonefly", label: "Stonefly" },
        { value: "terrestrial", label: "Terrestrial" },
        { value: "baitfish", label: "Baitfish" },
        { value: "attractor", label: "Attractor" },
        { value: "egg", label: "Egg" },
      ],
    },
    {
      key: "size",
      label: "Size",
      match: "range",
      options: [
        { value: "18-22", label: "#18–22" },
        { value: "14-16", label: "#14–16" },
        { value: "10-12", label: "#10–12" },
        { value: "4-8", label: "#4–8" },
      ],
    },
    {
      key: "canTie",
      label: "Materials",
      match: "flag",
      when: "authenticated",
      options: [{ value: "1", label: "I can tie it" }],
    },
  ],
  sortOptions: [
    { value: "rank", label: "Most Popular" },
    { value: "name-asc", label: "Name A–Z" },
    { value: "name-desc", label: "Name Z–A" },
    { value: "featured", label: "Featured First" },
  ],
  defaultSort: "rank",
  defaultView: "grid",
  availableViews: ["grid", "compact", "list", "magazine"],
  searchPlaceholder: "Search flies...",
  pageSize: 24,
};

export const articleListConfig: EntityListConfig = {
  filters: [
    {
      key: "category",
      label: "Category",
      options: [
        { value: "technique", label: "Technique" },
        { value: "destination", label: "Destination" },
        { value: "gear", label: "Gear" },
        { value: "conservation", label: "Conservation" },
        { value: "culture", label: "Culture" },
        { value: "species", label: "Species" },
      ],
    },
  ],
  sortOptions: [
    { value: "newest", label: "Newest First" },
    { value: "name-asc", label: "Title A–Z" },
    { value: "featured", label: "Featured First" },
  ],
  defaultSort: "newest",
  defaultView: "grid",
  searchPlaceholder: "Search articles...",
};
