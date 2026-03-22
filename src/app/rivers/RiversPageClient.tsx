"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import DynamicRiversMapView from "@/components/maps/DynamicRiversMapView";
import { US_STATES } from "@/lib/us-states";
import { DESTINATION_STATE_MAP } from "@/lib/destination-state-map";
import type { River } from "@/types/entities";

// ── Types ───────────────────────────────────────────────────────────────────

interface UserLocation {
  lat: number;
  lng: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800",
};

// ── Component ────────────────────────────────────────────────────────────────

interface RiversPageClientProps {
  rivers: River[];
}

export default function RiversPageClient({ rivers }: RiversPageClientProps) {
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyIds, setNearbyIds] = useState<Set<string>>(new Set());
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [zipLoading, setZipLoading] = useState(false);

  // Filtered + sorted rivers
  const filteredRivers = useMemo(() => {
    let result = rivers;

    if (selectedStateName) {
      result = result.filter((r) => {
        const primaryState = DESTINATION_STATE_MAP[r.destinationId ?? ""];
        if (primaryState === selectedStateName) return true;
        // Also check additional destination IDs (e.g. Green River: Wyoming + Utah)
        return (r.additionalDestinationIds ?? []).some(
          (id) => DESTINATION_STATE_MAP[id] === selectedStateName
        );
      });
    }

    if (nearbyIds.size > 0 && !selectedStateName) {
      result = [...result].sort((a, b) => {
        const aNear = nearbyIds.has(a.id) ? 0 : 1;
        const bNear = nearbyIds.has(b.id) ? 0 : 1;
        return aNear - bNear;
      });
    }

    return result;
  }, [rivers, selectedStateName, nearbyIds]);

  // Shared: given a lat/lng, find nearby rivers and zoom map
  const applyLocation = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setGeoError("");

    const withDist = rivers
      .filter((r) => r.latitude && r.longitude)
      .map((r) => ({
        ...r,
        dist: haversineKm(lat, lng, Number(r.latitude), Number(r.longitude)),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 8);

    setNearbyIds(new Set(withDist.map((r) => r.id)));
    setSelectedStateName(""); // clear state filter when using location
    setView("map");
  };

  // Near Me handler — browser geolocation
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser.");
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
        if (err.code === 1) {
          setGeoError("Location access denied. Try entering a ZIP code instead.");
        } else {
          setGeoError("Could not get location. Try a ZIP code.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // ZIP code lookup via free geocoding API
  const handleZipSearch = async () => {
    const zip = zipInput.trim();
    if (!zip) return;
    setZipLoading(true);
    setGeoError("");
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(zip)}.json?country=US&types=postcode&access_token=${token}`
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

  const selectedStateObj =
    US_STATES.find((s) => s.name === selectedStateName) ?? null;

  // Rivers to list below the map — nearby first (ordered), otherwise top filtered, capped at 8
  const MAP_LIST_LIMIT = 8;

  interface RiverWithDist extends River { dist?: number }

  const mapListRivers = useMemo((): RiverWithDist[] => {
    if (nearbyIds.size > 0 && userLocation) {
      return rivers
        .filter((r) => nearbyIds.has(r.id) && r.latitude && r.longitude)
        .map((r): RiverWithDist => ({
          ...r,
          dist: haversineKm(
            userLocation.lat,
            userLocation.lng,
            Number(r.latitude),
            Number(r.longitude)
          ),
        }))
        .sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0))
        .slice(0, MAP_LIST_LIMIT);
    }
    return filteredRivers.slice(0, MAP_LIST_LIMIT);
  }, [rivers, nearbyIds, userLocation, filteredRivers]);

  return (
    <div>
      {/* ── Controls Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-[#21262D]">
          <button
            onClick={() => setView("list")}
            className={
              view === "list"
                ? "bg-[#E8923A] text-white px-4 py-2 text-sm font-medium"
                : "bg-[#161B22] text-[#A8B2BD] px-4 py-2 text-sm font-medium hover:text-white transition-colors"
            }
          >
            ☰ List
          </button>
          <button
            onClick={() => setView("map")}
            className={
              view === "map"
                ? "bg-[#E8923A] text-white px-4 py-2 text-sm font-medium border-l border-[#21262D]"
                : "bg-[#161B22] text-[#A8B2BD] px-4 py-2 text-sm font-medium border-l border-[#21262D] hover:text-white transition-colors"
            }
          >
            🗺 Map
          </button>
        </div>

        {/* State filter */}
        <select
          value={selectedStateName}
          onChange={(e) => setSelectedStateName(e.target.value)}
          className="bg-[#161B22] border border-[#21262D] text-[#F0F6FC] rounded-lg px-3 py-2 text-sm min-w-[160px]"
        >
          <option value="">All States</option>
          {US_STATES.map((s) => (
            <option key={s.abbrev} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Near Me */}
        <button
          onClick={handleNearMe}
          disabled={locating}
          className="border border-[#E8923A] text-[#E8923A] hover:bg-[#E8923A] hover:text-white rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
        >
          {locating ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Locating…
            </span>
          ) : "📍 Near Me"}
        </button>

        {/* ZIP input */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleZipSearch()}
            placeholder="ZIP code"
            maxLength={5}
            className="bg-[#161B22] border border-[#21262D] text-[#F0F6FC] placeholder-[#6E7681] rounded-lg px-3 py-2 text-sm w-28 focus:border-[#E8923A] focus:outline-none"
          />
          <button
            onClick={handleZipSearch}
            disabled={zipLoading || !zipInput.trim()}
            className="bg-[#161B22] border border-[#21262D] text-[#A8B2BD] hover:text-[#E8923A] hover:border-[#E8923A] rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40"
          >
            {zipLoading ? "…" : "Go"}
          </button>
        </div>

        {/* Result count */}
        <span className="text-sm text-[#6E7681] ml-auto">
          {filteredRivers.length} river{filteredRivers.length !== 1 ? "s" : ""}
          {selectedStateName ? ` in ${selectedStateName}` : ""}
          {nearbyIds.size > 0 && !selectedStateName ? " · showing nearby" : ""}
        </span>
      </div>

      {/* Error message */}
      {geoError && (
        <p className="text-sm text-red-400 mb-4 -mt-2">{geoError}</p>
      )}

      {/* ── List View ────────────────────────────────────────────────────── */}
      {view === "list" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredRivers.map((river) => (
            <Link
              key={river.id}
              href={`/rivers/${river.slug}`}
              className={`group block bg-[#0D1117] rounded-xl overflow-hidden hover:shadow-lg transition-shadow${
                nearbyIds.has(river.id) ? " ring-2 ring-[#E8923A]" : ""
              }`}
            >
              <div className="relative h-36">
                <Image
                  src={river.heroImageUrl}
                  alt={river.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${
                      DIFFICULTY_STYLES[river.difficulty] ??
                      "bg-[#1F2937] text-[#A8B2BD]"
                    }`}
                  >
                    {river.difficulty}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-heading font-bold text-[#F0F6FC] text-sm leading-tight line-clamp-1 group-hover:text-[#E8923A] transition-colors">
                  {river.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-[#A8B2BD] line-clamp-1">
                  {river.primarySpecies.slice(0, 2).join(", ")}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#6E7681] capitalize">
                    {river.flowType}
                  </span>
                  <ChevronRight className="h-3 w-3 text-[#E8923A] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}

          {filteredRivers.length === 0 && (
            <div className="col-span-2 md:col-span-4 py-16 text-center text-[#6E7681]">
              No rivers found
              {selectedStateName ? ` in ${selectedStateName}` : ""}.
            </div>
          )}
        </div>
      )}

      {/* ── Map View ─────────────────────────────────────────────────────── */}
      {view === "map" && (
        <div>
          <div className="h-[350px] md:h-[520px]">
            <DynamicRiversMapView
              rivers={filteredRivers}
              selectedState={selectedStateObj}
              userLocation={userLocation}
              className="w-full h-full rounded-xl overflow-hidden"
            />
          </div>

          {/* Rivers below the map */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#F0F6FC]">
                {nearbyIds.size > 0 && userLocation
                  ? "Nearest Rivers"
                  : selectedStateName
                  ? `Rivers in ${selectedStateName}`
                  : "Rivers"}
              </h3>
              {filteredRivers.length > MAP_LIST_LIMIT && (
                <span className="text-xs text-[#6E7681]">
                  Showing {mapListRivers.length} of {filteredRivers.length} —{" "}
                  <button
                    onClick={() => setView("list")}
                    className="text-[#E8923A] hover:underline"
                  >
                    view all
                  </button>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mapListRivers.map((river) => (
                <Link
                  key={river.id}
                  href={`/rivers/${river.slug}`}
                  className="group block bg-[#161B22] rounded-xl overflow-hidden hover:shadow-lg transition-shadow ring-1 ring-[#21262D] hover:ring-[#E8923A]"
                >
                  <div className="relative h-28">
                    <Image
                      src={river.heroImageUrl}
                      alt={river.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {river.dist != null && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/60 text-[#E8923A] text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                          {Math.round(river.dist)} km
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-heading font-bold text-[#F0F6FC] text-xs leading-tight line-clamp-1 group-hover:text-[#E8923A] transition-colors">
                      {river.name}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-[#A8B2BD] line-clamp-1">
                      {river.primarySpecies.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
