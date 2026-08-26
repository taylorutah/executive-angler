"use client";

import { useEffect, useState } from "react";
import { Clock } from "@/icons";

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
      <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6 shadow-sm animate-pulse">
        <div className="h-5 w-36 bg-[var(--border-rule)] rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-[var(--border-rule)] rounded" />
          <div className="h-12 bg-[var(--border-rule)] rounded" />
          <div className="h-12 bg-[var(--border-rule)] rounded" />
          <div className="h-12 bg-[var(--border-rule)] rounded" />
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
    <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-[var(--action)]">
          Current Weather
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] text-[var(--signal-live)] bg-[var(--signal-live)]/10 px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-live)] animate-pulse inline-block" />
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
                  ? "bg-[var(--action)] text-white"
                  : "bg-[var(--surface-page)] text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--border-rule)]"
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
        <p className="text-sm text-[var(--text-body)] mb-1">{w.weatherLabel}</p>
        <p className="text-3xl font-bold text-[var(--text-primary)]">
          {w.tempF}°F
        </p>
        <p className="text-sm text-[var(--text-body)]">
          Feels like {w.feelsLikeF}°F
        </p>
      </div>

      {/* Metric rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
          <span className="text-sm text-[var(--text-body)]">💨 Wind</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {w.windMph} mph {w.windDirectionLabel}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
          <span className="text-sm text-[var(--text-body)]">💧 Humidity</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {w.humidity}%
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
          <span className="text-sm text-[var(--text-body)]">🌡️ Barometric Pressure</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {w.pressureInHg} inHg{" "}
            <span className="text-[var(--text-meta)] font-normal text-xs">
              ({w.pressureHpa} hPa)
            </span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[var(--text-meta)]">
        <Clock className="h-3 w-3" />
        <span>Open-Meteo · Updated {formatTime(w.fetchedAt)}</span>
      </div>
    </div>
  );
}
