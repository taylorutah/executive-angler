"use client";

import RiverConditionsCard from "./RiverConditionsCard";

interface Props {
  riverId: string;
  riverLatitude?: number | null;
  riverLongitude?: number | null;
  children?: React.ReactNode;
}

/**
 * Dusk instrument band at full content width. Live readings stay dusk
 * even on a Daylight river page — the desk's one memorable switch.
 */
export default function RiverLiveInset({
  riverId,
  riverLatitude,
  riverLongitude,
  children,
}: Props) {
  return (
    <section className="register-dusk bg-[var(--surface-page)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <RiverConditionsCard
          riverId={riverId}
          riverLatitude={riverLatitude}
          riverLongitude={riverLongitude}
          layout="band"
        />
        {children}
      </div>
    </section>
  );
}
