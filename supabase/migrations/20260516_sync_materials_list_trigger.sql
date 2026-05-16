-- ─────────────────────────────────────────────────────────────────────────
-- Sync flies.materials_list from fly_recipe_ingredients automatically.
--
-- Architecture:
--   fly_recipe_ingredients (canonical_fly_id) → SOURCE OF TRUTH for recipes
--   flies.materials_list (jsonb)              → denormalized read-cache
--
-- The cache exists so the statically-rendered Library detail page
-- (/flies/[slug]) can read recipe data without joining tying_materials
-- every render. This trigger keeps the cache honest — any insert/update/
-- delete on fly_recipe_ingredients for a canonical fly rebuilds the cache.
--
-- The conversion logic mirrors src/lib/flies/recipe-conversion.ts so an
-- app-level write and a DB-level recompute produce identical output.
-- Brand visibility per feedback_fly_recipe_conventions.md:
--   - hook / thread / dubbing / body → brand surfaced when not 'Generic'
--   - everything else                → spec-only (no brand key)
-- ─────────────────────────────────────────────────────────────────────────

-- Build a single MaterialSlot jsonb from one ingredient row.
create or replace function compute_material_slot_from_ingredient(
  ing fly_recipe_ingredients,
  tm tying_materials
) returns jsonb
language plpgsql
stable
as $$
declare
  slot text;
  role_in text;
  display text;
  brand text;
  show_brand boolean;
  result jsonb;
begin
  role_in := coalesce(ing.role, 'other');
  -- "ribbing" in RecipeRole → "rib" in MaterialSlot.slot
  slot := case when role_in = 'ribbing' then 'rib' else role_in end;

  -- Prefer the curated material_name; fall back to joined tying_materials.name
  display := nullif(btrim(coalesce(ing.material_name, '')), '');
  if display is null then
    display := nullif(btrim(coalesce(tm.name, '')), '');
  end if;
  if display is null then
    display := '—';
  end if;

  brand := nullif(btrim(coalesce(tm.brand, '')), '');
  show_brand :=
    slot in ('hook', 'thread', 'dubbing', 'body')
    and brand is not null
    and lower(brand) <> 'generic';

  result := jsonb_build_object('slot', slot, 'material', display);
  if show_brand then result := result || jsonb_build_object('brand', brand); end if;
  if ing.notes is not null and btrim(ing.notes) <> '' then
    result := result || jsonb_build_object('description', ing.notes);
  end if;
  if coalesce(ing.is_optional, false) then
    result := result || jsonb_build_object('is_optional', true);
  end if;

  -- Preserved structured fields (lossless round-trip with the TS converter)
  if role_in <> slot then
    result := result || jsonb_build_object('role', role_in);
  end if;
  if ing.material_id is not null then
    result := result || jsonb_build_object('material_id', ing.material_id);
  end if;
  if ing.material_name is not null and btrim(ing.material_name) <> '' then
    result := result || jsonb_build_object('material_name', ing.material_name);
  end if;
  if ing.color_choice is not null and btrim(ing.color_choice) <> '' then
    result := result || jsonb_build_object('color_choice', ing.color_choice);
  end if;
  if ing.size_choice is not null and btrim(ing.size_choice) <> '' then
    result := result || jsonb_build_object('size_choice', ing.size_choice);
  end if;
  if tm.material_type is not null and btrim(tm.material_type) <> '' then
    result := result || jsonb_build_object('material_type', tm.material_type);
  end if;
  if tm.finish is not null and btrim(tm.finish) <> '' then
    result := result || jsonb_build_object('finish', tm.finish);
  end if;
  if ing.quantity is not null and btrim(ing.quantity) <> '' then
    result := result || jsonb_build_object('quantity', ing.quantity);
  end if;

  return result;
end;
$$;

-- Build the full materials_list jsonb for one canonical fly.
create or replace function compute_materials_list_for_fly(p_fly_id uuid)
returns jsonb
language plpgsql
stable
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(slot order by step_position), '[]'::jsonb)
    into result
  from (
    select
      ing.step_position,
      compute_material_slot_from_ingredient(ing, tm) as slot
    from fly_recipe_ingredients ing
    left join tying_materials tm on tm.id = ing.material_id
    where ing.canonical_fly_id = p_fly_id
  ) s;
  return coalesce(result, '[]'::jsonb);
end;
$$;

-- Trigger function: after any change to canonical recipe rows, refresh
-- flies.materials_list for the affected fly.
create or replace function sync_materials_list_from_ingredients()
returns trigger
language plpgsql
as $$
declare
  target_fly uuid;
begin
  -- On DELETE we use OLD; on INSERT/UPDATE we use NEW.
  target_fly := coalesce(new.canonical_fly_id, old.canonical_fly_id);
  if target_fly is null then
    return null;  -- ingredient row belongs to a personal pattern, not a canonical
  end if;
  update flies
    set materials_list = compute_materials_list_for_fly(target_fly),
        updated_at = now()
    where id = target_fly;
  return null;
end;
$$;

drop trigger if exists trg_sync_materials_list_aiu on fly_recipe_ingredients;
create trigger trg_sync_materials_list_aiu
  after insert or update on fly_recipe_ingredients
  for each row
  when (new.canonical_fly_id is not null)
  execute function sync_materials_list_from_ingredients();

drop trigger if exists trg_sync_materials_list_ad on fly_recipe_ingredients;
create trigger trg_sync_materials_list_ad
  after delete on fly_recipe_ingredients
  for each row
  when (old.canonical_fly_id is not null)
  execute function sync_materials_list_from_ingredients();
