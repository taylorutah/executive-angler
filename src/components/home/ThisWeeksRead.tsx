import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { Article } from "@/types/entities";
import { photoAlt } from "./homepage-images";
import HomeGutter from "./HomeGutter";

interface Props {
  lead: Article;
}

function byline(article: Article): { author: string; date: string | null } {
  const date = new Date(article.publishedAt);
  const formatted = Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        timeZone: "America/Denver",
      });
  return { author: article.author, date: formatted };
}

/** One field note. Split: photograph left, copy right. Copper is the action. */
export default function ThisWeeksRead({ lead }: Props) {
  const line = byline(lead);

  return (
    <section data-lane="resource" className="bg-[var(--surface-page)] pb-12 pt-2">
      <HomeGutter>
        <Link
          href={`/articles/${lead.slug}`}
          className="group grid items-start gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]"
        >
          <div className="photo-lift relative aspect-[794/420] w-full">
            <SafeEntityImage
              src={lead.heroImageUrl}
              alt={photoAlt(lead.heroImageAlt, lead.title)}
              title={lead.title}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 62vw"
            />
          </div>
          <div className="max-w-[454px] pt-0 lg:pt-1">
            <p className="font-ui text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-meta)]">
              Field note
            </p>
            <h2
              className="mt-3 font-heading text-[36px] font-semibold leading-[1.16] text-[var(--text-primary)]"
              style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
            >
              {lead.title}
            </h2>
            <p className="mt-3 font-ui text-[12px] text-[var(--text-meta)]">
              {[line.date, line.author].filter(Boolean).join("  ·  ")}
            </p>
            {lead.excerpt && (
              <p className="prose mt-3 text-[16px] leading-[26px] text-[var(--text-body)]">
                {lead.excerpt}
              </p>
            )}
            <p className="mt-3 font-ui text-[13px] font-medium text-[var(--action)]">
              Read the note →
            </p>
          </div>
        </Link>
      </HomeGutter>
    </section>
  );
}
