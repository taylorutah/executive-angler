import type { Metadata } from "next";
import { getAllGuides } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import GuidesDeskPage from "./GuidesDeskPage";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const guides = await getAllGuides();
  const n = guides.length;
  return {
    title: brandedTitle(`${n} fly fishing guides`),
    description: `${n} people who know a river. Their site takes the day. We do not book it.`,
    alternates: { canonical: `${SITE_URL}/guides` },
  };
}

export default function GuidesPage() {
  return <GuidesDeskPage />;
}
