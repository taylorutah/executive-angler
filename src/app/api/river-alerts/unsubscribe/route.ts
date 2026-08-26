import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RIVER_ALERT_ENTITY } from "../constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { riverId?: unknown };
  const riverId = typeof body.riverId === "string" ? body.riverId.trim() : "";
  if (!riverId) return NextResponse.json({ error: "riverId is required" }, { status: 400 });

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("entity_type", RIVER_ALERT_ENTITY)
    .eq("entity_id", riverId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, riverId });
}
