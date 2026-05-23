import { NextResponse } from "next/server";
import { removeFavoriteSection } from "@/lib/db/favorite-sections";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await removeFavoriteSection(id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
