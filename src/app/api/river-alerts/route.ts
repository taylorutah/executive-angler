import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RIVER_ALERT_ENTITY } from "./constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_favorites")
    .select("entity_id")
    .eq("user_id", user.id)
    .eq("entity_type", RIVER_ALERT_ENTITY);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    riverIds: (data ?? []).map((row) => row.entity_id).filter(Boolean),
  });
}
