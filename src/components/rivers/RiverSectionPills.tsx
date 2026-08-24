"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Radio } from "lucide-react";
import { fetchOnce } from "./fetch-once";

/**
 * iOS / Android parity: horizontal pill picker for rivers with multiple
 * USGS gauge sections (Provo Upper / Middle / Lower / Canyon, etc.).
 *
 * Only renders when the river has ≥ 2 gauges. Selection is reflected in
 * the URL as `?section=<siteId>` so downstream client components
 * (FlowChart, RiverConditionsCard) can read the same state via
 * `useSearchParams()`. We default to the first gauge when nothing is
 * pinned yet — matching native.
 */

interface GaugeOption {
  site_id: string;
  name: string;
  section: string;
}

interface Props {
  riverId: string;
}

export default function RiverSectionPills({ riverId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedFromUrl = searchParams.get("section");

  const [gauges, setGauges] = useState<GaugeOption[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchOnce(`/api/river-conditions/${riverId}`);
        if (!res.ok) {
          if (!cancelled) setGauges([]);
          return;
        }
        const data = await res.json();
        // `/api/river-conditions/<id>` returns GaugeReading[] with siteId/siteName/section.
        // Normalize to the lightweight shape used by pills.
        interface GaugeReadingShape {
          siteId?: string;
          site_id?: string;
          siteName?: string;
          name?: string;
          section?: string;
        }
        const list: GaugeOption[] = (data?.gauges ?? []).map((g: GaugeReadingShape) => ({
          site_id: String(g.siteId ?? g.site_id ?? ""),
          name: String(g.siteName ?? g.name ?? ""),
          section: String(g.section ?? ""),
        }));
        if (!cancelled) setGauges(list);
      } catch {
        if (!cancelled) setGauges([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [riverId]);

  const setSection = useCallback(
    (siteId: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("section", siteId);
      // `scroll: false` keeps the angler in place — the picker is above
      // the fold but the Flow chart / Fishability card are the real
      // consumers, so we don't want a jarring scroll-to-top.
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Loading or no multi-gauge river — render nothing (no layout shift penalty
  // because server already painted the hero + breadcrumbs beside us).
  if (!gauges || gauges.length < 2) return null;

  const activeSiteId = selectedFromUrl || gauges[0].site_id;

  return (
    <div className="bg-[var(--surface-page)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div
          className="flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="River section"
        >
          {gauges.map((g) => {
            const isSelected = g.site_id === activeSiteId;
            const label = g.section && g.section.trim().length > 0 ? g.section : g.name;
            return (
              <button
                key={g.site_id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSection(g.site_id)}
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  isSelected
                    ? "bg-[var(--action)]/[0.18] border-[var(--action)]/55 text-[var(--text-primary)]"
                    : "bg-[var(--surface-raised)] border-[var(--border-strong)] text-[var(--text-body)] hover:text-[var(--text-primary)] hover:border-[var(--action)]/40",
                ].join(" ")}
              >
                <Radio
                  className={`h-3 w-3 ${isSelected ? "text-[var(--action)]" : "text-[var(--text-meta)]"}`}
                />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
