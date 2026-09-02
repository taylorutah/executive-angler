"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import RiversStationTable, { type StationFlow } from "@/components/rivers/RiversStationTable";
import type { FlowState } from "@/lib/browse/flow-state";
import type { RiverBrowseItem } from "@/lib/browse/river-items";
import GazetteColophon from "./GazetteColophon";

type Dimension = "state" | "water" | "hatch" | "gauge";

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: "state", label: "State" },
  { key: "water", label: "Water" },
  { key: "hatch", label: "Hatch" },
  { key: "gauge", label: "Gauge" },
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

/** Still 3 — THE REFERENCE station table. Search is type, not a boxed pill. */
export default function GazetteRiversIndex({ items, riverCount }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [flows, setFlows] = useState<Record<string, FlowStateRow>>({});
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const dimension = (searchParams.get("f") as Dimension | "all") || "all";
  const value = searchParams.get("v") ?? "";

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

  const setDimension = (next: Dimension) => {
    const params = new URLSearchParams(searchParams.toString());
    if (dimension === next && !value) {
      params.delete("f");
      params.delete("v");
    } else {
      params.set("f", next);
      if (next === "gauge") {
        params.set("v", "live");
      } else if (next === "hatch") {
        params.set("v", "on");
      } else {
        params.delete("v");
      }
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setValue = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!next) params.delete("v");
    else params.set("v", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const states = useMemo(() => {
    return [...new Set(items.map((item) => item.kicker).filter(Boolean))] as string[];
  }, [items]);

  const waters = useMemo(() => {
    return [...new Set(items.map((item) => String(item._filterValues?.waterType ?? "")).filter(Boolean))];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !item.title.toLowerCase().includes(q) && !(item.kicker ?? "").toLowerCase().includes(q)) {
        return false;
      }
      const water = String(item._filterValues?.waterType ?? "");
      const gauged = String(item._filterValues?.gauge ?? "0") === "1";
      if (dimension === "gauge") return gauged;
      if (dimension === "hatch") return Boolean(item.whatsOn);
      if (dimension === "water" && value) return water === value;
      if (dimension === "state" && value) return (item.kicker ?? "") === value;
      return true;
    });
  }, [items, query, dimension, value]);

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
        <h1 className="mt-2 font-display text-[clamp(36px,5vw,56px)] font-semibold leading-[0.95] text-[var(--ink)]">
          {riverCount} rivers, <em className="italic">documented.</em>
        </h1>
        <p className="mt-3 font-body text-[17px] italic text-[var(--text-2)]">
          Access, hatches, and live flow when a gauge exists.
        </p>
        <label className="relative mt-8 block max-w-xl">
          <span className="sr-only">Search rivers</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" aria-hidden>
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rivers..."
            className="ea-search-box"
          />
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-3)]">
          <span>Filters:</span>
          {DIMENSIONS.map((f, i) => (
            <span key={f.key} className="inline-flex items-center gap-x-3">
              {i > 0 ? <span aria-hidden>•</span> : null}
              <button
                type="button"
                onClick={() => setDimension(f.key)}
                className={
                  dimension === f.key
                    ? "text-[var(--ink)] underline decoration-[var(--copper)] underline-offset-4"
                    : "hover:text-[var(--ink)]"
                }
              >
                {f.label}
              </button>
            </span>
          ))}
        </div>
        {dimension === "state" ? (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 font-ui text-[12px] uppercase tracking-[0.1em] text-[var(--text-3)]">
            {states.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setValue(value === state ? "" : state)}
                className={value === state ? "text-[var(--ink)] underline underline-offset-4" : "hover:text-[var(--ink)]"}
              >
                {state}
              </button>
            ))}
          </div>
        ) : null}
        {dimension === "water" ? (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 font-ui text-[12px] uppercase tracking-[0.1em] text-[var(--text-3)]">
            {waters.map((water) => (
              <button
                key={water}
                type="button"
                onClick={() => setValue(value === water ? "" : water)}
                className={value === water ? "text-[var(--ink)] underline underline-offset-4" : "hover:text-[var(--ink)]"}
              >
                {water}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-[72rem] px-4 py-6 sm:px-8">
        <RiversStationTable items={filtered} flows={stationFlows} />
        <GazetteColophon />
      </div>
    </div>
  );
}
