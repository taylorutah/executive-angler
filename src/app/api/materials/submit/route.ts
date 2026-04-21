import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { MaterialCategory } from '@/types/materials';
import { checkPremium } from '@/lib/admin';

const VALID_CATEGORIES: MaterialCategory[] = [
  'hook', 'bead', 'thread', 'dubbing', 'feather', 'flash',
  'foam', 'wire', 'resin', 'marker', 'rubber', 'synthetic',
  'tail', 'wing', 'ribbing', 'chenille', 'body', 'eye',
];

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Pro-only: submitting new materials is a premium feature
  const premium = await checkPremium(supabase, user.id, user.email);
  if (!premium) {
    return NextResponse.json(
      { error: 'Submitting new materials is a Pro feature. Upgrade to submit to the community catalog.' },
      { status: 403 },
    );
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

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name is required (min 2 characters)' }, { status: 400 });
  }

  if (!category || !VALID_CATEGORIES.includes(category as MaterialCategory)) {
    return NextResponse.json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
  }

  // Generate slug from name
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('tying_materials')
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    // Duplicate slug
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A material with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
