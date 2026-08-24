/** USGS NWIS site numbers are 8–15 digits (leading zeros allowed). */
export const USGS_SITE_ID = /^\d{8,15}$/;

export function isUsgsSiteId(value: string): boolean {
  return USGS_SITE_ID.test(value);
}

function asSiteId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return isUsgsSiteId(trimmed) ? trimmed : undefined;
}

/** First USGS site id from the river `usgsGaugeId` column (plain id or JSON array). */
export function firstUsgsSiteId(raw?: string | null): string | undefined {
  if (!raw?.trim()) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      if (typeof first === "string") return asSiteId(first);
      if (first && typeof first === "object") {
        const rec = first as Record<string, unknown>;
        return asSiteId(rec.site_id ?? rec.siteId ?? rec.id);
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
  return asSiteId(trimmed.split(",")[0]);
}
