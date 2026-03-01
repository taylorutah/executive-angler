import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { guides } from "@/data/guides";
import { destinations } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Fly Fishing Guides",
  description: "Find expert fly fishing guides worldwide. Profiles, specialties, rates, and direct booking links.",
};

export default function GuidesPage() {
  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1545816250-e12bedba42ba?w=1920&q=80"
        imageAlt="Fishing guide helping an angler on the river"
        title="Guides"
        subtitle="Expert fly fishing guides who know every riffle, run, and hatch on their home waters."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, i) => {
              const dest = destinations.find((d) => d.id === guide.destinationId);
              return (
                <ScrollAnimation key={guide.id} delay={i * 0.05}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group block card-hover rounded-xl overflow-hidden bg-white shadow-md p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-6 w-6 text-forest" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-forest-dark group-hover:text-forest transition-colors">
                          {guide.name}
                        </h3>
                        {dest && (
                          <p className="text-sm text-slate-500">{dest.name}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {guide.bio.substring(0, 120)}...
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {guide.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-xs bg-cream text-forest-dark rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {guide.dailyRate && (
                      <p className="text-sm font-semibold text-forest">
                        {guide.dailyRate}
                      </p>
                    )}
                  </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
