"use server";
/**
 * Server actions for the catch logger on the session detail page.
 *
 * Rewritten on the unified Phase A schema:
 *   - configurations live in `user_fly_configurations` (no more `fly_variants`)
 *   - flies live in `flies` (no more `fly_patterns_v2`)
 *   - catches carry `configuration_id` as the primary fly link
 *
 * Function signatures are kept stable so callers compile; the `variant_id`
 * input field is treated as a `user_fly_configurations.id`.
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
  /** user_fly_configurations.id — the configuration the fish was caught on. */
  variant_id: string;
  species?: string;
  length_inches?: number;
  notes?: string;
  /** If true, the angler also lost the fly on this catch — decrement tied_count. */
  lost?: boolean;
}

export async function logCatchAction(input: LogCatchInput): Promise<{ ok: boolean; catchId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: config, error: cErr } = await supabase
    .from("user_fly_configurations")
    .select("id, fly_id, size, tied_count, times_used")
    .eq("id", input.variant_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (cErr || !config) return { ok: false, error: "Configuration not found." };

  let flyName: string | null = null;
  const { data: fly } = await supabase
    .from("flies")
    .select("name")
    .eq("id", config.fly_id as string)
    .maybeSingle();
  flyName = (fly as { name?: string } | null)?.name ?? null;

  const insertRow = {
    session_id: input.session_id,
    user_id: user.id,
    configuration_id: config.id,
    canonical_fly_id: config.fly_id,
    species: input.species ?? null,
    length_inches: input.length_inches ?? null,
    notes: input.notes ?? null,
    fly_name: flyName,
    fly_size: (config.size as string | null) ?? null,
    time_caught: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("catches")
    .insert(insertRow)
    .select("id")
    .single();
  if (insertErr) return { ok: false, error: insertErr.message };

  // Bump usage on the configuration; if lost, also decrement tied_count.
  const nowIso = new Date().toISOString();
  const updates: Record<string, unknown> = {
    times_used: ((config.times_used as number | null) ?? 0) + 1,
    last_used_at: nowIso,
  };
  if (input.lost) {
    updates.tied_count = Math.max(0, ((config.tied_count as number | null) ?? 0) - 1);
    updates.last_loss_at = nowIso;
  }
  await supabase
    .from("user_fly_configurations")
    .update(updates)
    .eq("id", config.id as string);

  revalidatePath(`/journal/${input.session_id}`);
  return { ok: true, catchId: inserted?.id };
}

export interface DeleteCatchInput {
  catch_id: string;
  session_id: string;
}

export async function deleteCatchAction(input: DeleteCatchInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("catches")
    .select("id, user_id, configuration_id")
    .eq("id", input.catch_id)
    .maybeSingle();
  if (!existing || (existing as { user_id?: string }).user_id !== user.id) {
    return { ok: false, error: "Catch not found." };
  }

  const { error } = await supabase.from("catches").delete().eq("id", input.catch_id);
  if (error) return { ok: false, error: error.message };

  // Decrement times_used (best-effort; floor at 0).
  const cfgId = (existing as { configuration_id?: string | null }).configuration_id;
  if (cfgId) {
    const { data: cfg } = await supabase
      .from("user_fly_configurations")
      .select("id, times_used")
      .eq("id", cfgId)
      .maybeSingle();
    if (cfg) {
      await supabase
        .from("user_fly_configurations")
        .update({ times_used: Math.max(0, ((cfg as { times_used?: number }).times_used ?? 0) - 1) })
        .eq("id", (cfg as { id: string }).id);
    }
  }

  revalidatePath(`/journal/${input.session_id}`);
  return { ok: true };
}
