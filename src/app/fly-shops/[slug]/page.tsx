import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Phone, MapPin, Clock } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import QuickFacts from "@/components/ui/QuickFacts";
import Badge from "@/components/ui/Badge";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import MapView from "@/components/maps/DynamicMapView";
import { flyShops } from "@/data/fly-shops";
import { destinations } from "@/data/destinations";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = flyShops.find((s) => s.slug === slug);
  if (!shop) return { title: "Fly Shop Not Found" };

  return {
    title: `${shop.name} — Fly Shop`,
    description: shop.metaDescription || `${shop.name} — ${shop.address}. ${shop.services.join(", ")}.`,
  };
}

export function generateStaticParams() {
  return flyShops.map((s) => ({ slug: s.slug }));
}

export default async function FlyShopPage({ params }: Props) {
  const { slug } = await params;
  const shop = flyShops.find((s) => s.slug === slug);
  if (!shop) notFound();

  const dest = destinations.find((d) => d.id === shop.destinationId);

  const quickFacts = [
    ...(dest ? [{ label: "Location", value: dest.name }] : []),
    { label: "Address", value: shop.address },
    ...(shop.phone ? [{ label: "Phone", value: shop.phone }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: shop.name,
          description: shop.description,
          address: shop.address,
          url: shop.websiteUrl,
          geo: {
            "@type": "GeoCoordinates",
            latitude: shop.latitude,
            longitude: shop.longitude,
          },
        }}
      />

      <HeroSection
        imageUrl={
          shop.heroImageUrl ||
          "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80"
        }
        imageAlt={shop.name}
        title={shop.name}
        subtitle={shop.address}
        height="h-[50vh]"
      />

      <div className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Fly Shops", href: "/fly-shops" },
                { label: shop.name },
              ]}
            />
            <FavoriteButton entityType="fly_shop" entityId={shop.id} />
          </div>
        </div>
      </div>

      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                  About
                </h2>
                {shop.description.split("\n\n").map((p, i) => (
                  <p key={i} className="text-slate-700 leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                  Services
                </h2>
                <div className="flex flex-wrap gap-2">
                  {shop.services.map((s) => (
                    <Badge key={s} variant="forest" size="md">
                      {s}
                    </Badge>
                  ))}
                </div>
              </ScrollAnimation>

              {shop.brandsCarried.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                    Brands Carried
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {shop.brandsCarried.map((b) => (
                      <Badge key={b} variant="outline" size="md">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-forest-dark mb-4">
                  Location
                </h2>
                <MapView
                  latitude={shop.latitude}
                  longitude={shop.longitude}
                  zoom={14}
                  markers={[
                    {
                      latitude: shop.latitude,
                      longitude: shop.longitude,
                      title: shop.name,
                      description: shop.address,
                    },
                  ]}
                  className="h-[300px] w-full rounded-xl overflow-hidden shadow-md"
                />
              </ScrollAnimation>
            </div>

            <div className="space-y-6">
              <QuickFacts facts={quickFacts} />

              {/* Hours */}
              {shop.hours && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-lg font-semibold text-forest-dark mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Hours
                  </h3>
                  <dl className="space-y-2">
                    {Object.entries(shop.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <dt className="text-slate-500 capitalize">{day}</dt>
                        <dd className="font-medium text-slate-700">{hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Contact */}
              <div className="bg-forest rounded-xl p-6 text-white shadow-lg">
                <h3 className="font-heading text-xl font-bold mb-3">
                  Contact
                </h3>
                {shop.websiteUrl && (
                  <a
                    href={shop.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-forest-dark font-semibold rounded-lg hover:bg-cream transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  {shop.phone && (
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex items-center gap-2 text-white/80 hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {shop.phone}
                    </a>
                  )}
                  <p className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    {shop.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
