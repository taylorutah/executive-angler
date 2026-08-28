import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import ShopsIndex from "../ShopsIndex";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("Every shop we keep"),
  description: "Every shop we keep. Pictures first. One Refine. Hours and flies. Not a cart.",
  alternates: { canonical: `${SITE_URL}/fly-shops/all` },
};

export default function ShopsAllPage() {
  return <ShopsIndex />;
}
