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
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Trash2, Wrench, X } from "@/icons";
import { summarizeVersion } from "./summarize-version";
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
    if (!confirm(`Remove this version from ${boxName}? The version itself stays in your stock.`)) return;
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
    if (!confirm(`Remove ${ids.length} version${ids.length === 1 ? "" : "s"} from ${boxName}? The versions stay in your stock.`)) return;
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

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
        <table className="ea-table">
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
              <th className="text-left">Fly</th>
              <th className="text-left">Version</th>
              <th className="text-right">Tied</th>
              <th className="text-right">Target</th>
              <th className="text-right">Δ</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const cfg = e.configuration;
              const deficit = Math.max(0, cfg.target_count - cfg.tied_count - cfg.bought_count);
              const isSelected = selected.has(cfg.id);
              const isBusy = busyIds.has(cfg.id);
              return (
                <tr
                  key={e.id}
                  className={`${isSelected ? "bg-[var(--accent-soft)]" : ""} ${isBusy ? "opacity-50" : ""}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(cfg.id)}
                      aria-label={`Select ${cfg.fly.name}`}
                      className="h-4 w-4 rounded-[var(--radius-sm)] border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                    />
                  </td>
                  <td>
                    <Link href={`/flies/${cfg.fly.slug}`} className="flex items-center gap-2.5 hover:text-[var(--accent)]">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--paper-deep)]">
                        {cfg.fly.hero_image_url && (
                          <Image src={cfg.fly.hero_image_url} alt={cfg.fly.name} fill className="object-cover" sizes="32px" />
                        )}
                      </div>
                      <span className="font-medium">{cfg.fly.name}</span>
                      {cfg.is_favorite && <Heart className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" aria-label="Favorite" />}
                      {cfg.is_tie_next && <Wrench className="h-3.5 w-3.5 text-[var(--accent)]" aria-label="In tie-next" />}
                    </Link>
                  </td>
                  <td className="text-[var(--text-2)]">{summarizeVersion(cfg)}</td>
                  <td className="text-right">{cfg.tied_count}</td>
                  <td className="text-right">{cfg.target_count}</td>
                  <td className={`text-right ${deficit > 0 ? "text-[var(--accent)]" : "text-[var(--text-3)]"}`}>
                    {deficit > 0 ? `+${deficit}` : "—"}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => removeOne(cfg.id)}
                      disabled={isBusy}
                      title={`Remove from ${boxName}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] text-[var(--text-3)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] hover:border-[var(--danger)]/40 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
