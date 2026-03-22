"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { parseLocalDate } from "@/lib/date";

interface FishingSession {
  id: string;
  river_name?: string;
  location?: string;
  date: string;
  total_fish?: number;
  latitude?: number;
  longitude?: number;
}

interface JournalMapViewProps {
  sessions: FishingSession[];
  /** compact=true → 280px panel above session list. false/undefined → full-height standalone map */
  compact?: boolean;
}

export default function JournalMapView({ sessions, compact = false }: JournalMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem;border:1px solid #21262D">Map unavailable — missing Mapbox token</div>';
      }
      return;
    }

    // Filter to sessions with coordinates
    const sessionsWithCoords = sessions.filter(
      (s) => s.latitude !== undefined && s.longitude !== undefined
    );

    if (sessionsWithCoords.length === 0) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem;border:1px solid #21262D">No sessions with map locations yet</div>';
      }
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-111.5, 40.5], // Default center (Utah)
        zoom: 6,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add markers for each session
      sessionsWithCoords.forEach((session) => {
        const { latitude, longitude } = session;
        if (!latitude || !longitude) return;

        const parsedDate = parseLocalDate(session.date);
        const formattedDate = parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const popupHTML = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 160px;">
            <div style="font-weight: 600; color: #0D1117; margin-bottom: 4px;">
              ${session.river_name || session.location || "Session"}
            </div>
            <div style="font-size: 12px; color: #A8B2BD; margin-bottom: 6px;">
              ${formattedDate}
            </div>
            ${
              session.total_fish
                ? `<div style="font-size: 13px; color: #E8923A; margin-bottom: 8px;">🐟 ${session.total_fish}</div>`
                : ""
            }
            <a href="/journal/${session.id}"
               style="display: inline-block; font-size: 12px; color: #E8923A; font-weight: 500; text-decoration: none; border-bottom: 1px solid #E8923A;">
              View →
            </a>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
        }).setHTML(popupHTML);

        const markerEl = new mapboxgl.Marker({
          color: "#E8923A",
        })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current!);

        // Handle click navigation
        markerEl.getElement().addEventListener("click", () => {
          popup.addTo(map.current!);
        });
      });

      // Fit bounds to show all markers
      if (sessionsWithCoords.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        sessionsWithCoords.forEach((s) => {
          if (s.latitude && s.longitude) {
            bounds.extend([s.longitude, s.latitude]);
          }
        });
        map.current.fitBounds(bounds, {
          padding: 60,
          maxZoom: 12,
        });
      }
    } catch (e) {
      console.error("Mapbox failed to initialize:", e);
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#A8B2BD;border-radius:0.75rem;font-size:0.875rem;border:1px solid #21262D">Map unavailable</div>';
      }
    }

    return () => {
      map.current?.remove();
    };
  }, [sessions, router]);

  return (
    <div
      ref={mapContainer}
      className={compact ? "h-[280px] w-full" : "h-64 lg:h-[calc(100vh-5rem)] w-full rounded-xl overflow-hidden border border-[#21262D]"}
    />
  );
}
