import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllFlyShops, getAllDestinations } from "@/lib/db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Shops",
  description: "Find the best fly shops near your fishing destination. Local knowledge, gear, guided trips, and fly tying supplies.",
};

export default async function FlyShopsPage() {
  const [flyShops, destinations] = await Promise.all([
    getAllFlyShops(),
    getAllDestinations(),
  ]);

  return (
    <>
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80"
        imageAlt="Fly fishing gear and flies"
        title="Fly Shops"
        subtitle="Local fly shops with the gear, knowledge, and guides to put you on fish."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flyShops.map((shop, i) => {
              const dest = destinations.find((d) => d.id === shop.destinationId);
              return (
                <ScrollAnimation key={shop.id} delay={i * 0.05}>
                  <Link
                    href={`/fly-shops/${shop.slug}`}
                    className="group block card-hover rounded-xl overflow-hidden bg-white shadow-md p-6"
                  >
                    <h3 className="font-heading text-lg font-semibold text-forest-dark group-hover:text-forest transition-colors">
                      {shop.name}
                    </h3>
                    {dest && (
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {dest.name}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                      {shop.description.substring(0, 120)}...
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {shop.services.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-xs bg-cream text-forest-dark rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
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
