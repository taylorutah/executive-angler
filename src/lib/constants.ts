export const SITE_NAME = "Executive Angler";
export const SITE_DESCRIPTION =
  "The definitive fly fishing resource — destinations, rivers, lodges, guides, and expert instruction from around the world.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://executiveangler.com";

export const NAV_LINKS = [
  {
    label: "Destinations",
    href: "/destinations",
    children: [
      { label: "Montana", href: "/destinations/montana" },
      { label: "Wyoming", href: "/destinations/wyoming" },
      { label: "Colorado", href: "/destinations/colorado" },
      { label: "Idaho", href: "/destinations/idaho" },
      { label: "Alaska", href: "/destinations/alaska" },
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
  },
  {
    label: "Guides",
    href: "/guides",
  },
  {
    label: "Articles",
    href: "/articles",
    children: [
      { label: "Techniques", href: "/articles?category=technique" },
      { label: "Destinations", href: "/articles?category=destination" },
      { label: "Gear", href: "/articles?category=gear" },
      { label: "Conservation", href: "/articles?category=conservation" },
      { label: "View All", href: "/articles" },
    ],
  },
  {
    label: "Fly Shops",
    href: "/fly-shops",
  },
] as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/executiveangler",
  youtube: "https://youtube.com/@executiveangler",
  facebook: "https://facebook.com/executiveangler",
} as const;
