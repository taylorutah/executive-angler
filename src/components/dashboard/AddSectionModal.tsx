"use client";

import { useState, useMemo } from "react";
import { X, Search, ChevronLeft } from "@/icons";
import type { GaugeChoice } from "./RiverSectionCard";

interface RiverOpt {
  id: string;
  name: string;
  slug: string;
  gauges: GaugeChoice[];
}

interface Props {
  rivers: RiverOpt[];
  alreadyPinned: string[]; // "riverId:siteId"
  onClose: () => void;
}

export default function AddSectionModal({ rivers, alreadyPinned, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [selectedRiver, setSelectedRiver] = useState<RiverOpt | null>(null);
  const [pendingSites, setPendingSites] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const eligible = rivers.filter((r) => r.gauges.length > 0);
    if (!q) return eligible.slice(0, 50);
    return eligible.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 50);
  }, [rivers, search]);

  async function handleSubmit() {
    if (!selectedRiver || pendingSites.size === 0) return;
    setSubmitting(true);
    const ops = Array.from(pendingSites).map((siteId) =>
      fetch("/api/dashboard/favorite-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riverId: selectedRiver.id, usgsSiteId: siteId }),
      })
    );
    await Promise.all(ops);
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-rule)] shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-rule)]">
          {selectedRiver && (
            <button
              type="button"
              onClick={() => { setSelectedRiver(null); setPendingSites(new Set()); }}
              className="p-1 rounded hover:bg-[var(--border-rule)] text-[var(--text-body)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-[var(--text-primary)] font-medium flex-1">
            {selectedRiver ? selectedRiver.name : "Pin a river section"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--border-rule)] text-[var(--text-body)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!selectedRiver ? (
          <>
            <div className="px-5 py-3 border-b border-[var(--border-rule)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-meta)]" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rivers…"
                  className="w-full bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-meta)] focus:border-[var(--action)]/60 focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-2 py-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-[var(--text-body)]">No matches.</p>
              ) : filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRiver(r)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--border-rule)] flex items-center justify-between"
                >
                  <span className="text-sm text-[var(--text-primary)]">{r.name}</span>
                  <span className="text-[10px] text-[var(--text-meta)]">{r.gauges.length} section{r.gauges.length === 1 ? "" : "s"}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-2 py-2">
              {selectedRiver.gauges.map((g) => {
                const key = `${selectedRiver.id}:${g.site_id}`;
                const isPinned = alreadyPinned.includes(key);
                const isChecked = pendingSites.has(g.site_id);
                return (
                  <label
                    key={g.site_id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isPinned ? "opacity-50" : "hover:bg-[var(--border-rule)] cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      disabled={isPinned}
                      checked={isChecked}
                      onChange={(e) => {
                        const next = new Set(pendingSites);
                        if (e.target.checked) next.add(g.site_id); else next.delete(g.site_id);
                        setPendingSites(next);
                      }}
                      className="h-4 w-4 accent-[var(--action)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--text-primary)] truncate">{g.section}</p>
                      <p className="text-[11px] text-[var(--text-meta)] truncate">{g.name} · {g.site_id}</p>
                    </div>
                    {isPinned && <span className="text-[10px] text-[var(--text-meta)]">Pinned</span>}
                  </label>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[var(--border-rule)] flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-body)]">
                {pendingSites.size > 0 ? `${pendingSites.size} selected` : "Select one or more"}
              </span>
              <button
                type="button"
                disabled={pendingSites.size === 0 || submitting}
                onClick={handleSubmit}
                className="rounded-lg bg-[var(--action)] text-[var(--surface-page)] hover:bg-[var(--action)]/90 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 text-sm font-medium"
              >
                {submitting ? "Pinning…" : "Pin"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
