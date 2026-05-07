"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FlyBoxTabs,
  type SerializedFlyPattern,
  type SerializedFlyBoxEntry,
} from "@/components/flies/FlyBoxTabs";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import { entryDeficit, entryStocked } from "@/lib/flies/box-stock";
import type { FlyPattern } from "@/types/fishing-log";
import VariantChips from "@/components/flies/VariantChips";
import VariantEditorSheet from "@/components/flies/VariantEditorSheet";
import { TieNextCell } from "@/components/flies/VariantInlineCells";
import DataTable, { type Column } from "@/components/ui/DataTable";
import ViewModeToggle, { type ViewMode } from "@/components/ui/ViewModeToggle";
import { Search } from "lucide-react";

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

const TYPE_ORDER = [
  "Nymph",
  "Dry Fly",
  "Streamer",
  "Wet Fly",
  "Emerger",
  "Terrestrial",
  "Egg",
  "Midge",
  "Other",
];

interface PatternsTabProps {
  myPatterns: FlyPattern[];
  flyBoxEntries: FlyBoxEntry[];
  counts: { box: number; favorites: number; tieNext: number; sharedWithMe: number };
  canonicalNames: string[];
}

/** Row in the table view — one row per (canonical fly) or per (personal pattern). */
interface PatternRow {
  key: string;
  source: "library" | "personal";
  name: string;
  type: string;
  imageUrl: string | null;
  variants: FlyBoxEntry[];
  inBox: number;
  target: number;
  deficit: number;
  tieNextCount: number;
  href: string | null;
  /** When true, the row has at least one variant flagged for tie-next. */
  hasTieNext: boolean;
}

