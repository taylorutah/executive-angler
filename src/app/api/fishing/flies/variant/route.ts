/**
 * Variant creation endpoint.
 *
 * POST /api/fishing/flies/variant
 *   Single variant:
 *     { parent: { patternId?: string, canonicalId?: string },
 *       mode: "single",
 *       overrides: Overrides }
 *
 *   Bulk variants (cartesian product of axes):
 *     { parent: { patternId?: string, canonicalId?: string },
 *       mode: "bulk",
 *       axes: {
 *         // Either / both styles — legacy named axes OR generic list.
 *         sizes?: string[],                            // → size axis
 *         colors?: string[],                           // → fly_color axis
 *         bead_colors?: string[],                      // → bead_color axis
 *         custom?: Array<{ field: string, values: string[] }>
 *       },
 *       base?: Partial<Overrides>                      // shared overrides applied to every variant
 *     }
 *
 * "No bead" semantics: pass `overrides.no_bead = true` (single) or include
 * `{ field: "bead_material", values: [..., "none", ...] }` in bulk. When
 * bead_material is "none" the API zeroes bead_color/bead_size/bead_size_mm.
 *
 * Returns: { created: FlyPattern[], count: number }
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

type ParentSpec = { patternId?: string; canonicalId?: string };

/**
 * Every flat column on fly_patterns that a variant can override.
 * Keep this list in sync with VARIANT_FIELDS below — it's the single source
 * of truth for what the modal is allowed to vary.
 */
const VARIANT_FIELDS = [
  "name",
  "type",
  "size",
  "hook",
  "bead_size",
  "bead_color",
  "bead_material",
  "bead_size_mm",
  "fly_color",
  "body_color",
  "body_material",
  "thread_color",
  "tail_color",
  "thorax_color",
  "collar_color",
  "rib_material",
  "rib_color",
  "wing_material",
  "wing_color",
  "hot_spot_color",
  "description",
  "materials",
  "video_url",
  "tags",
  "provenance_credit",
] as const;
type VariantField = (typeof VARIANT_FIELDS)[number];

type Overrides = Partial<Record<VariantField, string | number | string[] | null>> & {
  no_bead?: boolean;
};

type BulkAxes = {
  // Legacy friendly names (still supported by older clients)
  sizes?: string[];
  colors?: string[];
  bead_colors?: string[];
  // New: arbitrary axis list. Each `field` must be a column in VARIANT_FIELDS.
  custom?: Array<{ field: string; values: string[] }>;
};

type CanonicalSource = {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  tying_overview?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  bead_options?: string[] | null;
  hero_image_url?: string | null;
};

type PatternSource = {
  id: string;
  user_id: string;
  name: string;
  type?: string | null;
  size?: string | null;
  hook?: string | null;
  bead_size?: string | null;
  bead_color?: string | null;
  bead_material?: string | null;
  bead_size_mm?: number | null;
  fly_color?: string | null;
  body_color?: string | null;
  body_material?: string | null;
  thread_color?: string | null;
  tail_color?: string | null;
  thorax_color?: string | null;
  collar_color?: string | null;
  rib_material?: string | null;
  rib_color?: string | null;
  wing_material?: string | null;
  wing_color?: string | null;
  hot_spot_color?: string | null;
  materials?: string | null;
  description?: string | null;
  video_url?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  provenance_credit?: string | null;
};

const CANON_TO_TYPE: Record<string, string> = {
  dry: "Dry Fly",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
};

async function loadParent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  spec: ParentSpec,
  userId: string
): Promise<
  | { kind: "pattern"; row: PatternSource }
  | { kind: "canonical"; row: CanonicalSource }
  | { kind: "missing" }
> {
  if (spec.patternId) {
    const { data } = await supabase
      .from("fly_patterns")
      .select(
        "id, user_id, name, type, size, hook, bead_size, bead_color, bead_material, bead_size_mm, fly_color, body_color, body_material, thread_color, tail_color, thorax_color, collar_color, rib_material, rib_color, wing_material, wing_color, hot_spot_color, materials, description, video_url, tags, image_url, provenance_credit, visibility, shared_with_user_ids"
      )
      .eq("id", spec.patternId)
      .maybeSingle();
    if (!data) return { kind: "missing" };
    const visibility = (data as { visibility?: string }).visibility ?? "private";
    const sharedWith =
      ((data as { shared_with_user_ids?: string[] }).shared_with_user_ids ?? []) as string[];
    const isOwner = data.user_id === userId;
    const isPublic = visibility === "public";
    const isSharedWithMe = visibility === "shared" && sharedWith.includes(userId);
    if (!isOwner && !isPublic && !isSharedWithMe) return { kind: "missing" };
    return { kind: "pattern", row: data as PatternSource };
  }
  if (spec.canonicalId) {
    const { data } = await supabase
      .from("canonical_flies")
      .select("id, name, category, description, tying_overview, sizes, colors, bead_options, hero_image_url")
      .eq("id", spec.canonicalId)
      .maybeSingle();
    if (!data) return { kind: "missing" };
    return { kind: "canonical", row: data as CanonicalSource };
  }
  return { kind: "missing" };
}

