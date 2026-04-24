import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import {
  getAllGearBrands,
  getGearProductsByCategory,
} from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import type { GearProductCategory } from "@/types/gear-catalog";

export const revalidate = 3600;

const CATEGORY_META: Record<
  GearProductCategory,
  { title: string; description: string; heading: string; blurb: string }
> = {
  rod: {
    title: "Fly Rods — Browse by Brand | Executive Angler",
    description:
      "Fly rods from Sage, Orvis, Winston, Scott, G. Loomis, Echo, and Redington — trout, saltwater, and Spey.",
    heading: "Fly Rods",
    blurb:
      "Trout, saltwater, Spey — rods from every major American maker, organized by brand.",
  },
  reel: {
    title: "Fly Reels — Browse by Brand | Executive Angler",
    description:
      "Fly reels from Lamson, Orvis, Sage, Redington, and Echo — sealed-drag, large-arbor, machined aluminum.",
    heading: "Fly Reels",
    blurb:
      "Sealed-drag, large-arbor, and machined aluminum reels from the makers that define the category.",
  },
  waders: {
    title: "Waders — Browse by Brand | Executive Angler",
    description:
      "Waders from Simms, Orvis, Redington, and Patagonia — breathable Gore-Tex, guide-grade stockingfoot.",
    heading: "Waders",
    blurb:
      "Gore-Tex, breathable, and guide-grade stockingfoot waders from the brands that live on the water.",
  },
};

const VALID_CATEGORIES: GearProductCategory[] = ["rod", "reel", "waders"];

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = slug as GearProductCategory;
  const meta = CATEGORY_META[category];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${SITE_URL}/gear/category/${slug}` },
  };
}

export default async function GearCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slug as GearProductCategory;
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  const [products, brands] = await Promise.all([
    getGearProductsByCategory(category),
    getAllGearBrands(),
  ]);

  const brandById = new Map(brands.map((b) => [b.id, b]));

  const grouped = new Map<string, typeof products>();
  for (const product of products) {
    const list = grouped.get(product.brandId) ?? [];
    list.push(product);
    grouped.set(product.brandId, list);
  }

  const groupedEntries = Array.from(grouped.entries())
    .map(([brandId, list]) => ({ brand: brandById.get(brandId), products: list }))
    .filter((entry) => entry.brand !== undefined)
    .sort((a, b) => a.brand!.name.localeCompare(b.brand!.name));

  return (
    <>
      <section className="bg-[#0D1117] pt-6 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-[#6E7681] mb-4">
            <Link href="/gear" className="hover:text-[#E8923A]">
              Gear
            </Link>
            <span className="mx-1">/</span>
            <span className="text-[#A8B2BD]">{meta.heading}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            Category
          </p>
          <h1 className="mt-2 font-heading text-4xl sm:text-5xl font-bold text-white">
            {meta.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70 leading-relaxed">
            {meta.blurb}
          </p>
          <p className="mt-4 text-sm font-semibold text-[#6E7681]">
            {products.length} products across {groupedEntries.length} brands
          </p>
        </div>
      </section>

      <section className="bg-[#0D1117] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {groupedEntries.map(({ brand, products: brandProducts }, gi) => (
            <ScrollAnimation key={brand!.id} delay={gi * 0.04}>
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="font-heading text-2xl font-bold text-[#E8923A]">
                    {brand!.name}
                  </h2>
                  <Link
                    href={`/gear/${brand!.slug}`}
                    className="text-sm font-semibold text-[#E8923A] hover:underline inline-flex items-center gap-1"
                  >
                    All {brand!.name} gear <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brandProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/gear/${brand!.slug}/${product.slug}`}
                      className="group block bg-[#161B22] rounded-xl overflow-hidden border border-[#21262D] hover:border-[#E8923A]/40 transition-colors"
                    >
                      {product.heroImageUrl && (
                        <div className="relative h-36">
                          <Image
                            src={product.heroImageUrl}
                            alt={product.heroImageAlt ?? product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-heading text-base font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
                          {product.name}
                        </h3>
                        {product.msrpUsd && (
                          <p className="mt-1 text-xs text-[#6E7681]">
                            ${product.msrpUsd.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </section>
    </>
  );
}
