import { NextResponse } from "next/server";
import { loadFlyPickerBundle } from "@/lib/db/fly-picker";

/**
 * GET /api/flies/picker-data
 *
 * Bundle endpoint for the catch-edit fly picker. Returns the full set of
 * boxes, variants (with box membership), orphan personal patterns, and a
 * pattern-level recents window. One round-trip replaces the prior limited
 * `/api/flies/search?limit=12` call.
 */
export async function GET() {
  const bundle = await loadFlyPickerBundle();
  return NextResponse.json(bundle);
}
