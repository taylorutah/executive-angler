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
import { Trash2, X } from "lucide-react";
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
        <div className="sticky top-14 z-30 mb-2 flex items-center justify-between gap-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 shadow-sm">
          <span className="text-xs font-medium text-rose-300">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={removeBulk}
              disabled={busyIds.size > 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-600 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove from {boxName}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--border-strong)] px-2 py-1 text-xs text-[var(--text-body)] hover:bg-[var(--border-rule)]"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-2 text-xs text-rose-400">{error}</p>
      )}

      <div className="overflow-hidden rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-raised)] text-[var(--text-meta)] text-[10px] uppercase tracking-wide">
            <tr>
              <th className="w-10 px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="h-4 w-4 accent-[var(--action)] cursor-pointer"
                />
              </th>
              <th className="text-left px-4 py-2 font-medium">Fly</th>
              <th className="text-left px-4 py-2 font-medium">Version</th>
              <th className="text-right px-4 py-2 font-medium">Tied</th>
              <th className="text-right px-4 py-2 font-medium">Target</th>
              <th className="text-right px-4 py-2 font-medium">Δ</th>
              <th className="w-12 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262D]">
            {entries.map((e) => {
              const cfg = e.configuration;
              const deficit = Math.max(0, cfg.target_count - cfg.tied_count - cfg.bought_count);
              const isSelected = selected.has(cfg.id);
              const isBusy = busyIds.has(cfg.id);
              return (
                <tr
                  key={e.id}
                  className={`transition-colors ${
                    isSelected ? "bg-[var(--action)]/5" : "hover:bg-[var(--surface-raised)]/60"
                  } ${isBusy ? "opacity-50" : ""}`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(cfg.id)}
                      aria-label={`Select ${cfg.fly.name}`}
                      className="h-4 w-4 accent-[var(--action)] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/flies/${cfg.fly.slug}`} className="flex items-center gap-2.5 hover:text-[var(--action)]">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-[var(--border-rule)]">
                        {cfg.fly.hero_image_url && (
                          <Image src={cfg.fly.hero_image_url} alt={cfg.fly.name} fill className="object-cover" sizes="32px" />
                        )}
                      </div>
                      <span className="font-medium">{cfg.fly.name}</span>
                      {cfg.is_favorite && <span className="text-rose-400 text-xs">♥</span>}
                      {cfg.is_tie_next && <span className="text-[var(--action)] text-xs">⚒</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-[var(--text-body)]">{summarizeVersion(cfg)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{cfg.tied_count}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{cfg.target_count}</td>
                  <td className={`px-4 py-2 text-right tabular-nums ${deficit > 0 ? "text-[var(--action)]" : "text-[var(--text-meta)]"}`}>
                    {deficit > 0 ? `+${deficit}` : "—"}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeOne(cfg.id)}
                      disabled={isBusy}
                      title={`Remove from ${boxName}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-strong)] text-[var(--text-meta)] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/40 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
