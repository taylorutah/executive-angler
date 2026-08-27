import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FavoriteButton from "@/components/ui/FavoriteButton";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import PullQuote from "@/components/article/PullQuote";
import StatBlock, { type Stat } from "@/components/article/StatBlock";
import JsonLd from "@/components/seo/JsonLd";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  getArticleBySlug,
  getAllArticles,
  getAllRivers,
  getAllCanonicalFlies,
} from "@/lib/db";
import { resolveAuthorByline } from "@/lib/authors";
import { deriveSubjectRivers, deriveSubjectFlies } from "@/lib/articles/subject";
import { splitBodyAtHeadings } from "@/lib/articles/segments";
import { extractFaqsFromHtml, faqPageJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  const author = resolveAuthorByline(article.author);
  const categoryLabel = article.category ? article.category.charAt(0).toUpperCase() + article.category.slice(1) : "Guide";
  const readTime = article.readingTimeMinutes ? `${article.readingTimeMinutes} min read. ` : "";
  const fallbackTitle = `${article.title} | Expert Fly Fishing ${categoryLabel} | Executive Angler`;
  const fallbackDesc = `${readTime}${article.excerpt ? article.excerpt.substring(0, 140) : `Expert fly fishing ${categoryLabel.toLowerCase()} guide.`}${article.excerpt && article.excerpt.length > 140 ? "..." : ""} Read now.`;

  const ogImage =
    article.heroImageUrl ||
    `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.excerpt || "")}&type=article`;

  return {
    title: { absolute: article.metaTitle || fallbackTitle },
    description: article.metaDescription || fallbackDesc,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
      type: "article",
      publishedTime: article.publishedAt,
      authors: [`${SITE_URL}/authors/${author.slug}`],
      section: categoryLabel,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle || fallbackTitle,
      description: article.metaDescription || fallbackDesc,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${SITE_URL}/articles/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allArticles = await getAllArticles();
  return allArticles.map((a) => ({ slug: a.slug }));
}

/** Only facts the river record actually holds. */
function riverStats(river: { lengthMiles?: number; flowType?: string; difficulty?: string; wadingType?: string }): Stat[] {
  const stats: Stat[] = [];
  if (river.lengthMiles) stats.push({ label: "Length", value: `${river.lengthMiles} mi` });
  if (river.flowType) stats.push({ label: "Flow", value: titleCase(river.flowType) });
  if (river.difficulty) stats.push({ label: "Difficulty", value: titleCase(river.difficulty) });
  if (river.wadingType) stats.push({ label: "Access", value: titleCase(river.wadingType) });
  return stats;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const author = resolveAuthorByline(article.author);
  const categoryLabel = article.category ? article.category.charAt(0).toUpperCase() + article.category.slice(1) : "Guide";
  const faqs = extractFaqsFromHtml(article.content);

  const [rivers, flies] = await Promise.all([getAllRivers(), getAllCanonicalFlies()]);
  const subjectRivers = deriveSubjectRivers(article, rivers);
  const subjectFlies = deriveSubjectFlies(article, flies);

  // The two permitted interruptions to the prose column, placed at heading
  // boundaries so neither lands mid-argument.
  const leadRiver = subjectRivers[0];
  const stats = leadRiver ? riverStats(leadRiver) : [];
  const showQuote = !!article.excerpt && article.excerpt !== article.subtitle;
  const showStats = stats.length >= 2;

  const segments = splitBodyAtHeadings(sanitizeHtml(article.content), [
    showQuote ? 1 : -1,
    showStats ? 3 : -1,
  ]);

  const interruptions = [
    showQuote ? (
      <PullQuote key="quote">{article.excerpt}</PullQuote>
    ) : null,
    showStats && leadRiver ? (
      <StatBlock key="stats" caption={`${leadRiver.name} — on the record`} stats={stats} />
    ) : null,
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        articleSection: categoryLabel,
        keywords: article.tags?.join(", "),
        author: {
          "@type": "Person",
          name: author.name,
          url: `${SITE_URL}/authors/${author.slug}`,
          ...(author.imageUrl
            ? {
                image: author.imageUrl.startsWith("/")
                  ? `${SITE_URL}${author.imageUrl}`
                  : author.imageUrl,
              }
            : {}),
          ...(author.role ? { jobTitle: author.role } : {}),
          ...(author.profile
            ? { sameAs: Object.values(author.profile.socialLinks).filter(Boolean) }
            : {}),
        },
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        image: article.heroImageUrl,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/articles/${article.slug}`,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/images/logo-1200.png`,
          },
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".article-body h2", ".article-body p:first-of-type"],
        },
      }} />

      {faqs.length > 0 && <JsonLd data={faqPageJsonLd(faqs)} />}

      {article.category === "technique" && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: article.title,
          description: article.excerpt,
          image: article.heroImageUrl,
          totalTime: `PT${article.readingTimeMinutes}M`,
          step: [{
            "@type": "HowToStep",
            name: article.title,
            text: article.excerpt,
            url: `${SITE_URL}/articles/${article.slug}`,
          }],
        }} />
      )}

      <div className="bg-[var(--surface-page)]">
        {/* Bleed image — the photograph runs the full width, the title sits under it */}
        <figure className="relative m-0 mx-auto w-full max-w-[900px]">
          <div className="relative h-[42vh] min-h-[280px] sm:h-[56vh] w-full overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <AdminHeroEditor
                entityType="articles"
                entityId={article.id}
                currentImageUrl={article.heroImageUrl}
                currentAlt={article.heroImageAlt}
                currentCredit={article.heroImageCredit}
                currentCreditUrl={article.heroImageCreditUrl}
              />
            </div>
            <SafeEntityImage
              src={article.heroImageUrl}
              alt={article.heroImageAlt || article.title}
              title={article.title}
              meta={article.category}
              className="object-cover"
              priority
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </div>
          {article.heroImageCredit && (
            <figcaption className="mx-auto max-w-5xl px-4 sm:px-8 pt-2.5 font-ui text-[13px] text-[var(--text-meta)]">
              {article.heroImageCreditUrl ? (
                <a
                  href={article.heroImageCreditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--action)] transition-colors"
                >
                  {article.heroImageCredit}
                </a>
              ) : (
                article.heroImageCredit
              )}
            </figcaption>
          )}
        </figure>

        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          {/* Breadcrumb + favorite */}
          <div className="flex items-center justify-between py-5 border-b border-[var(--border-rule)]">
            <Breadcrumbs
              items={[
                { label: "Field Notes", href: "/articles" },
                { label: article.title },
              ]}
            />
            <FavoriteButton entityType="article" entityId={article.id} />
          </div>

          <article className="pb-24">
            <header className="max-w-[68ch] pt-10 sm:pt-14">
              <p className="font-ui text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-meta)]">
                {categoryLabel}
              </p>
              <h1 className="mt-3 font-heading text-[34px] font-semibold leading-[1.05] text-[var(--text-primary)] sm:text-[44px] lg:text-[56px]">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="mt-4 font-body text-xl sm:text-2xl leading-snug text-[var(--text-body)]">
                  {article.subtitle}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[13px] text-[var(--text-meta)]">
                <Link
                  href={`/authors/${author.slug}`}
                  className="text-[var(--text-body)] hover:text-[var(--action)] transition-colors"
                >
                  {author.name}
                </Link>
                <span aria-hidden="true">·</span>
                <span>{article.readingTimeMinutes} min read</span>
                <span aria-hidden="true">·</span>
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </time>
              </div>
            </header>

            {/* Body — .prose supplies 19px / 1.7 / 68ch; .article-body keeps
                the element rules the stored HTML depends on. */}
            <div className="mt-10">
              {segments.map((segment, i) => (
                <div key={i}>
                  <div
                    className={`prose article-body${i > 0 ? " article-body--continued" : ""}`}
                    dangerouslySetInnerHTML={{ __html: segment }}
                  />
                  {i < segments.length - 1 && (
                    <div className="max-w-[68ch]">{interruptions[i]}</div>
                  )}
                </div>
              ))}
            </div>

            {/* The piece ends in the water, not on another article. */}
            {(subjectRivers.length > 0 || subjectFlies.length > 0) && (
              <div className="mt-16 max-w-[68ch] border-t border-[var(--border-rule)] pt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
                {subjectRivers.length > 0 && (
                  <section>
                    <h2 className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                      The water
                    </h2>
                    <ul className="mt-3 space-y-3">
                      {subjectRivers.map((river) => (
                        <li key={river.id}>
                          <Link
                            href={`/rivers/${river.slug}`}
                            className="hover-copper font-heading text-lg font-bold text-[var(--text-primary)] hover:text-[var(--action)]"
                          >
                            {river.name}
                          </Link>
                          {(river.primarySpecies || []).length > 0 && (
                            <p className="font-ui text-[13px] text-[var(--text-meta)]">
                              {(river.primarySpecies || []).slice(0, 3).join(" · ")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {subjectFlies.length > 0 && (
                  <section>
                    <h2 className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                      The flies
                    </h2>
                    <ul className="mt-3 space-y-3">
                      {subjectFlies.map((fly) => (
                        <li key={fly.id}>
                          <Link
                            href={`/flies/${fly.slug}`}
                            className="hover-copper font-heading text-lg font-bold text-[var(--text-primary)] hover:text-[var(--action)]"
                          >
                            {fly.name}
                          </Link>
                          <p className="font-ui text-[13px] text-[var(--text-meta)]">
                            {titleCase(fly.category)}
                            {fly.sizes?.length ? ` · sizes ${fly.sizes[0]}–${fly.sizes[fly.sizes.length - 1]}` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
