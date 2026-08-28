/**
 * Navigation configuration for the site chrome.
 *
 * The public bar is four nouns plus Learn. Everything else lives in the
 * signed-in Explore menu or the footer — never in the primary row.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Path prefix that lights this item, so detail pages light their parent. */
  section: string;
  /** One-line descriptor shown in the mobile sheet. */
  descriptor?: string;
};

export const SEARCH_PLACEHOLDER = "River, fly, hatch, destination";

/** Visible ring at every keyboard stop — 2px --accent, 2px offset (DESIGN.md §7). */
export const FOCUS_VISIBLE =
  "focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]";

/** Drop transitions/transforms when the user asked for less motion. */
export const MOTION_SAFE =
  "motion-reduce:transition-none motion-reduce:transform-none";

/** Logged-out primary row. Flies points at the public catalogue, not the workspace. */
export const PUBLIC_NOUNS: NavItem[] = [
  {
    label: "Rivers",
    href: "/rivers",
    section: "/rivers",
    descriptor: "Live water and hatches",
  },
  {
    label: "Flies",
    href: "/flies/library",
    section: "/flies",
    descriptor: "Patterns, recipes, and materials",
  },
  {
    label: "Places",
    href: "/destinations",
    section: "/destinations",
    descriptor: "Where to go, month by month",
  },
  {
    label: "Field Notes",
    href: "/articles",
    section: "/articles",
    descriptor: "Reading water, gear, and craft",
  },
];

export const LEARN_LINK: NavItem = {
  label: "Learn",
  href: "/learn",
  section: "/learn",
  descriptor: "Start here if you are new",
};

/** Logged-in primary row. Flies is the workspace once you have an account. */
export const MEMBER_NOUNS: NavItem[] = [
  { label: "Today", href: "/today", section: "/today" },
  { label: "Journal", href: "/journal", section: "/journal" },
  { label: "Rivers", href: "/rivers", section: "/rivers" },
  { label: "Flies", href: "/flies", section: "/flies" },
];

/** The one dropdown in the bar: utility routes for signed-in anglers. */
export const EXPLORE_ITEMS: NavItem[] = [
  { label: "Places", href: "/destinations", section: "/destinations" },
  { label: "Field Notes", href: "/articles", section: "/articles" },
  { label: "Learn", href: "/learn", section: "/learn" },
  { label: "Species", href: "/species", section: "/species" },
  { label: "Lodges", href: "/lodges", section: "/lodges" },
  { label: "Guides", href: "/guides", section: "/guides" },
  { label: "Fly Shops", href: "/fly-shops", section: "/fly-shops" },
];

/** A section page lights its parent: /rivers/madison-river lights Rivers. */
export function isSectionActive(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`);
}

export function searchHref(query: string): string {
  const q = query.trim();
  return q ? `/search?q=${encodeURIComponent(q)}` : "/search";
}
