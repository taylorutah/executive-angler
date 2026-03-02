/** Convert a snake_case string to camelCase */
function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/** Shallow transform object keys from snake_case to camelCase.
 *  JSONB columns (access_points, hatch_chart, etc.) already contain
 *  camelCase keys from the seed script, so we only transform top-level keys. */
export function keysToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toCamel(key)] = value;
  }
  return result as T;
}
