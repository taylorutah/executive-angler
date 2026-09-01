"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <p className="font-ui text-sm text-[var(--text-3)]">Map loading…</p>
  ),
});

export default MapView;
