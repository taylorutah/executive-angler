-- Normalize role values in fly_recipe_ingredients to the canonical RecipeRole set.
-- Pre-normalization, some seed data used roles that aren't in src/types/materials.ts'
-- RecipeRole union ('hot_spot', 'wingcase'), which caused the RecipeBuilder's role
-- <select> to fall back to "Hook" on the canonical edit page.
--
-- Mapping:
--   hot_spot  → hotspot   (RecipeRole has 'hotspot')
--   wingcase  → shellback (RecipeRole has 'shellback', labeled "Shellback / Wing Case")
--
-- The trg_sync_materials_list_aiu trigger picks up the row updates and rebuilds
-- flies.materials_list automatically, so the Library detail page also updates.

update fly_recipe_ingredients set role = 'hotspot'   where role = 'hot_spot';
update fly_recipe_ingredients set role = 'shellback' where role = 'wingcase';
