import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { MaterialCategory } from '@/types/materials';

const VALID_CATEGORIES: MaterialCategory[] = [
  'hook', 'bead', 'thread', 'dubbing', 'feather', 'flash',
  'foam', 'wire', 'resin', 'marker', 'rubber', 'synthetic',
  'tail', 'wing', 'ribbing', 'chenille', 'body', 'eye',
];

// POST /api/materials/submit — submit a new material; lands as is_verified=false (visible to
// submitter via RLS until promoted). Slug collisions retry once with a per-user suffix.
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: {
    name?: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    sizes?: string[];
    colors?: string[];
    description?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, brand, category, subcategory, sizes, colors, description } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name is required (min 2 characters)' }, { status: 400 });
  }

  if (!category || !VALID_CATEGORIES.includes(category as MaterialCategory)) {
    return NextResponse.json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
  }

  const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const insertRow = (slug: string) => ({
    name: name.trim(),
    slug,
    brand: brand?.trim() || null,
    category,
    subcategory: subcategory?.trim() || null,
    sizes: sizes || [],
    colors: colors || [],
    description: description?.trim() || null,
    is_verified: false,
    submitted_by: user.id,
    popularity: 0,
  });

  let { data, error } = await supabase
    .from('tying_materials')
    .insert(insertRow(baseSlug))
    .select()
    .single();

  if (error?.code === '23505') {
    const retrySlug = `${baseSlug}-${user.id.slice(0, 6)}`;
    ({ data, error } = await supabase
      .from('tying_materials')
      .insert(insertRow(retrySlug))
      .select()
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
