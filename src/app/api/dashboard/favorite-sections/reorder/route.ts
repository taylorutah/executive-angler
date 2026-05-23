import { NextRequest, NextResponse } from "next/server";
import { reorderFavoriteSections } from "@/lib/db/favorite-sections";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { orderedIds?: string[] } | null;
  if (!body?.orderedIds || !Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: "orderedIds[] required" }, { status: 400 });
  }
  const result = await reorderFavoriteSections(body.orderedIds);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
