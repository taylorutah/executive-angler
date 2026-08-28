import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import EntityListView from "@/components/ui/EntityListView";
import { getAllArticles } from "@/lib/db";
import { articleListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

function noteDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "America/Denver",
  });
}

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

  const items: (CardData & { _filterValues: Record<string, string> })[] = articles.map(
    (article) => ({
      href: `/articles/${article.slug}`,
      imageUrl: article.heroImageUrl,
      imageAlt: article.title,
      title: article.title,
      subtitle: article.subtitle,
      group: article.category,
      meta: [noteDate(article.publishedAt), article.author].filter(Boolean).join(" · "),
      badges: [article.category],
      featured: article.featured,
      description: article.excerpt,
      _filterValues: {
        category: article.category,
        publishedAt: article.publishedAt,
      },
    }),
  );

  return (
    <>
      <DeskMast
        title="The archive"
        lede="What the gauge does not say. No comments. No feed. One Refine."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <Suspense>
            <EntityListView
              items={items}
              config={articleListConfig}
              storageKey="articles"
              deskLayout="archive"
            />
          </Suspense>
        </HomeGutter>
      </section>
    </>
  );
}
