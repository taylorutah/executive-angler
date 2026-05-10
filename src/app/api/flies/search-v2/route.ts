import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/flies/search-v2?q=...&limit=12
 *
 * Pattern search against the unified fly_patterns_v2 table. Returns both
 * canonical (library) patterns and the caller's personal patterns. Used by
 * the Quick Fly Add sheet on box detail pages.
 */

interface SearchResult {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;
  hero_image_url: string | null;
  source: "canonical" | "personal";
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 12), 25);

  const canonicalQuery = supabase
    .from("fly_patterns_v2")
    .select("id, slug, name, category, hero_image_url")
    .is("owner_user_id", null)
    .order("is_featured", { ascending: false })
    .order("name")
    .limit(limit);
  if (q) canonicalQuery.ilike("name", `%${q}%`);

  const personalPromise = user
    ? supabase
        .from("fly_patterns_v2")
        .select("id, slug, name, category, hero_image_url")
        .eq("owner_user_id", user.id)
        .is("promoted_to_canonical_id", null)
        .ilike("name", q ? `%${q}%` : "%")
        .order("updated_at", { ascending: false })
        .limit(limit)
    : Promise.resolve({ data: [], error: null } as { data: unknown[]; error: null });

  const [canonicalRes, personalRes] = await Promise.all([canonicalQuery, personalPromise]);
  if (canonicalRes.error) {
    console.error("[fly-search-v2] canonical error:", canonicalRes.error);
    return NextResponse.json({ error: canonicalRes.error.message }, { status: 500 });
  }

  type Row = { id: string; slug: string | null; name: string; category: string | null; hero_image_url: string | null };

  const personal: SearchResult[] = ((personalRes.data ?? []) as Row[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    hero_image_url: p.hero_image_url,
    source: "personal",
  }));

  const canonical: SearchResult[] = ((canonicalRes.data ?? []) as Row[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    hero_image_url: p.hero_image_url,
    source: "canonical",
  }));

  return NextResponse.json({ results: [...personal, ...canonical].slice(0, limit) });
}
