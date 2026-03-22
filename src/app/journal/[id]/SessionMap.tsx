"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/maps/MapView"), { ssr: false });

// Known river coordinates for Taylor's home waters
const RIVER_COORDS: Record<string, [number, number]> = {
  "Middle Provo": [40.618, -111.205],
  "Upper Provo": [40.71, -111.09],
  "Lower Provo": [40.49, -111.42],
  "Provo River": [40.618, -111.205],
  "Little Cottonwood": [40.574, -111.81],
  "Little Cottonwood Creek": [40.574, -111.81],
  "Big Cottonwood": [40.625, -111.79],
  "Big Cottonwood Creek": [40.625, -111.79],
  "Smith Morehouse Creek": [40.817, -111.136],
  "Madison River": [44.65, -111.33],
  "Ham's Fork": [41.87, -110.73],
};

const LOCATION_COORDS: Record<string, [number, number]> = {
  "Below Jordanelle": [40.617, -111.205],
  "Victory Walk-in Access": [40.591, -111.291],
  "River Road North": [40.637, -111.185],
  "River Road South": [40.601, -111.218],
  "Below Deercreek": [40.382, -111.533],
  "Above Slide Inn": [44.709, -111.318],
  "Three Dollar Bridge": [44.645, -111.323],
  "Riverbend Trailer Park Area": [44.66, -111.321],
};

interface Props {
  riverName: string | null;
  location: string | null;
  catches: unknown[];
}

export default function SessionMap({ riverName, location }: Props) {
  let center: [number, number] | null = null;

  // Try location-specific coords first, then river
  if (location) {
    const key = Object.keys(LOCATION_COORDS).find((k) =>
      location.toLowerCase().includes(k.toLowerCase())
    );
    if (key) center = LOCATION_COORDS[key];
  }

  if (!center && riverName) {
    const key = Object.keys(RIVER_COORDS).find((k) =>
      riverName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(riverName.toLowerCase())
    );
    if (key) center = RIVER_COORDS[key];
  }

  if (!center) return null;

  const markers = [
    {
      latitude: center[0],
      longitude: center[1],
      title: location || riverName || "Session",
      description: riverName || "",
      color: "#2d5a27",
    },
  ];

  return (
    <div className="rounded-xl bg-[#161B22] p-6 shadow-sm">
      <h2 className="font-heading text-xl font-semibold text-[#E8923A] mb-4 flex items-center gap-2">
        <span>📍</span> Location
      </h2>
      <p className="text-sm text-[#A8B2BD] mb-3">
        {riverName}{location ? ` — ${location}` : ""}
      </p>
      <MapView
        latitude={center[0]}
        longitude={center[1]}
        zoom={12}
        markers={markers}
        className="h-64 w-full rounded-xl overflow-hidden"
      />
      <p className="text-xs text-[#6E7681] mt-2">
        GPS catch pins coming with Apple Watch integration.
      </p>
    </div>
  );
}
