import type { Metadata } from "next";
import EntityCard from "@/components/ui/EntityCard";
import HeroSection from "@/components/ui/HeroSection";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { destinations } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Fly Fishing Destinations",
  description:
    "Explore the world's finest fly fishing destinations — from the Rocky Mountain West to Patagonia, New Zealand, and beyond.",
};

export default function DestinationsPage() {
  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
        imageAlt="Mountain landscape with pristine river"
        title="Destinations"
        subtitle="The world's finest fly fishing waters, from Montana's legendary rivers to the remote streams of New Zealand."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <ScrollAnimation key={dest.id} delay={i * 0.05}>
                <EntityCard
                  href={`/destinations/${dest.slug}`}
                  imageUrl={dest.heroImageUrl}
                  imageAlt={`Fly fishing in ${dest.name}`}
                  title={dest.name}
                  subtitle={dest.tagline}
                  meta={dest.primarySpecies.slice(0, 3).join(" · ")}
                  badges={[dest.region]}
                />
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
