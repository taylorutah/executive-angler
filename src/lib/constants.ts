export const SITE_NAME = "Executive Angler";
export const SITE_DESCRIPTION =
  "The definitive fly fishing resource — destinations, rivers, lodges, guides, and expert instruction from around the world.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.executiveangler.com";

export type NavChild = {
  label: string;
  href: string;
  isSection?: boolean;
};

export type NavLink = {
  label: string;
  href: string;
  children?: NavChild[];
  rightAlign?: boolean; // anchor dropdown to the right edge of the trigger
};

export const NAV_LINKS: NavLink[] = [
  {
    label: "Destinations",
    href: "/destinations",
    children: [
      { label: "Montana", href: "/destinations/montana" },
      { label: "Wyoming", href: "/destinations/wyoming" },
      { label: "Colorado", href: "/destinations/colorado" },
      { label: "Idaho", href: "/destinations/idaho" },
      { label: "Alaska", href: "/destinations/alaska" },
      { label: "New Zealand", href: "/destinations/new-zealand" },
      { label: "View All", href: "/destinations" },
    ],
  },
  {
    label: "Rivers",
    href: "/rivers",
    children: [
      { label: "Madison River", href: "/rivers/madison-river" },
      { label: "Yellowstone River", href: "/rivers/yellowstone-river" },
      { label: "Gallatin River", href: "/rivers/gallatin-river" },
      { label: "Missouri River", href: "/rivers/missouri-river" },
      { label: "View All", href: "/rivers" },
    ],
  },
  {
    label: "Lodges",
    href: "/lodges",
    children: [
      { label: "Firehole Ranch", href: "/lodges/firehole-ranch" },
      { label: "Bristol Bay Sportfishing", href: "/lodges/bristol-bay-sportfishing" },
      { label: "Dean River Lodge", href: "/lodges/dean-river-lodge" },
      { label: "Snake River Sporting Club", href: "/lodges/snake-river-sporting-club" },
      { label: "View All Lodges", href: "/lodges" },
    ],
  },
  {
    label: "Fly Shops",
    href: "/fly-shops",
  },
  {
    label: "Guides",
    href: "/guides",
  },
  {
    label: "Resources",
    href: "/articles",
    rightAlign: true,
    children: [
      { label: "Articles", href: "", isSection: true },
      { label: "Techniques", href: "/articles?category=technique" },
      { label: "Gear", href: "/articles?category=gear" },
      { label: "Conservation", href: "/articles?category=conservation" },
      { label: "Destinations", href: "/articles?category=destination" },
      { label: "Culture", href: "/articles?category=culture" },
      { label: "All Articles", href: "/articles" },
      { label: "Species Guide", href: "", isSection: true },
      { label: "Trout", href: "/species?family=trout" },
      { label: "Salmon", href: "/species?family=salmon" },
      { label: "Saltwater", href: "/species?family=saltwater" },
      { label: "Warmwater", href: "/species?family=warmwater" },
      { label: "All Species", href: "/species" },
    ],
  },
];

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/executiveangler",
  youtube: "https://youtube.com/@executiveangler",
  facebook: "https://facebook.com/executiveangler",
} as const;
