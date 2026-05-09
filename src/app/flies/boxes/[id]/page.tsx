/**
 * Box detail — variant table scoped to one fly_box.
 *
 * Reuses VariantTable but defaults to read-only stock context (the variants
 * here are the user's own; clicking a row jumps to the pattern's detail).
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Box, ChevronLeft, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBoxById, listVariantsInBox, listMyBoxes } from "@/lib/db/fly-v2";
import VariantTable from "@/components/flies-v2/VariantTable";

interface Props {
  params: Promise<{ id: string }>;
}

const TIER_LABELS = {
  kill: "Kill",
  support: "Support",
  archive: "Archive",
  custom: "Custom",
} as const;

export default async function BoxDetailV2({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/flies/boxes/${id}`);

  const box = await getBoxById(id);
  if (!box) notFound();

  const [variants, userBoxes] = await Promise.all([
    listVariantsInBox(id),
    listMyBoxes(),
  ]);

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] pt-14">
      <header className="border-b border-[#21262D] bg-[#161B22]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6">
          <div className="min-w-0 flex-1">
            <Link
              href="/flies?tab=boxes"
              className="inline-flex items-center gap-1 text-xs text-[#6E7681] hover:text-[#0BA5C7] transition-colors mb-2"
            >
              <ChevronLeft className="h-3 w-3" /> All boxes
            </Link>
            <div className="flex items-baseline gap-3">
              <h1 className="font-['DM_Serif_Display'] text-3xl text-[#F0F6FC] tracking-tight">
                {box.name}
              </h1>
              <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] text-[#0BA5C7]">
                {TIER_LABELS[box.tier]}
              </span>
              {box.is_default && (
                <span className="rounded bg-[#0BA5C7]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#0BA5C7]">
                  Default
                </span>
              )}
            </div>
            {box.description && (
              <p className="mt-2 text-sm text-[#A8B2BD] max-w-2xl">{box.description}</p>
            )}
            <p className="mt-3 font-['IBM_Plex_Mono'] text-[11px] text-[#6E7681]">
              {variants.length} {variants.length === 1 ? "variant" : "variants"} ·
              {box.total_capacity ? ` capacity ${box.total_capacity} · ` : " "}
              tap any cell to edit
            </p>
          </div>
          {userBoxes.length > 1 && (
            <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-start sm:justify-end sm:gap-1.5 sm:max-w-[45%] flex-shrink-0">
              {userBoxes.map((b) => {
                const isActive = b.id === id;
                return (
                  <Link
                    key={b.id}
                    href={`/flies/boxes/${b.id}`}
                    className={`group flex items-center gap-1.5 rounded-md border px-2 py-1 sm:rounded-lg sm:px-3 sm:py-2 transition-colors ${
                      isActive
                        ? "border-[#E8923A] bg-[#E8923A]/10"
                        : "border-[#21262D] bg-[#0D1117] hover:border-[#E8923A]/40"
                    }`}
                  >
                    <Box
                      className={`h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5 ${
                        isActive ? "text-[#E8923A]" : "text-[#6E7681]"
                      }`}
                    />
                    <span
                      className={`max-w-[110px] sm:max-w-[140px] truncate text-[10px] sm:text-xs font-semibold ${
                        isActive ? "text-[#F0F6FC]" : "text-[#A8B2BD] group-hover:text-[#F0F6FC]"
                      }`}
                    >
                      {b.name}
                    </span>
                    {b.is_default && (
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 fill-[#0BA5C7] text-[#0BA5C7]" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
          <VariantTable
            variants={variants}
            patternSlug=""
            userBoxes={userBoxes}
            boxId={id}
          />
        </div>
        {variants.length === 0 && (
          <p className="text-xs text-[#6E7681] text-center mt-4">
            Empty box. Add variants from a Pattern detail page (e.g.{" "}
            <Link href="/flies/perdigon" className="text-[#0BA5C7] hover:text-[#E8923A]">
              Perdigon
            </Link>
            ) using the multi-select bulk action.
          </p>
        )}
      </section>
    </main>
  );
}
