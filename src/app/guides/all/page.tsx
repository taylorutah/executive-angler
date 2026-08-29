import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import GuidesIndex from "../GuidesIndex";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("Every guide we keep"),
  description: "Every guide we keep. Pictures first. One Refine. Their site takes the day.",
  alternates: { canonical: `${SITE_URL}/guides/all` },
};

export default function GuidesAllPage() {
  return <GuidesIndex />;
}
