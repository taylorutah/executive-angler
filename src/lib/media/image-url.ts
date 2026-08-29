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

/** Plate / bench stills only — icons and leftover submission paths stay empty. */
export function plateImageUrl(
  value: string | null | undefined,
): string | undefined {
  const href = normalizeImageUrl(value);
  if (!href) return undefined;
  if (href.includes("/fly-icons/") || href.includes("/community-images/submissions/")) {
    return undefined;
  }
  return href;
}

/** Leftover public templates: hosted stills only. No Unsplash. */
export function hostedStillUrl(
  value: string | null | undefined,
): string | undefined {
  const href = plateImageUrl(value);
  if (!href) return undefined;
  if (/unsplash\.com/i.test(href)) return undefined;
  return href;
}
