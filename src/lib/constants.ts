export const SITE_NAME = "Executive Angler";
export const SITE_DESCRIPTION =
  "The definitive fly fishing resource — destinations, rivers, lodges, guides, and expert instruction from around the world.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.executiveangler.com";
export const APP_STORE_URL = "https://apps.apple.com/us/app/executive-angler/id6760311036";

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
  { label: "Journal", href: "/journal" },
  { label: "Rivers", href: "/rivers" },
  { label: "Flies", href: "/flies" },
  { label: "Gear", href: "/account/gear" },
  { label: "Feed", href: "/feed" },
];

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/executiveangler",
  youtube: "https://youtube.com/@executiveangler",
  facebook: "https://www.facebook.com/profile.php?id=61582264062434",
  x: "https://x.com/executiveangler",
} as const;
