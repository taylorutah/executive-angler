"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Marker {
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color?: string;
}

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Marker[];
  className?: string;
  bounds?: { sw: [number, number]; ne: [number, number] };
  /** Vellum land / Teal water — the desk two-tone. */
  tone?: "default" | "desk";
  /** GPS track as [lat, lng] pairs, drawn as a single line. */
  route?: number[][];
}

function applyDeskPalette(map: mapboxgl.Map) {
  const styles = getComputedStyle(document.documentElement);
  const land = styles.getPropertyValue("--vellum").trim() || "#F2EDE4";
  const water = styles.getPropertyValue("--teal-700").trim() || "#0E7C93";

  const style = map.getStyle();
  for (const layer of style.layers ?? []) {
    const id = layer.id.toLowerCase();
    try {
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", land);
      }
      if (
        layer.type === "fill" &&
        (id.includes("land") || id.includes("landuse") || id.includes("landcover") || id.includes("park"))
      ) {
        map.setPaintProperty(layer.id, "fill-color", land);
      }
      if (layer.type === "fill" && (id.includes("water") || id.includes("ocean"))) {
        map.setPaintProperty(layer.id, "fill-color", water);
      }
      if (layer.type === "line" && (id.includes("water") || id.includes("waterway"))) {
        map.setPaintProperty(layer.id, "line-color", water);
      }
    } catch {
      // Layer paint property not applicable — skip.
    }
  }
}

export default function MapView({
  latitude,
  longitude,
  zoom = 10,
  markers = [],
  className = "h-[400px] w-full overflow-hidden",
  bounds,
  tone = "default",
  route = [],
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // The pan hint is only true once a map actually exists to pan.
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      if (mapContainer.current) {
        const bg = tone === "desk" ? "var(--vellum)" : "var(--surface-card)";
        const fg = "var(--text-meta)";
        mapContainer.current.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:${bg};color:${fg};font-size:0.875rem">Map unavailable</div>`;
      }
      return;
    }

        mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: tone === "desk"
          ? "mapbox://styles/mapbox/light-v11"
          : "mapbox://styles/mapbox/outdoors-v12",
        center: [longitude, latitude],
        zoom,
        // Required for mobile Safari WebGL stability
        preserveDrawingBuffer: true,
        antialias: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Resize after map loads — fixes 0-dimension init on mobile Safari
      map.current.on("load", () => {
        map.current?.resize();
        setLive(true);
        if (tone === "desk" && map.current) applyDeskPalette(map.current);

        // Require 2 fingers to pan on touch devices
        const canvas = map.current!.getCanvas();
        canvas.addEventListener("touchstart", (e) => {
          if (e.touches.length < 2) {
            map.current!.dragPan.disable();
          } else {
            map.current!.dragPan.enable();
          }
        });
        canvas.addEventListener("touchend", () => {
          map.current!.dragPan.enable(); // re-enable after lift
        });

        const routeStyles = getComputedStyle(document.documentElement);

        if (route.length >= 2 && map.current) {
          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: route.map((p) => [p[1], p[0]]) },
            },
          });
          map.current.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color":
                routeStyles.getPropertyValue(tone === "desk" ? "--teal-700" : "--copper-400").trim() ||
                "#0C7286",
              "line-width": 3,
            },
          });
        }

        // Add markers after load for reliable placement on mobile
        markers.forEach((marker) => {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div><strong>${marker.title}</strong>${
              marker.description ? `<p style="margin-top:4px;color:#A8B2BD">${marker.description}</p>` : ""
            }</div>`
          );

          const styles = getComputedStyle(document.documentElement);
          const deskMarker = styles.getPropertyValue("--teal-700").trim() || "#0C7286";
          new mapboxgl.Marker({
            color: marker.color || (tone === "desk" ? deskMarker : "#E8923A"),
          })
            .setLngLat([marker.longitude, marker.latitude])
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Fit bounds if provided (bounds data is [lat, lng], Mapbox needs [lng, lat])
        if (bounds) {
          map.current!.fitBounds(
            [[bounds.sw[1], bounds.sw[0]], [bounds.ne[1], bounds.ne[0]]],
            { padding: 50, maxZoom: 12 }
          );
        } else if (markers.length + route.length > 1) {
          const markerBounds = new mapboxgl.LngLatBounds();
          markers.forEach((m) => markerBounds.extend([m.longitude, m.latitude]));
          route.forEach((p) => markerBounds.extend([p[1], p[0]]));
          map.current!.fitBounds(markerBounds, { padding: 50, maxZoom: 14 });
        }
      });

      // ResizeObserver keeps map sized correctly as layout shifts on mobile
      const ro = new ResizeObserver(() => {
        map.current?.resize();
      });
      if (mapContainer.current) ro.observe(mapContainer.current);

      const cleanup = () => {
        ro.disconnect();
        map.current?.remove();
      };

      return cleanup;
    } catch (e) {
      console.error("Mapbox failed to initialize:", e);
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1F2937;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem">Map unavailable</div>';
      }
    }

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, zoom, markers, bounds, tone, route]);

  return (
    <div className="relative">
      <div ref={mapContainer} className={className} />
      {live && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white/60 text-xs px-2 py-1 rounded-full pointer-events-none">
          Two fingers to pan
        </div>
      )}
    </div>
  );
}
