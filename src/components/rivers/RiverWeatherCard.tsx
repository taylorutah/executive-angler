"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface WeatherData {
  tempF: number;
  feelsLikeF: number;
  humidity: number;
  windMph: number;
  windDirection: number;
  windDirectionLabel: string;
  weatherCode: number;
  weatherLabel: string;
  weatherIcon: string;
  pressureHpa: number;
  pressureMb: number;
  pressureInHg: number;
  fetchedAt: string;
}

interface WeatherSection {
  section: string;
  latitude: number;
  longitude: number;
  weather: WeatherData;
}

interface Props {
  riverId: string;
  riverLatitude: number;
  riverLongitude: number;
}

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export default function RiverWeatherCard({ riverId }: Props) {
  const [sections, setSections] = useState<WeatherSection[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/river-weather/${riverId}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        if (!cancelled && data.sections) {
          setSections(data.sections);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [riverId]);

  if (loading) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm animate-pulse">
        <div className="h-5 w-36 bg-[#21262D] rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-[#21262D] rounded" />
          <div className="h-12 bg-[#21262D] rounded" />
          <div className="h-12 bg-[#21262D] rounded" />
          <div className="h-12 bg-[#21262D] rounded" />
        </div>
      </div>
    );
  }

  if (error || sections.length === 0) return null;

  // Check if all sections share the same weather (same coordinates)
  const allSame = sections.length > 1 && sections.every(
    (s) => s.latitude === sections[0].latitude && s.longitude === sections[0].longitude
  );
  const hasMultiple = sections.length > 1 && !allSame;

  const active = sections[selectedIdx] ?? sections[0];
  const w = active.weather;

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-[#E8923A]">
          Current Weather
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] text-[#00B4D8] bg-[#00B4D8]/10 px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* Section tabs */}
      {hasMultiple && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {sections.map((s, idx) => (
            <button
              key={`${s.section}-${idx}`}
              onClick={() => setSelectedIdx(idx)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                idx === selectedIdx
                  ? "bg-[#E8923A] text-white"
                  : "bg-[#0D1117] text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D]"
              }`}
            >
              {s.section}
            </button>
          ))}
        </div>
      )}

      {/* Condition header — icon + temp */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-1">{w.weatherIcon}</div>
        <p className="text-sm text-[#A8B2BD] mb-1">{w.weatherLabel}</p>
        <p className="text-3xl font-bold text-[#F0F6FC]">
          {w.tempF}°F
        </p>
        <p className="text-sm text-[#A8B2BD]">
          Feels like {w.feelsLikeF}°F
        </p>
      </div>

      {/* Metric rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
          <span className="text-sm text-[#A8B2BD]">💨 Wind</span>
          <span className="text-sm font-semibold text-[#F0F6FC]">
            {w.windMph} mph {w.windDirectionLabel}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
          <span className="text-sm text-[#A8B2BD]">💧 Humidity</span>
          <span className="text-sm font-semibold text-[#F0F6FC]">
            {w.humidity}%
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
          <span className="text-sm text-[#A8B2BD]">🌡️ Barometric Pressure</span>
          <span className="text-sm font-semibold text-[#F0F6FC]">
            {w.pressureInHg} inHg{" "}
            <span className="text-[#6E7681] font-normal text-xs">
              ({w.pressureHpa} hPa)
            </span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#6E7681]">
        <Clock className="h-3 w-3" />
        <span>Open-Meteo · Updated {formatTime(w.fetchedAt)}</span>
      </div>
    </div>
  );
}
