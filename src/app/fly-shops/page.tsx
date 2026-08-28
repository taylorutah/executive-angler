import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import ShopsDeskPage from "./ShopsDeskPage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("Fly shops — counters near the water we keep"),
  description: "Local counters near the water we keep. Hours and flies. Not a cart.",
  alternates: { canonical: `${SITE_URL}/fly-shops` },
};

export default function FlyShopsPage() {
  return <ShopsDeskPage />;
}
