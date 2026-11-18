"use client";
/**
 * BoxEntriesTable — the version list on /flies/boxes/[id].
 *
 * Each row links to its fly. Adds a leading select checkbox and a trailing
 * trash button that removes the entry from THIS box only (the configuration
 * stays — only the box-membership row in fly_box_entries_v3 is deleted).
 * When 1+ rows are selected, a sticky bar offers "Remove from box" in bulk.
 *
 * Backed by DELETE /api/fishing/fly-configurations/box.
 */
import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Trash2, Wrench, X } from "@/icons";
import { summarizeVersion } from "./summarize-version";
import BoxEntryStockControl from "./BoxEntryStockControl";
import { boxRemoveBulkConfirm, boxRemoveOneConfirm } from "./box-remove-confirm";
import type { SlotOverrides } from "@/types/flies";

export interface BoxEntryRow {
  id: string;
  configuration: {
    id: string;
    nickname: string | null;
    size: string | null;
    slot_overrides: SlotOverrides;
    tied_count: number;
    bought_count: number;
    target_count: number;
    is_favorite: boolean;
    is_tie_next: boolean;
    fly: {
      id: string;
      slug: string;
      name: string;
      category: string | null;
      hero_image_url: string | null;
    };
  };
}

interface Props {
  boxId: string;
  boxName: string;
  entries: BoxEntryRow[];
}

