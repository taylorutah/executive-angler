/** USGS NWIS site numbers are 8–15 digits (leading zeros allowed). */
export const USGS_SITE_ID = /^\d{8,15}$/;

export function isUsgsSiteId(value: string): boolean {
  return USGS_SITE_ID.test(value);
}
