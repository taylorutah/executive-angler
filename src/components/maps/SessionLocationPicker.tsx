"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface SessionLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onChange: (lat: number, lng: number) => void;
}

export default function SessionLocationPicker({
  initialLat,
  initialLng,
  onChange,
}: SessionLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  type MapStyle = "outdoors" | "rivers" | "satellite";
  const [mapStyle, setMapStyle] = useState<MapStyle>("outdoors");

  const [coords, setCoords] = useState({
    lat: initialLat ?? 40.5,
    lng: initialLng ?? -111.5,
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#8B949E;border-radius:0.5rem;font-size:0.875rem;border:1px solid #21262D">Map unavailable — missing token</div>';
      }
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [coords.lng, coords.lat],
        zoom: 13,
      });

      marker.current = new mapboxgl.Marker({
        color: "#E8923A",
        draggable: true,
      })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map.current);

      marker.current.on("dragend", () => {
        const lngLat = marker.current!.getLngLat();
        setCoords({ lat: lngLat.lat, lng: lngLat.lng });
        onChange(lngLat.lat, lngLat.lng);
      });

      map.current.on("click", (e) => {
        const { lat, lng } = e.lngLat;
        marker.current?.setLngLat([lng, lat]);
        setCoords({ lat, lng });
        onChange(lat, lng);
      });
    } catch (e) {
      console.error("Mapbox failed to initialize:", e);
      if (mapContainer.current) {
        mapContainer.current.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#161B22;color:#8B949E;border-radius:0.5rem;font-size:0.875rem;border:1px solid #21262D">Map unavailable</div>';
      }
    }

    return () => {
      map.current?.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Switch map style
  useEffect(() => {
    if (!map.current) return;
    const styles: Record<MapStyle, string> = {
      outdoors: "mapbox://styles/mapbox/outdoors-v12",
      rivers: "mapbox://styles/mapbox/navigation-day-v1",
      satellite: "mapbox://styles/mapbox/satellite-streets-v12",
    };
    map.current.setStyle(styles[mapStyle]);
    map.current.once("style.load", () => {
      if (marker.current && map.current) {
        marker.current.addTo(map.current);
      }
    });
  }, [mapStyle]);

  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      setCoords({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const formatCoord = (value: number, isLat: boolean) => {
    const abs = Math.abs(value);
    const dir = isLat ? (value >= 0 ? "N" : "S") : (value >= 0 ? "E" : "W");
    return `${abs.toFixed(4)}° ${dir}`;
  };

  return (
    <div>
      <div className="relative">
        <div ref={mapContainer} className="h-[240px] w-full rounded-lg" />
        {/* Style toggle — cycles: outdoors → rivers → satellite */}
        <div className="absolute top-2 right-2 z-10 flex rounded-md overflow-hidden shadow-md" style={{ border: "1px solid rgba(0,0,0,0.15)" }}>
          {(["outdoors", "rivers", "satellite"] as MapStyle[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setMapStyle(s)}
              className="px-2 py-1.5 text-[11px] font-semibold transition-colors"
              style={{
                background: mapStyle === s ? "#E8923A" : "rgba(255,255,255,0.92)",
                color: mapStyle === s ? "#fff" : "#161B22",
              }}
            >
              {s === "outdoors" ? "🗺" : s === "rivers" ? "🌊" : "🛰"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-[#484F58] font-['IBM_Plex_Mono']">
        {formatCoord(coords.lat, true)}, {formatCoord(coords.lng, false)}
      </p>
    </div>
  );
}
