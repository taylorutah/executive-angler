import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import LodgesIndex from "../LodgesIndex";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("Every lodge we keep"),
  description:
    "Every lodge we keep. Pictures first. One Refine. Not a booking engine.",
  alternates: { canonical: `${SITE_URL}/lodges/all` },
};

export default function LodgesAllPage() {
  return <LodgesIndex />;
}
