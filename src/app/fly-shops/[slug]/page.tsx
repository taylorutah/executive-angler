import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FavoriteButton from "@/components/ui/FavoriteButton";
import JsonLd from "@/components/seo/JsonLd";
import MapView from "@/components/maps/DynamicMapView";
import GoogleReviews from "@/components/GoogleReviews";
import UserReviews from "@/components/ui/UserReviews";
import CommunityPhotos from "@/components/ui/CommunityPhotos";
import PhotoSubmissionForm from "@/components/ui/PhotoSubmissionForm";
import AdminHeroEditor from "@/components/admin/AdminHeroEditor";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { SITE_URL } from "@/lib/constants";
import { hostedStillUrl } from "@/lib/media/image-url";
import {
  getAllFlyShops,
  getFlyShopBySlug,
  getDestinationById,
  getRiversByDestination,
  getArticlesByDestination,
} from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getFlyShopBySlug(slug);
  if (!shop) return { title: "Fly Shop Not Found" };

  const servicesList = (shop.services || []).slice(0, 4).join(", ");
  const brandCount = (shop.brandsCarried || []).length;
  const hasHours = shop.hours && Object.keys(shop.hours).length > 0;
  const fallbackTitle = `${shop.name} — Fly Shop & Outfitter | ${shop.address.split(",").slice(-2, -1)[0]?.trim() || "Local Pro Shop"} | Executive Angler`;
  const fallbackDesc = `${shop.name} — ${shop.address}. ${servicesList ? servicesList + ". " : ""}${brandCount > 0 ? `${brandCount} brands carried. ` : ""}${hasHours ? "Hours & directions. " : ""}Visit your local fly fishing pro shop.`;

  return {
    title: { absolute: shop.metaTitle || fallbackTitle },
    description: shop.metaDescription || fallbackDesc,
    openGraph: {
      title: shop.metaTitle || shop.name,
      description: shop.metaDescription || fallbackDesc,
      images: [
        hostedStillUrl(shop.heroImageUrl) ||
          `${SITE_URL}/api/og?title=${encodeURIComponent(shop.name)}&subtitle=Fly%20Shop&type=shop`,
      ],
    },
    alternates: {
      canonical: `${SITE_URL}/fly-shops/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const shops = await getAllFlyShops();
  return shops.map((s) => ({ slug: s.slug }));
}

export default async function FlyShopPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getFlyShopBySlug(slug);
  if (!shop) notFound();

  const [dest, nearbyRivers, shopArticles] = await Promise.all([
    shop.destinationId ? getDestinationById(shop.destinationId) : Promise.resolve(undefined),
    shop.destinationId ? getRiversByDestination(shop.destinationId) : Promise.resolve([]),
    shop.destinationId ? getArticlesByDestination(shop.destinationId) : Promise.resolve([]),
  ]);

  const still = hostedStillUrl(shop.heroImageUrl);
  const hours = shop.hours ? Object.entries(shop.hours) : [];

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportingGoodsStore",
          name: shop.name,
          description: shop.description,
          address: {
            "@type": "PostalAddress",
            streetAddress: shop.address,
            ...(dest ? { addressRegion: dest.region, addressCountry: dest.country } : {}),
          },
          url: `${SITE_URL}/fly-shops/${slug}`,
          ...(shop.websiteUrl ? { sameAs: shop.websiteUrl } : {}),
          ...(shop.phone ? { telephone: shop.phone } : {}),
          geo: {
            "@type": "GeoCoordinates",
            latitude: shop.latitude,
            longitude: shop.longitude,
          },
          ...(still ? { image: still } : {}),
        }}
      />

      <article className="desk-sheet">
        <div className="flex items-start justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: "Shops", href: "/fly-shops" },
              ...(dest ? [{ label: dest.name, href: `/destinations/${dest.slug}` }] : []),
              { label: shop.name },
            ]}
          />
          <FavoriteButton entityType="fly_shop" entityId={shop.id} />
        </div>

        <header className="desk-sheet-grid mt-6">
          <div className="desk-sheet-photo">
            <SafeEntityImage
              src={still}
              alt={shop.heroImageAlt || shop.name}
              title={shop.name}
              meta={shop.address}
              fallback="quiet"
              priority
              sizes="(max-width: 1023px) 100vw, 42vw"
            />
            <AdminHeroEditor
              entityType="fly_shops"
              entityId={shop.id}
              currentImageUrl={shop.heroImageUrl || ""}
              currentAlt={shop.heroImageAlt}
              currentCredit={shop.heroImageCredit}
              currentCreditUrl={shop.heroImageCreditUrl}
            />
          </div>
          <div className="desk-sheet-name">
            <p className="desk-eyebrow">Find</p>
            <h1
              className="font-heading mt-1 text-4xl leading-[1.05] text-[var(--ink)] sm:text-5xl"
              style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
            >
              {shop.name}
            </h1>
            <dl className="desk-spec mt-6">
              {dest ? (
                <>
                  <dt>Water</dt>
                  <dd>{dest.name}</dd>
                </>
              ) : null}
              <dt>Address</dt>
              <dd>{shop.address}</dd>
              {shop.phone ? (
                <>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${shop.phone}`} className="hover-copper hover:text-[var(--action)]">
                      {shop.phone}
                    </a>
                  </dd>
                </>
              ) : null}
            </dl>
            <p className="desk-dek-ui mt-6">We do not sell the fly.</p>
            {shop.websiteUrl ? (
              <p className="mt-4">
                <a
                  href={shop.websiteUrl}
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
          {shop.description ? (
            <section className="prose mt-12">
              <h2>About</h2>
              {shop.description.split("\n\n").map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </section>
          ) : null}

          {hours.length > 0 ? (
            <section className="mt-12" aria-labelledby="shop-hours-heading">
              <h2 id="shop-hours-heading" className="font-heading text-2xl text-[var(--ink)]">
                Hours
              </h2>
              <dl className="desk-spec mt-4">
                {hours.flatMap(([day, value]) => [
                  <dt key={`${day}-label`}>{day}</dt>,
                  <dd key={`${day}-value`}>{value}</dd>,
                ])}
              </dl>
            </section>
          ) : null}

          {nearbyRivers.length > 0 ? (
            <section className="mt-12" aria-labelledby="shop-rivers-heading">
              <h2 id="shop-rivers-heading" className="font-heading text-2xl text-[var(--ink)]">
                Water nearby
              </h2>
              <ul className="desk-rule-list mt-4">
                {nearbyRivers.slice(0, 8).map((river) => (
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

          {shopArticles.length > 0 ? (
            <section className="mt-12" aria-labelledby="shop-notes-heading">
              <h2 id="shop-notes-heading" className="font-heading text-2xl text-[var(--ink)]">
                Field notes
              </h2>
              <ul className="desk-rule-list mt-4">
                {shopArticles.slice(0, 3).map((article) => (
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

          <section className="mt-12" aria-labelledby="shop-map-heading">
            <h2 id="shop-map-heading" className="font-heading text-2xl text-[var(--ink)]">
              Map
            </h2>
            <p className="desk-dek-ui mt-1">The counter. No pin on the water.</p>
            <div className="mt-4 overflow-hidden border border-[var(--border-rule)] bg-[var(--vellum)]">
              <MapView
                latitude={shop.latitude}
                longitude={shop.longitude}
                zoom={14}
                markers={[
                  {
                    latitude: shop.latitude,
                    longitude: shop.longitude,
                    title: shop.name,
                    description: shop.address,
                  },
                ]}
                className="h-[300px] w-full"
              />
            </div>
          </section>

          <div className="mt-12">
            <GoogleReviews
              googleRating={shop.googleRating ?? null}
              googleReviewCount={shop.googleReviewCount ?? null}
              googleReviewsUrl={shop.googleReviewsUrl ?? null}
              featuredReviews={
                shop.featuredReviews?.map((r) => ({
                  reviewer_name: r.authorName,
                  rating: r.rating,
                  text: r.text,
                })) ?? null
              }
            />
          </div>
          <div className="mt-8">
            <UserReviews entityType="fly-shop" entityId={shop.id} />
          </div>
          <div className="mt-8">
            <CommunityPhotos entityType="fly-shop" entityId={shop.id} />
            <PhotoSubmissionForm entityType="fly-shop" entityId={shop.id} entityName={shop.name} />
          </div>
        </div>
      </article>
    </div>
  );
}
