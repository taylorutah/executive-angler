import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { Article } from "@/types/entities";

interface Props {
  lead: Article;
  rest: Article[];
}

function byline(article: Article): { author: string; date: string | null } {
  const date = new Date(article.publishedAt);
  const formatted = Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return { author: article.author, date: formatted };
}

/** Asymmetric magazine spread + three text-only companions. */
export default function ThisWeeksRead({ lead, rest }: Props) {
  const leadBy = byline(lead);

  return (
    <section data-lane="resource" className="bg-[var(--surface-page)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
          <span aria-hidden className="h-px w-8 bg-[var(--action)]" />
          Field note
        </p>
        <h2 className="mb-8 font-heading text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          This week&apos;s read
        </h2>

        <Link
          href={`/articles/${lead.slug}`}
          className="group grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-[var(--border-rule)]">
            <SafeEntityImage
              src={lead.heroImageUrl}
              alt={lead.heroImageAlt ?? ""}
              title={lead.title}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--action)]">
              {lead.category}
            </p>
            <h3 className="mt-2 font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] group-hover:text-[var(--action)] sm:text-[2.25rem]">
              {lead.title}
            </h3>
            <p
              className="prose mt-4 text-[var(--text-body)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {lead.excerpt}
            </p>
            <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--text-primary)]">
              By {leadBy.author}
              {leadBy.date ? ` · ${leadBy.date}` : ""}
            </p>
          </div>
        </Link>

        {rest.length > 0 && (
          <ul className="mt-10 border-t border-[var(--border-rule)] pt-6">
            {rest.map((article) => {
              const line = byline(article);
              return (
                <li
                  key={article.id}
                  className="border-b border-[var(--border-rule)] py-4 first:pt-0 last:border-b-0"
                >
                  <Link href={`/articles/${article.slug}`} className="group flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--action)]">
                      {article.title}
                    </h3>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
                      By {line.author}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
