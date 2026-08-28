import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import GoogleReviews from "@/components/GoogleReviews";
import UserReviews from "@/components/ui/UserReviews";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { SITE_URL } from "@/lib/constants";
import { hostedStillUrl } from "@/lib/media/image-url";
import {
  getAllGuides,
  getGuideBySlug,
  getDestinationById,
  getRiversByIds,
  getArticlesByDestination,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide Not Found" };

  const topSpecialties = (guide.specialties || []).slice(0, 2).join(" & ");
  const expStr = guide.yearsExperience ? `${guide.yearsExperience}+ years experience. ` : "";
  const rateStr = guide.dailyRate ? `Rates from ${guide.dailyRate}. ` : "";
  const riverCount = (guide.riverIds || []).length;
  const fallbackTitle = `${guide.name} — Expert Fly Fishing Guide | ${topSpecialties || "All Methods"} | Executive Angler`;
  const fallbackDesc = `Book ${guide.name} — expert fly fishing guide. ${expStr}${rateStr}Specialties: ${(guide.specialties || []).slice(0, 3).join(", ") || "all methods"}.${riverCount > 0 ? ` Access to ${riverCount} rivers.` : ""} Read reviews & book direct.`;

  return {
    title: { absolute: guide.metaTitle || fallbackTitle },
    description: guide.metaDescription || fallbackDesc,
    openGraph: {
      title: guide.metaTitle || guide.name,
      description: guide.metaDescription || fallbackDesc,
      images: [
        hostedStillUrl(guide.photoUrl) ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(guide.name)}&subtitle=${encodeURIComponent(`Fly Fishing Guide${guide.dailyRate ? ` — ${guide.dailyRate}` : ""}`)}&type=guide`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/guides/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const allGuides = await getAllGuides();
  return allGuides.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const [dest, guideRivers, guideArticles] = await Promise.all([
    guide.destinationId ? getDestinationById(guide.destinationId) : Promise.resolve(undefined),
    (guide.riverIds || []).length > 0 ? getRiversByIds(guide.riverIds) : Promise.resolve([]),
    guide.destinationId ? getArticlesByDestination(guide.destinationId) : Promise.resolve([]),
  ]);

  const still = hostedStillUrl(guide.photoUrl);
  const specialties = (guide.specialties || []).filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: guide.name,
          description: guide.bio,
          url: `${SITE_URL}/guides/${slug}`,
          ...(guide.websiteUrl ? { sameAs: guide.websiteUrl } : {}),
          ...(still ? { image: still } : {}),
          ...(guide.phone ? { telephone: guide.phone } : {}),
          ...(guide.email ? { email: guide.email } : {}),
          ...(guide.dailyRate ? { priceRange: guide.dailyRate } : {}),
          ...(dest
            ? {
                areaServed: {
                  "@type": "Place",
                  name: dest.name,
                  url: `${SITE_URL}/destinations/${dest.slug}`,
                },
              }
            : {}),
        }}
      />

      <article className="desk-sheet">
        <div className="flex items-start justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
              { label: guide.name },
            ]}
          />
          <FavoriteButton entityType="guide" entityId={guide.id} />
        </div>

        <header className="desk-sheet-grid mt-6">
          <div className="desk-sheet-photo">
            <SafeEntityImage
              src={still}
              alt={guide.name}
              title={guide.name}
              meta={[dest?.name, specialties].filter(Boolean).join(" · ") || undefined}
              fallback="quiet"
              priority
              sizes="(max-width: 1023px) 100vw, 42vw"
            />
          </div>
          <div className="desk-sheet-name">
            <p className="desk-eyebrow">Find</p>
            <h1
              className="font-heading mt-1 text-4xl leading-[1.05] text-[var(--ink)] sm:text-5xl"
              style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
            >
              {guide.name}
            </h1>
            <dl className="desk-spec mt-6">
              {dest ? (
                <>
                  <dt>Water</dt>
                  <dd>{dest.name}</dd>
                </>
              ) : null}
              {specialties ? (
                <>
                  <dt>Knows</dt>
                  <dd>{specialties}</dd>
                </>
              ) : null}
              {guide.yearsExperience ? (
                <>
                  <dt>Years</dt>
                  <dd className="num">{guide.yearsExperience}+</dd>
                </>
              ) : null}
              {guide.dailyRate ? (
                <>
                  <dt>Day</dt>
                  <dd>{guide.dailyRate}</dd>
                </>
              ) : null}
            </dl>
            <p className="desk-dek-ui mt-6">We do not book the day.</p>
            {guide.websiteUrl ? (
              <p className="mt-4">
                <a
                  href={guide.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-copper font-ui text-[14px] font-medium text-[var(--copper)]"
                >
                  Their site →
                </a>
              </p>
            ) : null}
          </div>
        </header>

        <div className="desk-sheet-stack">
          {guide.bio ? (
            <section className="prose mt-12">
              <h2>About</h2>
              {guide.bio.split("\n\n").map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </section>
          ) : null}

          {guideRivers.length > 0 ? (
            <section className="mt-12" aria-labelledby="guide-rivers-heading">
              <h2 id="guide-rivers-heading" className="font-heading text-2xl text-[var(--ink)]">
                Rivers
              </h2>
              <ul className="desk-rule-list mt-4">
                {guideRivers.map((river) => (
                  <li key={river.id}>
                    <Link
                      href={`/rivers/${river.slug}`}
                      className="hover-copper text-[15px] text-[var(--ink)] underline-offset-4 hover:text-[var(--action)] hover:underline"
                    >
                      {river.name}
                    </Link>
                    <span className="shrink-0 text-[13px] text-[var(--graphite)]">
                      {(river.primarySpecies || []).slice(0, 2).join(" · ") || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {guideArticles.length > 0 ? (
            <section className="mt-12" aria-labelledby="guide-notes-heading">
              <h2 id="guide-notes-heading" className="font-heading text-2xl text-[var(--ink)]">
                Field notes
              </h2>
              <ul className="desk-rule-list mt-4">
                {guideArticles.slice(0, 3).map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="hover-copper text-[15px] text-[var(--ink)] underline-offset-4 hover:text-[var(--action)] hover:underline"
                    >
                      {article.title}
                    </Link>
                    <span className="num shrink-0 text-[13px] text-[var(--graphite)]">
                      {article.readingTimeMinutes} min
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-12">
            <GoogleReviews
              googleRating={guide.googleRating ?? null}
              googleReviewCount={guide.googleReviewCount ?? null}
              googleReviewsUrl={guide.googleReviewsUrl ?? null}
              featuredReviews={
                guide.featuredReviews?.map((r) => ({
                  reviewer_name: r.authorName,
                  rating: r.rating,
                  text: r.text,
                })) ?? null
              }
            />
          </div>
          <div className="mt-8">
            <UserReviews entityType="guide" entityId={guide.id} />
          </div>
        </div>
      </article>
    </div>
  );
}
