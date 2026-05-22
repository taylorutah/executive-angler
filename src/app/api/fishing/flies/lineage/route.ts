/**
 * Fly pattern lineage endpoint.
 *
 * GET /api/fishing/flies/lineage?patternId=<uuid>
 *   Returns { pattern, parent, parentCanonical, siblings, children } for a
 *   personal pattern. Siblings are other children of the same parent.
 *
 * GET /api/fishing/flies/lineage?canonicalId=<uuid>
 *   Returns { canonical, variants } — public variants forked from a canonical
 *   fly (visibility = 'public'). Used on /flies/[slug] to surface the
 *   community's variations.
 *
 * No auth required for canonical lineage. Personal lineage checks visibility
 * the same way the variant-create endpoint does: owner, public, or shared-with.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const patternId = req.nextUrl.searchParams.get("patternId");
    const canonicalId = req.nextUrl.searchParams.get("canonicalId");

    if (!patternId && !canonicalId) {
      return NextResponse.json(
        { error: "patternId or canonicalId is required" },
        { status: 400 }
      );
    }

    if (canonicalId) {
      const [canonicalRes, variantsRes] = await Promise.all([
        supabase
          .from("flies")
          .select(
            "id, slug, name, category, tagline, sizes, colors, bead_options, hook_styles, hero_image_url"
          )
          .eq("id", canonicalId)
          .maybeSingle(),
        supabase
          .from("flies")
          .select(
            "id, name, type, size, hook, bead_size, bead_color, fly_color, image_url, my_tied_fly_photo_url, provenance_credit, user_id, updated_at"
          )
          .eq("parent_canonical_id", canonicalId)
          .eq("visibility", "public")
          .order("updated_at", { ascending: false })
          .limit(48),
      ]);

      return NextResponse.json({
        canonical: canonicalRes.data ?? null,
        variants: variantsRes.data ?? [],
      });
    }

    // Personal pattern lineage
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: pattern } = await supabase
      .from("flies")
      .select("*")
      .eq("id", patternId!)
      .maybeSingle();

    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }

    // Visibility gate
    const isOwner = user?.id && pattern.user_id === user.id;
    const isPublic = pattern.visibility === "public";
    const isSharedWithMe =
      user?.id &&
      pattern.visibility === "shared" &&
      Array.isArray(pattern.shared_with_user_ids) &&
      pattern.shared_with_user_ids.includes(user.id);

    if (!isOwner && !isPublic && !isSharedWithMe) {
      return NextResponse.json({ error: "Not accessible" }, { status: 403 });
    }

    const [parentRes, canonicalRes, childrenRes, siblingsRes] = await Promise.all([
      pattern.parent_pattern_id
        ? supabase
            .from("flies")
            .select("*")
            .eq("id", pattern.parent_pattern_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      pattern.parent_canonical_id
        ? supabase
            .from("flies")
            .select(
              "id, slug, name, category, tagline, sizes, colors, bead_options, hook_styles, hero_image_url"
            )
            .eq("id", pattern.parent_canonical_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("flies")
        .select("*")
        .eq("parent_pattern_id", patternId!)
        .order("created_at", { ascending: false }),
      pattern.parent_pattern_id
        ? supabase
            .from("flies")
            .select("*")
            .eq("parent_pattern_id", pattern.parent_pattern_id)
            .neq("id", patternId!)
            .order("created_at", { ascending: false })
        : pattern.parent_canonical_id
          ? supabase
              .from("flies")
              .select("*")
              .eq("parent_canonical_id", pattern.parent_canonical_id)
              .neq("id", patternId!)
              .eq("user_id", user?.id ?? "")
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
    ]);

    return NextResponse.json({
      pattern,
      parent: parentRes.data ?? null,
      parentCanonical: canonicalRes.data ?? null,
      children: childrenRes.data ?? [],
      siblings: siblingsRes.data ?? [],
    });
  } catch (err) {
    console.error("[lineage GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
