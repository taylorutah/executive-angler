/**
 * /api/fishing/fly-configurations/box
 *
 * POST   — add a configuration to a box
 * DELETE — remove a configuration from a box
 *
 * Body / query params: { configuration_id, box_id }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  addConfigurationToBox,
  removeConfigurationFromBox,
} from "@/lib/db/fly-model";

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
  const configurationId = typeof body.configuration_id === "string" ? body.configuration_id : null;
  const boxId = typeof body.box_id === "string" ? body.box_id : null;
  if (!configurationId || !boxId) {
    return NextResponse.json({ error: "configuration_id and box_id are required" }, { status: 400 });
  }
  const ok = await addConfigurationToBox({ configurationId, boxId });
  if (!ok) return NextResponse.json({ error: "Failed to add" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const configurationId = req.nextUrl.searchParams.get("configuration_id");
  const boxId = req.nextUrl.searchParams.get("box_id");
  if (!configurationId || !boxId) {
    return NextResponse.json({ error: "configuration_id and box_id are required" }, { status: 400 });
  }
  const ok = await removeConfigurationFromBox({ configurationId, boxId });
  if (!ok) return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
