"use server";
/**
 * Server actions for the catch logger on the session detail page.
 *
 * - setActiveBoxAction        Picks/changes which fly_box is "active" for
 *                             this session (the box the angler is fishing
 *                             from). The catch logger renders that box's
 *                             variants as the primary tile grid.
 * - logCatchAction            Inserts a row in `catches` with variant_id,
 *                             species, length. Bumps fly_variant_stock
 *                             times_used + last_used_at. Revalidates the
 *                             session page so the catches list refreshes.
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SetActiveBoxInput {
  session_id: string;
  box_id: string | null;
}

export async function setActiveBoxAction(input: SetActiveBoxInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("fishing_sessions")
    .update({ active_box_id: input.box_id })
    .eq("id", input.session_id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/journal/${input.session_id}`);
  return { ok: true };
}

export interface LogCatchInput {
  session_id: string;
  variant_id: string;
  species?: string;
  length_inches?: number;
  notes?: string;
}

export async function logCatchAction(input: LogCatchInput): Promise<{ ok: boolean; catchId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Look up variant + pattern for denormalized fields (fly_name, fly_size).
  const { data: variant, error: vErr } = await supabase
    .from("fly_variants")
    .select("id, size, pattern_id")
    .eq("id", input.variant_id)
    .maybeSingle();
  if (vErr || !variant) return { ok: false, error: "Variant not found." };

  let flyName: string | null = null;
  if (variant.pattern_id) {
    const { data: p } = await supabase
      .from("fly_patterns_v2")
      .select("name")
      .eq("id", variant.pattern_id)
      .maybeSingle();
    flyName = p?.name ?? null;
  }

  const insertRow = {
    session_id: input.session_id,
    user_id: user.id,
    variant_id: variant.id,
    species: input.species ?? null,
    length_inches: input.length_inches ?? null,
    notes: input.notes ?? null,
    fly_name: flyName,                              // denormalized
    fly_size: variant.size ?? null,                 // denormalized
    time_caught: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("catches")
    .insert(insertRow)
    .select("id")
    .single();
  if (insertErr) return { ok: false, error: insertErr.message };

  // Bump usage stats on the variant stock row (best-effort; ignore failure).
  // Use upsert pattern so a brand-new variant gets a stock row created.
  const nowIso = new Date().toISOString();
  const { data: existingStock } = await supabase
    .from("fly_variant_stock")
    .select("id, times_used")
    .eq("user_id", user.id)
    .eq("variant_id", variant.id)
    .maybeSingle();
  if (existingStock) {
    await supabase
      .from("fly_variant_stock")
      .update({
        times_used: (existingStock.times_used ?? 0) + 1,
        last_used_at: nowIso,
      })
      .eq("id", existingStock.id);
  } else {
    await supabase.from("fly_variant_stock").insert({
      user_id: user.id,
      variant_id: variant.id,
      times_used: 1,
      last_used_at: nowIso,
    });
  }

  revalidatePath(`/journal/${input.session_id}`);
  return { ok: true, catchId: inserted?.id };
}
