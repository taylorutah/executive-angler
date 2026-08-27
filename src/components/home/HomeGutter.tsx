import type { ReactNode } from "react";

/** 80px gutters at 1440. Matches Home / 1440 frames. */
export default function HomeGutter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`w-full px-5 sm:px-8 xl:px-20 ${className}`}>{children}</div>;
}
