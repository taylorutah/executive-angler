/**
 * Variant creation endpoint (v2).
 *
 * Pre-v2, a "variant" was a separate fly_patterns row linked to its parent
 * via parent_pattern_id. Post-v2, variants are fly_variants rows attached
 * to a single fly_patterns_v2 pattern. This endpoint preserves the public
 * API surface so VariantModal keeps working — internals now insert into
 * fly_variants instead of cloning patterns.
 *
 * POST /api/fishing/flies/variant
 *   Single variant:
 *     { parent: { patternId?: string, canonicalId?: string },
 *       mode: "single", overrides: Overrides }
 *
 *   Bulk variants (cartesian product of axes):
 *     { parent: ...,
 *       mode: "bulk",
 *       axes: { sizes?, colors?, bead_colors?, custom?: [{ field, values }] },
 *       base?: Overrides }
 *
 * Field mapping legacy → v2 fly_variants:
 *   size            → size
 *   hook            → hook_style
 *   bead_size       → bead_weight_mm (numeric only)
 *   bead_size_mm    → bead_weight_mm
 *   bead_color      → bead_color
 *   bead_material   → bead_material
 *   fly_color       → body_color
 *   body_color      → body_color
 *   description     → notes
 *   name            → display_name
 *   (dropped — no v2 column at variant level: thread_color, tail_color,
 *    thorax_color, collar_color, rib_*, wing_*, hot_spot_color, materials,
 *    video_url, tags, provenance_credit)
 *
 * Returns: { created: Array<v2 variant row>, count: number }. VariantModal
 * only consumes `count` so the synthetic created array is fine.
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
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}

type ParentSpec = { patternId?: string; canonicalId?: string };

/** Fields the modal may send. Only the ones in V2_VARIANT_MAP map to v2. */
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
  sizes?: string[];
  colors?: string[];
  bead_colors?: string[];
  custom?: Array<{ field: string; values: string[] }>;
};

type ParentV2 = {
  id: string;
  name: string;
  owner_user_id: string | null;
  category: string | null;
};

/** Loads parent from fly_patterns_v2 OR canonical_flies. Both surface as
 *  the same shape because what we actually need is just id + name to anchor
 *  the new variants. Permissions: caller must own the pattern, or it must
 *  be canonical (owner null) / public. */
async function loadParent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  spec: ParentSpec,
  userId: string,
): Promise<ParentV2 | null> {
  // Both spec.patternId and spec.canonicalId now resolve against
  // fly_patterns_v2 — Phase 2 mirrored canonicals into v2 with the same id,
  // and personal patterns live there too.
  const id = spec.patternId ?? spec.canonicalId;
  if (!id) return null;
  const { data } = await supabase
    .from("fly_patterns_v2")
    .select("id, name, owner_user_id, category, visibility, shared_with_user_ids")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const isOwner = data.owner_user_id === userId;
  const isCanonical = data.owner_user_id == null;
  const visibility = (data as { visibility?: string }).visibility ?? "private";
  const sharedWith =
    ((data as { shared_with_user_ids?: string[] }).shared_with_user_ids ?? []) as string[];
  const isPublic = visibility === "public";
  const isSharedWithMe = visibility === "shared" && sharedWith.includes(userId);
  if (!isOwner && !isCanonical && !isPublic && !isSharedWithMe) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    owner_user_id: data.owner_user_id as string | null,
    category: data.category as string | null,
  };
}

/** Apply overrides onto a base record. Empty strings mean "inherit". */
function applyOverrides(base: Record<string, unknown>, overrides: Overrides | undefined): Record<string, unknown> {
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
  if (out.bead_material === "none") {
    out.bead_color = null;
    out.bead_size = null;
    out.bead_size_mm = null;
  }
  return out;
}

function resolveAxes(axes: BulkAxes | undefined): Array<{ field: VariantField; values: string[] }> {
  if (!axes) return [];
  const out = new Map<VariantField, string[]>();
  if (axes.sizes?.length) out.set("size", axes.sizes);
  if (axes.colors?.length) out.set("fly_color", axes.colors);
  if (axes.bead_colors?.length) out.set("bead_color", axes.bead_colors);
  for (const c of axes.custom ?? []) {
    if (!VARIANT_FIELDS.includes(c.field as VariantField)) continue;
    const vals = (c.values ?? []).map((s) => String(s).trim()).filter(Boolean);
    if (vals.length > 0) out.set(c.field as VariantField, vals);
  }
  return Array.from(out.entries()).map(([field, values]) => ({ field, values }));
}

