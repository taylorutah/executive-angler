import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllRivers } from "@/lib/db";
import GazetteRiversIndex from "@/components/gazette/GazetteRiversIndex";
import { toRiverBrowseItem } from "@/lib/browse/river-items";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const rivers = await getAllRivers();
  const n = rivers.length;
  return {
    title: brandedTitle(`${n} Fly Fishing Rivers — Maps, Hatches & Access Points`),
    description: `Browse ${n} fly fishing rivers with interactive maps, hatch charts, access points, and regulations. From the Madison to the Moy — find your next water.`,
    alternates: { canonical: `${SITE_URL}/rivers` },
    openGraph: {
      title: `${n} Fly Fishing Rivers — Maps, Hatches & Access`,
      description: `Browse ${n} fly fishing rivers with interactive maps, hatch charts, access points, and regulations. Find your next water.`,
      images: ["/api/og?title=Fly%20Fishing%20Rivers&subtitle=Legendary%20Waters&type=river"],
    },
  };
}

export default async function RiversPage() {
  const rivers = await getAllRivers();
  const items = rivers.map((river) => toRiverBrowseItem(river));

  return (
    <Suspense>
      <GazetteRiversIndex items={items} riverCount={rivers.length} />
    </Suspense>
  );
}
