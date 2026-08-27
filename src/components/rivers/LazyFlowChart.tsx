"use client";

import { useEffect, useState, type ComponentType } from "react";
import LazyHydrate from "@/components/ui/LazyHydrate";

type FlowChartProps = {
  usgsGaugeId: string | null;
  riverName: string;
  riverId: string;
};

/**
 * Chart JS + /api/river-history stay off the first paint. next/dynamic at
 * module scope still preloads the chunk; import only after LazyHydrate.
 */
export default function LazyFlowChart(props: FlowChartProps) {
  return (
    <LazyHydrate minHeight={280} rootMargin="80px">
      <DeferredFlowChart {...props} />
    </LazyHydrate>
  );
}

function DeferredFlowChart(props: FlowChartProps) {
  const [Chart, setChart] = useState<ComponentType<FlowChartProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./FlowChart").then((mod) => {
      if (!cancelled) setChart(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Chart) {
    return <div className="h-[280px] rounded-xl bg-[var(--surface-card)]" aria-hidden />;
  }
  return <Chart {...props} />;
}
