import type { Metadata } from "next";
import EntityCard from "@/components/ui/EntityCard";
import HeroSection from "@/components/ui/HeroSection";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { lodges } from "@/data/lodges";

export const metadata: Metadata = {
  title: "Fly Fishing Lodges",
  description:
    "Find the world's best fly fishing lodges. Real reviews, pricing, and direct booking links.",
};

export default function LodgesPage() {
  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1920&q=80"
        imageAlt="Rustic fishing lodge in the mountains"
        title="Lodges"
        subtitle="Premier fly fishing lodges around the world — hand-picked for exceptional water access, guiding, and hospitality."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lodges.map((lodge, i) => (
              <ScrollAnimation key={lodge.id} delay={i * 0.05}>
                <EntityCard
                  href={`/lodges/${lodge.slug}`}
                  imageUrl={lodge.heroImageUrl}
                  imageAlt={lodge.name}
                  title={lodge.name}
                  subtitle={lodge.priceRange}
                  meta={`${lodge.seasonStart}–${lodge.seasonEnd}`}
                  badges={lodge.amenities.slice(0, 2)}
                />
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
