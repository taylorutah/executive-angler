import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { getAllRivers } from "@/lib/db";
import RiversPageClient from "./RiversPageClient";
import { toRiverBrowseItem, statesForRiver } from "@/lib/browse/river-items";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
export const revalidate = 3600;

const SPOTLIGHT_SLUGS = ["madison-river", "snake-river-wyoming", "henrys-fork"] as const;

const RIVER_HEADLINES: Record<string, string> = {
  "madison-river": "The Crown Jewel of Montana",
  "snake-river-wyoming": "Wild Cutthroats Beneath the Tetons",
  "henrys-fork": "North America's Premier Dry Fly Challenge",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800",
};

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
  const spotlightRivers = SPOTLIGHT_SLUGS.map((s) => rivers.find((r) => r.slug === s)).filter(
    Boolean,
  );

  const items = rivers.map(toRiverBrowseItem);
  const stateOptions = [
    ...new Set(rivers.flatMap((r) => statesForRiver(r))),
  ]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }));

  return (
    <>
      <section className="bg-[var(--surface-page)] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)]">
            The reference
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)]">
            {rivers.length} rivers, documented
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-[var(--text-body)] leading-relaxed">
            Access points, hatch charts, and live flow when a gauge exists.
            Filter by state, water, species, difficulty, and flow.
          </p>
        </div>
      </section>

      <section className="bg-[var(--surface-page)] pt-2 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--action)] mb-8">
            Iconic Rivers
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {spotlightRivers.map((river, i) => {
              if (!river) return null;
              return (
                <ScrollAnimation key={river.id} delay={i * 0.1}>
                  <Link
                    href={`/rivers/${river.slug}`}
                    className="group block bg-[var(--surface-raised)] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-56">
                      <SafeEntityImage
                        src={river.heroImageUrl}
                        alt={river.name}
                        title={river.name}
                        meta={[river.flowType, river.wadingType].filter(Boolean).join(" · ")}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={i < 3}
                        scrimClassName="bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                      />
                      <div className="absolute bottom-4 left-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_STYLES[river.difficulty] ?? "bg-[var(--surface-card)] text-[var(--text-body)]"}`}
                        >
                          {river.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
                        {river.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-[var(--action)]">
                        {RIVER_HEADLINES[river.slug]}
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-body)] line-clamp-2">
                        {river.description?.substring(0, 120)}...
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {river.primarySpecies.slice(0, 2).map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 bg-[var(--surface-page)] text-[var(--action)] text-[10px] font-medium rounded-full"
                          >
                            {sp}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 bg-[var(--surface-card)] text-[var(--text-body)] text-[10px] font-medium rounded-full capitalize">
                          {river.wadingType}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-[var(--text-meta)]">
                          Peak: {river.bestMonths.slice(0, 3).join(" · ")}
                        </span>
                        <span className="text-sm font-semibold text-[var(--action)] flex items-center gap-1 group-hover:underline">
                          Explore <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-raised)] border-t border-[var(--border-rule)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Suspense>
            <RiversPageClient items={items} stateOptions={stateOptions} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
