/**
 * POST /api/fishing/flies/[id]/reassign
 *
 * Bulk-update all catches that currently point at this fly pattern to point
 * at a different fly pattern instead. Used by the delete dialog when the
 * angler chooses "reassign to another fly" so journal records stay clean
 * before the source pattern is hard-deleted.
 *
 * Body: { target_fly_pattern_id: string }
 *
 * Scope: only catches owned by the caller, regardless of who owns the source
 * pattern. The target pattern must also belong to the caller — we don't
 * silently reassign a user's catches to someone else's fly.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
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

  const body = (await req.json().catch(() => ({}))) as {
    target_fly_pattern_id?: unknown;
  };
  const targetId =
    typeof body.target_fly_pattern_id === "string" && body.target_fly_pattern_id
      ? body.target_fly_pattern_id
      : null;
  if (!targetId) {
    return NextResponse.json(
      { error: "target_fly_pattern_id is required" },
      { status: 400 },
    );
  }
  if (targetId === id) {
    return NextResponse.json(
      { error: "Target pattern must be different from source" },
      { status: 400 },
    );
  }

  // Confirm the caller owns the target. Without this check, a malicious
  // client could reassign their catches to a stranger's fly and produce
  // confusing analytics.
  const { data: target } = await supabase
    .from("flies")
    .select("id, user_id, name")
    .eq("id", targetId)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: "Target fly not found" }, { status: 404 });
  }
  if (target.user_id && target.user_id !== user.id) {
    return NextResponse.json(
      { error: "Target fly must be one of your own patterns" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("catches")
    .update({
      fly_pattern_id: targetId,
      // Refresh the denormalized name snapshot to the new fly's name so
      // older renderers that read from catches.fly_name see the right
      // label too.
      fly_name: target.name,
    })
    .eq("user_id", user.id)
    .eq("fly_pattern_id", id)
    .select("id");

  if (error) {
    console.error("[fly reassign POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    reassigned_count: data?.length ?? 0,
    target: { id: target.id, name: target.name },
  });
}
