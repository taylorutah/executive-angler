import type {
  Article,
  CanonicalFly,
  Destination,
  FlyShop,
  Guide,
  Lodge,
  River,
  Species,
} from "@/types/entities";
import type { SearchDocument } from "./types";
import { buildHatchDocuments } from "./hatches";
import { firstUsgsSiteId } from "./usgs";

export function assembleSearchDocuments(input: {
  rivers: River[];
  destinations: Destination[];
  species: Species[];
  lodges: Lodge[];
  guides: Guide[];
  flyShops: FlyShop[];
  articles: Article[];
  flies: CanonicalFly[];
}): SearchDocument[] {
  const destById = Object.fromEntries(input.destinations.map((d) => [d.id, d]));
  const riverById = Object.fromEntries(input.rivers.map((r) => [r.id, r]));
  const destName = (id: string) => destById[id]?.name ?? "";
  const destState = (id: string) => destById[id]?.state ?? destById[id]?.region ?? "";
  const riverName = (id: string) => riverById[id]?.name ?? "";

  const destinationDocs: SearchDocument[] = input.destinations.map((d) => ({
    type: "destination",
    id: d.id,
    slug: d.slug,
    title: d.name,
    subtitle: `${d.region}, ${d.country}`,
    href: `/destinations/${d.slug}`,
    imageUrl: d.heroImageUrl,
    keywords: [d.state, d.tagline, ...(d.primarySpecies ?? [])].filter(Boolean).join(" "),
    featured: d.featured,
  }));

  const riverDocs: SearchDocument[] = input.rivers.map((r) => {
    const destIds = [r.destinationId, ...(r.additionalDestinationIds ?? [])];
    const names = [...new Set(destIds.map(destName).filter(Boolean))];
    const states = [...new Set(destIds.map(destState).filter(Boolean))];
    const hatchKeywords = (r.hatchChart ?? []).flatMap((m) =>
      (m.hatches ?? []).flatMap((h) => [h.insect, h.pattern]),
    );
    return {
      type: "river" as const,
      id: r.id,
      slug: r.slug,
      title: r.name,
      subtitle: `${states.join(" / ") || names.join(" / ")} — ${r.flowType}`,
      href: `/rivers/${r.slug}`,
      imageUrl: r.heroImageUrl,
      keywords: [
        ...names,
        ...states,
        ...r.accessPoints.map((ap) => ap.name),
        ...(r.primarySpecies ?? []),
        r.description?.slice(0, 200),
        ...new Set(hatchKeywords),
      ]
        .filter(Boolean)
        .join(" "),
      featured: r.featured,
      usgsGaugeId: firstUsgsSiteId(r.usgsGaugeId),
      flowType: r.flowType,
    };
  });

  const speciesDocs: SearchDocument[] = input.species.map((s) => ({
    type: "species",
    id: s.id,
    slug: s.slug,
    title: s.commonName,
    subtitle: s.scientificName ?? s.family ?? "",
    href: `/species/${s.slug}`,
    imageUrl: s.imageUrl,
    keywords: [s.family, s.preferredHabitat, ...(s.preferredFlies ?? [])]
      .filter(Boolean)
      .join(" "),
    featured: s.featured,
  }));

  const lodgeDocs: SearchDocument[] = input.lodges.map((l) => ({
    type: "lodge",
    id: l.id,
    slug: l.slug,
    title: l.name,
    subtitle: destName(l.destinationId),
    href: `/lodges/${l.slug}`,
    imageUrl: l.heroImageUrl,
    keywords: [
      ...(l.amenities ?? []),
      destName(l.destinationId),
      ...(l.nearbyRiverIds ?? []).map(riverName),
    ]
      .filter(Boolean)
      .join(" "),
    featured: l.featured,
  }));

  const guideDocs: SearchDocument[] = input.guides.map((g) => ({
    type: "guide",
    id: g.id,
    slug: g.slug,
    title: g.name,
    subtitle: `${destName(g.destinationId)} — ${(g.specialties ?? []).slice(0, 2).join(", ")}`,
    href: `/guides/${g.slug}`,
    imageUrl: g.photoUrl,
    keywords: (g.specialties ?? []).join(" "),
  }));

  const shopDocs: SearchDocument[] = input.flyShops.map((f) => ({
    type: "fly-shop",
    id: f.id,
    slug: f.slug,
    title: f.name,
    subtitle: destName(f.destinationId),
    href: `/fly-shops/${f.slug}`,
    imageUrl: f.heroImageUrl,
    keywords: [...(f.services ?? []), ...(f.brandsCarried ?? [])].join(" "),
  }));

  const articleDocs: SearchDocument[] = input.articles.map((a) => ({
    type: "article",
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: `${a.category} — ${a.readingTimeMinutes} min`,
    href: `/articles/${a.slug}`,
    imageUrl: a.heroImageUrl,
    keywords: [...(a.tags ?? []), a.excerpt, a.author].filter(Boolean).join(" "),
    featured: a.featured,
    readingTimeMinutes: a.readingTimeMinutes,
    category: a.category,
  }));

  const flyDocs: SearchDocument[] = input.flies.map((f) => ({
    type: "fly",
    id: f.id,
    slug: f.slug,
    title: f.name,
    subtitle: `${f.category} — Sizes ${f.sizes[0] || ""}–${f.sizes[f.sizes.length - 1] || ""}`,
    href: `/flies/${f.slug}`,
    imageUrl: f.heroImageUrl,
    keywords: [f.category, ...(f.imitates ?? []), ...(f.colors ?? []), f.description?.slice(0, 200)]
      .filter(Boolean)
      .join(" "),
    featured: f.featured,
    category: f.category,
    sizes: f.sizes?.length ? `${f.sizes[0]}–${f.sizes[f.sizes.length - 1]}` : undefined,
  }));

  const hatchDocs = buildHatchDocuments(input.rivers, input.flies);

  return [
    ...riverDocs,
    ...flyDocs,
    ...hatchDocs,
    ...destinationDocs,
    ...articleDocs,
    ...speciesDocs,
    ...lodgeDocs,
    ...guideDocs,
    ...shopDocs,
  ];
}
