"use client";
/**
 * PatternsHub — replacement for the legacy PatternsTab. Lists every fly
 * the user has at least one saved version of, with rolled-up totals.
 *
 * Click a row → /flies/[slug] (the new detail page).
 * Tie-Next and Favorites tabs filter the same list.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, Wrench } from "lucide-react";
import type { PatternsHubRow } from "@/lib/db/fly-model";
import { summarizeVersion } from "./summarize-version";

type TabKey = "all" | "favorites" | "tie-next";

interface Props {
  rows: PatternsHubRow[];
  initialTab?: TabKey;
}

const CATEGORY_LABELS: Record<string, string> = {
  nymph: "Nymph",
  dry: "Dry Fly",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
  other: "Other",
};

export default function PatternsHub({ rows, initialTab = "all" }: Props) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === "favorites" && !r.favorite_any) return false;
      if (tab === "tie-next" && r.tie_next_count === 0) return false;
      if (q && !r.fly.name.toLowerCase().includes(q)) return false;
      if (categoryFilter && r.fly.category !== categoryFilter) return false;
      return true;
    });
  }, [rows, tab, search, categoryFilter]);

  const totalFavs = rows.filter((r) => r.favorite_any).length;
  const totalTieNext = rows.filter((r) => r.tie_next_count > 0).length;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.fly.category) set.add(r.fly.category as string);
    }
    return Array.from(set).sort();
  }, [rows]);

  return (
    <section>
      <div role="tablist" aria-label="Patterns view" className="flex items-center gap-1 mb-4 border-b border-[var(--color-border,#e5e7eb)] dark:border-[#21262D]">
        <TabBtn active={tab === "all"}        onClick={() => setTab("all")}        label={`All ${rows.length}`} />
        <TabBtn active={tab === "favorites"}  onClick={() => setTab("favorites")}  label={`Favorites ${totalFavs}`} />
        <TabBtn active={tab === "tie-next"}   onClick={() => setTab("tie-next")}   label={`Tie Next ${totalTieNext}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flies…"
            className="w-full rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] bg-transparent pl-8 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] bg-transparent px-3 py-2 text-sm"
          aria-label="Category filter"
        >
          <option value="">All types</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
          ))}
        </select>
        <span className="text-xs text-[var(--color-text-muted)] ml-auto">
          {filtered.length} of {rows.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-12 text-center">
          {tab === "favorites" && "No favorited versions yet."}
          {tab === "tie-next"  && "Your tie-next queue is empty."}
          {tab === "all"       && (rows.length === 0
            ? "You haven't saved any fly versions yet. Browse the library and tap \"+ Add to my box.\""
            : "No matches. Adjust your filters.")}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <li key={r.fly.id}>
              <Link
                href={`/flies/${r.fly.slug}`}
                className="block rounded-lg border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] hover:border-[#E8923A]/60 hover:bg-[#E8923A]/5 transition-colors px-4 py-3"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-[var(--color-surface,#f3f4f6)] dark:bg-[#0D1117]">
                    {r.fly.hero_image_url ? (
                      <Image src={r.fly.hero_image_url} alt={r.fly.name} fill className="object-cover" sizes="40px" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.fly.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {(CATEGORY_LABELS[r.fly.category as string] ?? r.fly.category ?? "Fly")}
                      {" · "}
                      {r.versions.length} version{r.versions.length === 1 ? "" : "s"}:{" "}
                      {r.versions.slice(0, 3).map(summarizeVersion).join(", ")}
                      {r.versions.length > 3 && ` +${r.versions.length - 3}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-shrink-0">
                    <Stat label="In box" value={r.in_box_count} />
                    <Stat label="Target" value={r.target_total} />
                    <Stat
                      label="Δ"
                      value={r.deficit}
                      highlight={r.deficit > 0 ? "warn" : undefined}
                    />
                    {r.tie_next_count > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-2 py-0.5 text-[10px] font-medium text-[#E8923A]">
                        <Wrench className="h-3 w-3" /> {r.tie_next_count}
                      </span>
                    )}
                    {r.favorite_any && (
                      <Heart className="h-3.5 w-3.5 text-rose-500" fill="currentColor" />
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
        active
          ? "border-[#E8923A] text-[#E8923A]"
          : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {label}
    </button>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: "warn" }) {
  return (
    <span className="inline-flex flex-col items-center leading-tight">
      <span className={`font-semibold tabular-nums ${highlight === "warn" ? "text-[#E8923A]" : ""}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">{label}</span>
    </span>
  );
}
