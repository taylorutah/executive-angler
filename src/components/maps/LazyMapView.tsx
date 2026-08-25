"use client";

import { useEffect, useRef, useState } from "react";
import type DynamicMapView from "@/components/maps/DynamicMapView";

type MapProps = React.ComponentProps<typeof DynamicMapView>;

/**
 * Defers Mapbox until the map is near the viewport so LCP is the hero, not GL.
 * The map module is imported only after intersection — a static import would
 * still put mapbox-gl on the river-page graph.
 */
export default function LazyMapView(props: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [Map, setMap] = useState<typeof DynamicMapView | null>(null);

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

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    import("@/components/maps/DynamicMapView").then((mod) => {
      if (!cancelled) setMap(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  return (
    <div ref={ref}>
      {Map ? (
        <Map {...props} />
      ) : (
        <div
          className={props.className ?? "h-[400px] w-full"}
          style={{ background: props.tone === "desk" ? "var(--vellum)" : "var(--surface-card)" }}
          aria-hidden
        />
      )}
    </div>
  );
}
