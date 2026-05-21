/**
 * /api/fishing/fly-views
 *
 * CRUD for user-defined saved views in the Flies Workspace.
 *
 * GET  — list the current user's saved views (virtual views are computed
 *        client-side from the constant `VIRTUAL_VIEWS`, not returned here).
 * POST — create a new saved view.
 *
 * iOS contract: this endpoint is web-only. iOS does not call it.
 *
 * Requires the `user_fly_views` migration to be applied. When the table
 * doesn't exist (Postgres error 42P01), GET returns [] and POST returns 503
 * so callers can degrade gracefully.
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

// Light, hand-rolled validation — keeps zod off the critical path and
// matches the project's style in other API routes.
function parseBody(raw: unknown): {
  ok: true;
  value: {
    name: string;
    filter: Record<string, unknown>;
    sort: Record<string, unknown>;
    view_type: ViewType;
    is_pinned: boolean;
    sort_order: number;
  };
} | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const b = raw as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { ok: false, error: "name is required" };
  if (name.length > 80) return { ok: false, error: "name too long (max 80)" };

  const filter =
    b.filter && typeof b.filter === "object" && !Array.isArray(b.filter)
      ? (b.filter as Record<string, unknown>)
      : {};
  const sort =
    b.sort && typeof b.sort === "object" && !Array.isArray(b.sort)
      ? (b.sort as Record<string, unknown>)
      : { field: "name", direction: "asc" };

  const viewType =
    typeof b.view_type === "string" && VALID_VIEW_TYPES.includes(b.view_type as ViewType)
      ? (b.view_type as ViewType)
      : "grid";

  const isPinned = b.is_pinned === true;
  const sortOrder =
    typeof b.sort_order === "number" && Number.isFinite(b.sort_order)
      ? Math.max(0, Math.floor(b.sort_order))
      : 0;

  return {
    ok: true,
    value: {
      name,
      filter,
      sort,
      view_type: viewType,
      is_pinned: isPinned,
      sort_order: sortOrder,
    },
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_fly_views")
    .select("*")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      // Migration not yet applied — degrade gracefully.
      return NextResponse.json({ views: [] });
    }
    console.error("[fly-views GET]", error);
    return NextResponse.json({ error: "Failed to list views" }, { status: 500 });
  }

  return NextResponse.json({ views: data ?? [] });
}

export async function POST(req: NextRequest) {
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

  const parsed = parseBody(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_fly_views")
    .insert({
      user_id: user.id,
      ...parsed.value,
    })
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
      // Unique constraint on (user_id, name).
      return NextResponse.json(
        { error: "A view with that name already exists" },
        { status: 409 },
      );
    }
    console.error("[fly-views POST]", error);
    return NextResponse.json({ error: "Failed to create view" }, { status: 500 });
  }

  return NextResponse.json({ view: data });
}
