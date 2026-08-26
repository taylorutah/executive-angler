"use client";

import dynamic from "next/dynamic";
import LazyHydrate from "@/components/ui/LazyHydrate";

const FlowChart = dynamic(() => import("./FlowChart"), {
  ssr: false,
  loading: () => (
    <div className="mt-6 h-[200px] border-t border-[var(--border-rule)] pt-5" aria-hidden>
      <div className="h-8 w-40 bg-[var(--border-rule)]" />
    </div>
  ),
});

type Props = React.ComponentProps<typeof FlowChart>;

export default function LazyFlowChart(props: Props) {
  return (
    <LazyHydrate minHeight={200}>
      <FlowChart {...props} />
    </LazyHydrate>
  );
}
