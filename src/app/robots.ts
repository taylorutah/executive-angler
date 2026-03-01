import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/favorites/", "/account/"],
      },
    ],
    sitemap: "https://executiveangler.com/sitemap.xml",
  };
}