function cartesian(axes: Array<{ field: VariantField; values: string[] }>): Array<Record<string, string>> {
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

function synthesizeName(baseName: string, cell: Record<string, string>): string {
  const bits: string[] = [baseName];
  if (cell.size) bits.push(`#${cell.size}`);
  if (cell.fly_color) bits.push(cell.fly_color);
  if (cell.body_color && cell.body_color !== cell.fly_color) bits.push(`${cell.body_color} body`);
  if (cell.bead_material === "none") bits.push("no bead");
  else if (cell.bead_color || cell.bead_material || cell.bead_size || cell.bead_size_mm) {
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
  return bits.join(" ").replace(/\s+/g, " ").trim();
}

/** Translate the legacy-shaped overrides + name into a fly_variants insert. */
function toVariantRow(
  patternId: string,
  userId: string,
  row: Record<string, unknown>,
  sortOrder: number,
): Record<string, unknown> | null {
  const rawSize = row.size;
  const size = typeof rawSize === "string" ? rawSize.replace(/[#\s]/g, "").trim() : "";
  if (!size) return null; // size is NOT NULL on fly_variants

  // Bead weight: prefer bead_size_mm if numeric, else parse bead_size text.
  let beadMm: number | null = null;
  const beadMmRaw = row.bead_size_mm;
  if (typeof beadMmRaw === "number" && Number.isFinite(beadMmRaw)) {
    beadMm = beadMmRaw;
  } else if (typeof beadMmRaw === "string" && /^[0-9]+(\.[0-9]+)?$/.test(beadMmRaw.trim())) {
    beadMm = Number(beadMmRaw.trim());
  } else {
    const beadSize = row.bead_size;
    if (typeof beadSize === "string" && /^[0-9]+(\.[0-9]+)?$/.test(beadSize.trim())) {
      beadMm = Number(beadSize.trim());
    }
  }

  const beadMaterialRaw = row.bead_material;
  const beadMaterial =
    typeof beadMaterialRaw === "string" && ["tungsten", "brass", "glass", "none"].includes(beadMaterialRaw)
      ? beadMaterialRaw
      : null;

  // Body color prefers explicit body_color, falls back to fly_color (legacy alias).
  const bodyColor =
    (typeof row.body_color === "string" && row.body_color) ||
    (typeof row.fly_color === "string" && row.fly_color) ||
    null;
  const beadColor = typeof row.bead_color === "string" ? row.bead_color : null;
  const hookStyle = typeof row.hook === "string" ? row.hook : null;
  const displayName = typeof row.name === "string" ? row.name : null;
  const notes = typeof row.description === "string" ? row.description : null;

  const insert: Record<string, unknown> = {
    pattern_id: patternId,
    created_by_user_id: userId,
    size,
    sort_order: sortOrder,
  };
  if (displayName) insert.display_name = displayName;
  if (notes) insert.notes = notes;
  if (hookStyle) insert.hook_style = hookStyle;
  if (beadMm != null) insert.bead_weight_mm = beadMm;
  if (beadMaterial) insert.bead_material = beadMaterial;
  if (beadColor) insert.bead_color = beadColor;
  if (bodyColor) insert.body_color = bodyColor;
  return insert;
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
      return NextResponse.json(
        { error: "parent.patternId or parent.canonicalId required" },
        { status: 400 },
      );
    }
    const parent = await loadParent(supabase, parentSpec, user.id);
    if (!parent) {
      return NextResponse.json({ error: "Parent not found or not accessible" }, { status: 404 });
    }

    // Find next sort_order on this pattern so new variants don't collide.
    let nextSort = 0;
    {
      const { data: maxRow } = await supabase
        .from("fly_variants")
        .select("sort_order")
        .eq("pattern_id", parent.id)
        .order("sort_order", { ascending: false })
        .limit(1);
      nextSort = ((maxRow?.[0]?.sort_order as number | undefined) ?? -1) + 1;
    }

    // Build the row set in legacy shape, then translate each to fly_variants.
    const rowsLegacyShape: Record<string, unknown>[] = [];

    if (body.mode === "bulk") {
      const axes = resolveAxes(body.axes);
      if (axes.length === 0) {
        return NextResponse.json(
          { error: "Add at least one axis of values to vary." },
          { status: 400 },
        );
      }
      const cells = cartesian(axes);
      if (cells.length > 64) {
        return NextResponse.json(
          { error: "Refusing to create more than 64 variants at once" },
          { status: 400 },
        );
      }
      const baseWithOverrides = applyOverrides({}, body.base);
      const baseName = (baseWithOverrides.name as string | undefined) ?? parent.name;
      for (const cell of cells) {
        const cellOverrides: Overrides = {};
        for (const [field, val] of Object.entries(cell)) {
          (cellOverrides as Record<string, string>)[field] = val;
        }
        const row = applyOverrides(baseWithOverrides, cellOverrides);
        row.name = synthesizeName(baseName, cell);
        rowsLegacyShape.push(row);
      }
    } else {
      // single
      const overrides = body.overrides ?? {};
      const row = applyOverrides({}, overrides);
      if (!overrides.name || overrides.name === "") {
        const suffixBits = [
          overrides.size ? `#${overrides.size}` : null,
          overrides.fly_color ?? null,
          overrides.bead_material === "none" || overrides.no_bead === true ? "no bead" : null,
          overrides.body_color ?? null,
        ].filter(Boolean);
        (row as Record<string, unknown>).name =
          suffixBits.length > 0 ? `${parent.name} — ${suffixBits.join(" ")}` : `${parent.name} (variant)`;
      }
      rowsLegacyShape.push(row);
    }

    const variantInserts: Record<string, unknown>[] = [];
    const skipped: string[] = [];
    rowsLegacyShape.forEach((row, idx) => {
      const v = toVariantRow(parent.id, user.id, row, nextSort + idx);
      if (v) variantInserts.push(v);
      else skipped.push((row.name as string | undefined) ?? `variant ${idx}`);
    });

    if (variantInserts.length === 0) {
      return NextResponse.json(
        { error: "No valid variants — `size` is required on every variant." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.from("fly_variants").insert(variantInserts).select();
    if (error) {
      console.error("[variant create] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      created: data ?? [],
      count: (data ?? []).length,
      skipped: skipped.length > 0 ? skipped : undefined,
    });
  } catch (err) {
    console.error("[variant create] exception:", err);
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}
