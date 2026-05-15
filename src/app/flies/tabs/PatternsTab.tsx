"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FlyBoxTabs,
  type SerializedFlyPattern,
  type SerializedFlyBoxEntry,
} from "@/components/flies/FlyBoxTabs";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import { entryDeficit, entryStocked, isStubEntry } from "@/lib/flies/box-stock";
import type { FlyPattern } from "@/types/fishing-log";
import { ownerPatternPermalink } from "@/lib/flies/permalink";
import VariantChips from "@/components/flies/VariantChips";
import VariantEditorSheet from "@/components/flies/VariantEditorSheet";
import { TieNextCell } from "@/components/flies/VariantInlineCells";
import DataTable, { type Column } from "@/components/ui/DataTable";
import ViewModeToggle, { type ViewMode } from "@/components/ui/ViewModeToggle";
import DeleteFlyPatternDialog from "@/components/flies/DeleteFlyPatternDialog";
import BulkSetBeadDialog from "@/components/flies/BulkSetBeadDialog";
import FilterDropdown, { type FilterOption } from "@/components/ui/FilterDropdown";
import FilterBar from "@/components/ui/FilterBar";
import { Search, Trash2, X, CircleDot } from "lucide-react";

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
  /** Viewer's profile username — needed to link personal patterns to their
   *  /anglers/[username]/flies/[slug] detail page. */
  viewerUsername: string | null;
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
  /** ID of the fly_patterns row (personal source only) — drives delete action. */
  personalPatternId?: string;
}

