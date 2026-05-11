"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ListChecks, Wrench, CheckCircle2, GripVertical } from "lucide-react";
import type { FlyPattern, TieNextStatus } from "@/types/fishing-log";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import type { VariantRow } from "@/types/fly-v2";
import { totalOwned, deficit } from "@/types/fly-v2";
import { ownerPatternPermalink } from "@/lib/flies/permalink";
import HelpHint from "@/components/ui/HelpHint";
import TipCard from "@/components/ui/TipCard";

const CATEGORY_TO_TYPE: Record<string, string> = {
  dry: "Dry Fly",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
};

type Column = { key: TieNextStatus; label: string; accent: string; icon: React.ReactNode; hint: string };

const COLUMNS: Column[] = [
  {
    key: "wanted",
    label: "Want to tie",
    accent: "border-[#00B4D8]/30 bg-[#00B4D8]/[0.03]",
    icon: <ListChecks className="h-4 w-4 text-[#00B4D8]" />,
    hint: "Patterns you want to sit down and tie — restock ideas, variants from the fly box, community patterns you saved.",
  },
  {
    key: "at_vise",
    label: "At the vise",
    accent: "border-[#E8923A]/30 bg-[#E8923A]/[0.03]",
    icon: <Wrench className="h-4 w-4 text-[#E8923A]" />,
    hint: "Currently tying. Useful to pull up the recipe card on your phone without hunting through the library.",
  },
  {
    key: "done",
    label: "Done (last 14 days)",
    accent: "border-emerald-500/25 bg-emerald-500/[0.03]",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    hint: "Auto-clears 14 days after you mark done — keeps the board focused on what's next.",
  },
];

type Item =
  | {
      kind: "pattern";
      id: string;
      status: TieNextStatus;
      name: string;
      subtitle: string;
      imageUrl: string | null;
      href: string;
      targetQty: number | null;
      notes: string | null;
      isDerived?: false;
    }
  | {
      kind: "box";
      id: string;
      status: TieNextStatus;
      name: string;
      subtitle: string;
      imageUrl: string | null;
      href: string;
      targetQty: number | null;
      notes: string | null;
      isDerived?: false;
    }
  | {
      kind: "variant";
      id: string;
      status: TieNextStatus;
      name: string;
      subtitle: string;
      imageUrl: string | null;
      href: string;
      targetQty: number | null;
      notes: string | null;
      /** True when this item was auto-derived from a target/stock shortage. */
      isDerived: true;
    };

function patternToItem(p: FlyPattern): Item {
  return {
    kind: "pattern",
    id: p.id,
    status: (p.tie_next_status ?? "wanted") as TieNextStatus,
    name: p.name,
    subtitle: p.type || "Personal pattern",
    imageUrl: p.image_url ?? p.my_tied_fly_photo_url ?? null,
    href: ownerPatternPermalink({
      id: p.id,
      promoted_to_canonical_id: p.promoted_to_canonical_id ?? null,
      promotedCanonicalSlug: p.promoted_canonical_slug ?? null,
    }),
    targetQty: p.tie_next_target_qty ?? null,
    notes: p.tie_next_notes ?? null,
  };
}

function variantToItem(v: VariantRow): Item {
  const owned = totalOwned(v.stock);
  const need = deficit(v.stock);
  const beadStr = v.bead_material && v.bead_material !== "none"
    ? [v.bead_material, v.bead_weight_mm ? `${v.bead_weight_mm}mm` : null, v.bead_color].filter(Boolean).join(" · ")
    : null;
  const subtitleParts = [
    `size ${v.size}`,
    beadStr,
    v.body_color ?? null,
  ].filter(Boolean) as string[];
  return {
    kind: "variant",
    id: v.id,
    status: "wanted",
    name: v.pattern?.name ?? v.display_name ?? "Untitled variant",
    subtitle: `${subtitleParts.join(" · ")} · need ${need} (have ${owned}/${v.stock?.target_count ?? 0})`,
    imageUrl: null,
    href: v.pattern?.slug ? `/flies/${v.pattern.slug}` : `/flies/by-id/${v.pattern_id}`,
    targetQty: v.stock?.target_count ?? null,
    notes: null,
    isDerived: true,
  };
}

