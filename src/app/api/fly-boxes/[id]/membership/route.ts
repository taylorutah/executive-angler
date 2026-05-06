/**
 * Fly Box Membership API — manage many-to-many relationship between
 * fly_boxes and user_fly_box (Stock Entries).
 *
 * GET    /api/fly-boxes/[id]/membership            → list memberships for this box
 * POST   /api/fly-boxes/[id]/membership            → add: { user_fly_box_id }
 * DELETE /api/fly-boxes/[id]/membership?entry=...  → remove one membership
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: boxId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("fly_box_membership")
    .select("box_id, user_fly_box_id, sort_order, added_at")
    .eq("box_id", boxId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ memberships: data ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: boxId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const userFlyBoxId =
    typeof body.user_fly_box_id === "string" ? body.user_fly_box_id : null;
  if (!userFlyBoxId)
    return NextResponse.json({ error: "user_fly_box_id is required" }, { status: 400 });

  // Verify the box belongs to the user (RLS would also catch this, but a
  // friendlier error here).
  const { data: box } = await supabase
    .from("fly_boxes")
    .select("id, user_id")
    .eq("id", boxId)
    .maybeSingle();
  if (!box || box.user_id !== user.id)
    return NextResponse.json({ error: "Box not found" }, { status: 404 });

  // Verify the entry belongs to the user.
  const { data: entry } = await supabase
    .from("user_fly_box")
    .select("id, user_id")
    .eq("id", userFlyBoxId)
    .maybeSingle();
  if (!entry || entry.user_id !== user.id)
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  // Compute next sort_order within this box.
  const { data: existing } = await supabase
    .from("fly_box_membership")
    .select("sort_order")
    .eq("box_id", boxId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSort = ((existing?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  const { error } = await supabase
    .from("fly_box_membership")
    .upsert(
      { box_id: boxId, user_fly_box_id: userFlyBoxId, sort_order: nextSort },
      { onConflict: "box_id,user_fly_box_id" },
    );
  if (error) {
    console.error("[POST membership] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: boxId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userFlyBoxId = req.nextUrl.searchParams.get("entry");
  if (!userFlyBoxId)
    return NextResponse.json({ error: "entry param is required" }, { status: 400 });

  // If this is the entry's last membership, the caller should pass `cascade=true`
  // to also delete the underlying user_fly_box row. Otherwise the entry survives
  // (orphaned, accessible via My Flies but not in any box).
  const { data: memberships } = await supabase
    .from("fly_box_membership")
    .select("box_id")
    .eq("user_fly_box_id", userFlyBoxId);
  const isLastBox = (memberships?.length ?? 0) <= 1;
  const cascade = req.nextUrl.searchParams.get("cascade") === "true";

  const { error } = await supabase
    .from("fly_box_membership")
    .delete()
    .eq("box_id", boxId)
    .eq("user_fly_box_id", userFlyBoxId);
  if (error) {
    console.error("[DELETE membership] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (isLastBox && cascade) {
    const { error: delErr } = await supabase
      .from("user_fly_box")
      .delete()
      .eq("id", userFlyBoxId)
      .eq("user_id", user.id);
    if (delErr) {
      console.error("[DELETE membership cascade] error:", delErr);
      return NextResponse.json(
        { error: "Membership removed but entry delete failed: " + delErr.message },
        { status: 500 },
      );
    }
  }
  return NextResponse.json({ success: true, isLastBox });
}
