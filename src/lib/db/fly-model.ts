/**
 * Query module for the post-2026-05-15 fly model — flies table + per-user
 * configurations. Replaces canonical/personal split queries in fly-v2.ts.
 *
 * Static reads (library list, fly detail anonymous render) use createStaticClient
 * so pages can statically generate. User-scoped reads use createClient.
 */
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import type {
  Fly,
  FlyConfiguration,
  FlyConfigurationWithBoxes,
  FlyConfigurationInput,
  FlyBoxV2,
  SlotOverrides,
} from "@/types/flies";

// ────────────────────────────────────────────────────────────────────────────
// Flies (public library)
// ────────────────────────────────────────────────────────────────────────────

/** All approved canonical flies. Used by the library page. */
export async function listApprovedFlies(): Promise<Fly[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("flies")
    .select("*")
    .eq("status", "approved")
    .order("name");
  if (error) {
    console.error("[listApprovedFlies]", error);
    return [];
  }
  return (data ?? []) as Fly[];
}

/** Approved fly by slug. Falls back to slug-redirects and submitter pending. */
export async function getFlyBySlug(slug: string): Promise<Fly | null> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("flies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  if (data) return data as Fly;

  // Slug redirect (e.g. walt-s-worm → walts-worm).
  const { data: redirect } = await supabase
    .from("fly_slug_redirects")
    .select("to_slug")
    .eq("from_slug", slug)
    .maybeSingle();
  if (redirect?.to_slug) {
    const { data: redirected } = await supabase
      .from("flies")
      .select("*")
      .eq("slug", redirect.to_slug)
      .eq("status", "approved")
      .maybeSingle();
    if (redirected) return redirected as Fly;
  }

  // Submitter peek: pending/private rows visible to their owner via RLS.
  const auth = await createClient();
  const { data: own } = await auth
    .from("flies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (own ?? null) as Fly | null;
}

/** Fly by ID (any status — RLS gates visibility). */
export async function getFlyById(id: string): Promise<Fly | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as Fly | null;
}

/** Lookup a slug-rename redirect target. */
export async function lookupFlySlugRedirect(
  fromSlug: string,
): Promise<{ toSlug: string } | null> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("fly_slug_redirects")
    .select("to_slug")
    .eq("from_slug", fromSlug)
    .maybeSingle();
  if (!data?.to_slug) return null;
  return { toSlug: data.to_slug as string };
}

// ────────────────────────────────────────────────────────────────────────────
// Configurations (per-user)
// ────────────────────────────────────────────────────────────────────────────

/** Current user's configurations for a single fly, with box memberships. */
export async function listMyConfigurationsForFly(
  flyId: string,
): Promise<FlyConfigurationWithBoxes[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: configs, error } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", user.id)
    .eq("fly_id", flyId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[listMyConfigurationsForFly]", error);
    return [];
  }
  if (!configs?.length) return [];

  const ids = configs.map((c) => c.id as string);
  const { data: entries } = await supabase
    .from("fly_box_entries_v3")
    .select("configuration_id, box_id, sort_order, fly_boxes(name)")
    .in("configuration_id", ids);

  const byConfig = new Map<string, { box_id: string; box_name: string; sort_order: number }[]>();
  for (const e of (entries ?? []) as unknown as Array<{
    configuration_id: string;
    box_id: string;
    sort_order: number;
    fly_boxes?: { name: string } | { name: string }[] | null;
  }>) {
    const boxObj = Array.isArray(e.fly_boxes) ? e.fly_boxes[0] : e.fly_boxes;
    const list = byConfig.get(e.configuration_id) ?? [];
    list.push({
      box_id: e.box_id,
      box_name: boxObj?.name ?? "Box",
      sort_order: e.sort_order ?? 0,
    });
    byConfig.set(e.configuration_id, list);
  }

  return (configs as FlyConfiguration[]).map((c) => ({
    ...c,
    in_boxes: byConfig.get(c.id) ?? [],
  }));
}

/** All of the current user's configurations across all flies. */
export async function listAllMyConfigurations(): Promise<FlyConfiguration[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[listAllMyConfigurations]", error);
    return [];
  }
  return (data ?? []) as FlyConfiguration[];
}

/** Configurations the user has marked tie-next. */
export async function listMyTieNextConfigurations(): Promise<FlyConfiguration[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_tie_next", true)
    .order("tie_next_order", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[listMyTieNextConfigurations]", error);
    return [];
  }
  return (data ?? []) as FlyConfiguration[];
}

/** Single configuration by id (owner-scoped via RLS). */
export async function getMyConfigurationById(
  id: string,
): Promise<FlyConfiguration | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as FlyConfiguration | null;
}

