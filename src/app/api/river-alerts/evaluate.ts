import { classifyFlowState, median, type FlowState } from "@/lib/browse/flow-state";
import {
  MOVE_FRACTION,
  PERSONAL_BAND_MIN_SESSIONS,
  type AlertKind,
} from "./constants";

export type GaugeReading = {
  current: number | null;
  avg24: number | null;
  median7: number | null;
};

export type PersonalBand = {
  p25: number;
  p75: number;
};

export type ChosenAlert = {
  kind: AlertKind;
  title: string;
  body: string;
};

function pct(current: number, avg: number): number {
  return Math.round(((current - avg) / avg) * 100);
}

function quartile(sorted: number[], q: number): number {
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function personalBand(flows: number[]): PersonalBand | null {
  const clean = flows.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (clean.length < PERSONAL_BAND_MIN_SESSIONS) return null;
  return { p25: quartile(clean, 0.25), p75: quartile(clean, 0.75) };
}

function insideBand(cfs: number, band: PersonalBand): boolean {
  return cfs >= band.p25 && cfs <= band.p75;
}

/**
 * Pick at most one water alert for a river. Priority matches
 * docs/decisions/river-alerts.md. Returns null when nothing honest fired.
 */
export function chooseAlert(
  riverName: string,
  reading: GaugeReading,
  band: PersonalBand | null,
): ChosenAlert | null {
  const { current, avg24, median7 } = reading;

  if (current == null) {
    return {
      kind: "gauge_quiet",
      title: `${riverName} has no USGS reading right now`,
      body: `${riverName} has no USGS reading right now.`,
    };
  }

  const currentState: FlowState | null =
    median7 != null ? classifyFlowState(current, median7) : null;
  const priorState: FlowState | null =
    avg24 != null && median7 != null ? classifyFlowState(avg24, median7) : null;

  if (avg24 != null && avg24 > 0 && Math.abs(current - avg24) / avg24 > MOVE_FRACTION) {
    const change = pct(current, avg24);
    const direction = change > 0 ? "up" : "down";
    return {
      kind: "flow_move",
      title: `${riverName} is ${Math.round(current)} cfs, ${direction} ${Math.abs(change)}%`,
      body: `${riverName} is ${Math.round(current)} cfs, ${direction} ${Math.abs(change)}% from the last 24 hours.`,
    };
  }

  if (priorState === "blown" && currentState && currentState !== "blown") {
    return {
      kind: "blown_fishable",
      title: `${riverName} is ${Math.round(current)} cfs`,
      body: `${riverName} is ${Math.round(current)} cfs. The gauge is no longer in the blown band against its own recent median.`,
    };
  }

  if (currentState && priorState && currentState !== priorState) {
    return {
      kind: "state_change",
      title: `${riverName} is ${Math.round(current)} cfs (${currentState})`,
      body: `${riverName} is ${Math.round(current)} cfs (${currentState}), against its own recent median.`,
    };
  }

  if (band && avg24 != null) {
    const wasInside = insideBand(avg24, band);
    const nowInside = insideBand(current, band);
    if (!wasInside && nowInside) {
      return {
        kind: "personal_band",
        title: `${riverName} is ${Math.round(current)} cfs`,
        body: `${riverName} is ${Math.round(current)} cfs, inside the flow band from your logged days on this river.`,
      };
    }
  }

  return null;
}

export function siteMedian(values: number[]): number | null {
  return median(values);
}