function baseFromParent(
  parent:
    | { kind: "pattern"; row: PatternSource }
    | { kind: "canonical"; row: CanonicalSource }
): Record<string, unknown> {
  if (parent.kind === "pattern") {
    const r = parent.row;
    return {
      name: r.name,
      type: r.type ?? null,
      size: r.size ?? null,
      hook: r.hook ?? null,
      bead_size: r.bead_size ?? null,
      bead_color: r.bead_color ?? null,
      bead_material: r.bead_material ?? null,
      bead_size_mm: r.bead_size_mm ?? null,
      fly_color: r.fly_color ?? null,
      body_color: r.body_color ?? null,
      body_material: r.body_material ?? null,
      thread_color: r.thread_color ?? null,
      tail_color: r.tail_color ?? null,
      thorax_color: r.thorax_color ?? null,
      collar_color: r.collar_color ?? null,
      rib_material: r.rib_material ?? null,
      rib_color: r.rib_color ?? null,
      wing_material: r.wing_material ?? null,
      wing_color: r.wing_color ?? null,
      hot_spot_color: r.hot_spot_color ?? null,
      materials: r.materials ?? null,
      description: r.description ?? null,
      video_url: r.video_url ?? null,
      tags: r.tags ?? null,
      image_url: r.image_url ?? null,
      provenance_credit: r.provenance_credit ?? `Variant of ${r.name}`,
      parent_pattern_id: r.id,
    };
  }
  const r = parent.row;
  const defaultSize = Array.isArray(r.sizes) && r.sizes.length > 0 ? r.sizes[0] : null;
  return {
    name: r.name,
    type: CANON_TO_TYPE[r.category ?? ""] ?? null,
    size: defaultSize,
    hook: null,
    bead_size: null,
    bead_color: null,
    bead_material: null,
    bead_size_mm: null,
    fly_color: Array.isArray(r.colors) && r.colors.length > 0 ? r.colors[0] : null,
    body_color: null,
    body_material: null,
    thread_color: null,
    tail_color: null,
    thorax_color: null,
    collar_color: null,
    rib_material: null,
    rib_color: null,
    wing_material: null,
    wing_color: null,
    hot_spot_color: null,
    materials: null,
    description: r.description ?? r.tying_overview ?? null,
    video_url: null,
    tags: null,
    image_url: r.hero_image_url ?? null,
    provenance_credit: `Variant of ${r.name} (canonical)`,
    parent_canonical_id: r.id,
  };
}

/**
 * Apply overrides onto a base row. Only known VARIANT_FIELDS are copied; any
 * stray keys are ignored. Empty strings are treated as "inherit from base"
 * (the form uses "" to mean unset), so callers should send `null` explicitly
 * if they want to blank a field.
 *
 * Special case: `no_bead: true` forces the bead_* set to a cleared state.
 */
function applyOverrides(
  base: Record<string, unknown>,
  overrides: Overrides | undefined
): Record<string, unknown> {
  if (!overrides) return base;
  const out: Record<string, unknown> = { ...base };
  for (const k of VARIANT_FIELDS) {
    const v = overrides[k];
    if (v === undefined) continue;
    if (typeof v === "string" && v === "") continue;
    out[k] = v;
  }
  if (overrides.no_bead === true) {
    out.bead_material = "none";
    out.bead_color = null;
    out.bead_size = null;
    out.bead_size_mm = null;
  }
  // Also honor bead_material="none" even without the explicit no_bead flag
  if (out.bead_material === "none") {
    out.bead_color = null;
    out.bead_size = null;
    out.bead_size_mm = null;
  }
  return out;
}

/**
 * Build an ordered list of axes from both the legacy named axes and the new
 * `custom` array. De-duplicates by field (custom wins over legacy if both
 * reference the same column).
 */
function resolveAxes(axes: BulkAxes | undefined): Array<{ field: VariantField; values: string[] }> {
  if (!axes) return [];
  const out = new Map<VariantField, string[]>();
  if (axes.sizes && axes.sizes.length > 0) out.set("size", axes.sizes);
  if (axes.colors && axes.colors.length > 0) out.set("fly_color", axes.colors);
  if (axes.bead_colors && axes.bead_colors.length > 0) out.set("bead_color", axes.bead_colors);
  for (const c of axes.custom ?? []) {
    if (!VARIANT_FIELDS.includes(c.field as VariantField)) continue;
    const vals = (c.values ?? []).map((s) => String(s).trim()).filter(Boolean);
    if (vals.length > 0) out.set(c.field as VariantField, vals);
  }
  return Array.from(out.entries()).map(([field, values]) => ({ field, values }));
}

/**
 * Cartesian product over the axes. Each result is a Record mapping field →
 * chosen value for that variant.
 */
function cartesian(
  axes: Array<{ field: VariantField; values: string[] }>
): Array<Record<string, string>> {
  if (axes.length === 0) return [];
  let acc: Array<Record<string, string>> = [{}];
  for (const axis of axes) {
    const next: Array<Record<string, string>> = [];
    for (const row of acc) {
      for (const val of axis.values) {
        next.push({ ...row, [axis.field]: val });
      }
    }
    acc = next;
  }
  return acc;
}

