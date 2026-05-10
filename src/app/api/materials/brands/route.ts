import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials/brands?category=thread
// Returns: [{ brand: 'UTC', count: 4 }, { brand: 'Veevus', count: 6 }, ...]
// Used by the cascading thread / hook / wire / dubbing recipe row pickers
// to populate the first dropdown.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  if (!category) {
    return NextResponse.json({ error: 'category required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('tying_materials')
    .select('brand')
    .eq('category', category)
    .not('brand', 'is', null);

  if (user) {
    query = query.or(`is_verified.eq.true,submitted_by.eq.${user.id}`);
  } else {
    query = query.eq('is_verified', true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts = new Map<string, number>();
  for (const r of data || []) {
    if (!r.brand) continue;
    counts.set(r.brand, (counts.get(r.brand) || 0) + 1);
  }
  const result = [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(result);
}
