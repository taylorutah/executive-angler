import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/ui/HeroSection";
import EntityListView from "@/components/ui/EntityListView";
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
      <HeroSection
        imageUrl="https://images.unsplash.com/photo-1768225601822-e6077c0cb086?w=1920&q=80"
        imageAlt="Sunrise over a misty river with silhouetted trees"
        title="Articles"
        subtitle="Expert instruction, destination guides, technique deep-dives, and the stories behind the sport."
      />

      <section className="py-16 sm:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense>
            <EntityListView
              items={items}
              config={articleListConfig}
              storageKey="articles"
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
