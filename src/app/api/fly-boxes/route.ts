/**
 * Fly Boxes CRUD — named, tiered containers per user.
 *
 * GET    /api/fly-boxes         → list user's boxes (tier-grouped, with fly counts)
 * POST   /api/fly-boxes         → create a new box {name, tier, description?, icon?}
 * PATCH  /api/fly-boxes?id=...  → update a box
 * DELETE /api/fly-boxes?id=...  → delete a box (memberships cascade; entries survive
 *                                   if they belong to other boxes)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyBoxes } from "@/lib/db/fly-boxes";

const TIERS = new Set(["kill", "support", "archive", "custom"]);

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const boxes = await getMyBoxes(user.id);
  return NextResponse.json({ boxes });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const tier = typeof body.tier === "string" && TIERS.has(body.tier) ? body.tier : "custom";
  const description = typeof body.description === "string" ? body.description.trim() || null : null;
  const icon = typeof body.icon === "string" ? body.icon.trim() || null : null;
  const cover_image_url =
    typeof body.cover_image_url === "string" ? body.cover_image_url.trim() || null : null;
  const total_capacity =
    typeof body.total_capacity === "number" && body.total_capacity > 0
      ? body.total_capacity
      : null;

  // Compute next sort_order within this tier
  const { data: existing } = await supabase
    .from("fly_boxes")
    .select("sort_order")
    .eq("user_id", user.id)
    .eq("tier", tier)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSort = ((existing?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  const { data, error } = await supabase
    .from("fly_boxes")
    .insert({
      user_id: user.id,
      name,
      tier,
      description,
      icon,
      cover_image_url,
      total_capacity,
      sort_order: nextSort,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[POST /api/fly-boxes] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ box: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.tier === "string" && TIERS.has(body.tier)) updates.tier = body.tier;
  if ("description" in body) updates.description = body.description ?? null;
  if ("icon" in body) updates.icon = body.icon ?? null;
  if ("cover_image_url" in body) updates.cover_image_url = body.cover_image_url ?? null;
  if (typeof body.sort_order === "number") updates.sort_order = body.sort_order;
  if ("total_capacity" in body) updates.total_capacity = body.total_capacity ?? null;

  // Promoting a box to default: unset the previous default first so we don't
  // end up with two. (The user can also flip the current default off without
  // designating a replacement; we don't enforce always-one-default here.)
  if (body.is_default === true) {
    updates.is_default = true;
    await supabase
      .from("fly_boxes")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .neq("id", id);
  } else if (body.is_default === false) {
    updates.is_default = false;
  }

  const { data, error } = await supabase
    .from("fly_boxes")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) {
    console.error("[PATCH /api/fly-boxes] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ box: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Block deleting the user's only/default box — they need at least one home.
  const { data: existing } = await supabase
    .from("fly_boxes")
    .select("id, is_default")
    .eq("user_id", user.id);
  if ((existing?.length ?? 0) <= 1) {
    return NextResponse.json(
      { error: "Cannot delete your only fly box — create another box first." },
      { status: 400 },
    );
  }
  const target = existing?.find((b) => b.id === id);
  if (target?.is_default) {
    return NextResponse.json(
      { error: "Cannot delete the default box. Mark another as default first." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("fly_boxes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[DELETE /api/fly-boxes] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
