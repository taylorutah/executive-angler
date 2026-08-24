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

export function median(values: number[]): number | null {
  const clean = values.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (clean.length === 0) return null;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 === 0 ? (clean[mid - 1] + clean[mid]) / 2 : clean[mid];
}

export const FLOW_STATE_LABEL: Record<FlowState, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  blown: "Blown",
};
