import { NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";

// ── In-memory cache (per-instance, survives across requests until redeploy) ──
const cache = new Map<string, { data: WeatherSection[]; expires: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ── Types ──

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

interface GaugeConfig {
  site_id: string;
  name: string;
  section: string;
  latitude?: number;
  longitude?: number;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    surface_pressure: number;
    pressure_msl: number;
  };
}

// ── Wind direction (16-point compass) ──
const WIND_DIRECTIONS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

function windDirectionLabel(degrees: number): string {
  const idx = Math.round(degrees / 22.5) % 16;
  return WIND_DIRECTIONS[idx];
}

// ── WMO weather code → label + emoji ──
function weatherCodeToLabel(code: number): { label: string; icon: string } {
  switch (code) {
    case 0: return { label: "Clear Sky", icon: "☀️" };
    case 1: return { label: "Mostly Clear", icon: "🌤️" };
    case 2: return { label: "Partly Cloudy", icon: "⛅" };
    case 3: return { label: "Overcast", icon: "☁️" };
    case 45: case 48: return { label: "Foggy", icon: "🌫️" };
    case 51: case 53: case 55: return { label: "Light Drizzle", icon: "🌦️" };
    case 61: case 63: case 65: return { label: "Rain", icon: "🌧️" };
    case 71: case 73: case 75: return { label: "Snow", icon: "❄️" };
    case 80: case 81: case 82: return { label: "Showers", icon: "🌦️" };
    case 95: return { label: "Thunderstorm", icon: "⛈️" };
    default: return { label: "Cloudy", icon: "☁️" };
  }
}

function hpaToInHg(hpa: number): number {
  return Math.round((hpa / 33.8639) * 100) / 100;
}

// ── Fetch weather from Open-Meteo ──
async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,surface_pressure,pressure_msl&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) {
    console.error(`[Weather] Open-Meteo failed for ${lat},${lng}: ${res.status}`);
    return null;
  }

  const data: OpenMeteoResponse = await res.json();
  const c = data.current;
  if (!c) return null;

  const { label, icon } = weatherCodeToLabel(c.weather_code);

  return {
    tempF: Math.round(c.temperature_2m),
    feelsLikeF: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    windMph: Math.round(c.wind_speed_10m),
    windDirection: Math.round(c.wind_direction_10m),
    windDirectionLabel: windDirectionLabel(c.wind_direction_10m),
    weatherCode: c.weather_code,
    weatherLabel: label,
    weatherIcon: icon,
    pressureHpa: Math.round(c.pressure_msl * 10) / 10,
    pressureMb: Math.round(c.pressure_msl * 10) / 10,
    pressureInHg: hpaToInHg(c.pressure_msl),
    fetchedAt: new Date().toISOString(),
  };
}

// ── Fetch real USGS site coordinates for a batch of site IDs ──
async function fetchUSGSSiteCoords(
  siteIds: string[]
): Promise<Map<string, { lat: number; lng: number }>> {
  const result = new Map<string, { lat: number; lng: number }>();
  if (siteIds.length === 0) return result;
  try {
    const url = `https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=${siteIds.join(",")}&siteOutput=basic`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // site coords change rarely
    if (!res.ok) return result;
    const text = await res.text();
    for (const line of text.split("\n")) {
      if (line.startsWith("#") || line.startsWith("agency") || line.startsWith("5s")) continue;
      const cols = line.split("\t");
      if (cols.length < 6) continue;
      const siteId = cols[1]?.trim();
      const lat = parseFloat(cols[4]);
      const lng = parseFloat(cols[5]);
      if (siteId && !isNaN(lat) && !isNaN(lng)) {
        result.set(siteId, { lat, lng });
      }
    }
  } catch {
    // Non-fatal — fall back to river coords
  }
  return result;
}

