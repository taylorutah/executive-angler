import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";

export const revalidate = 3600;

export async function GET() {
  const supabase = createStaticClient();

  const { data: brands, error } = await supabase
    .from("gear_brands")
    .select("name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("[/api/gear/makers] error:", error);
    return NextResponse.json({ error: "Failed to load makers" }, { status: 500 });
  }

  return NextResponse.json({ makers: brands ?? [] });
}
