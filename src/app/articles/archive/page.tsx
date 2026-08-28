import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import ArticlesArchive from "../ArticlesArchive";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("The archive"),
  description: "What the gauge does not say. No comments. No feed. One Refine.",
  alternates: { canonical: `${SITE_URL}/articles/archive` },
};

export default function ArticlesArchivePage() {
  return <ArticlesArchive />;
}
