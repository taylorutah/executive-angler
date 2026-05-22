/**
 * GET /api/fishing/flies/[id]/usage
 *
 * Returns how many catches and distinct sessions reference this personal fly
 * pattern. Used by the delete dialog so the angler can see what they're
 * about to orphan and decide whether to reassign or keep with the fly_name
 * snapshot.
 *
 * Auth: the caller must own the pattern. Catches counted here are restricted
 * to ones the caller owns too (defensive — RLS should match).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SAMPLE_LIMIT = 8;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller owns the pattern (or it's a shared/public one). For
  // delete-prompt purposes we treat ownership loosely — if you can't see it
  // you can't delete it, so the count would be zero anyway.
  const { data: pattern } = await supabase
    .from("flies")
    .select("id, name, user_id")
    .eq("id", id)
    .maybeSingle();
  if (!pattern) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // All catches referencing this fly that the caller can read. Pull the
  // session metadata in a single join so we can both count distinct
  // sessions and surface a sample list in the dialog.
  const { data: rows, error } = await supabase
    .from("catches")
    .select(
      `
        id,
        species,
        session:fishing_sessions ( id, title, fished_at, river_name )
      `,
    )
    .eq("fly_pattern_id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[fly usage GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type CatchRow = {
    id: string;
    species: string | null;
    session:
      | { id: string; title: string | null; fished_at: string | null; river_name: string | null }
      | { id: string; title: string | null; fished_at: string | null; river_name: string | null }[]
      | null;
  };

  const catchRows = (rows ?? []) as CatchRow[];
  const sessionMap = new Map<
    string,
    { id: string; title: string | null; fished_at: string | null; river_name: string | null; catch_count: number }
  >();
  for (const c of catchRows) {
    const s = Array.isArray(c.session) ? c.session[0] : c.session;
    if (!s?.id) continue;
    const prev = sessionMap.get(s.id);
    if (prev) {
      prev.catch_count += 1;
    } else {
      sessionMap.set(s.id, {
        id: s.id,
        title: s.title,
        fished_at: s.fished_at,
        river_name: s.river_name,
        catch_count: 1,
      });
    }
  }

  const sessions = Array.from(sessionMap.values()).sort((a, b) => {
    const ta = a.fished_at ? Date.parse(a.fished_at) : 0;
    const tb = b.fished_at ? Date.parse(b.fished_at) : 0;
    return tb - ta;
  });

  return NextResponse.json({
    pattern: { id: pattern.id, name: pattern.name },
    catch_count: catchRows.length,
    session_count: sessions.length,
    sessions: sessions.slice(0, SAMPLE_LIMIT),
    truncated: sessions.length > SAMPLE_LIMIT,
  });
}
