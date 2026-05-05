import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import MaterialsQueueClient from './MaterialsQueueClient';

export const metadata: Metadata = {
  title: 'Materials Review — Admin | Executive Angler',
  description: 'Review and promote user-submitted fly tying materials.',
};

export const dynamic = 'force-dynamic';

export default async function AdminMaterialsQueuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect('/dashboard');

  // Use service role to bypass RLS and join submitter email
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createServiceClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: pending } = await admin
    .from('tying_materials')
    .select('id, slug, name, brand, category, subcategory, sizes, colors, material_type, weight, finish, description, submitted_by, created_at')
    .eq('is_verified', false)
    .order('created_at', { ascending: false })
    .limit(200);

  // Resolve submitter emails
  const userIds = Array.from(new Set((pending || []).map(p => p.submitted_by).filter(Boolean))) as string[];
  const submitters: Record<string, string | null> = {};
  if (userIds.length) {
    const { data: usersList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of usersList?.users || []) {
      if (userIds.includes(u.id)) submitters[u.id] = u.email || null;
    }
  }

  const enriched = (pending || []).map(p => ({
    ...p,
    submitter_email: p.submitted_by ? submitters[p.submitted_by] || null : null,
  }));

  return <MaterialsQueueClient pending={enriched} />;
}
