"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { River } from "@/types/entities";

interface SelectedState {
  center: [number, number];
  zoom: number;
  name: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface RiversMapViewProps {
  rivers: River[];
  selectedState: SelectedState | null;
  userLocation: UserLocation | null;
  className?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export default function RiversMapView({
  rivers,
  selectedState,
  userLocation,
  className = "w-full rounded-xl overflow-hidden",
}: RiversMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const initializedRef = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || initializedRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1F2937;color:#8B949E;border-radius:0.75rem;font-size:0.875rem">Map unavailable</div>';
      }
      return;
    }

    mapboxgl.accessToken = token;
    initializedRef.current = true;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-96, 39],
        zoom: 3.5,
        preserveDrawingBuffer: true,
        antialias: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        map.current?.resize();
        addRiverMarkers(rivers);
      });

      // ResizeObserver keeps map sized correctly as layout shifts on mobile
      const ro = new ResizeObserver(() => {
        map.current?.resize();
      });
      if (mapContainer.current) ro.observe(mapContainer.current);

      return () => {
        ro.disconnect();
        map.current?.remove();
        map.current = null;
        initializedRef.current = false;
      };
    } catch (e) {
      console.error("Mapbox failed to initialize:", e);
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1F2937;color:#8B949E;border-radius:0.75rem;font-size:0.875rem">Map unavailable</div>';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: add river markers
  function addRiverMarkers(riverList: River[]) {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    riverList.forEach((river) => {
      if (!river.latitude || !river.longitude) return;

      const size = river.featured ? 16 : 12;

      // Custom HTML marker: copper circle with white dot center
      const el = document.createElement("div");
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: #E8923A;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        transition: transform 0.15s ease;
      `;
      el.innerHTML = `<div style="width:${Math.round(size * 0.3)}px;height:${Math.round(size * 0.3)}px;border-radius:50%;background:white;"></div>`;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.3)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      const difficultyColor = DIFFICULTY_COLORS[river.difficulty] ?? "#8B949E";
      const speciesList = river.primarySpecies.slice(0, 3).join(", ");

      const popup = new mapboxgl.Popup({
        offset: 16,
        closeButton: true,
        maxWidth: "260px",
      }).setHTML(`
        <div style="background:#161B22;border-radius:8px;padding:12px;color:#F0F6FC;font-family:sans-serif;">
          <a href="/rivers/${river.slug}" style="color:#E8923A;font-weight:700;font-size:15px;text-decoration:none;display:block;margin-bottom:6px;">${river.name}</a>
          <div style="font-size:12px;color:#8B949E;margin-bottom:6px;">${speciesList}</div>
          <span style="display:inline-block;background:${difficultyColor}22;color:${difficultyColor};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;padding:2px 8px;border-radius:999px;">${river.difficulty}</span>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([river.longitude, river.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }

  // Re-add markers when rivers list changes (after map is initialized)
  useEffect(() => {
    if (!map.current) return;

    // If map is loaded, add immediately; otherwise wait for load event
    if (map.current.isStyleLoaded()) {
      addRiverMarkers(rivers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rivers]);

  // Fly to selected state
  useEffect(() => {
    if (!map.current || !selectedState) return;
    map.current.flyTo({
      center: selectedState.center,
      zoom: selectedState.zoom,
      speed: 1.2,
    });
  }, [selectedState]);

  // Add/update user location marker
  useEffect(() => {
    if (!map.current) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    const el = document.createElement("div");
    el.style.cssText = `
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #3B82F6;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.4);
    `;

    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
  }, [userLocation]);

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ height: "350px" }}
      // Responsive height via Tailwind in parent, but set a sensible default here
    />
  );
}
