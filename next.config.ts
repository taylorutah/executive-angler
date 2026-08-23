import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

export default nextConfig;
