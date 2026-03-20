import type { MetadataRoute } from "next";
import {
  getAllDestinations,
  getAllRivers,
  getAllLodges,
  getAllArticles,
  getAllGuides,
  getAllFlyShops,
  getAllSpecies,
} from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, rivers, species, lodges, articles, guides, flyShops] =
    await Promise.all([
      getAllDestinations(),
      getAllRivers(),
      getAllSpecies(),
      getAllLodges(),
      getAllArticles(),
      getAllGuides(),
      getAllFlyShops(),
    ]);
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    { url: `${SITE_URL}/destinations`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/rivers`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/species`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/lodges`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/guides`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/fly-shops`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), priority: 0.5 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), priority: 0.3 },
  ];

  const destinationPages = destinations.map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const riverPages = rivers.map((r) => ({
    url: `${SITE_URL}/rivers/${r.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const speciesPages = species.map((s) => ({
    url: `${SITE_URL}/species/${s.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const lodgePages = lodges.map((l) => ({
    url: `${SITE_URL}/lodges/${l.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const articlePages = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    priority: 0.7,
  }));

  const guidePages = guides.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  const shopPages = flyShops.map((s) => ({
    url: `${SITE_URL}/fly-shops/${s.slug}`,
    lastModified: new Date(),
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
  ];
}
