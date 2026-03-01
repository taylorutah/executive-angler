import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, BookOpen, Mountain, Fish } from "lucide-react";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import RatingStars from "@/components/ui/RatingStars";
import { destinations } from "@/data/destinations";
import { lodges } from "@/data/lodges";
import { articles } from "@/data/articles";
import { rivers } from "@/data/rivers";
import { species } from "@/data/species";
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

export default function HomePage() {
  const featuredDestinations = destinations.filter((d) => d.featured).slice(0, 6);
  const featuredLodges = lodges.filter((l) => l.featured).slice(0, 3);
  const featuredArticles = articles.filter((a) => a.featured).slice(0, 3);
  const featuredRivers = rivers.filter((r) => r.featured).slice(0, 4);
  const featuredSpecies = species.filter((s) => s.featured).slice(0, 6);

  return (
    <>
      {/* Hero Section */}
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
                Destinations, rivers, lodges, and expert instruction from the world&apos;s
                finest fly fishing waters.
              </p>
            </ScrollAnimation>
            <ScrollAnimation delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-forest text-white font-medium rounded-lg hover:bg-forest-light transition-colors shadow-lg"
                >
                  <MapPin className="h-5 w-5" />
                  Explore Destinations
                </Link>
                <Link
                  href="/articles"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                >
                  <BookOpen className="h-5 w-5" />
                  Read Articles
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

      {/* Featured Destinations */}
      <section className="py-20 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-forest font-medium text-sm uppercase tracking-[0.15em] mb-2">
                  Where to Fish
                </p>
                <h2 className="text-forest-dark">Featured Destinations</h2>
              </div>
              <Link
                href="/destinations"
                className="hidden sm:inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.map((dest, i) => (
              <ScrollAnimation key={dest.id} delay={i * 0.1}>
                <EntityCard
                  href={`/destinations/${dest.slug}`}
                  imageUrl={dest.heroImageUrl}
                  imageAlt={`Fly fishing in ${dest.name}`}
                  title={dest.name}
                  subtitle={dest.tagline}
                  meta={dest.primarySpecies.slice(0, 3).join(" · ")}
                  badges={dest.bestMonths.length > 0 ? [dest.bestMonths[0] + "–" + dest.bestMonths[dest.bestMonths.length - 1]] : []}
                />
              </ScrollAnimation>
            ))}
          </div>

          <Link
            href="/destinations"
            className="sm:hidden mt-8 inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
          >
            View All Destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Featured Rivers */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-river font-medium text-sm uppercase tracking-[0.15em] mb-2">
                  Waters Worth Wading
                </p>
                <h2 className="text-forest-dark">Legendary Rivers</h2>
              </div>
              <Link
                href="/rivers"
                className="hidden sm:inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRivers.map((river, i) => (
              <ScrollAnimation key={river.id} delay={i * 0.1}>
                <EntityCard
                  href={`/rivers/${river.slug}`}
                  imageUrl={river.heroImageUrl}
                  imageAlt={`${river.name} fly fishing`}
                  title={river.name}
                  subtitle={river.primarySpecies.join(", ")}
                  meta={river.flowType}
                  badges={[river.difficulty]}
                />
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Species */}
      {featuredSpecies.length > 0 && (
        <section className="py-20 sm:py-24 bg-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-forest font-medium text-sm uppercase tracking-[0.15em] mb-2">
                    Know Your Quarry
                  </p>
                  <h2 className="text-forest-dark">Popular Species</h2>
                </div>
                <Link
                  href="/species"
                  className="hidden sm:inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredSpecies.map((sp, i) => (
                <ScrollAnimation key={sp.id} delay={i * 0.08}>
                  <Link
                    href={`/species/${sp.slug}`}
                    className="group block rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={sp.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80"}
                        alt={sp.commonName}
                        fill
                        className="object-cover card-image-zoom"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                      {sp.family && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-forest/80 text-white text-[10px] font-medium rounded-full uppercase backdrop-blur-sm">
                          {sp.family}
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-heading text-sm font-semibold text-forest-dark group-hover:text-forest transition-colors">
                        {sp.commonName}
                      </h3>
                      {sp.scientificName && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                          {sp.scientificName}
                        </p>
                      )}
                    </div>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>

            <Link
              href="/species"
              className="sm:hidden mt-8 inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
            >
              <Fish className="h-4 w-4" />
              View All Species <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Featured Lodges */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-gold font-medium text-sm uppercase tracking-[0.15em] mb-2">
                  Where to Stay
                </p>
                <h2 className="text-forest-dark">Premier Fly Fishing Lodges</h2>
              </div>
              <Link
                href="/lodges"
                className="hidden sm:inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredLodges.map((lodge, i) => (
              <ScrollAnimation key={lodge.id} delay={i * 0.15}>
                <Link
                  href={`/lodges/${lodge.slug}`}
                  className="group block card-hover rounded-xl overflow-hidden bg-white shadow-md"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={lodge.heroImageUrl}
                      alt={lodge.name}
                      fill
                      className="object-cover card-image-zoom"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {lodge.priceRange && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-forest-dark">
                        {lodge.priceRange}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-semibold text-forest-dark group-hover:text-forest transition-colors">
                      {lodge.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {lodge.description.substring(0, 150)}...
                    </p>
                    {lodge.averageRating && (
                      <div className="mt-3">
                        <RatingStars
                          rating={lodge.averageRating}
                          count={lodge.reviewCount}
                        />
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {lodge.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-0.5 text-xs bg-cream text-forest-dark rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-20 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-forest font-medium text-sm uppercase tracking-[0.15em] mb-2">
                  From the Journal
                </p>
                <h2 className="text-forest-dark">Latest Articles</h2>
              </div>
              <Link
                href="/articles"
                className="hidden sm:inline-flex items-center gap-2 text-forest font-medium hover:text-forest-dark transition-colors"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollAnimation>

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
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-forest text-white text-xs font-medium rounded-full uppercase">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-forest-dark group-hover:text-forest transition-colors">
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
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* PLACEHOLDER — Replace with real photography */}
        <Image
          src="https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=1920&q=80"
          alt="Scenic mountain river at golden hour"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <ScrollAnimation>
            <Mountain className="h-10 w-10 text-gold mx-auto mb-6" />
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold">
              Plan Your Next Adventure
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              From the spring creeks of Montana to the flats of the Bahamas — find your
              perfect fly fishing destination.
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
