import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// How many canonical flies have fly_recipe_ingredients?
const { data: ings } = await supabase
  .from('fly_recipe_ingredients')
  .select('canonical_fly_id, fly_pattern_id, material_id, material_name, role, is_optional');

const canonicalWithRecipes = new Set(ings?.filter(i => i.canonical_fly_id).map(i => i.canonical_fly_id));
const patternWithRecipes = new Set(ings?.filter(i => i.fly_pattern_id).map(i => i.fly_pattern_id));
const totalIngredients = ings?.length || 0;
const withMaterialId = ings?.filter(i => i.material_id).length || 0;

console.log('fly_recipe_ingredients total rows:', totalIngredients);
console.log('unique canonical_flies with recipes:', canonicalWithRecipes.size);
console.log('unique fly_patterns (user) with recipes:', patternWithRecipes.size);
console.log('ingredients with material_id:', withMaterialId, '/', totalIngredients);

const { count: totalCanonical } = await supabase
  .from('canonical_flies')
  .select('*', { count: 'exact', head: true });
console.log('total canonical_flies:', totalCanonical);

// Sample a canonical fly that HAS a recipe
if (canonicalWithRecipes.size > 0) {
  const sampleId = [...canonicalWithRecipes][0];
  const { data: sample } = await supabase
    .from('canonical_flies')
    .select('slug, name')
    .eq('id', sampleId)
    .single();
  console.log('sample with recipe:', sample?.slug, '-', sample?.name);
  const sampleIngs = ings.filter(i => i.canonical_fly_id === sampleId);
  console.log('  ingredients:', sampleIngs.length, 'roles:', [...new Set(sampleIngs.map(i => i.role))]);
}
