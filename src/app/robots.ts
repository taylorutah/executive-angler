import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { pageUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/_next/",
          "/api/",
          "/admin/",
          "/account/",
          "/journal/",
          "/auth/",
          "/dashboard",
          "/feed",
          "/favorites/",
          "/messages/",
          "/notifications",
          "/anglers/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/search",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "Anthropic-AI",
        allow: "/",
      },
      {
        userAgent: "Anthropic-Ai",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
    ],
    sitemap: pageUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
