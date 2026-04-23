/**
 * Parse raw CSV rows into grouped sessions + catches, with validation.
 *
 * Produces issues array per row (errors block commit, warnings don't).
 * River matching is async — queries the rivers table once per unique name.
 */

import { COLUMNS, coerceValue, isExampleRowTitle, type ColumnDef } from "./csv-schema";

export type RowIssue = {
  row: number; // 1-indexed (header is row 0)
  severity: "error" | "warning";
  column?: string;
  message: string;
};

export type ParsedCatch = {
  rowIndex: number;
  species: string | null;
  length_inches: number | null;
  fly_name: string | null;
  fly_size: string | null;
  fly_position: string | null;
  bead_size: string | null;
  quantities: number;
  catch_note: string | null;
  catch_tags: string[] | null;
  time_caught: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type ParsedSession = {
  rowIndices: number[]; // source row indices for all catches in this session
  date: string;
  title: string | null;
  river_name: string | null;
  river_id: string | null;
  river_match: "exact" | "unmatched" | "none"; // "none" = no river_name given
  location: string | null;
  section: string | null;
  session_notes: string | null;
  weather: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  river_flow_cfs: number | null;
  session_tags: string[] | null;
  trip_tags: string[] | null;
  privacy: "public" | "private";
  latitude: number | null;
  longitude: number | null;
  catches: ParsedCatch[];
  duplicate?: boolean; // set by duplicate-detection step
};

export type ParseResult = {
  sessions: ParsedSession[];
  issues: RowIssue[];
  unknownHeaders: string[];
  exampleRowsSkipped: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = { from: (table: string) => any };

function normalizeRiver(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "")
    .replace(/\s+river$/, "")
    .replace(/\s+/g, " ");
}

export async function parseRows(
  rawRows: Record<string, string>[],
  supabase: SupabaseLike
): Promise<ParseResult> {
  const issues: RowIssue[] = [];
  const colByKey = new Map<string, ColumnDef>(COLUMNS.map((c) => [c.key, c]));

  // Detect unknown headers by comparing first row's keys to our schema.
  const unknownHeaders =
    rawRows.length > 0
      ? Object.keys(rawRows[0]).filter(
          (h) => !COLUMNS.some((c) => c.header === h)
        )
      : [];

  // --- Step 1: per-row coerce ---
  type CoercedRow = {
    rowIndex: number;
    values: Record<string, unknown>;
    hardError: boolean;
  };

  let exampleRowsSkipped = 0;

  const coercedRows: CoercedRow[] = [];
  rawRows.forEach((raw, idx) => {
    const rowIndex = idx + 2; // 1-indexed + header row

    // Auto-skip the sample row from the downloaded template. Users can leave
    // it in place without accidentally importing it as real data.
    if (isExampleRowTitle(raw["session_title"])) {
      exampleRowsSkipped += 1;
      return;
    }

    const values: Record<string, unknown> = {};
    let hardError = false;

    for (const col of COLUMNS) {
      const rawVal = raw[col.header] ?? "";
      const { value, error } = coerceValue(col, rawVal);
      if (error) {
        issues.push({
          row: rowIndex,
          severity: "error",
          column: col.header,
          message: error,
        });
        hardError = true;
      }
      values[col.key] = value;
    }

    coercedRows.push({ rowIndex, values, hardError });
  });

  // --- Step 2: collect unique river names to batch-query ---
  const riverNameSet = new Set<string>();
  for (const r of coercedRows) {
    const name = (r.values.river_name as string | null) ?? null;
    if (name) riverNameSet.add(name);
  }

  // Normalize → canonical from DB
  const riverMap = new Map<string, { id: string; canonical: string }>();
  if (riverNameSet.size > 0) {
    const { data: riverData, error: riverErr } = await supabase
      .from("rivers")
      .select("id, name");
    if (!riverErr && Array.isArray(riverData)) {
      const byNormalized = new Map<string, { id: string; canonical: string }>();
      for (const r of riverData as { id: string; name: string }[]) {
        byNormalized.set(normalizeRiver(r.name), { id: r.id, canonical: r.name });
      }
      for (const input of riverNameSet) {
        const hit = byNormalized.get(normalizeRiver(input));
        if (hit) riverMap.set(input, hit);
      }
    }
  }

  // --- Step 3: group rows into sessions by (date, title) ---
  const sessionGroups = new Map<string, CoercedRow[]>();
  for (const r of coercedRows) {
    if (r.hardError) continue;
    const date = r.values.session_date as string | null;
    if (!date) continue; // already caught as required-error
    const title = ((r.values.session_title as string | null) ?? "").trim();
    const key = `${date}::${title}`;
    if (!sessionGroups.has(key)) sessionGroups.set(key, []);
    sessionGroups.get(key)!.push(r);
  }

  // Warn when date-only grouping (blank title) pulls in multiple rows with
  // potentially-different session data.
  for (const [key, rows] of sessionGroups) {
    const [, title] = key.split("::");
    if (!title && rows.length > 1) {
      // Check if any session-scoped fields differ — if so, warn.
      const firstSig = JSON.stringify(
        COLUMNS.filter((c) => c.scope === "session" && c.key !== "session_date")
          .map((c) => rows[0].values[c.key])
      );
      const allMatch = rows.every(
        (r) =>
          JSON.stringify(
            COLUMNS.filter((c) => c.scope === "session" && c.key !== "session_date")
              .map((c) => r.values[c.key])
          ) === firstSig
      );
      if (!allMatch) {
        for (const r of rows) {
          issues.push({
            row: r.rowIndex,
            severity: "warning",
            message:
              "Multiple rows share the same date with a blank title — they will be merged into one session. Add session_title to keep them separate.",
          });
        }
      }
    }
  }

  // --- Step 4: build ParsedSession objects ---
  const sessions: ParsedSession[] = [];
  for (const [, rows] of sessionGroups) {
    const head = rows[0];

    const rawRiverName = (head.values.river_name as string | null) ?? null;
    const riverHit = rawRiverName ? riverMap.get(rawRiverName) : undefined;
    let river_match: ParsedSession["river_match"] = "none";
    if (rawRiverName) {
      river_match = riverHit ? "exact" : "unmatched";
      if (!riverHit) {
        issues.push({
          row: head.rowIndex,
          severity: "warning",
          column: "river_name",
          message: `River "${rawRiverName}" didn't match any river in the database. Session will still import, but the name will be stored as-is without a link to the river page.`,
        });
      }
    }

    const catches: ParsedCatch[] = [];
    for (const r of rows) {
      // A catch row is one that has at least a species or length or fly.
      const hasCatchData =
        !!r.values.species ||
        r.values.length_inches != null ||
        !!r.values.fly_pattern_name ||
        !!r.values.fly_size ||
        !!r.values.fly_position;
      if (!hasCatchData) continue;

      const qty = (r.values.quantities as number | null) ?? null;
      catches.push({
        rowIndex: r.rowIndex,
        species: (r.values.species as string | null) ?? null,
        length_inches: (r.values.length_inches as number | null) ?? null,
        fly_name: (r.values.fly_pattern_name as string | null) ?? null,
        fly_size: (r.values.fly_size as string | null) ?? null,
        fly_position: (r.values.fly_position as string | null) ?? null,
        bead_size: (r.values.bead_size as string | null) ?? null,
        quantities: qty && qty > 0 ? Math.floor(qty) : 1,
        catch_note: (r.values.catch_notes as string | null) ?? null,
        catch_tags: (r.values.catch_tags as string[] | null) ?? null,
        time_caught: (r.values.time_caught as string | null) ?? null,
        latitude: (r.values.catch_latitude as number | null) ?? null,
        longitude: (r.values.catch_longitude as number | null) ?? null,
      });
    }

    const privacyRaw = (head.values.privacy as string | null) ?? null;
    const privacy: "public" | "private" =
      privacyRaw === "public" ? "public" : "private";

    sessions.push({
      rowIndices: rows.map((r) => r.rowIndex),
      date: head.values.session_date as string,
      title: ((head.values.session_title as string | null) || "").trim() || null,
      river_name: riverHit?.canonical ?? rawRiverName,
      river_id: riverHit?.id ?? null,
      river_match,
      location: (head.values.location as string | null) ?? null,
      section: (head.values.section as string | null) ?? null,
      session_notes: (head.values.session_notes as string | null) ?? null,
      weather: (head.values.weather as string | null) ?? null,
      water_temp_f: (head.values.water_temp_f as number | null) ?? null,
      water_clarity: (head.values.water_clarity as string | null) ?? null,
      river_flow_cfs: (head.values.river_flow_cfs as number | null) ?? null,
      session_tags: (head.values.session_tags as string[] | null) ?? null,
      trip_tags: (head.values.trip_tags as string[] | null) ?? null,
      privacy,
      latitude: (head.values.latitude as number | null) ?? null,
      longitude: (head.values.longitude as number | null) ?? null,
      catches,
    });
  }

  // Unused in current flow, kept for clarity
  void colByKey;

  return { sessions, issues, unknownHeaders, exampleRowsSkipped };
}

/**
 * Mark sessions that already exist for this user.
 * Dedupe key: (user_id, date, title). Blank titles dedupe by date-only.
 */
export async function markDuplicates(
  sessions: ParsedSession[],
  supabase: SupabaseLike,
  userId: string
): Promise<void> {
  if (sessions.length === 0) return;

  const dates = Array.from(new Set(sessions.map((s) => s.date)));
  const { data, error } = await supabase
    .from("fishing_sessions")
    .select("date, title")
    .eq("user_id", userId)
    .in("date", dates);

  if (error || !Array.isArray(data)) return;

  const existing = new Set<string>();
  for (const row of data as { date: string; title: string | null }[]) {
    existing.add(`${row.date}::${(row.title ?? "").trim()}`);
  }

  for (const s of sessions) {
    const key = `${s.date}::${s.title ?? ""}`;
    if (existing.has(key)) s.duplicate = true;
  }
}
