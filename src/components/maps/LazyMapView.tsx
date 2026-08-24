"use client";

import { useEffect, useRef, useState } from "react";
import DynamicMapView from "@/components/maps/DynamicMapView";

type MapProps = React.ComponentProps<typeof DynamicMapView>;

/**
 * Defers Mapbox until the map is near the viewport so LCP is the hero, not GL.
 */
export default function LazyMapView(props: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <DynamicMapView {...props} />
      ) : (
        <div
          className={props.className ?? "h-[400px] w-full rounded-xl"}
          style={{ background: "var(--vellum)" }}
          aria-hidden
        />
      )}
    </div>
  );
}
