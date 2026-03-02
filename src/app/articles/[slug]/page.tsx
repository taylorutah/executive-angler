import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, Calendar, ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import JsonLd from "@/components/seo/JsonLd";
import { articles } from "@/data/articles";
import { destinations } from "@/data/destinations";
import { rivers } from "@/data/rivers";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.heroImageUrl],
      type: "article",
    },
  };
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const relatedDests = destinations.filter((d) =>
    article.relatedDestinationIds.includes(d.id)
  );
  const relatedRivers = rivers.filter((r) =>
    article.relatedRiverIds.includes(r.id)
  );
  const otherArticles = articles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          author: {
            "@type": "Person",
            name: article.author,
          },
          datePublished: article.publishedAt,
          image: article.heroImageUrl,
        }}
      />

      {/* Hero */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <Image
          src={article.heroImageUrl}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pb-12">
            <Badge variant="forest" size="md">
              {article.category}
            </Badge>
            <h1 className="mt-3 text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="mt-3 text-xl text-white/80 italic">
                {article.subtitle}
              </p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.readingTimeMinutes} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-cream">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: "Articles", href: "/articles" },
                { label: article.title },
              ]}
            />
            <FavoriteButton entityType="article" entityId={article.id} />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="bg-cream pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3">
              <ScrollAnimation>
                <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Article Body */}
                  <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-forest-dark prose-a:text-forest prose-a:font-medium">
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  </div>
                </div>
              </ScrollAnimation>

              {/* Related Articles */}
              {otherArticles.length > 0 && (
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-forest-dark mt-12 mb-6">
                    More Articles
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {otherArticles.map((a) => (
                      <Link
                        key={a.id}
                        href={`/articles/${a.slug}`}
                        className="block p-4 bg-white rounded-xl shadow-sm card-hover"
                      >
                        <span className="text-xs text-forest font-medium uppercase">
                          {a.category}
                        </span>
                        <h3 className="mt-1 font-heading text-sm font-semibold text-forest-dark">
                          {a.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {a.readingTimeMinutes} min read
                        </p>
                      </Link>
                    ))}
                  </div>
                </ScrollAnimation>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {relatedDests.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-base font-semibold text-forest-dark mb-3">
                    Related Destinations
                  </h3>
                  {relatedDests.map((d) => (
                    <Link
                      key={d.id}
                      href={`/destinations/${d.slug}`}
                      className="block py-2 text-sm text-forest hover:text-forest-dark font-medium"
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              )}
              {relatedRivers.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-heading text-base font-semibold text-forest-dark mb-3">
                    Related Rivers
                  </h3>
                  {relatedRivers.map((r) => (
                    <Link
                      key={r.id}
                      href={`/rivers/${r.slug}`}
                      className="block py-2 text-sm text-river hover:text-river-dark font-medium"
                    >
                      {r.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
