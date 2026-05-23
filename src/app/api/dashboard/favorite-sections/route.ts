import { NextRequest, NextResponse } from "next/server";
import {
  addFavoriteSection,
  listMyFavoriteSections,
} from "@/lib/db/favorite-sections";

export async function GET() {
  const sections = await listMyFavoriteSections();
  return NextResponse.json({ sections });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { riverId?: string; usgsSiteId?: string }
    | null;
  if (!body?.riverId || !body?.usgsSiteId) {
    return NextResponse.json({ error: "riverId and usgsSiteId required" }, { status: 400 });
  }
  const result = await addFavoriteSection(body.riverId, body.usgsSiteId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
