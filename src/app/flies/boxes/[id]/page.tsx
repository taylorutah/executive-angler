/**
 * Box detail — list of versions (user_fly_configurations) in a single box.
 *
 * Post-Phase-C: reads from fly_box_entries_v3 + user_fly_configurations +
 * flies. The legacy variant table that this page used to render is gone.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Box, ChevronLeft, Star } from "@/icons";
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
    <main className="min-h-screen bg-[var(--paper)] text-[var(--text-1)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-5 flex items-start gap-6">
          <div className="min-w-0 flex-1">
            <Link
              href="/flies?tab=boxes"
              className="inline-flex items-center gap-1 text-xs text-[var(--text-2)] hover:text-[var(--accent)] transition-colors mb-2"
            >
              <ChevronLeft className="h-3 w-3" /> All boxes
            </Link>
            <div className="flex items-baseline gap-3">
              <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] lg:text-3xl">
                {box.name}
              </h1>
              <span className="ea-badge">
                {TIER_LABELS[box.tier]}
              </span>
              {box.is_default && (
                <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent)]">
                  Default
                </span>
              )}
            </div>
            {box.description && (
              <p className="mt-2 text-sm text-[var(--text-2)] max-w-2xl">{box.description}</p>
            )}
            <p className="mt-3 text-[13px] text-[var(--text-3)] num">
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
                      className={`group flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-2 transition-colors ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <Box className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-3)]"}`} />
                      <span className={`max-w-[140px] truncate text-[13px] font-medium ${isActive ? "text-[var(--accent)]" : "text-[var(--text-2)]"}`}>
                        {b.name}
                      </span>
                      {b.is_default && <Star className="h-3 w-3 fill-[var(--accent)] text-[var(--accent)]" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6">
        {entries.length === 0 ? (
          <div className="ea-empty rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
            <p>This box is empty.</p>
            <p className="text-sm text-[var(--text-3)]">
              Open any fly in the{" "}
              <Link href="/flies/library" className="text-[var(--accent)] hover:underline">library</Link>{" "}
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
