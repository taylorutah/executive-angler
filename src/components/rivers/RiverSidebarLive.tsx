"use client";

import { useState } from "react";
import RiverConditionsCard from "./RiverConditionsCard";
import WaterLevelChart from "./WaterLevelChart";

interface Props {
  riverId: string;
  riverLatitude?: number | null;
  riverLongitude?: number | null;
}

export default function RiverSidebarLive({ riverId, riverLatitude, riverLongitude }: Props) {
  const [activeSiteId, setActiveSiteId] = useState<string | undefined>(undefined);

  return (
    <>
      <RiverConditionsCard
        riverId={riverId}
        riverLatitude={riverLatitude}
        riverLongitude={riverLongitude}
        onSectionChange={(siteId) => setActiveSiteId(siteId)}
      />
      <WaterLevelChart riverId={riverId} siteId={activeSiteId} />
    </>
  );
}
