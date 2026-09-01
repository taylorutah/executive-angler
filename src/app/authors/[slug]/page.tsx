import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { getAllArticles } from "@/lib/db";
import {
  articlesByAuthorSlug,
  isHouseAuthor,
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
  if (isHouseAuthor(author)) redirect("/articles");
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
  if (isHouseAuthor(author)) redirect("/articles");

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

      <div className="bg-[var(--paper)] min-h-screen pt-6 pb-24">
        <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
          <nav className="mb-8 flex items-center gap-1.5 text-[var(--text-13)] text-[var(--text-3)]">
            <Link href="/" className="transition-colors hover:text-[var(--accent)]">
              Home
            </Link>
            <span>/</span>
            <Link href="/authors" className="transition-colors hover:text-[var(--accent)]">
              Authors
            </Link>
            <span>/</span>
            <span className="text-[var(--text-2)]">{author.name}</span>
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
              <h1 className="font-heading text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
                {author.name}
              </h1>
              {author.role && (
                <p className="mt-2 text-sm text-[var(--text-3)]">
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
                      className="text-[var(--text-3)] transition-colors hover:text-[var(--accent)]"
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
                      className="text-[var(--text-3)] transition-colors hover:text-[var(--accent)]"
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
                      className="text-[var(--text-3)] transition-colors hover:text-[var(--accent)]"
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
                      className="text-[var(--text-3)] transition-colors hover:text-[var(--accent)]"
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
                      className="text-[var(--text-3)] transition-colors hover:text-[var(--accent)]"
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
            <div className="prose mt-12">
              {profile.bio.split("\n\n").map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-4" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {profile?.expertise?.length ? (
            <div className="mt-12">
              <h2 className="ea-overline">
                Writes about
              </h2>
              <p className="mt-2 text-[var(--text-2)]">
                {profile.expertise.join(" · ")}
              </p>
            </div>
          ) : null}

          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
              Field notes by {author.name}
            </h2>
            {authorArticles.length === 0 ? (
              <p className="mt-3 text-[var(--text-2)]">
                Nothing published yet.{" "}
                <Link
                  href="/articles"
                  className="text-[var(--accent)] hover:underline"
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
                    className="border-t border-[var(--border)] first:border-t-0"
                  >
                    <Link href={`/articles/${article.slug}`} className="group block py-5">
                      <p className="ea-overline">
                        {article.category}
                      </p>
                      <h3 className="mt-1 font-heading text-xl font-semibold leading-snug text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
                        {article.title}
                      </h3>
                      {article.subtitle && (
                        <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-[var(--text-2)]">
                          {article.subtitle}
                        </p>
                      )}
                      <p className="mt-2 text-[var(--text-13)] text-[var(--text-3)]">
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