// ── Coordinate deduplication (within 0.01°) ──
function coordKey(lat: number, lng: number): string {
  return `${Math.round(lat * 100)},${Math.round(lng * 100)}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;

  // Query param override for direct coordinate lookup
  const searchParams = request.nextUrl.searchParams;
  const overrideLat = searchParams.get("lat");
  const overrideLng = searchParams.get("lng");

  if (overrideLat && overrideLng) {
    const lat = parseFloat(overrideLat);
    const lng = parseFloat(overrideLng);
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
    }
    const weather = await fetchWeather(lat, lng);
    if (!weather) {
      return NextResponse.json({ error: "Unable to fetch weather" }, { status: 502 });
    }
    return NextResponse.json({
      sections: [{ section: "Location", latitude: lat, longitude: lng, weather }],
    }, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" },
    });
  }

  // Check cache
  const cached = cache.get(riverId);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ sections: cached.data }, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "X-Cache": "HIT",
      },
    });
  }

  // Look up river from Supabase
  const supabase = createStaticClient();
  const { data: river, error } = await supabase
    .from("rivers")
    .select("id, name, latitude, longitude, usgs_gauge_id")
    .eq("id", riverId)
    .maybeSingle();

  if (error || !river) {
    return NextResponse.json({ error: "River not found" }, { status: 404 });
  }

  if (!river.latitude || !river.longitude) {
    return NextResponse.json({ error: "No coordinates for this river" }, { status: 404 });
  }

  // Parse gauge configs for per-section coordinates
  let gauges: GaugeConfig[] = [];
  if (river.usgs_gauge_id) {
    const raw = (river.usgs_gauge_id as string).trim();
    if (raw.startsWith("[")) {
      try {
        gauges = JSON.parse(raw) as GaugeConfig[];
      } catch {
        // Fall through to river-level coords
      }
    }
  }

  // Build coordinate list: per-section if available, else look up from USGS
  interface CoordEntry {
    section: string;
    latitude: number;
    longitude: number;
  }

  const coordEntries: CoordEntry[] = [];

  if (gauges.length > 0) {
    // Fetch real USGS site coordinates for gauges that don't have explicit coords
    const needsCoords = gauges.filter(g => g.latitude == null || g.longitude == null);
    const usgsCoords = needsCoords.length > 0
      ? await fetchUSGSSiteCoords(needsCoords.map(g => g.site_id))
      : new Map<string, { lat: number; lng: number }>();

    for (const g of gauges) {
      // Priority: explicit config coords > USGS site coords > river-level coords
      const usgs = usgsCoords.get(g.site_id);
      const lat = g.latitude ?? usgs?.lat ?? river.latitude;
      const lng = g.longitude ?? usgs?.lng ?? river.longitude;
      coordEntries.push({ section: g.section, latitude: lat, longitude: lng });
    }
  } else {
    coordEntries.push({
      section: "Main",
      latitude: river.latitude,
      longitude: river.longitude,
    });
  }

  // Deduplicate coordinates (within 0.01°)
  const uniqueCoords = new Map<string, { lat: number; lng: number }>();
  const sectionToCoordKey = new Map<string, string>();

  for (const entry of coordEntries) {
    const key = coordKey(entry.latitude, entry.longitude);
    if (!uniqueCoords.has(key)) {
      uniqueCoords.set(key, { lat: entry.latitude, lng: entry.longitude });
    }
    sectionToCoordKey.set(entry.section, key);
  }

  // Fetch weather for each unique coordinate in parallel
  const coordKeys = Array.from(uniqueCoords.keys());
  const weatherResults = await Promise.all(
    coordKeys.map(async (key) => {
      const { lat, lng } = uniqueCoords.get(key)!;
      const weather = await fetchWeather(lat, lng);
      return { key, weather };
    })
  );

  const weatherByCoord = new Map<string, WeatherData>();
  for (const { key, weather } of weatherResults) {
    if (weather) weatherByCoord.set(key, weather);
  }

  // Build response sections
  const sections: WeatherSection[] = [];
  for (const entry of coordEntries) {
    const key = sectionToCoordKey.get(entry.section)!;
    const weather = weatherByCoord.get(key);
    if (weather) {
      sections.push({
        section: entry.section,
        latitude: entry.latitude,
        longitude: entry.longitude,
        weather,
      });
    }
  }

  if (sections.length === 0) {
    return NextResponse.json({ error: "Unable to fetch weather" }, { status: 502 });
  }

  // Store in cache
  cache.set(riverId, { data: sections, expires: Date.now() + CACHE_TTL_MS });

  return NextResponse.json({ sections }, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      "X-Cache": "MISS",
    },
  });
}