export default function PatternsTab({
  myPatterns,
  flyBoxEntries,
  counts,
  canonicalNames,
}: PatternsTabProps) {
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editing, setEditing] = useState<{ entry: FlyBoxEntry; patternName: string } | null>(null);

  const rows = useMemo(
    () => buildPatternRows(myPatterns, flyBoxEntries),
    [myPatterns, flyBoxEntries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      if (lowStockOnly && r.deficit === 0) return false;
      return true;
    });
  }, [rows, search, typeFilter, lowStockOnly]);

  const allTypes = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(r.type);
    return Array.from(set).sort();
  }, [rows]);

  const flyBoxProps = useMemo(
    () => buildFlyBoxProps(myPatterns, flyBoxEntries, counts),
    [myPatterns, flyBoxEntries, counts],
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <ViewModeToggle storageKey="flies:view:patterns" defaultMode="table" onChange={setView} />
      </div>

      {view === "table" ? (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="relative flex-1 min-w-[180px] max-w-xs">
              <Search
                size={14}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patterns…"
                className="w-full pl-7 pr-2 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E8923A]"
              />
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] px-2 py-1.5 focus:outline-none focus:border-[#E8923A]"
            >
              <option value="">All types</option>
              {allTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[var(--color-border)] bg-[var(--color-surface)]"
              />
              Low stock only
            </label>
            <span className="ml-auto text-[11px] font-[var(--font-mono)] tabular-nums text-[var(--color-text-muted)]">
              {filtered.length} / {rows.length}
            </span>
          </div>

          <DataTable
            columns={buildColumns(setEditing)}
            rows={filtered}
            getRowKey={(r) => r.key}
            defaultSort={{ id: "deficit", dir: "desc" }}
            emptyMessage={
              rows.length === 0
                ? "No patterns yet. Create one or browse the Library."
                : "No patterns match your filters."
            }
          />
        </>
      ) : (
        <FlyBoxTabs
          favCount={flyBoxProps.favCount}
          tieNextCount={flyBoxProps.tieNextCount}
          sortedTypes={flyBoxProps.sortedTypes}
          grouped={flyBoxProps.grouped}
          canonicalNames={canonicalNames}
        />
      )}

      <VariantEditorSheet
        open={editing !== null}
        entry={editing?.entry}
        patternName={editing?.patternName}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function buildColumns(
  onEditVariant: (next: { entry: FlyBoxEntry; patternName: string }) => void,
): Column<PatternRow>[] {
  return [
    {
      id: "img",
      header: "",
      accessor: () => "",
      width: "36px",
      render: (r) =>
        r.imageUrl ? (
          <div className="relative h-7 w-7 overflow-hidden rounded">
            <Image src={r.imageUrl} alt="" fill sizes="28px" className="object-cover" />
          </div>
        ) : (
          <div className="h-7 w-7 rounded bg-[var(--color-surface-raised)]" />
        ),
    },
    {
      id: "name",
      header: "Pattern",
      accessor: (r) => r.name,
      sortable: true,
      render: (r) =>
        r.href ? (
          <Link href={r.href} className="font-medium text-[var(--color-text-primary)] hover:text-[#E8923A]">
            {r.name}
          </Link>
        ) : (
          <span className="font-medium text-[var(--color-text-primary)]">{r.name}</span>
        ),
    },
    {
      id: "type",
      header: "Type",
      accessor: (r) => r.type,
      sortable: true,
      hideOnSm: true,
      render: (r) => (
        <span className="inline-flex items-center rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">
          {r.type}
        </span>
      ),
    },
    {
      id: "variants",
      header: "Variants",
      accessor: (r) => r.variants.length,
      hideOnSm: true,
      render: (r) =>
        r.variants.length > 0 ? (
          <VariantChips
            variants={r.variants}
            max={4}
            signalLowStock
            onClick={(v) => {
              if (!v) return;
              onEditVariant({ entry: v, patternName: r.name });
            }}
          />
        ) : (
          <span className="text-[11px] text-[var(--color-text-muted)]">—</span>
        ),
    },
    {
      id: "inBox",
      header: "In box",
      accessor: (r) => r.inBox,
      sortable: true,
      numeric: true,
    },
    {
      id: "target",
      header: "Target",
      accessor: (r) => r.target,
      sortable: true,
      numeric: true,
      render: (r) => (r.target > 0 ? r.target : <span className="text-[var(--color-text-muted)]">—</span>),
    },
    {
      id: "deficit",
      header: "Δ",
      accessor: (r) => r.deficit,
      sortable: true,
      numeric: true,
      render: (r) =>
        r.deficit > 0 ? (
          <span className="text-[#E8923A] font-semibold">{r.deficit}</span>
        ) : (
          <span className="text-[var(--color-text-muted)]">0</span>
        ),
    },
    {
      id: "tienext",
      header: "Tie-Next",
      accessor: (r) => r.tieNextCount,
      sortable: true,
      hideOnSm: true,
      render: (r) => {
        // Inline cell only makes sense for single-variant rows; for multi-variant
        // patterns just show a count chip (the user clicks a variant to edit).
        if (r.variants.length === 1) {
          return <TieNextCell entry={r.variants[0]} />;
        }
        return r.tieNextCount > 0 ? (
          <span className="text-[11px] text-[#E8923A]">{r.tieNextCount} queued</span>
        ) : (
          <span className="text-[11px] text-[var(--color-text-muted)]">—</span>
        );
      },
    },
  ];
}

/* ─── Row builders ─── */

function buildPatternRows(
  myPatterns: FlyPattern[],
  flyBoxEntries: FlyBoxEntry[],
): PatternRow[] {
  const rows: PatternRow[] = [];

  // Group library entries by canonical_fly_id so each pattern is one row.
  const byCanonical = new Map<string, FlyBoxEntry[]>();
  for (const e of flyBoxEntries) {
    if (!e.canonical_fly_id || !e.canonical_fly) continue;
    const arr = byCanonical.get(e.canonical_fly_id) ?? [];
    arr.push(e);
    byCanonical.set(e.canonical_fly_id, arr);
  }

  for (const [, variants] of byCanonical) {
    const head = variants[0]!;
    const cf = head.canonical_fly!;
    const inBox = variants.reduce((n, v) => n + entryStocked(v), 0);
    const target = variants.reduce(
      (n, v) => n + (typeof v.target_count === "number" ? v.target_count : 0),
      0,
    );
    const deficit = variants.reduce((n, v) => n + entryDeficit(v), 0);
    const tieNextCount = variants.filter(
      (v) => v.tie_next_status === "wanted" || v.tie_next_status === "at_vise",
    ).length;
    rows.push({
      key: `lib-${cf.id}`,
      source: "library",
      name: head.custom_name ?? cf.name,
      type: CATEGORY_TO_TYPE[cf.category] ?? "Other",
      imageUrl: head.custom_image_url ?? cf.hero_image_url ?? null,
      variants: variants.sort(
        (a, b) =>
          (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) ||
          (a.variant_sort_order ?? 0) - (b.variant_sort_order ?? 0),
      ),
      inBox,
      target,
      deficit,
      tieNextCount,
      href: `/flies/${cf.slug}`,
      hasTieNext: tieNextCount > 0,
    });
  }

  // Personal patterns — each pattern is its own row; no variants on `user_fly_box`
  // unless the user has also added it via a personal pattern row, which is rare.
  for (const p of myPatterns) {
    rows.push({
      key: `pat-${p.id}`,
      source: "personal",
      name: p.name,
      type: p.type ?? "Other",
      imageUrl: p.image_url ?? p.my_tied_fly_photo_url ?? null,
      variants: [],
      inBox: 0,
      target: 0,
      deficit: 0,
      tieNextCount: p.is_tie_next || p.tie_next_status === "wanted" || p.tie_next_status === "at_vise" ? 1 : 0,
      href: `/journal/flies/${p.id}/edit`,
      hasTieNext: !!p.is_tie_next,
    });
  }

  return rows;
}

type UnifiedFly =
  | { source: "personal"; fly: SerializedFlyPattern }
  | { source: "library"; entry: SerializedFlyBoxEntry };

function buildFlyBoxProps(
  myPatterns: FlyPattern[],
  flyBoxEntries: FlyBoxEntry[],
  counts: { favorites: number; tieNext: number },
) {
  const personalCards: UnifiedFly[] = myPatterns.map((fly) => ({
    source: "personal" as const,
    fly: {
      id: fly.id,
      name: fly.name,
      type: fly.type,
      size: fly.size,
      hook: fly.hook,
      bead_size: fly.bead_size,
      bead_color: fly.bead_color,
      fly_color: fly.fly_color,
      image_url: fly.image_url ?? fly.my_tied_fly_photo_url ?? undefined,
      tags: fly.tags,
      description: fly.description,
      is_favorite: fly.is_favorite,
      is_tie_next: fly.is_tie_next,
      parent_canonical_id: fly.parent_canonical_id ?? undefined,
    },
  }));

  const libraryCards: UnifiedFly[] = flyBoxEntries
    .filter((e) => e.canonical_fly)
    .map((e) => ({
      source: "library" as const,
      entry: {
        id: e.id,
        canonical_fly_id: e.canonical_fly_id ?? "",
        preferred_sizes: e.preferred_sizes,
        personal_notes: e.personal_notes,
        custom_image_url: e.custom_image_url,
        custom_name: e.custom_name,
        personalizations: e.personalizations,
        is_favorite: e.is_favorite,
        is_tie_next: e.is_tie_next,
        times_used: e.times_used,
        canonical_fly: {
          id: e.canonical_fly!.id,
          slug: e.canonical_fly!.slug,
          name: e.canonical_fly!.name,
          category: e.canonical_fly!.category,
          tagline: e.canonical_fly!.tagline ?? undefined,
          sizes: e.canonical_fly!.sizes ?? undefined,
          colors: e.canonical_fly!.colors ?? undefined,
          bead_options: e.canonical_fly!.bead_options ?? undefined,
          hook_styles: e.canonical_fly!.hook_styles ?? undefined,
          hero_image_url: e.canonical_fly!.hero_image_url ?? undefined,
          materials_list: e.canonical_fly!.materials_list ?? undefined,
        },
      },
    }));

  const grouped: Record<string, UnifiedFly[]> = {};
  for (const card of [...libraryCards, ...personalCards]) {
    let type: string;
    if (card.source === "library") {
      type = CATEGORY_TO_TYPE[card.entry.canonical_fly.category] ?? "Other";
    } else {
      type = card.fly.type ?? "Other";
    }
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(card);
  }

  const sortedTypes = [
    ...TYPE_ORDER.filter((t) => grouped[t]?.length),
    ...Object.keys(grouped).filter((t) => !TYPE_ORDER.includes(t) && grouped[t]?.length),
  ];

  return {
    favCount: counts.favorites,
    tieNextCount: counts.tieNext,
    sortedTypes,
    grouped,
  };
}
