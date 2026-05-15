import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials/fly-requirements?slug=X  or  ?canonical_fly_id=X
// Returns the canonical fly + its ingredient list, each marked with owned: boolean
// (based on the logged-in user's inventory). Anonymous users get owned=false.
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const canonicalId = searchParams.get('canonical_fly_id');

  if (!slug && !canonicalId) {
    return NextResponse.json({ error: 'slug or canonical_fly_id required' }, { status: 400 });
  }

  // Read fly metadata from the new `flies` table. Slug-rename redirects
  // (handled in src/lib/db/fly-model.ts) apply at the page layer — the API
  // expects the resolved slug. Anonymous reads filter to status='approved'.
  let flyQuery = supabase
    .from('flies')
    .select('id, slug, name, category, hero_image_url, option_envelope')
    .eq('status', 'approved')
    .limit(1);

  if (slug) flyQuery = flyQuery.eq('slug', slug);
  else if (canonicalId) flyQuery = flyQuery.eq('id', canonicalId);

  const { data: flies, error: flyErr } = await flyQuery;
  if (flyErr) return NextResponse.json({ error: flyErr.message }, { status: 500 });
  const fly = flies?.[0];
  if (!fly) return NextResponse.json({ error: 'Fly not found' }, { status: 404 });

  const { data: ingredients } = await supabase
    .from('fly_recipe_ingredients')
    .select('id, role, material_id, material_name, is_optional, step_position, quantity, color_choice, size_choice, notes, material:tying_materials(id, name, brand, category, colors, sizes)')
    .eq('canonical_fly_id', fly.id)
    .order('step_position', { ascending: true });

  // Build owned-by-material map carrying each entry's color + size, so we can
  // match the recipe's required size/color exactly. An entry with size_owned=null
  // is treated as "any size" (back-compat for older inventory rows).
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

  const matchOwned = (materialId: string | null | undefined, sizeChoice: string | null | undefined, colorChoice: string | null | undefined): boolean => {
    if (!materialId) return false;
    const entries = ownedByMaterial.get(materialId);
    if (!entries || entries.length === 0) return false;
    return entries.some(e => {
      const sizeOk = !sizeChoice || e.size === null || e.size === sizeChoice;
      const colorOk = !colorChoice || e.color === null || e.color === colorChoice;
      return sizeOk && colorOk;
    });
  };

  const enriched = (ingredients || []).map(ing => ({
    id: ing.id,
    role: ing.role,
    material_id: ing.material_id,
    material_name: ing.material_name,
    material: ing.material,
    is_optional: ing.is_optional,
    step_position: ing.step_position,
    quantity: ing.quantity,
    color_choice: ing.color_choice,
    size_choice: ing.size_choice,
    notes: ing.notes,
    owned: matchOwned(ing.material_id as string | null, ing.size_choice as string | null, ing.color_choice as string | null),
  }));

  const required = enriched.filter(i => !i.is_optional);
  const ownedRequired = required.filter(i => i.owned).length;

  // Map option_envelope back to the shape the workbench UI expects.
  const env = (fly.option_envelope as { sizes?: number[]; colors?: { body?: string[] } } | null) ?? {};
  return NextResponse.json({
    fly: {
      id: fly.id,
      slug: fly.slug,
      name: fly.name,
      category: fly.category,
      hero_image_url: fly.hero_image_url,
      tagline: undefined,
      sizes: (env.sizes ?? []).map(String),
      colors: env.colors?.body ?? [],
    },
    ingredients: enriched,
    summary: {
      total: enriched.length,
      required: required.length,
      owned_required: ownedRequired,
      coverage_percentage: required.length > 0 ? Math.round((ownedRequired / required.length) * 100) : 0,
    },
    is_authenticated: !!user,
  });
}
