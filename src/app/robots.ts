import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

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
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
