import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { isHouseByline } from "@/lib/authors";
import { GazetteClock } from "@/lib/gazette/date";
import type { Article } from "@/types/entities";
import { photoAlt } from "./homepage-images";

interface Props {
  lead: Article;
  rest: Article[];
}

function byline(article: Article): { author: string | null; date: string | null } {
  const date = new Date(article.publishedAt);
  const formatted = Number.isNaN(date.getTime()) ? null : GazetteClock.chrome(date);
  return { author: isHouseByline(article.author) ? null : article.author, date: formatted };
}

/** One field note. Authors belong here. */
export default function ThisWeeksRead({ lead, rest }: Props) {
  const leadBy = byline(lead);
  const leadMeta = [leadBy.author ? `By ${leadBy.author}` : null, leadBy.date].filter(Boolean).join(" · ");

  return (
    <section data-lane="resource" className="border-b border-[var(--border)] bg-[var(--paper)] py-10 sm:py-12">
      <p className="ea-overline">Field note</p>
      <Link href={`/articles/${lead.slug}`} className="group mt-4 block">
        {lead.heroImageUrl ? (
          <div className="photo-card relative mb-5 aspect-[3/2] w-full overflow-hidden">
            <SafeEntityImage
              src={lead.heroImageUrl}
              alt={photoAlt(lead.heroImageAlt, lead.title)}
              title={lead.title}
              className="ea-photo"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        ) : null}
        <h2 className="font-display text-2xl font-semibold leading-tight text-[var(--ink)] group-hover:text-[var(--accent)]">
          {lead.title}
        </h2>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-2)]">
          {lead.excerpt}
        </p>
        {leadMeta && <p className="ea-overline mt-4">{leadMeta}</p>}
      </Link>

      {rest.length > 0 && (
        <ul className="mt-6 border-t border-[var(--border)]">
          {rest.map((article) => {
            const line = byline(article);
            const meta = [line.author ? `By ${line.author}` : null, line.date]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={article.id} className="border-b border-[var(--border)] py-3">
                <Link href={`/articles/${article.slug}`} className="group flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">
                    {article.title}
                  </h3>
                  {meta && <p className="ea-overline">{meta}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
