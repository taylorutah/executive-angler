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
    // Column might not exist yet — progressively strip fields and retry
    const missingCols = ["hero_image_credit_url", "hero_image_credit", "hero_image_alt"];
    let retryUpdate = { ...update };
    let lastError = result.error;

    for (const col of missingCols) {
      if (lastError.message?.includes(col)) {
        delete retryUpdate[col];
        const retry = await supabase.from(table).update(retryUpdate).eq("id", entity_id);
        if (!retry.error) {
          // Also try by slug if id didn't match
          if (retry.count === 0) {
            await supabase.from(table).update(retryUpdate).eq("slug", entity_id);
          }
          const missing = missingCols.filter(c => !(c in retryUpdate));
          return NextResponse.json({ success: true, note: `Columns missing (run migration): ${missing.join(", ")}` });
        }
        lastError = retry.error;
      }
    }

    // Last resort: just update hero_image_url only
    if (hero_image_url) {
      const minimal = await supabase.from(table).update({ hero_image_url }).eq("id", entity_id);
      if (!minimal.error) {
        if (minimal.count === 0) {
          await supabase.from(table).update({ hero_image_url }).eq("slug", entity_id);
        }
        return NextResponse.json({ success: true, note: "Only hero_image_url updated — credit/alt columns missing" });
      }
    }

    return NextResponse.json({ error: lastError.message }, { status: 500 });
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
