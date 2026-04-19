/**
 * Variant creation endpoint.
 *
 * POST /api/fishing/flies/variant
 *   Single variant:
 *     { parent: { patternId?: string, canonicalId?: string },
 *       overrides: { name, size?, hook?, bead_size?, bead_color?, fly_color?,
 *                    type?, description?, materials?, video_url?, tags? } }
 *
 *   Bulk variants (sizes × colors × bead_colors):
 *     { parent: { patternId?: string, canonicalId?: string },
 *       mode: "bulk",
 *       axes: { sizes?: string[], colors?: string[], bead_colors?: string[] },
 *       nameTemplate?: string,        // e.g. "{base} #{size} {color}"
 *       base: { name: string, type?: string, hook?: string, ... } }
 *
 * Returns: { created: FlyPattern[] }
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

type Overrides = {
  name?: string;
  type?: string;
  size?: string;
  hook?: string;
  bead_size?: string;
  bead_color?: string;
  fly_color?: string;
  description?: string;
  materials?: string;
  video_url?: string;
  tags?: string[];
  provenance_credit?: string;
};

type BulkAxes = {
  sizes?: string[];
  colors?: string[];
  bead_colors?: string[];
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
  fly_color?: string | null;
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
        "id, user_id, name, type, size, hook, bead_size, bead_color, fly_color, materials, description, video_url, tags, image_url, provenance_credit, visibility, shared_with_user_ids"
      )
      .eq("id", spec.patternId)
      .maybeSingle();
    if (!data) return { kind: "missing" };
    // Allow forking own pattern, public, or explicitly shared with user
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
      fly_color: r.fly_color ?? null,
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
    fly_color: Array.isArray(r.colors) && r.colors.length > 0 ? r.colors[0] : null,
    materials: null,
    description: r.description ?? r.tying_overview ?? null,
    video_url: null,
    tags: null,
    image_url: r.hero_image_url ?? null,
    provenance_credit: `Variant of ${r.name} (canonical)`,
    parent_canonical_id: r.id,
  };
}

function applyOverrides(
  base: Record<string, unknown>,
  overrides: Overrides | undefined
): Record<string, unknown> {
  if (!overrides) return base;
  const out = { ...base };
  for (const k of Object.keys(overrides) as (keyof Overrides)[]) {
    const v = overrides[k];
    if (v !== undefined && v !== "") (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

function renderName(
  template: string,
  base: string,
  axis: { size?: string; color?: string; bead_color?: string }
) {
  return template
    .replace(/{base}/gi, base)
    .replace(/{size}/gi, axis.size ?? "")
    .replace(/{color}/gi, axis.color ?? "")
    .replace(/{bead_color}/gi, axis.bead_color ?? "")
    .replace(/\s+/g, " ")
    .trim();
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
      nameTemplate?: string;
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
      const axes: BulkAxes = body.axes ?? {};
      const sizes = axes.sizes && axes.sizes.length > 0 ? axes.sizes : [undefined];
      const colors = axes.colors && axes.colors.length > 0 ? axes.colors : [undefined];
      const beads =
        axes.bead_colors && axes.bead_colors.length > 0 ? axes.bead_colors : [undefined];

      if (sizes.length * colors.length * beads.length > 48) {
        return NextResponse.json({ error: "Refusing to create more than 48 variants at once" }, { status: 400 });
      }

      const template =
        body.nameTemplate?.trim() ||
        "{base}{size? #{size}}{color? {color}}{bead_color? · {bead_color} bead}";
      const safeTemplate = template
        .replace(/\{size\?\s*([^}]+)\}/g, "{_sizeBlock}")
        .replace(/\{color\?\s*([^}]+)\}/g, "{_colorBlock}")
        .replace(/\{bead_color\?\s*([^}]+)\}/g, "{_beadBlock}");

      for (const size of sizes) {
        for (const color of colors) {
          for (const beadColor of beads) {
            // expand optional blocks manually
            const sizeBlock = size ? ` #${size}` : "";
            const colorBlock = color ? ` ${color}` : "";
            const beadBlock = beadColor ? ` · ${beadColor} bead` : "";
            const name = safeTemplate
              .replace(/{base}/gi, String(baseWithOverrides.name ?? parent.row.name))
              .replace(/{size}/gi, size ?? "")
              .replace(/{color}/gi, color ?? "")
              .replace(/{bead_color}/gi, beadColor ?? "")
              .replace("{_sizeBlock}", sizeBlock)
              .replace("{_colorBlock}", colorBlock)
              .replace("{_beadBlock}", beadBlock)
              .replace(/\s+/g, " ")
              .trim();

            rowsToInsert.push({
              ...baseWithOverrides,
              name,
              size: size ?? baseWithOverrides.size ?? null,
              fly_color: color ?? baseWithOverrides.fly_color ?? null,
              bead_color: beadColor ?? baseWithOverrides.bead_color ?? null,
              user_id: user.id,
              visibility: "private",
              tie_next_status: "none",
              source: "tied",
            });
          }
        }
      }
    } else {
      // single variant — overrides take precedence on top of base
      const overrides = body.overrides ?? {};
      const withOverrides = applyOverrides(baseWithOverrides, overrides);
      // Keep explicit name change; if missing, derive a reasonable default
      if (!overrides.name) {
        const baseName = (baseWithOverrides.name as string) ?? parent.row.name;
        const suffixBits = [
          overrides.size ? `#${overrides.size}` : null,
          overrides.fly_color ?? null,
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
