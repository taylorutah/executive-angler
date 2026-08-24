"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DynamicRiversMapView from "@/components/maps/DynamicRiversMapView";
import EntityListView from "@/components/ui/EntityListView";
import { FLOW_STATE_LABEL, type FlowState } from "@/lib/browse/flow-state";
import { haversineKm, NEAR_ME_KM } from "@/lib/browse/geo";
import type { RiverBrowseItem } from "@/lib/browse/river-items";
import { riverListConfig } from "@/lib/list-configs";
import type { EntityListConfig } from "@/types/list-config";
import { US_STATES } from "@/lib/us-states";
import type { River } from "@/types/entities";

interface UserLocation {
  lat: number;
  lng: number;
}

interface FlowStateRow {
  siteId: string;
  cfs: number;
  median30: number;
  state: FlowState;
}

interface RiversPageClientProps {
  items: RiverBrowseItem[];
  stateOptions: { value: string; label: string }[];
}

export default function RiversPageClient({ items, stateOptions }: RiversPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [flows, setFlows] = useState<Record<string, FlowStateRow>>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyIds, setNearbyIds] = useState<Set<string>>(new Set());
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [zipLoading, setZipLoading] = useState(false);

  const config: EntityListConfig = useMemo(
    () => ({
      ...riverListConfig,
      filters: riverListConfig.filters.map((f) =>
        f.key === "state" ? { ...f, options: stateOptions } : f,
      ),
    }),
    [stateOptions],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rivers/flow-states")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { rivers?: Record<string, FlowStateRow> } | null) => {
        if (!cancelled && data?.rivers) setFlows(data.rivers);
      })
      .catch(() => {
        /* gauges are optional — cards stay filterable on everything else */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyLocation = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setGeoError("");
    const near = new Set<string>();
    for (const item of items) {
      if (!item.latitude || !item.longitude) continue;
      if (haversineKm(lat, lng, item.latitude, item.longitude) <= NEAR_ME_KM) {
        near.add(item.riverId);
      }
    }
    setNearbyIds(near);
    const params = new URLSearchParams(searchParams.toString());
    params.set("near", "1");
    params.set("sort", "distance");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not available. Enter a ZIP code.");
      setFiltersOpen(true);
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setFiltersOpen(true);
        if (err.code === 1) {
          setGeoError(
            "Location access denied. Enter a ZIP code, or allow location in the browser.",
          );
        } else if (err.code === 2) {
          setGeoError("Location unavailable. Try a ZIP code.");
        } else {
          setGeoError("Location timed out. Try a ZIP code.");
        }
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleZipSearch = async () => {
    const zip = zipInput.trim();
    if (!zip) return;
    setZipLoading(true);
    setGeoError("");
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setGeoError("ZIP lookup needs a Mapbox token in this environment.");
        return;
      }
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(zip)}.json?country=US&types=postcode&access_token=${token}`,
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        applyLocation(lat, lng);
      } else {
        setGeoError("ZIP code not found.");
      }
    } catch {
      setGeoError("ZIP lookup failed. Try again.");
    } finally {
      setZipLoading(false);
    }
  };

  const decoratedItems = useMemo(() => {
    return items.map((item) => {
      const flow = flows[item.riverId];
      const dist =
        userLocation && item.latitude && item.longitude
          ? haversineKm(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
          : undefined;
      const flowLabel = flow ? FLOW_STATE_LABEL[flow.state] : undefined;
      return {
        ...item,
        badges: [item.badges?.[0], item.badges?.[1], flowLabel].filter(
          (v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i,
        ),
        meta: [item.meta, flowLabel].filter(Boolean).join(" · "),
        _filterValues: {
          ...(item._filterValues ?? {}),
          flow: flow?.state ?? "",
          near: nearbyIds.has(item.riverId) ? "1" : "0",
        } as Record<string, string | number>,
        _sortDistance: dist,
      };
    });
  }, [items, flows, nearbyIds, userLocation]);

  const liveValues = useMemo(() => {
    const out: Record<string, Record<string, string>> = {};
    for (const item of decoratedItems) {
      out[item.href] = {
        flow: String(item._filterValues?.flow ?? ""),
        near: String(item._filterValues?.near ?? "0"),
      };
    }
    return out;
  }, [decoratedItems]);

  const selectedStateName = searchParams.get("state") ?? "";
  const selectedStateObj = US_STATES.find((s) => s.name === selectedStateName) ?? null;

  const mapRivers: River[] = useMemo(() => {
    return decoratedItems
      .filter((item) => {
        if (searchParams.get("near") === "1" && !nearbyIds.has(item.riverId)) return false;
        if (selectedStateName && item._filterValues?.state !== selectedStateName) return false;
        return true;
      })
      .map((item) => ({
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
  }, [decoratedItems, nearbyIds, searchParams, selectedStateName]);

  return (
    <EntityListView
      items={decoratedItems}
      config={config}
      storageKey="rivers"
      liveValues={liveValues}
      filtersOpen={filtersOpen}
      onFiltersOpenChange={setFiltersOpen}
      toolbarExtra={
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wider text-[var(--text-body)]">
            Near me
          </span>
          <button
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            className="border border-[var(--action)] px-3 py-1.5 text-sm font-medium text-[var(--action)] hover:bg-[var(--action)] hover:text-[var(--on-action)] disabled:opacity-50"
          >
            {locating ? "Locating…" : "Use location"}
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleZipSearch()}
            placeholder="ZIP"
            maxLength={5}
            aria-label="ZIP code"
            className="w-24 border border-[var(--border-rule)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-body)] focus:border-[var(--signal-live)] focus:outline-none focus:ring-2 focus:ring-[var(--signal-live)]/30"
          />
          <button
            type="button"
            onClick={handleZipSearch}
            disabled={zipLoading || !zipInput.trim()}
            className="border border-[var(--border-rule)] px-3 py-1.5 text-sm text-[var(--text-body)] hover:border-[var(--action)] disabled:opacity-40"
          >
            {zipLoading ? "…" : "Go"}
          </button>
          <button
            type="button"
            aria-pressed={showMap}
            onClick={() => setShowMap((v) => !v)}
            className={`border px-3 py-1.5 text-sm font-medium ${
              showMap
                ? "border-[var(--action)] bg-[var(--action)] text-[var(--on-action)]"
                : "border-[var(--border-rule)] text-[var(--text-body)] hover:border-[var(--action)]"
            }`}
          >
            Map
          </button>
          {geoError && <p className="w-full text-sm text-[var(--state-negative)]">{geoError}</p>}
        </div>
      }
      resultsOverride={
        showMap ? (
          <div>
            <div className="h-[350px] md:h-[520px]">
              <DynamicRiversMapView
                rivers={mapRivers}
                selectedState={selectedStateObj}
                userLocation={userLocation}
                className="h-full w-full overflow-hidden"
              />
            </div>
            <p className="mt-3 text-sm text-[var(--text-body)]">
              {mapRivers.length} river{mapRivers.length === 1 ? "" : "s"} on the map
              {nearbyIds.size > 0 ? " · within about 200 miles" : ""}
            </p>
          </div>
        ) : undefined
      }
    />
  );
}
