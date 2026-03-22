import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

/**
 * PATCH /api/admin/hero-image
 * Update hero image, alt text, and photo credit for any entity.
 * Admin only.
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const {
    entity_type,
    entity_id,
    hero_image_url,
    hero_image_alt,
    hero_image_credit,
    hero_image_credit_url,
  } = await request.json();

  if (!entity_type || !entity_id) {
    return NextResponse.json({ error: "entity_type and entity_id are required" }, { status: 400 });
  }

  // Map entity types to table names
  const TABLE_MAP: Record<string, string> = {
    rivers: "rivers",
    river: "rivers",
    destinations: "destinations",
    destination: "destinations",
    fly_shops: "fly_shops",
    fly_shop: "fly_shops",
    lodges: "lodges",
    lodge: "lodges",
    guides: "guides",
    guide: "guides",
    species: "species",
    articles: "articles",
    article: "articles",
  };

  const table = TABLE_MAP[entity_type];
  if (!table) {
    return NextResponse.json({ error: `Unknown entity type: ${entity_type}` }, { status: 400 });
  }

  // Determine the ID column — rivers use 'id' (slug), others may use 'id' or 'slug'
  // Try slug first, fall back to id
  const update: Record<string, unknown> = {};
  if (hero_image_url !== undefined) update.hero_image_url = hero_image_url;
  if (hero_image_alt !== undefined) update.hero_image_alt = hero_image_alt;
  if (hero_image_credit !== undefined) update.hero_image_credit = hero_image_credit;
  if (hero_image_credit_url !== undefined) update.hero_image_credit_url = hero_image_credit_url;

  // Try by slug first
  let result = await supabase
    .from(table)
    .update(update)
    .eq("slug", entity_id);

  // If no rows matched by slug, try by id
  if (result.error || result.count === 0) {
    result = await supabase
      .from(table)
      .update(update)
      .eq("id", entity_id);
  }

  if (result.error) {
    // If hero_image_alt column doesn't exist, retry without it
    if (result.error.message?.includes("hero_image_alt")) {
      delete update.hero_image_alt;
      const retry = await supabase.from(table).update(update).eq("id", entity_id);
      if (retry.error) {
        return NextResponse.json({ error: retry.error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, note: "hero_image_alt column not yet added — run migration" });
    }
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  // Log the action
  try {
    await supabase.from("admin_audit_log").insert({
      admin_user_id: user.id,
      admin_email: user.email,
      action: "update_hero_image",
      details: { entity_type, entity_id, hero_image_url, hero_image_alt, hero_image_credit },
    });
  } catch { /* audit log optional */ }

  return NextResponse.json({ success: true });
}
