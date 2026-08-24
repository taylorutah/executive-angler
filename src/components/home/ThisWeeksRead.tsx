import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { Article } from "@/types/entities";

interface Props {
  lead: Article;
  rest: Article[];
}

function byline(article: Article): string {
  const date = new Date(article.publishedAt);
  const formatted = Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return [article.author, formatted].filter(Boolean).join(" · ");
}

/** Band 6 — one field note at magazine scale, three more beside it. */
export default function ThisWeeksRead({ lead, rest }: Props) {
  return (
    <section className="bg-[var(--surface-page)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-heading text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          This week&apos;s read
        </h2>

        <Link href={`/articles/${lead.slug}`} className="group block">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--border-rule)] sm:aspect-[21/9]">
            <SafeEntityImage
              src={lead.heroImageUrl}
              alt={lead.heroImageAlt ?? ""}
              title={lead.title}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
          <div className="mt-6 max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--action)]">
              {lead.category}
            </p>
            <h3 className="mt-2 font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] group-hover:text-[var(--action)] sm:text-[2.75rem]">
              {lead.title}
            </h3>
            <p className="prose mt-4 text-[var(--text-body)]">{lead.excerpt}</p>
            <p className="mt-4 text-[13px] text-[var(--text-meta)]">{byline(lead)}</p>
          </div>
        </Link>

        {rest.length > 0 && (
          <div className="mt-14 grid gap-8 border-t border-[var(--border-rule)] pt-10 sm:grid-cols-3">
            {rest.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-[var(--border-rule)]">
                  <SafeEntityImage
                    src={article.heroImageUrl}
                    alt={article.heroImageAlt ?? ""}
                    title={article.title}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold leading-snug text-[var(--text-primary)] group-hover:text-[var(--action)]">
                  {article.title}
                </h3>
                <p className="mt-2 text-[13px] text-[var(--text-meta)]">{byline(article)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
