/**
 * /api/fishing/flies/[id]
 *
 * DELETE — soft-archive a fly by setting `deleted_at = now()`.
 *
 * Soft-delete (vs hard) so:
 *   - Catches with `fly_pattern_id` pointing at this fly stay intact.
 *     The user's fishing log isn't damaged by deleting a fly.
 *   - We can offer an Undo affordance trivially (UPDATE … SET deleted_at = NULL).
 *
 * Permission rules:
 *   - status='private' or 'pending': only the submitter can delete.
 *   - status='approved' (canonical): only admins can delete (rare; usually
 *     you'd reject a submission before it gets approved).
 *
 * GET — fetch a single fly by id (used by the optimistic Undo flow; reads
 *       deleted_at so the client knows whether the row is currently archived).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flies")
    .select("id, slug, name, status, submitted_by_user_id, deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ fly: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load to enforce owner check + decide if undo is allowed.
  const { data: fly, error: loadErr } = await supabase
    .from("flies")
    .select("id, status, submitted_by_user_id, deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (loadErr) {
    return NextResponse.json({ error: loadErr.message }, { status: 500 });
  }
  if (!fly) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const viewerIsAdmin = isAdmin(user.email);
  const isOwner = fly.submitted_by_user_id === user.id;
  const isPrivate = fly.status === "private" || fly.status === "pending";

  // Owner can delete their own private/pending flies. Admins can delete anything.
  if (!viewerIsAdmin && !(isOwner && isPrivate)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // Undo: support DELETE with `?restore=1` to flip deleted_at back to null.
  const restore = req.nextUrl.searchParams.get("restore") === "1";

  const { error: updateErr } = await supabase
    .from("flies")
    .update({ deleted_at: restore ? null : new Date().toISOString() })
    .eq("id", id);
  if (updateErr) {
    console.error("[flies DELETE]", updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, restored: restore });
}
