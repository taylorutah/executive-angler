/**
 * Honest empty-state copy when a river has no usable USGS site.
 * We name what is missing and refuse to invent a reading.
 */
export function missingGaugeCopy(
  riverName: string,
  rawGaugeId?: string | null,
): string {
  const trimmed = (rawGaugeId ?? "").trim();
  if (!trimmed || trimmed === "[]" || trimmed === "null") {
    return `No USGS site is linked to ${riverName}. We do not invent a site id or guess a flow.`;
  }
  return `USGS site ${trimmed} is not a valid gauge id for ${riverName}. We do not guess a flow.`;
}

/**
 * Instantaneous (IV) is missing; daily means may still be on the page.
 * Name the missing reading. Do not deny a chart that is already showing.
 */
export function missingInstantaneousCopy(riverName: string, siteId: string): string {
  const id = siteId.trim();
  return `USGS site ${id} on ${riverName} did not return an instantaneous reading. Daily means below are the last published values. We do not guess a live flow.`;
}

export type FlowTrend = "rising" | "dropping" | "steady";

/** Last two comparable readings — a measurement, not a health score. */
export function flowTrend(previous: number | null | undefined, current: number | null | undefined): FlowTrend | null {
  if (previous == null || current == null) return null;
  if (!Number.isFinite(previous) || !Number.isFinite(current)) return null;
  const delta = current - previous;
  const threshold = Math.max(5, Math.abs(previous) * 0.02);
  if (delta > threshold) return "rising";
  if (delta < -threshold) return "dropping";
  return "steady";
}
