/**
 * Navigation configuration for the site chrome.
 *
 * The public bar is four nouns plus Learn. Logged-in adds notebook nouns
 * (Today, Journal, My Flies). Directory items live in Explore or the footer.
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

/** Personal fly inventory. Logged-in only — never labeled "Flies". */
export const MY_FLIES_LINK: NavItem = {
  label: "My Flies",
  href: "/flybox",
  section: "/flybox",
  descriptor: "Your boxes and patterns",
};

/** Logged-in primary row. Flies is the public catalogue, same as logged-out. */
export const MEMBER_NOUNS: NavItem[] = [
  { label: "Today", href: "/today", section: "/today" },
  { label: "Journal", href: "/journal", section: "/journal" },
  { label: "Rivers", href: "/rivers", section: "/rivers" },
  {
    label: "Flies",
    href: "/flies/library",
    section: "/flies",
    descriptor: "Patterns, recipes, and materials",
  },
  MY_FLIES_LINK,
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

/* ── Explore mega menu (client ruling 2026-08-28) ────────────────────
   The canonical directory navigation pattern: a solid full-width panel,
   link columns left, a photo tile right that crossfades to the image
   mapped to the hovered link. Tiles are imagery the site already serves
   (public/images + the fly-pattern bucket) — never download, hotlink,
   or invent photos for this panel. */

export type MenuTileKey =
  | "default"
  | "rivers"
  | "destinations"
  | "species"
  | "shops"
  | "guides"
  | "lodges"
  | "flies"
  | "gear"
  | "notes"
  | "learn";

/**
 * key → src of an existing site photograph. Decorative: rendered aria-hidden.
 * Prefer already-small hosted files (hover tile is 360px). Shared keys are
 * forbidden — each link must swap a distinct image.
 */
export const MENU_TILES: Record<MenuTileKey, string> = {
  default: "/images/home/madison-three-dollar-bridge-828.jpg",
  rivers: "/images/rivers/clearwater-river-idaho-hero.jpg",
  destinations: "/images/destinations/montana-card.jpg",
  species: "/images/articles/euro-nymphing-rainbow-trout-catch-fly-fishing.jpg",
  shops: "/images/nav/shops.jpg",
  guides: "/images/guides/bud-lillys-guide-service.jpg",
  lodges: "/images/nav/lodges.jpg",
  flies:
    "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/hares-ear-nymph.jpg",
  gear: "/images/articles/complete-guide-fly-rod-selection-hero.jpg",
  notes: "/images/nav/notes.jpg",
  learn: "/images/nav/learn.jpg",
};

export type MegaMenuLink = NavItem & { tile: MenuTileKey };

export type MegaMenuColumn = { title: string; links: MegaMenuLink[] };

export const MEGA_MENU_COLUMNS: MegaMenuColumn[] = [
  {
    title: "Explore",
    links: [
      {
        label: "Rivers",
        href: "/rivers",
        section: "/rivers",
        tile: "rivers",
        descriptor: "Live water and hatches",
      },
      {
        label: "Destinations",
        href: "/destinations",
        section: "/destinations",
        tile: "destinations",
        descriptor: "Where to go, month by month",
      },
      {
        label: "Species",
        href: "/species",
        section: "/species",
        tile: "species",
        descriptor: "Trout to tarpon, by family",
      },
    ],
  },
  {
    title: "Directory",
    links: [
      {
        label: "Fly Shops",
        href: "/fly-shops",
        section: "/fly-shops",
        tile: "shops",
        descriptor: "Hours, services, local patterns",
      },
      {
        label: "Guides",
        href: "/guides",
        section: "/guides",
        tile: "guides",
        descriptor: "Guides who row these rivers",
      },
      {
        label: "Lodges",
        href: "/lodges",
        section: "/lodges",
        tile: "lodges",
        descriptor: "Stay close to the water",
      },
    ],
  },
  {
    title: "Learn",
    links: [
      {
        label: "Flies",
        href: "/flies/library",
        section: "/flies",
        tile: "flies",
        descriptor: "Patterns, recipes, and materials",
      },
      {
        label: "Gear",
        href: "/gear",
        section: "/gear",
        tile: "gear",
        descriptor: "Rods, reels, and lines",
      },
      {
        label: "Field Notes",
        href: "/articles",
        section: "/articles",
        tile: "notes",
        descriptor: "Reading water, gear, and craft",
      },
      {
        label: "Learn",
        href: "/learn",
        section: "/learn",
        tile: "learn",
        descriptor: "Start here if you are new",
      },
    ],
  },
];

/** Flat list of every directory link, column order. */
export const MEGA_MENU_LINKS: MegaMenuLink[] = MEGA_MENU_COLUMNS.flatMap(
  (column) => column.links,
);

export function searchHref(query: string): string {
  const q = query.trim();
  return q ? `/search?q=${encodeURIComponent(q)}` : "/search";
}
