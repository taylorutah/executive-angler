import type { Metadata } from "next";
import { Suspense } from "react";
import ArticlesBrowser from "./ArticlesBrowser";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { getAllArticles } from "@/lib/db";
import { isHouseByline } from "@/lib/authors";
import { articleListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const articles = await getAllArticles();
  const n = articles.length;
  return {
    title: `Fly Fishing Articles — Techniques, Gear & Trip Planning`,
    description: `Read ${n} expert fly fishing articles on techniques, gear reviews, destination guides, and conservation. Level up your angling with in-depth instruction.`,
    alternates: { canonical: `${SITE_URL}/articles` },
    openGraph: {
      title: "Fly Fishing Articles — Techniques, Gear & Trip Planning",
      description: `Read ${n} expert fly fishing articles on techniques, gear reviews, destination guides, and conservation.`,
      images: ["/api/og?title=Articles%20%26%20Instruction&subtitle=Expert%20Fly%20Fishing%20Content&type=article"],
    },
  };
}

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const featured = articles.filter((a) => a.featured);
  const heroArticle = featured[0];

  const items: (CardData & { _filterValues: Record<string, string> })[] = articles.map(
    (article) => ({
      href: `/articles/${article.slug}`,
      imageUrl: article.heroImageUrl,
      imageAlt: article.title,
      title: article.title,
      subtitle: article.subtitle,
      // The house byline carries no visible attribution (client ruling
      // 2026-08-28); named authors keep theirs in the meta line.
      meta: isHouseByline(article.author)
        ? `${article.readingTimeMinutes} min read`
        : `${article.readingTimeMinutes} min read · ${article.author}`,
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
      {/* ── Photo band — flat hero (DESIGN.md §6): the photograph stands in
          its own band, no text over it. The heading sits on paper below. ── */}
      {heroArticle && (
        <div className="ea-photo-hero relative min-h-[280px] w-full overflow-hidden">
          <SafeEntityImage
            src={heroArticle.heroImageUrl}
            alt={heroArticle.title}
            title={heroArticle.title}
            meta={heroArticle.category}
            className="ea-photo"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* ── Editorial header — on paper, left-aligned ────────────────────── */}
      <section className="bg-[var(--paper)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="ea-overline">
            Field Notes
          </p>
          <h1 className="mt-3 text-[var(--text-1)]">
            Stories from the Water
          </h1>
          <p className="mt-5 max-w-[var(--prose)] text-lg text-[var(--text-2)] leading-relaxed">
            Expert instruction, destination dispatches, and stories from the world&apos;s greatest
            fisheries — curated for the discerning fly fisher.
          </p>
        </div>
      </section>

      {/* ── Story grid — four wide, every article in one continuous grid ──── */}
      <section className="bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Suspense>
            <ArticlesBrowser items={items} config={articleListConfig} storageKey="articles" />
          </Suspense>
        </div>
      </section>
    </>
  );
}
