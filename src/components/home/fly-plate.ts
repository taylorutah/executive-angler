/** Hook size → optical scale. A #4 streamer reads larger than a #20 midge. */
export function specimenScale(sizes: Array<string | number> | undefined): number {
  const first = Number.parseFloat(String(sizes?.[0] ?? ""));
  if (!Number.isFinite(first)) return 0.82;
  return Math.max(0.52, Math.min(1, 1.15 - first * 0.028));
}

export function flyPlateAlt(
  name: string,
  size: string | null,
  imitates?: string | null,
): string {
  return [name, size, imitates].filter(Boolean).join(", ");
}
