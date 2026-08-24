"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-[var(--vellum)]" />
  ),
});

export default MapView;
