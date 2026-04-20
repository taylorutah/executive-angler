import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ isPremium: false, isLoggedIn: false });

  const isPremium = await checkPremium(supabase, user.id, user.email);
  const resp = NextResponse.json({ isPremium, isLoggedIn: true });
  resp.headers.set("Cache-Control", "no-store");
  return resp;
}
