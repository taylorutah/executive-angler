"use client";

import { useRef, useEffect } from "react";
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
}

export default function MapView({
  latitude,
  longitude,
  zoom = 10,
  markers = [],
  className = "h-[400px] w-full rounded-xl overflow-hidden",
  bounds,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1F2937;color:#8B949E;border-radius:0.75rem;font-size:0.875rem">Map unavailable</div>';
      }
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
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

        // Add markers after load for reliable placement on mobile
        markers.forEach((marker) => {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div><strong>${marker.title}</strong>${
              marker.description ? `<p style="margin-top:4px;color:#8B949E">${marker.description}</p>` : ""
            }</div>`
          );

          new mapboxgl.Marker({ color: marker.color || "#E8923A" })
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
        } else if (markers.length > 1) {
          const markerBounds = new mapboxgl.LngLatBounds();
          markers.forEach((m) => markerBounds.extend([m.longitude, m.latitude]));
          map.current!.fitBounds(markerBounds, { padding: 50, maxZoom: 12 });
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
        mapContainer.current.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1F2937;color:#8B949E;border-radius:0.75rem;font-size:0.875rem">Map unavailable</div>';
      }
    }

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, zoom, markers, bounds]);

  return (
    <div className="relative">
      <div ref={mapContainer} className={className} />
      <div className="absolute bottom-2 right-2 bg-black/50 text-white/60 text-xs px-2 py-1 rounded-full pointer-events-none">
        Two fingers to pan
      </div>
    </div>
  );
}
