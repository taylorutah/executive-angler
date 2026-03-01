import type { Metadata } from "next";
import Link from "next/link";
import HeroSection from "@/components/ui/HeroSection";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { species } from "@/data/species";

export const metadata: Metadata = {
  title: "Fish Species Guide",
  description:
    "Explore detailed profiles of the most sought-after fly fishing species — from wild trout and salmon to saltwater game fish. Habitat, tactics, fly patterns, and more.",
};

const familyCategories = [
  { key: "all", label: "All Species" },
  { key: "trout", label: "Trout" },
  { key: "salmon", label: "Salmon" },
  { key: "char", label: "Char" },
  { key: "saltwater", label: "Saltwater" },
  { key: "warmwater", label: "Warmwater" },
  { key: "pike", label: "Pike" },
  { key: "grayling", label: "Grayling" },
];

interface Props {
  searchParams: Promise<{ family?: string }>;
}

export default async function SpeciesListPage({ searchParams }: Props) {
  const { family } = await searchParams;

  const filteredSpecies =
    family && family !== "all"
      ? species.filter((s) => s.family === family)
      : species;

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=1920&q=80"
        imageAlt="Wild trout in crystal clear water"
        title="Fish Species Guide"
        subtitle="Detailed profiles of the world's most prized fly fishing species — habitat, behavior, fly patterns, and angling strategies."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Family Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {familyCategories.map((cat) => {
              const isActive =
                cat.key === "all"
                  ? !family || family === "all"
                  : family === cat.key;
              return (
                <Link
                  key={cat.key}
                  href={
                    cat.key === "all"
                      ? "/species"
                      : `/species?family=${cat.key}`
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-forest text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-forest/10 hover:text-forest-dark border border-slate-200"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>

          {/* Species Grid */}
          {filteredSpecies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecies.map((sp, i) => (
                <ScrollAnimation key={sp.id} delay={i * 0.05}>
                  <EntityCard
                    href={`/species/${sp.slug}`}
                    imageUrl={
                      sp.imageUrl ||
                      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
                    }
                    imageAlt={`${sp.commonName} — ${sp.scientificName || "fly fishing species"}`}
                    title={sp.commonName}
                    subtitle={sp.scientificName}
                    meta={sp.conservationStatus || sp.family || undefined}
                    badges={sp.family ? [sp.family] : undefined}
                  />
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">
                No species found in this category.
              </p>
              <Link
                href="/species"
                className="mt-4 inline-block text-forest font-medium hover:underline"
              >
                View all species
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
