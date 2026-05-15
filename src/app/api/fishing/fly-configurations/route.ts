/**
 * /api/fishing/fly-configurations
 *
 * CRUD for user_fly_configurations (the user's saved versions of a fly).
 *
 * POST   — create a configuration (optionally add to a box at same time)
 * PATCH  — update fields on an existing configuration
 * DELETE — remove a configuration (cascades box memberships)
 *
 * GET    — list configurations for a given fly_id (or all, if none specified)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
  addConfigurationToBox,
  listMyConfigurationsForFly,
  listAllMyConfigurations,
} from "@/lib/db/fly-model";
import type { SlotOverrides } from "@/types/flies";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const flyId = req.nextUrl.searchParams.get("fly_id");
  if (flyId) {
    const rows = await listMyConfigurationsForFly(flyId);
    return NextResponse.json({ configurations: rows });
  }
  const all = await listAllMyConfigurations();
  return NextResponse.json({ configurations: all });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const flyId = typeof body.fly_id === "string" ? body.fly_id : null;
  if (!flyId) {
    return NextResponse.json({ error: "fly_id is required" }, { status: 400 });
  }

  const created = await createConfiguration({
    fly_id: flyId,
    nickname: (body.nickname as string | null) ?? null,
    size: (body.size as string | null) ?? null,
    slot_overrides: (body.slot_overrides as SlotOverrides | undefined) ?? {},
    tied_count: typeof body.tied_count === "number" ? body.tied_count : 0,
    bought_count: typeof body.bought_count === "number" ? body.bought_count : 0,
    target_count: typeof body.target_count === "number" ? body.target_count : 0,
    is_favorite: Boolean(body.is_favorite),
    is_tie_next: Boolean(body.is_tie_next),
    personal_notes: (body.personal_notes as string | null) ?? null,
  });
  if (!created) {
    return NextResponse.json({ error: "Failed to create configuration" }, { status: 500 });
  }

  // Optional: add to a box atomically.
  const boxId = typeof body.box_id === "string" ? body.box_id : null;
  if (boxId) {
    await addConfigurationToBox({ configurationId: created.id, boxId });
  }

  return NextResponse.json({ configuration: created, addedToBoxId: boxId });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  for (const key of [
    "nickname", "size", "slot_overrides",
    "tied_count", "bought_count", "target_count",
    "is_favorite", "is_tie_next", "tie_next_status",
    "tie_next_target_qty", "tie_next_notes", "personal_notes",
  ]) {
    if (key in body) patch[key] = body[key];
  }

  const updated = await updateConfiguration(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
  return NextResponse.json({ configuration: updated });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const ok = await deleteConfiguration(id);
  if (!ok) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
