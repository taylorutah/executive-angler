import type { EntityListConfig } from "@/types/list-config";

export const destinationListConfig: EntityListConfig = {
  filters: [
    {
      key: "region",
      label: "Region",
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
  ],
  sortOptions: [
    { value: "featured", label: "Featured First" },
    { value: "name-asc", label: "Name A–Z" },
    { value: "name-desc", label: "Name Z–A" },
  ],
  defaultSort: "featured",
  defaultView: "grid",
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
      key: "difficulty",
      label: "Difficulty",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
      ],
    },
    {
      key: "wading",
      label: "Wading Type",
      options: [
        { value: "wade", label: "Wade" },
        { value: "float", label: "Float" },
        { value: "both", label: "Both" },
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
  defaultView: "grid",
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
};
