/** Treat null, blank, and whitespace-only as missing. */
export function normalizeImageUrl(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isUsableImageUrl(
  value: string | null | undefined,
): value is string {
  return normalizeImageUrl(value) !== undefined;
}
