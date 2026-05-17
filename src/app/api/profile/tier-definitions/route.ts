import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_TIER_KEYS,
  MAX_TIERS,
  TIER_DESCRIPTION_MAX,
  TIER_KEY_PATTERN,
  TIER_LABEL_MAX,
  type TierDefinition,
} from "@/lib/flies/tier-definitions";

/**
 * Replace the caller's entire tier_definitions array. Validates uniqueness +
 * shape, then refuses the write if any existing fly_box would be orphaned
 * (its tier key missing from the new list).
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const incoming = body?.tier_definitions;
    if (!Array.isArray(incoming)) {
      return NextResponse.json({ error: "tier_definitions array required." }, { status: 400 });
    }
    if (incoming.length === 0) {
      return NextResponse.json({ error: "At least one tier required." }, { status: 400 });
    }
    if (incoming.length > MAX_TIERS) {
      return NextResponse.json({ error: `Max ${MAX_TIERS} tiers.` }, { status: 400 });
    }

    const cleaned: TierDefinition[] = [];
    const seen = new Set<string>();
    for (const raw of incoming) {
      if (!raw || typeof raw !== "object") {
        return NextResponse.json({ error: "Each tier must be an object." }, { status: 400 });
      }
      const r = raw as Record<string, unknown>;
      const key = typeof r.key === "string" ? r.key.trim() : "";
      const label = typeof r.label === "string" ? r.label.trim() : "";
      const description = typeof r.description === "string" ? r.description.trim() : "";
      if (!TIER_KEY_PATTERN.test(key)) {
        return NextResponse.json(
          { error: `Invalid key "${key}". Use lowercase letters, numbers, dashes.` },
          { status: 400 },
        );
      }
      if (!label) {
        return NextResponse.json({ error: "Label required for every tier." }, { status: 400 });
      }
      if (label.length > TIER_LABEL_MAX) {
        return NextResponse.json({ error: `Label max ${TIER_LABEL_MAX} chars.` }, { status: 400 });
      }
      if (description.length > TIER_DESCRIPTION_MAX) {
        return NextResponse.json(
          { error: `Description max ${TIER_DESCRIPTION_MAX} chars.` },
          { status: 400 },
        );
      }
      if (seen.has(key)) {
        return NextResponse.json({ error: `Duplicate tier key "${key}".` }, { status: 400 });
      }
      seen.add(key);
      cleaned.push({ key, label, description });
    }

    // The 4 baseline tiers must remain so existing boxes keep their group.
    for (const k of DEFAULT_TIER_KEYS) {
      if (!seen.has(k)) {
        return NextResponse.json(
          { error: `Cannot remove built-in tier "${k}". Rename instead.` },
          { status: 400 },
        );
      }
    }

    // Block removal of any user-defined tier that still has boxes.
    const { data: tierRows } = await supabase
      .from("fly_boxes")
      .select("tier")
      .eq("user_id", user.id);
    const inUse = new Set<string>();
    for (const r of (tierRows ?? []) as { tier: string }[]) inUse.add(r.tier);
    for (const used of inUse) {
      if (!seen.has(used)) {
        return NextResponse.json(
          { error: `Tier "${used}" still has boxes. Reassign or rename first.` },
          { status: 400 },
        );
      }
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, tier_definitions: cleaned },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("[tier-definitions PUT]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ tier_definitions: cleaned });
  } catch (err) {
    console.error("[tier-definitions PUT]", err);
    return NextResponse.json({ error: "Failed to save tier definitions" }, { status: 500 });
  }
}