/** Create a configuration for the current user. */
export async function createConfiguration(
  input: FlyConfigurationInput,
): Promise<FlyConfiguration | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("user_fly_configurations")
    .insert({
      user_id: user.id,
      fly_id: input.fly_id,
      nickname: input.nickname ?? null,
      size: input.size ?? null,
      slot_overrides: input.slot_overrides ?? {},
      tied_count: input.tied_count ?? 0,
      bought_count: input.bought_count ?? 0,
      target_count: input.target_count ?? 0,
      is_favorite: input.is_favorite ?? false,
      is_tie_next: input.is_tie_next ?? false,
      tie_next_status: input.tie_next_status ?? null,
      tie_next_target_qty: input.tie_next_target_qty ?? null,
      tie_next_notes: input.tie_next_notes ?? null,
      personal_notes: input.personal_notes ?? null,
    })
    .select("*")
    .single();
  if (error) {
    console.error("[createConfiguration]", error);
    return null;
  }
  return data as FlyConfiguration;
}

/** Update a configuration. Owner-scoped via RLS. */
export async function updateConfiguration(
  id: string,
  patch: Partial<FlyConfigurationInput>,
): Promise<FlyConfiguration | null> {
  const supabase = await createClient();
  const row: Record<string, unknown> = {};
  for (const k of [
    "nickname", "size", "slot_overrides",
    "tied_count", "bought_count", "target_count",
    "is_favorite", "is_tie_next", "tie_next_status",
    "tie_next_target_qty", "tie_next_notes", "personal_notes",
  ] as const) {
    if (patch[k] !== undefined) row[k] = patch[k];
  }
  if (Object.keys(row).length === 0) return getMyConfigurationById(id);
  const { data, error } = await supabase
    .from("user_fly_configurations")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    console.error("[updateConfiguration]", error);
    return null;
  }
  return data as FlyConfiguration;
}

/** Delete a configuration (and cascade its box memberships). */
export async function deleteConfiguration(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_fly_configurations")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[deleteConfiguration]", error);
    return false;
  }
  return true;
}

// ────────────────────────────────────────────────────────────────────────────
// Boxes & box entries
// ────────────────────────────────────────────────────────────────────────────

/** Current user's fly boxes. Reuses the v2 fly_boxes table. */
export async function listMyBoxes(): Promise<FlyBoxV2[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("fly_boxes")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    console.error("[listMyBoxes]", error);
    return [];
  }
  return (data ?? []) as FlyBoxV2[];
}

/** Add a configuration to a box. */
export async function addConfigurationToBox(args: {
  configurationId: string;
  boxId: string;
}): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("fly_box_entries_v3")
    .insert({
      configuration_id: args.configurationId,
      box_id: args.boxId,
      user_id: user.id,
    });
  // 23505 = unique violation → already in box, treat as success
  if (error && (error as { code?: string }).code !== "23505") {
    console.error("[addConfigurationToBox]", error);
    return false;
  }
  return true;
}

/** Remove a configuration from a box. */
export async function removeConfigurationFromBox(args: {
  configurationId: string;
  boxId: string;
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fly_box_entries_v3")
    .delete()
    .eq("configuration_id", args.configurationId)
    .eq("box_id", args.boxId);
  if (error) {
    console.error("[removeConfigurationFromBox]", error);
    return false;
  }
  return true;
}

// ────────────────────────────────────────────────────────────────────────────
// Quick helpers
// ────────────────────────────────────────────────────────────────────────────

/** Add a fly to a user's box with default options. Returns the new
 *  configuration id, or null on failure. If the user already has a
 *  configuration for this fly with default options, returns its id instead
 *  of creating a duplicate. */
export async function quickAddFlyToBox(args: {
  flyId: string;
  /** Box to add to. If omitted, uses default box. */
  boxId?: string;
  slot_overrides?: SlotOverrides;
  size?: string | null;
}): Promise<{ configurationId: string; boxId: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let boxId = args.boxId ?? null;
  if (!boxId) {
    const boxes = await listMyBoxes();
    const def = boxes.find((b) => b.is_default) ?? boxes[0];
    boxId = def?.id ?? null;
  }
  if (!boxId) return null;

  const overrides = args.slot_overrides ?? {};
  const size = args.size ?? null;

  // Reuse an existing default config if present.
  const { data: existing } = await supabase
    .from("user_fly_configurations")
    .select("id")
    .eq("user_id", user.id)
    .eq("fly_id", args.flyId)
    .is("nickname", null)
    .is("size", size)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let configurationId: string | null = (existing?.id as string) ?? null;
  if (!configurationId) {
    const created = await createConfiguration({
      fly_id: args.flyId,
      size,
      slot_overrides: overrides,
    });
    configurationId = created?.id ?? null;
  }
  if (!configurationId) return null;

  await addConfigurationToBox({ configurationId, boxId });
  return { configurationId, boxId };
}
