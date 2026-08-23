import type { MetadataRoute } from "next";
import {
  getAllDestinations,
  getAllRivers,
  getAllLodges,
  getAllArticles,
  getAllGuides,
  getAllFlyShops,
  getAllSpecies,
  getAllCanonicalFlies,
  getAllGearBrands,
  getAllGearProducts,
} from "@/lib/db";
import { pageUrl } from "@/lib/seo";

export const revalidate = 86400;

const MIN_PRODUCT_COPY = 80;

function loc(path: string): string {
  const url = pageUrl(path);
  if (/\s/.test(url)) {
    throw new Error(`[sitemap] whitespace in loc: ${JSON.stringify(url)}`);
  }
  return url;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, rivers, species, lodges, articles, guides, flyShops, canonicalFlies, gearBrands, gearProducts] =
    await Promise.all([
      getAllDestinations(),
      getAllRivers(),
      getAllSpecies(),
      getAllLodges(),
      getAllArticles(),
      getAllGuides(),
      getAllFlyShops(),
      getAllCanonicalFlies(),
      getAllGearBrands(),
      getAllGearProducts(),
    ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: loc("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: loc("/destinations"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: loc("/rivers"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: loc("/species"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: loc("/lodges"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: loc("/articles"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: loc("/guides"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: loc("/fly-shops"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: loc("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: loc("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: loc("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: loc("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: loc("/flies/library"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: loc("/gear"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const destinationPages = destinations.map((d) => ({
    url: loc(`/destinations/${d.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const riverPages = rivers.map((r) => ({
    url: loc(`/rivers/${r.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const speciesPages = species.map((s) => ({
    url: loc(`/species/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const lodgePages = lodges.map((l) => ({
    url: loc(`/lodges/${l.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articlePages = articles.map((a) => ({
    url: loc(`/articles/${a.slug}`),
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const guidePages = guides.map((g) => ({
    url: loc(`/guides/${g.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const shopPages = flyShops.map((s) => ({
    url: loc(`/fly-shops/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const brandById = new Map(gearBrands.map((b) => [b.id, b]));

  const gearCategoryPages = ["rod", "reel", "waders"].map((cat) => ({
    url: loc(`/gear/category/${cat}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const gearBrandPages = gearBrands.map((b) => ({
    url: loc(`/gear/${b.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const gearProductPages: MetadataRoute.Sitemap = [];
  for (const p of gearProducts) {
    const brand = brandById.get(p.brandId);
    if (!brand) continue;
    const copyLen = (p.description ?? "").trim().length;
    const thin = copyLen < MIN_PRODUCT_COPY;
    gearProductPages.push({
      url: loc(`/gear/${brand.slug}/${p.slug}`),
      lastModified: thin ? undefined : now,
      changeFrequency: thin ? "yearly" : "monthly",
      priority: thin ? 0.3 : 0.6,
    });
  }

  const flyPages = canonicalFlies.map((f) => ({
    url: loc(`/flies/${f.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const flyCategories = ["dry", "nymph", "streamer", "emerger", "wet", "terrestrial", "egg", "midge"];
  const flyCategoryPages = flyCategories.map((cat) => ({
    url: loc(`/flies/category/${cat}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const flyForRiverPages = rivers.map((r) => ({
    url: loc(`/flies/for/${r.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const insectSlugs = new Set<string>();
  for (const fly of canonicalFlies) {
    for (const im of fly.imitates ?? []) {
      const slug = im
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      if (slug) insectSlugs.add(slug);
    }
  }
  const flyHatchPages = Array.from(insectSlugs).map((slug) => ({
    url: loc(`/flies/hatch/${slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...destinationPages,
    ...riverPages,
    ...speciesPages,
    ...lodgePages,
    ...articlePages,
    ...guidePages,
    ...shopPages,
    ...flyPages,
    ...flyCategoryPages,
    ...flyForRiverPages,
    ...flyHatchPages,
    ...gearCategoryPages,
    ...gearBrandPages,
    ...gearProductPages,
  ];
}
