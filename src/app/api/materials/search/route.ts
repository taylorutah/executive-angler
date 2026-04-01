import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials/search?q=semperfli&category=thread&limit=10&offset=0
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 60);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const supabase = await createClient();

  let query = supabase
    .from('tying_materials')
    .select('id, slug, name, brand, category, subcategory, sizes, colors, material_type, weight, finish, description, image_url, vendor_url, popularity')
    .eq('is_verified', true)
    .order('popularity', { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    // Search name and brand using ilike
    query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