/**
 * Auto-name a bulk variant from its varying axis values.
 * Example: "Walt's Worm #16 Tan · Copper bead"
 */
function synthesizeName(baseName: string, cell: Record<string, string>): string {
  const bits: string[] = [baseName];
  if (cell.size) bits.push(`#${cell.size}`);
  if (cell.fly_color) bits.push(cell.fly_color);
  if (cell.body_color && cell.body_color !== cell.fly_color) bits.push(`${cell.body_color} body`);
  if (cell.tail_color) bits.push(`${cell.tail_color} tail`);
  if (cell.thorax_color) bits.push(`${cell.thorax_color} thorax`);
  if (cell.collar_color) bits.push(`${cell.collar_color} collar`);
  if (cell.rib_color) bits.push(`${cell.rib_color} rib`);
  if (cell.rib_material) bits.push(`${cell.rib_material} rib`);
  if (cell.wing_color) bits.push(`${cell.wing_color} wing`);
  if (cell.wing_material) bits.push(`${cell.wing_material} wing`);
  if (cell.hot_spot_color) bits.push(`${cell.hot_spot_color} hot spot`);
  if (cell.thread_color) bits.push(`${cell.thread_color} thread`);
  if (cell.bead_material === "none") {
    bits.push("no bead");
  } else if (cell.bead_color || cell.bead_material || cell.bead_size || cell.bead_size_mm) {
    const beadBits = [
      cell.bead_color,
      cell.bead_material,
      cell.bead_size_mm ? `${cell.bead_size_mm}mm` : "",
      cell.bead_size ? `#${cell.bead_size}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    bits.push(`· ${beadBits} bead`);
  }
  if (cell.hook) bits.push(cell.hook);
  if (cell.type) bits.push(`(${cell.type})`);
  return bits.join(" ").replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      parent?: ParentSpec;
      mode?: "single" | "bulk";
      overrides?: Overrides;
      axes?: BulkAxes;
      base?: Overrides;
    };

    const parentSpec = body.parent ?? {};
    if (!parentSpec.patternId && !parentSpec.canonicalId) {
      return NextResponse.json({ error: "parent.patternId or parent.canonicalId required" }, { status: 400 });
    }
    const parent = await loadParent(supabase, parentSpec, user.id);
    if (parent.kind === "missing") {
      return NextResponse.json({ error: "Parent not found or not accessible" }, { status: 404 });
    }

    const base = baseFromParent(parent);
    // Allow caller to override the shared base before axis expansion
    const baseWithOverrides = applyOverrides(base, body.base);

    const rowsToInsert: Record<string, unknown>[] = [];

    if (body.mode === "bulk") {
      const axes = resolveAxes(body.axes);
      if (axes.length === 0) {
        return NextResponse.json({ error: "Add at least one axis of values to vary." }, { status: 400 });
      }
      const cells = cartesian(axes);
      if (cells.length > 64) {
        return NextResponse.json({ error: "Refusing to create more than 64 variants at once" }, { status: 400 });
      }

      const baseName = String(baseWithOverrides.name ?? parent.row.name);
      for (const cell of cells) {
        // Treat each cell's values as a per-variant override payload
        const cellOverrides: Overrides = {};
        for (const [field, val] of Object.entries(cell)) {
          (cellOverrides as Record<string, string>)[field] = val;
        }
        const row = applyOverrides(baseWithOverrides, cellOverrides);
        row.name = synthesizeName(baseName, cell);
        rowsToInsert.push({
          ...row,
          user_id: user.id,
          visibility: "private",
          tie_next_status: "none",
          source: "tied",
        });
      }
    } else {
      // single variant — overrides take precedence on top of base
      const overrides = body.overrides ?? {};
      const withOverrides = applyOverrides(baseWithOverrides, overrides);
      // Keep explicit name change; if missing, derive a reasonable default
      if (!overrides.name || overrides.name === "") {
        const baseName = (baseWithOverrides.name as string) ?? parent.row.name;
        const suffixBits = [
          overrides.size ? `#${overrides.size}` : null,
          overrides.fly_color ?? null,
          overrides.bead_material === "none" || overrides.no_bead === true ? "no bead" : null,
          overrides.body_color ?? null,
        ].filter(Boolean);
        (withOverrides as Record<string, unknown>).name =
          suffixBits.length > 0 ? `${baseName} — ${suffixBits.join(" ")}` : `${baseName} (variant)`;
      }
      rowsToInsert.push({
        ...withOverrides,
        user_id: user.id,
        visibility: "private",
        tie_next_status: "none",
        source: "tied",
      });
    }

    const { data, error } = await supabase.from("fly_patterns").insert(rowsToInsert).select();
    if (error) {
      console.error("[variant create] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ created: data ?? [], count: (data ?? []).length });
  } catch (err) {
    console.error("[variant create] exception:", err);
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}
