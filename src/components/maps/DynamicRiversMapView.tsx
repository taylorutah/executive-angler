"use client";

import dynamic from "next/dynamic";

const RiversMapView = dynamic(() => import("./RiversMapView"), {
  ssr: false,
  loading: () => (
    <div
      className="bg-[var(--paper-deep)] animate-pulse rounded-[var(--radius-card)]"
      style={{ height: "520px" }}
    />
  ),
});

export default RiversMapView;
