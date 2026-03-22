import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Globe, Instagram, Twitter, Linkedin, Youtube, BookOpen, Award, ChevronRight } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { getAuthorBySlug, getAllAuthors } from "@/data/authors";
import { getAllArticles } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Author Not Found" };
  return {
    title: `${author.name} — ${author.role}`,
    description: author.shortBio,
    openGraph: {
      title: `${author.name} — ${author.role} | ${SITE_NAME}`,
      description: author.shortBio,
      images: [author.imageUrl],
      type: "profile",
    },
    alternates: {
      canonical: `${SITE_URL}/authors/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getAllAuthors().map((a) => ({ slug: a.slug }));
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const allArticles = await getAllArticles();
  const authorArticles = allArticles.filter(
    (a) => a.author === author.articleAuthorName
  );

  const sameAsLinks = Object.values(author.socialLinks).filter(Boolean) as string[];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: author.name,
          url: `${SITE_URL}/authors/${author.slug}`,
          description: author.shortBio,
          image: author.imageUrl.startsWith("/")
            ? `${SITE_URL}${author.imageUrl}`
            : author.imageUrl,
          jobTitle: author.role,
          sameAs: sameAsLinks,
          worksFor: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
          knowsAbout: author.expertise,
        }}
      />

      <div className="bg-[#0D1117] min-h-screen pt-6 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] text-[#6E7681] mb-8">
            <Link href="/" className="hover:text-[#E8923A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/authors" className="hover:text-[#E8923A] transition-colors">
              Authors
            </Link>
            <span>/</span>
            <span className="text-[#A8B2BD]">{author.name}</span>
          </nav>

          {/* Author header */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start mb-12">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#E8923A]/40 flex-shrink-0">
              <Image
                src={author.imageUrl}
                alt={author.name}
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F0F6FC]">
                {author.name}
              </h1>
              <p className="mt-1 text-[#E8923A] font-medium text-lg">
                {author.role}
              </p>
              <p className="mt-3 text-[#A8B2BD] leading-relaxed">
                {author.shortBio}
              </p>

              {/* Social links */}
              <div className="mt-4 flex items-center gap-3">
                {author.socialLinks.website && (
                  <a
                    href={author.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6E7681] hover:text-[#E8923A] transition-colors"
                    aria-label="Website"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {author.socialLinks.instagram && (
                  <a
                    href={author.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6E7681] hover:text-[#E8923A] transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {author.socialLinks.twitter && (
                  <a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6E7681] hover:text-[#E8923A] transition-colors"
                    aria-label="Twitter / X"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {author.socialLinks.linkedin && (
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6E7681] hover:text-[#E8923A] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {author.socialLinks.youtube && (
                  <a
                    href={author.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6E7681] hover:text-[#E8923A] transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            {/* Full bio */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-xl font-bold text-[#F0F6FC] mb-4">
                About {author.name.split(" ")[0]}
              </h2>
              <div className="space-y-4 text-[#A8B2BD] leading-relaxed">
                {author.bio.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Sidebar: expertise + credentials */}
            <div className="space-y-8">
              {/* Expertise */}
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
                <h3 className="font-heading text-sm font-bold text-[#F0F6FC] mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#E8923A]" />
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {author.expertise.map((area) => (
                    <span
                      key={area}
                      className="inline-block text-xs px-2.5 py-1 rounded-full bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/20"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Credentials */}
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
                <h3 className="font-heading text-sm font-bold text-[#F0F6FC] mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#E8923A]" />
                  Credentials
                </h3>
                <ul className="space-y-2">
                  {author.credentials.map((cred) => (
                    <li
                      key={cred}
                      className="text-sm text-[#A8B2BD] flex items-start gap-2"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-[#E8923A] mt-0.5 flex-shrink-0" />
                      {cred}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Articles by this author */}
          {authorArticles.length > 0 && (
            <div className="border-t border-[#21262D] pt-10">
              <h2 className="font-heading text-xl font-bold text-[#F0F6FC] mb-6">
                Articles by {author.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {authorArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group block bg-[#161B22] rounded-xl overflow-hidden border border-[#21262D] hover:border-[#E8923A]/30 hover:shadow-md transition-all"
                  >
                    {article.heroImageUrl && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <Image
                          src={article.heroImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="text-[11px] text-[#E8923A] font-semibold uppercase tracking-wide">
                        {article.category}
                      </span>
                      <h3 className="mt-1 font-heading text-sm font-bold text-[#F0F6FC] leading-snug group-hover:text-[#E8923A] transition-colors">
                        {article.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#6E7681]">
                        {article.readingTimeMinutes} min read
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