export default function PatternsTab({
  myPatterns,
  flyBoxEntries,
  counts,
  canonicalNames,
  viewerUsername,
}: PatternsTabProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  // status filters: any of "low-stock", "tie-next", "personal"
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [editing, setEditing] = useState<{ entry: FlyBoxEntry; patternName: string } | null>(null);
  // Bulk-set-bead dialog state for backfilling personal-pattern variants
  // whose legacy bead_size was empty.
  const [bulkBead, setBulkBead] = useState<{ patternId: string; patternName: string; beadlessCount: number } | null>(null);
  // Delete confirmation state — one row at a time, branched by source.
  const [deletePersonal, setDeletePersonal] = useState<{ id: string; name: string } | null>(null);
  const [removeLibrary, setRemoveLibrary] = useState<{ name: string; variantIds: string[] } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  // Multi-select state — keyed by PatternRow.key. Bulk delete operates on this.
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const rows = useMemo(
    () => buildPatternRows(myPatterns, flyBoxEntries, viewerUsername),
    [myPatterns, flyBoxEntries, viewerUsername],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const typeSet = new Set(typeFilters);
    const statusSet = new Set(statusFilters);
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (typeSet.size > 0 && !typeSet.has(r.type)) return false;
      if (statusSet.size > 0) {
        // OR within status: row must match at least one selected status.
        const matches =
          (statusSet.has("low-stock") && r.deficit > 0) ||
          (statusSet.has("tie-next") && r.hasTieNext) ||
          (statusSet.has("personal") && r.source === "personal");
        if (!matches) return false;
      }
      return true;
    });
  }, [rows, search, typeFilters, statusFilters]);

  const typeOptions: FilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.type, (counts.get(r.type) || 0) + 1);
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const statusOptions: FilterOption[] = useMemo(() => {
    let lowStock = 0;
    let tieNext = 0;
    let personal = 0;
    for (const r of rows) {
      if (r.deficit > 0) lowStock++;
      if (r.hasTieNext) tieNext++;
      if (r.source === "personal") personal++;
    }
    return [
      { value: "low-stock", label: "Low stock", count: lowStock },
      { value: "tie-next", label: "Tie Next", count: tieNext },
      { value: "personal", label: "Your patterns", count: personal },
    ];
  }, [rows]);

  const statusLabel = (v: string) =>
    v === "low-stock" ? "Low stock" : v === "tie-next" ? "Tie Next" : "Your patterns";

  const activeChips = [
    ...typeFilters.map((t) => ({
      key: `type:${t}`,
      label: t,
      onRemove: () => setTypeFilters((prev) => prev.filter((x) => x !== t)),
    })),
    ...statusFilters.map((s) => ({
      key: `status:${s}`,
      label: statusLabel(s),
      onRemove: () => setStatusFilters((prev) => prev.filter((x) => x !== s)),
    })),
  ];

  const clearAll = () => {
    setTypeFilters([]);
    setStatusFilters([]);
  };
  const hasActive = typeFilters.length > 0 || statusFilters.length > 0;

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
          <FilterBar
            sticky={false}
            inline
            activeChips={activeChips}
            onClearAll={hasActive ? clearAll : undefined}
            rightSlot={
              <span className="text-[11px] font-[var(--font-mono)] tabular-nums text-[var(--color-text-muted)]">
                {filtered.length} / {rows.length}
              </span>
            }
          >
            <label className="relative flex-1 min-w-[180px] max-w-xs">
              <Search
                size={14}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patterns…"
                aria-label="Search patterns"
                className="w-full pl-7 pr-7 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E8923A]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <FilterDropdown
              label="Type"
              options={typeOptions}
              selected={typeFilters}
              onChange={setTypeFilters}
              placeholder="Type"
              emptyMessage="No patterns to filter yet"
            />
            <FilterDropdown
              label="Status"
              options={statusOptions}
              selected={statusFilters}
              onChange={setStatusFilters}
              placeholder="Status"
              searchable={false}
            />
          </FilterBar>

          {selectedKeys.size > 0 && (
            <div className="mb-2 flex items-center justify-between gap-3 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-3 py-2 text-sm text-[var(--color-text-primary)]">
              <span>
                <span className="font-semibold">{selectedKeys.size}</span> selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedKeys(new Set())}
                  className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setBulkConfirm(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete {selectedKeys.size}
                </button>
              </div>
            </div>
          )}

          <DataTable
            columns={buildColumns(
              setEditing,
              (row) => {
                if (row.source === "personal" && row.personalPatternId) {
                  setDeletePersonal({ id: row.personalPatternId, name: row.name });
                } else if (row.source === "library" && row.variants.length > 0) {
                  setRemoveLibrary({
                    name: row.name,
                    variantIds: row.variants.map((v) => v.id),
                  });
                }
              },
              (row) => {
                // Only library rows (v2 personal patterns surface here) with at
                // least one bead-less variant get the bulk-set-bead action.
                if (row.source !== "library" || row.variants.length === 0) return;
                const beadless = row.variants.filter((v) => v.bead_weight_mm == null);
                if (beadless.length === 0) return;
                setBulkBead({
                  patternId: row.variants[0]!.canonical_fly_id!,
                  patternName: row.name,
                  beadlessCount: beadless.length,
                });
              },
            )}
            rows={filtered}
            getRowKey={(r) => r.key}
            defaultSort={{ id: "deficit", dir: "desc" }}
            emptyMessage={
              rows.length === 0
                ? "No patterns yet. Create one or browse the Library."
                : "No patterns match your filters."
            }
            selection={{
              selectedKeys,
              onToggleKey: (key) => {
                setSelectedKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                });
              },
              onToggleAllVisible: () => {
                const visibleKeys = filtered
                  .filter(
                    (r) =>
                      (r.source === "personal" && r.personalPatternId) ||
                      (r.source === "library" && r.variants.length > 0),
                  )
                  .map((r) => r.key);
                const allSelected = visibleKeys.every((k) => selectedKeys.has(k));
                setSelectedKeys(() => {
                  if (allSelected) {
                    const next = new Set(selectedKeys);
                    visibleKeys.forEach((k) => next.delete(k));
                    return next;
                  }
                  const next = new Set(selectedKeys);
                  visibleKeys.forEach((k) => next.add(k));
                  return next;
                });
              },
              selectable: (r) =>
                (r.source === "personal" && !!r.personalPatternId) ||
                (r.source === "library" && r.variants.length > 0),
            }}
          />
        </>
      ) : (
        <FlyBoxTabs
          favCount={flyBoxProps.favCount}
          tieNextCount={flyBoxProps.tieNextCount}
          sortedTypes={flyBoxProps.sortedTypes}
          grouped={flyBoxProps.grouped}
          canonicalNames={canonicalNames}
          viewerUsername={viewerUsername}
          onDeletePersonal={(input) => setDeletePersonal(input)}
          onDeleteLibraryEntry={(input) =>
            setRemoveLibrary({ name: input.name, variantIds: [input.entryId] })
          }
        />
      )}

      <VariantEditorSheet
        open={editing !== null}
        entry={editing?.entry}
        patternName={editing?.patternName}
        onClose={() => setEditing(null)}
      />

      {bulkBead && (
        <BulkSetBeadDialog
          open
          patternId={bulkBead.patternId}
          patternName={bulkBead.patternName}
          beadlessCount={bulkBead.beadlessCount}
          onClose={() => setBulkBead(null)}
          onApplied={() => {
            setBulkBead(null);
            router.refresh();
          }}
        />
      )}

      {deletePersonal && (
        <DeleteFlyPatternDialog
          open
          flyId={deletePersonal.id}
          flyName={deletePersonal.name}
          onClose={() => setDeletePersonal(null)}
          onDeleted={() => {
            setDeletePersonal(null);
            router.refresh();
          }}
        />
      )}

      {bulkConfirm && (
        <BulkDeleteDialog
          rows={rows.filter((r) => selectedKeys.has(r.key))}
          progress={bulkProgress}
          error={bulkError}
          onCancel={() => {
            if (bulkProgress) return;
            setBulkConfirm(false);
            setBulkError(null);
          }}
          onConfirm={async () => {
            const targets = rows.filter((r) => selectedKeys.has(r.key));
            setBulkError(null);
            setBulkProgress({ done: 0, total: targets.length });
            const errors: string[] = [];
            for (let i = 0; i < targets.length; i++) {
              const row = targets[i];
              try {
                if (row.source === "personal" && row.personalPatternId) {
                  // Personal: hard-delete the pattern; catches default to unlink
                  // (no destroy_catches flag = name snapshot kept on the catch).
                  const r = await fetch(
                    `/api/fishing/flies?id=${encodeURIComponent(row.personalPatternId)}`,
                    { method: "DELETE" },
                  );
                  if (!r.ok) {
                    const body = (await r.json().catch(() => ({}))) as { error?: string };
                    errors.push(`${row.name}: ${body.error || r.statusText}`);
                  }
                } else if (row.source === "library" && row.variants.length > 0) {
                  // Library: unlink every variant in the user's box.
                  const results = await Promise.all(
                    row.variants.map((v) =>
                      fetch(`/api/fly-box?id=${encodeURIComponent(v.id)}`, {
                        method: "DELETE",
                      }),
                    ),
                  );
                  const firstFail = results.find((res) => !res.ok);
                  if (firstFail) {
                    const body = (await firstFail.json().catch(() => ({}))) as { error?: string };
                    errors.push(`${row.name}: ${body.error || firstFail.statusText}`);
                  }
                }
              } catch (e) {
                errors.push(`${row.name}: ${e instanceof Error ? e.message : "Network error"}`);
              }
              setBulkProgress({ done: i + 1, total: targets.length });
            }
            if (errors.length > 0) {
              setBulkError(errors.slice(0, 3).join("\n") + (errors.length > 3 ? `\n…and ${errors.length - 3} more` : ""));
              setBulkProgress(null);
              // Refresh anyway — some may have succeeded.
              router.refresh();
              return;
            }
            setBulkProgress(null);
            setBulkConfirm(false);
            setSelectedKeys(new Set());
            router.refresh();
          }}
        />
      )}

      {removeLibrary && (
        <RemoveFromBoxDialog
          name={removeLibrary.name}
          variantCount={removeLibrary.variantIds.length}
          busy={removing}
          error={removeError}
          onCancel={() => {
            setRemoveLibrary(null);
            setRemoveError(null);
          }}
          onConfirm={async () => {
            setRemoving(true);
            setRemoveError(null);
            try {
              const results = await Promise.all(
                removeLibrary.variantIds.map((id) =>
                  fetch(`/api/fly-box?id=${encodeURIComponent(id)}`, {
                    method: "DELETE",
                  }).then(async (r) => ({ ok: r.ok, body: r.ok ? null : await r.json().catch(() => ({})) })),
                ),
              );
              const firstError = results.find((r) => !r.ok);
              if (firstError) {
                throw new Error(
                  (firstError.body as { error?: string })?.error ||
                    "Couldn't remove from your box.",
                );
              }
              setRemoveLibrary(null);
              router.refresh();
            } catch (e) {
              setRemoveError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
              setRemoving(false);
            }
          }}
        />
      )}
    </div>
  );
}

