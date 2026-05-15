/**
 * /api/fishing/fly-configurations/quick-add
 *
 * One-click "Add to my box" from the fly detail page.
 *
 * - If the user has 1 box (or a default flag set), creates a config with
 *   canonical defaults and adds it to that box.
 * - If the user has 2+ boxes, the UI must call with an explicit box_id
 *   (returns 400 otherwise so the UI can prompt for a picker).
 *
 * Body: { fly_id: string, box_id?: string, size?: string, slot_overrides?: {} }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listMyBoxes, quickAddFlyToBox } from "@/lib/db/fly-model";
import type { SlotOverrides } from "@/types/flies";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const flyId = typeof body.fly_id === "string" ? body.fly_id : null;
  if (!flyId) return NextResponse.json({ error: "fly_id is required" }, { status: 400 });

  const explicitBoxId = typeof body.box_id === "string" ? body.box_id : null;

  // Multi-box check: when the user has 2+ boxes and didn't specify, ask the
  // UI to render the picker.
  if (!explicitBoxId) {
    const boxes = await listMyBoxes();
    const hasDefault = boxes.some((b) => b.is_default);
    if (boxes.length >= 2 && !hasDefault) {
      return NextResponse.json(
        {
          needsBoxPicker: true,
          boxes: boxes.map((b) => ({ id: b.id, name: b.name, tier: b.tier, is_default: b.is_default })),
        },
        { status: 409 },
      );
    }
  }

  const result = await quickAddFlyToBox({
    flyId,
    boxId: explicitBoxId ?? undefined,
    size: (body.size as string | null) ?? null,
    slot_overrides: (body.slot_overrides as SlotOverrides | undefined) ?? {},
  });
  if (!result) {
    return NextResponse.json({ error: "Could not add — no boxes found?" }, { status: 500 });
  }
  return NextResponse.json(result);
}
