import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim().toLowerCase() || "";
  const current = req.nextUrl.searchParams.get("current")?.trim().toLowerCase() || "";
  if (username === current) return NextResponse.json({ available: true });
  if (!username || username.length < 3) return NextResponse.json({ available: false });
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("user_id").eq("username", username).maybeSingle();
  return NextResponse.json({ available: !data });
}
