import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/materials/inventory — fetch user's material inventory
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_materials_inventory')
    .select('*, material:tying_materials(*)')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inventory: data || [] });
}

// POST /api/materials/inventory — add material to inventory
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { material_id, color_owned, size_owned, quantity, notes } = body;

  if (!material_id) {
    return NextResponse.json({ error: 'material_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_materials_inventory')
    .upsert(
      {
        user_id: user.id,
        material_id,
        color_owned: color_owned || null,
        size_owned: size_owned || null,
        quantity: quantity || null,
        notes: notes || null,
      },
      { onConflict: 'user_id,material_id' }
    )
    .select('*, material:tying_materials(*)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/materials/inventory?id=... — remove from inventory
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('user_materials_inventory')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
