/**
 * /flies/[slug] — canonical fly detail page (post-2026-05-15 reset).
 *
 * Renders editorial (hero, recipe, history, tying tips) plus the user's
 * "Your stock" section listing their saved versions of the fly.
 *
 * Reads from the new `flies` and `user_fly_configurations` tables via
 * src/lib/db/fly-model.ts. Falls back to the slug-redirects table for
 * renamed slugs.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  listApprovedFlies,
  getFlyBySlug,
  lookupFlySlugRedirect,
} from "@/lib/db/fly-model";
import { SITE_URL } from "@/lib/constants";
import { Pencil, Copy } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FlyFavoriteButton from "@/components/flies/FlyFavoriteButton";
import DeleteFlyButton from "@/components/flies/DeleteFlyButton";
import YourStockSection from "@/components/flies-v3/YourStockSection";
import OptionEnvelopeChips from "@/components/flies-v3/OptionEnvelopeChips";
import type { MaterialSlot } from "@/types/flies";

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
  // Layout template appends " | Executive Angler"; don't double-add it here.
  if (!fly) return { title: "Fly Pattern" };
  const title = `${fly.name} — ${fly.category ?? "Fly Pattern"}`;
  const description = fly.description?.slice(0, 160) ?? `${fly.name}: tying recipe, options, fishing tips.`;
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

export default async function FlyDetail({ params }: Props) {
  const { slug } = await params;
  let fly = await getFlyBySlug(slug);
  // Slug-rename redirect — apply once and redirect for SEO + bookmark fidelity.
  if (!fly) {
    const r = await lookupFlySlugRedirect(slug);
    if (r?.toSlug && r.toSlug !== slug) {
      redirect(`/flies/${r.toSlug}`);
    }
    notFound();
  }
  // If the canonical slug differs (e.g. someone followed an old slug that
  // happens to also exist), normalize the URL.
  if (fly.slug !== slug) {
    redirect(`/flies/${fly.slug}`);
  }

  // Skip cookies() so public fly pages stay CDN-cacheable.
  const viewerId: string | null = null;
  const isLoggedIn = false;
  const viewerIsAdmin = false;
  const boxes: { id: string; name: string; tier: string }[] = [];

  const pendingBanner = fly.status === "pending"
    ? "This fly is pending review — only you can see it."
    : fly.status === "private"
      ? "Private fly — only you can see it."
      : null;

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] pt-14">
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

      {/* ── HERO BAND — image left + title/meta right on desktop, stacks on mobile ── */}
      <div className="border-b border-[var(--border-rule)] bg-[var(--surface-raised)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3">
          <Breadcrumbs
            items={[
              { label: "Flies", href: "/flies" },
              { label: fly.category ?? "Pattern", href: `/flies/category/${fly.category ?? ""}` },
              { label: fly.name },
            ]}
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {pendingBanner && (
            <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
              {pendingBanner}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr] gap-6 lg:gap-8 items-start">
            {/* Hero image — bigger, square, prominent */}
            <div className="relative aspect-square w-full max-w-[280px] sm:max-w-none mx-auto md:mx-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--border-rule)] to-[var(--surface-page)] shadow-lg shadow-black/20">
              {fly.hero_image_url ? (
                <Image
                  src={fly.hero_image_url}
                  alt={fly.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, 360px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading text-5xl text-[var(--action)]/30">
                    {fly.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                </div>
              )}
            </div>

            {/* Title + meta column */}
            <div className="min-w-0 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.2em] text-[var(--signal-live)] mb-1.5">
                    {fly.category ?? "Fly Pattern"}
                  </p>
                  <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] tracking-tight leading-[1.05]">
                    {fly.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FlyFavoriteButton canonicalFlyId={fly.id} />
                  <Link
                    href={(() => {
                      // Clone always opens the workspace's inline drawer
                      // (Phase 6 cutover — no more full-page form nav).
                      const target = `/flies/workspace?clone=${fly.id}`;
                      return isLoggedIn
                        ? target
                        : `/login?redirect=${encodeURIComponent(target)}`;
                    })()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-rule)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-body)] hover:border-[var(--text-meta)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Clone this fly into a new pattern"
                    title="Start a new fly pre-filled from this one"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Clone
                  </Link>
                  {(() => {
                    // Unified edit URL — server-side gate at /flies/[slug]/edit
                    // decides whether to render the owner form (mode=edit) or
                    // the admin canonical form (mode=canonical-edit), or to
                    // redirect away if the viewer can't edit.
                    const isOwner =
                      viewerId !== null && fly.submitted_by_user_id === viewerId;
                    const isPrivateOwn =
                      isOwner &&
                      (fly.status === "private" || fly.status === "pending");
                    const canEdit =
                      isPrivateOwn || (viewerIsAdmin && fly.status === "approved");
                    if (!canEdit) return null;
                    return (
                      <Link
                        href={`/flies/${fly.slug}/edit?from=${encodeURIComponent(`/flies/${fly.slug}`)}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--action)]/40 bg-[var(--action)]/10 px-2.5 py-1.5 text-xs font-medium text-[var(--action)] hover:bg-[var(--action)]/20 transition-colors"
                        aria-label="Edit this fly"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    );
                  })()}
                  {/* Delete: owner of a private/pending fly, OR admin on any. */}
                  {isLoggedIn &&
                    ((fly.submitted_by_user_id === viewerId &&
                      (fly.status === "private" || fly.status === "pending")) ||
                      viewerIsAdmin) && (
                      <DeleteFlyButton flyId={fly.id} flyName={fly.name} />
                    )}
                </div>
              </div>

              {fly.description && (
                <p className="text-[15px] text-[var(--text-body)] leading-relaxed max-w-2xl">{fly.description}</p>
              )}

              <div className="mt-1">
                <OptionEnvelopeChips envelope={fly.option_envelope ?? {}} />
              </div>

              {fly.origin_credit && (
                <p className="text-[12px] text-[var(--text-meta)] mt-1">
                  Originated by <span className="text-[var(--text-body)]">{fly.origin_credit}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY — Recipe (primary, left) + Your Stock (sidebar, right) on desktop ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-10">
          {/* Left column — Recipe + editorial */}
          <div className="min-w-0">
            <Recipe
              materials={fly.materials_list ?? []}
              editHref={viewerIsAdmin ? `/flies/${fly.slug}/edit?from=${encodeURIComponent(`/flies/${fly.slug}`)}` : null}
            />

            {(fly.history || fly.tying_overview || fly.fishing_tips) && (
              <section className="mt-10 pt-8 border-t border-[var(--border-rule)] space-y-8">
                {fly.history && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--text-primary)] mb-3">History</h3>
                    <p className="text-[var(--text-body)] text-[15px] leading-relaxed whitespace-pre-line">{fly.history}</p>
                  </div>
                )}
                {fly.tying_overview && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--text-primary)] mb-3">Tying overview</h3>
                    <p className="text-[var(--text-body)] text-[15px] leading-relaxed whitespace-pre-line">{fly.tying_overview}</p>
                  </div>
                )}
                {fly.fishing_tips && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--text-primary)] mb-3">Fishing tips</h3>
                    <p className="text-[var(--text-body)] text-[15px] leading-relaxed whitespace-pre-line">{fly.fishing_tips}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-[var(--border-rule)]">
                  <Link href="/flies" className="text-[var(--signal-live)] hover:text-[var(--action)] text-sm transition-colors">
                    ← Browse all flies
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* Right column — Your Stock (sticky on desktop) */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <YourStockSection
              fly={fly}
              isLoggedIn={isLoggedIn}
              versions={[]}
              boxes={boxes}
              loginRedirectPath={`/flies/${fly.slug}`}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Recipe({
  materials,
  editHref,
}: {
  materials: MaterialSlot[];
  editHref: string | null;
}) {
  const hasMaterials = materials && materials.length > 0;
  return (
    <section className="my-8">
      <h2 className="font-heading text-xl text-[var(--text-primary)] mb-3">Recipe</h2>
      {hasMaterials ? (
        <ul className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] divide-y divide-[#21262D]">
          {materials.map((m, i) => {
            const slotLabel = formatSlotLabel(String(m.slot ?? "Material"));
            const detail = [m.material, m.brand].filter(Boolean).join(" · ");
            return (
              <li key={i} className="px-4 py-2.5 text-sm flex items-baseline gap-3">
                <span className="w-20 text-[var(--text-meta)] text-xs uppercase tracking-wide flex-shrink-0">{slotLabel}</span>
                <span className="text-[var(--text-primary)]">{detail || "—"}</span>
                {m.description && (
                  <span className="text-[var(--text-meta)] text-xs">{m.description}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-6 text-sm text-[var(--text-meta)]">
          {editHref ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span>Recipe not filled in yet.</span>
              <Link
                href={editHref}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--action)]/40 bg-[var(--action)]/10 px-2.5 py-1 text-xs font-medium text-[var(--action)] hover:bg-[var(--action)]/20 transition-colors"
              >
                + Add recipe
              </Link>
            </div>
          ) : (
            <span>Recipe coming soon.</span>
          )}
        </div>
      )}
    </section>
  );
}

function formatSlotLabel(slot: string): string {
  // hot_spot → Hot Spot, wingcase → Wingcase, ribbing → Rib, etc.
  return slot
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ") || "Material";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
