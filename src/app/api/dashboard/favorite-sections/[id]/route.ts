import { NextResponse } from "next/server";
import {
  removeFavoriteSection,
  setFavoriteSectionPosition,
} from "@/lib/db/favorite-sections";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { position?: unknown } | null;
  const position = Number(body?.position);
  if (!Number.isFinite(position)) {
    return NextResponse.json({ error: "position must be a number" }, { status: 400 });
  }
  const result = await setFavoriteSectionPosition(id, position);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

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
