import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, User, Calendar, MapPin, Fish } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import JsonLd from "@/components/seo/JsonLd";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { sanitizeHtml } from "@/lib/sanitize";
import { getArticleBySlug, getAllArticles, getDestinationsByIds, getRiversByIds, getFliesByCategory, getAllCanonicalFlies } from "@/lib/db";
import { getAuthorByArticleName } from "@/data/authors";
import { extractFaqsFromHtml, faqPageJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  const authorData = getAuthorByArticleName(article.author);
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
      authors: authorData ? [`${SITE_URL}/authors/${authorData.slug}`] : undefined,
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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const allArticles = await getAllArticles();
  const otherArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 3);

  const authorData = getAuthorByArticleName(article.author);
  const categoryLabel = article.category ? article.category.charAt(0).toUpperCase() + article.category.slice(1) : "Guide";

  // Map article topics to fly categories for cross-linking
  const ARTICLE_FLY_MAP: Record<string, string | null> = {
    "introduction-to-euro-nymphing": "nymph",
    "streamer-fishing-mastery": "streamer",
    "dry-fly-anglers-guide-matching-the-hatch": "dry",
    "essential-fly-box-20-patterns": null, // all categories
    "reading-water-complete-guide": null,
  };

  const flyCategory = ARTICLE_FLY_MAP[article.slug];
  const shouldShowFlies = flyCategory !== undefined || article.category === "technique" || article.category === "gear";
  const faqs = extractFaqsFromHtml(article.content);

  const [relatedDests, relatedRivers, relatedFlies] = await Promise.all([
    article.relatedDestinationIds?.length
      ? getDestinationsByIds(article.relatedDestinationIds)
      : Promise.resolve([]),
    article.relatedRiverIds?.length
      ? getRiversByIds(article.relatedRiverIds)
      : Promise.resolve([]),
    shouldShowFlies
      ? (flyCategory
          ? getFliesByCategory(flyCategory).then((f) => f.slice(0, 6))
          : getAllCanonicalFlies().then((f) => f.filter((p) => p.featured).slice(0, 6)))
      : Promise.resolve([]),
  ]);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        articleSection: categoryLabel,
        keywords: article.tags?.join(", "),
        author: authorData
          ? {
              "@type": "Person",
              name: authorData.name,
              url: `${SITE_URL}/authors/${authorData.slug}`,
              ...(authorData.imageUrl
                ? {
                    image: authorData.imageUrl.startsWith("/")
                      ? `${SITE_URL}${authorData.imageUrl}`
                      : authorData.imageUrl,
                  }
                : {}),
              jobTitle: authorData.role,
              sameAs: Object.values(authorData.socialLinks).filter(Boolean),
            }
          : { "@type": "Person", name: article.author },
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

      {/* HowTo schema for technique articles */}
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

      {/* Reading progress bar — CSS scroll-driven */}
      <div className="reading-progress-bar" aria-hidden="true" />

      {/* Hero — tall, cinematic */}
      <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
        {true && (
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
        )}
        <SafeEntityImage
          src={article.heroImageUrl}
          alt={article.title}
          title={article.title}
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* gradient: transparent top → dark bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pb-14">
            <Badge variant="forest" size="md">{article.category}</Badge>
            <h1 className="text-white font-heading font-bold text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight max-w-3xl">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="mt-2 text-white/75 text-lg italic max-w-2xl">{article.subtitle}</p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-5 text-[13px] text-white/60">
              {authorData ? (
                <Link href={`/authors/${authorData.slug}`} className="flex items-center gap-1.5 hover:text-[var(--action)] transition-colors">
                  <User className="h-3.5 w-3.5" />Written by {authorData.name}
                </Link>
              ) : (
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{article.author}</span>
              )}
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{article.readingTimeMinutes} min read</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />
                {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article page */}
      <div className="bg-[var(--surface-page)] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">

          {/* Breadcrumb + favorite — same width as content */}
          <div className="flex items-center justify-between py-5 border-b border-[var(--border-rule)] mb-10">
            <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-meta)]">
              <Link href="/" className="hover:text-[var(--action)] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/articles" className="hover:text-[var(--action)] transition-colors">Articles</Link>
              <span>/</span>
              <span className="text-[var(--text-body)] truncate max-w-[200px] sm:max-w-none">{article.title}</span>
            </nav>
            <FavoriteButton entityType="article" entityId={article.id} />
          </div>

          {/* Article body — full width of container */}
          <article className="pb-24">
            <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />

            {/* Related Destinations */}
            {relatedDests.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[var(--border-rule)]">
                <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--action)]" />
                  Related Destinations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {relatedDests.map((dest) => (
                    <EntityCard
                      key={dest.id}
                      href={`/destinations/${dest.slug}`}
                      imageUrl={dest.heroImageUrl}
                      imageAlt={`Fly fishing in ${dest.name}`}
                      title={dest.name}
                      subtitle={dest.tagline}
                      meta={dest.region}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Related Rivers */}
            {relatedRivers.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[var(--border-rule)]">
                <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <Fish className="h-5 w-5 text-[var(--action)]" />
                  Related Rivers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {relatedRivers.map((river) => (
                    <EntityCard
                      key={river.id}
                      href={`/rivers/${river.slug}`}
                      imageUrl={river.heroImageUrl}
                      imageAlt={`${river.name} fly fishing`}
                      title={river.name}
                      subtitle={river.flowType}
                      meta={(river.primarySpecies || []).slice(0, 3).join(" · ")}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Related Fly Patterns */}
            {relatedFlies.length > 0 && (
              <div className="mt-12">
                <h2 className="font-heading text-lg font-semibold text-[var(--action)] mb-4">
                  Related Fly Patterns
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {relatedFlies.map((fly) => (
                    <EntityCard
                      key={fly.id}
                      href={`/flies/${fly.slug}`}
                      imageUrl={fly.heroImageUrl || "/images/fly-icons/" + fly.category + ".svg"}
                      imageAlt={fly.name}
                      title={fly.name}
                      subtitle={fly.category.charAt(0).toUpperCase() + fly.category.slice(1)}
                      meta={`Sizes ${fly.sizes[0]}–${fly.sizes[fly.sizes.length - 1]}`}
                      iconOnly={!fly.heroImageUrl}
                      imageContain={!!fly.heroImageUrl}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Author bio box */}
            {authorData && (
              <div className="mt-16 pt-10 border-t border-[var(--border-rule)]">
                <Link
                  href={`/authors/${authorData.slug}`}
                  className="group flex gap-5 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] hover:border-[var(--action)]/30 p-5 transition-all"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--action)]/30 flex-shrink-0">
                    <AuthorAvatar
                      name={authorData.name}
                      imageUrl={authorData.imageUrl}
                      sizes="64px"
                      fallbackTextClass="text-xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--text-meta)] uppercase tracking-wide mb-0.5">
                      Written by
                    </p>
                    <h3 className="font-heading text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
                      {authorData.name}
                    </h3>
                    <p className="text-sm text-[var(--text-body)] mt-1 leading-relaxed line-clamp-2">
                      {authorData.shortBio}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Divider */}
            <div className="mt-16 pt-10 border-t border-[var(--border-rule)]">
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-6">More Articles</h2>
              {otherArticles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {otherArticles.map((a) => (
                    <Link key={a.id} href={`/articles/${a.slug}`}
                      className="group block bg-[var(--surface-raised)] rounded-xl overflow-hidden border border-[var(--border-rule)] hover:border-[var(--action)]/30 hover:shadow-md transition-all">
                      <div className="relative h-36 w-full overflow-hidden">
                        <SafeEntityImage
                          src={a.heroImageUrl}
                          alt={a.title}
                          title={a.title}
                          meta={a.category}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(min-width: 640px) 33vw, 100vw"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-[11px] text-[var(--action)] font-semibold uppercase tracking-wide">{a.category}</span>
                        <h3 className="mt-1 font-heading text-sm font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--action)] transition-colors">{a.title}</h3>
                        <p className="mt-1.5 text-xs text-[var(--text-meta)]">{a.readingTimeMinutes} min read</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
