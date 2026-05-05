import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials — list materials with optional category/brand/search filters.
// RLS filters: anonymous & other users see is_verified=true; submitter additionally sees own pending.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('tying_materials')
    .select('*', { count: 'exact' })
    .order('popularity', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Defense-in-depth: mirror the RLS policy at the route level so this works
  // even if the personal-visibility RLS migration hasn't been applied yet.
  if (user) {
    query = query.or(`is_verified.eq.true,submitted_by.eq.${user.id}`);
  } else {
    query = query.eq('is_verified', true);
  }

  if (category) query = query.eq('category', category);
  if (brand) query = query.ilike('brand', brand);

  if (q) {
    const safe = q.replace(/[,()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (safe) {
      const pattern = `%${safe}%`;
      query = query.or(
        [
          `name.ilike.${pattern}`,
          `brand.ilike.${pattern}`,
          `subcategory.ilike.${pattern}`,
          `material_type.ilike.${pattern}`,
          `weight.ilike.${pattern}`,
          `finish.ilike.${pattern}`,
          `description.ilike.${pattern}`,
        ].join(',')
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials: data || [], total: count || 0 });
}

// POST /api/materials — submit a new material (authenticated). Lands as is_verified=false; visible
// to the submitter immediately via RLS, and to everyone else once an admin promotes it.
//
// Query params:
//   add_to_inventory=true → also insert a user_materials_inventory row (with optional color/size).
//
// Body:
//   { name, brand?, category, subcategory?, sizes?, colors?, material_type?, weight?, finish?,
//     description?, inventory_color?, inventory_size?, inventory_quantity? }
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const addToInventory = searchParams.get('add_to_inventory') === 'true';

  const body = await request.json();
  const {
    name, brand, category, subcategory, sizes, colors,
    material_type, weight, finish, description,
    inventory_color, inventory_size, inventory_quantity,
  } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!category || typeof category !== 'string') {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  const baseSlug = `${brand ? brand.toLowerCase().replace(/\s+/g, '-') + '-' : ''}${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;

  const insertRow = (slug: string) => ({
    slug,
    name: name.trim(),
    brand: brand?.trim() || null,
    category,
    subcategory: subcategory?.trim() || null,
    sizes: Array.isArray(sizes) && sizes.length ? sizes : null,
    colors: Array.isArray(colors) && colors.length ? colors : null,
    material_type: material_type?.trim() || null,
    weight: weight?.trim() || null,
    finish: finish?.trim() || null,
    description: description?.trim() || null,
    is_verified: false,
    submitted_by: user.id,
  });

  let { data: material, error } = await supabase
    .from('tying_materials')
    .insert(insertRow(baseSlug))
    .select()
    .single();

  // Slug collision (23505): retry once with a per-user suffix
  if (error && error.code === '23505') {
    const suffix = user.id.slice(0, 6);
    const retrySlug = `${baseSlug}-${suffix}`;
    ({ data: material, error } = await supabase
      .from('tying_materials')
      .insert(insertRow(retrySlug))
      .select()
      .single());
  }

  if (error || !material) {
    return NextResponse.json({ error: error?.message || 'Failed to insert material' }, { status: 500 });
  }

  if (addToInventory) {
    const { error: invError } = await supabase
      .from('user_materials_inventory')
      .insert({
        user_id: user.id,
        material_id: material.id,
        color_owned: inventory_color?.trim() || null,
        size_owned: inventory_size?.trim() || null,
        quantity: inventory_quantity?.trim() || null,
      });
    if (invError) {
      // Material was created but inventory failed — surface both pieces of info
      return NextResponse.json(
        { ...material, _inventory_error: invError.message },
        { status: 201 },
      );
    }
  }

  return NextResponse.json(material, { status: 201 });
}
