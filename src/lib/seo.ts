import { APP_STORE_URL, SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";

const BRAND = SITE_NAME;

/** Absolute URL with a sanitized origin. Never interpolates raw env. */
export function pageUrl(path: string = "/"): string {
  const origin = SITE_URL.replace(/\s+/g, "").replace(/\/+$/, "");
  if (!path || path === "/") return origin;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`.replace(/\s+/g, "");
}

/**
 * Single brand suffix. Never appends if the title already ends with the brand.
 * Returns an absolute Next.js title so the root template cannot double-suffix.
 */
export function brandedTitle(pageTitle: string): { absolute: string } {
  const trimmed = pageTitle.trim();
  if (!trimmed) return { absolute: BRAND };
  const stripped = trimmed
    .replace(new RegExp(`\\s*[|\\u2014\\u2013\\-]\\s*${escapeRegExp(BRAND)}\\s*$`, "i"), "")
    .trim();
  if (!stripped || stripped.toLowerCase() === BRAND.toLowerCase()) {
    return { absolute: BRAND };
  }
  return { absolute: `${stripped} | ${BRAND}` };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const DISCOVERY_LINKS = [
  { href: "/rivers/madison-river", label: "Madison River" },
  { href: "/destinations/montana", label: "Montana" },
  { href: "/flies/library", label: "Fly Library" },
  { href: "/flies/for/madison-river", label: "Best Flies for the Madison" },
  { href: "/rivers/green-river", label: "Green River" },
  { href: "/destinations/belize", label: "Belize" },
] as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: pageUrl("/images/logo-email.png"),
    sameAs: [APP_STORE_URL, SOCIAL_LINKS.facebook],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type FaqItem = { question: string; answer: string };

/** Pull visible FAQ pairs from article HTML (h2 Frequently Asked Questions, then h3 + p). */
export function extractFaqsFromHtml(html: string): FaqItem[] {
  const start = html.search(/<h2[^>]*>\s*Frequently Asked Questions\s*<\/h2>/i);
  if (start < 0) return [];
  const afterHeading = html.slice(start).replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, "");
  const nextH2 = afterHeading.search(/<h2[\s>]/i);
  const section = nextH2 >= 0 ? afterHeading.slice(0, nextH2) : afterHeading;
  const faqs: FaqItem[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(section))) {
    const question = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const answer = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

export function faqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

export async function catalogCounts() {
  const {
    getPublicDestinations,
    getPublicRivers,
    getAllCanonicalFlies,
    getAllGuides,
    getAllArticles,
  } = await import("@/lib/db");
  const [destinations, rivers, flies, guides, articles] = await Promise.all([
    getPublicDestinations(),
    getPublicRivers(),
    getAllCanonicalFlies(),
    getAllGuides(),
    getAllArticles(),
  ]);
  return {
    destinations: destinations.length,
    rivers: rivers.length,
    flies: flies.length,
    guides: guides.length,
    articles: articles.length,
  };
}

export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  itemPaths: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: pageUrl(opts.path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.itemPaths.length,
      itemListElement: opts.itemPaths.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: pageUrl(item.path),
      })),
    },
  };
}
