import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { ROBOTS_DISALLOW } from "@/lib/robots-disallow";
import { pageUrl } from "@/lib/seo";

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Anthropic-AI",
  "Anthropic-Ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      })),
    ],
    sitemap: pageUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
