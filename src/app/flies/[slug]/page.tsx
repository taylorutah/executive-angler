/**
 * /flies/[slug] — one 12-col Water Desk sheet.
 *
 * 1440: 5-col photo | 7-col name. Recipe, Variants, Fishing now share
 * that left rail. One gutter, one measure.
 * 390: photo full width of the content column, then name, spec, recipe.
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
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
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

      <article className="desk-sheet">
        <Breadcrumbs
          items={[
            { label: "Flies", href: "/flies" },
            { label: fly.category ?? "Pattern", href: `/flies/category/${fly.category ?? ""}` },
            { label: fly.name },
          ]}
        />

        {pendingBanner && (
          <p className="mt-4 border border-[var(--border-rule)] bg-[var(--surface-raised)] px-3 py-2 text-[13px] text-[var(--text-body)]">
            {pendingBanner}
          </p>
        )}

        <header className="desk-sheet-grid mt-6">
          <div className="desk-sheet-photo">
            <SafeEntityImage
              src={fly.hero_image_url}
              alt={fly.name}
              title={fly.name}
              meta={[fly.category, sizes].filter(Boolean).join(" · ") || undefined}
              contain
              priority
              sizes="(max-width: 1023px) 100vw, 42vw"
            />
          </div>

          <div className="desk-sheet-name">
            <p className="desk-eyebrow">{fly.category ?? "Fly pattern"}</p>
            <h1
              className="font-heading mt-1 text-4xl leading-[1.05] text-[var(--text-primary)] sm:text-5xl"
              style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
            >
              {fly.name}
            </h1>

            {(sizes || imitation || fly.origin_credit) && (
              <dl className="desk-spec mt-6">
                {sizes && (
                  <>
                    <dt>Sizes</dt>
                    <dd className="num">{sizes}</dd>
                  </>
                )}
                {imitation && (
                  <>
                    <dt>Imitates</dt>
                    <dd>{imitation}</dd>
                  </>
                )}
                {fly.origin_credit && (
                  <>
                    <dt>Origin</dt>
                    <dd>{fly.origin_credit}</dd>
                  </>
                )}
              </dl>
            )}

            {fly.description && (
              <p className="desk-dek mt-6">{fly.description}</p>
            )}
          </div>
        </header>

        <div className="mt-12">
          <RecipeStrip materials={linkedMaterials} notes={fly.recipe_notes} />
        </div>

        <div className="mt-12">
          <FlyVariantTable
            flyId={fly.id}
            flySlug={fly.slug}
            flyName={fly.name}
            publicRows={variantRows}
          />
        </div>

        {fly.tying_overview && (
          <section className="prose mt-12">
            <h2>At the vise</h2>
            <p className="whitespace-pre-line">{fly.tying_overview}</p>
          </section>
        )}

        {videoEmbed && (
          <section className="mt-12" aria-labelledby="tying-video-heading">
            <h2 id="tying-video-heading" className="font-heading text-2xl text-[var(--text-primary)]">
              Tying video
            </h2>
            <div className="relative mt-4 aspect-video w-full overflow-hidden border border-[var(--border-rule)] bg-[var(--surface-raised)]">
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
          <h2 id="fishing-now-heading" className="font-heading text-2xl text-[var(--text-primary)]">
            Fishing now on
          </h2>
          <p className="desk-dek-ui mt-1">
            Rivers whose hatch chart names this pattern this month. Names and sizes only.
          </p>
          {fishingNow.length > 0 ? (
            <ul className="desk-rule-list mt-4">
              {fishingNow.map((river) => (
                <li key={river.slug}>
                  <Link
                    href={`/rivers/${river.slug}`}
                    className="hover-copper text-[15px] text-[var(--text-primary)] underline-offset-4 hover:text-[var(--action)] hover:underline"
                  >
                    {river.name}
                  </Link>
                  <span className="num shrink-0 text-[13px] text-[var(--text-body)]">
                    {river.sizes.length ? river.sizes.join(" · ") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 font-ui text-[15px] text-[var(--text-body)]">
              Not named on this month&apos;s hatch charts.
            </p>
          )}
        </section>

        {fly.fishing_tips && (
          <div className="prose mt-10">
            <h2 className="font-heading text-2xl text-[var(--text-primary)]">On the water</h2>
            <p className="whitespace-pre-line">{fly.fishing_tips}</p>
          </div>
        )}

        {fly.history && (
          <section className="mt-16 border-t border-[var(--border-rule)] pt-10">
            <div className="prose">
              <h2 className="font-heading text-2xl text-[var(--text-primary)]">History</h2>
              <p className="whitespace-pre-line">{fly.history}</p>
            </div>
          </section>
        )}

        <p className="mt-12">
          <Link
            href="/flies"
            className="hover-copper text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
          >
            All patterns
          </Link>
        </p>
      </article>
    </div>
  );
}
