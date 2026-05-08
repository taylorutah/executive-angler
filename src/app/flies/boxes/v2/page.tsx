/**
 * v2 Boxes list — all the user's fly boxes.
 *
 * Each box card links to /flies/boxes/v2/[id] which renders the variant
 * table scoped to that box.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listMyBoxes, type FlyBoxTier } from "@/lib/db/fly-v2";

export const metadata = {
  title: "My Fly Boxes — Executive Angler",
};

const TIER_LABELS: Record<FlyBoxTier, string> = {
  kill: "Kill",
  support: "Support",
  archive: "Archive",
  custom: "Custom",
};

const TIER_DESCRIPTIONS: Record<FlyBoxTier, string> = {
  kill: "Chest-worn, 12–20 highest-confidence flies",
  support: "Pack/vest variations and situational patterns",
  archive: "Truck/garage modular inserts",
  custom: "Trip-specific, regional, themed",
};

export default async function BoxesV2Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/flies/boxes/v2");

  const boxes = await listMyBoxes();

  // Group by tier in display order
  const groups: Record<FlyBoxTier, typeof boxes> = {
    kill: [], support: [], archive: [], custom: [],
  };
  for (const b of boxes) groups[b.tier].push(b);

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] pt-14">
      <header className="border-b border-[#21262D] bg-[#161B22]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-['DM_Serif_Display'] text-3xl text-[#F0F6FC] tracking-tight">
            My Fly Boxes
          </h1>
          <p className="mt-1 text-sm text-[#A8B2BD]">
            {boxes.length} {boxes.length === 1 ? "box" : "boxes"} · click any box to see its variants
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {(Object.keys(TIER_LABELS) as FlyBoxTier[]).map((tier) => {
          const items = groups[tier];
          if (items.length === 0) return null;
          return (
            <div key={tier}>
              <div className="mb-3">
                <h2 className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] text-[#0BA5C7]">
                  {TIER_LABELS[tier]}
                </h2>
                <p className="text-xs text-[#6E7681]">{TIER_DESCRIPTIONS[tier]}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((b) => (
                  <Link
                    key={b.id}
                    href={`/flies/boxes/v2/${b.id}`}
                    className="group rounded-lg border border-[#21262D] bg-[#161B22] p-4 hover:border-[#E8923A]/40 hover:bg-[#1F2937] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded bg-[#0D1117] flex items-center justify-center">
                        <Box className="h-5 w-5 text-[#6E7681] group-hover:text-[#E8923A] transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[#F0F6FC] font-semibold text-sm truncate">
                          {b.name}
                          {b.is_default && (
                            <span className="ml-2 rounded bg-[#0BA5C7]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#0BA5C7]">
                              Default
                            </span>
                          )}
                        </h3>
                        {b.description && (
                          <p className="text-xs text-[#A8B2BD] mt-0.5 line-clamp-2">
                            {b.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {boxes.length === 0 && (
          <div className="rounded-lg border border-[#21262D] bg-[#161B22] p-10 text-center">
            <Plus className="h-8 w-8 text-[#484F58] mx-auto mb-3" />
            <p className="text-[#A8B2BD] text-sm">No boxes yet.</p>
            <p className="text-[#6E7681] text-xs mt-1">
              Boxes get created automatically when you add your first variant via the Pattern detail page.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
