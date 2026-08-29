import type { Metadata } from "next";
import Link from "next/link";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllArticles } from "@/lib/db";
import { articlesByAuthorSlug, isHouseAuthor, listAuthors } from "@/lib/authors";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Authors & Contributors",
  description: `Meet the expert anglers and writers behind ${SITE_NAME}. Our team brings decades of fly fishing experience and deep subject-matter expertise to every article.`,
  openGraph: {
    title: `Our Authors & Contributors | ${SITE_NAME}`,
    description: `Meet the expert anglers and writers behind ${SITE_NAME}.`,
  },
  alternates: {
    canonical: `${SITE_URL}/authors`,
  },
};

export default async function AuthorsPage() {
  const articles = await getAllArticles();
  // The house byline's entry stays off the masthead (client ruling
  // 2026-08-28); its /authors/[slug] route still resolves directly.
  const authors = listAuthors(articles).filter((a) => !isHouseAuthor(a));

  return (
    <div className="bg-[var(--paper)] min-h-screen pt-6 pb-24">
      <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
        <nav className="mb-8 flex items-center gap-1.5 text-[var(--text-13)] text-[var(--text-3)]">
          <Link href="/" className="transition-colors hover:text-[var(--accent)]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--text-2)]">Authors</span>
        </nav>

        <h1 className="font-heading text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
          Our Authors
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-2)]">
          Every field note on {SITE_NAME} is written by someone who fishes.
        </p>

        {authors.length === 0 ? (
          <div className="ea-empty mt-12 border-t border-[var(--border)]">
            <p>Every field note comes from the Executive Angler desk — no separate masthead.</p>
            <Link href="/articles" className="ea-btn ea-btn-primary">
              Read the field notes
            </Link>
          </div>
        ) : (
          <ul className="mt-12 border-t border-[var(--border)]">
            {authors.map((author) => {
              const count = articlesByAuthorSlug(author.slug, articles).length;
              return (
                <li key={author.slug} className="border-b border-[var(--border)]">
                  <Link
                    href={`/authors/${author.slug}`}
                    className="group flex gap-5 py-6 items-start"
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                      <AuthorAvatar
                        name={author.name}
                        imageUrl={author.imageUrl}
                        sizes="56px"
                        fallbackTextClass="text-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading text-xl font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
                        {author.name}
                      </h2>
                      {author.role && (
                        <p className="text-[var(--text-13)] text-[var(--text-3)]">
                          {author.role}
                        </p>
                      )}
                      {author.shortBio && (
                        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[var(--text-2)]">
                          {author.shortBio}
                        </p>
                      )}
                      <p className="mt-2 text-[var(--text-13)] text-[var(--text-3)]">
                        {count === 0
                          ? "No field notes published yet"
                          : `${count} field note${count === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
