/**
 * CSV schema — shared by import + export + template download.
 *
 * One row per catch. Session columns repeat on every row in the same session.
 * A session with no fish is one row with all catch columns blank.
 *
 * Grouping key: (session_date, session_title) — rows sharing both become one
 * session. Blank titles fall back to date-only grouping, with a preview warning.
 */

export type ColumnType =
  | "date"       // YYYY-MM-DD
  | "text"
  | "number"
  | "enum"       // validated against `options`
  | "csv"        // comma-separated list in a single cell
  | "time"       // HH:MM (24h)
  | "latitude"
  | "longitude";

export type ColumnDef = {
  key: string;
  header: string;
  type: ColumnType;
  scope: "session" | "catch";
  required?: boolean;
  options?: readonly string[]; // for enum
  example?: string;
  notes?: string;
};

// Enum values mirror existing journal UI selects (src/app/journal/[id]/edit/page.tsx).
export const WATER_CLARITY_VALUES = [
  "Crystal Clear",
  "Clear",
  "Slightly Cloudy",
  "Cloudy",
  "Murky",
] as const;

export const FLY_POSITION_VALUES = [
  "On Point",
  "Dropper",
  "Tag",
  "Single",
] as const;

export const PRIVACY_VALUES = ["public", "private"] as const;

/**
 * Sentinel marker placed in the example row's session_title.
 * Any row whose session_title matches this value is skipped on import
 * (so users can leave the example row in place without accidentally
 * importing it as real data).
 */
export const EXAMPLE_ROW_SENTINEL = "⚠ EXAMPLE ROW — delete or replace before uploading";

export function isExampleRowTitle(title: string | null | undefined): boolean {
  if (!title) return false;
  return title.trim() === EXAMPLE_ROW_SENTINEL;
}

export const COLUMNS: readonly ColumnDef[] = [
  // --- Session columns ---
  { key: "session_date", header: "session_date", type: "date", scope: "session", required: true, example: "2026-04-10" },
  { key: "session_title", header: "session_title", type: "text", scope: "session", example: EXAMPLE_ROW_SENTINEL },
  { key: "river_name", header: "river_name", type: "text", scope: "session", example: "Madison River", notes: "Auto-matched to rivers table (case-insensitive)." },
  { key: "location", header: "location", type: "text", scope: "session", example: "Three Dollar Bridge" },
  { key: "section", header: "section", type: "text", scope: "session", example: "Upper" },
  { key: "session_notes", header: "session_notes", type: "text", scope: "session", example: "Overcast morning, mayflies coming off at 11." },
  { key: "weather", header: "weather", type: "text", scope: "session", example: "Overcast, 58°F, light wind" },
  { key: "water_temp_f", header: "water_temp_f", type: "number", scope: "session", example: "52" },
  { key: "water_clarity", header: "water_clarity", type: "enum", scope: "session", options: WATER_CLARITY_VALUES, example: "Clear" },
  { key: "river_flow_cfs", header: "river_flow_cfs", type: "number", scope: "session", example: "1250" },
  { key: "session_tags", header: "session_tags", type: "csv", scope: "session", example: "dry-fly,morning" },
  { key: "trip_tags", header: "trip_tags", type: "csv", scope: "session", example: "montana-may-2026" },
  { key: "privacy", header: "privacy", type: "enum", scope: "session", options: PRIVACY_VALUES, example: "private", notes: "Defaults to private if blank." },
  { key: "latitude", header: "latitude", type: "latitude", scope: "session", example: "44.6557" },
  { key: "longitude", header: "longitude", type: "longitude", scope: "session", example: "-111.1054" },

  // --- Catch columns (leave all blank for no-catch sessions) ---
  { key: "species", header: "species", type: "text", scope: "catch", example: "Brown Trout" },
  { key: "length_inches", header: "length_inches", type: "number", scope: "catch", example: "17" },
  { key: "fly_pattern_name", header: "fly_pattern_name", type: "text", scope: "catch", example: "Parachute Adams", notes: "Stored as free text on the catch; does not auto-create fly patterns." },
  { key: "fly_size", header: "fly_size", type: "text", scope: "catch", example: "14" },
  { key: "fly_position", header: "fly_position", type: "enum", scope: "catch", options: FLY_POSITION_VALUES, example: "On Point" },
  { key: "bead_size", header: "bead_size", type: "text", scope: "catch", example: "2.5" },
  { key: "quantities", header: "quantities", type: "number", scope: "catch", example: "1", notes: "Defaults to 1 if blank." },
  { key: "catch_notes", header: "catch_notes", type: "text", scope: "catch", example: "Held in a back eddy below the bridge." },
  { key: "catch_tags", header: "catch_tags", type: "csv", scope: "catch", example: "personal-best" },
  { key: "time_caught", header: "time_caught", type: "time", scope: "catch", example: "11:45" },
  { key: "catch_latitude", header: "catch_latitude", type: "latitude", scope: "catch" },
  { key: "catch_longitude", header: "catch_longitude", type: "longitude", scope: "catch" },
] as const;

