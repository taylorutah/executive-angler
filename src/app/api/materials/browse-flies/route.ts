import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials/browse-flies?q=&category=
// Returns canonical flies + ingredient coverage if the user is logged in.
// Public read (fly catalog is public); owned_count is 0 for anonymous users.
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10) || 60, 120);

  let query = supabase
    .from('canonical_flies')
    .select('id, slug, name, category, hero_image_url, tagline, rank')
    .order('rank', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (q) query = query.ilike('name', `%${q}%`);
  if (category) query = query.eq('category', category);

  const { data: flies, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const flyIds = (flies || []).map(f => f.id);
  if (flyIds.length === 0) {
    return NextResponse.json({ flies: [] });
  }

  // Fetch ingredients for all returned flies in one query (include size/color so we can match exactly)
  const { data: ingredients } = await supabase
    .from('fly_recipe_ingredients')
    .select('canonical_fly_id, material_id, is_optional, size_choice, color_choice')
    .in('canonical_fly_id', flyIds);

  // Owned entries grouped by material — preserves size + color so coverage respects recipe specifics
  const ownedByMaterial = new Map<string, Array<{ size: string | null; color: string | null }>>();
  if (user) {
    const { data: inv } = await supabase
      .from('user_materials_inventory')
      .select('material_id, size_owned, color_owned')
      .eq('user_id', user.id);
    for (const row of inv || []) {
      const mid = row.material_id as string;
      const list = ownedByMaterial.get(mid) || [];
      list.push({ size: (row.size_owned as string | null) ?? null, color: (row.color_owned as string | null) ?? null });
      ownedByMaterial.set(mid, list);
    }
  }

  const matchesIngredient = (materialId: string | null | undefined, sizeChoice: string | null | undefined, colorChoice: string | null | undefined): boolean => {
    if (!materialId) return false;
    const entries = ownedByMaterial.get(materialId);
    if (!entries) return false;
    return entries.some(e => {
      const sizeOk = !sizeChoice || e.size === null || e.size === sizeChoice;
      const colorOk = !colorChoice || e.color === null || e.color === colorChoice;
      return sizeOk && colorOk;
    });
  };

  const countsByFly = new Map<string, { total: number; required: number; ownedRequired: number }>();
  for (const ing of ingredients || []) {
    const key = ing.canonical_fly_id as string;
    if (!countsByFly.has(key)) {
      countsByFly.set(key, { total: 0, required: 0, ownedRequired: 0 });
    }
    const c = countsByFly.get(key)!;
    c.total++;
    if (!ing.is_optional) {
      c.required++;
      if (matchesIngredient(ing.material_id as string | null, ing.size_choice as string | null, ing.color_choice as string | null)) {
        c.ownedRequired++;
      }
    }
  }

  const result = (flies || []).map(f => {
    const c = countsByFly.get(f.id) || { total: 0, required: 0, ownedRequired: 0 };
    return {
      id: f.id,
      slug: f.slug,
      name: f.name,
      category: f.category,
      hero_image_url: f.hero_image_url,
      tagline: f.tagline,
      ingredient_count: c.total,
      required_count: c.required,
      owned_required_count: c.ownedRequired,
      coverage_percentage: c.required > 0 ? Math.round((c.ownedRequired / c.required) * 100) : 0,
    };
  });

  return NextResponse.json({ flies: result, is_authenticated: !!user });
}
