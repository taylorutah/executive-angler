import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
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
    ],
  },
};

export default nextConfig;
