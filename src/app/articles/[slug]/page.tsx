import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, Calendar, MapPin, Fish } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { getArticleBySlug, getAllArticles, getDestinationsByIds, getRiversByIds } from "@/lib/db";
import { getAuthorByArticleName } from "@/data/authors";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [
        article.heroImageUrl ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.excerpt || "")}&type=article`,
      ],
      type: "article",
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

  const [relatedDests, relatedRivers] = await Promise.all([
    article.relatedDestinationIds?.length
      ? getDestinationsByIds(article.relatedDestinationIds)
      : Promise.resolve([]),
    article.relatedRiverIds?.length
      ? getRiversByIds(article.relatedRiverIds)
      : Promise.resolve([]),
  ]);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        author: authorData
          ? {
              "@type": "Person",
              name: authorData.name,
              url: `${SITE_URL}/authors/${authorData.slug}`,
              image: authorData.imageUrl.startsWith("/")
                ? `${SITE_URL}${authorData.imageUrl}`
                : authorData.imageUrl,
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
      }} />

      {/* Reading progress bar — CSS scroll-driven */}
      <div className="reading-progress-bar" aria-hidden="true" />

      {/* Hero — tall, cinematic */}
      <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={article.heroImageUrl}
          alt={article.title}
          fill
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
                <Link href={`/authors/${authorData.slug}`} className="flex items-center gap-1.5 hover:text-[#E8923A] transition-colors">
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
      <div className="bg-[#0D1117] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">

          {/* Breadcrumb + favorite — same width as content */}
          <div className="flex items-center justify-between py-5 border-b border-[#21262D] mb-10">
            <nav className="flex items-center gap-1.5 text-[13px] text-[#484F58]">
              <Link href="/" className="hover:text-[#E8923A] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/articles" className="hover:text-[#E8923A] transition-colors">Articles</Link>
              <span>/</span>
              <span className="text-[#8B949E] truncate max-w-[200px] sm:max-w-none">{article.title}</span>
            </nav>
            <FavoriteButton entityType="article" entityId={article.id} />
          </div>

          {/* Article body — full width of container */}
          <article className="pb-24">
            <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

            {/* Related Destinations */}
            {relatedDests.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[#21262D]">
                <h2 className="font-heading text-lg font-bold text-[#F0F6FC] mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#E8923A]" />
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
              <div className="mt-16 pt-10 border-t border-[#21262D]">
                <h2 className="font-heading text-lg font-bold text-[#F0F6FC] mb-6 flex items-center gap-2">
                  <Fish className="h-5 w-5 text-[#E8923A]" />
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

            {/* Author bio box */}
            {authorData && (
              <div className="mt-16 pt-10 border-t border-[#21262D]">
                <Link
                  href={`/authors/${authorData.slug}`}
                  className="group flex gap-5 bg-[#161B22] rounded-xl border border-[#21262D] hover:border-[#E8923A]/30 p-5 transition-all"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8923A]/30 flex-shrink-0">
                    <Image
                      src={authorData.imageUrl}
                      alt={authorData.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#484F58] uppercase tracking-wide mb-0.5">
                      Written by
                    </p>
                    <h3 className="font-heading text-base font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
                      {authorData.name}
                    </h3>
                    <p className="text-sm text-[#8B949E] mt-1 leading-relaxed line-clamp-2">
                      {authorData.shortBio}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Divider */}
            <div className="mt-16 pt-10 border-t border-[#21262D]">
              <h2 className="font-heading text-lg font-bold text-[#F0F6FC] mb-6">More Articles</h2>
              {otherArticles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {otherArticles.map((a) => (
                    <Link key={a.id} href={`/articles/${a.slug}`}
                      className="group block bg-[#161B22] rounded-xl overflow-hidden border border-[#21262D] hover:border-[#E8923A]/30 hover:shadow-md transition-all">
                      {a.heroImageUrl && (
                        <div className="relative h-36 w-full overflow-hidden">
                          <Image src={a.heroImageUrl} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="p-4">
                        <span className="text-[11px] text-[#E8923A] font-semibold uppercase tracking-wide">{a.category}</span>
                        <h3 className="mt-1 font-heading text-sm font-bold text-[#F0F6FC] leading-snug group-hover:text-[#E8923A] transition-colors">{a.title}</h3>
                        <p className="mt-1.5 text-xs text-[#484F58]">{a.readingTimeMinutes} min read</p>
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
