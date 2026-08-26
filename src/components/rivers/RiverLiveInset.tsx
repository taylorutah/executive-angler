"use client";

import RiverConditionsCard from "./RiverConditionsCard";

interface Props {
  riverId: string;
  riverLatitude?: number | null;
  riverLongitude?: number | null;
  children?: React.ReactNode;
}

/**
 * Contained Dusk instrument on a Daylight page. The section keeps the
 * paper ground; .register-dusk lives on the inset panel — radiused,
 * edged, shadowed — the way an instrument sits on a desk.
 */
export default function RiverLiveInset({
  riverId,
  riverLatitude,
  riverLongitude,
  children,
}: Props) {
  return (
    <section className="bg-[var(--surface-page)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="register-dusk rounded-xl border border-[var(--border-rule)] bg-[var(--surface-page)] p-6 shadow-[var(--elev-4)] sm:p-8">
          <RiverConditionsCard
            riverId={riverId}
            riverLatitude={riverLatitude}
            riverLongitude={riverLongitude}
            layout="band"
          />
          {children}
        </div>
      </div>
    </section>
  );
}
