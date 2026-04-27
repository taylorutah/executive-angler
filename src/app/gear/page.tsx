import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllGearBrands, getAllGearProducts } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Fishing Gear — Rods, Reels, Waders, Lines & More by Brand | Executive Angler",
  description:
    "Browse fly fishing gear by brand. Sage, Orvis, Winston, Scott, Hatch, Tibor, Abel, Simms, Patagonia, Rio, Scientific Anglers, Fishpond, and more.",
  alternates: { canonical: `${SITE_URL}/gear` },
  openGraph: {
    title: "Fly Fishing Gear by Brand | Executive Angler",
    description:
      "Rods, reels, waders, wading boots, lines, leaders, tippet, packs, and nets from the brands that make them.",
    images: ["/api/og?title=Gear&subtitle=Browse%20by%20Brand%20%26%20Category&type=default"],
  },
};

const CATEGORY_TILES = [
  {
    slug: "rod",
    label: "Fly Rods",
    blurb: "Trout, saltwater, Spey, and Euro — rods from every major maker.",
  },
  {
    slug: "reel",
    label: "Fly Reels",
    blurb: "Sealed-drag, click-pawl, and machined aluminum reels.",
  },
  {
    slug: "waders",
    label: "Waders",
    blurb: "Gore-Tex, breathable, and guide-grade stockingfoot waders.",
  },
  {
    slug: "wading-boots",
    label: "Wading Boots",
    blurb: "Felt, rubber, studded, and interchangeable-sole wading boots.",
  },
  {
    slug: "line",
    label: "Fly Lines",
    blurb: "Floating, intermediate, sinking, and Spey heads.",
  },
  {
    slug: "leader",
    label: "Leaders",
    blurb: "Knotless, knotted, furled, and Euro leaders.",
  },
  {
    slug: "tippet",
    label: "Tippet",
    blurb: "Fluorocarbon, nylon, and copolymer tippet from 8X to 0X.",
  },
  {
    slug: "pack",
    label: "Packs, Vests & Bags",
    blurb: "Slings, vests, chest packs, hip packs, and boat bags.",
  },
  {
    slug: "net",
    label: "Landing Nets",
    blurb: "Wood, carbon-fiber, and rubber-bag fish-friendly nets.",
  },
] as const;

export default async function GearLandingPage() {
  const [brands, products] = await Promise.all([
    getAllGearBrands(),
    getAllGearProducts(),
  ]);

  const featuredBrands = brands.filter((b) => b.featured);
  const otherBrands = brands.filter((b) => !b.featured);

  const counts: Record<string, number> = {
    rod: products.filter((p) => p.category === "rod").length,
    reel: products.filter((p) => p.category === "reel").length,
    waders: products.filter((p) => p.category === "waders").length,
    "wading-boots": products.filter((p) => p.category === "wading-boots").length,
    line: products.filter((p) => p.category === "line").length,
    leader: products.filter((p) => p.category === "leader").length,
    tippet: products.filter((p) => p.category === "tippet").length,
    pack: products.filter((p) => p.category === "pack").length,
    net: products.filter((p) => p.category === "net").length,
  };

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-6 pb-10 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            The Gear Directory
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Fly Fishing Gear, By Brand
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            Rods, reels, waders, wading boots, lines, leaders, tippet, packs, and nets — from
            the brands that make them. Browse by brand or by category, add what you own to
            your gear locker, and see it flow into your session log.
          </p>
        </div>
      </section>

      {/* ── Category Tiles ───────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pt-2 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-6">
            Browse by Category
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_TILES.map((tile, i) => (
              <ScrollAnimation key={tile.slug} delay={i * 0.08}>
                <Link
                  href={`/gear/category/${tile.slug}`}
                  className="group block bg-[#161B22] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-[#21262D] hover:border-[#E8923A]/40"
                >
                  <h3 className="font-heading text-xl font-bold text-[#E8923A]">
                    {tile.label}
                  </h3>
                  <p className="mt-2 text-sm text-[#A8B2BD] leading-relaxed">
                    {tile.blurb}
                  </p>
                  <p className="mt-4 text-xs font-semibold text-[#6E7681]">
                    {counts[tile.slug]} products
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#E8923A] group-hover:underline">
                    Browse {tile.label} <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Brands ──────────────────────────────────────────────── */}
      <section className="bg-[#0D1117] pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A] mb-6">
            Featured Brands
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBrands.map((brand, i) => {
              const brandProducts = products.filter((p) => p.brandId === brand.id);
              return (
                <ScrollAnimation key={brand.id} delay={i * 0.05}>
                  <Link
                    href={`/gear/${brand.slug}`}
                    className="group block bg-[#161B22] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full"
                  >
                    {brand.heroImageUrl && (
                      <div className="relative h-40">
                        <Image
                          src={brand.heroImageUrl}
                          alt={brand.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/80 to-transparent" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col">
                      <h3 className="font-heading text-xl font-bold text-[#E8923A]">
                        {brand.name}
                      </h3>
                      {brand.tagline && (
                        <p className="mt-1 text-sm text-[#A8B2BD] line-clamp-2">
                          {brand.tagline}
                        </p>
                      )}
                      {brand.headquarters && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-[#6E7681]">
                          <MapPin className="h-3 w-3" />
                          <span>{brand.headquarters}</span>
                        </div>
                      )}
                      <p className="mt-3 text-xs font-semibold text-[#6E7681]">
                        {brandProducts.length} products
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#E8923A] group-hover:underline">
                        View Brand <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── All Brands A–Z ───────────────────────────────────────────────── */}
      {otherBrands.length > 0 && (
        <section className="bg-[#161B22] border-t border-[#21262D] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-[#E8923A] mb-6">
              All Brands
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {brands.map((brand) => {
                const brandProducts = products.filter((p) => p.brandId === brand.id);
                return (
                  <Link
                    key={brand.id}
                    href={`/gear/${brand.slug}`}
                    className="flex items-center justify-between p-4 bg-[#0D1117] rounded-lg border border-[#21262D] hover:border-[#E8923A]/40 transition-colors"
                  >
                    <span className="font-heading font-semibold text-[#E8923A]">
                      {brand.name}
                    </span>
                    <span className="text-xs text-[#6E7681]">
                      {brandProducts.length}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
