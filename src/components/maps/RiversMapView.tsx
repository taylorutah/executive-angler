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
  // Always-current rivers ref — avoids stale closure in on('load')
  const riversRef = useRef<River[]>(rivers);

  // Keep ref in sync with prop on every render
  riversRef.current = rivers;

  // ── Initialize map (once) ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || initializedRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1F2937;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem">Map unavailable</div>';
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
        // Use ref so we always get the latest rivers, not the stale closure value
        addRiverMarkers(riversRef.current);
      });

      const ro = new ResizeObserver(() => map.current?.resize());
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
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1F2937;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem">Map unavailable</div>';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render markers when rivers prop changes ──────────────────────────
  useEffect(() => {
    if (!map.current) return;
    if (map.current.isStyleLoaded()) {
      addRiverMarkers(rivers);
    } else {
      // Style not ready yet — on('load') above will handle it via riversRef
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rivers]);

  // ── Marker renderer ─────────────────────────────────────────────────────
  function addRiverMarkers(riverList: River[]) {
    if (!map.current) return;

    // Clear existing river markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    riverList.forEach((river) => {
      const lat = Number(river.latitude);
      const lng = Number(river.longitude);
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      const size = river.featured ? 16 : 12;

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
        box-shadow: 0 1px 4px rgba(0,0,0,0.5);
        transition: transform 0.15s ease;
      `;
      el.innerHTML = `<div style="width:${Math.round(size * 0.35)}px;height:${Math.round(size * 0.35)}px;border-radius:50%;background:white;pointer-events:none;"></div>`;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.4)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

      const difficultyColor = DIFFICULTY_COLORS[river.difficulty] ?? "#A8B2BD";
      const speciesList = (river.primarySpecies ?? []).slice(0, 3).join(", ");

      const popup = new mapboxgl.Popup({ offset: 18, closeButton: true, maxWidth: "260px" })
        .setHTML(`
          <div style="background:#161B22;border-radius:8px;padding:12px;color:#F0F6FC;font-family:sans-serif;">
            <a href="/rivers/${river.slug}" style="color:#E8923A;font-weight:700;font-size:14px;text-decoration:none;display:block;margin-bottom:5px;">${river.name}</a>
            <div style="font-size:11px;color:#A8B2BD;margin-bottom:6px;">${speciesList}</div>
            <span style="display:inline-block;background:${difficultyColor}22;color:${difficultyColor};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;padding:2px 7px;border-radius:999px;">${river.difficulty ?? ""}</span>
            <a href="/rivers/${river.slug}" style="display:block;margin-top:8px;font-size:11px;color:#E8923A;text-decoration:none;">View River →</a>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }

  // ── Fly to selected state ───────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !selectedState) return;
    const fly = () => map.current?.flyTo({ center: selectedState.center, zoom: selectedState.zoom, speed: 1.2 });
    if (map.current.isStyleLoaded()) {
      fly();
    } else {
      map.current.once("load", fly);
    }
  }, [selectedState]);

  // ── User location marker + fly ──────────────────────────────────────────
  useEffect(() => {
    if (!map.current) return;

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (!userLocation) return;

    const el = document.createElement("div");
    el.style.cssText = `
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #00B4D8;
      border: 3px solid white;
      box-shadow: 0 0 0 5px rgba(0,180,216,0.3);
    `;

    const addMarker = () => {
      if (!map.current) return;
      userMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      map.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 7, speed: 1.4 });
    };

    if (map.current.isStyleLoaded()) {
      addMarker();
    } else {
      map.current.once("load", addMarker);
    }
  }, [userLocation]);

  return <div ref={mapContainer} className={className} />;
}
