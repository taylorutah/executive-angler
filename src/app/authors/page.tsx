import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllAuthors } from "@/data/authors";

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

export default function AuthorsPage() {
  const authors = getAllAuthors();

  return (
    <div className="bg-[var(--surface-page)] min-h-screen pt-6 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-meta)] mb-8">
          <Link href="/" className="hover:text-[var(--action)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--text-body)]">Authors</span>
        </nav>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Our Authors
        </h1>
        <p className="text-[var(--text-body)] text-lg mb-10 max-w-2xl leading-relaxed">
          Meet the expert anglers and writers behind {SITE_NAME}. Every article
          is crafted by experienced fly fishers with real, on-the-water
          knowledge.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {authors.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="group flex gap-5 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-5 hover:border-[var(--action)]/30 hover:shadow-md transition-all"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--action)]/30 flex-shrink-0">
                <AuthorAvatar
                  name={author.name}
                  imageUrl={author.imageUrl}
                  sizes="80px"
                  fallbackTextClass="text-2xl"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
                  {author.name}
                </h2>
                <p className="text-sm text-[var(--action)] mb-2">{author.role}</p>
                <p className="text-sm text-[var(--text-body)] leading-relaxed line-clamp-2">
                  {author.shortBio}
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs text-[var(--action)] font-medium group-hover:gap-2 transition-all">
                  View profile <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
