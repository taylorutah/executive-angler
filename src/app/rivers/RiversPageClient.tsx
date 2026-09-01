"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DynamicRiversMapView from "@/components/maps/DynamicRiversMapView";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import RiversStationTable, { type StationFlow } from "@/components/rivers/RiversStationTable";
import type { FlowState } from "@/lib/browse/flow-state";
import type { RiverBrowseItem } from "@/lib/browse/river-items";
import type { River } from "@/types/entities";

type View = "table" | "photos" | "map";

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

interface RiversPageClientProps {
  items: RiverBrowseItem[];
  stateOptions: { value: string; label: string }[];
}

export default function RiversPageClient({ items }: RiversPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<View>("table");
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

  const mapRivers: River[] = useMemo(() => {
    return filtered.map((item) => ({
      id: item.riverId,
      slug: item.href.replace("/rivers/", ""),
      name: item.title,
      destinationId: "",
      description: item.description ?? "",
      heroImageUrl: item.imageUrl,
      flowType: String(item._filterValues?.waterType ?? ""),
      difficulty: (item._filterValues?.difficulty as River["difficulty"]) ?? "intermediate",
      wadingType: "wade",
      primarySpecies: item.tags ?? [],
      accessPoints: [],
      bestMonths: [],
      latitude: item.latitude,
      longitude: item.longitude,
      featured: Boolean(item.featured),
    }));
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Search rivers</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a river"
            className="ea-search-underline"
          />
        </label>
        <div className="flex flex-wrap gap-x-4 gap-y-2 font-ui text-[12px] uppercase tracking-[0.12em]">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={
                filter === f.key
                  ? "text-[var(--ink)] underline decoration-[var(--ink)] underline-offset-4"
                  : "text-[var(--text-3)] hover:text-[var(--ink)]"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-3)]">
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
        <button
          type="button"
          onClick={() => setView("map")}
          className={view === "map" ? "text-[var(--ink)] underline underline-offset-4" : "hover:text-[var(--ink)]"}
        >
          Map
        </button>
        <span className="num ml-auto">{filtered.length}</span>
      </div>

      {view === "table" && <RiversStationTable items={filtered} flows={stationFlows} />}

      {view === "photos" && (
        <ul className="grid grid-cols-2 border-t border-l border-[var(--border)] sm:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.riverId} className="border-b border-r border-[var(--border)]">
              <Link href={item.href} className="block p-3">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--paper-deep)]">
                  {item.imageUrl ? (
                    <SafeEntityImage
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title}
                      title={item.title}
                      className="object-cover"
                      sizes="33vw"
                    />
                  ) : null}
                </div>
                <p className="mt-2 font-display text-[16px] font-semibold text-[var(--ink)]">
                  {item.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {view === "map" && (
        <div>
          <div className="h-[350px] overflow-hidden border border-[var(--border)] md:h-[520px]">
            <DynamicRiversMapView
              rivers={mapRivers}
              selectedState={null}
              userLocation={null}
              className="h-full w-full overflow-hidden"
            />
          </div>
          <p className="mt-3 font-ui text-[13px] text-[var(--text-3)]">
            {mapRivers.length} river{mapRivers.length === 1 ? "" : "s"} on the map
          </p>
        </div>
      )}
    </div>
  );
}