function boxToItem(e: FlyBoxEntry): Item {
  return {
    kind: "box",
    id: e.id,
    status: (e.tie_next_status ?? "wanted") as TieNextStatus,
    name: e.canonical_fly?.name ?? "Unknown fly",
    subtitle: CATEGORY_TO_TYPE[e.canonical_fly?.category ?? ""] ?? "Library",
    imageUrl: e.canonical_fly?.hero_image_url ?? null,
    href: e.canonical_fly ? `/flies/${e.canonical_fly.slug}` : "/my-flies",
    targetQty: e.tie_next_target_qty ?? null,
    notes: e.tie_next_notes ?? null,
  };
}

interface Props {
  initialPatterns: FlyPattern[];
  initialBoxEntries: FlyBoxEntry[];
  initialDerivedVariants?: VariantRow[];
}

export default function TieNextKanban({
  initialPatterns,
  initialBoxEntries,
  initialDerivedVariants = [],
}: Props) {
  const initialItems = useMemo<Item[]>(
    () => [
      ...initialPatterns.map(patternToItem),
      ...initialBoxEntries.map(boxToItem),
      ...initialDerivedVariants.map(variantToItem),
    ],
    [initialPatterns, initialBoxEntries, initialDerivedVariants]
  );
  const [items, setItems] = useState<Item[]>(initialItems);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TieNextStatus | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const map: Record<TieNextStatus, Item[]> = {
      none: [],
      wanted: [],
      at_vise: [],
      done: [],
    };
    for (const it of items) {
      if (it.status === "none") continue;
      map[it.status].push(it);
    }
    return map;
  }, [items]);

  async function updateStatus(item: Item, next: TieNextStatus) {
    if (item.status === next) return;
    setSavingId(item.id);
    // Optimistic update
    setItems((prev) =>
      prev.map((it) => (it.id === item.id && it.kind === item.kind ? { ...it, status: next } : it))
    );
    try {
      const body: Record<string, unknown> = { status: next };
      if (item.kind === "pattern") body.flyPatternId = item.id;
      else body.flyBoxId = item.id;
      const res = await fetch("/api/fishing/tie-next", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("[TieNextKanban] update failed:", err);
      // Rollback
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id && it.kind === item.kind ? { ...it, status: item.status } : it
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  const total = columns.wanted.length + columns.at_vise.length + columns.done.length;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-6 py-14 text-center">
        <ListChecks className="mx-auto h-10 w-10 text-[#6E7681]" />
        <h2 className="mt-4 font-heading text-lg font-bold text-[#F0F6FC]">Nothing queued up</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-[#6E7681]">
          Add flies to your Tie Next queue from any pattern card — tap the{" "}
          <ListChecks className="inline h-3.5 w-3.5" /> icon to add.
        </p>
        <Link
          href="/my-flies"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-[#21262D] bg-[#0D1117] px-4 py-2 text-sm font-medium text-[#A8B2BD] hover:text-[#F0F6FC]"
        >
          Go to Fly Box
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TipCard storageKey="tie-next-intro-v2" title="Tie Next — your tying to-do list">
        <p>
          Drag cards between columns, or tap a status button to move them. Flies move{' '}
          <span className="text-[#F0F6FC] font-semibold">Want → Vise → Done</span> as you work through them.
        </p>
        <p className="text-[#6E7681]">
          <span className="text-[#F0F6FC]">Add a fly:</span> tap the <ListChecks className="inline h-3 w-3" /> icon on any card in your{' '}
          <Link href="/my-flies" className="text-[#00B4D8] hover:underline">Fly Box</Link>, the{' '}
          <Link href="/flies" className="text-[#00B4D8] hover:underline">Library</Link>, or in the{' '}
          <Link href="/my-flies?tab=workbench" className="text-[#00B4D8] hover:underline">Workbench</Link>.
        </p>
        <p className="text-[#6E7681]">
          <span className="text-[#F0F6FC]">Done column auto-clears after 14 days</span> — keeps the board focused on what&apos;s next.
        </p>
      </TipCard>

      <div className="grid gap-3 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`flex flex-col rounded-xl border p-3 transition-colors ${
              dragOverCol === col.key
                ? "border-[#E8923A]/60 bg-[#E8923A]/[0.06]"
                : `border-[#21262D] ${col.accent}`
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col.key);
            }}
            onDragLeave={() => setDragOverCol((v) => (v === col.key ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              const raw = e.dataTransfer.getData("application/x-tie-next");
              if (!raw) return;
              const parts = raw.split(":");
              const kind = parts[0] as "pattern" | "box";
              const id = parts[1];
              const item = items.find((it) => it.kind === kind && it.id === id);
              if (item) void updateStatus(item, col.key);
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {col.icon}
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A8B2BD]">
                  {col.label}
                </span>
                <HelpHint label={`About ${col.label}`}>{col.hint}</HelpHint>
              </div>
              <span className="rounded-full bg-[#0D1117] px-2 py-0.5 text-[10px] font-semibold text-[#6E7681]">
                {columns[col.key].length}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              {columns[col.key].length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#21262D] p-4 text-center text-xs text-[#6E7681]">
                  Drop cards here
                </div>
              ) : (
                columns[col.key].map((item) => (
                  <KanbanCard
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    saving={savingId === item.id}
                    currentColumn={col.key}
                    dragging={dragId === `${item.kind}:${item.id}`}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/x-tie-next",
                        `${item.kind}:${item.id}`
                      );
                      e.dataTransfer.effectAllowed = "move";
                      setDragId(`${item.kind}:${item.id}`);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOverCol(null);
                    }}
                    onMove={(next) => updateStatus(item, next)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanCard({
  item,
  saving,
  currentColumn,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  item: Item;
  saving: boolean;
  currentColumn: TieNextStatus;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (next: TieNextStatus) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group rounded-lg border border-[#21262D] bg-[#0D1117] p-2.5 transition-all ${
        dragging ? "opacity-40" : "hover:border-[#E8923A]/40"
      } ${saving ? "animate-pulse" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <GripVertical className="mt-1 h-3.5 w-3.5 flex-shrink-0 cursor-grab text-[#6E7681] opacity-60 group-hover:opacity-100" />
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-[#161B22]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg">🪝</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={item.href}
              className="block truncate text-sm font-semibold text-[#F0F6FC] hover:text-[#E8923A]"
            >
              {item.name}
            </Link>
            {item.isDerived && (
              <span
                title="Auto-derived from your target vs. on-hand stock. Bump your stock or target to clear it."
                className="inline-flex items-center rounded border border-[#0BA5C7]/30 bg-[#0BA5C7]/10 px-1 py-px text-[9px] font-medium uppercase tracking-wider text-[#0BA5C7]"
              >
                auto
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-[#6E7681]">{item.subtitle}</p>
          {item.targetQty ? (
            <p className="mt-1 text-[10px] text-[#A8B2BD]">
              <span className="font-semibold text-[#F0F6FC]">{item.targetQty}</span> to tie
            </p>
          ) : null}
          {item.notes ? (
            <p className="mt-1 line-clamp-2 text-[11px] text-[#A8B2BD]">{item.notes}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 border-t border-[#21262D]/60 pt-2">
        {currentColumn !== "wanted" && (
          <MoveButton label="Want" onClick={() => onMove("wanted")} />
        )}
        {currentColumn !== "at_vise" && (
          <MoveButton label="Vise" onClick={() => onMove("at_vise")} />
        )}
        {currentColumn !== "done" && (
          <MoveButton
            label="Done"
            accent="emerald"
            icon={<Check className="h-3 w-3" />}
            onClick={() => onMove("done")}
          />
        )}
      </div>
    </div>
  );
}

function MoveButton({
  label,
  onClick,
  icon,
  accent,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  accent?: "emerald";
}) {
  const cls =
    accent === "emerald"
      ? "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
      : "border-[#21262D] text-[#A8B2BD] hover:border-[#E8923A]/40 hover:text-[#E8923A]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${cls}`}
    >
      {icon}
      {label}
    </button>
  );
}
