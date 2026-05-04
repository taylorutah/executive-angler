import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { checkPremium } from "@/lib/admin";
import {
  parseRows,
  markDuplicates,
  type ParsedSession,
  type RowIssue,
} from "@/lib/import/parse-rows";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 10_000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const premium = await checkPremium(supabase, user.id, user.email);
  if (!premium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "commit" ? "commit" : "preview";

  let file: File | null = null;
  try {
    const form = await request.formData();
    file = form.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB)` },
      { status: 413 }
    );
  }

  const fileName = (file.name || "").toLowerCase();
  if (!fileName.endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json(
      { error: "File must be a .csv" },
      { status: 400 }
    );
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    const first = parsed.errors[0];
    if (first.code === "TooFewFields" || first.code === "TooManyFields") {
      // These are per-row structural issues; surface but don't block parsing.
    } else if (first.code === "UndetectableDelimiter") {
      return NextResponse.json(
        { error: "Could not parse CSV — check that columns are comma-separated." },
        { status: 400 }
      );
    }
  }

  const rows = parsed.data || [];
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "CSV has no data rows (only a header, or empty)." },
      { status: 400 }
    );
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows (max ${MAX_ROWS}). Split the file and import in batches.` },
      { status: 413 }
    );
  }

  const { sessions, issues, unknownHeaders, exampleRowsSkipped } = await parseRows(rows, supabase);
  await markDuplicates(sessions, supabase, user.id);

  // --- Preview mode: return the parsed structure and stop ---
  if (mode === "preview") {
    return NextResponse.json({
      mode: "preview",
      summary: buildSummary(sessions, issues),
      unknownHeaders,
      exampleRowsSkipped,
      sessions: sessions.map(shapeSessionForPreview),
      issues,
    });
  }

  // --- Commit mode ---
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Server not configured for imports" },
      { status: 500 }
    );
  }

  const service = createServiceClient(serviceUrl, serviceKey);
  const summary = {
    sessionsCreated: 0,
    catchesCreated: 0,
    duplicatesSkipped: 0,
    errorsSkipped: 0,
    failed: [] as { row: number; error: string }[],
  };

  for (const s of sessions) {
    if (s.duplicate) {
      summary.duplicatesSkipped += 1;
      continue;
    }

    const sessionInsert = {
      user_id: user.id, // enforced, never trust input
      river_id: s.river_id,
      river_name: s.river_name,
      date: s.date,
      title: s.title,
      location: s.location,
      section: s.section,
      weather: s.weather,
      water_temp_f: s.water_temp_f,
      water_clarity: s.water_clarity,
      river_flow_cfs: s.river_flow_cfs,
      total_fish: s.catches.reduce((sum, c) => sum + (c.quantities || 1), 0),
      notes: s.session_notes,
      tags: s.session_tags,
      trip_tags: s.trip_tags,
      // privacy column dropped in phase 6 of the privacy overhaul.
      // Imported sessions don't broadcast — user can opt in per session.
      broadcast_presence: false,
      latitude: s.latitude,
      longitude: s.longitude,
    };

    const { data: sessionRow, error: sessionErr } = await service
      .from("fishing_sessions")
      .insert(sessionInsert)
      .select("id")
      .single();

    if (sessionErr || !sessionRow) {
      summary.failed.push({
        row: s.rowIndices[0],
        error: sessionErr?.message || "Unknown session insert error",
      });
      continue;
    }

    summary.sessionsCreated += 1;

    if (s.catches.length > 0) {
      const catchInserts = s.catches.map((c) => ({
        session_id: sessionRow.id,
        user_id: user.id,
        species: c.species,
        length_inches: c.length_inches,
        fly_name: c.fly_name,
        fly_size: c.fly_size,
        fly_position: c.fly_position,
        bead_size: c.bead_size,
        quantities: c.quantities,
        catch_note: c.catch_note,
        catch_tags: c.catch_tags,
        time_caught: c.time_caught,
        latitude: c.latitude,
        longitude: c.longitude,
      }));

      const { error: catchErr } = await service.from("catches").insert(catchInserts);
      if (catchErr) {
        summary.failed.push({
          row: s.rowIndices[0],
          error: `Catches failed: ${catchErr.message}`,
        });
      } else {
        summary.catchesCreated += catchInserts.length;
      }
    }
  }

  // Count hard errors (rows excluded before commit)
  const errorRowsSet = new Set(
    issues.filter((i) => i.severity === "error").map((i) => i.row)
  );
  summary.errorsSkipped = errorRowsSet.size;

  return NextResponse.json({
    mode: "commit",
    summary,
    issues,
  });
}

function buildSummary(sessions: ParsedSession[], issues: RowIssue[]) {
  const errorRows = new Set(
    issues.filter((i) => i.severity === "error").map((i) => i.row)
  );
  const warningRows = new Set(
    issues.filter((i) => i.severity === "warning").map((i) => i.row)
  );
  return {
    sessions: sessions.length,
    sessionsReady: sessions.filter((s) => !s.duplicate).length,
    duplicates: sessions.filter((s) => s.duplicate).length,
    catches: sessions.reduce((sum, s) => sum + s.catches.length, 0),
    errors: errorRows.size,
    warnings: warningRows.size,
  };
}

function shapeSessionForPreview(s: ParsedSession) {
  return {
    date: s.date,
    title: s.title,
    river_name: s.river_name,
    river_match: s.river_match,
    location: s.location,
    water_temp_f: s.water_temp_f,
    water_clarity: s.water_clarity,
    weather: s.weather,
    privacy: s.privacy,
    duplicate: !!s.duplicate,
    rowIndices: s.rowIndices,
    catches: s.catches.map((c) => ({
      rowIndex: c.rowIndex,
      species: c.species,
      length_inches: c.length_inches,
      fly_name: c.fly_name,
      fly_size: c.fly_size,
      fly_position: c.fly_position,
      quantities: c.quantities,
    })),
  };
}
