import Link from "next/link";
import DeskMast from "@/components/desk/DeskMast";
import DeskSeeAll from "@/components/desk/DeskSeeAll";
import HomeGutter from "@/components/home/HomeGutter";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { getAllArticles } from "@/lib/db";
import { isHouseByline } from "@/lib/authors";
import type { Article } from "@/types/entities";

function noteDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "America/Denver",
  });
}

function pickLead(articles: Article[]): Article | null {
  return (
    articles.find((a) => a.featured && a.heroImageUrl) ??
    articles.find((a) => Boolean(a.heroImageUrl)) ??
    articles[0] ??
    null
  );
}

/** Field Notes / 1440 — THE DESK. Frame 76:207. */
export default async function NotesDeskPage() {
  const articles = await getAllArticles();
  const lead = pickLead(articles);
  const fromDesk = articles.filter((a) => a.id !== lead?.id).slice(0, 3);
  const onDesk = (lead ? 1 : 0) + fromDesk.length;

  return (
    <>
      <DeskMast
        kicker="THE DESK"
        title="Field Notes"
        lede="What the gauge does not say. No comments. No feed."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--paper)] pb-4">
        <HomeGutter>
          <div className="mb-8 flex h-10 items-center">
            <Link
              href="/articles/archive"
              className="ea-focus-ring rounded-[2px] border border-[var(--border-rule)] bg-[var(--paper)] px-[18px] py-2 font-ui text-[13px] font-medium text-[var(--ink)]"
            >
              Refine
            </Link>
          </div>

          {lead ? (
            <Link
              href={`/articles/${lead.slug}`}
              className="group grid items-start gap-8 pb-12 lg:grid-cols-[minmax(0,794fr)_minmax(0,454fr)]"
            >
              <div className="photo-lift relative aspect-[794/420] w-full border border-[var(--border-rule)]">
                <SafeEntityImage
                  src={lead.heroImageUrl}
                  alt={lead.heroImageAlt || lead.title}
                  title={lead.title}
                  fallback="quiet"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  priority
                />
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
                  Field note
                </p>
                <h2
                  className="hover-copper font-heading text-[32px] font-semibold leading-[38px] text-[var(--ink)] group-hover:text-[var(--copper)]"
                  style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                >
                  {lead.title}
                </h2>
                <p className="font-ui text-[13px] leading-4 text-[var(--slate)]">
                  {[noteDate(lead.publishedAt), isHouseByline(lead.author) ? null : lead.author].filter(Boolean).join(" · ")}
                </p>
                {lead.excerpt ? (
                  <p className="font-ui text-[16px] leading-6 text-[var(--graphite)]">
                    {lead.excerpt}
                  </p>
                ) : null}
                <p className="font-ui text-[14px] font-medium text-[var(--copper)]">
                  Read the note →
                </p>
              </div>
            </Link>
          ) : null}

          {fromDesk.length > 0 ? (
            <div className="pb-4">
              <h2
                className="mb-6 font-heading text-[28px] font-semibold leading-8 text-[var(--ink)]"
                style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
              >
                From the desk
              </h2>
              <ul className="flex flex-col gap-6">
                {fromDesk.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="group flex flex-col gap-6 border border-[var(--border-rule)] py-4 sm:flex-row sm:items-center"
                    >
                      <div className="photo-lift relative aspect-[320/180] w-full shrink-0 sm:w-[320px]">
                        <SafeEntityImage
                          src={article.heroImageUrl}
                          alt={article.heroImageAlt || article.title}
                          title={article.title}
                          fallback="quiet"
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 320px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-2 px-4 sm:px-0">
                        <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
                          {article.category}
                        </p>
                        <h3
                          className="hover-copper font-heading text-[24px] font-semibold leading-7 text-[var(--ink)] group-hover:text-[var(--copper)]"
                          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                        >
                          {article.title}
                        </h3>
                        {article.excerpt ? (
                          <p className="max-w-[720px] font-ui text-[15px] leading-[22px] text-[var(--graphite)]">
                            {article.excerpt}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <DeskSeeAll
            kicker="THE ARCHIVE"
            title={`${onDesk} on the desk. The rest of the year is in the archive.`}
            href="/articles/archive"
            label="The archive →"
          />
        </HomeGutter>
      </section>
    </>
  );
}