function BulkDeleteDialog({
  rows,
  progress,
  error,
  onCancel,
  onConfirm,
}: {
  rows: PatternRow[];
  progress: { done: number; total: number } | null;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const personalCount = rows.filter((r) => r.source === "personal").length;
  const libraryCount = rows.filter((r) => r.source === "library").length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl">
        <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
          Delete {rows.length} {rows.length === 1 ? "pattern" : "patterns"}?
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {personalCount > 0 && (
            <>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {personalCount}
              </span>{" "}
              personal pattern{personalCount === 1 ? "" : "s"} will be deleted entirely
              (catches that reference them keep a name snapshot, no FK).
            </>
          )}
          {personalCount > 0 && libraryCount > 0 && <br />}
          {libraryCount > 0 && (
            <>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {libraryCount}
              </span>{" "}
              library pattern{libraryCount === 1 ? "" : "s"} will be unlinked from your
              fly box (the canonical stays in the library).
            </>
          )}
        </p>
        <ul className="mt-3 max-h-40 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 p-2 text-xs text-[var(--color-text-secondary)]">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-2 py-0.5">
              <span className="truncate">{r.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {r.source === "personal" ? "delete" : "unlink"}
              </span>
            </li>
          ))}
        </ul>
        {error && (
          <pre className="mt-3 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
            {error}
          </pre>
        )}
        {progress && (
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            Deleting {progress.done} / {progress.total}…
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={progress !== null}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:border-[#E8923A] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={progress !== null}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {progress ? `Deleting…` : `Delete ${rows.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function RemoveFromBoxDialog({
  name,
  variantCount,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  name: string;
  variantCount: number;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl">
        <h3 className="font-heading text-lg text-[var(--color-text-primary)]">
          Remove {name} from your patterns?
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          This unlinks {variantCount === 1 ? "this variant" : `${variantCount} variants`}{" "}
          from your fly box. The canonical pattern stays in the library — you can
          add it back any time.
        </p>
        {error && (
          <p className="mt-3 rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:border-[#E8923A] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

function buildColumns(
  onEditVariant: (next: { entry: FlyBoxEntry; patternName: string }) => void,
  onRequestDelete: (row: PatternRow) => void,
  onSetBead: (row: PatternRow) => void,
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
    {
      id: "actions",
      header: "",
      accessor: () => "",
      width: "72px",
      render: (r) => {
        const isPersonal = r.source === "personal" && !!r.personalPatternId;
        const isLibrary = r.source === "library" && r.variants.length > 0;
        if (!isPersonal && !isLibrary) {
          return <span className="text-[var(--color-text-muted)]">—</span>;
        }
        const beadlessCount = isLibrary
          ? r.variants.filter((v) => v.bead_weight_mm == null).length
          : 0;
        const deleteLabel = isPersonal
          ? "Delete this pattern (and its variants)"
          : "Remove from your fly box (keeps the canonical in the library)";
        return (
          <div className="flex items-center gap-0.5">
            {beadlessCount > 0 && (
              <button
                type="button"
                aria-label={`Set bead for ${beadlessCount} variant${beadlessCount === 1 ? "" : "s"} without bead`}
                title={`${beadlessCount} variant${beadlessCount === 1 ? "" : "s"} have no bead — set one for all`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetBead(r);
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[#E8923A]/10 hover:text-[#E8923A] transition-colors"
              >
                <CircleDot className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              aria-label={deleteLabel}
              title={deleteLabel}
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(r);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];
}

/* ─── Row builders ─── */

function buildPatternRows(
  myPatterns: FlyPattern[],
  flyBoxEntries: FlyBoxEntry[],
  viewerUsername: string | null,
): PatternRow[] {
  const rows: PatternRow[] = [];

  // Group library entries by canonical_fly_id so each pattern is one row.
  // Drop stub rows (no variant-distinguishing data — no size, bead, or label):
  // they're pre-variant-migration entries that can't link a catch to a real
  // variant. If a canonical only has stubs, the whole pattern row drops out.
  const byCanonical = new Map<string, FlyBoxEntry[]>();
  for (const e of flyBoxEntries) {
    if (!e.canonical_fly_id || !e.canonical_fly) continue;
    if (isStubEntry(e)) continue;
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
    // Personal v2 patterns flow through this same path (getMyV2PersonalVariants
    // synthesizes a canonical_fly join from the personal row). Route them to
    // the angler permalink so the canonical detail page — which filters
    // owner_user_id IS NULL — doesn't 404.
    const isPersonalV2 = !!cf.owner_user_id;
    const href = isPersonalV2
      ? ownerPatternPermalink({
          id: cf.id,
          slug: cf.slug ?? null,
          ownerUsername: viewerUsername,
        })
      : cf.slug
        ? `/flies/${cf.slug}`
        : "/flies";
    rows.push({
      key: `lib-${cf.id}`,
      source: "library",
      name: head.custom_name ?? cf.name,
      type: CATEGORY_TO_TYPE[cf.category] ?? "Other",
      imageUrl: head.custom_image_url ?? cf.hero_image_url ?? null,
      variants: variants.sort(
        (a, b) => (a.variant_sort_order ?? 0) - (b.variant_sort_order ?? 0),
      ),
      inBox,
      target,
      deficit,
      tieNextCount,
      href,
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
      href: ownerPatternPermalink({
        id: p.id,
        slug: p.slug ?? null,
        ownerUsername: viewerUsername,
        promoted_to_canonical_id: p.promoted_to_canonical_id ?? null,
        promotedCanonicalSlug: p.promoted_canonical_slug ?? null,
      }),
      hasTieNext: !!p.is_tie_next,
      personalPatternId: p.id,
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
      promoted_to_canonical_id: fly.promoted_to_canonical_id ?? null,
      slug: fly.slug ?? null,
      promoted_canonical_slug: fly.promoted_canonical_slug ?? null,
    },
  }));

  // One card per canonical fly. Multiple variants of the same fly collapse
  // into a single card here (the variant list lives in the table view); stub
  // rows are dropped, and if every entry for a canonical is a stub we drop
  // the card entirely — useless for catch logging.
  const cardByCanonical = new Map<string, FlyBoxEntry>();
  for (const e of flyBoxEntries) {
    if (!e.canonical_fly_id || !e.canonical_fly) continue;
    if (isStubEntry(e)) continue;
    if (!cardByCanonical.has(e.canonical_fly_id)) {
      cardByCanonical.set(e.canonical_fly_id, e);
    }
  }
  const libraryCards: UnifiedFly[] = Array.from(cardByCanonical.values())
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
