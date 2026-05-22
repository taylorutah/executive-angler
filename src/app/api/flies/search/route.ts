import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/flies/search?q=...&limit=25
 *
 * Live fly search across the unified `flies` table. Returns:
 *   - Approved canonical patterns (visible to everyone)
 *   - The caller's own private/pending submissions
 *
 * Each result is tagged with its `source` so the catch picker writes the
 * correct id column on the catch row (`canonical_fly_id` vs `fly_pattern_id`).
 */
interface SearchResult {
  source: "canonical" | "personal";
  id: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
  isMine?: boolean;
  /**
   * Hook sizes derived from the fly's `option_envelope.sizes`. The picker
   * uses these to render a size grid for catalog hits before commit, so a
   * library fly the user has never tied still prompts for size.
   */
  sizes?: string[];
}

function normalizeCanonicalSizes(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: { sortKey: number; label: string }[] = [];
  for (const raw of input) {
    if (raw === null || raw === undefined) continue;
    const s = String(raw).trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    const n = parseInt(s.replace(/[^0-9-]/g, ""), 10);
    out.push({ sortKey: Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER, label: s });
  }
  out.sort((a, b) => a.sortKey - b.sortKey);
  return out.map((o) => o.label);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 12), 50);

  const canonicalQuery = supabase
    .from("flies")
    .select("id, slug, name, category, hero_image_url, option_envelope")
    .eq("status", "approved")
    .is("deleted_at", null)
    .order("is_featured", { ascending: false })
    .order("name")
    .limit(limit);
  if (q) canonicalQuery.ilike("name", `%${q}%`);

  const personalPromise = user
    ? supabase
        .from("flies")
        .select("id, slug, name, category, hero_image_url, submitted_by_user_id, option_envelope")
        .eq("submitted_by_user_id", user.id)
        .in("status", ["private", "pending", "approved"])
        .is("deleted_at", null)
        .ilike("name", q ? `%${q}%` : "%")
        .order("updated_at", { ascending: false })
        .limit(limit)
    : Promise.resolve({ data: [] as Record<string, unknown>[], error: null });

  const [canonicalRes, personalRes] = await Promise.all([canonicalQuery, personalPromise]);
  if (canonicalRes.error) {
    return NextResponse.json({ error: canonicalRes.error.message }, { status: 500 });
  }

  const personal: SearchResult[] = (personalRes.data ?? []).map((p) => ({
    source: "personal" as const,
    id: p.id as string,
    name: p.name as string,
    category: (p.category as string | null) ?? null,
    imageUrl: (p.hero_image_url as string | null) ?? null,
    isMine: true,
    sizes: normalizeCanonicalSizes(
      (p.option_envelope as { sizes?: Array<number | string> } | null)?.sizes
    ),
  }));

  const canonical: SearchResult[] = (canonicalRes.data ?? []).map((c) => ({
    source: "canonical" as const,
    id: c.id as string,
    name: c.name as string,
    category: c.category as string | null,
    imageUrl: (c.hero_image_url as string | null) ?? null,
    sizes: normalizeCanonicalSizes(
      (c.option_envelope as { sizes?: Array<number | string> } | null)?.sizes
    ),
  }));

  // Dedup: a row with submitted_by_user_id=user.id and status=approved would
  // appear in both lists; prefer the "personal" entry so the picker writes
  // fly_pattern_id (catches still target the same id either way since both
  // columns now FK to `flies`).
  const seen = new Set<string>();
  const merged: SearchResult[] = [];
  for (const r of [...personal, ...canonical]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
    if (merged.length >= limit) break;
  }

  return NextResponse.json({ results: merged });
}
