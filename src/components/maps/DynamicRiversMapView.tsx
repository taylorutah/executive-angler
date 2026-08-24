"use client";

import dynamic from "next/dynamic";

const RiversMapView = dynamic(() => import("./RiversMapView"), {
  ssr: false,
  loading: () => (
    <div
      className="bg-[var(--surface-card)] animate-pulse rounded-xl"
      style={{ height: "520px" }}
    />
  ),
});

export default RiversMapView;
