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

  const { data: river, error: riverError } = await supabase
    .from("rivers")
    .select("id")
    .eq("id", riverId)
    .maybeSingle();
  if (riverError) return NextResponse.json({ error: riverError.message }, { status: 500 });
  if (!river) return NextResponse.json({ error: "Unknown river" }, { status: 404 });

  const { error } = await supabase.from("user_favorites").insert({
    user_id: user.id,
    entity_type: RIVER_ALERT_ENTITY,
    entity_id: riverId,
  });
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, riverId });
}
