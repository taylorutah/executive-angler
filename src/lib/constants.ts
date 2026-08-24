export const SITE_NAME = "Executive Angler";
export const SITE_DESCRIPTION =
  "Rivers, flies, and hatches — a public desk for the water, and a private notebook for your own days on it.";

const FALLBACK_SITE_URL = "https://www.executiveangler.com";

/** Strip whitespace, newlines, and trailing slashes from the public origin. */
export function sanitizeSiteUrl(raw: string | undefined): string {
  const cleaned = (raw ?? "").replace(/\s+/g, "").replace(/\/+$/, "");
  if (!cleaned) return FALLBACK_SITE_URL;
  try {
    const u = new URL(cleaned);
    if (u.protocol !== "http:" && u.protocol !== "https:") return FALLBACK_SITE_URL;
    return `${u.protocol}//${u.host}`;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = sanitizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
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
