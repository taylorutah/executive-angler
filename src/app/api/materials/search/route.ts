import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials/search?q=wire&category=ribbing&limit=10&offset=0
//
// Search strategy:
//  - `q` is matched against name / brand / subcategory / material_type /
//    description (any of, ILIKE). Previously only name + brand were
//    searched, which broke the common "I'm filling the Ribbing slot and
//    want a wire" workflow — wire products live in category='wire' with
//    "wire" in their name, but the old search restricted to the slot's
//    category and missed them entirely.
//  - `category` is now a SOFT signal: results matching the slot category
//    are boosted to the top, but materials from other categories still
//    appear below. This lets a user filling a Ribbing slot find Ultra
//    Wire even though it's technically category='wire'. Tinsel / lead
//    wire / mono / flash all surface naturally.
//  - `brand` stays a hard filter for the brands dropdown.
//
// Visibility filtering is enforced by RLS — anonymous/other users see
// verified rows; the submitter additionally sees their own pending
// submissions.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 60);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  // Sanitize: PostgREST's .or() syntax treats commas + parens as
  // delimiters. Strip them so a user typing "(silver, fine)" doesn't
  // produce a malformed filter expression.
  const safeQ = q.replace(/[(),]/g, ' ');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('tying_materials')
    .select(
      'id, slug, name, brand, category, subcategory, sizes, colors, material_type, weight, finish, description, image_url, vendor_url, popularity, is_verified, submitted_by',
    )
    .range(offset, offset + limit - 1);

  // Defense-in-depth: mirror the personal-visibility RLS policy at the
  // route level. Pending submissions stay visible to the submitter only.
  if (user) {
    query = query.or(`is_verified.eq.true,submitted_by.eq.${user.id}`);
  } else {
    query = query.eq('is_verified', true);
  }

  if (safeQ.length > 0) {
    const like = `%${safeQ}%`;
    query = query.or(
      [
        `name.ilike.${like}`,
        `brand.ilike.${like}`,
        `subcategory.ilike.${like}`,
        `material_type.ilike.${like}`,
        `description.ilike.${like}`,
      ].join(','),
    );
  }

  if (brand) {
    query = query.eq('brand', brand);
  }

  // We DON'T hard-filter on category any more. Order by category-match
  // first (so slot-native materials surface at the top), then popularity.
  query = query
    .order('popularity', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[materials/search]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // In-memory category boost. Cheap (limit≤60) and avoids leaning on
  // Postgres-specific ORDER BY CASE syntax in PostgREST.
  const rows = data ?? [];
  if (category) {
    rows.sort((a, b) => {
      const am = a.category === category ? 0 : 1;
      const bm = b.category === category ? 0 : 1;
      if (am !== bm) return am - bm;
      return (b.popularity ?? 0) - (a.popularity ?? 0);
    });
  }

  return NextResponse.json(rows);
}