function RemoveCell({
  boxName,
  disabled,
  onRemove,
}: {
  boxName: string;
  disabled: boolean;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled}
      title={`Remove from ${boxName}`}
      className="inline-flex h-11 w-11 md:h-8 md:w-8 min-h-11 min-w-11 md:min-h-8 md:min-w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] text-[var(--text-3)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] hover:border-[var(--danger)]/40 disabled:opacity-50 transition-colors shrink-0"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

export default function BoxEntriesTable({ boxId, boxName, entries }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  function toggleSelect(configId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(configId)) next.delete(configId);
      else next.add(configId);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === entries.length) return new Set();
      return new Set(entries.map((e) => e.configuration.id));
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function removeOne(configId: string) {
    if (!confirm(boxRemoveOneConfirm(boxName))) return;
    setBusyIds((prev) => new Set(prev).add(configId));
    setError(null);
    try {
      const res = await fetch(
        `/api/fishing/fly-configurations/box?configuration_id=${encodeURIComponent(configId)}&box_id=${encodeURIComponent(boxId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Failed to remove");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(configId);
        return next;
      });
    }
  }

  async function removeBulk() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!confirm(boxRemoveBulkConfirm(ids.length, boxName))) return;
    setBusyIds(new Set(ids));
    setError(null);
    const results = await Promise.allSettled(
      ids.map((cid) =>
        fetch(
          `/api/fishing/fly-configurations/box?configuration_id=${encodeURIComponent(cid)}&box_id=${encodeURIComponent(boxId)}`,
          { method: "DELETE" },
        ).then((r) => (r.ok ? { ok: true } : { ok: false })),
      ),
    );
    const failures = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)).length;
    if (failures > 0) setError(`${failures} removal${failures === 1 ? "" : "s"} failed. The rest were saved.`);
    setBusyIds(new Set());
    setSelected(new Set());
    router.refresh();
  }

  const allSelected = entries.length > 0 && selected.size === entries.length;
  const someSelected = selected.size > 0 && selected.size < entries.length;

  return (
    <>
      {selected.size > 0 && (
        <div className="sticky top-[var(--header-h)] z-30 mb-2 flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-[var(--shadow-float)]">
          <span className="text-xs font-medium text-[var(--text-1)] num">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={removeBulk}
              disabled={busyIds.size > 0}
              className="ea-btn ea-btn-danger ea-btn-sm"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Remove from {boxName}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="ea-btn ea-btn-secondary ea-btn-sm"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-2 text-xs text-[var(--danger)]">{error}</p>
      )}

      <div
        data-box-entries-table-wrap
        className="overflow-x-auto md:overflow-x-visible rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] max-md:overflow-x-hidden"
      >
        <table className="ea-table w-full max-md:table-fixed">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="h-4 w-4 rounded-[var(--radius-sm)] border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                />
              </th>
              <th className="text-left max-md:w-auto">Fly</th>
              <th className="text-left max-md:w-24">Version</th>
              <th className="text-left hidden md:table-cell w-[7.5rem]">Stock</th>
              <th className="text-right hidden md:table-cell w-14">Target</th>
              <th className="text-right hidden md:table-cell w-12">Δ</th>
              <th className="hidden md:table-cell w-12" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const cfg = e.configuration;
              const deficit = Math.max(0, cfg.target_count - cfg.tied_count - cfg.bought_count);
              const isSelected = selected.has(cfg.id);
              const isBusy = busyIds.has(cfg.id);
              return (
                <Fragment key={e.id}>
                  <tr
                    className={`${isSelected ? "bg-[var(--accent-soft)]" : ""} ${isBusy ? "opacity-50" : ""}`}
                  >
                    <td className="align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(cfg.id)}
                        aria-label={`Select ${cfg.fly.name}`}
                        className="h-4 w-4 rounded-[var(--radius-sm)] border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                      />
                    </td>
                    <td className="align-middle min-w-0">
                      <Link
                        href={`/flies/${cfg.fly.slug}`}
                        className="flex items-center gap-2.5 hover:text-[var(--accent)] min-w-0"
                      >
                        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--paper-deep)]">
                          {cfg.fly.hero_image_url && (
                            <Image src={cfg.fly.hero_image_url} alt={cfg.fly.name} fill className="object-cover" sizes="32px" />
                          )}
                        </div>
                        <span className="font-medium truncate max-md:text-sm">{cfg.fly.name}</span>
                        {cfg.is_favorite && (
                          <Heart className="h-3.5 w-3.5 flex-shrink-0 fill-[var(--accent)] text-[var(--accent)]" aria-label="Favorite" />
                        )}
                        {cfg.is_tie_next && (
                          <Wrench className="h-3.5 w-3.5 flex-shrink-0 text-[var(--accent)]" aria-label="In tie-next" />
                        )}
                      </Link>
                    </td>
                    <td className="align-middle text-[var(--text-2)] text-sm truncate max-md:max-w-[6rem]">
                      {summarizeVersion(cfg)}
                    </td>
                    <td className="text-left align-middle py-2 hidden md:table-cell">
                      <BoxEntryStockControl
                        configurationId={cfg.id}
                        tied={cfg.tied_count ?? 0}
                        bought={cfg.bought_count ?? 0}
                      />
                    </td>
                    <td className="text-right align-middle hidden md:table-cell">{cfg.target_count ?? 0}</td>
                    <td
                      className={`text-right align-middle hidden md:table-cell ${deficit > 0 ? "text-[var(--accent)]" : "text-[var(--text-3)]"}`}
                    >
                      {deficit > 0 ? `+${deficit}` : "—"}
                    </td>
                    <td className="text-right align-middle hidden md:table-cell">
                      <RemoveCell
                        boxName={boxName}
                        disabled={isBusy}
                        onRemove={() => removeOne(cfg.id)}
                      />
                    </td>
                  </tr>
                  <tr
                    className={`md:hidden border-b border-[var(--border)] ${isSelected ? "bg-[var(--accent-soft)]" : ""}`}
                  >
                    <td colSpan={3} className="px-3 pb-3 pt-1">
                      <BoxEntryStockControl
                        layout="row"
                        configurationId={cfg.id}
                        tied={cfg.tied_count ?? 0}
                        bought={cfg.bought_count ?? 0}
                      />
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                        <dl className="flex items-center gap-4 text-sm num text-[var(--text-1)]">
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-meta)]">
                              Target
                            </dt>
                            <dd className="font-semibold">{cfg.target_count ?? 0}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-meta)]">
                              Δ
                            </dt>
                            <dd className={`font-semibold ${deficit > 0 ? "text-[var(--accent)]" : "text-[var(--text-3)]"}`}>
                              {deficit > 0 ? `+${deficit}` : "—"}
                            </dd>
                          </div>
                        </dl>
                        <RemoveCell
                          boxName={boxName}
                          disabled={isBusy}
                          onRemove={() => removeOne(cfg.id)}
                        />
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}