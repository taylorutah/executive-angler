/** First USGS site id from the river `usgsGaugeId` column (plain id or JSON array). */
export function firstUsgsSiteId(raw?: string | null): string | undefined {
  if (!raw?.trim()) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      if (typeof first === "string") return first.trim() || undefined;
      if (first && typeof first === "object") {
        const rec = first as Record<string, unknown>;
        const id = rec.site_id ?? rec.siteId ?? rec.id;
        return typeof id === "string" && id.trim() ? id.trim() : undefined;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
  return trimmed.split(",")[0]?.trim() || undefined;
}
