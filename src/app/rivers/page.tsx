import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import EntityListView from "@/components/ui/EntityListView";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllRivers } from "@/lib/db";
import { riverListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

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

export const metadata: Metadata = {
  title: "Fly Fishing Rivers & Waters",
  description:
    "Explore the world's finest fly fishing rivers with detailed maps, hatch charts, access points, and regulations.",
};

export default async function RiversPage() {
  const rivers = await getAllRivers();
  const spotlightRivers = SPOTLIGHT_SLUGS.map((s) => rivers.find((r) => r.slug === s)).filter(
    Boolean
  );

  const items: (CardData & { _filterValues: Record<string, string> })[] = rivers.map((river) => ({
    href: `/rivers/${river.slug}`,
    imageUrl: river.heroImageUrl,
    imageAlt: `${river.name} fly fishing`,
    title: river.name,
    subtitle: river.primarySpecies.join(", "),
    meta: `${river.flowType} · ${river.difficulty}`,
    badges: [river.wadingType],
    featured: river.featured,
    description: river.description?.substring(0, 150),
    _filterValues: {
      difficulty: river.difficulty,
      wading: river.wadingType,
    },
  }));

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-[#E8923A]-dark pt-32 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            Legendary Waters
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Rivers That Define the Sport
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            {rivers.length} rivers documented from source to sea — access points, hatch charts,
            and everything a serious angler needs.
          </p>
        </div>
      </section>

      {/* ── Spotlight Rivers ──────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-8">
            Iconic Rivers
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {spotlightRivers.map((river, i) => {
              if (!river) return null;
              return (
                <ScrollAnimation key={river.id} delay={i * 0.1}>
                  <Link
                    href={`/rivers/${river.slug}`}
                    className="group block bg-[#161B22] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-56">
                      <Image
                        src={river.heroImageUrl}
                        alt={river.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-forest-dark/20 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_STYLES[river.difficulty] ?? "bg-[#1F2937] text-[#8B949E]"}`}
                        >
                          {river.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-xl font-bold text-[#E8923A] group-hover:text-[#E8923A] transition-colors">
                        {river.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-[#E8923A]">
                        {RIVER_HEADLINES[river.slug]}
                      </p>
                      <p className="mt-2 text-sm text-[#8B949E] line-clamp-2">
                        {river.description?.substring(0, 120)}...
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {river.primarySpecies.slice(0, 2).map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 bg-[#0D1117] text-[#E8923A] text-[10px] font-medium rounded-full"
                          >
                            {sp}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 bg-[#1F2937] text-[#8B949E] text-[10px] font-medium rounded-full capitalize">
                          {river.wadingType}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-[#484F58]">
                          Peak: {river.bestMonths.slice(0, 3).join(" · ")}
                        </span>
                        <span className="text-sm font-semibold text-[#E8923A] flex items-center gap-1 group-hover:underline">
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

      {/* ── Full Catalog ──────────────────────────────────────────────────── */}
      <div className="bg-[#161B22] border-t border-[#21262D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
            All Rivers &amp; Waters
          </h2>
          <p className="text-sm text-[#8B949E] mt-1">
            {rivers.length} rivers — filterable by difficulty, access, and wading type
          </p>
        </div>
      </div>
      <section className="bg-[#161B22] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView items={items} config={riverListConfig} storageKey="rivers" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
