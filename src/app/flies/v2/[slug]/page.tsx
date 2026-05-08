/**
 * v2 Pattern detail — workbench-style.
 *
 * Replaces magazine-layout fly editorial with a dense Variant table that lives
 * at the top of the page. Editorial (history, tying steps, fishing tips) sits
 * below the table — useful but not the primary surface.
 *
 * This route is feature-flagged via path: existing /flies/[slug] keeps working
 * unchanged. Once verified end-to-end, this becomes the canonical /flies/[slug]
 * and the legacy magazine layout is retired.
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCanonicalPatternBySlug, listCanonicalPatterns, listVariantRowsForPattern, getDefaultFlyBoxId } from "@/lib/db/fly-v2";
import VariantTable from "@/components/flies-v2/VariantTable";
import PatternHeaderActions from "@/components/flies-v2/PatternHeaderActions";

export const revalidate = 3600;

export async function generateStaticParams() {
  const patterns = await listCanonicalPatterns();
  return patterns
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug as string }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PatternDetailV2({ params }: Props) {
  const { slug } = await params;
  const pattern = await getCanonicalPatternBySlug(slug);
  if (!pattern) notFound();

  const [variants, defaultBoxId] = await Promise.all([
    listVariantRowsForPattern(pattern.id),
    getDefaultFlyBoxId(),
  ]);

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] pt-14">
      {/* Compact header — small image, title, category, action chips */}
      <header className="border-b border-[#21262D] bg-[#161B22]">
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
      </header>

      {/* Variant table — the main surface */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[#F0F6FC] font-semibold text-sm">Variants</h2>
            <p className="text-[#6E7681] text-xs">
              {variants.length} {variants.length === 1 ? "spec" : "specs"} ·
              tap any cell to edit · multi-select for bulk actions
            </p>
          </div>
          <PatternHeaderActions patternId={pattern.id} patternSlug={pattern.slug ?? ""} />
        </div>
        <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
          <VariantTable variants={variants} patternSlug={pattern.slug ?? ""} defaultBoxId={defaultBoxId} />
        </div>
      </section>

      {/* Editorial — secondary, below the fold by default on desktop */}
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
              href={`/flies/${pattern.slug}`}
              className="text-[#0BA5C7] hover:text-[#E8923A] text-sm transition-colors"
            >
              View magazine layout (v1) &rarr;
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
