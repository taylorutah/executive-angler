/**
 * Pattern detail — workbench layout. Variant table primary, editorial secondary.
 *
 * Replaces the legacy magazine layout (1068 LOC of canonical_flies-driven
 * editorial). The v2 model unifies canonical and personal patterns under
 * fly_patterns_v2 / fly_variants / fly_variant_stock — see migrations
 * 20260508_phase2_unified_fly_model.sql + canonical/user_data backfills.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getCanonicalPatternBySlug,
  listCanonicalPatterns,
  listVariantRowsForPattern,
  listMyBoxes,
} from "@/lib/db/fly-v2";
import { SITE_URL } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import VariantTable from "@/components/flies-v2/VariantTable";
import PatternHeaderActions from "@/components/flies-v2/PatternHeaderActions";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const patterns = await listCanonicalPatterns();
  return patterns
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pattern = await getCanonicalPatternBySlug(slug);
  if (!pattern) return { title: "Fly Pattern — Executive Angler" };
  const title = `${pattern.name} — ${pattern.category ?? "Fly Pattern"} | Executive Angler`;
  const description = pattern.description?.slice(0, 160) ?? `${pattern.name} fly pattern: tying recipe, variants, fishing tips.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/flies/${slug}`,
      images: pattern.hero_image_url ? [{ url: pattern.hero_image_url, alt: pattern.name }] : undefined,
    },
    alternates: { canonical: `${SITE_URL}/flies/${slug}` },
  };
}

export default async function PatternDetail({ params }: Props) {
  const { slug } = await params;
  const pattern = await getCanonicalPatternBySlug(slug);
  if (!pattern) notFound();

  const [variants, userBoxes] = await Promise.all([
    listVariantRowsForPattern(pattern.id),
    listMyBoxes(),
  ]);

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] pt-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: pattern.name,
          description: pattern.description ?? undefined,
          image: pattern.hero_image_url ?? undefined,
          url: `${SITE_URL}/flies/${slug}`,
          author: pattern.origin_credit
            ? { "@type": "Person", name: pattern.origin_credit }
            : { "@type": "Organization", name: "Executive Angler" },
        }}
      />

      <div className="border-b border-[#21262D] bg-[#161B22]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3">
          <Breadcrumbs
            items={[
              { label: "Flies", href: "/flies" },
              { label: pattern.category ?? "Pattern", href: `/flies/category/${pattern.category ?? ""}` },
              { label: pattern.name },
            ]}
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-4">
            {pattern.hero_image_url && (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#0D1117]">
                <Image
                  src={pattern.hero_image_url}
                  alt={pattern.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#0BA5C7] mb-1">
                {pattern.category ?? "Fly Pattern"}
              </p>
              <h1 className="font-['DM_Serif_Display'] text-3xl text-[#F0F6FC] tracking-tight leading-tight">
                {pattern.name}
              </h1>
              {pattern.description && (
                <p className="mt-2 text-sm text-[#A8B2BD] line-clamp-2 max-w-2xl">
                  {pattern.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[#F0F6FC] font-semibold text-sm">Variants</h2>
            <p className="text-[#6E7681] text-xs">
              {variants.length} {variants.length === 1 ? "spec" : "specs"} ·
              tap any cell to edit · multi-select for bulk actions · drop a photo onto a row to upload
            </p>
          </div>
          <PatternHeaderActions patternId={pattern.id} patternSlug={pattern.slug ?? ""} />
        </div>
        <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
          <VariantTable
            variants={variants}
            patternSlug={pattern.slug ?? ""}
            userBoxes={userBoxes}
          />
        </div>
      </section>

      {(pattern.history || pattern.tying_overview || pattern.fishing_tips) && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 border-t border-[#21262D] mt-6">
          {pattern.history && (
            <div>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#F0F6FC] mb-3">History</h3>
              <p className="text-[#A8B2BD] text-[15px] leading-relaxed whitespace-pre-line">
                {pattern.history}
              </p>
            </div>
          )}
          {pattern.tying_overview && (
            <div>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#F0F6FC] mb-3">
                Tying overview
              </h3>
              <p className="text-[#A8B2BD] text-[15px] leading-relaxed whitespace-pre-line">
                {pattern.tying_overview}
              </p>
            </div>
          )}
          {pattern.fishing_tips && (
            <div>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#F0F6FC] mb-3">
                Fishing tips
              </h3>
              <p className="text-[#A8B2BD] text-[15px] leading-relaxed whitespace-pre-line">
                {pattern.fishing_tips}
              </p>
            </div>
          )}
          <div className="pt-4 border-t border-[#21262D]">
            <Link
              href="/flies"
              className="text-[#0BA5C7] hover:text-[#E8923A] text-sm transition-colors"
            >
              ← Browse all patterns
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
