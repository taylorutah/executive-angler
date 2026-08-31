import { medianBand } from "@/lib/browse/flow-state";

export interface HydroReading {
  date: string;
  discharge: number;
}

export const HYDRO = {
  W: 800,
  H: 156,
  PAD: { top: 10, right: 78, bottom: 24, left: 54 },
} as const;

export function withLiveReading(
  readings: HydroReading[],
  liveCfs: number | null | undefined,
): HydroReading[] {
  if (readings.length === 0) return readings;
  if (liveCfs == null || !Number.isFinite(liveCfs) || liveCfs < 0) return readings;
  const last = readings[readings.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  if (last.date === today) {
    return [...readings.slice(0, -1), { date: today, discharge: liveCfs }];
  }
  return [...readings, { date: today, discharge: liveCfs }];
}

export function hydroScales(
  readings: HydroReading[],
  liveCfs?: number | null,
) {
  const series = withLiveReading(readings, liveCfs);
  const values = series.map((r) => r.discharge);
  const band = medianBand(values);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const yMin = Math.max(0, Math.min(dataMin, band?.low ?? dataMin));
  const yMax = Math.max(dataMax, band?.high ?? dataMax);
  const pad = (yMax - yMin) * 0.08 || 10;
  const domainMin = Math.max(0, yMin - pad);
  const domainMax = yMax + pad;
  const span = domainMax - domainMin || 1;
  const innerW = HYDRO.W - HYDRO.PAD.left - HYDRO.PAD.right;
  const innerH = HYDRO.H - HYDRO.PAD.top - HYDRO.PAD.bottom;

  const t0 = new Date(`${series[0].date}T12:00:00`).getTime();
  const t1 = new Date(`${series[series.length - 1].date}T12:00:00`).getTime();
  const tSpan = t1 - t0 || 1;

  const xAt = (index: number) =>
    HYDRO.PAD.left + (series.length === 1 ? innerW : (index / (series.length - 1)) * innerW);
  const xAtTime = (iso: string) => {
    const t = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`).getTime();
    return HYDRO.PAD.left + ((t - t0) / tSpan) * innerW;
  };
  const yAt = (value: number) =>
    HYDRO.PAD.top + (1 - (value - domainMin) / span) * innerH;

  const yLabels = [domainMax, (domainMin + domainMax) / 2, domainMin].map((n) =>
    Math.round(n),
  );

  return {
    series,
    band,
    xAt,
    xAtTime,
    yAt,
    yLabels,
    domainMin,
    domainMax,
    innerW,
    innerH,
    last: series[series.length - 1],
    lastIndex: series.length - 1,
  };
}

export function formatAxisCfs(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatAxisDay(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate.slice(5);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
