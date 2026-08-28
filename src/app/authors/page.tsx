import type { Metadata } from "next";
import Link from "next/link";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllArticles } from "@/lib/db";
import { articlesByAuthorSlug, listAuthors } from "@/lib/authors";

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
  const authors = listAuthors(articles);

  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="house-measure">
        <nav className="flex items-center gap-1.5 font-ui text-[13px] text-[var(--text-meta)] mb-8">
          <Link href="/" className="hover:text-[var(--action)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--text-body)]">Authors</span>
        </nav>

        <h1 className="font-heading text-[34px] sm:text-[44px] font-bold leading-[1.05] text-[var(--text-primary)]">
          Our Authors
        </h1>
        <p className="mt-4 max-w-[68ch] font-body text-lg leading-relaxed text-[var(--text-body)]">
          Every field note on {SITE_NAME} is written by someone who fishes.
        </p>

        <ul className="mt-12 border-t border-[var(--border-rule)]">
          {authors.map((author) => {
            const count = articlesByAuthorSlug(author.slug, articles).length;
            return (
              <li key={author.slug} className="border-b border-[var(--border-rule)]">
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
                    <h2 className="hover-copper font-heading text-xl font-bold text-[var(--text-primary)]">
                      {author.name}
                    </h2>
                    {author.role && (
                      <p className="font-ui text-[13px] text-[var(--text-meta)]">
                        {author.role}
                      </p>
                    )}
                    {author.shortBio && (
                      <p className="mt-2 max-w-[60ch] font-body text-[15px] leading-relaxed text-[var(--text-body)]">
                        {author.shortBio}
                      </p>
                    )}
                    <p className="mt-2 font-ui text-[13px] text-[var(--text-meta)]">
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
        </div>
      </div>
    </div>
  );
}
