import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Search | Executive Angler",
  description:
    "Search across destinations, rivers, species, lodges, guides, fly shops, and articles on Executive Angler.",
  alternates: { canonical: `${SITE_URL}/search` },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Search | Executive Angler",
    description:
      "Search across destinations, rivers, species, lodges, guides, fly shops, and articles on Executive Angler.",
    images: ["/api/og?title=Search&type=default"],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
