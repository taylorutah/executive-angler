import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/flies/search-v2?q=...&limit=12
 *
 * Search against the `flies` table (approved canonicals only). Used by
 * the Quick Fly Add sheet, fly picker, and any place that needs a typeahead.
 *
 * Post-Phase-C: personal-fork results are gone — there are no "personal"
 * flies in the new model; every fly lives at /flies/[slug]. The
 * `source: "canonical"` field is kept for client compatibility.
 */

interface SearchResult {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;
  hero_image_url: string | null;
  source: "canonical";
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 12), 25);

  let query = supabase
    .from("flies")
    .select("id, slug, name, category, hero_image_url")
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("name")
    .limit(limit);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error } = await query;
  if (error) {
    console.error("[fly-search-v2]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type Row = { id: string; slug: string | null; name: string; category: string | null; hero_image_url: string | null };
  const results: SearchResult[] = ((data ?? []) as Row[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    hero_image_url: p.hero_image_url,
    source: "canonical",
  }));

  return NextResponse.json({ results });
}
