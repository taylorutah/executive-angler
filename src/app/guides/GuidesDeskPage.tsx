import FindDesk from "@/components/desk/FindDesk";
import { getAllDestinations, getAllGuides } from "@/lib/db";

function guideMeta(
  destName?: string,
  specialties?: string[],
): string | undefined {
  return [destName, specialties?.slice(0, 2).join(", ")].filter(Boolean).join(" · ") || undefined;
}

/** FIND / Guides — Lodges 84:3 language. */
export default async function GuidesDeskPage() {
  const [guides, destinations] = await Promise.all([getAllGuides(), getAllDestinations()]);
  const destById = new Map(destinations.map((d) => [d.id, d]));

  return (
    <FindDesk
      title="Guides"
      lede="People who know a river. Their site takes the day. We do not book it."
      featuredInkLine="We do not book the day."
      seeAllHref="/guides/all"
      seeAllNoun="guide"
      items={guides.map((guide) => {
        const dest = destById.get(guide.destinationId);
        return {
          id: guide.id,
          href: `/guides/${guide.slug}`,
          name: guide.name,
          imageUrl: guide.photoUrl,
          imageAlt: guide.name,
          meta: guideMeta(dest?.name, guide.specialties),
          description: guide.bio,
          websiteUrl: guide.websiteUrl,
          featured: false,
        };
      })}
    />
  );
}
