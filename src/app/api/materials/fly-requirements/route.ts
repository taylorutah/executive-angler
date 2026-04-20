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

  let flyQuery = supabase
    .from('canonical_flies')
    .select('id, slug, name, category, hero_image_url, tagline, sizes, colors')
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

  let owned = new Set<string>();
  if (user) {
    const { data: inv } = await supabase
      .from('user_materials_inventory')
      .select('material_id')
      .eq('user_id', user.id);
    owned = new Set((inv || []).map(i => i.material_id as string));
  }

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
    owned: !!(ing.material_id && owned.has(ing.material_id as string)),
  }));

  const required = enriched.filter(i => !i.is_optional);
  const ownedRequired = required.filter(i => i.owned).length;

  return NextResponse.json({
    fly: {
      id: fly.id,
      slug: fly.slug,
      name: fly.name,
      category: fly.category,
      hero_image_url: fly.hero_image_url,
      tagline: fly.tagline,
      sizes: fly.sizes,
      colors: fly.colors,
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
