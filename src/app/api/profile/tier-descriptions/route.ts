import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_KEYS = ["kill", "support", "archive", "custom"] as const;
type TierKey = (typeof ALLOWED_KEYS)[number];
const MAX_LEN = 200;

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const incoming = body?.tier_descriptions;
    if (!incoming || typeof incoming !== "object") {
      return NextResponse.json({ error: "tier_descriptions object required." }, { status: 400 });
    }

    // Whitelist + sanitize. Empty string clears the override; null clears too.
    const cleaned: Partial<Record<TierKey, string | null>> = {};
    for (const key of ALLOWED_KEYS) {
      if (!(key in incoming)) continue;
      const raw = (incoming as Record<string, unknown>)[key];
      if (raw === null || raw === undefined) {
        cleaned[key] = null;
        continue;
      }
      if (typeof raw !== "string") {
        return NextResponse.json({ error: `${key} must be a string.` }, { status: 400 });
      }
      const trimmed = raw.trim().slice(0, MAX_LEN);
      cleaned[key] = trimmed.length === 0 ? null : trimmed;
    }

    // Merge with existing so a PATCH for one key doesn't clobber the others.
    const { data: existing } = await supabase
      .from("profiles")
      .select("tier_descriptions")
      .eq("user_id", user.id)
      .maybeSingle();
    const merged: Record<string, string> = {};
    const prior = (existing?.tier_descriptions ?? {}) as Record<string, unknown>;
    for (const key of ALLOWED_KEYS) {
      const next = cleaned[key];
      if (next === undefined) {
        const priorVal = prior[key];
        if (typeof priorVal === "string" && priorVal.trim()) merged[key] = priorVal;
      } else if (next !== null) {
        merged[key] = next;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, tier_descriptions: merged },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("[tier-descriptions PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ tier_descriptions: merged });
  } catch (err) {
    console.error("[tier-descriptions PATCH]", err);
    return NextResponse.json({ error: "Failed to update tier descriptions" }, { status: 500 });
  }
}
