import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import EntityListView from "@/components/ui/EntityListView";
import { getAllArticles } from "@/lib/db";
import { isHouseByline } from "@/lib/authors";
import { articleListConfig } from "@/lib/list-configs";
import type { CardData } from "@/types/list-config";

function noteDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "America/Denver",
  });
}

/** Field Notes archive — INDEX 81:440. */
export default async function ArticlesArchive() {
  const articles = await getAllArticles();

  const items: (CardData & { _filterValues: Record<string, string> })[] = articles.map(
    (article) => ({
      href: `/articles/${article.slug}`,
      imageUrl: article.heroImageUrl,
      imageAlt: article.title,
      title: article.title,
      subtitle: article.subtitle,
      group: article.category,
      meta: [noteDate(article.publishedAt), isHouseByline(article.author) ? null : article.author]
        .filter(Boolean)
        .join(" · "),
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

      <section className="bg-[var(--paper)] pb-16">
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
