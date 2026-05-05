import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PATCH /api/materials/[id] — extend colors[] / sizes[] on an existing material the user owns.
// RLS only permits updates when submitted_by = auth.uid() AND is_verified = false, so verified
// canonical entries are read-only here. UI uses this for "this is a new product variant" flow on
// pending submissions; for verified rows it falls back to a clone (POST).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const addColor: string | undefined = body.add_color?.trim();
  const addSize: string | undefined = body.add_size?.trim();

  if (!addColor && !addSize) {
    return NextResponse.json({ error: 'Provide add_color or add_size' }, { status: 400 });
  }

  // Read existing arrays — RLS makes this fail (PGRST116) on rows the user can't see/edit.
  const { data: current, error: readErr } = await supabase
    .from('tying_materials')
    .select('id, colors, sizes, submitted_by, is_verified')
    .eq('id', id)
    .single();

  if (readErr || !current) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  if (current.is_verified || current.submitted_by !== user.id) {
    return NextResponse.json(
      { error: 'Cannot edit a verified material; use clone instead' },
      { status: 403 },
    );
  }

  const colors = new Set([...(current.colors || [])]);
  const sizes = new Set([...(current.sizes || [])]);
  if (addColor) colors.add(addColor);
  if (addSize) sizes.add(addSize);

  const { data: updated, error: updateErr } = await supabase
    .from('tying_materials')
    .update({
      colors: Array.from(colors),
      sizes: Array.from(sizes),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json(updated, { status: 200 });
}
