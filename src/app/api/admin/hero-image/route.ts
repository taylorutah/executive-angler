import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

/**
 * PATCH /api/admin/hero-image
 * Update hero image, alt text, and photo credit for any entity.
 * Uses service role key to bypass RLS.
 * Admin only.
 */
export async function PATCH(request: Request) {
  // Auth check via user session
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

  const TABLE_MAP: Record<string, string> = {
    rivers: "rivers", river: "rivers",
    destinations: "destinations", destination: "destinations",
    fly_shops: "fly_shops", fly_shop: "fly_shops",
    lodges: "lodges", lodge: "lodges",
    guides: "guides", guide: "guides",
    species: "species",
    articles: "articles", article: "articles",
  };

  const table = TABLE_MAP[entity_type];
  if (!table) {
    return NextResponse.json({ error: `Unknown entity type: ${entity_type}` }, { status: 400 });
  }

  // Use service role client to bypass RLS
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Build update payload
  const update: Record<string, unknown> = {};
  if (hero_image_url !== undefined) update.hero_image_url = hero_image_url;
  if (hero_image_alt !== undefined) update.hero_image_alt = hero_image_alt;
  if (hero_image_credit !== undefined) update.hero_image_credit = hero_image_credit;
  if (hero_image_credit_url !== undefined) update.hero_image_credit_url = hero_image_credit_url;

  // Try by id first, then by slug
  let { data, error } = await admin
    .from(table)
    .update(update)
    .eq("id", entity_id)
    .select("id")
    .maybeSingle();

  if (!data && !error) {
    // No row matched by id — try slug
    const slugResult = await admin
      .from(table)
      .update(update)
      .eq("slug", entity_id)
      .select("id")
      .maybeSingle();
    data = slugResult.data;
    error = slugResult.error;
  }

  if (error) {
    // Column might not exist — progressively strip and retry
    const cols = ["hero_image_credit_url", "hero_image_credit", "hero_image_alt"];
    let retryUpdate = { ...update };
    let lastErr = error;

    for (const col of cols) {
      if (lastErr.message?.includes(col)) {
        delete retryUpdate[col];
        const retry = await admin.from(table).update(retryUpdate).eq("id", entity_id).select("id").maybeSingle();
        if (!retry.error) {
          if (!retry.data) {
            await admin.from(table).update(retryUpdate).eq("slug", entity_id);
          }
          await logAudit(admin, user, entity_type, entity_id, update);
          return NextResponse.json({ success: true, note: `Column ${col} missing — run migration` });
        }
        lastErr = retry.error;
      }
    }

    // Last resort: just hero_image_url
    if (hero_image_url) {
      const minimal = await admin.from(table).update({ hero_image_url }).eq("id", entity_id).select("id").maybeSingle();
      if (!minimal.error) {
        if (!minimal.data) await admin.from(table).update({ hero_image_url }).eq("slug", entity_id);
        await logAudit(admin, user, entity_type, entity_id, { hero_image_url });
        return NextResponse.json({ success: true, note: "Only hero_image_url updated" });
      }
    }

    return NextResponse.json({ error: lastErr.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: `No ${entity_type} found with id or slug: ${entity_id}` }, { status: 404 });
  }

  await logAudit(admin, user, entity_type, entity_id, update);
  return NextResponse.json({ success: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logAudit(
  admin: any,
  user: { id: string; email?: string },
  entityType: string,
  entityId: string,
  update: Record<string, unknown>
) {
  try {
    await admin.from("admin_audit_log").insert({
      admin_user_id: user.id,
      admin_email: user.email,
      action: "update_hero_image",
      details: { entity_type: entityType, entity_id: entityId, ...update },
    });
  } catch { /* audit optional */ }
}
