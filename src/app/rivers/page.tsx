import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Heart } from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllRivers } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import RiversPageClient from "./RiversPageClient";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 0; // dynamic — needs auth for favorites

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
  title: "41 Fly Fishing Rivers — Maps, Hatches & Access Points",
  description:
    "Browse 41 fly fishing rivers with interactive maps, hatch charts, access points, and regulations. From the Madison to the Moy — find your next water.",
  alternates: { canonical: `${SITE_URL}/rivers` },
  openGraph: {
    title: "41 Fly Fishing Rivers — Maps, Hatches & Access | Executive Angler",
    description: "Browse 41 fly fishing rivers with interactive maps, hatch charts, access points, and regulations. Find your next water.",
    images: ["/api/og?title=Fly%20Fishing%20Rivers&subtitle=41%20Legendary%20Waters&type=river"],
  },
};

export default async function RiversPage() {
  const rivers = await getAllRivers();

  // Check auth and fetch user's favorited rivers
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let favoriteRiverIds: string[] = [];
  if (user) {
    const { data: favs } = await supabase
      .from("user_favorites")
      .select("entity_id")
      .eq("user_id", user.id)
      .eq("entity_type", "river");
    favoriteRiverIds = (favs ?? []).map((f) => f.entity_id);
  }

  const myRivers = favoriteRiverIds.length > 0
    ? rivers.filter((r) => favoriteRiverIds.includes(r.id))
    : [];

  const spotlightRivers = SPOTLIGHT_SLUGS.map((s) => rivers.find((r) => r.slug === s)).filter(
    Boolean
  );

  // Prepare serializable river data for the client component
  const allRiversData = rivers.map((river) => ({
    id: river.id,
    slug: river.slug,
    name: river.name,
    destinationId: river.destinationId,
    description: river.description,
    heroImageUrl: river.heroImageUrl,
    primarySpecies: river.primarySpecies,
    flowType: river.flowType,
    difficulty: river.difficulty,
    wadingType: river.wadingType,
    bestMonths: river.bestMonths,
    latitude: river.latitude,
    longitude: river.longitude,
    featured: river.featured,
    // accessPoints needed by River type — pass empty array if not serializing full data
    accessPoints: [],
  }));

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-6 pb-10 sm:pb-12">
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

      {/* ── My Rivers / Spotlight Rivers ──────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-2 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {myRivers.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-8">
                <Heart className="h-4 w-4 text-[#E8923A] fill-[#E8923A]" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
                  My Rivers
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {myRivers.map((river, i) => (
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
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_STYLES[river.difficulty] ?? "bg-[#1F2937] text-[#A8B2BD]"}`}
                          >
                            {river.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-heading text-xl font-bold text-[#E8923A] group-hover:text-[#E8923A] transition-colors">
                          {river.name}
                        </h3>
                        <p className="mt-2 text-sm text-[#A8B2BD] line-clamp-2">
                          {river.description?.substring(0, 120)}...
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {river.primarySpecies.slice(0, 3).map((sp) => (
                            <span
                              key={sp}
                              className="px-2 py-0.5 bg-[#0D1117] text-[#E8923A] text-[10px] font-medium rounded-full"
                            >
                              {sp}
                            </span>
                          ))}
                          <span className="px-2 py-0.5 bg-[#1F2937] text-[#A8B2BD] text-[10px] font-medium rounded-full capitalize">
                            {river.wadingType}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-[#6E7681]">
                            Peak: {river.bestMonths.slice(0, 3).join(" · ")}
                          </span>
                          <span className="text-sm font-semibold text-[#E8923A] flex items-center gap-1 group-hover:underline">
                            Explore <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </ScrollAnimation>
                ))}
              </div>
            </>
          ) : (
            <>
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
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_STYLES[river.difficulty] ?? "bg-[#1F2937] text-[#A8B2BD]"}`}
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
                          <p className="mt-2 text-sm text-[#A8B2BD] line-clamp-2">
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
                            <span className="px-2 py-0.5 bg-[#1F2937] text-[#A8B2BD] text-[10px] font-medium rounded-full capitalize">
                              {river.wadingType}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-[#6E7681]">
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
            </>
          )}
        </div>
      </section>

      {/* ── Full Catalog ──────────────────────────────────────────────────── */}
      <section className="bg-[#161B22] border-t border-[#21262D] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <RiversPageClient rivers={allRiversData} />
        </div>
      </section>
    </>
  );
}
