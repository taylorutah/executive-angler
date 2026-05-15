import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface MatchResult {
  fly_pattern_id?: string;
  canonical_fly_id?: string;
  fly_name: string;
  fly_type?: string;
  fly_image?: string;
  fly_slug?: string;
  total_ingredients: number;
  matched_ingredients: number;
  missing_ingredients: { role: string; material_name: string; is_optional: boolean }[];
  match_percentage: number;
}

// GET /api/materials/what-can-i-tie — match user inventory against recipes
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch user's material inventory with size + color so matching can respect recipe specifics
  const { data: inventory } = await supabase
    .from('user_materials_inventory')
    .select('material_id, size_owned, color_owned')
    .eq('user_id', user.id);

  const ownedByMaterial = new Map<string, Array<{ size: string | null; color: string | null }>>();
  for (const row of inventory || []) {
    const mid = row.material_id as string;
    const list = ownedByMaterial.get(mid) || [];
    list.push({ size: (row.size_owned as string | null) ?? null, color: (row.color_owned as string | null) ?? null });
    ownedByMaterial.set(mid, list);
  }

  if (ownedByMaterial.size === 0) {
    return NextResponse.json({
      matches: [],
      message: 'Add materials to your inventory first',
    });
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

  // 2. Fetch all recipes (canonical + user's own patterns with structured recipes).
  // The fly_recipe_ingredients FK still points at canonical_flies — Phase C
  // will re-point it to `flies`. Until then this join works as-is because
  // canonical_flies + flies share the same IDs (Phase A preserved them).
  const { data: allIngredients } = await supabase
    .from('fly_recipe_ingredients')
    .select('*, canonical_fly:canonical_flies(id, slug, name, category, hero_image_url), fly_pattern:fly_patterns(id, name, type, image_url)')
    .not('canonical_fly_id', 'is', null)
    .or(`fly_pattern_id.is.null,fly_pattern.user_id.eq.${user.id}`);

  if (!allIngredients || allIngredients.length === 0) {
    return NextResponse.json({ matches: [], message: 'No recipes found' });
  }

  // 3. Group ingredients by fly
  const recipeMap = new Map<string, {
    fly_name: string;
    fly_type?: string;
    fly_image?: string;
    fly_slug?: string;
    fly_pattern_id?: string;
    canonical_fly_id?: string;
    ingredients: typeof allIngredients;
  }>();

  for (const ing of allIngredients) {
    const key = ing.canonical_fly_id || ing.fly_pattern_id || 'unknown';
    if (!recipeMap.has(key)) {
      const canonicalFly = ing.canonical_fly as { id: string; slug: string; name: string; category: string; hero_image_url: string } | null;
      const flyPattern = ing.fly_pattern as { id: string; name: string; type: string; image_url: string } | null;
      recipeMap.set(key, {
        fly_name: canonicalFly?.name || flyPattern?.name || 'Unknown',
        fly_type: canonicalFly?.category || flyPattern?.type,
        fly_image: canonicalFly?.hero_image_url || flyPattern?.image_url,
        fly_slug: canonicalFly?.slug,
        fly_pattern_id: ing.fly_pattern_id || undefined,
        canonical_fly_id: ing.canonical_fly_id || undefined,
        ingredients: [],
      });
    }
    recipeMap.get(key)!.ingredients.push(ing);
  }

  // 4. Calculate match percentages
  const matches: MatchResult[] = [];

  for (const [, recipe] of recipeMap) {
    const requiredIngredients = recipe.ingredients.filter(i => !i.is_optional);
    const totalRequired = requiredIngredients.length;
    if (totalRequired === 0) continue;

    const missing: MatchResult['missing_ingredients'] = [];
    let matched = 0;

    for (const ing of recipe.ingredients) {
      if (matchesIngredient(ing.material_id, ing.size_choice, ing.color_choice)) {
        matched++;
      } else if (!ing.is_optional) {
        missing.push({
          role: ing.role,
          material_name: ing.material_name || 'Unknown material',
          is_optional: ing.is_optional,
        });
      }
    }

    const percentage = totalRequired > 0 ? Math.round((matched / totalRequired) * 100) : 0;

    matches.push({
      fly_pattern_id: recipe.fly_pattern_id,
      canonical_fly_id: recipe.canonical_fly_id,
      fly_name: recipe.fly_name,
      fly_type: recipe.fly_type,
      fly_image: recipe.fly_image,
      fly_slug: recipe.fly_slug,
      total_ingredients: recipe.ingredients.length,
      matched_ingredients: matched,
      missing_ingredients: missing,
      match_percentage: percentage,
    });
  }

  // Sort: 100% matches first, then by percentage descending
  matches.sort((a, b) => b.match_percentage - a.match_percentage);

  return NextResponse.json({
    matches,
    inventory_size: ownedByMaterial.size,
  });
}
