"use client";

import dynamic from "next/dynamic";

const RiversMapView = dynamic(() => import("./RiversMapView"), {
  ssr: false,
  loading: () => (
    <div
      className="bg-[#1F2937] animate-pulse rounded-xl"
      style={{ height: "520px" }}
    />
  ),
});

export default RiversMapView;
