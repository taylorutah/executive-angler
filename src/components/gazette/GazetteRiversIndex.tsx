"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RiversStationTable, { type StationFlow } from "@/components/rivers/RiversStationTable";
import type { FlowState } from "@/lib/browse/flow-state";
import type { RiverBrowseItem } from "@/lib/browse/river-items";

type StationFilter = "all" | "gauge" | "freestone" | "tailwater" | "west" | "east";

const FILTERS: { key: StationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gauge", label: "Gauge" },
  { key: "freestone", label: "Freestone" },
  { key: "tailwater", label: "Tailwater" },
  { key: "west", label: "West" },
  { key: "east", label: "East" },
];

interface FlowStateRow {
  siteId: string;
  cfs: number;
  median30: number;
  state: FlowState;
  deltaCfs: number | null;
}

interface Props {
  items: RiverBrowseItem[];
  riverCount: number;
}

/** Station table at the scale of ON THE WATER NOW. Photo grid is a secondary toggle. */
export default function GazetteRiversIndex({ items, riverCount }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<"table" | "photos">("table");
  const [flows, setFlows] = useState<Record<string, FlowStateRow>>({});
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const filter = (searchParams.get("f") as StationFilter) || "all";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rivers/flow-states")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { rivers?: Record<string, FlowStateRow> } | null) => {
        if (!cancelled && data?.rivers) setFlows(data.rivers);
      })
      .catch(() => {
        /* gauges are optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setFilter = (next: StationFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("f");
    else params.set("f", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !item.title.toLowerCase().includes(q) && !(item.kicker ?? "").toLowerCase().includes(q)) {
        return false;
      }
      const water = String(item._filterValues?.waterType ?? "");
      const region = String(item._filterValues?.region ?? "");
      const gauged = String(item._filterValues?.gauge ?? "0") === "1";
      if (filter === "gauge") return gauged;
      if (filter === "freestone") return water === "freestone";
      if (filter === "tailwater") return water === "tailwater";
      if (filter === "west") return region === "west";
      if (filter === "east") return region === "east";
      return true;
    });
  }, [items, query, filter]);

  const stationFlows: Record<string, StationFlow> = useMemo(() => {
    const out: Record<string, StationFlow> = {};
    for (const [id, row] of Object.entries(flows)) {
      out[id] = { cfs: row.cfs, state: row.state, deltaCfs: row.deltaCfs ?? null };
    }
    return out;
  }, [flows]);

  return (
    <div className="bg-[var(--paper)]">
      <header className="mx-auto max-w-[72rem] px-4 pt-8 sm:px-8">
        <p className="font-ui text-[11px] uppercase tracking-[0.18em] text-[var(--copper)]">
          The reference
        </p>
        <h1 className="mt-2 font-display text-[clamp(36px,4.5vw,56px)] font-semibold leading-[0.95] text-[var(--ink)]">
          {riverCount} rivers, documented.
        </h1>
        <label className="mt-8 block max-w-xl">
          <span className="sr-only">Search a river</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a river"
            className="ea-search-underline"
          />
        </label>
        <div className="mt-5 flex flex-nowrap gap-x-3 overflow-x-auto font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-3)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f, i) => (
            <span key={f.key} className="inline-flex items-center gap-x-3">
              {i > 0 ? <span aria-hidden>·</span> : null}
              <button
                type="button"
                onClick={() => setFilter(f.key)}
                className={
                  filter === f.key
                    ? "text-[var(--ink)] underline decoration-[var(--ink)] underline-offset-4"
                    : "hover:text-[var(--ink)]"
                }
              >
                {f.label}
              </button>
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-3)]">
          <button
            type="button"
            onClick={() => setView("table")}
            className={view === "table" ? "text-[var(--ink)] underline underline-offset-4" : "hover:text-[var(--ink)]"}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("photos")}
            className={view === "photos" ? "text-[var(--ink)] underline underline-offset-4" : "hover:text-[var(--ink)]"}
          >
            Pictures
          </button>
          <span className="num ml-auto">{filtered.length}</span>
        </div>
      </header>

      <div className="mx-auto max-w-[72rem] px-4 py-6 sm:px-8">
        {view === "table" ? (
          <RiversStationTable items={filtered} flows={stationFlows} />
        ) : (
          <ul className="border-t border-[var(--border)]">
            {filtered.map((item) => (
              <li key={item.riverId} className="border-b border-[var(--border)] py-3">
                <Link href={item.href} className="font-display text-[17px] font-semibold text-[var(--ink)]">
                  {item.title}
                </Link>
                <p className="font-ui text-[12px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                  {item.kicker ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
