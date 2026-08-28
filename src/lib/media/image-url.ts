/** Treat null, blank, and whitespace-only as missing. */
const MOVED_LOCAL: Record<string, string> = {
  "/images/madison-river-three-dollar-bridge.jpg":
    "/images/home/madison-three-dollar-bridge.jpg",
};

export function normalizeImageUrl(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return MOVED_LOCAL[trimmed] ?? trimmed;
}

export function isUsableImageUrl(
  value: string | null | undefined,
): value is string {
  return normalizeImageUrl(value) !== undefined;
}
