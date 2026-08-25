export const FLOW_STATES = ["low", "normal", "high", "blown"] as const;
export type FlowState = (typeof FLOW_STATES)[number];

/**
 * Classify current discharge against that site's own recent median.
 * Ratios are hydrologic, not a fishing recommendation.
 *
 *   < 0.55 × median  → low
 *   0.55–1.45        → normal
 *   1.45–2.25        → high
 *   > 2.25           → blown
 */
export function classifyFlowState(
  currentCfs: number,
  medianCfs: number,
): FlowState | null {
  if (!Number.isFinite(currentCfs) || currentCfs < 0) return null;
  if (!Number.isFinite(medianCfs) || medianCfs <= 0) return null;
  const ratio = currentCfs / medianCfs;
  if (ratio < 0.55) return "low";
  if (ratio < 1.45) return "normal";
  if (ratio < 2.25) return "high";
  return "blown";
}

function sortedPositive(values: number[]): number[] {
  return values.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
}

export function median(values: number[]): number | null {
  const clean = sortedPositive(values);
  if (clean.length === 0) return null;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 === 0 ? (clean[mid - 1] + clean[mid]) / 2 : clean[mid];
}

/** Linear interpolation between ranks. Same cleaned series as `median`. */
export function quantile(values: number[], p: number): number | null {
  const clean = sortedPositive(values);
  if (clean.length === 0) return null;
  if (p <= 0) return clean[0];
  if (p >= 1) return clean[clean.length - 1];
  const idx = (clean.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return clean[lo];
  return clean[lo] + (clean[hi] - clean[lo]) * (idx - lo);
}

export function iqr(values: number[]): number | null {
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  if (q1 == null || q3 == null) return null;
  return q3 - q1;
}

/**
 * Horizontal band: this river's 30-day median ± its own IQR.
 * Classification still uses `classifyFlowState(current, median)` — the band
 * is the picture of the same series, not a second threshold.
 */
export function medianBand(
  values: number[],
): { median: number; low: number; high: number } | null {
  const mid = median(values);
  const spread = iqr(values);
  if (mid == null || spread == null) return null;
  return { median: mid, low: Math.max(0, mid - spread), high: mid + spread };
}

export const FLOW_STATE_LABEL: Record<FlowState, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  blown: "Blown",
};
