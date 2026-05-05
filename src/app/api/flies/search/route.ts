import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/flies/search?q=...&limit=10
 *
 * Unified fly search across canonical_flies (the encyclopedia) and the
 * caller's own fly_patterns. Returns a flat list — each result tagged with
 * its source so the catch row can write either canonical_fly_id or
 * fly_pattern_id.
 *
 * Public visibility on fly_patterns is honoured for non-owners but the
 * primary use case is the catch-logging picker, so the caller's own private
 * patterns are always returned.
 */

interface SearchResult {
  source: "canonical" | "personal";
  id: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
  // Personal-only
  isMine?: boolean;
  username?: string | null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Search works for anonymous users too — they just don't see personal patterns.

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 12), 25);

  // Empty query returns popular canonicals so the picker has something to
  // show when first opened.
  const canonicalQuery = supabase
    .from("canonical_flies")
    .select("id, slug, name, category, hero_image_url")
    .order("rank", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (q) canonicalQuery.ilike("name", `%${q}%`);

  const personalPromise = user
    ? supabase
        .from("fly_patterns")
        .select("id, slug, name, type, image_url, user_id")
        .eq("user_id", user.id)
        .is("promoted_to_canonical_id", null)
        .ilike("name", q ? `%${q}%` : "%")
        .order("updated_at", { ascending: false })
        .limit(limit)
    : Promise.resolve({ data: [] as Record<string, unknown>[], error: null });

  const [canonicalRes, personalRes] = await Promise.all([canonicalQuery, personalPromise]);
  if (canonicalRes.error) {
    console.error("[fly-search] canonical error:", canonicalRes.error);
    return NextResponse.json({ error: canonicalRes.error.message }, { status: 500 });
  }

  const personal: SearchResult[] = (personalRes.data ?? []).map((p) => ({
    source: "personal" as const,
    id: p.id as string,
    name: p.name as string,
    category: (p.type as string | null) ?? null,
    imageUrl: (p.image_url as string | null) ?? null,
    isMine: true,
  }));

  const canonical: SearchResult[] = (canonicalRes.data ?? []).map((c) => ({
    source: "canonical" as const,
    id: c.id as string,
    name: c.name as string,
    category: c.category as string | null,
    imageUrl: (c.hero_image_url as string | null) ?? null,
  }));

  // Personal results first (the angler's stuff is more relevant to them) then
  // canonical encyclopedia results.
  return NextResponse.json({ results: [...personal, ...canonical].slice(0, limit) });
}
