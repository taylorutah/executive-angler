import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ExternalLink, Calendar, ChevronRight } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/constants";
import {
  getAllGearBrands,
  getGearBrandBySlug,
  getGearProductsByBrand,
} from "@/lib/db";

interface Props {
  params: Promise<{ brandSlug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  const brand = await getGearBrandBySlug(brandSlug);
  if (!brand) return { title: "Brand Not Found" };

  const fallbackTitle = `${brand.name} — ${brand.specialties.slice(0, 3).join(", ")} | Executive Angler`;
  const fallbackDesc =
    brand.tagline ||
    `${brand.name} — ${brand.specialties.join(", ")}${brand.headquarters ? ` from ${brand.headquarters}` : ""}.`;

  return {
    title: brand.metaTitle || fallbackTitle,
    description: brand.metaDescription || fallbackDesc,
    alternates: { canonical: `${SITE_URL}/gear/${brandSlug}` },
    openGraph: {
      title: brand.metaTitle || brand.name,
      description: brand.metaDescription || fallbackDesc,
      images: [
        brand.heroImageUrl ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(brand.name)}&subtitle=Fly%20Fishing%20Gear&type=default`,
      ],
    },
  };
}

export async function generateStaticParams() {
  const brands = await getAllGearBrands();
  return brands.map((b) => ({ brandSlug: b.slug }));
}

const CATEGORY_LABELS = {
  rod: "Fly Rods",
  reel: "Fly Reels",
  waders: "Waders",
  "wading-boots": "Wading Boots",
  line: "Fly Lines",
  leader: "Leaders",
  tippet: "Tippet",
  pack: "Packs, Vests & Bags",
  net: "Landing Nets",
} as const;

const CATEGORY_ORDER = [
  "rod",
  "reel",
  "waders",
  "wading-boots",
  "line",
  "leader",
  "tippet",
  "pack",
  "net",
] as const;

export default async function BrandPage({ params }: Props) {
  const { brandSlug } = await params;
  const brand = await getGearBrandBySlug(brandSlug);
  if (!brand) notFound();

  const products = await getGearProductsByBrand(brand.id);

  const byCategory: Record<string, typeof products> = {};
  for (const cat of CATEGORY_ORDER) {
    byCategory[cat] = products.filter((p) => p.category === cat);
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Brand",
          name: brand.name,
          description: brand.description,
          url: `${SITE_URL}/gear/${brandSlug}`,
          ...(brand.websiteUrl ? { sameAs: brand.websiteUrl } : {}),
          ...(brand.heroImageUrl ? { logo: brand.heroImageUrl } : {}),
          ...(brand.foundedYear ? { foundingDate: `${brand.foundedYear}` } : {}),
          ...(brand.headquarters ? { location: brand.headquarters } : {}),
        }}
      />

      <HeroSection
        imageUrl={
          brand.heroImageUrl ||
          "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1920&q=80"
        }
        imageAlt={brand.heroImageAlt || brand.name}
        title={brand.name}
        subtitle={brand.tagline || brand.specialties.join(" · ")}
        height="h-[50vh]"
      />

      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs
            items={[
              { label: "Gear", href: "/gear" },
              { label: brand.name },
            ]}
          />
        </div>
      </div>

      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                  About {brand.name}
                </h2>
                {brand.description.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[#A8B2BD] leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </ScrollAnimation>

              {brand.specialties.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-4">
                    Specialties
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {brand.specialties.map((s) => (
                      <Badge key={s} variant="forest" size="md">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </ScrollAnimation>
              )}

              {CATEGORY_ORDER.map((cat) => {
                const catProducts = byCategory[cat];
                if (!catProducts || catProducts.length === 0) return null;
                return (
                  <ScrollAnimation key={cat}>
                    <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
                      {CATEGORY_LABELS[cat]}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {catProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/gear/${brand.slug}/${product.slug}`}
                          className="group block bg-[#161B22] rounded-xl overflow-hidden shadow-sm border border-[#21262D] hover:border-[#E8923A]/40 transition-colors"
                        >
                          {product.heroImageUrl && (
                            <div className="relative h-40">
                              <Image
                                src={product.heroImageUrl}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 50vw"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-heading text-lg font-semibold text-[#E8923A]">
                              {product.name}
                            </h3>
                            {product.useCases.length > 0 && (
                              <p className="mt-1 text-xs text-[#6E7681]">
                                {product.useCases.slice(0, 3).join(" · ")}
                              </p>
                            )}
                            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#E8923A] group-hover:underline">
                              View Product <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollAnimation>
                );
              })}

              {products.length === 0 && (
                <p className="text-[#A8B2BD]">
                  Products for {brand.name} are being added to the catalog.
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">
                  Brand Info
                </h3>
                <dl className="space-y-3 text-sm">
                  {brand.foundedYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#6E7681]" />
                      <dt className="text-[#A8B2BD]">Founded</dt>
                      <dd className="ml-auto font-medium text-[#E8923A]">
                        {brand.foundedYear}
                      </dd>
                    </div>
                  )}
                  {brand.headquarters && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[#6E7681] mt-0.5" />
                      <dt className="text-[#A8B2BD]">Based in</dt>
                      <dd className="ml-auto font-medium text-[#E8923A] text-right">
                        {brand.headquarters}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {brand.websiteUrl && (
                <a
                  href={brand.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#E8923A] text-[#0D1117] font-semibold rounded-lg hover:bg-[#E8923A]/90 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit {brand.name} website
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
