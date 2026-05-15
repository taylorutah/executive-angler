/**
 * Box detail — list of versions (user_fly_configurations) in a single box.
 *
 * Post-Phase-C: reads from fly_box_entries_v3 + user_fly_configurations +
 * flies. The legacy variant table that this page used to render is gone.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Box, ChevronLeft, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBoxById, listMyBoxes } from "@/lib/db/fly-v2";
import BoxEntriesTable, { type BoxEntryRow } from "@/components/flies-v3/BoxEntriesTable";

interface Props {
  params: Promise<{ id: string }>;
}

const TIER_LABELS = {
  kill: "Kill",
  support: "Support",
  archive: "Archive",
  custom: "Custom",
} as const;

type Entry = BoxEntryRow & {
  sort_order: number;
  added_at: string;
};

export default async function BoxDetailV3({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/flies/boxes/${id}`);

  const box = await getBoxById(id);
  if (!box) notFound();

  const [{ data: rawEntries }, userBoxes] = await Promise.all([
    supabase
      .from("fly_box_entries_v3")
      .select(`
        id, sort_order, added_at,
        configuration:user_fly_configurations!fly_box_entries_v3_configuration_id_fkey(
          id, nickname, size, slot_overrides,
          tied_count, bought_count, target_count,
          is_favorite, is_tie_next,
          fly:flies(id, slug, name, category, hero_image_url)
        )
      `)
      .eq("box_id", id)
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("added_at", { ascending: true }),
    listMyBoxes(),
  ]);

  // PostgREST returns the embedded object as an object OR array depending on
  // FK cardinality. Normalize.
  const entries: Entry[] = (rawEntries ?? [])
    .map((row) => {
      const cfgRaw = (row as { configuration?: unknown }).configuration;
      const cfg = Array.isArray(cfgRaw) ? cfgRaw[0] : cfgRaw;
      if (!cfg) return null;
      const flyRaw = (cfg as { fly?: unknown }).fly;
      const fly = Array.isArray(flyRaw) ? flyRaw[0] : flyRaw;
      if (!fly) return null;
      return {
        id: (row as { id: string }).id,
        sort_order: (row as { sort_order: number }).sort_order ?? 0,
        added_at: (row as { added_at: string }).added_at,
        configuration: { ...(cfg as object), fly } as Entry["configuration"],
      };
    })
    .filter((x): x is Entry => x !== null);

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
              <h1 className="font-heading text-3xl text-[#F0F6FC] tracking-tight">
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
              {entries.length} {entries.length === 1 ? "version" : "versions"} ·
              {box.total_capacity ? ` capacity ${box.total_capacity} · ` : " "}
              tap any row to open the fly
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end sm:max-w-[45%] flex-shrink-0">
            {userBoxes.length > 1 && (
              <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-start sm:justify-end sm:gap-1.5">
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
                      <Box className={`h-3 w-3 flex-shrink-0 ${isActive ? "text-[#E8923A]" : "text-[#6E7681]"}`} />
                      <span className={`max-w-[140px] truncate text-xs font-semibold ${isActive ? "text-[#F0F6FC]" : "text-[#A8B2BD]"}`}>
                        {b.name}
                      </span>
                      {b.is_default && <Star className="h-3 w-3 fill-[#0BA5C7] text-[#0BA5C7]" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-8 text-center">
            <p className="text-sm text-[#A8B2BD]">This box is empty.</p>
            <p className="mt-2 text-xs text-[#6E7681]">
              Open any fly in the{" "}
              <Link href="/flies/library" className="text-[#0BA5C7] hover:text-[#E8923A]">library</Link>{" "}
              and use the box-picker on a version to add it here.
            </p>
          </div>
        ) : (
          <BoxEntriesTable boxId={id} boxName={box.name} entries={entries} />
        )}
      </section>
    </main>
  );
}
