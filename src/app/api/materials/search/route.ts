import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials/search?q=semperfli&category=thread&limit=10&offset=0
// Visibility filtering is enforced by RLS — anonymous/other users see verified rows;
// the submitter additionally sees their own pending submissions.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 60);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('tying_materials')
    .select('id, slug, name, brand, category, subcategory, sizes, colors, material_type, weight, finish, description, image_url, vendor_url, popularity, is_verified, submitted_by')
    .order('popularity', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Defense-in-depth: mirror the personal-visibility RLS policy at the route level
  if (user) {
    query = query.or(`is_verified.eq.true,submitted_by.eq.${user.id}`);
  } else {
    query = query.eq('is_verified', true);
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (brand) {
    query = query.eq('brand', brand);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
