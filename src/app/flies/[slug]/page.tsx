/**
 * /flies/[slug] — specimen-first fly pattern (Water Desk structure,
 * DESIGN.md paint). Magazine header: 1:1 macro on paper, Fraunces name,
 * specification block, .prose at --prose. Then RecipeStrip, one variants
 * table, designed empty states. Public HTML stays cookie-free.
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

function FlyNote({
  id,
  title,
  copy,
  empty,
}: {
  id: string;
  title: string;
  copy?: string | null;
  empty: string;
}) {
  return (
    <section className="prose mt-12" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {copy ? (
        <p className="whitespace-pre-line">{copy}</p>
      ) : (
        <p>{empty}</p>
      )}
    </section>
  );
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

      <div className="desk-sheet pt-3">
        <Breadcrumbs
          items={[
            { label: "Flies", href: "/flies" },
            { label: fly.category ?? "Pattern", href: `/flies/category/${fly.category ?? ""}` },
            { label: fly.name },
          ]}
        />
      </div>

      {pendingBanner && (
        <div className="desk-sheet pt-4">
          <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] px-3 py-2 text-[13px] text-[var(--text-2)]">
            {pendingBanner}
          </p>
        </div>
      )}

      <header className="desk-sheet pb-12 pt-6 sm:pt-8">
        <div className="desk-sheet-grid">
          <div className="desk-sheet-photo">
            <SafeEntityImage
              src={fly.hero_image_url}
              alt={fly.name}
              title={fly.name}
              meta={[fly.category, sizes].filter(Boolean).join(" · ") || undefined}
              contain
              fallback="quiet"
              priority
              sizes="(max-width: 768px) 100vw, 40rem"
            />
          </div>

          <div className="desk-sheet-name">
            <p className="ea-overline">{fly.category ?? "Fly pattern"}</p>
            <h1 className="mt-1 text-[var(--text-1)]">{fly.name}</h1>

            <dl className="desk-spec desk-rule-list mt-6 border-t border-[var(--border)] pt-4">
              {sizes && (
                <div className="py-2">
                  <dt className="ea-overline">Sizes</dt>
                  <dd className="num text-[var(--text-1)]">{sizes}</dd>
                </div>
              )}
              {imitation && (
                <div className="py-2">
                  <dt className="ea-overline">Imitates</dt>
                  <dd className="text-[var(--text-1)]">{imitation}</dd>
                </div>
              )}
              {fly.origin_credit && (
                <div className="py-2">
                  <dt className="ea-overline">Origin</dt>
                  <dd className="text-[var(--text-2)]">{fly.origin_credit}</dd>
                </div>
              )}
            </dl>

            {fly.description ? (
              <div className="prose mt-6">
                <p>{fly.description}</p>
              </div>
            ) : (
              <p className="mt-6 max-w-[var(--prose)] text-[var(--text-2)]">
                No description on file for this pattern.
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="desk-sheet desk-sheet-stack pb-16">
        <RecipeStrip materials={linkedMaterials} notes={fly.recipe_notes} />

        <div className="mt-12">
          <FlyVariantTable
            flyId={fly.id}
            flySlug={fly.slug}
            flyName={fly.name}
            publicRows={variantRows}
          />
        </div>

        <FlyNote
          id="at-the-vise"
          title="At the vise"
          copy={fly.tying_overview}
          empty="Tying notes are not on file for this pattern."
        />

        <section className="mt-12" aria-labelledby="tying-video-heading">
          <h2 id="tying-video-heading">Tying video</h2>
          {videoEmbed ? (
            <div className="relative mt-4 aspect-video w-full max-w-[var(--article-media)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--paper-deep)]">
              <iframe
                src={videoEmbed}
                title={`${fly.name} tying video`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="mt-3 max-w-[var(--prose)] text-[var(--text-2)]">
              No tying video on file.
            </p>
          )}
        </section>

        <section className="mt-12" aria-labelledby="fishing-now-heading">
          <h2 id="fishing-now-heading">Fishing now on</h2>
          <p className="mt-1 max-w-[var(--prose)] text-[13px] text-[var(--text-2)]">
            Rivers whose hatch chart names this pattern this month. Names and sizes only.
          </p>
          {fishingNow.length > 0 ? (
            <ul className="desk-rule-list mt-4 max-w-[var(--prose)] divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {fishingNow.map((river) => (
                <li key={river.slug} className="py-3">
                  <Link
                    href={`/rivers/${river.slug}`}
                    className="text-[var(--text-1)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                  >
                    {river.name}
                  </Link>
                  <span className="num text-[13px] text-[var(--text-2)]">
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

        <FlyNote
          id="on-the-water"
          title="On the water"
          copy={fly.fishing_tips}
          empty="Fishing notes are not on file for this pattern."
        />

        <section className="mt-16 border-t border-[var(--border)] pt-10">
          <div className="prose">
            <h2>History</h2>
            {fly.history ? (
              <p className="whitespace-pre-line">{fly.history}</p>
            ) : (
              <p>History is not on file for this pattern.</p>
            )}
          </div>
        </section>

        <p className="mt-12">
          <Link
            href="/flies/library"
            className="text-[14px] text-[var(--accent)] underline-offset-4 hover:underline"
          >
            All patterns
          </Link>
        </p>
      </div>
    </div>
  );
}
