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
  listMyConfigurationsForFly,
  listMyBoxes,
  lookupFlySlugRedirect,
} from "@/lib/db/fly-model";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { SITE_URL } from "@/lib/constants";
import { Pencil, Copy } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FlyFavoriteButton from "@/components/flies/FlyFavoriteButton";
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const viewerIsAdmin = isAdmin(user?.email);

  const [versions, boxes] = await Promise.all([
    isLoggedIn ? listMyConfigurationsForFly(fly.id) : Promise.resolve([]),
    isLoggedIn ? listMyBoxes() : Promise.resolve([]),
  ]);

  const pendingBanner = fly.status === "pending"
    ? "This fly is pending review — only you can see it."
    : fly.status === "private"
      ? "Private fly — only you can see it."
      : null;

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] pt-14">
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
      <div className="border-b border-[#21262D] bg-[#161B22]">
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
            <div className="relative aspect-square w-full max-w-[280px] sm:max-w-none mx-auto md:mx-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#21262D] to-[#0D1117] shadow-lg shadow-black/20">
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
                  <span className="font-heading text-5xl text-[#E8923A]/30">
                    {fly.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                </div>
              )}
            </div>

            {/* Title + meta column */}
            <div className="min-w-0 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#0BA5C7] mb-1.5">
                    {fly.category ?? "Fly Pattern"}
                  </p>
                  <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#F0F6FC] tracking-tight leading-[1.05]">
                    {fly.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FlyFavoriteButton canonicalFlyId={fly.id} />
                  <Link
                    href={
                      isLoggedIn
                        ? `/journal/flies/new?cloneFrom=${fly.id}`
                        : `/login?redirect=${encodeURIComponent(`/journal/flies/new?cloneFrom=${fly.id}`)}`
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-2.5 py-1.5 text-xs font-medium text-[#0BA5C7] hover:bg-[#00B4D8]/20 transition-colors"
                    aria-label="Clone this fly into a new pattern"
                    title="Start a new fly pre-filled from this one"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Clone
                  </Link>
                  {viewerIsAdmin && (
                    <Link
                      href={`/admin/flies/${fly.slug}/edit?from=${encodeURIComponent(`/flies/${fly.slug}`)}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-2.5 py-1.5 text-xs font-medium text-[#E8923A] hover:bg-[#E8923A]/20 transition-colors"
                      aria-label="Edit canonical fly"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  )}
                </div>
              </div>

              {fly.description && (
                <p className="text-[15px] text-[#A8B2BD] leading-relaxed max-w-2xl">{fly.description}</p>
              )}

              <div className="mt-1">
                <OptionEnvelopeChips envelope={fly.option_envelope ?? {}} />
              </div>

              {fly.origin_credit && (
                <p className="text-[12px] text-[#6E7681] mt-1">
                  Originated by <span className="text-[#A8B2BD]">{fly.origin_credit}</span>
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
              editHref={viewerIsAdmin ? `/admin/flies/${fly.slug}/edit?from=${encodeURIComponent(`/flies/${fly.slug}`)}` : null}
            />

            {(fly.history || fly.tying_overview || fly.fishing_tips) && (
              <section className="mt-10 pt-8 border-t border-[#21262D] space-y-8">
                {fly.history && (
                  <div>
                    <h3 className="font-heading text-xl text-[#F0F6FC] mb-3">History</h3>
                    <p className="text-[#A8B2BD] text-[15px] leading-relaxed whitespace-pre-line">{fly.history}</p>
                  </div>
                )}
                {fly.tying_overview && (
                  <div>
                    <h3 className="font-heading text-xl text-[#F0F6FC] mb-3">Tying overview</h3>
                    <p className="text-[#A8B2BD] text-[15px] leading-relaxed whitespace-pre-line">{fly.tying_overview}</p>
                  </div>
                )}
                {fly.fishing_tips && (
                  <div>
                    <h3 className="font-heading text-xl text-[#F0F6FC] mb-3">Fishing tips</h3>
                    <p className="text-[#A8B2BD] text-[15px] leading-relaxed whitespace-pre-line">{fly.fishing_tips}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-[#21262D]">
                  <Link href="/flies" className="text-[#0BA5C7] hover:text-[#E8923A] text-sm transition-colors">
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
              versions={versions}
              boxes={boxes.map((b) => ({ id: b.id, name: b.name, tier: b.tier }))}
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
      <h2 className="font-heading text-xl text-[#F0F6FC] mb-3">Recipe</h2>
      {hasMaterials ? (
        <ul className="rounded-lg border border-[#21262D] bg-[#161B22] divide-y divide-[#21262D]">
          {materials.map((m, i) => {
            const slotLabel = formatSlotLabel(String(m.slot ?? "Material"));
            const detail = [m.material, m.brand].filter(Boolean).join(" · ");
            return (
              <li key={i} className="px-4 py-2.5 text-sm flex items-baseline gap-3">
                <span className="w-20 text-[#6E7681] text-xs uppercase tracking-wide flex-shrink-0">{slotLabel}</span>
                <span className="text-[#F0F6FC]">{detail || "—"}</span>
                {m.description && (
                  <span className="text-[#6E7681] text-xs">{m.description}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-[#21262D] bg-[#161B22] px-4 py-6 text-sm text-[#6E7681]">
          {editHref ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span>Recipe not filled in yet.</span>
              <Link
                href={editHref}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-2.5 py-1 text-xs font-medium text-[#E8923A] hover:bg-[#E8923A]/20 transition-colors"
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
