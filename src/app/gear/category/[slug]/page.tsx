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
      "Fly rods from Sage, Orvis, Winston, Scott, Thomas & Thomas, Hardy, G. Loomis, and more — trout, saltwater, Spey, and Euro.",
    heading: "Fly Rods",
    blurb:
      "Trout, saltwater, Spey, and Euro — rods from every major American and import maker, organized by brand.",
  },
  reel: {
    title: "Fly Reels — Browse by Brand | Executive Angler",
    description:
      "Fly reels from Hatch, Tibor, Abel, Lamson, Ross, Galvan, Nautilus, Bauer, and more — sealed-drag, large-arbor, machined aluminum.",
    heading: "Fly Reels",
    blurb:
      "Sealed-drag, click-pawl, large-arbor, and machined aluminum reels from the makers that define the category.",
  },
  waders: {
    title: "Waders — Browse by Brand | Executive Angler",
    description:
      "Waders from Simms, Patagonia, Orvis, Skwala, Redington, and more — breathable Gore-Tex and guide-grade stockingfoot.",
    heading: "Waders",
    blurb:
      "Gore-Tex, breathable, and guide-grade stockingfoot waders from the brands that live on the water.",
  },
  "wading-boots": {
    title: "Wading Boots — Browse by Brand | Executive Angler",
    description:
      "Wading boots from Simms, Patagonia, Orvis, Korkers, and Redington — felt, rubber, studded, and interchangeable soles.",
    heading: "Wading Boots",
    blurb:
      "Felt, rubber, studded, and interchangeable-sole wading boots built for the wet rocks and long days of trout country.",
  },
  line: {
    title: "Fly Lines — Browse by Brand | Executive Angler",
    description:
      "Fly lines from Rio, Scientific Anglers, Airflo, and Cortland — floating, intermediate, sinking, and Spey heads.",
    heading: "Fly Lines",
    blurb:
      "Floating, intermediate, sinking, sink-tip, and Spey lines from the line-makers anglers and guides actually fish.",
  },
  leader: {
    title: "Leaders — Browse by Brand | Executive Angler",
    description:
      "Knotless, knotted, furled, and Euro leaders from Rio, Scientific Anglers, Trouthunter, and more.",
    heading: "Leaders",
    blurb:
      "Knotless, knotted, furled, and Euro leaders, sized from spring-creek light to saltwater heavy.",
  },
  tippet: {
    title: "Tippet — Browse by Brand | Executive Angler",
    description:
      "Fluorocarbon, nylon, and copolymer tippet from Rio, Scientific Anglers, Trouthunter, Maxima, and Seaguar.",
    heading: "Tippet",
    blurb:
      "Fluorocarbon, nylon, and copolymer tippet — the working end of every leader, sized from 8X spring creek to 0X salt.",
  },
  pack: {
    title: "Packs, Vests & Bags — Browse by Brand | Executive Angler",
    description:
      "Slings, vests, chest packs, hip packs, backpacks, and boat bags from Fishpond, Simms, Patagonia, Orvis, and Umpqua.",
    heading: "Packs, Vests & Bags",
    blurb:
      "Slings, vests, chest packs, hip packs, backpacks, and boat bags built for fly fishing — from day-on-the-water to backcountry traverses.",
  },
  net: {
    title: "Landing Nets — Browse by Brand | Executive Angler",
    description:
      "Landing nets from Fishpond, Brodin, Orvis, and more — wood, carbon-fiber, ghost, and rubber bag styles.",
    heading: "Landing Nets",
    blurb:
      "Wood, carbon-fiber, and lightweight composite nets with rubber, ghost, and knotless bags — fish-friendly landing nets for trout to salt.",
  },
};

const VALID_CATEGORIES: GearProductCategory[] = [
  "rod",
  "reel",
  "waders",
  "wading-boots",
  "line",
  "leader",
  "tippet",
  "pack",
  "net",
];

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
