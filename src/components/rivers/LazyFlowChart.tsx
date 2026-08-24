"use client";

import dynamic from "next/dynamic";
import LazyHydrate from "@/components/ui/LazyHydrate";

const FlowChart = dynamic(() => import("./FlowChart"), {
  ssr: false,
  loading: () => <div className="h-[280px] rounded-xl bg-[var(--surface-card)]" aria-hidden />,
});

type Props = React.ComponentProps<typeof FlowChart>;

export default function LazyFlowChart(props: Props) {
  return (
    <LazyHydrate minHeight={280}>
      <FlowChart {...props} />
    </LazyHydrate>
  );
}
