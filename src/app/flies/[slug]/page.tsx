/**
 * /flies/[slug] — specimen-first fly pattern template (Water Desk §2.3).
 *
 * Order: macro on Paper → name + spec → RecipeStrip → InstrumentWell variant table.
 *
 * Public HTML stays cookie-free so the page remains CDN-cacheable.
 * Stock counts hydrate in the variant table after auth.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  listApprovedFlies,
  getFlyBySlug,
  lookupFlySlugRedirect,
} from "@/lib/db/fly-model";
import { SITE_URL } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import FlyVariantTable from "@/components/fly-detail/FlyVariantTable";
import RecipeStrip from "@/components/desk/RecipeStrip";
import { toYouTubeEmbedUrl } from "@/lib/video-embed";
import { getFishingNowRivers } from "@/lib/flies/fishing-now";
import { linkRecipeMaterials } from "@/lib/flies/link-materials";
import { publicVariantRows } from "@/lib/flies/variant-rows";
import { formatHookSize } from "@/lib/flies/variant-format";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const flies = await listApprovedFlies();
  return flies.filter((f) => f.slug).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fly = await getFlyBySlug(slug);
  if (!fly) return { title: "Fly Pattern" };
  const title = `${fly.name} — ${fly.category ?? "Fly Pattern"}`;
  const description =
    fly.description?.slice(0, 160) ?? `${fly.name}: tying recipe, options, fishing notes.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/flies/${fly.slug}`,
      images: fly.hero_image_url ? [{ url: fly.hero_image_url, alt: fly.name }] : undefined,
    },
    alternates: { canonical: `${SITE_URL}/flies/${fly.slug}` },
  };
}

function sizeSpec(sizes: number[] | undefined): string | null {
  if (!sizes?.length) return null;
  if (sizes.length === 1) return formatHookSize(sizes[0]);
  return `${formatHookSize(sizes[0])}–${formatHookSize(sizes[sizes.length - 1])}`;
}

export default async function FlyDetail({ params }: Props) {
  const { slug } = await params;
  let fly = await getFlyBySlug(slug);
  if (!fly) {
    const r = await lookupFlySlugRedirect(slug);
    if (r?.toSlug && r.toSlug !== slug) {
      redirect(`/flies/${r.toSlug}`);
    }
    notFound();
  }
  if (fly.slug !== slug) {
    redirect(`/flies/${fly.slug}`);
  }

  const [linkedMaterials, fishingNow] = await Promise.all([
    linkRecipeMaterials(fly.materials_list ?? []),
    getFishingNowRivers(fly.name),
  ]);
  const videoEmbed = toYouTubeEmbedUrl(fly.video_url);
  const variantRows = publicVariantRows(fly.option_envelope);
  const sizes = sizeSpec(fly.option_envelope?.sizes);
  const imitation = (fly.imitates ?? []).filter(Boolean).join(" · ");
  const pendingBanner =
    fly.status === "pending"
      ? "This fly is pending review — only you can see it."
      : fly.status === "private"
        ? "Private fly — only you can see it."
        : null;

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--text-1)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: fly.name,
          description: fly.description ?? undefined,
          image: fly.hero_image_url ?? undefined,
          url: `${SITE_URL}/flies/${fly.slug}`,
          author: fly.origin_credit
            ? { "@type": "Person", name: fly.origin_credit }
            : { "@type": "Organization", name: "Executive Angler" },
        }}
      />

      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 pt-3">
        <Breadcrumbs
          items={[
            { label: "Flies", href: "/flies" },
            { label: fly.category ?? "Pattern", href: `/flies/category/${fly.category ?? ""}` },
            { label: fly.name },
          ]}
        />
      </div>

      {pendingBanner && (
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 pt-4">
          <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] px-3 py-2 text-[13px] text-[var(--text-2)]">
            {pendingBanner}
          </p>
        </div>
      )}

      {/* Specimen — macro at ~50vw on Paper, name in Fraunces, spec block */}
      <header className="mx-auto max-w-[var(--container)] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto w-full md:w-[50vw] md:max-w-xl">
          <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--paper)]">
            <SafeEntityImage
              src={fly.hero_image_url}
              alt={fly.name}
              title={fly.name}
              meta={[fly.category, sizes].filter(Boolean).join(" · ") || undefined}
              contain
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mx-auto mt-8 w-full md:w-[50vw] md:max-w-xl">
          <p className="ea-overline">
            {fly.category ?? "Fly pattern"}
          </p>
          <h1 className="mt-1 text-4xl text-[var(--text-1)] sm:text-5xl">
            {fly.name}
          </h1>

          <dl className="mt-6 border-t border-[var(--border)] pt-4">
            {sizes && (
              <div className="flex items-baseline gap-4 py-2">
                <dt className="ea-overline w-24 shrink-0">
                  Sizes
                </dt>
                <dd className="num text-[var(--text-1)]">{sizes}</dd>
              </div>
            )}
            {imitation && (
              <div className="flex items-baseline gap-4 py-2">
                <dt className="ea-overline w-24 shrink-0">
                  Imitates
                </dt>
                <dd className="text-[var(--text-1)]">{imitation}</dd>
              </div>
            )}
            {fly.origin_credit && (
              <div className="flex items-baseline gap-4 py-2">
                <dt className="ea-overline w-24 shrink-0">
                  Origin
                </dt>
                <dd className="text-[var(--text-2)]">{fly.origin_credit}</dd>
              </div>
            )}
          </dl>

          {fly.description && (
            <div className="prose mt-6">
              <p>{fly.description}</p>
            </div>
          )}
        </div>
      </header>

      <div className="pb-12">
        <RecipeStrip materials={linkedMaterials} notes={fly.recipe_notes} />
      </div>

      <FlyVariantTable
        flyId={fly.id}
        flySlug={fly.slug}
        flyName={fly.name}
        publicRows={variantRows}
      />

      <div className="mx-auto max-w-[var(--container)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {fly.tying_overview && (
          <section className="prose mt-12">
            <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
              At the vise
            </h2>
            <p className="whitespace-pre-line">{fly.tying_overview}</p>
          </section>
        )}

        {videoEmbed && (
          <section className="mt-12" aria-labelledby="tying-video-heading">
            <h2 id="tying-video-heading" className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
              Tying video
            </h2>
            <div className="relative mt-4 aspect-video w-full max-w-3xl overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--paper-deep)]">
              <iframe
                src={videoEmbed}
                title={`${fly.name} tying video`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        <section className="mt-12" aria-labelledby="fishing-now-heading">
          <h2 id="fishing-now-heading" className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
            Fishing now on
          </h2>
          <p className="mt-1 max-w-[var(--prose)] text-[13px] text-[var(--text-2)]">
            Rivers whose hatch chart names this pattern this month. Names and sizes only.
          </p>
          {fishingNow.length > 0 ? (
            <ul className="mt-4 max-w-[var(--prose)] divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {fishingNow.map((river) => (
                <li key={river.slug} className="flex items-baseline justify-between gap-4 py-3">
                  <Link
                    href={`/rivers/${river.slug}`}
                    className="text-[var(--text-1)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                  >
                    {river.name}
                  </Link>
                  <span className="num shrink-0 text-[13px] text-[var(--text-2)]">
                    {river.sizes.length ? river.sizes.join(" · ") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 max-w-[var(--prose)] text-[var(--text-2)]">
              Not named on this month&apos;s hatch charts.
            </p>
          )}
        </section>

        {fly.fishing_tips && (
          <div className="prose mt-12">
            <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">On the water</h2>
            <p className="whitespace-pre-line">{fly.fishing_tips}</p>
          </div>
        )}

        {fly.history && (
          <section className="mt-16 border-t border-[var(--border)] pt-10">
            <div className="prose">
              <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">History</h2>
              <p className="whitespace-pre-line">{fly.history}</p>
            </div>
          </section>
        )}

        <p className="mt-12">
          <Link
            href="/flies"
            className="text-[14px] text-[var(--accent)] underline-offset-4 hover:underline"
          >
            All patterns
          </Link>
        </p>
      </div>
    </div>
  );
}
