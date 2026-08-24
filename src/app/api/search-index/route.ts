import { NextResponse } from "next/server";
import { getAllRivers } from "@/lib/db/rivers";
import { getAllDestinations } from "@/lib/db/destinations";
import { getAllGuides } from "@/lib/db/guides";
import { getAllFlyShops } from "@/lib/db/fly-shops";
import { getAllLodges } from "@/lib/db/lodges";
import { getAllArticles } from "@/lib/db/articles";
import { getAllSpecies } from "@/lib/db/species";
import { getAllCanonicalFlies } from "@/lib/db/flies";
import { assembleSearchDocuments } from "@/lib/search";

export const revalidate = 300;

export async function GET() {
  try {
    const [
      rivers,
      destinations,
      guides,
      flyShops,
      lodges,
      articles,
      species,
      flies,
    ] = await Promise.all([
      getAllRivers(),
      getAllDestinations(),
      getAllGuides(),
      getAllFlyShops(),
      getAllLodges(),
      getAllArticles(),
      getAllSpecies(),
      getAllCanonicalFlies(),
    ]);

    const results = assembleSearchDocuments({
      rivers,
      destinations,
      species,
      lodges,
      guides,
      flyShops,
      articles,
      flies,
    });

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[search-index]", err);
    return NextResponse.json([], { status: 500 });
  }
}
