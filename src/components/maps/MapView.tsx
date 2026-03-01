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

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [longitude, latitude],
      zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers
    markers.forEach((marker) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div><strong>${marker.title}</strong>${
          marker.description ? `<p class="mt-1 text-slate-600">${marker.description}</p>` : ""
        }</div>`
      );

      new mapboxgl.Marker({ color: marker.color || "#1B4332" })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Fit bounds if provided (bounds data is [lat, lng], Mapbox needs [lng, lat])
    if (bounds) {
      map.current.fitBounds(
        [[bounds.sw[1], bounds.sw[0]], [bounds.ne[1], bounds.ne[0]]],
        { padding: 50, maxZoom: 12 }
      );
    } else if (markers.length > 1) {
      const markerBounds = new mapboxgl.LngLatBounds();
      markers.forEach((m) => markerBounds.extend([m.longitude, m.latitude]));
      map.current.fitBounds(markerBounds, { padding: 50, maxZoom: 12 });
    }

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, zoom, markers, bounds]);

  return <div ref={mapContainer} className={className} />;
}
