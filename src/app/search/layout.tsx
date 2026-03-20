import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search across all fly fishing destinations, rivers, species, lodges, guides, fly shops, and articles on Executive Angler.",
  openGraph: {
    title: "Search | Executive Angler",
    description:
      "Search across all fly fishing destinations, rivers, species, lodges, guides, fly shops, and articles on Executive Angler.",
    images: ["/api/og?title=Search&type=default"],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
