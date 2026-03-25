import { NextResponse } from "next/server";
import { getAllRivers } from "@/lib/db/rivers";
import { getAllDestinations } from "@/lib/db/destinations";
import { getAllGuides } from "@/lib/db/guides";
import { getAllFlyShops } from "@/lib/db/fly-shops";
import { getAllLodges } from "@/lib/db/lodges";
import { getAllArticles } from "@/lib/db/articles";
import { getAllSpecies } from "@/lib/db/species";

export const revalidate = 300; // 5-minute cache

export async function GET() {
  try {
    const [rivers, destinations, guides, flyShops, lodges, articles, species] = await Promise.all([
      getAllRivers(),
      getAllDestinations(),
      getAllGuides(),
      getAllFlyShops(),
      getAllLodges(),
      getAllArticles(),
      getAllSpecies(),
    ]);

    const destMap = Object.fromEntries(destinations.map((d) => [d.id, d.name]));
    const riverMap = Object.fromEntries(rivers.map((r) => [r.id, r.name]));

    const results = [
      ...destinations.map((d) => ({
        type: "destination" as const,
        slug: d.slug,
        title: d.name,
        subtitle: `${d.region}, ${d.country}`,
        imageUrl: d.heroImageUrl,
        href: `/destinations/${d.slug}`,
        keywords: [
          d.state,
          d.tagline,
          ...d.primarySpecies,
        ].filter(Boolean).join(" "),
      })),
      ...rivers.map((r) => {
        const hatchKeywords = (r.hatchChart ?? []).flatMap((m) =>
          m.hatches.flatMap((h) => [h.insect, h.pattern])
        );
        return {
          type: "river" as const,
          slug: r.slug,
          title: r.name,
          subtitle: `${destMap[r.destinationId] ?? ""} — ${r.flowType}`,
          imageUrl: r.heroImageUrl,
          href: `/rivers/${r.slug}`,
          keywords: [
            ...r.accessPoints.map((ap) => ap.name),
            ...r.primarySpecies,
            r.description?.slice(0, 200),
            ...new Set(hatchKeywords),
          ].filter(Boolean).join(" "),
        };
      }),
      ...species.map((s) => ({
        type: "species" as const,
        slug: s.slug,
        title: s.commonName,
        subtitle: s.scientificName ?? (s.family ?? ""),
        imageUrl: s.imageUrl,
        href: `/species/${s.slug}`,
        keywords: [
          s.family,
          s.preferredHabitat,
          ...s.preferredFlies,
        ].filter(Boolean).join(" "),
      })),
      ...lodges.map((l) => ({
        type: "lodge" as const,
        slug: l.slug,
        title: l.name,
        subtitle: destMap[l.destinationId] ?? "",
        imageUrl: l.heroImageUrl,
        href: `/lodges/${l.slug}`,
        keywords: [
          ...l.amenities,
          ...l.nearbyRiverIds.map((id) => riverMap[id]).filter(Boolean),
        ].join(" "),
      })),
      ...guides.map((g) => ({
        type: "guide" as const,
        slug: g.slug,
        title: g.name,
        subtitle: `${destMap[g.destinationId] ?? ""} — ${g.specialties.slice(0, 2).join(", ")}`,
        imageUrl: g.photoUrl,
        href: `/guides/${g.slug}`,
        keywords: g.specialties.join(" "),
      })),
      ...flyShops.map((f) => ({
        type: "fly-shop" as const,
        slug: f.slug,
        title: f.name,
        subtitle: destMap[f.destinationId] ?? "",
        imageUrl: f.heroImageUrl,
        href: `/fly-shops/${f.slug}`,
        keywords: [
          ...f.services,
          ...f.brandsCarried,
        ].join(" "),
      })),
      ...articles.map((a) => ({
        type: "article" as const,
        slug: a.slug,
        title: a.title,
        subtitle: `${a.category} — ${a.author}`,
        imageUrl: a.heroImageUrl,
        href: `/articles/${a.slug}`,
        keywords: [
          ...a.tags,
          a.excerpt,
        ].join(" "),
      })),
    ];

    return NextResponse.json(results, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[search-index]", err);
    return NextResponse.json([], { status: 500 });
  }
}
