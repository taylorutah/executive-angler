import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { getAllArticles } from "@/lib/db";
import {
  articlesByAuthorSlug,
  listAuthors,
  resolveAuthorSlug,
} from "@/lib/authors";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = resolveAuthorSlug(slug, await getAllArticles());
  if (!author) return { title: "Author Not Found" };
  const description =
    author.shortBio ?? `Field notes by ${author.name} on ${SITE_NAME}.`;
  return {
    title: author.role ? `${author.name} — ${author.role}` : author.name,
    description,
    openGraph: {
      title: `${author.name} | ${SITE_NAME}`,
      description,
      ...(author.imageUrl ? { images: [author.imageUrl] } : {}),
      type: "profile",
    },
    alternates: {
      canonical: `${SITE_URL}/authors/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return listAuthors(articles).map((a) => ({ slug: a.slug }));
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const articles = await getAllArticles();
  const author = resolveAuthorSlug(slug, articles);
  if (!author) notFound();

  const authorArticles = articlesByAuthorSlug(author.slug, articles).sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  );
  const profile = author.profile;
  const socialLinks = profile?.socialLinks ?? {};
  const sameAsLinks = Object.values(socialLinks).filter(Boolean) as string[];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: author.name,
          url: `${SITE_URL}/authors/${author.slug}`,
          ...(author.shortBio ? { description: author.shortBio } : {}),
          ...(author.imageUrl
            ? {
                image: author.imageUrl.startsWith("/")
                  ? `${SITE_URL}${author.imageUrl}`
                  : author.imageUrl,
              }
            : {}),
          ...(author.role ? { jobTitle: author.role } : {}),
          ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
          worksFor: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
          ...(profile?.expertise?.length
            ? { knowsAbout: profile.expertise }
            : {}),
        }}
      />

      <div className="bg-[var(--surface-page)] min-h-screen pt-6 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 font-ui text-[13px] text-[var(--text-meta)] mb-8">
            <Link href="/" className="hover:text-[var(--action)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/authors" className="hover:text-[var(--action)] transition-colors">
              Authors
            </Link>
            <span>/</span>
            <span className="text-[var(--text-body)]">{author.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex-shrink-0">
              <AuthorAvatar
                name={author.name}
                imageUrl={author.imageUrl}
                sizes="112px"
                fallbackTextClass="text-3xl sm:text-4xl"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-[34px] sm:text-[44px] font-bold leading-[1.05] text-[var(--text-primary)]">
                {author.name}
              </h1>
              {author.role && (
                <p className="mt-2 font-ui text-sm text-[var(--text-meta)]">
                  {author.role}
                </p>
              )}

              {sameAsLinks.length > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-meta)] hover:text-[var(--action)] transition-colors"
                      aria-label="Website"
                    >
                      <Icon name="map" className="h-5 w-5" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-meta)] hover:text-[var(--action)] transition-colors"
                      aria-label="Instagram"
                    >
                      <Icon name="instagram" className="h-5 w-5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-meta)] hover:text-[var(--action)] transition-colors"
                      aria-label="Twitter / X"
                    >
                      <Icon name="social-x" className="h-5 w-5" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-meta)] hover:text-[var(--action)] transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Icon name="linkedin" className="h-5 w-5" />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-meta)] hover:text-[var(--action)] transition-colors"
                      aria-label="YouTube"
                    >
                      <Icon name="youtube" className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {profile?.bio && (
            <div className="prose mt-10">
              {profile.bio.split("\n\n").map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-4" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {profile?.expertise?.length ? (
            <div className="mt-10">
              <h2 className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                Writes about
              </h2>
              <p className="mt-2 max-w-[68ch] font-body text-[var(--text-body)]">
                {profile.expertise.join(" · ")}
              </p>
            </div>
          ) : null}

          <div className="mt-14 border-t border-[var(--border-rule)] pt-8">
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
              Field notes by {author.name}
            </h2>
            {authorArticles.length === 0 ? (
              <p className="mt-3 font-body text-[var(--text-body)]">
                Nothing published yet.{" "}
                <Link
                  href="/articles"
                  className="text-[var(--action)] hover:underline"
                >
                  Read the rest of the field notes
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-6">
                {authorArticles.map((article) => (
                  <li
                    key={article.id}
                    className="border-t border-[var(--border-rule)] first:border-t-0"
                  >
                    <Link href={`/articles/${article.slug}`} className="group block py-5">
                      <p className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                        {article.category}
                      </p>
                      <h3 className="mt-1 font-heading text-xl font-bold leading-snug text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
                        {article.title}
                      </h3>
                      {article.subtitle && (
                        <p className="mt-1 max-w-[60ch] font-body text-[15px] leading-relaxed text-[var(--text-body)]">
                          {article.subtitle}
                        </p>
                      )}
                      <p className="mt-2 font-ui text-[13px] text-[var(--text-meta)]">
                        {article.readingTimeMinutes} min read
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
