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
 *     Goes through the cookies-aware client; the RLS policy
 *     `flies_update_own_private` (added 2026-05-21) gates the UPDATE.
 *   - status='approved' (canonical): only admins can delete. Routed
 *     through the service-role client so the user-scoped UPDATE policy
 *     above doesn't block it.
 *
 * Hardening: every UPDATE round-trips with `.select()` so a 0-row
 * outcome (RLS silently denied, or row vanished between checks) is
 * surfaced as a 403/404 instead of a misleading 200.
 *
 * GET — fetch a single fly by id (used by the optimistic Undo flow).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

// Service-role client — bypasses RLS. Used only for admin actions on
// approved canonicals (private/pending paths use the user's session so
// owner checks happen at the policy layer too).
let _service: ReturnType<typeof createServiceClient> | null = null;
function service() {
  if (!_service) {
    _service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _service;
}

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

  // Load to decide WHICH client (user vs service) to use for the UPDATE.
  // The user can see their own private/pending flies via RLS; for approved
  // canonicals we read with the service client.
  const viewerIsAdmin = isAdmin(user.email);
  const readClient = viewerIsAdmin ? service() : supabase;
  const { data: fly, error: loadErr } = await readClient
    .from("flies")
    .select("id, status, submitted_by_user_id, deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (loadErr) {
    console.error("[flies DELETE load]", loadErr);
    return NextResponse.json({ error: loadErr.message }, { status: 500 });
  }
  if (!fly) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = fly.submitted_by_user_id === user.id;
  const isPrivate = fly.status === "private" || fly.status === "pending";
  const isApprovedCanonical = fly.status === "approved";

  if (!viewerIsAdmin && !(isOwner && isPrivate)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // Undo: support DELETE with `?restore=1` to flip deleted_at back to null.
  const restore = req.nextUrl.searchParams.get("restore") === "1";
  const payload = { deleted_at: restore ? null : new Date().toISOString() };

  // Approved canonicals need the service client (no UPDATE policy applies
  // to admins via user session). Private/pending go through the cookies
  // client so the flies_update_own_private RLS policy enforces owner +
  // status. .select() the result so a zero-row update (RLS denial,
  // race, etc.) surfaces as an error instead of a misleading 200.
  const writeClient =
    viewerIsAdmin && isApprovedCanonical ? service() : supabase;
  const { data: updated, error: updateErr } = await writeClient
    .from("flies")
    .update(payload)
    .eq("id", id)
    .select("id, deleted_at");

  if (updateErr) {
    console.error("[flies DELETE update]", updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }
  if (!updated || updated.length === 0) {
    // RLS denied silently. Surface so the UI can show a real error.
    console.warn(
      "[flies DELETE] 0 rows updated — RLS denied?",
      { id, viewerIsAdmin, isOwner, isPrivate, status: fly.status },
    );
    return NextResponse.json(
      { error: "Update blocked by permissions" },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true, restored: restore });
}
