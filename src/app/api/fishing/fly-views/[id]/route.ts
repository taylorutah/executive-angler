/**
 * /api/fishing/fly-views/[id]
 *
 * PATCH  — update a saved view (rename, change filter/sort/view_type, pin)
 * DELETE — remove a saved view
 *
 * Same iOS contract + missing-table fallback as the parent route.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ViewType = "grid" | "table" | "kanban" | "group-by-box";
const VALID_VIEW_TYPES: ViewType[] = [
  "grid",
  "table",
  "kanban",
  "group-by-box",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }
  const b = raw as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  if (typeof b.name === "string") {
    const n = b.name.trim();
    if (!n) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    if (n.length > 80) return NextResponse.json({ error: "name too long" }, { status: 400 });
    patch.name = n;
  }
  if (b.filter && typeof b.filter === "object" && !Array.isArray(b.filter)) {
    patch.filter = b.filter;
  }
  if (b.sort && typeof b.sort === "object" && !Array.isArray(b.sort)) {
    patch.sort = b.sort;
  }
  if (typeof b.view_type === "string" && VALID_VIEW_TYPES.includes(b.view_type as ViewType)) {
    patch.view_type = b.view_type;
  }
  if (typeof b.is_pinned === "boolean") {
    patch.is_pinned = b.is_pinned;
  }
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.max(0, Math.floor(b.sort_order));
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No updatable fields supplied" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_fly_views")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id) // RLS also enforces, but explicit defense-in-depth.
    .select()
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Saved views are not enabled yet" },
        { status: 503 },
      );
    }
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A view with that name already exists" },
        { status: 409 },
      );
    }
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "View not found" }, { status: 404 });
    }
    console.error("[fly-views PATCH]", error);
    return NextResponse.json({ error: "Failed to update view" }, { status: 500 });
  }

  return NextResponse.json({ view: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const { error } = await supabase
    .from("user_fly_views")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Saved views are not enabled yet" },
        { status: 503 },
      );
    }
    console.error("[fly-views DELETE]", error);
    return NextResponse.json({ error: "Failed to delete view" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
