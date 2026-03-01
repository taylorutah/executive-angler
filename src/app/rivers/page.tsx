import type { Metadata } from "next";
import EntityCard from "@/components/ui/EntityCard";
import HeroSection from "@/components/ui/HeroSection";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { rivers } from "@/data/rivers";

export const metadata: Metadata = {
  title: "Fly Fishing Rivers & Waters",
  description:
    "Explore the world's finest fly fishing rivers with detailed maps, hatch charts, access points, and regulations.",
};

export default function RiversPage() {
  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80"
        imageAlt="Crystal clear mountain river with rocks"
        title="Rivers & Waters"
        subtitle="Detailed guides to the world's finest fly fishing rivers — maps, hatches, access, and regulations."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rivers.map((river, i) => (
              <ScrollAnimation key={river.id} delay={i * 0.05}>
                <EntityCard
                  href={`/rivers/${river.slug}`}
                  imageUrl={river.heroImageUrl}
                  imageAlt={`${river.name} fly fishing`}
                  title={river.name}
                  subtitle={river.primarySpecies.join(", ")}
                  meta={`${river.flowType} · ${river.difficulty}`}
                  badges={[river.wadingType]}
                />
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
