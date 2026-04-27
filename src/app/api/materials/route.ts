import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials — list materials with optional category/brand/search filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const supabase = await createClient();

  let query = supabase
    .from('tying_materials')
    .select('*', { count: 'exact' })
    .eq('is_verified', true)
    .order('popularity', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);
  if (brand) query = query.ilike('brand', brand);

  if (q) {
    // Escape PostgREST `or` filter reserved chars: , ( ) and unbalanced quotes
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

// POST /api/materials — submit a new material (authenticated)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, brand, category, subcategory, sizes, colors, material_type, weight, finish, description } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }

  // Generate slug
  const slug = `${brand ? brand.toLowerCase().replace(/\s+/g, '-') + '-' : ''}${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;

  const { data, error } = await supabase
    .from('tying_materials')
    .insert({
      slug,
      name,
      brand: brand || null,
      category,
      subcategory: subcategory || null,
      sizes: sizes || null,
      colors: colors || null,
      material_type: material_type || null,
      weight: weight || null,
      finish: finish || null,
      description: description || null,
      is_verified: false,
      submitted_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
