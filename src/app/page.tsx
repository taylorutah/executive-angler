import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, BookOpen } from "lucide-react";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import RatingStars from "@/components/ui/RatingStars";
import { getFeaturedArticles } from "@/lib/db";
import { lodges } from "@/data/lodges";
import { destinations } from "@/data/destinations";
import { guides } from "@/data/guides";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Premium Fly Fishing Resource`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Premium Fly Fishing Resource`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/images/madison-river-three-dollar-bridge.jpg",
        width: 1920,
        height: 1036,
        alt: "The Madison River in Montana with the Madison Range rising in the distance under a blue sky",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Premium Fly Fishing Resource`,
    description: SITE_DESCRIPTION,
    images: ["/images/madison-river-three-dollar-bridge.jpg"],
  },
};

export const revalidate = 3600;

// ── Curated homepage selections ─────────────────────────────────────────────
const HERO_LODGE_SLUG = "firehole-ranch";
const GRID_LODGE_SLUGS = [
  { slug: "bristol-bay-sportfishing", location: "Alaska" },
  { slug: "dean-river-lodge", location: "British Columbia" },
  { slug: "snake-river-sporting-club", location: "Wyoming" },
];
const DESTINATION_PANELS = [
  { slug: "alaska", panelTagline: "Wild Salmon & Rainbow Country" },
  { slug: "montana", panelTagline: "The Cradle of American Fly Fishing" },
  { slug: "patagonia", panelTagline: "Untamed Sea Trout, Edge of the World" },
  { slug: "kamchatka", panelTagline: "Remote Wilderness, World-Record Salmon" },
];
const FEATURED_GUIDE_SLUG = "paddy-mcdonnell-moy-ghillie";

export default async function HomePage() {
  const featuredArticles = await getFeaturedArticles().then((a) => a.slice(0, 3));

  const heroLodge = lodges.find((l) => l.slug === HERO_LODGE_SLUG)!;
  const gridLodges = GRID_LODGE_SLUGS.map(({ slug, location }) => ({
    lodge: lodges.find((l) => l.slug === slug)!,
    location,
  }));
  const destinationPanels = DESTINATION_PANELS.map((d) => ({
    dest: destinations.find((dest) => dest.slug === d.slug)!,
    panelTagline: d.panelTagline,
  }));
  const featuredGuide = guides.find((g) => g.slug === FEATURED_GUIDE_SLUG)!;

  return (
    <>
      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        <Image
          src="/images/madison-river-three-dollar-bridge.jpg"
          alt="The Madison River in Montana with the Madison Range rising in the distance under a blue sky"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-4xl px-4">
            <ScrollAnimation>
              <p className="text-gold font-medium text-sm sm:text-base uppercase tracking-[0.2em] mb-4">
                The Definitive Fly Fishing Resource
              </p>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1]">
                Executive Angler
              </h1>
            </ScrollAnimation>
            <ScrollAnimation delay={0.2}>
              <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                World-class lodges, legendary rivers, and expert guides — from
                Montana spring creeks to the wilds of Kamchatka.
              </p>
            </ScrollAnimation>
            <ScrollAnimation delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-forest text-white font-medium rounded-lg hover:bg-forest-light transition-colors shadow-lg"
                >
                  <MapPin className="h-5 w-5" />
                  Discover Your Waters
                </Link>
                <Link
                  href="/articles"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                >
                  <BookOpen className="h-5 w-5" />
                  Read the Journal
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED LODGES ────────────────────────────────────────────── */}
      <section>
        {/* Dark header */}
        <div className="bg-forest-dark py-16 sm:py-20 text-center px-4">
          <ScrollAnimation>
            <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-3">
              Where to Stay
            </p>
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold">
              Premier Waters, Unrivaled Retreats
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto text-base sm:text-lg">
              Hand-selected lodges that define the pinnacle of fly fishing
              hospitality — from Montana ranch country to Alaska&apos;s remote
              wilderness.
            </p>
          </ScrollAnimation>
        </div>

        {/* Hero lodge + grid */}
        <div className="bg-cream py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Editorial spotlight card */}
            <ScrollAnimation>
              <Link
                href={`/lodges/${heroLodge.slug}`}
                className="group block overflow-hidden rounded-2xl shadow-2xl border border-slate-200 mb-8"
              >
                <div className="flex flex-col lg:flex-row min-h-[480px]">
                  {/* Image — 60% */}
                  <div className="relative w-full lg:w-[60%] h-72 lg:h-auto overflow-hidden flex-shrink-0">
                    <Image
                      src={heroLodge.heroImageUrl}
                      alt={heroLodge.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-gold text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                      Featured Lodge
                    </div>
                  </div>
                  {/* Text panel — 40% */}
                  <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 bg-white flex-1">
                    <p className="text-gold font-medium text-xs uppercase tracking-[0.2em] mb-3">
                      Montana · Tier 5
                    </p>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-forest-dark group-hover:text-forest transition-colors leading-tight">
                      {heroLodge.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-forest" />
                      <span>West Yellowstone, Montana</span>
                    </div>
                    <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base line-clamp-4">
                      {heroLodge.description.substring(0, 300)}...
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {heroLodge.averageRating && (
                        <RatingStars
                          rating={heroLodge.averageRating}
                          count={heroLodge.reviewCount}
                        />
                      )}
                      {heroLodge.priceRange && (
                        <span className="px-3 py-1 bg-cream text-forest-dark text-xs font-semibold rounded-full border border-cream-dark">
                          {heroLodge.priceRange}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {heroLodge.amenities.slice(0, 4).map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 rounded-full"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <div className="mt-7">
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-medium rounded-lg group-hover:bg-forest-light transition-colors text-sm">
                        Explore {heroLodge.name} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollAnimation>

            {/* 3-lodge supporting grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gridLodges.map(({ lodge, location }, i) => (
                <ScrollAnimation key={lodge.id} delay={i * 0.12}>
                  <Link
                    href={`/lodges/${lodge.slug}`}
                    className="group block card-hover rounded-xl overflow-hidden bg-white shadow-md border border-slate-100"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={lodge.heroImageUrl}
                        alt={lodge.name}
                        fill
                        className="object-cover card-image-zoom"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {lodge.priceRange && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-forest-dark">
                          {lodge.priceRange}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-forest font-medium uppercase tracking-wider mb-1">
                        {location}
                      </p>
                      <h3 className="font-heading text-base font-semibold text-forest-dark group-hover:text-forest transition-colors leading-snug">
                        {lodge.name}
                      </h3>
                      {lodge.averageRating && (
                        <div className="mt-2">
                          <RatingStars
                            rating={lodge.averageRating}
                            count={lodge.reviewCount}
                          />
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {lodge.amenities.slice(0, 2).map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 text-[11px] bg-cream text-forest-dark rounded-full"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>

            <ScrollAnimation delay={0.2}>
              <div className="mt-8 text-center">
                <Link
                  href="/lodges"
                  className="inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
                >
                  View All Lodges <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ── 3. EXPLORE BY DESTINATION ─────────────────────────────────────── */}
      <section>
        <div className="bg-white py-12 sm:py-16 text-center px-4">
          <ScrollAnimation>
            <p className="text-forest font-medium text-sm uppercase tracking-[0.15em] mb-2">
              Explore the World
            </p>
            <h2 className="text-forest-dark">
              Fish the World&apos;s Greatest Waters
            </h2>
          </ScrollAnimation>
        </div>

        {/* 4 destination panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gridAutoRows: "clamp(320px, 55vw, 680px)" }}>
          {destinationPanels.map(({ dest, panelTagline }, i) => (
            <ScrollAnimation key={dest.id} delay={i * 0.08} className="h-full">
              <Link
                href={`/destinations/${dest.slug}`}
                className="group relative block h-full overflow-hidden"
              >
                <Image
                  src={dest.heroImageUrl.replace("w=1200", "w=800")}
                  alt={`Fly fishing in ${dest.name}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition-opacity duration-300 group-hover:from-black/65" />
                {/* Panel content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="font-heading text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-tight">
                    {dest.name}
                  </h3>
                  <p className="mt-1 text-white/65 text-xs sm:text-sm italic leading-snug">
                    {panelTagline}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-white/50 text-xs font-medium opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
                {/* Thin right border between panels */}
                <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
              </Link>
            </ScrollAnimation>
          ))}
        </div>

        <div className="bg-white py-6 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors text-sm"
          >
            View All 30 Destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── 4. FEATURED GUIDE ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="text-center mb-10">
              <p className="text-forest font-medium text-sm uppercase tracking-[0.15em] mb-2">
                Expert Voices
              </p>
              <h2 className="text-forest-dark">Your Expert on the Water</h2>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay={0.1}>
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div className="flex flex-col lg:flex-row min-h-[460px]">
                {/* Guide photo */}
                <div className="relative w-full lg:w-[45%] h-72 lg:h-auto flex-shrink-0 overflow-hidden">
                  <Image
                    src={
                      featuredGuide.photoUrl ||
                      "https://images.unsplash.com/photo-1624218656926-da680b8127c9?w=800&q=80"
                    }
                    alt={featuredGuide.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  {/* Blend into dark panel on desktop */}
                  <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-forest-dark hidden lg:block" />
                </div>

                {/* Info panel */}
                <div className="flex flex-col justify-center bg-forest-dark p-8 sm:p-10 lg:p-12 flex-1">
                  <p className="text-gold font-medium text-xs uppercase tracking-[0.2em] mb-3">
                    Your Expert Guide · Ireland
                  </p>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight">
                    Paddy McDonnell
                  </h3>
                  <p className="mt-1 text-white/50 text-sm">
                    Moy Ghillie Service — River Moy, County Mayo
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {featuredGuide.specialties.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 text-xs font-medium text-white/75 border border-white/20 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Years stat */}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-gold font-heading text-5xl font-bold leading-none">
                      {featuredGuide.yearsExperience}
                    </span>
                    <span className="text-white/55 text-sm">
                      Years on the Water
                    </span>
                  </div>

                  <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-lg">
                    A third-generation ghillie on Ireland&apos;s legendary River
                    Moy, Paddy brings an instinctive understanding of salmon
                    behaviour accumulated over a lifetime on the water. His
                    traditional Irish methods — wet fly teams, Spey casting, and
                    classic salmon patterns — make every session on the Moy
                    unforgettable.
                  </p>

                  {featuredGuide.dailyRate && (
                    <p className="mt-3 text-gold text-sm font-medium">
                      From {featuredGuide.dailyRate}
                    </p>
                  )}

                  <div className="mt-7 flex flex-wrap gap-4 items-center">
                    <Link
                      href={`/guides/${featuredGuide.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 border border-gold text-gold font-medium rounded-lg hover:bg-gold hover:text-white transition-colors text-sm"
                    >
                      View Guide Profile <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/guides"
                      className="text-white/45 hover:text-white/75 text-sm underline underline-offset-4 transition-colors"
                    >
                      Explore All Guides
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── 5. ARTICLES — "Tight Lines, Wide Horizons" ──────────────────── */}
      <section>
        {/* Dark editorial header */}
        <div className="bg-forest-dark py-16 sm:py-20 text-center px-4">
          <ScrollAnimation>
            <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-3">
              Insights &amp; Stories
            </p>
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold">
              Tight Lines, Wide Horizons
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Expert instruction, destination dispatches and stories from the
              world&apos;s greatest fisheries — curated for the discerning fly
              fisher.
            </p>
            <Link
              href="/articles"
              className="mt-6 inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium transition-colors text-sm"
            >
              Read the Journal <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollAnimation>
        </div>

        {/* Article cards */}
        <div className="bg-cream py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.map((article, i) => (
                <ScrollAnimation key={article.id} delay={i * 0.1}>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group block card-hover rounded-xl overflow-hidden bg-white shadow-md"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={article.heroImageUrl}
                        alt={article.title}
                        fill
                        className="object-cover card-image-zoom"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-forest text-white text-xs font-medium rounded-full uppercase tracking-wide">
                        {article.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-lg font-semibold text-forest-dark group-hover:text-forest transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        {article.readingTimeMinutes} min read · {article.author}
                      </p>
                    </div>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CTA ────────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="/images/mongolia-river-aerial.jpg"
          alt="Aerial view of a river winding through the Mongolian steppe"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <ScrollAnimation>
            <Image
              src="/images/icon-gold.svg"
              alt=""
              width={48}
              height={48}
              className="mx-auto mb-6 h-10 w-auto"
            />
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold">
              Plan Your Next Adventure
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              From the spring creeks of Montana to the wilds of Kamchatka —
              find your perfect fly fishing destination.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/destinations"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-forest-dark font-semibold rounded-lg hover:bg-cream transition-colors"
              >
                Browse Destinations <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/lodges"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Find a Lodge
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}
