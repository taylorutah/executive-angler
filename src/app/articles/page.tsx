import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import EntityListView from "@/components/ui/EntityListView";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { getAllArticles } from "@/lib/db";
import { articleListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Fishing Articles & Instruction",
  description:
    "Expert fly fishing articles — techniques, destinations, gear reviews, conservation, and more. Your comprehensive angling library.",
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const featured = articles.filter((a) => a.featured);
  const heroArticle = featured[0];
  const supportArticles = featured.slice(1, 3);

  const items: (CardData & { _filterValues: Record<string, string> })[] = articles.map(
    (article) => ({
      href: `/articles/${article.slug}`,
      imageUrl: article.heroImageUrl,
      imageAlt: article.title,
      title: article.title,
      subtitle: article.subtitle,
      meta: `${article.readingTimeMinutes} min read · ${article.author}`,
      badges: [article.category],
      featured: article.featured,
      description: article.excerpt,
      _filterValues: {
        category: article.category,
        publishedAt: article.publishedAt,
      },
    })
  );

  return (
    <>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <section className="bg-forest-dark pt-32 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Insights &amp; Stories
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Tight Lines, Wide Horizons
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            Expert instruction, destination dispatches, and stories from the world's greatest
            fisheries — curated for the discerning fly fisher.
          </p>
        </div>
      </section>

      {/* ── Featured Articles Spotlight ───────────────────────────────────── */}
      {heroArticle && (
        <section className="bg-cream py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest mb-8">
              Editor&apos;s Picks
            </p>

            {/* Hero article — editorial split */}
            <ScrollAnimation>
              <Link href={`/articles/${heroArticle.slug}`} className="group block mb-6">
                <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
                  <div className="relative h-72 lg:h-[420px]">
                    <Image
                      src={heroArticle.heroImageUrl}
                      alt={heroArticle.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/40 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-white text-xs font-semibold uppercase tracking-wide rounded-full">
                      {heroArticle.category}
                    </span>
                  </div>
                  <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-bold text-forest-dark group-hover:text-forest transition-colors leading-tight">
                      {heroArticle.title}
                    </h2>
                    {heroArticle.subtitle && (
                      <p className="mt-2 text-base font-medium text-gold">
                        {heroArticle.subtitle}
                      </p>
                    )}
                    <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base line-clamp-3">
                      {heroArticle.excerpt}
                    </p>
                    <div className="mt-5 flex items-center gap-3 text-sm text-slate-400">
                      <span>{heroArticle.readingTimeMinutes} min read</span>
                      <span>·</span>
                      <span>{heroArticle.author}</span>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest group-hover:underline">
                      Read Article <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollAnimation>

            {/* 2 support articles */}
            {supportArticles.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-6">
                {supportArticles.map((article, i) => (
                  <ScrollAnimation key={article.id} delay={(i + 1) * 0.1}>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48">
                        <Image
                          src={article.heroImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-gold text-white text-[10px] font-semibold uppercase tracking-wide rounded-full">
                          {article.category}
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading text-lg font-bold text-forest-dark group-hover:text-forest transition-colors leading-snug">
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
            )}
          </div>
        </section>
      )}

      {/* ── Full Catalog ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h2 className="font-heading text-2xl font-bold text-forest-dark">The Full Journal</h2>
          <p className="text-sm text-slate-500 mt-1">
            {articles.length} articles across techniques, destinations, gear &amp; more
          </p>
        </div>
      </div>
      <section className="bg-white pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView items={items} config={articleListConfig} storageKey="articles" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