export const HEADERS = COLUMNS.map((c) => c.header);

export const SESSION_KEYS = COLUMNS.filter((c) => c.scope === "session").map((c) => c.key);
export const CATCH_KEYS = COLUMNS.filter((c) => c.scope === "catch").map((c) => c.key);

export const EXAMPLE_ROW: Record<string, string> = COLUMNS.reduce((acc, col) => {
  acc[col.key] = col.example ?? "";
  return acc;
}, {} as Record<string, string>);

// ========== Coercion / validation ==========

export type CoercedValue = string | number | string[] | null;

export function coerceValue(
  col: ColumnDef,
  raw: string
): { value: CoercedValue; error?: string } {
  const trimmed = (raw ?? "").trim();
  if (trimmed === "") {
    if (col.required) return { value: null, error: `${col.header} is required` };
    return { value: null };
  }

  switch (col.type) {
    case "date": {
      // Accept YYYY-MM-DD strictly.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return { value: null, error: `${col.header} must be YYYY-MM-DD (got "${trimmed}")` };
      }
      const d = new Date(trimmed + "T00:00:00Z");
      if (isNaN(d.getTime())) {
        return { value: null, error: `${col.header} is not a real date` };
      }
      return { value: trimmed };
    }
    case "time": {
      if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
        return { value: null, error: `${col.header} must be HH:MM` };
      }
      return { value: trimmed.length === 4 ? "0" + trimmed : trimmed };
    }
    case "number": {
      const n = Number(trimmed);
      if (!Number.isFinite(n)) {
        return { value: null, error: `${col.header} must be a number (got "${trimmed}")` };
      }
      return { value: n };
    }
    case "latitude": {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n < -90 || n > 90) {
        return { value: null, error: `${col.header} must be a latitude between -90 and 90` };
      }
      return { value: n };
    }
    case "longitude": {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n < -180 || n > 180) {
        return { value: null, error: `${col.header} must be a longitude between -180 and 180` };
      }
      return { value: n };
    }
    case "enum": {
      const opts = col.options ?? [];
      const match = opts.find((o) => o.toLowerCase() === trimmed.toLowerCase());
      if (!match) {
        return {
          value: null,
          error: `${col.header} must be one of: ${opts.join(", ")} (got "${trimmed}")`,
        };
      }
      return { value: match };
    }
    case "csv": {
      const items = trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return { value: items };
    }
    case "text":
    default:
      return { value: trimmed };
  }
}

export function formatForExport(value: unknown, col: ColumnDef): string {
  if (value === null || value === undefined) return "";
  if (col.type === "csv" && Array.isArray(value)) return (value as string[]).join(", ");
  if (typeof value === "number") return String(value);
  return String(value);
}
