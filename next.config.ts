import type { NextConfig } from "next";
import { createRequire } from "node:module";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/rivers/green-river-utah",
        destination: "/rivers/green-river",
        permanent: true,
      },
      {
        source: "/rivers/madison",
        destination: "/rivers/madison-river",
        permanent: true,
      },
      // Phase 1 — fly-box surfaces collapse to /flybox (inventory)
      // and /flies/workbench (tying). permanent: true → 308.
      {
        source: "/my-flies",
        has: [{ type: "query", key: "tab", value: "workbench" }],
        destination: "/flies/workbench",
        permanent: true,
      },
      {
        source: "/flies/boxes",
        destination: "/flybox",
        permanent: true,
      },
      {
        source: "/flies/workspace",
        destination: "/flybox",
        permanent: true,
      },
      {
        source: "/flies/shared",
        destination: "/flybox",
        permanent: true,
      },
      {
        source: "/my-boxes",
        destination: "/flybox",
        permanent: true,
      },
      {
        source: "/my-boxes/:id",
        destination: "/flies/boxes/:id",
        permanent: true,
      },
      {
        source: "/my-flies",
        destination: "/flybox",
        permanent: true,
      },
      {
        source: "/journal/flies",
        destination: "/flybox",
        permanent: true,
      },
      {
        source: "/journal/flies/workbench",
        destination: "/flies/workbench",
        permanent: true,
      },
      // Phase 1 — analytics stacks collapse to /journal/insights
      {
        source: "/dashboard/insights",
        destination: "/journal/insights",
        permanent: true,
      },
      {
        source: "/dashboard/analytics",
        destination: "/journal/insights",
        permanent: true,
      },
      {
        source: "/dashboard/hatch-reports",
        destination: "/journal/insights",
        permanent: true,
      },
      {
        source: "/journal/stats",
        destination: "/journal/insights",
        permanent: true,
      },
      // Phase 1 — /favorites → /rivers/mine
      {
        source: "/favorites",
        destination: "/rivers/mine",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "executiveangler.com" }],
        destination: "https://www.executiveangler.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Phase 1 freeze: 45 unique hosts. Do not shrink this list until
    // `npm run audit:images` prints PHASE2_EXTERNAL_ROWS=0. See
    // scripts/image-hosts-target.json and src/lib/media/phase2-hosts.ts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "executiveangler.com",
      },
      {
        protocol: "https",
        hostname: "www.executiveangler.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "qlasxtfbodyxbcuchvxz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase custom domain (used by iOS app for storage URLs)
      {
        protocol: "https",
        hostname: "api.executiveangler.com",
        pathname: "/storage/v1/object/public/**",
      },
      // Google OAuth profile pictures
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // Fly shop website image domains
      {
        protocol: "https",
        hostname: "cdn.shoplightspeed.com",
      },
      {
        protocol: "https",
        hostname: "assets.orvis.com",
      },
      {
        protocol: "https",
        hostname: "assets.simpleviewinc.com",
      },
      {
        protocol: "https",
        hostname: "worldcastanglers.com",
      },
      {
        protocol: "https",
        hostname: "minturnanglers.com",
      },
      {
        protocol: "https",
        hostname: "s3-us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "silver-creek.com",
      },
      {
        protocol: "https",
        hostname: "www.bendflyshop.com",
      },
      {
        protocol: "https",
        hostname: "www.tcoflyfishing.com",
      },
      {
        protocol: "https",
        hostname: "gateslodge.com",
      },
      {
        protocol: "https",
        hostname: "www.sweetwaterflyshop.com",
      },
      {
        protocol: "https",
        hostname: "pacificflyfishers.com",
      },
      {
        protocol: "https",
        hostname: "www.nervouswaters.com",
      },
      {
        protocol: "https",
        hostname: "www.belizeriverlodge.com",
      },
      {
        protocol: "https",
        hostname: "alaskaflyfishinggoods.com",
      },
      {
        protocol: "https",
        hostname: "www.wherewisemenfish.com",
      },
      // Gear brand image domains
      {
        protocol: "https",
        hostname: "farbank.com",
      },
      {
        protocol: "https",
        hostname: "winstonrods.com",
      },
      {
        protocol: "https",
        hostname: "www.winstonrods.com",
      },
      {
        protocol: "https",
        hostname: "www.scottflyrod.com",
      },
      {
        protocol: "https",
        hostname: "www.simmsfishing.com",
      },
      {
        protocol: "https",
        hostname: "tiborreel.com",
      },
      {
        protocol: "https",
        hostname: "fishpondusa.com",
      },
      {
        protocol: "https",
        hostname: "www.fishpondusa.com",
      },
      {
        protocol: "https",
        hostname: "thomasandthomas.com",
      },
      {
        protocol: "https",
        hostname: "www.hardyfishing.com",
      },
      {
        protocol: "https",
        hostname: "echoflyfishing.com",
      },
      {
        protocol: "https",
        hostname: "skwalafishing.com",
      },
      {
        protocol: "https",
        hostname: "korkers.com",
      },
      {
        protocol: "https",
        hostname: "www.korkers.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "bauerflyreel.com",
      },
      {
        protocol: "https",
        hostname: "www.cheekyfishing.com",
      },
      {
        protocol: "https",
        hostname: "cheekyfishing.com",
      },
      {
        protocol: "https",
        hostname: "www.cortlandline.com",
      },
      {
        protocol: "https",
        hostname: "cortlandline.com",
      },
    ],
  },
};

function withOptionalAnalyzer(config: NextConfig): NextConfig {
  if (process.env.ANALYZE !== "1") return config;
  try {
    const req = createRequire(__filename);
    const bundleAnalyzer = req("@next/bundle-analyzer") as (opts: {
      enabled: boolean;
    }) => (inner: NextConfig) => NextConfig;
    return bundleAnalyzer({ enabled: true })(config);
  } catch {
    console.warn(
      "[perf] ANALYZE=1 but @next/bundle-analyzer is not installed. One-off: npx --yes @next/bundle-analyzer",
    );
    return config;
  }
}

export default withOptionalAnalyzer(nextConfig);
