import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  buildFlyboxCsv,
  flyboxExportFilename,
  loadFlyboxExport,
  parseFlyboxSelection,
} from "@/lib/export/flybox";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selection = parseFlyboxSelection(searchParams);

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (selection.kind === "empty") {
    return NextResponse.json({ error: "No boxes selected" }, { status: 400 });
  }

  try {
    const loaded = await loadFlyboxExport(supabase, user.id, selection);
    if (!loaded.ok) {
      return NextResponse.json({ error: loaded.error }, { status: 400 });
    }

    const csvContent = buildFlyboxCsv(loaded.data.rows);
    const filename = flyboxExportFilename(loaded.data.boxes, "csv");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Flybox CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
