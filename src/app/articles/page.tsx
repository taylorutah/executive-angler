import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import NotesDeskPage from "./NotesDeskPage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("Field Notes — what the gauge does not say"),
  description: "What the gauge does not say. No comments. No feed.",
  alternates: { canonical: `${SITE_URL}/articles` },
};

export default function ArticlesPage() {
  return <NotesDeskPage />;
}
