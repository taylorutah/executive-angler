import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { Article } from "@/types/entities";
import { photoAlt } from "./homepage-images";

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

/** One feature at magazine scale plus three smaller. Byline on each. Not four equal tiles. */
export default function ThisWeeksRead({ lead, rest }: Props) {
  const leadBy = byline(lead);

  return (
    <section data-lane="resource" className="bg-[var(--paper)] py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <p className="ea-overline">
          Field note
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--text-1)]">
          This week&apos;s read
        </h2>

        <Link
          href={`/articles/${lead.slug}`}
          className="group mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
        >
          <div className="photo-card relative aspect-[3/2] w-full overflow-hidden rounded-surface border border-[var(--border)]">
            <SafeEntityImage
              src={lead.heroImageUrl}
              alt={photoAlt(lead.heroImageAlt, lead.title)}
              title={lead.title}
              className="ea-photo"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div>
            <p className="ea-overline">
              {lead.category}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
              {lead.title}
            </h3>
            <p className="mt-4 text-[var(--text-2)]">
              {lead.excerpt}
            </p>
            <p className="ea-overline mt-5">
              By {leadBy.author}
              {leadBy.date ? ` · ${leadBy.date}` : ""}
            </p>
          </div>
        </Link>

        {rest.length > 0 && (
          <ul className="mt-8 border-t border-[var(--border)] pt-6">
            {rest.map((article) => {
              const line = byline(article);
              return (
                <li
                  key={article.id}
                  className="border-b border-[var(--border)] py-4 first:pt-0 last:border-b-0"
                >
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group flex flex-wrap items-baseline justify-between gap-3"
                  >
                    <h3 className="font-display text-xl font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
                      {article.title}
                    </h3>
                    <p className="ea-overline">
                      By {line.author}
                      {line.date ? ` · ${line.date}` : ""}
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
