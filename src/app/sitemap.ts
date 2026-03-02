import type { MetadataRoute } from "next";
import { destinations } from "@/data/destinations";
import { rivers } from "@/data/rivers";
import { lodges } from "@/data/lodges";
import { articles } from "@/data/articles";
import { guides } from "@/data/guides";
import { flyShops } from "@/data/fly-shops";
import { species } from "@/data/species";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://executiveangler.com";

export default function sitemap(): MetadataRoute.Sitemap {
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
