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
  rightAlign?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Explore",
    href: "/destinations",
    children: [
      { label: "Destinations", href: "", isSection: true },
      { label: "Montana", href: "/destinations/montana" },
      { label: "Wyoming", href: "/destinations/wyoming" },
      { label: "Colorado", href: "/destinations/colorado" },
      { label: "Idaho", href: "/destinations/idaho" },
      { label: "Alaska", href: "/destinations/alaska" },
      { label: "All Destinations", href: "/destinations" },
      { label: "Rivers", href: "", isSection: true },
      { label: "Madison River", href: "/rivers/madison-river" },
      { label: "Yellowstone River", href: "/rivers/yellowstone-river" },
      { label: "Missouri River", href: "/rivers/missouri-river" },
      { label: "All Rivers", href: "/rivers" },
      { label: "Species", href: "", isSection: true },
      { label: "Trout", href: "/species?family=trout" },
      { label: "Salmon", href: "/species?family=salmon" },
      { label: "All Species", href: "/species" },
      { label: "Fly Library", href: "", isSection: true },
      { label: "All Patterns", href: "/flies" },
      { label: "Dry Flies", href: "/flies/category/dry" },
      { label: "Nymphs", href: "/flies/category/nymph" },
      { label: "Streamers", href: "/flies/category/streamer" },
      { label: "Emergers", href: "/flies/category/emerger" },
      { label: "Terrestrials", href: "/flies/category/terrestrial" },
      { label: "Midges", href: "/flies/category/midge" },
      { label: "Directory", href: "", isSection: true },
      { label: "Lodges", href: "/lodges" },
      { label: "Guides", href: "/guides" },
      { label: "Fly Shops", href: "/fly-shops" },
      { label: "Articles", href: "", isSection: true },
      { label: "All Articles", href: "/articles" },
    ],
  },
  {
    label: "Feed",
    href: "/feed",
  },
  {
    label: "Journal",
    href: "/journal",
  },
];

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/executiveangler",
  youtube: "https://youtube.com/@executiveangler",
  facebook: "https://www.facebook.com/profile.php?id=61582264062434",
  x: "https://x.com/executiveangler",
} as const;
